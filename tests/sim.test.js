import {
  AIR,
  BOON_POWER,
  BOON_RATE,
  CLAY,
  COLS,
  GRAVEL,
  PAD,
  ROCK,
  SAND,
  TILE,
  SHELTER_REGEN,
  SHOT_COST,
  SHOT_FLOOR,
  SOIL,
  GIFT,
  VICTORY,
  WALL,
  densityOf,
  buy,
  clearLine,
  createMatch,
  facingToward,
  findPath,
  shootingPower,
  shootingRate,
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
    assert(bunkerExits(match, match.player.homeX, match.player.homeY) === 4, `player exits ${seed} ${difficulty}`);
    assert(bunkerExits(match, match.enemy.homeX, match.enemy.homeY) === 4, `enemy exits ${seed} ${difficulty}`);
  }
}

function bunkerExits(match, cx, cy) {
  const vents = [
    [1, 0, 4],
    [-1, 0, 4],
    [0, 1, 3],
    [0, -1, 3],
  ];
  let open = 0;
  for (const [dx, dy, span] of vents) {
    const x = cx + dx * span;
    const y = cy + dy * span;
    if (match.type[y * COLS + x] === AIR) open += 1;
  }
  return open;
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
  close(match.player.energy, 40 + match.diff.regen * SHELTER_REGEN, 0.2, "regen on own pad");
  match.grace = 10;
  match.enemy.tx = match.player.tx;
  match.enemy.ty = match.player.ty;
  match.enemy.moving = false;
  match.enemy.energy = 40;
  step(match, idle, 0.05);
  assert(match.enemy.energy > 40, "any shelter refills, including the rival bunker");
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

{
  const match = createMatch({ seed: 24, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  match.player.energy = 4;
  const homeX = match.player.tx;
  const homeY = match.player.ty;
  step(match, shoot, 1.2);
  assert(match.phase === "play", "shelter shots do not end the round");
  assert(match.player.alive, "player survives an empty magazine");
  assert(match.balls.length === 0, "no ball without a paid shot");
  close(match.player.energy, 4, 0.05, "unpaid shot spends nothing");
  assert(match.player.holdShot, "duck waits for a real shot");
  step(match, { ...shoot, right: true, up: true }, 0.4);
  assert(match.player.tx === homeX && match.player.ty === homeY, "waiting duck stays in the shelter");
  match.diff.regen = 30;
  step(match, shoot, 0.8);
  assert(match.phase === "play" && match.player.energy > 0, "charged shelter shot leaves the duck alive");
  assert(match.balls.length >= 1, "shot fires once life covers it");
  assert(match.player.energy > SHOT_FLOOR - 0.05, "shelter shot keeps a sliver of life");
}

{
  const match = createMatch({ seed: 26, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  match.player.energy = SHOT_COST + SHOT_FLOOR + 0.2;
  const homeX = match.player.tx;
  const homeY = match.player.ty;
  step(match, shoot, 0.05);
  assert(match.balls.length === 1, "last affordable shelter shot still fires");
  assert(match.player.energy > 0 && match.phase === "play", "that shot does not kill");
  assert(match.player.holdShot, "spent shot pins the duck");
  step(match, { ...idle, right: true }, 0.6);
  assert(match.player.tx === homeX && match.player.ty === homeY, "no leaving until a real shot is affordable");
  match.diff.regen = 40;
  step(match, idle, 0.4);
  assert(!match.player.holdShot, "pin releases once a shot is affordable");
  assert(match.player.energy > SHOT_COST + SHOT_FLOOR, "life covers a real shot");
}

{
  const match = createMatch({ seed: 25, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  const shotId = y * COLS + x;
  const digX = match.player.tx;
  const digY = match.player.ty + 1;
  const digId = digY * COLS + digX;
  match.ground[digId] = SOIL;
  match.type[shotId] = SOIL;
  match.pad[shotId] = 0;
  match.type[digId] = SOIL;
  match.pad[digId] = 0;
  match.player.facing = 2;
  match.player.energy = 80;
  step(match, shoot, 0.05);
  step(match, idle, 0.35);
  assert(match.type[shotId] === AIR, "shot opens the tile");
  assert(match.shot[shotId] === 1, "shot is remembered");
  match.player.energy = 80;
  match.player.moving = false;
  match.player.tx = match.player.homeX;
  match.player.ty = match.player.homeY;
  match.player.wish = null;
  step(match, { ...idle, down: true }, 0.8);
  assert(match.type[digId] === AIR, "dig opens a tile");
  assert(!match.shot[digId], "digging is not a shot hole");
  const ground = match.ground;
  match.phase = "shop";
  assert(startNextRound(match), "round keeps the earth");
  assert(match.ground === ground, "ground lasts the match");
  assert(match.shot[shotId] === 1, "shot memory survives the round");
  const covered = match.pad[shotId] !== 0 || match.type[shotId] === WALL;
  if (!covered) assert(match.type[shotId] === AIR, "shot hole stays open");
  if (match.pad[digId] === 0 && match.type[digId] !== WALL) {
    assert(match.type[digId] === match.ground[digId], "dug earth grows back");
  }
  const fresh = createMatch({ seed: 25, difficulty: "normal" });
  assert(!fresh.shot.some((v) => v), "a new match forgets shot walls");
  assert(fresh.scars.size === 0, "a new match has no shrapnel");
}

{
  const match = createMatch({ seed: 11, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  const id = y * COLS + x;
  match.type[id] = WALL;
  match.pad[id] = 0;
  match.player.facing = 2;
  match.player.cool = 0;
  match.player.energy = 80;
  match.events.length = 0;
  step(match, shoot, 0.05);
  step(match, idle, 0.25);
  assert(match.type[id] === WALL, "a solid wall stays shut");
  assert(!match.shot[id], "a stopped shot does not open the wall");
  assert(match.events.some((event) => event.t === "smudge" && event.x === x && event.y === y), "wall hit leaves a smudge");
  assert(!match.events.some((event) => event.t === "chip" && event.x === x && event.y === y), "a solid wall does not chip");
}

{
  const match = createMatch({ seed: 12, difficulty: "normal" });
  const ox = 24;
  const oy = 16;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const i = (oy + dy) * COLS + (ox + dx);
      match.type[i] = WALL;
      match.pad[i] = 0;
    }
  }
  const border = 3 * COLS + 1;
  match.type[border] = WALL;
  match.enemy.tx = ox;
  match.enemy.ty = oy;
  match.enemy.energy = 4;
  match.enemy.armorT = 0;
  match.enemy.armorLevel = 0;
  const remembered = match.shot.reduce((sum, value) => sum + value, 0);
  strike(match, match.enemy, 40);
  step(match, idle, 0.05);
  assert(match.phase === "shop", "the blast still ends the round");
  assert(match.scars.size > 0, "shrapnel marks nearby walls");
  let brokeEdge = false;
  let bunkerBite = false;
  for (const [i, bites] of match.scars) {
    assert(match.type[i] === WALL, "a bitten tile is still a wall");
    assert(bites.length > 0 && bites.length <= 6, "a wall collects a few bites");
    for (const bite of bites) {
      assert(bite.pts.length === 3, "a bite is a short tunnel");
      for (const p of bite.pts) {
        assert(p.x > 0 && p.x < TILE && p.y > 0 && p.y < TILE && p.r > 1, "the tunnel stays on the tile");
      }
      const mouth = bite.pts[0];
      const end = bite.pts[bite.pts.length - 1];
      if (Math.hypot(mouth.x - end.x, mouth.y - end.y) > 2) brokeEdge = true;
    }
    if (match.ground[i] !== WALL) bunkerBite = true;
  }
  assert(brokeEdge, "shrapnel bores into the wall");
  assert(bunkerBite, "fresh walls get bitten too");
  assert(match.shot.reduce((sum, value) => sum + value, 0) === remembered, "shrapnel is not a shot hole");
  const borderBites = match.scars.get(border);
  match.enemy.tx = 2;
  match.enemy.ty = 3;
  match.enemy.energy = 4;
  match.enemy.hitGrace = 0;
  match.phase = "play";
  strike(match, match.enemy, 40);
  step(match, idle, 0.05);
  if (match.ground[border] === WALL) assert(match.scars.get(border), "the map edge can be bitten");
  assert(borderBites || match.scars.get(border), "a blast reaches a nearby wall");
  match.phase = "shop";
  assert(startNextRound(match), "next round rebuilds the earth");
  for (const i of match.scars.keys()) {
    assert(match.ground[i] === WALL, "only walls that stay for the match keep the bites");
  }
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const i = (oy + dy) * COLS + (ox + dx);
      if (match.ground[i] !== WALL) assert(!match.scars.has(i), "a rebuilt bunker forgets shrapnel");
    }
  }
}

assert(VICTORY.title === "Vítězství!", "victory title");
assert(VICTORY.creed === "Nechť tě kachní síla provází.", "victory creed");

{
  const match = createMatch({ seed: 7, difficulty: "normal" });
  let boons = 0;
  let powers = 0;
  let rates = 0;
  for (let i = 0; i < match.boon.length; i++) {
    if (!match.boon[i]) continue;
    boons += 1;
    if (match.boon[i] === BOON_POWER) powers += 1;
    else if (match.boon[i] === BOON_RATE) rates += 1;
    const cell = match.type[i];
    assert(cell === SAND || cell === SOIL || cell === CLAY || cell === GRAVEL, "boon sits in earth");
    const x = i % COLS;
    const y = (i / COLS) | 0;
    assert(Math.hypot(x - match.player.homeX, y - match.player.homeY) >= 6, "boon stays off the home bunker");
    assert(Math.hypot(x - match.enemy.homeX, y - match.enemy.homeY) >= 6, "boon stays off the rival bunker");
  }
  assert(boons === 5, `five lucky tiles (${boons})`);
  assert(powers >= 1 && rates >= 1, "both shot bonuses appear");
  let nearest = 999;
  for (let i = 0; i < match.boon.length; i++) {
    if (!match.boon[i]) continue;
    const x = i % COLS;
    const y = (i / COLS) | 0;
    nearest = Math.min(nearest, Math.hypot(x - match.player.homeX, y - match.player.homeY));
  }
  assert(nearest <= 16, `a lucky tile waits outside the bunker (${nearest})`);
  assert(match.found.power === 0 && match.found.rate === 0, "round starts from bought shooting");
}

{
  const match = createMatch({ seed: 27, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  match.diff.drain = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  const id = y * COLS + x;
  match.type[id] = SAND;
  match.pad[id] = 0;
  match.rock[id] = 0;
  match.boon[id] = BOON_POWER;
  match.player.energy = 90;
  let guard = 0;
  while ((match.player.tx !== x || match.player.ty !== y) && guard++ < 50) {
    step(match, { ...idle, right: true }, 0.05);
  }
  assert(match.player.tx === x && match.player.ty === y, "duck lands on the tile");
  assert(match.found.power === 1 && match.boon[id] === 0, "landing grants shot power for this round");
  assert(match.gifts.length === 1 && match.gifts[0].id === "power", "the find announces itself");
  assert(GIFT.line === "Získáváš…" && GIFT.name === "Zbiječku!", "the find is named");
  assert(shootingPower(match) === 1 && shootingRate(match) === 0, "tile power is live");
  match.player.moving = false;
  match.player.wish = null;
  match.player.facing = 2;
  match.player.cool = 0;
  match.balls.length = 0;
  step(match, shoot, 0.05);
  assert(match.balls.length === 1 && match.balls[0].pen === shotPen(1), "tile raises penetration");

  const rateX = x + 1;
  const rateId = y * COLS + rateX;
  match.type[rateId] = SAND;
  match.pad[rateId] = 0;
  match.rock[rateId] = 0;
  match.boon[rateId] = BOON_RATE;
  match.player.energy = 90;
  match.player.moving = false;
  guard = 0;
  while (match.player.tx !== rateX && guard++ < 50) step(match, { ...idle, right: true }, 0.05);
  assert(match.found.power === 1 && match.found.rate === 1, "both tile bonuses last this round");
  assert(shootingRate(match) === 1, "tile rate is live");

  match.points = 4;
  match.enemy.energy = 0;
  step(match, idle, 0.05);
  assert(match.phase === "shop", "a kill opens the shop with the tile still held");
  assert(match.found.power === 1 && match.found.rate === 1, "dying this round does not erase a fresh tile");
  assert(buy(match, "power").ok, "purchase is separate from the tile");
  assert(match.upgrades.power === 1, "bought power");
  assert(startNextRound(match), "next round keeps the tile");
  assert(match.found.power === 1 && match.found.rate === 1, "tile bonuses last the next round");
  assert(match.upgrades.power === 1 && match.upgrades.rate === 0 && match.upgrades.armor === 0, "bought shooting stays");
  assert(shootingPower(match) === 2 && shootingRate(match) === 1, "next round shoots with the tile and the purchase");
  match.grace = 0;
  match.diff.regen = 0;
  match.diff.drain = 0;
  match.player.cool = 0;
  match.player.facing = 2;
  match.player.energy = 40;
  match.balls.length = 0;
  step(match, shoot, 0.05);
  assert(match.balls.length === 1 && match.balls[0].pen === shotPen(2), "the carried tile still raises penetration");
  match.enemy.energy = 0;
  step(match, idle, 0.05);
  assert(match.phase === "shop", "the next death opens the shop again");
  assert(match.found.power === 0 && match.found.rate === 0, "a death in the next round drops the tile");
  assert(match.upgrades.power === 1, "the purchase survives that death");
  assert(shootingPower(match) === 1 && shootingRate(match) === 0, "shooting falls back to the purchase");
  assert(startNextRound(match), "the round after that stays clean");
  assert(match.found.power === 0 && match.found.rate === 0, "the tile does not return");
  assert(shootingPower(match) === 1, "only the purchase remains");
}

{
  const match = createMatch({ seed: 28, difficulty: "normal" });
  match.grace = 0;
  match.diff.regen = 0;
  match.diff.drain = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  const id = y * COLS + x;
  match.type[id] = SAND;
  match.pad[id] = 0;
  match.rock[id] = 0;
  match.boon[id] = BOON_RATE;
  match.player.facing = 2;
  match.player.energy = 80;
  step(match, shoot, 0.05);
  step(match, idle, 0.45);
  assert(match.type[id] === AIR, "shot opens the lucky sand");
  assert(match.boon[id] === BOON_RATE && match.found.rate === 0, "a shot does not collect the tile");
  let guard = 0;
  while (match.player.tx !== x && guard++ < 40) step(match, { ...idle, right: true }, 0.05);
  assert(match.found.rate === 1 && match.boon[id] === 0, "rolling onto the opened tile collects it");
}

{
  const match = createMatch({ seed: 29, difficulty: "normal" });
  const x = match.enemy.tx + 1;
  const y = match.enemy.ty;
  const id = y * COLS + x;
  match.type[id] = AIR;
  match.pad[id] = 0;
  match.boon[id] = BOON_POWER;
  match.enemy.moving = true;
  match.enemy.ax = match.enemy.tx;
  match.enemy.ay = match.enemy.ty;
  match.enemy.bx = x;
  match.enemy.by = y;
  match.enemy.mt = 0.85;
  match.enemy.dur = 0.2;
  step(match, idle, 0.05);
  assert(match.enemy.tx === x && match.enemy.ty === y, "rival can cross the tile");
  assert(match.found.power === 0 && match.boon[id] === BOON_POWER, "only the player collects a lucky tile");
}

{
  const match = createMatch({ seed: 2, difficulty: "normal" });
  match.phase = "shop";
  match.points = 8;
  assert(buy(match, "ghost").ok, "buy ghost");
  assert(match.queue.ghost, "ghost waits for the next round");
  assert(buy(match, "spread").ok, "buy spread");
  startNextRound(match);
  assert(match.player.ghostT === 40, "ghost starts with the round");
  match.player.energy = 90;
  match.grace = 0;
  match.player.tx = 20;
  match.player.ty = 20;
  match.player.facing = 2;
  for (let y = 18; y <= 22; y++) {
    for (let x = 19; x <= 30; x++) match.type[y * COLS + x] = AIR;
  }
  const before = match.balls.length;
  step(match, shoot, 0.05);
  assert(match.balls.length === before + 6, "spread and ghost each fire three");
  match.balls.length = 0;
  match.player.cool = 0;
  match.type[20 * COLS + 21] = WALL;
  step(match, shoot, 0.05);
  assert(match.scar[20 * COLS + 21] > 0, "a shot scars the wall");
  match.grace = 10;
  match.player.tx = match.enemy.homeX;
  match.player.ty = match.enemy.homeY;
  match.player.moving = false;
  const parked = match.player.energy;
  step(match, idle, 0.4);
  assert(match.player.energy >= parked, "the player refills in the rival shelter");
}

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("sim tests ok");
