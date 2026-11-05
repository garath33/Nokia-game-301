import {
  AIR,
  CLAY,
  COLS,
  GRAVEL,
  PAD,
  ROCK,
  SAND,
  HIT_GRACE,
  PACE,
  REGEN_BOOST,
  SHOT_COST,
  SOIL,
  WALL,
  densityOf,
  buy,
  clearLine,
  ghostSpot,
  createMatch,
  facingToward,
  findPath,
  shotDamage,
  shotPen,
  startNextRound,
  step,
  strike,
} from "../js/sim.js";

let failed = 0;

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL:", message);
  }
}

function close(a, b, eps, message) {
  assert(Math.abs(a - b) <= eps, `${message} (${a} vs ${b})`);
}

const idle = { left: false, right: false, up: false, down: false, shoot: false };
const shoot = { ...idle, shoot: true };

function reachable(match) {
  const a = match.player;
  const b = match.enemy;
  const q = [{ x: a.tx, y: a.ty }];
  const seen = new Uint8Array(match.type.length);
  seen[a.ty * COLS + a.tx] = 1;
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  while (q.length) {
    const c = q.pop();
    if (c.x === b.tx && c.y === b.ty) return true;
    for (const d of dirs) {
      const x = c.x + d[0];
      const y = c.y + d[1];
      if (x < 0 || y < 0 || x >= COLS || y >= match.type.length / COLS) continue;
      const i = y * COLS + x;
      if (seen[i]) continue;
      if (match.type[i] === WALL) continue;
      seen[i] = 1;
      q.push({ x, y });
    }
  }
  return false;
}

for (let seed = 1; seed <= 25; seed++) {
  for (const difficulty of ["easy", "normal", "hard"]) {
    const match = createMatch({ seed, difficulty });
    assert(match.player.energy === 100, "start energy");
    assert(match.type[match.player.ty * COLS + match.player.tx] === PAD, "player on pad");
    assert(match.type[match.enemy.ty * COLS + match.enemy.tx] === PAD, "enemy on pad");
    assert(Math.hypot(match.player.tx - match.enemy.tx, match.player.ty - match.enemy.ty) >= 26, `distance ${seed} ${difficulty}`);
    assert(reachable(match), `reachable ${seed} ${difficulty}`);
    assert(match.player.armorT === (difficulty === "hard" ? 0 : 0), "player armor");
    if (difficulty === "hard") assert(match.enemy.armorT === 20, "hard enemy armor");
    else assert(match.enemy.armorT === 0, "no enemy armor");
    const path = findPath(match.type, match.player.tx, match.player.ty, match.enemy.tx, match.enemy.ty);
    assert(path && path.length > 5, "path exists");
  }
}

assert(facingToward(0, 0, 4, 0) === 2, "face east");
assert(facingToward(0, 0, 0, -4) === 0, "face north");
assert(facingToward(0, 0, 0, 4) === 4, "face south");
assert(facingToward(0, 0, -4, 0) === 6, "face west");

{
  const match = createMatch({ seed: 3, difficulty: "normal" });
  const outside = match.seen.some((v, i) => v === 0 && match.type[i] === SOIL);
  assert(outside, "fog hides distant soil");
  const doorSeen = match.seen.some((v, i) => v === 1 && match.type[i] === AIR);
  assert(doorSeen, "corridor starts visible");
}

{
  const match = createMatch({ seed: 4, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  match.player.energy = 50;
  const tile = match.player.ty * COLS + match.player.tx;
  match.pad[tile] = 0;
  match.type[tile] = AIR;
  step(match, idle, 2);
  close(match.player.energy, 50 - match.diff.drain * 2 * PACE, 0.15, "drain outside");
}

{
  const match = createMatch({ seed: 5, difficulty: "normal" });
  match.grace = 0;
  match.player.energy = 40;
  step(match, idle, 1);
  close(match.player.energy, 40 + match.diff.regen * REGEN_BOOST, 0.2, "regen on own pad");
  match.player.tx = match.enemy.homeX;
  match.player.ty = match.enemy.homeY;
  match.player.moving = false;
  match.player.energy = 50;
  match.enemy.tx = 2;
  match.enemy.ty = 2;
  match.enemy.moving = false;
  assert(match.pad[match.player.ty * COLS + match.player.tx] === 2, "tile is the enemy shelter");
  step(match, idle, 1);
  close(match.player.energy, 50 - match.diff.drain * PACE, 0.25, "enemy shelter drains instead of recharging");
  match.enemy.tx = match.player.tx;
  match.enemy.ty = match.player.ty;
  match.enemy.energy = 40;
  match.diff.regen = 0;
  step(match, idle, 1);
  assert(match.enemy.energy < 40, "enemy drains inside your bunker");
}

{
  const match = createMatch({ seed: 6, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  const before = match.player.energy;
  step(match, shoot, 0.2);
  close(before - match.player.energy, SHOT_COST, 0.05, "one shot cost");
  assert(match.balls.length === 1, "ball exists");
  const x = match.player.tx + 1;
  const y = match.player.ty;
  match.balls.length = 0;
  match.player.cool = 0;
  match.player.facing = 2;
  match.player.energy = 80;
  for (let i = 0; i < 6; i++) {
    match.type[y * COLS + (x + i)] = i < 2 ? SOIL : i === 2 ? CLAY : AIR;
    match.pad[y * COLS + (x + i)] = 0;
  }
  step(match, shoot, 0.05);
  step(match, idle, 0.4);
  assert(match.type[y * COLS + x] === AIR, "shot removed soil");
  assert(shotPen(0) === 2, "base pen");
  assert(match.type[y * COLS + (x + 1)] === AIR, "second soil gone");
}

{
  const match = createMatch({ seed: 7, difficulty: "normal" });
  match.diff.regen = 0;
  match.grace = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  match.type[y * COLS + x] = SOIL;
  match.pad[y * COLS + x] = 0;
  const before = match.player.energy;
  step(match, { ...idle, right: true }, 0.7);
  assert(match.type[y * COLS + x] === AIR, "dig clears soil");
  assert(before - match.player.energy > 2, "dig costs life");
  match.player.energy = 1;
  match.player.moving = false;
  match.player.tx = x;
  match.player.ty = y;
  const rockX = x + 1;
  match.type[y * COLS + rockX] = ROCK;
  match.rock[y * COLS + rockX] = 3;
  step(match, { ...idle, right: true }, 0.8);
  assert(match.type[y * COLS + rockX] === ROCK, "cannot dig when broke");
  assert(match.player.energy <= 1.05, "broke duck stays broke");
}

{
  const match = createMatch({ seed: 8, difficulty: "normal" });
  match.upgrades.armor = 1;
  match.player.armorT = 0;
  match.player.armorLevel = 0;
  match.player.energy = 90;
  match.diff.regen = 0;
  match.grace = 0;
  step(match, idle, 0.3);
  assert(match.player.armorT === 0, "armor waits for full life");
  match.diff.regen = 80;
  match.player.energy = 99;
  step(match, idle, 0.05);
  assert(match.player.energy === 100, "filled");
  assert(match.player.armorT === 20, "armor rearms at 100");
  const before = match.player.energy;
  strike(match, match.player, 20);
  close(before - match.player.energy, 7, 0.05, "armor absorbs 65%");
}

{
  const match = createMatch({ seed: 9, difficulty: "hard" });
  match.enemy.energy = 4;
  strike(match, match.enemy, 40);
  step(match, idle, 0.02);
  assert(match.phase === "shop", "kill opens shop");
  assert(match.points === 2, "kill pays 2");
  assert(!buy(match, "armor").ok, "armor needs 4");
  assert(buy(match, "power").ok, "buy power");
  assert(match.points === 0, "points spent");
  assert(!buy(match, "rate").ok, "cannot afford rate");
  match.points = 10;
  assert(buy(match, "armor").ok, "buy armor");
  assert(buy(match, "armor").ok, "stack armor");
  assert(!buy(match, "armor").ok, "armor cap");
  const old = match.type.slice();
  const home = [match.enemy.tx, match.enemy.ty];
  assert(startNextRound(match), "next round");
  assert(match.round === 2, "round 2");
  assert(match.phase === "play", "playing");
  assert(match.upgrades.power === 1 && match.upgrades.armor === 2, "upgrades stick");
  assert(match.player.armorT === 36, "stacked armor armed");
  assert(match.player.energy === 100, "fresh life");
  const moved = match.enemy.tx !== home[0] || match.enemy.ty !== home[1] || old.some((v, i) => v !== match.type[i]);
  assert(moved, "map changes between rounds");
  assert(match.points === 2, "unspent points remain");
}

{
  const type = new Uint8Array(COLS * (matchRows()));
  type.fill(AIR);
  assert(clearLine(type, 2, 2, 8, 2), "open line");
  type[2 * COLS + 5] = SOIL;
  assert(!clearLine(type, 2, 2, 8, 2), "soil blocks sight");
}

function matchRows() {
  return 42;
}

{
  const a = createMatch({ seed: 11, difficulty: "easy" });
  const b = createMatch({ seed: 12, difficulty: "easy" });
  const same = a.player.tx === b.player.tx && a.enemy.tx === b.enemy.tx && a.enemy.ty === b.enemy.ty && a.player.ty === b.player.ty;
  assert(!same, "different games place shelters differently");
}

{
  const match = createMatch({ seed: 15, difficulty: "normal" });
  const startX = match.enemy.tx;
  const startEnergy = match.enemy.energy;
  step(match, idle, 4);
  const moved = match.enemy.tx !== startX || match.enemy.ty !== match.enemy.homeY;
  const spent = match.enemy.energy < startEnergy - 1;
  assert(moved || spent || match.phase !== "play", "enemy leaves the shelter and spends life");
}

assert(densityOf(SAND) < densityOf(SOIL), "sand is lighter than soil");
assert(densityOf(SOIL) < densityOf(CLAY), "soil is lighter than clay");
assert(densityOf(CLAY) < densityOf(GRAVEL), "clay is lighter than gravel");
assert(densityOf(GRAVEL) < densityOf(ROCK), "gravel is lighter than rock");

{
  const match = createMatch({ seed: 4, difficulty: "normal", winsNeeded: 5 });
  assert(match.winsNeeded === 5, "match length");
  const counts = { [SAND]: 0, [SOIL]: 0, [CLAY]: 0, [GRAVEL]: 0, [ROCK]: 0, [WALL]: 0 };
  for (let y = 2; y < 40; y++) {
    for (let x = 2; x < 74; x++) counts[match.type[y * COLS + x]] += 1;
  }
  assert(counts[SAND] > 30, "sand regions");
  assert(counts[SOIL] > 30, "soil regions");
  assert(counts[CLAY] > 20, "clay regions");
  assert(counts[GRAVEL] > 20, "gravel regions");
  assert(counts[ROCK] > 15, "rock pockets");
  assert(counts[WALL] > 12, "bomberman pillars");
  let same = 0;
  let pairs = 0;
  for (let y = 3; y < 38; y++) {
    for (let x = 3; x < 70; x++) {
      const a = match.type[y * COLS + x];
      const b = match.type[y * COLS + x + 1];
      if (a === WALL || b === WALL || a === AIR || b === AIR || a === PAD || b === PAD) continue;
      pairs += 1;
      if (a === b) same += 1;
    }
  }
  assert(same / pairs > 0.8, `ground sits in layers (${same}/${pairs})`);
}

{
  const match = createMatch({ seed: 21, difficulty: "normal", winsNeeded: 3 });
  match.enemy.energy = 1;
  strike(match, match.enemy, 80);
  step(match, idle, 0.05);
  assert(match.phase === "shop" && match.wins === 1, "first win opens shop");
  match.wins = 2;
  startNextRound(match);
  match.enemy.energy = 1;
  strike(match, match.enemy, 80);
  step(match, idle, 0.05);
  assert(match.phase === "over" && match.victor === "player" && match.wins === 3, "third win ends the match");
}

{
  const match = createMatch({ seed: 22, difficulty: "easy", winsNeeded: 3 });
  match.player.energy = 0;
  step(match, idle, 0.05);
  assert(match.phase === "between" && match.losses === 1, "loss continues the match");
  startNextRound(match);
  match.losses = 2;
  match.player.energy = 0;
  step(match, idle, 0.05);
  assert(match.phase === "over" && match.victor === "enemy", "third loss ends the match");
}

{
  const match = createMatch({ seed: 23, winsNeeded: 4 });
  assert(match.winsNeeded === 3, "only 3, 5 or 8");
}

{
  assert(SHOT_COST === 5.1, "shot costs 40% less than 8.5");
  assert(shotDamage(0) === 30, "plain hit is 30% of life");
  for (const difficulty of ["easy", "normal", "hard"]) {
    const match = createMatch({ seed: 11, difficulty });
    const cx = match.player.homeX;
    const cy = match.player.homeY;
    const doors = [
      [cx + 4, cy],
      [cx - 4, cy],
      [cx, cy + 3],
      [cx, cy - 3],
    ];
    for (const [x, y] of doors) {
      const dx = Math.sign(x - cx);
      const dy = Math.sign(y - cy);
      assert(match.type[y * COLS + x] === AIR, `${difficulty} door ${x},${y}`);
      assert(match.type[(y + dy) * COLS + (x + dx)] === AIR, `${difficulty} vent ${dx},${dy}`);
    }
    assert(match.type[(cy - 3) * COLS + (cx - 4)] === WALL, `${difficulty} corner stays shut`);
  }
}

{
  const match = createMatch({ seed: 12, difficulty: "hard" });
  match.roundScale = 1.45;
  match.grace = 3;
  const y = 20;
  for (let x = 0; x < COLS; x++) {
    match.type[y * COLS + x] = AIR;
    match.pad[y * COLS + x] = 0;
  }
  match.enemy.tx = 18;
  match.enemy.ty = y;
  match.enemy.moving = false;
  match.enemy.energy = 100;
  match.player.tx = 28;
  match.player.ty = y;
  match.player.moving = false;
  match.player.energy = 100;
  const pe = match.player.tx;
  const ee = match.enemy.tx;
  step(match, { ...idle, right: true }, 1);
  assert(match.player.tx - pe === match.enemy.tx - ee, `same tiles ${match.player.tx - pe} vs ${match.enemy.tx - ee}`);
}

{
  const match = createMatch({ seed: 13, difficulty: "normal" });
  match.roundScale = 1.5;
  match.grace = 0;
  match.diff.drain = 0;
  const y = match.player.ty;
  for (let x = 1; x < COLS - 1; x++) {
    match.type[y * COLS + x] = AIR;
    match.pad[y * COLS + x] = 0;
  }
  match.enemy.tx = match.player.tx + 4;
  match.enemy.ty = y;
  match.enemy.moving = false;
  match.player.moving = false;
  match.player.energy = 100;
  match.enemy.energy = 100;
  step(match, idle, 0.45);
  close(match.player.energy, 70, 0.05, "one hit takes 30% even later in the match");
}

{
  const match = createMatch({ seed: 16, difficulty: "normal" });
  match.diff.regen = 0;
  match.player.energy = 100;
  assert(strike(match, match.player, 30) === 30, "first hit lands");
  assert(strike(match, match.player, 30) === 0, "next hit inside the gap does not count");
  assert(match.player.energy === 70, "life stays at 70");
  step(match, idle, HIT_GRACE / PACE);
  assert(strike(match, match.player, 30) === 30, "hit counts after a quarter second");
  assert(match.player.energy === 40, "second counted hit");
}

{
  const match = createMatch({ seed: 17, difficulty: "normal" });
  match.grace = 0;
  const y = match.player.ty;
  for (let x = match.player.tx; x <= match.player.tx + 6; x++) {
    match.type[y * COLS + x] = AIR;
    match.pad[y * COLS + x] = 0;
  }
  match.enemy.tx = match.player.tx + 5;
  match.enemy.ty = y;
  match.enemy.moving = false;
  match.enemy.energy = 80;
  match.lit.fill(0);
  step(match, idle, 0.05);
  assert(match.shotCue && match.shotCue.x === match.enemy.tx, "unseen shot marks a direction");
}

{
  for (let seed = 1; seed <= 12; seed++) {
    const match = createMatch({ seed, difficulty: "normal" });
    assert(match.player.tx < match.enemy.tx, `player stays on the left ${seed}`);
    match.phase = "shop";
    startNextRound(match);
    assert(match.player.tx < match.enemy.tx, `next round stays unmirrored ${seed}`);
  }
}

{
  const match = createMatch({ seed: 18, difficulty: "normal" });
  match.phase = "shop";
  match.points = 8;
  assert(buy(match, "jack").ok, "buy jackhammer");
  assert(buy(match, "spread").ok, "buy spread");
  assert(match.points === 4, "both cost 2");
  assert(match.queue.jack, "jack waits for the round");
  startNextRound(match);
  assert(match.player.jackT === 20, "jack starts with the round");
  assert(!match.queue.jack, "queue is spent");
  assert(match.upgrades.spread === 1, "spread stays");
  const y = match.player.ty;
  const wall = match.player.tx + 1;
  match.type[y * COLS + wall] = WALL;
  match.player.moving = false;
  match.diff.regen = 0;
  match.diff.drain = 0;
  match.player.energy = 80;
  step(match, { ...idle, right: true }, 0.2);
  assert(match.type[y * COLS + wall] === AIR, "jackhammer opens a wall");
  assert(match.player.energy === 80, "jackhammer costs no life");
  match.player.moving = false;
  match.player.tx = wall;
  match.upgrades.spread = 1;
  match.player.cool = 0;
  match.player.energy = 80;
  const aim = y;
  for (let s = 1; s <= 8; s++) match.type[aim * COLS + match.player.tx + s] = AIR;
  step(match, { ...idle, shoot: true }, 0.05);
  assert(match.balls.length === 3, `spread fires three balls (${match.balls.length})`);
}

{
  const match = createMatch({ seed: 19, difficulty: "normal" });
  match.player.invT = 30;
  match.player.energy = 100;
  assert(strike(match, match.player, 30) === 0, "invincible ignores the hit");
  assert(match.player.energy === 100, "life stays full");
  match.player.invT = 0;
  let spot = -1;
  for (let i = 0; i < match.lootAt.length; i++) {
    if (match.lootAt[i]) {
      spot = i;
      break;
    }
  }
  assert(spot >= 0, "round hides bonuses in the ground");
  const lx = spot % COLS;
  const ly = (spot / COLS) | 0;
  const code = match.lootAt[spot];
  match.player.tx = lx - 1;
  match.player.ty = ly;
  match.player.facing = 2;
  match.player.moving = false;
  match.player.cool = 0;
  match.player.energy = 90;
  match.grace = 0;
  match.type[ly * COLS + lx] = SOIL;
  step(match, { ...idle, shoot: true }, 0.25);
  const gained = match.upgrades.power + match.upgrades.rate + match.upgrades.speed + match.upgrades.spread + match.upgrades.laser;
  assert(
    match.lootAt[spot] === 0 && (match.player.jackT > 0 || match.player.invT > 0 || match.player.ghostT > 0 || gained > 0),
    `shot uncovers the planted bonus ${code}`,
  );
  const first = match.lootAt.slice();
  match.phase = "shop";
  startNextRound(match);
  let moved = 0;
  for (let i = 0; i < first.length; i++) if (first[i] !== match.lootAt[i]) moved += 1;
  assert(moved > 20, "bonus spots change the next round");
}

{
  const match = createMatch({ seed: 20, difficulty: "normal" });
  match.phase = "shop";
  match.points = 6;
  assert(buy(match, "ghost").ok, "ghost costs 4");
  assert(match.points === 2, "2 points left");
  assert(buy(match, "laser").ok, "laser costs the remaining 2");
  assert(match.upgrades.laser === 1, "laser stays");
  startNextRound(match);
  assert(match.player.ghostT === 40, "ghost lasts 40 s");
  match.player.facing = 2;
  match.player.moving = false;
  const spot = ghostSpot(match.player);
  match.player.energy = 100;
  match.balls.push({
    x: spot.x,
    y: spot.y,
    vx: -200,
    vy: 0,
    age: 0,
    pen: 2,
    rockDmg: 1,
    dmg: 30,
    r: 3.1,
    laser: false,
    owner: "enemy",
    tx: -99,
    ty: -99,
  });
  step(match, idle, 0.05);
  assert(match.player.energy === 100, "ghost catches the shot");
  assert(match.balls.length === 0, "caught shot is gone");
  const rock = match.player.ty * COLS + (match.player.tx + 1);
  match.type[rock] = ROCK;
  match.rock[rock] = 3;
  match.player.cool = 0;
  match.player.energy = 90;
  step(match, { ...idle, shoot: true }, 0.05);
  assert(match.rock[rock] === 1, `laser bite is 2 (${match.rock[rock]})`);
}

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("sim tests ok");
