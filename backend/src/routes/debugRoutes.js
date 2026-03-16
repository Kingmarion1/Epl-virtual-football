const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/User");
const Match = require("../models/Match");
const Team = require("../models/Team");
const SeasonState = require("../models/SeasonState");

router.get("/status", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const stats = {
      database: dbStatus === 1 ? "connected" : "disconnected",
      users: await User.countDocuments(),
      teams: await Team.countDocuments(),
      matches: await Match.countDocuments(),
      seasonState: await SeasonState.findOne()
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
