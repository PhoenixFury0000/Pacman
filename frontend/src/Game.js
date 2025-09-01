import React, { useEffect, useMemo, useRef, useState } from "react";
import { maps20 } from "./maps";

/**
 * Cell legend:
 * W = Wall
 * . = Dot
 * o = Power potion
 * P = Player start
 * G = Ghost start
 * ' ' = Empty
 */

const CELL_MS = 120;         // player step speed
const GHOST_MS = 380;        // ghost step speed
const POWER_TIME = 5000;     // 5s power mode

export default function Game({ onExit, onHighScore }) {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [powered, setPowered] = useState(false);
  const [powerLeft, setPowerLeft] = useState(0);
  const powerTimerRef = useRef(null);

  const rawMap = useMemo(() => maps20[level].map(row => row.split("")), [level]);

  // locate P and G from map
  const findPositions = (grid) => {
    let player = {x:0,y:0};
    const ghosts = [];
    grid.forEach((row, y) => {
      row.forEach((c, x) => {
        if (c === "P") player = {x, y};
        if (c === "G") ghosts.push({x, y});
      });
    });
    return { player, ghosts };
  };

  const [grid, setGrid] = useState(rawMap);
  const initPositions = useMemo(() => findPositions(rawMap), [rawMap]);
  const [player, setPlayer] = useState(initPositions.player);
  const [ghosts, setGhosts] = useState(initPositions.ghosts);

  // touch swipe detection
  const touchStart = useRef({x:0,y:0});
  const [queuedDir, setQueuedDir] = useState(null);

  const width = grid[0].length;
  const height = grid.length;

  const canMove = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    return grid[y][x] !== "W";
  };

  // consume item at cell
  const eatCell = (x, y) => {
    const c = grid[y][x];
    if (c === "." || c === "o" || c === "P" || c === "G" || c === " ") return c;
    return c;
  };

  // handle power mode
  const startPower = () => {
    clearInterval(powerTimerRef.current);
    setPowered(true);
    setPowerLeft(POWER_TIME);
    const t0 = Date.now();
    powerTimerRef.current = setInterval(() => {
      const left = Math.max(0, POWER_TIME - (Date.now() - t0));
      setPowerLeft(left);
      if (left <= 0) {
        clearInterval(powerTimerRef.current);
        setPowered(false);
      }
    }, 100);
  };

  // step player by direction
  const stepPlayer = (dir) => {
    if (!dir) return;
    const d = {up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];
    const nx = player.x + d[0], ny = player.y + d[1];
    if (!canMove(nx, ny)) return;

    const nextCell = grid[ny][nx];
    // mutate a copy
    const g2 = grid.map(r=>r.slice());
    // clear start markers visually
    if (g2[player.y][player.x] === "P") g2[player.y][player.x] = " ";
    if (nextCell === ".") setScore(s=>s+10);
    if (nextCell === "o") { setScore(s=>s+50); startPower(); }
    if (nextCell === "." || nextCell === "o") g2[ny][nx] = " ";

    setGrid(g2);
    setPlayer({x:nx,y:ny});
  };

  // queued movement loop (makes buttons/swipes feel smooth)
  useEffect(() => {
    const id = setInterval(() => {
      if (queuedDir) stepPlayer(queuedDir);
    }, CELL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [queuedDir, player, grid]);

  // ghost loop
  useEffect(() => {
    const dirs = [
      {x:0,y:-1, name:"up"},
      {x:0,y:1,  name:"down"},
      {x:-1,y:0, name:"left"},
      {x:1,y:0,  name:"right"}
    ];
    const chase = (g) => {
      // 35% chase toward player else random
      if (Math.random() < 0.35) {
        let best = null, bestDist = 1e9;
        dirs.forEach(d => {
          const nx = g.x + d.x, ny = g.y + d.y;
          if (!canMove(nx, ny)) return;
          const dist = Math.abs(nx - player.x) + Math.abs(ny - player.y);
          if (dist < bestDist) { bestDist = dist; best = {x:nx,y:ny}; }
        });
        return best || g;
      } else {
        const shuffled = dirs.sort(()=>Math.random()-0.5);
        for (const d of shuffled) {
          const nx = g.x + d.x, ny = g.y + d.y;
          if (canMove(nx, ny)) return {x:nx,y:ny};
        }
        return g;
      }
    };

    const id = setInterval(() => {
      setGhosts(prev => {
        const moved = prev.map(g => chase(g));
        // collisions
        let pl = {...player};
        let lv = lives;
        let sc = 0;
        const respawn = initPositions.ghosts[0] || {x:1,y:1};

        for (let i=0;i<moved.length;i++){
          const g = moved[i];
          if (g.x === pl.x && g.y === pl.y) {
            if (powered) {
              // eat ghost
              moved[i] = {...respawn};
              sc += 200;
            } else {
              // lose life
              if (lv > 1) {
                lv -= 1;
                pl = {...initPositions.player};
                setPlayer(pl);
                moved[i] = {...respawn};
              } else {
                // game over
                const hs = Number(localStorage.getItem("pacman_highscore")||0);
                const finalHS = Math.max(hs, score);
                localStorage.setItem("pacman_highscore", String(finalHS));
                onHighScore?.(finalHS);
                alert("💀 Game Over!");
                // reset all
                setLevel(0);
                const m0 = maps20[0].map(r=>r.split(""));
                setGrid(m0);
                const p0 = findPositions(m0);
                setPlayer(p0.player);
                setGhosts(p0.ghosts);
                setScore(0);
                setLives(3);
                setPowered(false);
                setQueuedDir(null);
                return moved;
              }
            }
          }
        }
        if (sc) setScore(s=>s+sc);
        if (lv !== lives) setLives(lv);
        return moved;
      });
    }, GHOST_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [player, powered, lives, level, grid]);

  // next level when dots finished
  useEffect(() => {
    const left = grid.flat().some(c => c === "." || c === "o");
    if (!left) {
      const next = (level + 1) % maps20.length;
      setLevel(next);
      const nm = maps20[next].map(r=>r.split(""));
      setGrid(nm);
      const p = findPositions(nm);
      setPlayer(p.player);
      setGhosts(p.ghosts);
      // small bonus
      setScore(s=>s+500);
      setPowered(false);
      setQueuedDir(null);
    }
    // eslint-disable-next-line
  }, [grid]);

  // update high score
  useEffect(() => {
    const hs = Number(localStorage.getItem("pacman_highscore") || 0);
    if (score > hs) {
      localStorage.setItem("pacman_highscore", String(score));
      onHighScore?.(score);
    }
  }, [score, onHighScore]);

  // touch handlers
  const onTouchStart = (e) => {
    const t = e.changedTouches[0];
    touchStart.current = {x: t.clientX, y: t.clientY};
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // tap ignore
    if (Math.abs(dx) > Math.abs(dy)) {
      setQueuedDir(dx > 0 ? "right" : "left");
    } else {
      setQueuedDir(dy > 0 ? "down" : "up");
    }
  };

  // UI helpers
  const setDir = (d) => setQueuedDir(d);
  const powerSeconds = Math.ceil(powerLeft/100) / 10;

  const cellSize = "min(6vw, 28px)"; // responsive cell size

  return (
    <div className="game" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="hud">
        <span>❤️ {lives}</span>
        <span>⭐ {score}</span>
        <span>🗺️ {level+1}/{maps20.length}</span>
        {powered && <span>⚡ {powerSeconds.toFixed(1)}s</span>}
      </header>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize})`,
          gridTemplateRows: `repeat(${height}, ${cellSize})`
        }}
      >
        {grid.map((row,y)=>
          row.map((c,x)=>{
            const key = `${x}-${y}`;
            // player / ghosts
            if (player.x===x && player.y===y) {
              return <div key={key} className={`cell pac ${powered?'pow':''}`}/>;
            }
            const ghostHere = ghosts.find(g=>g.x===x && g.y===y);
            if (ghostHere) {
              return <div key={key} className={`cell ghost ${powered?'scared':''}`}/>;
            }
            if (c==="W") return <div key={key} className="cell wall"/>;
            if (c===".") return <div key={key} className="cell dot"/>;
            if (c==="o") return <div key={key} className="cell potion"/>;
            return <div key={key} className="cell"/>;
          })
        )}
      </div>

      <div className="controls">
        <button onClick={()=>setDir("up")} aria-label="Up">⬆️</button>
        <div className="row">
          <button onClick={()=>setDir("left")} aria-label="Left">⬅️</button>
          <button onClick={()=>setDir("down")} aria-label="Down">⬇️</button>
          <button onClick={()=>setDir("right")} aria-label="Right">➡️</button>
        </div>
        <div className="toolbar">
          <button onClick={()=>{
            onExit?.();
          }}>🏠 Menu</button>
          <button onClick={()=>{
            // soft reset level
            const nm = maps20[level].map(r=>r.split(""));
            setGrid(nm);
            const p = findPositions(nm);
            setPlayer(p.player);
            setGhosts(p.ghosts);
            setPowered(false);
            setQueuedDir(null);
          }}>🔁 Reset Level</button>
        </div>
      </div>
    </div>
  );
}