const mongoose = require("mongoose");

const seasonStateSchema = new mongoose.Schema({

  currentWeek: {
    type: Number,
    default: 1
  },

  phase: {
    type: String,
    enum: ["betting", "playing", "results"],
    default: "betting"
  },

  countdown: {
    type: Number,
    default: 60
  },

  seasonStarted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("SeasonState", seasonStateSchema);
