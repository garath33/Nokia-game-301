import {
  AIR,
  CLAY,
  COLS,
  GRAVEL,
  PAD,
  ROCK,
  SAND,
  SHOT_COST,
  SOIL,
  WALL,
  densityOf,
  buy,
  clearLine,
  createMatch,
  facingToward,
  findPath,
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
  close(match.player.energy, 50 - match.diff.drain * 2, 0.15, "drain outside");
}

{
  const match = createMatch({ seed: 5, difficulty: "normal" });
  match.grace = 0;
  match.player.energy = 40;
  step(match, idle, 1);
  close(match.player.energy, 40 + match.diff.regen, 0.2, "regen on own pad");
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

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("sim tests ok");
