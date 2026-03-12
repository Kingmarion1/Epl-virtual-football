const express = require("express");
const router = express.Router();

const Match = require("../models/Match");
const SeasonState = require("../models/SeasonState");

/* CURRENT WEEK MATCHES */

router.get("/current", async (req, res) => {

  try {

    const state = await SeasonState.findOne();

    const matches = await Match.find({
      matchweek: state.currentWeek
    })
    .populate("homeTeam")
    .populate("awayTeam");

    res.json({
      week: state.currentWeek,
      phase: state.phase,
      countdown: state.countdown,
      matches
    });

  } catch (err) {

    res.status(500).json({ message: "Error loading matches" });

  }

});

module.exports = router;
