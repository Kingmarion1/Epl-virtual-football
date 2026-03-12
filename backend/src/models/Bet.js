const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true
  },

  betType: {
    type: String,
    enum: ["1X2", "OVER_UNDER", "GG_NG"],
    required: true
  },

  prediction: {
    type: String,
    required: true
    // Examples:
    // 1X2 → "home", "draw", "away"
    // OVER_UNDER → "over2.5", "under2.5"
    // GG_NG → "gg", "ng"
  },

  odds: {
    type: Number,
    required: true
  },

  stake: {
    type: Number,
    required: true
  },

  potentialWin: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "won", "lost"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Bet", betSchema);
