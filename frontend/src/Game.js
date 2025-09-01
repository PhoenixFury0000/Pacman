import React, { useEffect, useRef, useState, useCallback } from "react";

// 🎮 Tile size and map setup
const TILE_SIZE = 24;

// Simple map: 0 = empty, 1 = wall, 2 = pellet, 3 = power pellet
const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,2,1,1,2,1],
  [1,3,1,0,1,2,1,0,0,1,2,1,0,3,1],
  [1,2,1,1,1,2,1,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,2,1,1,2,1],
  [1,2,1,0,1,2,1,0,0,1,2,1,0,2,1],
  [1,3,1,1,1,2,1,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Ghost class
class Ghost {
  constructor(x, y, color, speed) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = speed;
    this.direction = "LEFT";
    this.scared = false;
    this.moveCounter = 0;
  }

  move(map, pacman) {
    this.moveCounter++;
    if (this.moveCounter < this.speed) return;
    this.moveCounter = 0;

    const directions = ["UP", "DOWN", "LEFT", "RIGHT"];
    const possibleDirections = [];
    
    for (const dir of directions) {
      let nx = this.x, ny = this.y;
      
      if (dir === "LEFT") nx--;
      if (dir === "RIGHT") nx++;
      if (dir === "UP") ny--;
      if (dir === "DOWN") ny++;
      
      if (map[ny] && map[ny][nx] !== 1) {
        possibleDirections.push(dir);
      }
    }
    
    if (possibleDirections.length > 0) {
      // Simple AI: chase pacman when not scared, run away when scared
      if (!this.scared) {
        // Chase mode
        if (Math.abs(pacman.x - this.x) > Math.abs(pacman.y - this.y)) {
          if (pacman.x > this.x && possibleDirections.includes("RIGHT")) {
            this.direction = "RIGHT";
          } else if (pacman.x < this.x && possibleDirections.includes("LEFT")) {
            this.direction = "LEFT";
          } else if (pacman.y > this.y && possibleDirections.includes("DOWN")) {
            this.direction = "DOWN";
          } else if (pacman.y < this.y && possibleDirections.includes("UP")) {
            this.direction = "UP";
          } else {
            this.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        } else {
          if (pacman.y > this.y && possibleDirections.includes("DOWN")) {
            this.direction = "DOWN";
          } else if (pacman.y < this.y && possibleDirections.includes("UP")) {
            this.direction = "UP";
          } else if (pacman.x > this.x && possibleDirections.includes("RIGHT")) {
            this.direction = "RIGHT";
          } else if (pacman.x < this.x && possibleDirections.includes("LEFT")) {
            this.direction = "LEFT";
          } else {
            this.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        }
      } else {
        // Scared mode - run away from pacman
        if (Math.abs(pacman.x - this.x) > Math.abs(pacman.y - this.y)) {
          if (pacman.x > this.x && possibleDirections.includes("LEFT")) {
            this.direction = "LEFT";
          } else if (pacman.x < this.x && possibleDirections.includes("RIGHT")) {
            this.direction = "RIGHT";
          } else if (pacman.y > this.y && possibleDirections.includes("UP")) {
            this.direction = "UP";
          } else if (pacman.y < this.y && possibleDirections.includes("DOWN")) {
            this.direction = "DOWN";
          } else {
            this.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        } else {
          if (pacman.y > this.y && possibleDirections.includes("UP")) {
            this.direction = "UP";
          } else if (pacman.y < this.y && possibleDirections.includes("DOWN")) {
            this.direction = "DOWN";
          } else if (pacman.x > this.x && possibleDirections.includes("LEFT")) {
            this.direction = "LEFT";
          } else if (pacman.x < this.x && possibleDirections.includes("RIGHT")) {
            this.direction = "RIGHT";
          } else {
            this.direction = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
          }
        }
      }
    }

    let nx = this.x, ny = this.y;
    if (this.direction === "LEFT") nx--;
    if (this.direction === "RIGHT") nx++;
    if (this.direction === "UP") ny--;
    if (this.direction === "DOWN") ny++;

    if (map[ny] && map[ny][nx] !== 1) {
      this.x = nx;
      this.y = ny;
    }
  }
}

// API helpers
async function saveScore(name, score) {
  try {
    await fetch("https://pacman-2.onrender.com/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
  } catch (error) {
    console.error("Failed to save score:", error);
  }
}

async function getLeaderboard() {
  try {
    const res = await fetch("https://pacman-2.onrender.com/leaderboard");
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

export default function Game({ onExit, onHighScore }) {
  const canvasRef = useRef(null);
  const [pacman, setPacman] = useState({ x: 1, y: 1, dir: "RIGHT", power: false });
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("Player");
  const [ghosts, setGhosts] = useState([
    new Ghost(7, 5, "red", 3),
    new Ghost(8, 5, "pink", 4),
    new Ghost(7, 6, "cyan", 5),
    new Ghost(8, 6, "orange", 6),
  ]);
  const [powerTimer, setPowerTimer] = useState(0);
  const [pellets, setPellets] = useState(0);

  // Count initial pellets
  useEffect(() => {
    let count = 0;
    map.forEach(row => {
      row.forEach(cell => {
        if (cell === 2 || cell === 3) count++;
      });
    });
    setPellets(count);
  }, []);

  // 🎮 Touch controls
  useEffect(() => {
    const handleSwipe = (e) => {
      const { clientX, clientY } = e.changedTouches[0];
      const startX = e.changedTouches[0].pageX;
      const startY = e.changedTouches[0].pageY;
      const endX = clientX;
      const endY = clientY;
      
      const dx = endX - startX;
      const dy = endY - startY;
      
      // Determine direction based on the largest change
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          setPacman((p) => ({ ...p, dir: "RIGHT" }));
        } else {
          setPacman((p) => ({ ...p, dir: "LEFT" }));
        }
      } else {
        if (dy > 0) {
          setPacman((p) => ({ ...p, dir: "DOWN" }));
        } else {
          setPacman((p) => ({ ...p, dir: "UP" }));
        }
      }
    };

    window.addEventListener("touchstart", (e) => {
      // Store initial touch position
      const touch = e.touches[0];
      touch.startX = touch.pageX;
      touch.startY = touch.pageY;
    });
    
    window.addEventListener("touchend", handleSwipe);
    return () => window.removeEventListener("touchend", handleSwipe);
  }, []);

  // Handle button controls
  const handleDirectionChange = useCallback((direction) => {
    setPacman((p) => ({ ...p, dir: direction }));
  }, []);

  // Power pellet timer
  useEffect(() => {
    if (pacman.power && powerTimer > 0) {
      const timer = setTimeout(() => setPowerTimer(powerTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (powerTimer === 0 && pacman.power) {
      setPacman(p => ({ ...p, power: false }));
      setGhosts(ghosts => ghosts.map(g => ({ ...g, scared: false })));
    }
  }, [pacman.power, powerTimer]);

  // 🎮 Game loop
  useEffect(() => {
    if (gameOver || gameWin) return;

    const interval = setInterval(() => {
      setPacman((prev) => {
        let { x, y, dir, power } = prev;
        let nx = x, ny = y;

        if (dir === "LEFT") nx--;
        if (dir === "RIGHT") nx++;
        if (dir === "UP") ny--;
        if (dir === "DOWN") ny++;

        // Wall check
        if (map[ny] && map[ny][nx] !== 1) {
          // Eat pellet
          if (map[ny][nx] === 2) {
            map[ny][nx] = 0;
            setScore((s) => s + 10);
            setPellets(p => p - 1);
          }
          // Eat power pellet
          else if (map[ny][nx] === 3) {
            map[ny][nx] = 0;
            setScore((s) => s + 50);
            setPacman(p => ({ ...p, power: true }));
            setPowerTimer(10);
            setGhosts(ghosts => ghosts.map(g => ({ ...g, scared: true })));
            setPellets(p => p - 1);
          }
          
          // Check for win condition
          if (pellets <= 1) {
            setGameWin(true);
          }
          
          return { ...prev, x: nx, y: ny, power };
        }
        return prev;
      });

      // Move ghosts
      setGhosts(prev => {
        return prev.map(ghost => {
          const newGhost = { ...ghost };
          newGhost.move(map, pacman);
          
          // Check for collision with pacman
          if (newGhost.x === pacman.x && newGhost.y === pacman.y) {
            if (pacman.power) {
              // Pacman eats ghost
              setScore(s => s + 200);
              // Reset ghost position
              newGhost.x = 7 + Math.floor(Math.random() * 2);
              newGhost.y = 5 + Math.floor(Math.random() * 2);
              newGhost.scared = false;
            } else {
              // Ghost catches pacman
              setLives(l => {
                if (l <= 1) {
                  setGameOver(true);
                  return 0;
                }
                return l - 1;
              });
              // Reset pacman position
              setPacman(p => ({ ...p, x: 1, y: 1 }));
            }
          }
          
          return newGhost;
        });
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameOver, gameWin, pellets, pacman]);

  // 🎨 Draw canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw map
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
        } else if (cell === 3) {
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            8,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      });
    });

    // Draw ghosts
    ghosts.forEach(ghost => {
      ctx.fillStyle = ghost.scared ? "blue" : ghost.color;
      ctx.beginPath();
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE / 2,
        ghost.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw pacman
    ctx.fillStyle = pacman.power ? "#7cffd9" : "yellow";
    ctx.beginPath();
    
    // Create Pac-Man mouth based on direction
    let startAngle, endAngle;
    switch(pacman.dir) {
      case "RIGHT":
        startAngle = 0.2 * Math.PI;
        endAngle = 1.8 * Math.PI;
        break;
      case "LEFT":
        startAngle = 1.2 * Math.PI;
        endAngle = 2.8 * Math.PI;
        break;
      case "UP":
        startAngle = 1.7 * Math.PI;
        endAngle = 3.3 * Math.PI;
        break;
      case "DOWN":
        startAngle = 0.7 * Math.PI;
        endAngle = 2.3 * Math.PI;
        break;
      default:
        startAngle = 0;
        endAngle = 2 * Math.PI;
    }
    
    ctx.arc(
      pacman.x * TILE_SIZE + TILE_SIZE / 2,
      pacman.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2,
      startAngle,
      endAngle
    );
    ctx.lineTo(
      pacman.x * TILE_SIZE + TILE_SIZE / 2,
      pacman.y * TILE_SIZE + TILE_SIZE / 2
    );
    ctx.fill();
  }, [pacman, ghosts, score]);

  // 🏆 Game Over handling
  useEffect(() => {
    if (gameOver || gameWin) {
      onHighScore(score);
      saveScore(playerName, score).then(() => {
        getLeaderboard().then(data => {
          // Sort by score descending and take top 5
          const sorted = data.sort((a, b) => b.score - a.score).slice(0, 5);
          setLeaderboard(sorted);
        });
      });
    }
  }, [gameOver, gameWin, score, playerName, onHighScore]);

  return (
    <div className="game-container">
      <h1>Pacman 🟡</h1>
      <div className="hud">
        <div>Score: {score}</div>
        <div>Lives: {"🍒".repeat(lives)}</div>
        {pacman.power && <div>Power: {powerTimer}s</div>}
      </div>

      <div className="game-board">
        {!gameOver && !gameWin && (
          <canvas
            ref={canvasRef}
            width={map[0].length * TILE_SIZE}
            height={map.length * TILE_SIZE}
            className="border border-gray-400"
          />
        )}

        {/* Touch area for swipe controls */}
        <div className="swipe-area"></div>
      </div>

      {/* Directional buttons */}
      <div className="controls">
        <div className="row">
          <button onClick={() => handleDirectionChange("UP")}>↑</button>
        </div>
        <div className="row">
          <button onClick={() => handleDirectionChange("LEFT")}>←</button>
          <button onClick={() => handleDirectionChange("DOWN")}>↓</button>
          <button onClick={() => handleDirectionChange("RIGHT")}>→</button>
        </div>
        <div className="toolbar">
          <button onClick={onExit}>Exit</button>
          <button onClick={() => window.location.reload()}>Restart</button>
        </div>
      </div>

      {(gameOver || gameWin) && (
        <div className="mt-4">
          <h2 className="text-xl font-bold">{gameWin ? "🎉 You Win!" : "Game Over"}</h2>
          <p>Your Score: {score}</p>

          <div className="mt-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="name-input"
              placeholder="Enter your name"
            />
          </div>

          <h3 className="mt-4 text-lg font-semibold">🏆 Leaderboard</h3>
          <div className="leaderboard">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, i) => (
                <div key={i} className="leaderboard-item">
                  <span>{i + 1}. {entry.name}</span>
                  <span>{entry.score}</span>
                </div>
              ))
            ) : (
              <p>Loading leaderboard...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}