const SeasonState = require("../models/SeasonState");
const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const Team = require("../models/Team");
const simulateWeek = require("./matchEngine");
const generateSeason = require("./seasonGenerator");

// Configuration
const CONFIG = {
  BETTING_DURATION: 60, 
  RESULTS_DURATION: 10, 
  TICK_INTERVAL: 1000, 
  AUTO_RESTART: true
};

const determineBetResult = (selection, match) => {
  const { homeScore: home, awayScore: away } = match;
  
  switch(selection.betType) {
    case "1X2":
      if (selection.prediction === "home" && home > away) return true;
      if (selection.prediction === "draw" && home === away) return true;
      if (selection.prediction === "away" && away > home) return true;
      return false;
    case "OVER_UNDER":
      const total = home + away;
      const threshold = parseFloat(selection.prediction.replace(/[^0-9.]/g, ""));
      if (selection.prediction.startsWith("over") && total > threshold) return true;
      if (selection.prediction.startsWith("under") && total < threshold) return true;
      return false;
    case "GG_NG":
      if (selection.prediction === "gg" && home > 0 && away > 0) return true;
      if (selection.prediction === "ng" && (home === 0 || away === 0)) return true;
      return false;
    default: return false;
  }
};

const settleBetsForWeek = async (week) => {
  try {
    console.log(`💰 Settling bets for week ${week}...`);
    
    // Correctly populate the nested match inside the selections array
    const pendingBets = await Bet.find({ status: "pending" })
      .populate("selections.match") 
      .populate("user");

    if (pendingBets.length === 0) return { settled: 0 };

    const settlementPromises = pendingBets.map(async (bet) => {
      try {
        // Ensure all matches in this bet slip are actually finished
        const allFinished = bet.selections.every(s => s.match && s.match.status === "finished");
        if (!allFinished) return;

        // ACCUMULATOR LOGIC: Every selection in the slip must be a win
        const isTicketWin = bet.selections.every(selection => {
          return determineBetResult(selection, selection.match);
        });

        if (isTicketWin) {
          bet.status = "won";
          bet.user.balance += bet.potentialWin;
          bet.user.wins += 1;
        } else {
          bet.status = "lost";
          bet.user.losses += 1;
        }

        return Promise.all([bet.user.save(), bet.save()]);
      } catch (err) {
        console.error(`Error processing bet ${bet._id}:`, err);
      }
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
    await Match.updateMany({}, { status: "upcoming", homeScore: 0, awayScore: 0 });
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

    const runTick = async () => {
      try {
        state = await SeasonState.findOne();
        if (!state) return;

        if (state.phase === "betting") {
          state.countdown -= 1;
          if (state.countdown <= 0) {
            state.phase = "playing";
            state.countdown = CONFIG.RESULTS_DURATION;
          }
        }
        else if (state.phase === "playing") {
          await simulateWeek(state.currentWeek);
          state.phase = "results";
          state.countdown = CONFIG.RESULTS_DURATION;
        }
        else if (state.phase === "results") {
          await settleBetsForWeek(state.currentWeek);
          state.countdown -= 1;
          
          if (state.countdown <= 0) {
            state.currentWeek += 1;
            if (state.currentWeek > 38) {
              await resetSeason();
              state.currentWeek = 1;
            }
            state.phase = "betting";
            state.countdown = CONFIG.BETTING_DURATION;
          }
        }

        await state.save();
      } catch (err) {
        console.error("❌ Tick Error:", err.message);
      } finally {
        setTimeout(runTick, CONFIG.TICK_INTERVAL);
      }
    };

    runTick();
    console.log("✅ Virtual Engine initialized safely.");
  } catch (error) {
    console.error("❌ Failed to start engine:", error);
  }
};

module.exports = startVirtualEngine;
      
