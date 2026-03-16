require("dotenv").config();
const mongoose = require("mongoose");
const generateSeason = require("../engine/seasonGenerator");
const SeasonState = require("../models/SeasonState");

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...");
    
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    
    // Clear existing data (optional - remove if you want to keep data)
    // await Match.deleteMany({});
    // await Team.deleteMany({});
    // await SeasonState.deleteMany({});
    
    // Reset season state
    await SeasonState.deleteMany({});
    await SeasonState.create({
      currentWeek: 1,
      phase: "betting",
      countdown: 60,
      seasonStarted: false
    });
    
    // Generate season
    const result = await generateSeason();
    console.log("Seed result:", result);
    
    console.log("✅ Database seeded successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
