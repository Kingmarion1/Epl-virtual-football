const rateLimit = require("express-rate-limit");

// Strict limit for betting (financial operations)
const betLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 7, // 7 bets per minute per IP
    message: {
        success: true,
        message: "Too many bets placed. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: true,
        message: "Too many requests from this IP"
    }
});

module.exports = { betLimiter, apiLimiter };
