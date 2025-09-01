import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// in-memory store
let leaderboard = [];

// get leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard.sort((a, b) => b.score - a.score).slice(0, 10));
});

// post score
app.post("/leaderboard", (req, res) => {
  const { name, score } = req.body;
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }
  leaderboard.push({ name, score });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});