const rateLimit = require("express-rate-limit");

// Strict limit for betting (financial operations)
const betLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 bets per minute per IP
    message: {
        success: true,
        message: "Too many bets placed. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API limit
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 1000,
    message: {
        success: true,
        message: "Too many requests from this IP"
    }
});

module.exports = { betLimiter, apiLimiter };
