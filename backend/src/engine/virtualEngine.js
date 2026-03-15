const SeasonState = require("../models/SeasonState");
const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const simulateWeek = require("./matchEngine");
const generateSeason = require("./seasonGenerator");

let countdown = 60;

/* ---------------- SETTLE BETS ---------------- */

const settleBets = async (week) => {

  const bets = await Bet.find({ status: "pending" }).populate("match user").where("match.matchweek").equals(week);

  for (const bet of bets) {

    const match = bet.match;

    if (match.matchweek !== week) continue;
    if (match.status !== "finished") continue;

    const home = match.homeScore;
    const away = match.awayScore;

    let win = false;

    /* ---- 1X2 ---- */

    if (bet.betType === "1X2") {

      if (bet.prediction === "home" && home > away) win = true;
      if (bet.prediction === "away" && away > home) win = true;
      if (bet.prediction === "draw" && home === away) win = true;

    }

    /* ---- OVER UNDER ---- */

    if (bet.betType === "OVER_UNDER") {

      const total = home + away;

      if (bet.prediction === "over1.5" && total > 1.5) win = true;
      if (bet.prediction === "over2.5" && total > 2.5) win = true;
      if (bet.prediction === "over3.5" && total > 3.5) win = true;
      if (bet.prediction === "over4.5" && total > 4.5) win = true;

      if (bet.prediction === "under1.5" && total < 1.5) win = true;
      if (bet.prediction === "under2.5" && total < 2.5) win = true;
      if (bet.prediction === "under3.5" && total < 3.5) win = true;
      if (bet.prediction === "under4.5" && total < 4.5) win = true;

    }

    /* ---- GG / NG ---- */

    if (bet.betType === "GG_NG") {

      if (bet.prediction === "gg" && home > 0 && away > 0) win = true;
      if (bet.prediction === "ng" && (home === 0 || away === 0)) win = true;

    }

    if (win) {

      bet.status = "won";

      const user = await User.findById(bet.user._id);
      user.balance += bet.potentialWin;
      user.wins += 1;

      await user.save();

    } else {

      bet.status = "lost";

      const user = await User.findById(bet.user._id);
      user.losses += 1;

      await user.save();

    }

    await bet.save();

  }

};

/* ---------------- ENGINE LOOP ---------------- */

const startVirtualEngine = async () => {

  let state = await SeasonState.findOne();

  if (!state) {
    state = await SeasonState.create({});
  }

  if (!state.seasonStarted) {

    await generateSeason();

    state.seasonStarted = true;
    await state.save();

    console.log("Season generated");
  }

  setInterval(async () => {

    state = await SeasonState.findOne();

    if (state.phase === "betting") {

      countdown--;

      state.countdown = countdown;
      await state.save();

      if (countdown <= 0) {

        state.phase = "playing";
        await state.save();

        console.log("Simulating matches...");

        await simulateWeek(state.currentWeek);

        state.phase = "results";
        await state.save();

        await settleBets(state.currentWeek);

        console.log("Bets settled");

        state.currentWeek += 1;

        if (state.currentWeek > 38) {

          state.currentWeek = 1;

          await Match.updateMany({}, {
            status: "upcoming",
            homeScore: 0,
            awayScore: 0
          });

          console.log("New season restarted");

        }

        countdown = 60;

        state.phase = "betting";
        state.countdown = 60;

        await state.save();

      }

    }

  }, 1300);

};

module.exports = startVirtualEngine;
