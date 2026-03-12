const express = require("express");
const router = express.Router();

const Team = require("../models/Team");
const User = require("../models/User");

/* LEAGUE TABLE */

router.get("/table", async (req, res) => {

  try {

    const table = await Team.find().sort({
      points: -1,
      goalDifference: -1,
      goalsFor: -1
    });

    res.json(table);

  } catch (err) {

    res.status(500).json({ message: "Error loading table" });

  }

});

/* LEADERBOARD */

router.get("/leaderboard", async (req, res) => {

  try {

    const users = await User.find()
      .sort({ balance: -1 })
      .limit(20)
      .select("username balance wins losses");

    res.json(users);

  } catch (err) {

    res.status(500).json({ message: "Error loading leaderboard" });

  }

});

module.exports = router;
