require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const matchRoutes = require("./routes/matchRoutes");
const betRoutes = require("./routes/betRoutes");
const tableRoutes = require("./routes/tableRoutes");
const authRoutes = require("./routes/authRoutes");

const startVirtualEngine = require("./engine/virtualEngine");

const app = express();

/* MIDDLEWARE */

app.use(cors());
app.use(express.json());

/* DATABASE */

connectDB();

/* ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/bets", betRoutes);
app.use("/api", tableRoutes);

/* START ENGINE */

startVirtualEngine();

/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});
