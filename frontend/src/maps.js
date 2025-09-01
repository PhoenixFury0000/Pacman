// Base 15x15 map with clear paths, walls, dots, potions, and spawn points.
const base = [
  "WWWWWWWWWWWWWWW",
  "W....o....o...W",
  "W.WWWW.WWWWW.WW",
  "W.W...W...W..GW",
  "W.W.W.W.W.W.W.W",
  "W...o...P...o.W",
  "WWW.WWWWWWW.WWW",
  "W.............W",
  "WWW.WWWWWWW.WWW",
  "W.o...G...o...W",
  "W.W.W.W.W.W.W.W",
  "W..W...W...W..W",
  "WW.WWW.WWW.WW.W",
  "W....o....o...W",
  "WWWWWWWWWWWWWWW"
];

// Helpers to create variations
const rotate = (m) => {
  const H = m.length, W = m[0].length;
  const out = Array.from({length: W}, () => Array(H).fill(" "));
  for (let y=0;y<H;y++) for (let x=0;x<W;x++) out[x][H-1-y] = m[y][x];
  return out.map(r=>r.join(""));
};
const mirrorH = (m) => m.map(r => r.split("").reverse().join(""));
const mirrorV = (m) => m.slice().reverse();

// tweak pellets by replacing some spaces with dots
const sprinkle = (m, seed=1) => {
  const rng = mulberry32(seed);
  return m.map(row => row.split("").map(c=>{
    if (c===" " && rng()<0.08) return ".";
    return c;
  }).join(""));
};

function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

const toGrid = (arr) => arr.map(r => r);

// Build 20 maps: base + transforms
const m0 = toGrid(base);
const m1 = mirrorH(m0);
const m2 = mirrorV(m0);
const m3 = rotate(m0);
const m4 = rotate(m1);
const m5 = rotate(m2);
const m6 = mirrorH(m3);
const m7 = mirrorV(m3);
const m8 = sprinkle(m0, 2);
const m9 = sprinkle(m1, 3);
const m10 = sprinkle(m2, 4);
const m11 = sprinkle(m3, 5);
const m12 = sprinkle(m4, 6);
const m13 = sprinkle(m5, 7);
const m14 = sprinkle(m6, 8);
const m15 = sprinkle(m7, 9);
const m16 = rotate(m8);
const m17 = mirrorH(m9);
const m18 = mirrorV(m10);
const m19 = rotate(m11);

export const maps20 = [
  m0,m1,m2,m3,m4,
  m5,m6,m7,m8,m9,
  m10,m11,m12,m13,m14,
  m15,m16,m17,m18,m19
];