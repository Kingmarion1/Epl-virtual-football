require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");
const betRoutes = require("./routes/betRoutes");
const tableRoutes = require("./routes/tableRoutes");

const startVirtualEngine = require("./engine/virtualEngine");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());
app.use(express.json());

/* ---------------- ROOT ROUTE ---------------- */

app.get("/", (req, res) => {
  res.json({
    message: "⚽ Virtual EPL API running",
    status: "OK"
  });
});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "API working"
  });
});

/* ---------------- API ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/bets", betRoutes);
app.use("/api/table", tableRoutes);

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    await connectDB();
    console.log("MongoDB connected");

    startVirtualEngine();
    console.log("Virtual engine started");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {

    console.error("Server failed to start:", error);
    process.exit(1);

  }
};

startServer();
