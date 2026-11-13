// Kačík — top-down digging duel.
// Both ducks share one rule set: digging resists, shots chew faster and cost more
// life, life drains on its own, and only your own shelter refills it.
// The shelter refills 40% faster. A shot there cannot spend the last of your life:
// the duck holds still until a real shot is paid for.
// Tiles a shot opens stay open for the rest of the match. Armor rearms at 100%.
// A glowing tile grants shot power or fire rate for this round and the next.
// When someone dies in that next round, the gift is gone. It does not last the match.
// Bought upgrades stay for the match.

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

export const BOON_POWER = 1;
export const BOON_RATE = 2;
const BOON_COUNT = 5;

export const VICTORY = {
  title: "Vítězství!",
  creed: "Nechť tě kachní síla provází.",
};

export const GIFT = {
  line: "Získáváš…",
  name: "Zbiječku!",
  power: "Průraz. Ještě příští kolo.",
  rate: "Kadence. Ještě příští kolo.",
};

export const SHOT_COST = 8.5;
export const SHOT_FLOOR = 1;
export const SHELTER_REGEN = 1.4;
export const HIT_GRACE = 0.25;
export const LOOT_EVERY = 30;

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
    speed: 0.78,
    fire: 0.72,
    dmg: 0.78,
    think: 0.62,
    hear: 13,
    radar: 7.5,
    rocks: 3,
    enemyArmor: 0,
    mix: [0.36, 0.38, 0.16, 0.07, 0.03],
    pillar: 6,
    pillarKeep: 0.38,
    blurb: "Pomalejší soupeř, měkčí zem a rychlejší návrat života.",
  },
  normal: {
    id: "normal",
    name: "Normální",
    drain: 2.25,
    regen: 6.5,
    dig: 1,
    speed: 1,
    fire: 1,
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
    speed: 1.08,
    fire: 1.22,
    dmg: 1.12,
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
    kind: "rank",
    name: "Účinnost střelby",
    blurb: "Míček projede víc polí a sebere víc života.",
  },
  {
    id: "rate",
    cost: 2,
    max: 3,
    kind: "rank",
    name: "Rychlost střelby",
    blurb: "Kratší pauza mezi golfovými míčky.",
  },
  {
    id: "speed",
    cost: 2,
    max: 3,
    kind: "rank",
    name: "Rychlost chůze",
    blurb: "Každý stupeň zrychlí chůzi o 20 %.",
  },
  {
    id: "spread",
    cost: 2,
    max: 1,
    kind: "rank",
    name: "Trojstřel",
    blurb: "Jeden výstřel: míček rovně a dva pod úhlem 45°.",
  },
  {
    id: "jack",
    cost: 2,
    max: 1,
    kind: "charge",
    name: "Zbíječka",
    blurb: "20 s od začátku dalšího kola. Zem i pilíře povolí hned a bez ztráty života.",
  },
  {
    id: "inv",
    cost: 2,
    max: 1,
    kind: "charge",
    name: "Nezranitelnost",
    blurb: "30 s. Střely neberou život a kačenka se zatáhne do kovu.",
  },
  {
    id: "ghost",
    cost: 4,
    max: 1,
    kind: "charge",
    name: "GhostDuck",
    blurb: "40 s. Střílí stejnou dávku jako ty, stejně rychle, a schytá střely.",
  },
  {
    id: "laser",
    cost: 2,
    max: 1,
    kind: "rank",
    name: "Laser",
    blurb: "Natrvalo. Červený paprsek řeže stěny o 30 % líp.",
  },
  {
    id: "armor",
    cost: 4,
    max: 2,
    kind: "rank",
    name: "Pancíř",
    blurb: "Po dobití na 100 % chrání delší dobu a kačenka si nasadí stříbrnou helmu. Zásah schytá hlavně pancíř.",
  },
];

const LOOT_IDS = ["power", "rate", "speed", "spread", "jack", "inv", "ghost", "laser"];

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
  return 1 + upgrades.power + upgrades.rate + upgrades.armor
    + (upgrades.speed || 0) + (upgrades.spread || 0) + (upgrades.laser || 0);
}

export function shootingPower(match) {
  return match.upgrades.power + match.found.power;
}

export function shootingRate(match) {
  return match.upgrades.rate + match.found.rate;
}

export function shotPen(power) {
  return 2 + power;
}

export function shotDamage(power) {
  return 26 * (1 + 0.22 * power);
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
    upgrades: { power: 0, rate: 0, armor: 0, speed: 0, spread: 0, laser: 0 },
    queue: { jack: false, inv: false, ghost: false },
    found: { power: 0, rate: 0 },
    kept: { power: 0, rate: 0 },
    gifts: [],
    hits: 0,
    boxes: 0,
    phase: "play",
    type: new Uint8Array(COLS * ROWS),
    pad: new Uint8Array(COLS * ROWS),
    rock: new Uint8Array(COLS * ROWS),
    seen: new Uint8Array(COLS * ROWS),
    lit: new Uint8Array(COLS * ROWS),
    boon: new Uint8Array(COLS * ROWS),
    scar: new Uint8Array(COLS * ROWS),
    lootAt: new Uint8Array(COLS * ROWS),
    balls: [],
    events: [],
    scars: new Map(),
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
  if (match.points < item.cost) return { ok: false, reason: "Málo bodů." };
  if (item.kind === "charge") {
    if (match.queue[id]) return { ok: false, reason: "Už čeká na další kolo." };
    match.points -= item.cost;
    match.queue[id] = true;
    pushEvent(match, { t: "buy", id });
    return { ok: true };
  }
  if ((match.upgrades[id] || 0) >= item.max) return { ok: false, reason: "Výš už to nejde." };
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
  applyQueue(match);
  return true;
}

function applyQueue(match) {
  if (match.queue.jack) match.player.jackT = 20;
  if (match.queue.inv) match.player.invT = 30;
  if (match.queue.ghost) match.player.ghostT = 40;
  match.queue.jack = false;
  match.queue.inv = false;
  match.queue.ghost = false;
}

export function strike(match, target, raw) {
  if (!target || target.invT > 0 || target.hitGrace > 0) return 0;
  if (target.energy <= 0) return 0;
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
  if (target.kind === "enemy") match.hits += 1;
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
  const gift = match.gifts[0];
  if (gift) {
    gift.t += dt;
    if (gift.t >= gift.max) match.gifts.shift();
  }
  const drainOn = match.grace <= 0;

  const player = match.player;
  const wish = wishFromInput(input);
  player.wish = wish;
  if (wish != null) player.facing = wish;
  player.wantShot = !!input.shoot;

  ai(match, dt);

  const playerWalk = 1 + 0.2 * (match.upgrades.speed || 0);
  updateFighter(match, player, dt, drainOn, playerWalk);
  if (match.phase !== "play") return;
  updateFighter(match, match.enemy, dt, drainOn, match.diff.speed);
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
  if (f.hitGrace > 0) {
    f.hitGrace -= dt;
    if (f.hitGrace < 0.001) f.hitGrace = 0;
  }
  if (f.jackT > 0) f.jackT = Math.max(0, f.jackT - dt);
  if (f.invT > 0) f.invT = Math.max(0, f.invT - dt);
  if (f.ghostT > 0) f.ghostT = Math.max(0, f.ghostT - dt);
  if (f.energy <= 0 && f.invT <= 0) return;
  f.cool = Math.max(0, f.cool - dt);
  const onPad = onShelter(match, f);
  if (f.armorT > 0 && !onPad && drainOn) f.armorT = Math.max(0, f.armorT - dt);

  if (onPad) {
    const prev = f.energy;
    f.energy = Math.min(100, f.energy + match.diff.regen * SHELTER_REGEN * dt);
    if (prev < 99.5 && f.energy >= 100) rearm(match, f);
  } else if (drainOn) {
    f.energy -= match.diff.drain * dt;
  }

  const waiting = playerWaitsForShot(match, f);
  if (waiting) pinFighter(f);

  if (f.moving) {
    f.mt += dt / f.dur;
    if (f.mt >= 1) {
      f.mt = 1;
      f.moving = false;
      if (duckBlocks(match, f, f.bx, f.by)) {
        f.tx = f.ax;
        f.ty = f.ay;
      } else {
        f.tx = f.bx;
        f.ty = f.by;
      }
      f.bx = f.tx;
      f.by = f.ty;
      claimBoon(match, f);
    }
  } else if (!waiting && f.wish != null) {
    tryMoveOrDig(match, f, dt, speedMul);
  } else {
    f.digging = false;
    f.digT = 0;
    f.lowPower = false;
  }

  if (!waiting && f.wantShot && (f.kind === "player" || match.grace <= 0)) tryShoot(match, f);
  f.wantShot = false;
}

function playerWaitsForShot(match, f) {
  if (f.kind !== "player") return false;
  if (!onOwnPad(match, f)) {
    f.holdShot = false;
    return false;
  }
  if (f.energy > SHOT_COST + SHOT_FLOOR) {
    f.holdShot = false;
    return false;
  }
  if (f.wantShot) f.holdShot = true;
  return f.holdShot;
}

function pinFighter(f) {
  if (f.moving) {
    f.moving = false;
    f.tx = f.ax;
    f.ty = f.ay;
    f.bx = f.tx;
    f.by = f.ty;
    f.mt = 1;
  }
  f.wish = null;
  f.digging = false;
  f.digT = 0;
  f.lowPower = false;
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
  if (duckInWay(match, f, nx, ny, d)) {
    f.digging = false;
    f.digT = 0;
    return;
  }
  if (f.jackT > 0 && cell !== AIR && cell !== PAD) {
    if (f.kind === "player") takeLoot(match, nx, ny);
    clearCell(match, nx, ny);
    f.digging = false;
    f.digT = 0;
    f.lowPower = false;
    pushEvent(match, { t: "dig", x: nx, y: ny, kind: f.kind });
    startMove(f, nx, ny, 0.08 / speedMul);
    return;
  }
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
  if (f.kind === "player") takeLoot(match, nx, ny);
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
  if (f.kind === "player" && onOwnPad(match, f) && f.energy <= SHOT_COST + SHOT_FLOOR) {
    f.holdShot = true;
    return false;
  }
  if (f.energy <= SHOT_COST + 0.35) return false;
  f.energy -= SHOT_COST;
  if (f.kind === "player" && onOwnPad(match, f) && f.energy <= SHOT_COST + SHOT_FLOOR) {
    f.holdShot = true;
  }
  const rate = f.kind === "player" ? shootingRate(match) : 0;
  let cool = fireCooldown(rate);
  if (f.kind === "enemy") cool /= match.diff.fire;
  f.cool = cool;
  const power = f.kind === "player" ? shootingPower(match) : 0;
  const spread = f.kind === "player" && match.upgrades.spread > 0;
  const facings = spread ? [f.facing, (f.facing + 1) % 8, (f.facing + 7) % 8] : [f.facing];
  const laser = f.kind === "player" && match.upgrades.laser > 0;
  const pos = fighterPixel(f);
  const speed = 360;
  for (const facing of facings) pushBall(match, f, facing, pos, speed, power, laser);
  if (f.kind === "player" && f.ghostT > 0) {
    const spot = ghostSpot(f);
    for (const facing of facings) pushBall(match, f, facing, spot, speed, power, laser);
  }
  pushEvent(match, { t: "shoot", x: f.tx, y: f.ty, kind: f.kind });
  if (f.kind === "player") match.noise = { x: f.tx, y: f.ty, ttl: 1.6, kind: "player" };
  else if (!match.lit[f.ty * COLS + f.tx]) match.shotCue = { x: f.tx, y: f.ty, ttl: 1.15 };
  else match.rumor = { x: f.tx, y: f.ty, ttl: 1.25 };
  return true;
}

function pushBall(match, f, facing, pos, speed, power, laser) {
  const d = DIRS[facing];
  const len = Math.hypot(d.x, d.y) || 1;
  match.balls.push({
    x: pos.x + (d.x / len) * 16,
    y: pos.y + (d.y / len) * 16,
    vx: (d.x / len) * speed,
    vy: (d.y / len) * speed,
    age: 0,
    pen: shotPen(power) * (laser ? 1.3 : 1),
    rockDmg: laser ? 2 : 1,
    dmg: ballDamage(match, f, power),
    laser,
    owner: f.kind,
    tx: -99,
    ty: -99,
    trail: [],
  });
}

export function ghostSpot(f) {
  const d = DIRS[f.facing];
  const pos = fighterPixel(f);
  const len = Math.hypot(d.x, d.y) || 1;
  const gap = TILE * 1.35;
  return { x: pos.x + (d.x / len) * gap, y: pos.y + (d.y / len) * gap };
}

function ballDamage(match, f, power) {
  let dmg = shotDamage(power);
  if (f.kind === "enemy") dmg *= match.diff.dmg * match.roundScale;
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
    b.trail = b.trail || [];
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 7) b.trail.shift();
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
      if (b.owner !== "player" && ghostBlocks(match, b)) {
        pushEvent(match, { t: "block", x: match.player.tx, y: match.player.ty });
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
  if (cell === WALL) {
    nick(match, tx, ty, 2);
    pushEvent(match, { t: "smudge", x: tx, y: ty });
    return true;
  }
  const info = DIG[cell];
  if (!info) return false;
  if (cell === ROCK) {
    match.rock[id] -= b.rockDmg || 1;
    nick(match, tx, ty, 2);
    pushEvent(match, { t: "chip", x: tx, y: ty });
    if (match.rock[id] <= 0) {
      if (b.owner === "player") takeLoot(match, tx, ty);
      openByShot(match, tx, ty);
    }
    return true;
  }
  if (b.pen >= info.pen) {
    if (b.owner === "player") takeLoot(match, tx, ty);
    openByShot(match, tx, ty);
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
    if (!f || f.kind === b.owner || (f.energy <= 0 && f.invT <= 0)) continue;
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
    scarBlast(match, match.player.tx, match.player.ty);
    match.losses += 1;
    match.phase = match.losses >= match.winsNeeded ? "over" : "between";
    if (match.phase === "over") match.victor = "enemy";
    settleBoon(match);
    pushEvent(match, { t: "boom", x: match.player.tx, y: match.player.ty, kind: "player" });
    gnawWalls(match, match.player.tx, match.player.ty);
    return;
  }
  if (match.enemy.energy <= 0) {
    match.enemy.energy = 0;
    match.enemy.alive = false;
    scarBlast(match, match.enemy.tx, match.enemy.ty);
    match.wins += 1;
    match.points += 2;
    match.phase = match.wins >= match.winsNeeded ? "over" : "shop";
    if (match.phase === "over") match.victor = "player";
    settleBoon(match);
    pushEvent(match, { t: "boom", x: match.enemy.tx, y: match.enemy.ty, kind: "enemy" });
    gnawWalls(match, match.enemy.tx, match.enemy.ty);
  }
}

// Shrapnel only bites the face of a solid wall. The tile stays shut.
const SHRAPNEL_REACH = 5.1;
const SCAR_CAP = 6;

function gnawWalls(match, ox, oy) {
  if (!match.scars) match.scars = new Map();
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist > SHRAPNEL_REACH) continue;
      const x = ox + dx;
      const y = oy + dy;
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
      const i = y * COLS + x;
      if (match.type[i] !== WALL) continue;
      const bites = match.scars.get(i) || [];
      if (bites.length >= SCAR_CAP) continue;
      let n = mix32(x + ox * 13, y + oy * 29) ^ Math.imul(bites.length + 1, 0x9e3779b1);
      const rnd = () => {
        n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
        return n / 4294967296;
      };
      const len = dist || 1;
      const dirx = dx / len;
      const diry = dy / len;
      let want = dist < 2.2 ? 3 : dist < 3.8 ? 2 : 1;
      if (dist > 3.8 && rnd() < 0.5) want = 0;
      for (let k = 0; k < want && bites.length < SCAR_CAP; k++) {
        const along = (rnd() - 0.5) * TILE * 0.78;
        let px = 0;
        let py = 0;
        const pts = [];
        const steps = 3;
        let blocked = false;
        const mouthR = 2.3 + rnd() * 0.9;
        const inset = mouthR + 2.2;
        px = TILE * 0.5 - dirx * (TILE * 0.5 - inset) - diry * along;
        py = TILE * 0.5 - diry * (TILE * 0.5 - inset) + dirx * along;
        for (let s = 0; s < steps; s++) {
          const r = s === 0 ? mouthR : 1.35 + rnd() * 0.7;
          if (s === 0 && bites.some((bite) => Math.hypot(bite.pts[0].x - px, bite.pts[0].y - py) < 8)) {
            blocked = true;
            break;
          }
          pts.push({
            x: Math.max(1.2, Math.min(TILE - 1.2, px)),
            y: Math.max(1.2, Math.min(TILE - 1.2, py)),
            r,
            squash: 0.62 + rnd() * 0.3,
            spin: rnd() * Math.PI,
          });
          const wobble = (rnd() - 0.5) * 1.6;
          px += dirx * (2.6 + rnd()) - diry * wobble;
          py += diry * (2.6 + rnd()) + dirx * wobble;
        }
        if (!blocked && pts.length === steps) bites.push({ seed: n >>> 0, pts });
      }
      if (bites.length) match.scars.set(i, bites);
    }
  }
}

function mix32(a, b) {
  let n = (Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

function pruneScars(match) {
  if (!match.scars || !match.ground) return;
  for (const i of match.scars.keys()) {
    if (match.ground[i] !== WALL) match.scars.delete(i);
  }
}

function scarBlast(match, cx, cy) {
  const radius = 4;
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > radius) continue;
      const i = y * COLS + x;
      if (match.type[i] === AIR) continue;
      const thick = dist < 2.2 ? 3 : dist < 3.4 ? 2 : 1;
      if (thick > match.scar[i]) match.scar[i] = thick;
      match.seen[i] = 1;
    }
  }
}

function nick(match, tx, ty, amount) {
  const i = ty * COLS + tx;
  const next = Math.min(3, match.scar[i] + amount);
  if (next > match.scar[i]) match.scar[i] = next;
  match.seen[i] = 1;
}

function otherDuck(match, f) {
  const other = f.kind === "player" ? match.enemy : match.player;
  if (!other || (!other.alive && other.invT <= 0)) return null;
  return other;
}

function duckBlocks(match, f, x, y) {
  const other = otherDuck(match, f);
  if (!other) return false;
  if (other.tx === x && other.ty === y) return true;
  return other.moving && other.bx === x && other.by === y;
}

function duckInWay(match, f, nx, ny, d) {
  if (duckBlocks(match, f, nx, ny)) return true;
  if (d.x && d.y) {
    if (duckBlocks(match, f, f.tx + d.x, f.ty)) return true;
    if (duckBlocks(match, f, f.tx, f.ty + d.y)) return true;
  }
  return false;
}

function ghostBlocks(match, ball) {
  const f = match.player;
  if (!f || f.ghostT <= 0) return false;
  const spot = ghostSpot(f);
  return Math.hypot(spot.x - ball.x, spot.y - ball.y) < TILE * 0.42;
}

function plantLoot(match, rng) {
  match.lootAt = new Uint8Array(COLS * ROWS);
  const cells = [];
  for (let i = 0; i < match.type.length; i++) {
    const cell = match.type[i];
    if (match.boon[i]) continue;
    if (cell === SAND || cell === SOIL || cell === CLAY || cell === GRAVEL || cell === ROCK) cells.push(i);
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const swap = cells[i];
    cells[i] = cells[j];
    cells[j] = swap;
  }
  const deck = LOOT_IDS.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const swap = deck[i];
    deck[i] = deck[j];
    deck[j] = swap;
  }
  let di = 0;
  for (let n = LOOT_EVERY - 1; n < cells.length; n += LOOT_EVERY) {
    match.lootAt[cells[n]] = LOOT_IDS.indexOf(deck[di % deck.length]) + 1;
    di += 1;
  }
}

function takeLoot(match, x, y) {
  if (!match.lootAt) return;
  const i = y * COLS + x;
  const code = match.lootAt[i];
  if (!code) return;
  match.lootAt[i] = 0;
  const id = LOOT_IDS[code - 1];
  if (!lootOpen(match, id)) return;
  match.boxes += 1;
  if (id === "jack") match.player.jackT = 20;
  else if (id === "inv") match.player.invT = 30;
  else if (id === "ghost") match.player.ghostT = 40;
  else match.upgrades[id] = Math.min((match.upgrades[id] || 0) + 1, SHOP.find((entry) => entry.id === id).max);
  pushEvent(match, { t: "loot", x, y, id });
}

function lootOpen(match, id) {
  if (id === "jack" || id === "inv" || id === "ghost") return true;
  const item = SHOP.find((entry) => entry.id === id);
  return item && (match.upgrades[id] || 0) < item.max;
}

function onShelter(match, f) {
  const id = f.ty * COLS + f.tx;
  return match.pad[id] === 1 || match.pad[id] === 2;
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
    e.think = match.diff.think;
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

function openByShot(match, x, y) {
  clearCell(match, x, y);
  const i = y * COLS + x;
  if (match.shot && x >= 2 && y >= 2 && x < COLS - 2 && y < ROWS - 2) match.shot[i] = 1;
}

function reopenShots(match) {
  if (!match.shot) return;
  for (let i = 0; i < match.shot.length; i++) {
    if (!match.shot[i]) continue;
    const x = i % COLS;
    const y = (i / COLS) | 0;
    if (x < 2 || y < 2 || x >= COLS - 2 || y >= ROWS - 2) continue;
    match.type[i] = AIR;
    match.rock[i] = 0;
    match.seen[i] = 1;
  }
}

function pushEvent(match, event) {
  match.events.push(event);
  if (match.events.length > 48) match.events.shift();
}

function claimBoon(match, f) {
  if (f.kind !== "player" || !match.boon) return;
  const id = f.ty * COLS + f.tx;
  const kind = match.boon[id];
  if (kind !== BOON_POWER && kind !== BOON_RATE) return;
  match.boon[id] = 0;
  match.boxes += 1;
  const power = kind === BOON_POWER;
  if (power) {
    match.found.power += 1;
    match.kept.power += 1;
  } else {
    match.found.rate += 1;
    match.kept.rate += 1;
  }
  const idName = power ? "power" : "rate";
  pushEvent(match, { t: "boon", id: idName, x: f.tx, y: f.ty });
  match.gifts.push({ id: idName, t: 0, max: 2.5 });
}

function settleBoon(match) {
  match.found.power = match.kept.power;
  match.found.rate = match.kept.rate;
}

function carryBoon(match) {
  match.found.power = match.kept.power;
  match.found.rate = match.kept.rate;
  match.kept.power = 0;
  match.kept.rate = 0;
  match.gifts = [];
}

function exitBoonSpots(match) {
  const spots = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  let door = null;
  for (const dir of dirs) {
    const wall = dir[0] !== 0 ? 4 : 3;
    const x = match.player.homeX + dir[0] * wall;
    const y = match.player.homeY + dir[1] * wall;
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
    if (match.type[y * COLS + x] === AIR) {
      door = dir;
      break;
    }
  }
  if (!door) return spots;
  const wall = door[0] !== 0 ? 4 : 3;
  for (let s = wall + 4; s <= wall + 14 && spots.length < 2; s++) {
    const x = match.player.homeX + door[0] * s;
    const y = match.player.homeY + door[1] * s;
    if (x < 3 || y < 3 || x >= COLS - 3 || y >= ROWS - 3) break;
    const i = y * COLS + x;
    const cell = match.type[i];
    if (cell === SAND || cell === SOIL || cell === CLAY || cell === GRAVEL) spots.push(i);
  }
  return spots;
}

function placeBoons(match, rng) {
  match.boon.fill(0);
  const chosen = exitBoonSpots(match);
  const reserved = new Set(chosen);
  const spots = [];
  for (let y = 3; y < ROWS - 3; y++) {
    for (let x = 3; x < COLS - 3; x++) {
      const i = y * COLS + x;
      if (reserved.has(i)) continue;
      const cell = match.type[i];
      if (cell !== SAND && cell !== SOIL && cell !== CLAY && cell !== GRAVEL) continue;
      const nearPlayer = Math.hypot(x - match.player.homeX, y - match.player.homeY) < 8;
      const nearEnemy = Math.hypot(x - match.enemy.homeX, y - match.enemy.homeY) < 8;
      if (nearPlayer || nearEnemy) continue;
      spots.push(i);
    }
  }
  for (let i = spots.length - 1; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const swap = spots[i];
    spots[i] = spots[j];
    spots[j] = swap;
  }
  const count = Math.min(BOON_COUNT, chosen.length + spots.length);
  const need = count - chosen.length;
  for (let n = 0; n < need; n++) chosen.push(spots[n]);
  for (let n = 0; n < chosen.length; n++) {
    match.boon[chosen[n]] = n % 2 === 0 ? BOON_POWER : BOON_RATE;
  }
}

function buildMap(match, rng) {
  carryBoon(match);
  if (!match.ground) {
    match.type.fill(SOIL);
    match.pad.fill(0);
    match.rock.fill(0);
    match.seen.fill(0);
    match.lit.fill(0);
    const seed = (rng() * 1e9) | 0;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const i = y * COLS + x;
        if (x < 2 || y < 2 || x >= COLS - 2 || y >= ROWS - 2) {
          match.type[i] = WALL;
          continue;
        }
        match.type[i] = pickMaterial(regionNoise(x, y, seed), match.diff.mix);
        if (isPillar(x, y, seed, match.diff)) match.type[i] = WALL;
      }
    }

    const blobs = match.diff.rocks;
    for (let b = 0; b < blobs; b++) {
      const cx = 4 + ((rng() * (COLS - 8)) | 0);
      const cy = 4 + ((rng() * (ROWS - 8)) | 0);
      const rad = 1.2 + rng() * 2.4;
      for (let y = -3; y <= 3; y++) {
        for (let x = -3; x <= 3; x++) {
          if (x * x + y * y > rad * rad) continue;
          const tx = cx + x;
          const ty = cy + y;
          if (tx < 2 || ty < 2 || tx >= COLS - 2 || ty >= ROWS - 2) continue;
          match.type[ty * COLS + tx] = ROCK;
        }
      }
    }

    match.ground = new Uint8Array(match.type);
    match.shot = new Uint8Array(match.type.length);
  } else {
    match.type.set(match.ground);
    match.pad.fill(0);
    match.rock.fill(0);
    match.seen.fill(0);
    match.lit.fill(0);
    pruneScars(match);
    reopenShots(match);
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
  placeBoons(match, rng);
  plantLoot(match, rng);
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
    holdShot: false,
    energy: 100,
    hitGrace: 0,
    jackT: 0,
    invT: 0,
    ghostT: 0,
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

function pickMaterial(n, mix) {
  const order = [SAND, SOIL, CLAY, GRAVEL, ROCK];
  let acc = 0;
  for (let i = 0; i < order.length; i++) {
    acc += mix[i];
    if (n < acc) return order[i];
  }
  return ROCK;
}

function regionNoise(x, y, seed) {
  const scale = 5;
  const x0 = Math.floor(x / scale);
  const y0 = Math.floor(y / scale);
  const fx = x / scale - x0;
  const fy = y / scale - y0;
  const lerp = (a, b, t) => a + (b - a) * t;
  const v00 = hash01(x0, y0, seed);
  const v10 = hash01(x0 + 1, y0, seed);
  const v01 = hash01(x0, y0 + 1, seed);
  const v11 = hash01(x0 + 1, y0 + 1, seed);
  return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
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
