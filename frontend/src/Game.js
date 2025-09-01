import React, { useEffect, useRef, useState } from "react";

// 🎮 Tile size and map setup
const TILE_SIZE = 24;

// Simple map: 0 = empty, 1 = wall, 2 = pellet
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
];

// API helpers
async function saveScore(name, score) {
  await fetch("https://pacman-2.onrender.com/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score }),
  });
}

async function getLeaderboard() {
  const res = await fetch("https://pacman-2.onrender.com/leaderboard");
  return await res.json();
}

export default function Game() {
  const canvasRef = useRef(null);
  const [pacman, setPacman] = useState({ x: 1, y: 1, dir: "RIGHT" });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("Player");

  // 🎮 Touch controls
  useEffect(() => {
    const handleSwipe = (e) => {
      const { clientX, clientY } = e.changedTouches[0];
      const { width, height } = window.screen;

      if (clientX < width / 3) setPacman((p) => ({ ...p, dir: "LEFT" }));
      else if (clientX > (2 * width) / 3) setPacman((p) => ({ ...p, dir: "RIGHT" }));
      else if (clientY < height / 2) setPacman((p) => ({ ...p, dir: "UP" }));
      else setPacman((p) => ({ ...p, dir: "DOWN" }));
    };

    window.addEventListener("touchend", handleSwipe);
    return () => window.removeEventListener("touchend", handleSwipe);
  }, []);

  // 🎮 Game loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setPacman((prev) => {
        let { x, y, dir } = prev;
        let nx = x, ny = y;

        if (dir === "LEFT") nx--;
        if (dir === "RIGHT") nx++;
        if (dir === "UP") ny--;
        if (dir === "DOWN") ny++;

        // wall check
        if (map[ny] && map[ny][nx] !== 1) {
          // eat pellet
          if (map[ny][nx] === 2) {
            map[ny][nx] = 0;
            setScore((s) => s + 10);
          }
          return { ...prev, x: nx, y: ny };
        }
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [gameOver]);

  // 🎨 Draw canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // draw map
    map.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          ctx.fillStyle = "blue";
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        } else if (cell === 2) {
          ctx.fillStyle = "yellow";
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            4,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
    });

    // draw pacman
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(
      pacman.x * TILE_SIZE + TILE_SIZE / 2,
      pacman.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }, [pacman, score]);

  // 🏆 Game Over handling
  useEffect(() => {
    if (score >= 200) { // simple end condition
      setGameOver(true);
      saveScore(playerName, score).then(() => {
        getLeaderboard().then(setLeaderboard);
      });
    }
  }, [score, playerName]);

  return (
    <div className="flex flex-col items-center p-4 text-center">
      <h1 className="text-2xl font-bold">Pacman 🟡</h1>
      <p className="mb-2">Score: {score}</p>

      {!gameOver && (
        <canvas
          ref={canvasRef}
          width={map[0].length * TILE_SIZE}
          height={map.length * TILE_SIZE}
          className="border border-gray-400"
        />
      )}

      {gameOver && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">🎉 Game Over!</h2>
          <p>Your Score: {score}</p>

          <h3 className="mt-4 text-lg font-semibold">🏆 Leaderboard</h3>
          <ul className="mt-2">
            {leaderboard.map((entry, i) => (
              <li key={i}>
                {i + 1}. {entry.name} — {entry.score}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="border px-2 py-1 rounded"
          placeholder="Enter your name"
        />
      </div>
    </div>
  );
}