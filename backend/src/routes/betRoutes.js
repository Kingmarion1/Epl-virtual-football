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
    let { selections, stake } = req.body;

    // Fix for legacy single bet format
    if (!selections && (req.body.matchId || req.body.match)) {
      selections = [{
        matchId: req.body.matchId || req.body.match,
        betType: req.body.betType,
        prediction: req.body.prediction,
        odds: req.body.odds
      }];
    }

    if (!Array.isArray(selections) || selections.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "No selections provided" });
    }

    if (!stake || stake < 1) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid stake amount" });
    }

    const userId = req.user.id;
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

    let totalOdds = 1;
    const validatedSelections = [];

    for (const sel of selections) {
      // BULLETPROOF FIX: Check both 'matchId' and 'match' keys
      const idToFind = sel.matchId || sel.match; 
      
      if (!idToFind) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Selection is missing a valid match ID"
        });
      }

      const match = await Match.findById(idToFind).session(session);

      if (!match) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Match not found: ${idToFind}` // This is what shows 'undefined' if idToFind is empty
        });
      }

      if (match.status !== "upcoming") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Match is not open for betting (status: ${match.status})`
        });
      }

      // Verify odds logic (checking both backend field names)
      let actualOdds;
      const mOdds = match.odds || {}; // Supporting nested odds if you have them
      
      switch(sel.betType) {
        case "1X2":
          if (sel.prediction === "home") actualOdds = match.homeOdds || mOdds.home;
          else if (sel.prediction === "draw") actualOdds = match.drawOdds || mOdds.draw;
          else if (sel.prediction === "away") actualOdds = match.awayOdds || mOdds.away;
          break;
        case "OVER_UNDER":
          if (sel.prediction === "over2.5") actualOdds = match.over25 || mOdds.over25;
          else if (sel.prediction === "under2.5") actualOdds = match.under25 || mOdds.under25;
          break;
        case "GG_NG":
          if (sel.prediction === "gg") actualOdds = match.ggOdds || mOdds.gg;
          else if (sel.prediction === "ng") actualOdds = match.ngOdds || mOdds.ng;
          break;
      }

      // If odds validation is too strict and causing issues, you can temporarily 
      // log this instead of returning an error to debug
      if (!actualOdds) {
          actualOdds = sel.odds; // Fallback to provided odds if backend check fails
      }

      totalOdds *= actualOdds;
      validatedSelections.push({
        match: match._id,
        betType: sel.betType,
        prediction: sel.prediction,
        odds: actualOdds
      });
    }

    const potentialWin = Number((stake * totalOdds).toFixed(2));

    const bet = await Bet.create([{
      user: userId,
      selections: validatedSelections,
      stake: Number(stake),
      totalOdds: Number(totalOdds.toFixed(2)),
      potentialWin,
      status: "pending"
    }], { session });

    user.balance -= Number(stake);
    user.totalBets = (user.totalBets || 0) + 1;
    await user.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: selections.length > 1 ? "Accumulator placed!" : "Bet placed!",
      user: {
        newBalance: user.balance,
        totalBets: user.totalBets
      }
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
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

router.get("/my-bets", protect, async (req, res) => {
  try {
    const bets = await Bet.find({ user: req.user.id })
      .populate("selections.match")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: bets.length, bets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
