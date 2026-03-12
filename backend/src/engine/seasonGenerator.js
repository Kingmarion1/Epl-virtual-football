const Team = require("../models/Team");
const Match = require("../models/Match");

const generateSeason = async () => {

  try {

    const existingMatches = await Match.countDocuments();
    if (existingMatches > 0) {
      console.log("Season already exists");
      return;
    }

    let teams = await Team.find();

    if (teams.length !== 20) {

      console.log("Creating EPL teams...");

      const defaultTeams = [
        { name: "Arsenal", strength: 91 },
        { name: "Chelsea", strength: 88 },
        { name: "Liverpool", strength: 90 },
        { name: "Manchester City", strength: 93 },
        { name: "Manchester United", strength: 87 },
        { name: "Tottenham", strength: 86 },
        { name: "Newcastle", strength: 85 },
        { name: "Aston Villa", strength: 84 },
        { name: "Brighton", strength: 82 },
        { name: "West Ham", strength: 80 },
        { name: "Everton", strength: 79 },
        { name: "Crystal Palace", strength: 78 },
        { name: "Brentford", strength: 78 },
        { name: "Fulham", strength: 77 },
        { name: "Wolves", strength: 76 },
        { name: "Bournemouth", strength: 75 },
        { name: "Nottingham Forest", strength: 75 },
        { name: "Burnley", strength: 74 },
        { name: "Leeds", strength: 73 },
        { name: "Sunderland", strength: 72 }
      ];

      teams = await Team.insertMany(defaultTeams);

    }

    const teamIds = teams.map(t => t._id);

    const totalWeeks = 38;
    const matchesPerWeek = 10;

    let rotating = [...teamIds];
    const fixed = rotating.shift();

    for (let week = 1; week <= totalWeeks; week++) {

      const current = [fixed, ...rotating];
      const weekMatches = [];

      for (let i = 0; i < matchesPerWeek; i++) {

        const home = current[i];
        const away = current[current.length - 1 - i];

        const secondHalf = week > 19;

        const strengthDiff = home.strength - away.strength;

        const homeOdds = (2 - strengthDiff / 100).toFixed(2);
        const drawOdds = (3.2).toFixed(2);
        const awayOdds = (2 + strengthDiff / 100).toFixed(2);
        weekMatches.push({

          homeTeam: secondHalf ? away : home,
          awayTeam: secondHalf ? home : away,

          matchweek: week,

          homeOdds: Number(homeOdds),
          drawOdds: Number(drawOdds),
          awayOdds: Number(awayOdds),

          over15: (1.18 + Math.random() *2).toFixed(2),
          under15: (2 + Math.random() *2).toFixed(2),

          over25: (1.38 + Math.random() *3).toFixed(2),
          under25: (1.6 + Math.random() *3,).toFixed(2),

          over35: (2.4 + Math.random() *2).toFixed(2),
          under35: (1.5 + Math.random() *2).toFixed(2),

          over45: (3.7 + Math.random() *2).toFixed(2),
          under45: (1.27 + Math.random() *2).toFixed(2),

          ggOdds: (1.57 + Math.random() *2).toFixed(2),
          ngOdds: (1.7 + Math.random() *2).toFixed(2)

        });

      }

      await Match.insertMany(weekMatches);

      rotating.unshift(rotating.pop());

    }

    console.log("Full 38 week EPL season generated (380 matches)");

  } catch (error) {

    console.log("Season generation error:", error);

  }

};

module.exports = generateSeason;
