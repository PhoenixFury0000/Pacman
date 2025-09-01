import React, { useEffect, useState } from "react";
import Game from "./Game";

export default function App() {
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const hs = Number(localStorage.getItem("pacman_highscore") || 0);
    setHighScore(hs);
  }, []);

  const updateHighScore = (score) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("pacman_highscore", score);
    }
  };

  return (
    <div className="app">
      {!started ? (
        <div className="menu">
          <h1>PAC-MAN MOBILE</h1>
          <p className="sub">SWIPE OR USE BUTTONS TO MOVE</p>
          <p className="high">🏆 HIGH SCORE: {highScore}</p>
          <button className="primary" onClick={() => setStarted(true)}>
            START GAME
          </button>
        </div>
      ) : (
        <Game 
          onExit={() => setStarted(false)} 
          onHighScore={updateHighScore} 
        />
      )}
    </div>
  );
}