const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

};

/* REGISTER */

exports.register = async (req, res) => {

  try {

    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.json({
      token: generateToken(user._id),
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Registration failed" });

  }

};

/* LOGIN */

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Login failed" });

  }

};

/* PROFILE */

exports.profile = async (req, res) => {

  const user = await User.findById(req.user.id).select("-password");

  res.json(user);

};

