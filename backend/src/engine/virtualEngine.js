const SeasonState = require("../models/SeasonState");
const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Team = require("../models/Team"); // FIXED: Added missing import
const simulateWeek = require("./matchEngine");
const generateSeason = require("./seasonGenerator");

// Configuration
const CONFIG = {
  BETTING_DURATION: 60, 
  RESULTS_DURATION: 10, 
  TICK_INTERVAL: 1000, // 1 second
  AUTO_RESTART: true
};

const determineBetResult = (bet, match) => {
  const { homeScore: home, awayScore: away } = match;
  
  switch(bet.betType) {
    case "1X2":
      if (bet.prediction === "home" && home > away) return true;
      if (bet.prediction === "draw" && home === away) return true;
      if (bet.prediction === "away" && away > home) return true;
      return false;
    case "OVER_UNDER":
      const total = home + away;
      const threshold = parseFloat(bet.prediction.replace(/[^0-9.]/g, ""));
      if (bet.prediction.startsWith("over") && total > threshold) return true;
      if (bet.prediction.startsWith("under") && total < threshold) return true;
      return false;
    case "GG_NG":
      if (bet.prediction === "gg" && home > 0 && away > 0) return true;
      if (bet.prediction === "ng" && (home === 0 || away === 0)) return true;
      return false;
    default: return false;
  }
};

const settleBetsForWeek = async (week) => {
  try {
    console.log(`💰 Settling bets for week ${week}...`);
    const pendingBets = await Bet.find({ status: "pending" })
      .populate("match")
      .populate("user");

    if (pendingBets.length === 0) return { settled: 0 };
    
    const settlementPromises = pendingBets.map(async (bet) => {
  // 1. Check if ALL matches in this bet are finished
    const allMatchesFinished = bet.selections.every(s => s.match && s.match.status === "finished");
  
  // 2. Only process if the whole ticket is ready
    if (!allMatchesFinished) return;

  // 3. Check every selection in the accumulator
    const allSelectionsWon = bet.selections.every(selection => {
    return determineBetResult(selection, selection.match);
  });

  // 4. Update the bet status
  if (allSelectionsWon) {
    bet.status = "won";
    bet.user.balance += bet.potentialWin;
    bet.user.wins += 1;
  } else {
    bet.status = "lost";
    bet.user.losses += 1;
  }

  return Promise.all([bet.user.save(), bet.save()]);
});

    const results = await Promise.all(settlementPromises);
    const settledCount = results.filter(r => r !== undefined).length;
    
    console.log(`✅ Settled ${settledCount} bets for week ${week}`);
    return { settled: settledCount };
  } catch (error) {
    console.error("❌ Bet settlement failed:", error);
  }
};

const resetSeason = async () => {
  console.log("🔄 Resetting season stats...");
  try {
    // Reset all matches to upcoming
    await Match.updateMany({}, { status: "upcoming", homeScore: 0, awayScore: 0 });
    
    // Reset all team standings to zero - FIXES THE 598 GAMES PROBLEM
    await Team.updateMany({}, {
      played: 0, wins: 0, draws: 0, losses: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
    });
    
    console.log("✅ Season reset complete");
  } catch (err) {
    console.error("❌ Reset Season Failed:", err);
  }
};

const startVirtualEngine = async () => {
  console.log("🎮 Starting Virtual Engine...");
  
  try {
    let state = await SeasonState.findOne() || await SeasonState.create({
      currentWeek: 1, phase: "betting", countdown: CONFIG.BETTING_DURATION, seasonStarted: false
    });

    if (!state.seasonStarted) {
      await generateSeason();
      state.seasonStarted = true;
      await state.save();
    }

    // SAFE TICK SYSTEM: Replaces setInterval to prevent ParallelSaveError
    const runTick = async () => {
      try {
        // Refresh state from DB to ensure we have latest data
        state = await SeasonState.findOne();
        
        // 1. BETTING PHASE
        if (state.phase === "betting") {
          state.countdown -= 1;
          if (state.countdown <= 0) {
            state.phase = "playing";
            state.countdown = CONFIG.RESULTS_DURATION;
          }
        }
        
        // 2. PLAYING PHASE
        else if (state.phase === "playing") {
          const result = await simulateWeek(state.currentWeek);
          state.phase = "results";
          state.countdown = CONFIG.RESULTS_DURATION;
        }
        
        // 3. RESULTS PHASE
        else if (state.phase === "results") {
          await settleBetsForWeek(state.currentWeek);
          state.countdown -= 1;
          
          if (state.countdown <= 0) {
            state.currentWeek += 1;
            
            // SEASON END CHECK (The 38-week cap)
            if (state.currentWeek > 38) {
              await resetSeason();
              state.currentWeek = 1;
            }
            
            state.phase = "betting";
            state.countdown = CONFIG.BETTING_DURATION;
          }
        }

        await state.save(); // Now safe because only one tick runs at a time
        
      } catch (err) {
        console.error("❌ Tick Error:", err.message);
      } finally {
        // Schedule the next tick ONLY after this one finishes
        setTimeout(runTick, CONFIG.TICK_INTERVAL);
      }
    };

    runTick(); // Trigger the first tick
    console.log("✅ Virtual Engine initialized safely.");

  } catch (error) {
    console.error("❌ Failed to start engine:", error);
  }
};

module.exports = startVirtualEngine;
    
