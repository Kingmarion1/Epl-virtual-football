const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const User = require("../models/User");

// GET /api/table - League standings
router.get("/", async (req, res) => {
  try {
    const table = await Team.find()
      .select("-__v -createdAt -updatedAt")
      .sort({
        points: -1,
        goalDifference: -1,
        goalsFor: -1
      })
      .lean();

    if (table.length === 0) {
      return res.status(503).json({
        success: false,
        message: "No teams found. Season not initialized."
      });
    }

    res.json({
      success: true,
      count: table.length,
      table: table.map((team, index) => ({
        position: index + 1,
        ...team
      }))
    });

  } catch (error) {
    console.error("Table error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load table"
    });
  }
});

// GET /api/leaderboard - Top users
router.get("/", async (req, res) => {
  try {
    // Check if this is the leaderboard endpoint
    if (req.path !== "/leaderboard" && req.baseUrl !== "/api/leaderboard") {
      return; // Let the table handler take over
    }
    
    const users = await User.find()
      .select("username balance wins losses totalBets")
      .sort({ balance: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: users.length,
      users: users.map((user, index) => ({
        rank: index + 1,
        ...user,
        winRate: user.totalBets > 0 
          ? ((user.wins / user.totalBets) * 100).toFixed(1) 
          : 0
      }))
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load leaderboard"
    });
  }
});

// Separate route file for leaderboard to avoid conflicts
router.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find()
      .select("username balance wins losses totalBets")
      .sort({ balance: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: users.length,
      users: users.map((user, index) => ({
        rank: index + 1,
        ...user,
        winRate: user.totalBets > 0 
          ? ((user.wins / user.totalBets) * 100).toFixed(1) 
          : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
