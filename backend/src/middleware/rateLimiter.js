const rateLimit = require("express-rate-limit");

// Strict limit for betting (financial operations)
const betLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 7, // 7 bets per minute per IP
    message: {
        success: false,
        message: "Too many bets placed. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API limit
const apiLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests from this IP"
    }
});

module.exports = { betLimiter, apiLimiter };
