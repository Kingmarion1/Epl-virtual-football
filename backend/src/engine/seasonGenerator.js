const Team = require("../models/Team");
const Match = require("../models/Match");

// 20 Premier League teams with realistic strengths
const EPL_TEAMS = [
  { name: "Arsenal", strength: 91 },
  { name: "Chelsea", strength: 87 },
  { name: "Liverpool", strength: 90 },
  { name: "Manchester City", strength: 93 },
  { name: "Manchester United", strength: 88 },
  { name: "Tottenham", strength: 85 },
  { name: "Newcastle", strength: 86 },
  { name: "Aston Villa", strength: 84 },
  { name: "Brighton", strength: 82 },
  { name: "West Ham", strength: 77 },
  { name: "Everton", strength: 79 },
  { name: "Crystal Palace", strength: 78 },
  { name: "Brentford", strength: 78 },
  { name: "Fulham", strength: 77 },
  { name: "Wolves", strength: 76 },
  { name: "Bournemouth", strength: 81 },
  { name: "Nottingham Forest", strength: 76 },
  { name: "Burnley", strength: 75 },
  { name: "Leeds", strength: 74 },
  { name: "Sunderland", strength: 76 }
];

const generateOdds = (homeStrength, awayStrength) => {
  const diff = homeStrength - awayStrength;
  
  // Base odds calculation
  let homeOdds = 2.0 - (diff * 0.02);
  let awayOdds = 2.0 + (diff * 0.02);
  let drawOdds = 3.2;
  
  // Clamp odds to realistic values
  homeOdds = Math.max(1.2, Math.min(7.0, homeOdds));
  awayOdds = Math.max(1.2, Math.min(7.0, awayOdds));
  
  return {
    homeOdds: Number(homeOdds.toFixed(2)),
    drawOdds: Number(drawOdds.toFixed(2)),
    awayOdds: Number(awayOdds.toFixed(2))
  };
};

const generateMatchOdds = () => {
  return {
    over15: Number((1.2 + Math.random() * 0.5).toFixed(2)),
    under15: Number((3.5 + Math.random() * 2).toFixed(2)),
    over25: Number((1.6 + Math.random() * 0.8).toFixed(2)),
    under25: Number((2.0 + Math.random() * 1.5).toFixed(2)),
    over35: Number((2.5 + Math.random() * 1.5).toFixed(2)),
    under35: Number((1.4 + Math.random() * 0.8).toFixed(2)),
    over45: Number((4.0 + Math.random() * 2).toFixed(2)),
    under45: Number((1.2 + Math.random() * 0.4).toFixed(2)),
    ggOdds: Number((1.6 + Math.random() * 0.6).toFixed(2)),
    ngOdds: Number((1.8 + Math.random() * 0.8).toFixed(2))
  };
};

const generateSeason = async () => {
  try {
    console.log("🔄 Checking season status...");
    
    // Check if matches already exist
    const matchCount = await Match.countDocuments();
    if (matchCount > 0) {
      console.log(`✅ Season already exists with ${matchCount} matches`);
      return { success: true, message: "Season already exists", matches: matchCount };
    }

    // Create teams if they don't exist
    let teams = await Team.find();
    
    if (teams.length === 0) {
      console.log("🏗️ Creating 20 EPL teams...");
      teams = await Team.insertMany(EPL_TEAMS);
      console.log(`✅ Created ${teams.length} teams`);
    }

    if (teams.length !== 20) {
      throw new Error(`Expected 20 teams, found ${teams.length}`);
    }

    const teamIds = teams.map(t => t._id.toString());
    const totalWeeks = 38;
    const matchesPerWeek = 10;

    // Round-robin tournament algorithm
    let rotating = [...teamIds];
    const fixed = rotating.shift(); // Remove first team
    const allMatches = [];

    for (let week = 1; week <= totalWeeks; week++) {
      const currentTeams = [fixed, ...rotating];
      const weekMatches = [];
      const isSecondHalf = week > 19;

      for (let i = 0; i < matchesPerWeek; i++) {
        const homeTeamId = currentTeams[i];
        const awayTeamId = currentTeams[currentTeams.length - 1 - i];
        
        // Get team strengths for odds
        const homeTeam = teams.find(t => t._id.toString() === homeTeamId);
        const awayTeam = teams.find(t => t._id.toString() === awayTeamId);
        
        if (!homeTeam || !awayTeam) {
          throw new Error(`Team not found for week ${week}`);
        }

        const odds = generateOdds(homeTeam.strength, awayTeam.strength);
        const extraOdds = generateMatchOdds();

        // Swap home/away for second half of season
        const finalHome = isSecondHalf ? awayTeamId : homeTeamId;
        const finalAway = isSecondHalf ? homeTeamId : awayTeamId;

        weekMatches.push({
          homeTeam: finalHome,
          awayTeam: finalAway,
          matchweek: week,
          status: "upcoming",
          homeScore: 0,
          awayScore: 0,
          ...odds,
          ...extraOdds
        });
      }

      allMatches.push(...weekMatches);
      
      // Rotate teams for next week (keep first team fixed)
      rotating.unshift(rotating.pop());
    }

    // Insert all matches at once
    const inserted = await Match.insertMany(allMatches);
    console.log(`✅ Generated ${inserted.length} matches (38 weeks)`);
    
    return { 
      success: true, 
      message: "Season generated successfully",
      matches: inserted.length,
      weeks: totalWeeks
    };

  } catch (error) {
    console.error("❌ Season generation failed:", error);
    throw error;
  }
};

module.exports = generateSeason;
