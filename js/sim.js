// Tunik — top-down tunnel duel.
// Both ducks share one rule set: digging resists, shots chew faster and cost more
// life, life drains on its own, and only your own shelter refills it.
// Armor rearms only when life reaches 100%.

export const COLS = 76;
export const ROWS = 42;
export const TILE = 28;

export const AIR = 0;
export const SOIL = 1;
export const CLAY = 2;
export const ROCK = 3;
export const WALL = 4;
export const PAD = 5;
export const SAND = 6;
export const GRAVEL = 7;

export const WINS_OPTIONS = [3, 5, 8];

export const SHOT_COST = 5.1;
export const HIT_GRACE = 0.25;

export const DIRS = [
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
];

const DIR_INDEX = {
  "0,-1": 0,
  "1,-1": 1,
  "1,0": 2,
  "1,1": 3,
  "0,1": 4,
  "-1,1": 5,
  "-1,0": 6,
  "-1,-1": 7,
};

const DIG = {
  [SAND]: { time: 0.12, cost: 1.3, name: "písek", density: 1, pen: 1 },
  [SOIL]: { time: 0.2, cost: 2.5, name: "hlína", density: 2, pen: 1 },
  [CLAY]: { time: 0.34, cost: 4.4, name: "jíl", density: 4, pen: 2 },
  [GRAVEL]: { time: 0.5, cost: 6.2, name: "štěrk", density: 6, pen: 2 },
  [ROCK]: { time: 0.72, cost: 8.4, name: "skála", density: 9, pen: 3 },
};

export function densityOf(cell) {
  return DIG[cell]?.density ?? 0;
}

const ARMOR_TIME = [0, 20, 36];
const ARMOR_ABSORB = [0, 0.65, 0.8];

export const DIFFICULTIES = {
  easy: {
    id: "easy",
    name: "Lehká",
    drain: 1.65,
    regen: 9,
    dig: 0.85,
    dmg: 0.8,
    think: 0.62,
    hear: 13,
    radar: 7.5,
    rocks: 3,
    enemyArmor: 0,
    mix: [0.36, 0.38, 0.16, 0.07, 0.03],
    pillar: 6,
    pillarKeep: 0.38,
    blurb: "Měkčí zem, slabší zásahy a rychlejší návrat života.",
  },
  normal: {
    id: "normal",
    name: "Normální",
    drain: 2.25,
    regen: 6.5,
    dig: 1,
    dmg: 1,
    think: 0.4,
    hear: 18,
    radar: 4.2,
    rocks: 6,
    enemyArmor: 0,
    mix: [0.12, 0.34, 0.24, 0.18, 0.12],
    pillar: 5,
    pillarKeep: 0.72,
    blurb: "Vyrovnaná honička. Soupeř se dobíjí ve svém krytu stejně jako ty.",
  },
  hard: {
    id: "hard",
    name: "Těžká",
    drain: 2.75,
    regen: 5.2,
    dig: 1.15,
    dmg: 1.15,
    think: 0.28,
    hear: 22,
    radar: 2.3,
    rocks: 9,
    enemyArmor: 1,
    mix: [0.05, 0.22, 0.22, 0.26, 0.25],
    pillar: 4,
    pillarKeep: 0.88,
    blurb: "Tvrdší zem, bystřejší soupeř a jeho vlastní krátký pancíř.",
  },
};

export const SHOP = [
  {
    id: "power",
    cost: 2,
    max: 3,
    name: "Účinnost střelby",
    blurb: "Míček projede víc polí a sebere víc života.",
  },
  {
    id: "rate",
    cost: 2,
    max: 3,
    name: "Rychlost střelby",
    blurb: "Kratší pauza mezi golfovými míčky.",
  },
  {
    id: "armor",
    cost: 4,
    max: 2,
    name: "Pancíř",
    blurb: "Po dobití na 100 % chrání delší dobu. Zásah schytá hlavně on.",
  },
];

const FOUR = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function duckLevel(upgrades) {
  return 1 + upgrades.power + upgrades.rate + upgrades.armor;
}

export function shotPen(power) {
  return 2 + power;
}

export function shotDamage(power) {
  return 30 * (1 + 0.22 * power);
}

export function fireCooldown(rate) {
  return 0.5 * Math.pow(0.76, rate);
}

export function describeLoadout(upgrades) {
  const p = upgrades.power;
  const r = upgrades.rate;
  const a = upgrades.armor;
  return {
    pen: shotPen(p),
    dmg: Math.round(shotDamage(p)),
    cool: Math.round(fireCooldown(r) * 100) / 100,
    armor: a
      ? { seconds: ARMOR_TIME[a], absorb: Math.round(ARMOR_ABSORB[a] * 100) }
      : null,
    nextPower:
      p < 3
        ? { pen: shotPen(p + 1), dmg: Math.round(shotDamage(p + 1)) }
        : null,
    nextRate: r < 3 ? Math.round(fireCooldown(r + 1) * 100) / 100 : null,
    nextArmor:
      a < 2
        ? {
            seconds: ARMOR_TIME[a + 1],
            absorb: Math.round(ARMOR_ABSORB[a + 1] * 100),
          }
        : null,
  };
}

export function createMatch(opts = {}) {
  const seed = (opts.seed ?? 1) >>> 0;
  const difficulty = DIFFICULTIES[opts.difficulty] ? opts.difficulty : "normal";
  const winsNeeded = WINS_OPTIONS.includes(opts.winsNeeded) ? opts.winsNeeded : 3;
  const match = {
    seed,
    difficulty,
    diff: { ...DIFFICULTIES[difficulty] },
    winsNeeded,
    wins: 0,
    losses: 0,
    victor: null,
    round: 1,
    roundScale: 1,
    points: 0,
    upgrades: { power: 0, rate: 0, armor: 0 },
    phase: "play",
    type: new Uint8Array(COLS * ROWS),
    pad: new Uint8Array(COLS * ROWS),
    rock: new Uint8Array(COLS * ROWS),
    seen: new Uint8Array(COLS * ROWS),
    lit: new Uint8Array(COLS * ROWS),
    balls: [],
    events: [],
    grace: 1.45,
    time: 0,
    roundTime: 0,
    noise: null,
    rumor: null,
    shotCue: null,
    banner: "",
    bannerT: 0,
    player: null,
    enemy: null,
  };
  buildMap(match, mulberry32(seed));
  return match;
}

export function buy(match, id) {
  if (match.phase !== "shop") return { ok: false, reason: "Obchod je mezi koly." };
  const item = SHOP.find((entry) => entry.id === id);
  if (!item) return { ok: false, reason: "Neznámá věc." };
  if (match.upgrades[id] >= item.max) return { ok: false, reason: "Výš už to nejde." };
  if (match.points < item.cost) return { ok: false, reason: "Málo bodů." };
  match.points -= item.cost;
  match.upgrades[id] += 1;
  pushEvent(match, { t: "buy", id });
  return { ok: true };
}

export function startNextRound(match) {
  if (match.phase !== "shop" && match.phase !== "between") return false;
  match.round += 1;
  const growth = match.difficulty === "easy" ? 0.035 : 0.07;
  match.roundScale = Math.min(1.55, 1 + (match.round - 1) * growth);
  match.balls = [];
  match.events = [];
  match.grace = 1.45;
  match.time = 0;
  match.phase = "play";
  match.noise = null;
  match.rumor = null;
  match.shotCue = null;
  buildMap(match, mulberry32((match.seed + match.round * 9973) >>> 0));
  return true;
}

export function strike(match, target, raw) {
  if (!target || target.energy <= 0 || target.hitGrace > 0) return 0;
  let amount = raw;
  if (target.armorT > 0 && target.armorLevel > 0) {
    const absorb = ARMOR_ABSORB[target.armorLevel] || 0;
    amount = raw * (1 - absorb);
    pushEvent(match, {
      t: "armor",
      x: target.tx,
      y: target.ty,
      amount: raw - amount,
    });
  }
  target.energy -= amount;
  target.hitGrace = HIT_GRACE;
  pushEvent(match, {
    t: "hit",
    x: target.tx,
    y: target.ty,
    amount,
    kind: target.kind,
  });
  return amount;
}

export function fighterPixel(f) {
  const t = f.moving ? Math.min(1, f.mt) : 1;
  const x = f.moving ? f.ax + (f.bx - f.ax) * t : f.tx;
  const y = f.moving ? f.ay + (f.by - f.ay) * t : f.ty;
  return { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
}

export function step(match, input, dt) {
  let left = Math.max(0, dt);
  let guard = 0;
  while (left > 1e-6 && guard++ < 240) {
    const h = Math.min(left, 1 / 60);
    stepOnce(match, input, h);
    left -= h;
    if (match.phase !== "play") break;
  }
}

export function wishFromInput(input) {
  const x = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const y = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  if (x === 0 && y === 0) return null;
  return DIR_INDEX[`${x},${y}`];
}

function stepOnce(match, input, dt) {
  if (match.phase !== "play") return;
  match.time += dt;
  match.roundTime += dt;
  if (match.grace > 0) match.grace = Math.max(0, match.grace - dt);
  if (match.bannerT > 0) match.bannerT = Math.max(0, match.bannerT - dt);
  const drainOn = match.grace <= 0;

  const player = match.player;
  const wish = wishFromInput(input);
  player.wish = wish;
  if (wish != null) player.facing = wish;
  player.wantShot = !!input.shoot;

  ai(match, dt);

  updateFighter(match, player, dt, drainOn, 1);
  if (match.phase !== "play") return;
  updateFighter(match, match.enemy, dt, drainOn, 1);
  if (match.phase !== "play") return;
  updateBalls(match, dt);
  resolveDeaths(match);
  if (match.phase !== "play") return;
  revealFrom(match, match.player);
  if (match.noise) {
    match.noise.ttl -= dt;
    if (match.noise.ttl <= 0) match.noise = null;
  }
  if (match.rumor) {
    match.rumor.ttl -= dt;
    if (match.rumor.ttl <= 0) match.rumor = null;
  }
  if (match.shotCue) {
    match.shotCue.ttl -= dt;
    if (match.shotCue.ttl <= 0) match.shotCue = null;
  }
}

function updateFighter(match, f, dt, drainOn, speedMul) {
  if (f.energy <= 0) return;
  if (f.hitGrace > 0) {
    f.hitGrace -= dt;
    if (f.hitGrace < 0.001) f.hitGrace = 0;
  }
  f.cool = Math.max(0, f.cool - dt);
  const onPad = onOwnPad(match, f);
  if (f.armorT > 0 && !onPad && drainOn) f.armorT = Math.max(0, f.armorT - dt);

  if (onPad) {
    const prev = f.energy;
    f.energy = Math.min(100, f.energy + match.diff.regen * dt);
    if (prev < 99.5 && f.energy >= 100) rearm(match, f);
  } else if (drainOn) {
    f.energy -= match.diff.drain * dt;
  }

  if (f.moving) {
    f.mt += dt / f.dur;
    if (f.mt >= 1) {
      f.mt = 1;
      f.moving = false;
      f.tx = f.bx;
      f.ty = f.by;
    }
  } else if (f.wish != null) {
    tryMoveOrDig(match, f, dt, speedMul);
  } else {
    f.digging = false;
    f.digT = 0;
    f.lowPower = false;
  }

  if (f.wantShot && (f.kind === "player" || match.grace <= 0)) tryShoot(match, f);
  f.wantShot = false;
}

function tryMoveOrDig(match, f, dt, speedMul) {
  const d = DIRS[f.wish];
  const nx = f.tx + d.x;
  const ny = f.ty + d.y;
  if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) {
    f.digging = false;
    return;
  }
  const id = ny * COLS + nx;
  const cell = match.type[id];
  if (cell === WALL) {
    f.digging = false;
    f.digT = 0;
    f.lowPower = false;
    return;
  }
  if (cell === AIR || cell === PAD) {
    f.digging = false;
    f.digT = 0;
    f.lowPower = false;
    if (d.x && d.y) {
      const sideA = match.type[f.ty * COLS + nx];
      const sideB = match.type[ny * COLS + f.tx];
      if (sideA === WALL && sideB === WALL) return;
    }
    const diag = d.x !== 0 && d.y !== 0;
    startMove(f, nx, ny, (diag ? 0.16 : 0.12) / speedMul);
    return;
  }

  const info = DIG[cell];
  if (!info) return;
  if (!f.digging || f.digX !== nx || f.digY !== ny) {
    f.digging = true;
    f.digX = nx;
    f.digY = ny;
    f.digT = 0;
    f.digName = `${info.name} · hustota ${info.density}`;
  }
  const cost = info.cost * match.diff.dig;
  if (f.energy <= cost + 0.05) {
    f.lowPower = true;
    return;
  }
  f.lowPower = false;
  f.digNeed = (info.time * match.diff.dig) / speedMul;
  f.digT += dt;
  if (f.digT < f.digNeed) return;

  f.energy -= cost;
  clearCell(match, nx, ny);
  f.digging = false;
  f.digT = 0;
  pushEvent(match, { t: "dig", x: nx, y: ny, kind: f.kind });
  if (f.kind === "player") match.noise = { x: nx, y: ny, ttl: 1.4, kind: "player" };
  else if (!match.lit[ny * COLS + nx]) match.rumor = { x: nx, y: ny, ttl: 1.15 };
  startMove(f, nx, ny, 0.08 / speedMul);
}

function startMove(f, nx, ny, dur) {
  f.moving = true;
  f.ax = f.tx;
  f.ay = f.ty;
  f.bx = nx;
  f.by = ny;
  f.mt = 0;
  f.dur = Math.max(0.04, dur);
}

function tryShoot(match, f) {
  if (f.cool > 0) return false;
  if (f.energy <= SHOT_COST + 0.35) return false;
  f.energy -= SHOT_COST;
  const rate = f.kind === "player" ? match.upgrades.rate : 0;
  f.cool = fireCooldown(rate);
  const power = f.kind === "player" ? match.upgrades.power : 0;
  const d = DIRS[f.facing];
  const len = Math.hypot(d.x, d.y) || 1;
  const pos = fighterPixel(f);
  const speed = 360;
  match.balls.push({
    x: pos.x + (d.x / len) * 16,
    y: pos.y + (d.y / len) * 16,
    vx: (d.x / len) * speed,
    vy: (d.y / len) * speed,
    age: 0,
    pen: shotPen(power),
    dmg: ballDamage(match, f, power),
    owner: f.kind,
    tx: -99,
    ty: -99,
  });
  pushEvent(match, { t: "shoot", x: f.tx, y: f.ty, kind: f.kind });
  if (f.kind === "player") match.noise = { x: f.tx, y: f.ty, ttl: 1.6, kind: "player" };
  else if (!match.lit[f.ty * COLS + f.tx]) match.shotCue = { x: f.tx, y: f.ty, ttl: 1.15 };
  return true;
}

function ballDamage(match, f, power) {
  let dmg = shotDamage(power);
  if (f.kind === "enemy") dmg *= match.diff.dmg;
  return dmg;
}

function updateBalls(match, dt) {
  for (let i = match.balls.length - 1; i >= 0; i--) {
    const b = match.balls[i];
    b.age += dt;
    if (b.age > 2.35) {
      match.balls.splice(i, 1);
      continue;
    }
    const dist = Math.hypot(b.vx, b.vy) * dt;
    const steps = Math.max(1, Math.ceil(dist / 4));
    const hdt = dt / steps;
    let dead = false;
    for (let s = 0; s < steps; s++) {
      b.x += b.vx * hdt;
      b.y += b.vy * hdt;
      const tx = Math.floor(b.x / TILE);
      const ty = Math.floor(b.y / TILE);
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) {
        dead = true;
        break;
      }
      if (tx !== b.tx || ty !== b.ty) {
        b.tx = tx;
        b.ty = ty;
        const id = ty * COLS + tx;
        const cell = match.type[id];
        if (cell !== AIR && cell !== PAD) {
          if (chew(match, b, tx, ty, cell, id)) {
            dead = true;
            break;
          }
        }
      }
      const hit = fighterAt(match, b);
      if (hit) {
        strike(match, hit, b.dmg);
        dead = true;
        break;
      }
    }
    if (dead) match.balls.splice(i, 1);
  }
}

function chew(match, b, tx, ty, cell, id) {
  if (cell === WALL) return true;
  const info = DIG[cell];
  if (!info) return false;
  if (cell === ROCK) {
    match.rock[id] -= 1;
    pushEvent(match, { t: "chip", x: tx, y: ty });
    if (match.rock[id] <= 0) clearCell(match, tx, ty);
    return true;
  }
  if (b.pen >= info.pen) {
    clearCell(match, tx, ty);
    b.pen -= info.pen;
    pushEvent(match, { t: "chip", x: tx, y: ty });
    return b.pen <= 0;
  }
  if (cell === CLAY || cell === GRAVEL) {
    match.type[id] = SOIL;
    b.pen = 0;
    pushEvent(match, { t: "chip", x: tx, y: ty });
  }
  return true;
}

function fighterAt(match, b) {
  for (const f of [match.player, match.enemy]) {
    if (!f || f.kind === b.owner || f.energy <= 0) continue;
    const p = fighterPixel(f);
    if (Math.hypot(p.x - b.x, p.y - b.y) < TILE * 0.34) return f;
  }
  return null;
}

function resolveDeaths(match) {
  if (match.phase !== "play") return;
  if (match.player.energy <= 0) {
    match.player.energy = 0;
    match.player.alive = false;
    match.losses += 1;
    match.phase = match.losses >= match.winsNeeded ? "over" : "between";
    if (match.phase === "over") match.victor = "enemy";
    pushEvent(match, { t: "boom", x: match.player.tx, y: match.player.ty, kind: "player" });
    return;
  }
  if (match.enemy.energy <= 0) {
    match.enemy.energy = 0;
    match.enemy.alive = false;
    match.wins += 1;
    match.points += 2;
    match.phase = match.wins >= match.winsNeeded ? "over" : "shop";
    if (match.phase === "over") match.victor = "player";
    pushEvent(match, { t: "boom", x: match.enemy.tx, y: match.enemy.ty, kind: "enemy" });
  }
}

function onOwnPad(match, f) {
  const id = f.ty * COLS + f.tx;
  const owner = f.kind === "player" ? 1 : 2;
  return match.pad[id] === owner;
}

function rearm(match, f) {
  const level = f.kind === "player" ? match.upgrades.armor : match.diff.enemyArmor;
  f.armorLevel = level;
  f.armorT = ARMOR_TIME[level] || 0;
}

function ai(match, dt) {
  const e = match.enemy;
  const p = match.player;
  if (e.energy <= 0) return;
  e.think -= dt;
  const see = clearLine(match.type, e.tx, e.ty, p.tx, p.ty);
  const dist = Math.hypot(e.tx - p.tx, e.ty - p.ty);
  if (see && dist < 16) e.memory = { x: p.tx, y: p.ty };
  if (match.noise && match.noise.kind === "player" && match.noise.ttl > 0) {
    const nd = Math.hypot(e.tx - match.noise.x, e.ty - match.noise.y);
    if (nd <= match.diff.hear) e.memory = { x: match.noise.x, y: match.noise.y };
  }

  const onPad = onOwnPad(match, e);
  const low = e.energy < 34;
  const veryLow = e.energy < 16;
  let mode = "hunt";
  if (onPad && e.energy < 99.2 && !(see && dist < 6)) mode = "charge";
  else if (veryLow || (low && !see)) mode = "home";
  else if (see && dist < 11) mode = "fight";
  else if (e.memory) mode = "hunt";
  else mode = "search";

  if (e.memory && e.tx === e.memory.x && e.ty === e.memory.y && !see) {
    e.memory = null;
    if (mode === "hunt") mode = "search";
  }
  e.mode = mode;

  if (e.tx === e.lastX && e.ty === e.lastY && e.wish != null && !e.moving && !e.digging) e.stuck += dt;
  else e.stuck = 0;
  e.lastX = e.tx;
  e.lastY = e.ty;
  if (e.stuck > 1.35) {
    e.path = [];
    e.pathAge = 0;
    e.stuck = 0;
    e.search = null;
    if (mode !== "fight") e.memory = null;
  }

  if (mode === "fight") {
    e.facing = facingToward(e.tx, e.ty, p.tx, p.ty);
    e.wantShot = match.grace <= 0 && see && dist < 12;
    e.wish = dist > 3.2 ? greedyDir(match, e, p.tx, p.ty) : null;
    if (e.wish != null) e.facing = facingToward(e.tx, e.ty, p.tx, p.ty);
    return;
  }
  if (mode === "charge") {
    e.wish = null;
    e.wantShot = false;
    return;
  }

  let goal = mode === "home" ? { x: e.homeX, y: e.homeY } : e.memory;
  if (mode === "search") goal = searchGoal(match, e, dt);
  if (!goal) {
    e.wish = null;
    return;
  }
  if (e.tx === goal.x && e.ty === goal.y) {
    e.wish = null;
    if (mode === "search") e.search = null;
    return;
  }

  e.pathAge -= dt;
  const need =
    !e.path ||
    !e.path.length ||
    e.pathAge <= 0 ||
    e.goalX !== goal.x ||
    e.goalY !== goal.y;
  if (need && e.think <= 0) {
    e.path = findPath(match.type, e.tx, e.ty, goal.x, goal.y) || [];
    e.pathAge = 0.6;
    e.goalX = goal.x;
    e.goalY = goal.y;
    e.think = match.diff.think / match.roundScale;
  }

  if (e.path && e.path.length && e.path[0].x === e.tx && e.path[0].y === e.ty) e.path.shift();
  if (!e.path || !e.path.length) {
    e.wish = greedyDir(match, e, goal.x, goal.y);
  } else {
    const n = e.path[0];
    e.wish = dirFromDelta(n.x - e.tx, n.y - e.ty);
  }
  if (e.wish != null) e.facing = e.wish;

  if (see && dist < 12 && match.grace <= 0) {
    e.facing = facingToward(e.tx, e.ty, p.tx, p.ty);
    e.wantShot = true;
  }
}

function searchGoal(match, e, dt) {
  if (e.search) e.searchT -= dt;
  if (e.search && e.searchT > 0 && !(e.tx === e.search.x && e.ty === e.search.y)) return e.search;
  const rng = mulberry32((match.seed + Math.floor(match.roundTime * 8) * 17 + e.tx * 13 + e.ty) >>> 0);
  for (let k = 0; k < 24; k++) {
    const x = 3 + ((rng() * (COLS - 6)) | 0);
    const y = 3 + ((rng() * (ROWS - 6)) | 0);
    if (match.type[y * COLS + x] === WALL) continue;
    if (Math.hypot(x - e.tx, y - e.ty) < 8) continue;
    e.search = { x, y };
    e.searchT = 7;
    return e.search;
  }
  e.search = { x: match.player.homeX, y: match.player.homeY };
  e.searchT = 4;
  return e.search;
}

function greedyDir(match, f, gx, gy) {
  let best = null;
  let bestScore = Infinity;
  for (let i = 0; i < DIRS.length; i++) {
    const nx = f.tx + DIRS[i].x;
    const ny = f.ty + DIRS[i].y;
    if (nx < 1 || ny < 1 || nx >= COLS - 1 || ny >= ROWS - 1) continue;
    const cell = match.type[ny * COLS + nx];
    if (cell === WALL) continue;
    if (DIRS[i].x && DIRS[i].y) {
      if (match.type[f.ty * COLS + nx] === WALL && match.type[ny * COLS + f.tx] === WALL) continue;
    }
    const stepCost = cell === AIR || cell === PAD ? 0 : (DIG[cell]?.density ?? 4) * 0.45;
    const score = Math.hypot(nx - gx, ny - gy) + stepCost;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

function dirFromDelta(dx, dy) {
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const idx = DIR_INDEX[`${sx},${sy}`];
  return idx == null ? null : idx;
}

export function facingToward(x, y, tx, ty) {
  const ang = Math.atan2(ty - y, tx - x);
  let oct = Math.round(ang / (Math.PI / 4));
  if (oct < 0) oct += 8;
  if (oct > 7) oct -= 8;
  return [2, 3, 4, 5, 6, 7, 0, 1][oct];
}

export function clearLine(type, x0, y0, x1, y1) {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (x !== x1 || y !== y1) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    if (x === x1 && y === y1) break;
    const c = type[y * COLS + x];
    if (c !== AIR && c !== PAD) return false;
  }
  return true;
}

export function findPath(type, x0, y0, x1, y1) {
  if (x0 === x1 && y0 === y1) return [{ x: x0, y: y0 }];
  const W = COLS;
  const N = COLS * ROWS;
  const gScore = new Float64Array(N);
  gScore.fill(Infinity);
  const prev = new Int32Array(N);
  prev.fill(-1);
  const start = y0 * W + x0;
  const goal = y1 * W + x1;
  gScore[start] = 0;
  const heap = [];
  heapPush(heap, { i: start, g: 0, f: Math.abs(x1 - x0) + Math.abs(y1 - y0) });
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  let guard = 0;
  while (heap.length && guard++ < 7000) {
    const node = heapPop(heap);
    if (!node) break;
    if (node.g !== gScore[node.i]) continue;
    if (node.i === goal) break;
    const x = node.i % W;
    const y = (node.i / W) | 0;
    for (const d of dirs) {
      const nx = x + d[0];
      const ny = y + d[1];
      if (nx < 1 || ny < 1 || nx >= COLS - 1 || ny >= ROWS - 1) continue;
      const cell = type[ny * W + nx];
      if (cell === WALL) continue;
      if (d[0] !== 0 && d[1] !== 0) {
        if (type[y * W + nx] === WALL || type[ny * W + x] === WALL) continue;
      }
      let step = 1 + (DIG[cell]?.density ?? 0) * 0.85;
      if (d[0] !== 0 && d[1] !== 0) step *= 1.3;
      const ng = node.g + step;
      const ni = ny * W + nx;
      if (ng < gScore[ni]) {
        gScore[ni] = ng;
        prev[ni] = node.i;
        const f = ng + Math.abs(nx - x1) + Math.abs(ny - y1);
        heapPush(heap, { i: ni, g: ng, f });
      }
    }
  }
  if (gScore[goal] === Infinity) return null;
  const path = [];
  let c = goal;
  while (c !== -1) {
    path.push({ x: c % W, y: (c / W) | 0 });
    c = prev[c];
  }
  path.reverse();
  return path;
}

function heapPush(h, node) {
  h.push(node);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p].f <= h[i].f) break;
    const tmp = h[p];
    h[p] = h[i];
    h[i] = tmp;
    i = p;
  }
}

function heapPop(h) {
  const top = h[0];
  const last = h.pop();
  if (h.length && last) {
    h[0] = last;
    let i = 0;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      let s = i;
      if (l < h.length && h[l].f < h[s].f) s = l;
      if (r < h.length && h[r].f < h[s].f) s = r;
      if (s === i) break;
      const tmp = h[s];
      h[s] = h[i];
      h[i] = tmp;
      i = s;
    }
  }
  return top;
}

function revealFrom(match, f) {
  match.lit.fill(0);
  const q = [[f.tx, f.ty, 0]];
  const mark = new Uint8Array(COLS * ROWS);
  mark[f.ty * COLS + f.tx] = 1;
  for (let i = 0; i < q.length; i++) {
    const x = q[i][0];
    const y = q[i][1];
    const d = q[i][2];
    const id = y * COLS + x;
    match.lit[id] = 1;
    match.seen[id] = 1;
    const c = match.type[id];
    const pass = c === AIR || c === PAD;
    if (!pass || d >= 11) continue;
    for (const dir of FOUR) {
      const nx = x + dir[0];
      const ny = y + dir[1];
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const ni = ny * COLS + nx;
      if (mark[ni]) continue;
      mark[ni] = 1;
      q.push([nx, ny, d + (match.type[ni] === AIR || match.type[ni] === PAD ? 1 : 0)]);
    }
  }
  const lamp = 7;
  for (let y = f.ty - lamp; y <= f.ty + lamp; y++) {
    for (let x = f.tx - lamp; x <= f.tx + lamp; x++) {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
      const dx = x - f.tx;
      const dy = y - f.ty;
      if (dx * dx + dy * dy > lamp * lamp) continue;
      const id = y * COLS + x;
      match.seen[id] = 1;
      match.lit[id] = 1;
    }
  }
}

function clearCell(match, x, y) {
  const i = y * COLS + x;
  match.type[i] = AIR;
  match.rock[i] = 0;
  match.pad[i] = 0;
  match.seen[i] = 1;
}

function pushEvent(match, event) {
  match.events.push(event);
  if (match.events.length > 48) match.events.shift();
}

function buildMap(match, rng) {
  match.type.fill(SOIL);
  match.pad.fill(0);
  match.rock.fill(0);
  match.seen.fill(0);
  match.lit.fill(0);
  const seed = (rng() * 1e9) | 0;
  const bands = buildStrata(match.diff.mix, rng);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      if (x < 2 || y < 2 || x >= COLS - 2 || y >= ROWS - 2) {
        match.type[i] = WALL;
        continue;
      }
      const wave = Math.round(Math.sin(x * 0.22 + (seed % 97)) * 1.6);
      const yy = Math.max(0, Math.min(bands.length - 1, y + wave));
      match.type[i] = bands[yy];
      if (isPillar(x, y, seed, match.diff)) match.type[i] = WALL;
    }
  }

  const pair = placeBunkers(match, rng);
  carveBunker(match, pair.px, pair.py, 1);
  carveBunker(match, pair.ex, pair.ey, 2);

  for (let i = 0; i < match.type.length; i++) {
    if (match.type[i] === ROCK) match.rock[i] = 3;
  }

  match.player = makeFighter("player", pair.px, pair.py);
  match.enemy = makeFighter("enemy", pair.ex, pair.ey);
  match.player.facing = facingToward(pair.px, pair.py, pair.ex, pair.ey);
  match.enemy.facing = facingToward(pair.ex, pair.ey, pair.px, pair.py);
  rearm(match, match.player);
  rearm(match, match.enemy);
  for (let i = 0; i < match.pad.length; i++) {
    if (match.pad[i] === 1) match.seen[i] = 1;
  }
  revealFrom(match, match.player);
  const score = `${match.wins}:${match.losses}`;
  match.banner = match.round === 1
    ? `Kolo 1 — zápas na ${match.winsNeeded}`
    : `Kolo ${match.round} — stav ${score}`;
  match.bannerT = 2.4;
  match.roundTime = 0;
}

function placeBunkers(match, rng) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const px = 8 + ((rng() * (COLS * 0.38)) | 0);
    const py = 8 + ((rng() * (ROWS - 16)) | 0);
    const ex = COLS - 8 - ((rng() * (COLS * 0.38)) | 0);
    const ey = 8 + ((rng() * (ROWS - 16)) | 0);
    if (Math.hypot(px - ex, py - ey) < 26) continue;
    if (rng() < 0.5) {
      return doors(px, py, ex, ey);
    }
    return doors(ex, ey, px, py);
  }
  return doors(12, (ROWS / 2) | 0, COLS - 13, (ROWS / 2) | 0);
}

function doors(px, py, ex, ey) {
  return { px, py, ex, ey };
}

function carveBunker(match, cx, cy, owner) {
  const hw = 4;
  const hh = 3;
  for (let y = cy - hh; y <= cy + hh; y++) {
    for (let x = cx - hw; x <= cx + hw; x++) {
      const edge = x === cx - hw || x === cx + hw || y === cy - hh || y === cy + hh;
      const i = y * COLS + x;
      if (edge) {
        match.type[i] = WALL;
        match.pad[i] = 0;
        match.rock[i] = 0;
      } else {
        match.type[i] = PAD;
        match.pad[i] = owner;
        match.rock[i] = 0;
      }
    }
  }
  const vents = [
    { x: 1, y: 0, span: hw },
    { x: -1, y: 0, span: hw },
    { x: 0, y: 1, span: hh },
    { x: 0, y: -1, span: hh },
  ];
  for (const door of vents) {
    for (let s = 0; s <= 3; s++) {
      const x = cx + door.x * (door.span + s);
      const y = cy + door.y * (door.span + s);
      if (x < 1 || y < 1 || x >= COLS - 1 || y >= ROWS - 1) continue;
      const i = y * COLS + x;
      match.type[i] = AIR;
      match.pad[i] = 0;
      match.rock[i] = 0;
    }
  }
}

function makeFighter(kind, tx, ty) {
  return {
    kind,
    tx,
    ty,
    homeX: tx,
    homeY: ty,
    facing: kind === "player" ? 2 : 6,
    moving: false,
    ax: tx,
    ay: ty,
    bx: tx,
    by: ty,
    mt: 1,
    dur: 0.12,
    digging: false,
    digT: 0,
    digNeed: 1,
    digX: tx,
    digY: ty,
    digName: "",
    lowPower: false,
    energy: 100,
    hitGrace: 0,
    cool: 0,
    armorT: 0,
    armorLevel: 0,
    alive: true,
    wish: null,
    wantShot: false,
    mode: "hunt",
    think: 0,
    stuck: 0,
    lastX: tx,
    lastY: ty,
    memory: null,
    search: null,
    searchT: 0,
    path: [],
    pathAge: 0,
    goalX: -1,
    goalY: -1,
  };
}

function buildStrata(mix, rng) {
  const order = [SAND, SOIL, CLAY, GRAVEL, ROCK];
  const layers = [];
  for (let i = 0; i < order.length; i++) {
    if (mix[i] >= 0.04) layers.push({ mat: order[i], w: mix[i] });
  }
  if (!layers.length) layers.push({ mat: SOIL, w: 1 });
  for (let i = layers.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const swap = layers[i];
    layers[i] = layers[j];
    layers[j] = swap;
  }
  const span = ROWS + 4;
  const total = layers.reduce((sum, layer) => sum + layer.w, 0);
  const bands = [];
  let y = 0;
  for (let i = 0; i < layers.length; i++) {
    const last = i === layers.length - 1;
    const thick = last ? span - y : Math.max(4, Math.round((layers[i].w / total) * span));
    for (let k = 0; k < thick && y < span; k++) bands[y++] = layers[i].mat;
  }
  return bands;
}

function isPillar(x, y, seed, diff) {
  if (!diff.pillar) return false;
  if (x % diff.pillar !== 2 || y % diff.pillar !== 2) return false;
  return hash01(x, y, seed ^ 0x51ed) < diff.pillarKeep;
}

function hash01(x, y, seed) {
  let n = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ (seed | 0)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
