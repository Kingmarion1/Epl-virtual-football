require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

// Database connection
const connectDB = require("./config/database");

// Route imports
const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");
const betRoutes = require("./routes/betRoutes");
const tableRoutes = require("./routes/tableRoutes");
const userRoutes = require("./routes/userRoutes");

// Engine import
const startVirtualEngine = require("./engine/virtualEngine");

// Initialize Express
const app = express();

/* ============================================================
   SECURITY MIDDLEWARE
   ============================================================ */

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", limiter);

// Stricter limit for betting (financial operations)
const betLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 bets per minute max
  message: {
    success: false,
    message: "Too many bets placed. Please slow down."
  }
});

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ============================================================
   REQUEST LOGGING (Development)
   ============================================================ */

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* ============================================================
   ROOT & HEALTH ENDPOINTS
   ============================================================ */

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "⚽ Virtual EPL API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      matches: "/api/matches",
      bets: "/api/bets",
      table: "/api/table",
      leaderboard: "/api/leaderboard",
      users: "/api/users"
    }
  });
});

// Health check with database status
app.get("/api/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    }[dbState] || "unknown";

    res.json({
      success: true,
      status: "OK",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "ERROR",
      message: error.message
    });
  }
});

// Debug endpoint (remove in production)
app.get("/api/debug/status", async (req, res) => {
  try {
    const SeasonState = require("./models/SeasonState");
    const Match = require("./models/Match");
    const Team = require("./models/Team");
    const User = require("./models/User");
    const Bet = require("./models/Bet");

    const [seasonState, matches, teams, users, bets] = await Promise.all([
      SeasonState.findOne().lean(),
      Match.countDocuments(),
      Team.countDocuments(),
      User.countDocuments(),
      Bet.countDocuments()
    ]);

    res.json({
      success: true,
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      season: {
        state: seasonState ? {
          currentWeek: seasonState.currentWeek,
          phase: seasonState.phase,
          countdown: seasonState.countdown,
          seasonStarted: seasonState.seasonStarted
        } : null
      },
      counts: {
        matches,
        teams,
        users,
        bets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* ============================================================
   API ROUTES
   ============================================================ */

// Auth routes (public)
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/matches", matchRoutes);
app.use("/api/bets", betLimiter, betRoutes); // Stricter rate limit
app.use("/api/table", tableRoutes);
app.use("/api/leaderboard", tableRoutes);
app.use("/api/users", userRoutes);

/* ============================================================
   ERROR HANDLING
   ============================================================ */

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: messages
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered"
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err
    })
  });
});

/* ============================================================
   SERVER STARTUP
   ============================================================ */

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    console.log("🚀 Starting Virtual EPL Server...");
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);

    // Connect to database
    await connectDB();
    console.log("✅ Database connected");

    // Start virtual engine (async, non-blocking)
    startVirtualEngine()
      .then(() => console.log("✅ Virtual engine started"))
      .catch(err => console.error("❌ Virtual engine failed:", err));

    // Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on http://${HOST}:${PORT}`);
      console.log(`🔗 API Base: /api`);
      console.log(`📋 Health Check: /api/health`);
      console.log(`🔍 Debug Status: /api/debug/status`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => gracefulShutdown(server));
    process.on("SIGINT", () => gracefulShutdown(server));

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const gracefulShutdown = (server) => {
  console.log("\n🛑 Shutting down gracefully...");
  
  server.close(() => {
    console.log("✅ HTTP server closed");
    
    mongoose.connection.close(false, () => {
      console.log("✅ Database connection closed");
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown");
    process.exit(1);
  }, 10000);
};

// Handle uncaught errors
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Start the server
startServer();
