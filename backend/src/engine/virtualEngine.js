const SeasonState = require("../models/SeasonState");
const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const simulateWeek = require("./matchEngine");
const generateSeason = require("./seasonGenerator");

// Configuration
const CONFIG = {
  BETTING_DURATION: 60, // seconds
  RESULTS_DURATION: 10, // seconds
  AUTO_RESTART: true
};

const determineBetResult = (bet, match) => {
  const home = match.homeScore;
  const away = match.awayScore;
  
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
      
    default:
      return false;
  }
};

const settleBetsForWeek = async (week) => {
  try {
    console.log(`💰 Settling bets for week ${week}...`);
    
    const pendingBets = await Bet.find({ status: "pending" })
      .populate("match")
      .populate("user");

    let settled = 0;
    let won = 0;
    let lost = 0;

    for (const bet of pendingBets) {
      try {
        // Only settle bets for this week's matches
        if (!bet.match || bet.match.matchweek !== week) continue;
        if (bet.match.status !== "finished") continue;

        const isWin = determineBetResult(bet, bet.match);
        
        if (isWin) {
          bet.status = "won";
          bet.user.balance += bet.potentialWin;
          bet.user.wins += 1;
          won++;
        } else {
          bet.status = "lost";
          bet.user.losses += 1;
          lost++;
        }

        await bet.user.save();
        await bet.save();
        settled++;

      } catch (betError) {
        console.error(`Error settling bet ${bet._id}:`, betError);
        continue;
      }
    }

    console.log(`✅ Settled ${settled} bets (${won} won, ${lost} lost)`);
    return { settled, won, lost };

  } catch (error) {
    console.error("❌ Bet settlement failed:", error);
    throw error;
  }
};

const resetSeason = async () => {
  console.log("🔄 Resetting season...");
  
  await Match.updateMany({}, {
    status: "upcoming",
    homeScore: 0,
    awayScore: 0
  });
  
  await Team.updateMany({}, {
    played: 0, wins: 0, draws: 0, losses: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0
  });
  
  console.log("✅ Season reset complete");
};

const startVirtualEngine = async () => {
  console.log("🎮 Starting Virtual Engine...");
  
  try {
    // Initialize or get season state
    let state = await SeasonState.findOne();
    
    if (!state) {
      console.log("🆕 Creating new season state...");
      state = await SeasonState.create({
        currentWeek: 1,
        phase: "betting",
        countdown: CONFIG.BETTING_DURATION,
        seasonStarted: false
      });
    }

    // Generate season if needed
    if (!state.seasonStarted) {
      console.log("🏗️ Initializing season...");
      await generateSeason();
      state.seasonStarted = true;
      await state.save();
    }

    console.log(`📅 Week ${state.currentWeek} | Phase: ${state.phase} | Countdown: ${state.countdown}`);

    // Main game loop (runs every second)
    setInterval(async () => {
      try {
        state = await SeasonState.findOne();
        
        if (!state) {
          console.error("❌ Season state lost!");
          return;
        }

        // BETTING PHASE
        if (state.phase === "betting") {
          state.countdown -= 1;
          
          if (state.countdown <= 0) {
            console.log("⏰ Betting closed! Starting matches...");
            state.phase = "playing";
            state.countdown = CONFIG.RESULTS_DURATION;
          }
          
          await state.save();
        }
        
        // PLAYING PHASE
        else if (state.phase === "playing") {
          console.log(`🏃 Simulating week ${state.currentWeek}...`);
          
          const result = await simulateWeek(state.currentWeek);
          
          if (result.simulated > 0) {
            state.phase = "results";
            state.countdown = CONFIG.RESULTS_DURATION;
            console.log("✅ Matches complete! Showing results...");
          } else {
            // No matches to simulate, skip to next week
            state.phase = "results";
            state.countdown = 0;
          }
          
          await state.save();
        }
        
        // RESULTS PHASE
        else if (state.phase === "results") {
          // Settle bets first
          await settleBetsForWeek(state.currentWeek);
          
          state.countdown -= 1;
          
          if (state.countdown <= 0) {
            // Advance to next week
            state.currentWeek += 1;
            
            // Check season end
            if (state.currentWeek > 38) {
              console.log("🏆 Season complete! Restarting...");
              state.currentWeek = 1;
              await resetSeason();
            }
            
            state.phase = "betting";
            state.countdown = CONFIG.BETTING_DURATION;
            console.log(`📅 Starting Week ${state.currentWeek}`);
          }
          
          await state.save();
        }

      } catch (loopError) {
        console.error("❌ Engine loop error:", loopError);
        // Don't crash - continue running
      }
      
    }, 1000); // Run every second

    console.log("✅ Virtual Engine running (1-second ticks)");

  } catch (error) {
    console.error("❌ Failed to start engine:", error);
    throw error;
  }
};

module.exports = startVirtualEngine;
