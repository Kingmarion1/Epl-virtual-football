const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Array for multiple selections (accumulator)
  selections: [{
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
    },
    odds: {
      type: Number,
      required: true
    }
  }],
  
  stake: {
    type: Number,
    required: true,
    min: 1
  },
  
  totalOdds: {
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
