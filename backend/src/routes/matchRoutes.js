const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const SeasonState = require("../models/SeasonState");

// GET /api/matches/current - Current week matches
router.get("/current", async (req, res) => {
  try {
    // Get or create season state
    let state = await SeasonState.findOne();
    
    if (!state) {
      state = await SeasonState.create({
        currentWeek: 1,
        phase: "betting",
        countdown: 60,
        seasonStarted: false
      });
    }

    // Get matches with FULL team data
    const matches = await Match.find({ 
      matchweek: state.currentWeek 
    })
    .populate("homeTeam", "name strength played wins points")  // Added stats
    .populate("awayTeam", "name strength played wins points")
    .lean();

    // Format response for frontend
    const formattedMatches = matches.map(m => ({
      _id: m._id,
      homeTeam: m.homeTeam || { name: "TBD", strength: 0 },
      awayTeam: m.awayTeam || { name: "TBD", strength: 0 },
      matchweek: m.matchweek,
      status: m.status || "upcoming",
      homeScore: m.homeScore || 0,
      awayScore: m.awayScore || 0,
      // ALL ODDS - make sure these match your schema
      odds: {
        home: m.homeOdds || 1.5,
        draw: m.drawOdds || 3.5,
        away: m.awayOdds || 1.5,
        over25: m.over25 || 1.8,
        under25: m.under25 || 1.9,
        gg: m.ggOdds || 1.7,
        ng: m.ngOdds || 1.8
      }
    }));

    res.json({
      success: true,
      data: {
        week: state.currentWeek,
        phase: state.phase,
        countdown: state.countdown,
        seasonStarted: state.seasonStarted,
        matchCount: matches.length,
        matches: formattedMatches
      }
    });

  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load matches",
      error: error.message
    });
  }
});

// GET /api/matches/live - Get live scores (for polling)
router.get("/live", async (req, res) => {
  try {
    const state = await SeasonState.findOne();
    
    const matches = await Match.find({
      matchweek: state?.currentWeek || 1,
      status: { $in: ["playing", "finished"] }
    })
    .populate("homeTeam", "name")
    .populate("awayTeam", "name")
    .lean();

    res.json({
      success: true,
      phase: state?.phase || "betting",
      matches: matches.map(m => ({
        _id: m._id,
        homeTeam: m.homeTeam?.name,
        awayTeam: m.awayTeam?.name,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        status: m.status
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
