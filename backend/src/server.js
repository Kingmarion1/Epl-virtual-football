require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors());
app.use(express.json());

/* ---------------- DATABASE ---------------- */

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log("MongoDB Error:", err);
});

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {
  res.json({
    message: "EPL Virtual football API is running ⚽"
  });
});

/* ---------------- PORT ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const startVirtualEngine = require("./engine/virtualEngine");

startVirtualEngine();
