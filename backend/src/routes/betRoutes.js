const express = require("express");
const router = express.Router();

const Bet = require("../models/Bet");
const Match = require("../models/Match");
const User = require("../models/User");

/* PLACE BET */

router.post("/place", async (req, res) => {

  try {

    const { userId, matchId, betType, prediction, odds, stake } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < stake) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const potentialWin = stake * odds;

    const bet = await Bet.create({
      user: userId,
      match: matchId,
      betType,
      prediction,
      odds,
      stake,
      potentialWin
    });

    user.balance -= stake;
    user.totalBets += 1;

    await user.save();

    res.json({
      message: "Bet placed",
      bet
    });

  } catch (err) {

    res.status(500).json({ message: "Bet failed" });

  }

});

module.exports = router;
