const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({

  homeTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },

  awayTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true
  },

  matchweek: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["upcoming", "playing", "finished"],
    default: "upcoming"
  },

  homeScore: {
    type: Number,
    default: 0
  },

  awayScore: {
    type: Number,
    default: 0
  },

  /* ---- 1X2 Odds ---- */

  homeOdds: {
    type: Number,
    required: true
  },

  drawOdds: {
    type: Number,
    required: true
  },

  awayOdds: {
    type: Number,
    required: true
  },

  /* ---- Over/Under Odds ---- */

  over15: Number,
  under15: Number,

  over25: Number,
  under25: Number,

  over35: Number,
  under35: Number,

  over45: Number,
  under45: Number,

  /* ---- GG / NG ---- */

  ggOdds: Number,
  ngOdds: Number

}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);
