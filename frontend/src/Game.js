// inside Game.js
useEffect(() => {
  if (player) {
    fetch(`http://localhost:5000/api/players/${player._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, level: level + 1, lives }),
    });
  }
}, [score, lives, level]);