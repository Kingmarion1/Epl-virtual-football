const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Bet = require("../models/Bet");
const Match = require("../models/Match");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// POST /api/bets/place - Place single or multiple bets
router.post("/place", protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Support both single bet and multiple bets (accumulator)
    let { selections, stake } = req.body;
    
    // If single bet (old format), convert to array
    if (!selections && req.body.matchId) {
      selections = [{
        matchId: req.body.matchId,
        betType: req.body.betType,
        prediction: req.body.prediction,
        odds: req.body.odds
      }];
    }

    // Validation
    if (!Array.isArray(selections) || selections.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "No selections provided"
      });
    }

    if (!stake || stake < 1) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid stake amount"
      });
    }

    const userId = req.user.id;

    // Get user with lock
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.balance < stake) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        balance: user.balance,
        required: stake
      });
    }

    // Validate all selections
    let totalOdds = 1;
    const validatedSelections = [];

    for (const sel of selections) {
      const match = await Match.findById(sel.matchId).session(session);
      
      if (!match) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Match not found: ${sel.matchId}`
        });
      }

      if (match.status !== "upcoming") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Match ${match._id} is not open for betting (status: ${match.status})`
        });
      }

      // Verify odds haven't changed
      let actualOdds;
      switch(sel.betType) {
        case "1X2":
          if (sel.prediction === "home") actualOdds = match.homeOdds;
          else if (sel.prediction === "draw") actualOdds = match.drawOdds;
          else if (sel.prediction === "away") actualOdds = match.awayOdds;
          break;
        case "OVER_UNDER":
          if (sel.prediction === "over2.5") actualOdds = match.over25;
          else if (sel.prediction === "under2.5") actualOdds = match.under25;
          else if (sel.prediction === "over1.5") actualOdds = match.over15;
          else if (sel.prediction === "under1.5") actualOdds = match.under15;
          break;
        case "GG_NG":
          if (sel.prediction === "gg") actualOdds = match.ggOdds;
          else if (sel.prediction === "ng") actualOdds = match.ngOdds;
          break;
      }

      if (!actualOdds || Math.abs(actualOdds - sel.odds) > 0.05) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Odds have changed, please refresh",
          matchId: sel.matchId,
          requestedOdds: sel.odds,
          actualOdds: actualOdds
        });
      }

      totalOdds *= actualOdds;
      validatedSelections.push({
        match: match._id,
        betType: sel.betType,
        prediction: sel.prediction,
        odds: actualOdds
      });
    }

    // Calculate potential win
    const potentialWin = Number((stake * totalOdds).toFixed(2));

    // Create bet
    const bet = await Bet.create([{
      user: userId,
      selections: validatedSelections,
      stake: Number(stake),
      totalOdds: Number(totalOdds.toFixed(2)),
      potentialWin,
      status: "pending"
    }], { session });

    // Deduct balance
    user.balance -= Number(stake);
    user.totalBets = (user.totalBets || 0) + 1;
    await user.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: selections.length > 1 ? "Accumulator placed!" : "Bet placed!",
      bet: {
        id: bet[0]._id,
        selections: validatedSelections,
        stake: Number(stake),
        totalOdds: Number(totalOdds.toFixed(2)),
        potentialWin,
        status: "pending"
      },
      user: {
        newBalance: user.balance,
        totalBets: user.totalBets
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Bet error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to place bet",
      error: error.message
    });
  } finally {
    session.endSession();
  }
});

// GET /api/bets/my-bets - Get user's bets
router.get("/my-bets", protect, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id })
      .populate("selections.match", "homeTeam awayTeam homeScore awayScore status matchweek")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: bets.length,
      bets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
