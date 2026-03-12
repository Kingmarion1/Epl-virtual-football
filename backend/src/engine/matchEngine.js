const Match = require("../models/Match");
const Team = require("../models/Team");

const simulateWeek = async (week) => {

  try {

    const matches = await Match.find({
      matchweek: week,
      status: "upcoming"
    });

    for (const match of matches) {

      const home = await Team.findById(match.homeTeam);
      const away = await Team.findById(match.awayTeam);

      const homeStrength = home.strength;
      const awayStrength = away.strength;

      const homeGoals = Math.max(
        0,
        Math.floor(Math.random() * 6 + homeStrength / 50)
      );

      const awayGoals = Math.max(
        0,
        Math.floor(Math.random() * 5 + awayStrength / 55)
      );

      match.homeScore = homeGoals;
      match.awayScore = awayGoals;
      match.status = "finished";

      await match.save();

      /* -------- UPDATE TEAM STATS -------- */

      home.played += 1;
      away.played += 1;

      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;

      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      if (homeGoals > awayGoals) {

        home.wins += 1;
        away.losses += 1;

        home.points += 3;

      } else if (awayGoals > homeGoals) {

        away.wins += 1;
        home.losses += 1;

        away.points += 3;

      } else {

        home.draws += 1;
        away.draws += 1;

        home.points += 1;
        away.points += 1;

      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;

      await home.save();
      await away.save();

    }

    console.log(`Matchweek ${week} is Active`);

  } catch (error) {

    console.log("Match simulation error:", error);

  }

};

module.exports = simulateWeek;
