const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Not authorized - no token" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token (exclude password)
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ 
                success: false,
                message: "Token expired - please login again" 
            });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        
        console.error("Auth middleware error:", error);
        res.status(500).json({ 
            success: false,
            message: "Authentication error" 
        });
    }
};

module.exports = { protect };
