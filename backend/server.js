// server.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🏆 Leaderboard stored in memory
let leaderboard = [];

// ✅ Root route (to check if backend is running)
app.get("/", (req, res) => {
  res.send("Pacman backend is running 🚀");
});

// ✅ Get leaderboard (top 10)
app.get("/leaderboard", (req, res) => {
  const sorted = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(sorted);
});

// ✅ Add a new score
app.post("/leaderboard", (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  leaderboard.push({ name, score });
  res.json({ success: true, leaderboard });
});

// ✅ Clear leaderboard (optional for reset)
app.delete("/leaderboard", (req, res) => {
  leaderboard = [];
  res.json({ success: true, message: "Leaderboard cleared" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Pacman backend running on port ${PORT}`);
});