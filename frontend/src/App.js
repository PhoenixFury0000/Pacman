import React, { useState, useEffect } from "react";
import Game from "./Game";

export default function App() {
  const [username, setUsername] = useState("");
  const [player, setPlayer] = useState(null);

  const handleStart = async () => {
    const res = await fetch("http://localhost:5000/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setPlayer(data);
  };

  return (
    <div>
      {!player ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Pac-Man</h1>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleStart}>Start Game</button>
        </div>
      ) : (
        <Game player={player} setPlayer={setPlayer} />
      )}
    </div>
  );
}