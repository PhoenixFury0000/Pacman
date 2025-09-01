import React, { useEffect, useState } from "react";
import Game from "./Game";

export default function App() {
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const hs = Number(localStorage.getItem("pacman_highscore") || 0);
    setHighScore(hs);
  }, []);

  return (
    <div className="app">
      {!started ? (
        <div className="menu">
          <h1>Pac-Man Mobile</h1>
          <p className="sub">Touch controls • Swipe to move</p>
          <p className="high">🏆 High Score: {highScore}</p>
          <button className="primary" onClick={() => setStarted(true)}>Start</button>
        </div>
      ) : (
        <Game onExit={() => setStarted(false)} onHighScore={(hs)=>setHighScore(hs)} />
      )}
    </div>
  );
}