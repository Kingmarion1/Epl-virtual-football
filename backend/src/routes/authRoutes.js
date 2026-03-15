const express = require("express");
const router = express.Router();

const { register, login, profile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);

console.log("DEBUG - Register:", typeof register);
console.log("DEBUG - Login:", typeof login);
console.log("DEBUG - Profile:", typeof profile);
console.log("DEBUG - Protect:", typeof protect);


module.exports = router;
