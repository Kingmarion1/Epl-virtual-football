const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const SeasonState = require("../models/SeasonState");

// GET /api/matches/current - Current week matches
router.get("/current", async (req, res) => {
  try {
    // Get season state
    let state = await SeasonState.findOne();
    
    // Auto-create if missing
    if (!state) {
      state = await SeasonState.create({
        currentWeek: 1,
        phase: "betting",
        countdown: 60,
        seasonStarted: false
      });
    }

    // Get matches with full team details
    const matches = await Match.find({ 
      matchweek: state.currentWeek 
    })
    .populate("homeTeam", "name strength played wins draws losses points")
    .populate("awayTeam", "name strength played wins draws losses points")
    .lean()
    .sort({ _id: 1 });

    // If no matches, season might not be generated
    if (matches.length === 0 && !state.seasonStarted) {
      return res.status(503).json({
        success: false,
        message: "Season not yet generated. Please wait...",
        state: {
          week: state.currentWeek,
          phase: state.phase,
          seasonStarted: state.seasonStarted
        }
      });
    }

    res.json({
      success: true,
      data: {
        week: state.currentWeek,
        phase: state.phase,
        countdown: state.countdown,
        seasonStarted: state.seasonStarted,
        matchCount: matches.length,
        matches: matches.map(m => ({
          _id: m._id,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          matchweek: m.matchweek,
          status: m.status,
          scores: m.status === "finished" ? {
            home: m.homeScore,
            away: m.awayScore
          } : null,
          odds: {
            home: m.homeOdds,
            draw: m.drawOdds,
            away: m.awayOdds,
            over25: m.over25,
            under25: m.under25,
            gg: m.ggOdds,
            ng: m.ngOdds
          }
        }))
      }
    });

  } catch (error) {
    console.error("Matches error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load matches",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// GET /api/matches/all - All matches (debug)
router.get("/all", async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("homeTeam", "name")
      .populate("awayTeam", "name")
      .lean();
    
    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/matches/week/:week - Specific week
router.get("/week/:week", async (req, res) => {
  try {
    const week = parseInt(req.params.week);
    
    if (week < 1 || week > 38) {
      return res.status(400).json({
        success: false,
        message: "Week must be between 1 and 38"
      });
    }
    
    const matches = await Match.find({ matchweek: week })
      .populate("homeTeam", "name")
      .populate("awayTeam", "name")
      .lean();
    
    res.json({
      success: true,
      week,
      count: matches.length,
      matches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
