const Match = require("../models/Match");
const Team = require("../models/Team");

const simulateMatch = (homeStrength, awayStrength) => {
  // Calculate goal probabilities based on strength
  const strengthDiff = homeStrength - awayStrength;
  
  // Home advantage: +5 to home strength
  const homeAdvantage = 5;
  const adjustedDiff = strengthDiff + homeAdvantage;
  
  // Base goals + random factor + strength factor
  const homeBase = Math.random() * 3; // 0-3 base
  const awayBase = Math.random() * 2.5; // 0-2.5 base
  
  const homeGoals = Math.max(0, Math.round(homeBase + (adjustedDiff / 20)));
  const awayGoals = Math.max(0, Math.round(awayBase - (adjustedDiff / 25)));
  
  return { homeGoals, awayGoals };
};

const simulateWeek = async (weekNumber) => {
  try {
    console.log(`⚽ Simulating week ${weekNumber}...`);
    
    const matches = await Match.find({
      matchweek: weekNumber,
      status: "upcoming"
    }).populate("homeTeam").populate("awayTeam");

    if (matches.length === 0) {
      console.log(`⚠️ No matches found for week ${weekNumber}`);
      return { simulated: 0 };
    }

    let simulated = 0;

    for (const match of matches) {
      try {
        const { homeGoals, awayGoals } = simulateMatch(
          match.homeTeam.strength,
          match.awayTeam.strength
        );

        // Update match
        match.homeScore = homeGoals;
        match.awayScore = awayGoals;
        match.status = "finished";
        await match.save();

        // Update team stats
        const home = match.homeTeam;
        const away = match.awayTeam;

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
        
        simulated++;

      } catch (matchError) {
        console.error(`Error simulating match ${match._id}:`, matchError);
        continue; // Skip this match, continue with others
      }
    }

    console.log(`✅ Simulated ${simulated}/${matches.length} matches`);
    return { simulated, total: matches.length };

  } catch (error) {
    console.error("❌ Week simulation failed:", error);
    throw error;
  }
};

module.exports = simulateWeek;
