import { COLS, DIRS, ROCK, SAND, SHOT_COST, createMatch, step, strike } from "../js/sim.js";

let failed = 0;
const idle = { left: false, right: false, up: false, down: false, shoot: false };
const right = { ...idle, right: true };
const left = { ...idle, left: true };
const shoot = { ...idle, shoot: true };

function assert(cond, message) {
  if (!cond) {
    failed += 1;
    console.error("FAIL:", message);
  }
}

function prepare(cell) {
  const match = createMatch({ seed: 30, difficulty: "normal", winsNeeded: 3 });
  match.grace = 0;
  match.diff.regen = 0;
  match.diff.drain = 0;
  const x = match.player.tx + 1;
  const y = match.player.ty;
  const id = y * COLS + x;
  match.type[id] = cell;
  match.pad[id] = 0;
  match.rock[id] = cell === ROCK ? 3 : 0;
  return { match, id, energy: match.player.energy };
}

function digCost(cell) {
  const { match, id, energy } = prepare(cell);
  let guard = 0;
  while (match.type[id] !== 0 && guard++ < 80) step(match, right, 0.05);
  assert(match.type[id] === 0, `cleared ${cell}`);
  return { spent: energy - match.player.energy, time: match.time };
}

const sand = digCost(SAND);
const rock = digCost(ROCK);
assert(sand.spent < rock.spent, `sand costs less life than rock (${sand.spent} vs ${rock.spent})`);
assert(sand.time < rock.time, `sand digs faster than rock (${sand.time} vs ${rock.time})`);
assert(sand.spent < 3 && rock.spent > 7, "density gap is obvious in one tile");

{
  const match = createMatch({ seed: 31, difficulty: "normal", winsNeeded: 3 });
  match.grace = 0;
  match.diff.regen = 0;
  const aim = DIRS[match.player.facing];
  for (let s = 1; s <= 6; s++) {
    const x = match.player.tx + aim.x * s;
    const y = match.player.ty + aim.y * s;
    match.type[y * COLS + x] = 0;
  }
  const before = match.player.energy;
  step(match, shoot, 0.25);
  const spent = before - match.player.energy;
  assert(Math.abs(spent - SHOT_COST) < 0.2, `one trigger, one shot (${spent})`);
  assert(match.balls.length === 1, "the ball is in the air");
}

{
  const match = createMatch({ seed: 32, difficulty: "normal", winsNeeded: 3 });
  match.grace = 0;
  match.diff.drain = 0;
  const home = match.player.ty * COLS + match.player.tx;
  const out = home + 1;
  match.type[out] = SAND;
  match.pad[out] = 0;
  let guard = 0;
  while (match.player.tx === match.player.homeX && guard++ < 40) step(match, right, 0.05);
  guard = 0;
  while (match.player.tx !== match.player.homeX && guard++ < 40) step(match, left, 0.05);
  assert(match.pad[match.player.ty * COLS + match.player.tx] === 1, "back on own shelter");
  match.player.energy = 40;
  const low = 40;
  step(match, idle, 2);
  assert(match.player.energy > low + 10, "shelter refills life");
  assert(match.player.armorT === 0, "armor stays off until it is bought and life hits 100");
}

{
  const match = createMatch({ seed: 33, difficulty: "normal", winsNeeded: 3 });
  match.enemy.energy = 1;
  strike(match, match.enemy, 50);
  step(match, idle, 2);
  assert(match.wins === 1 && match.phase === "shop", "a kill is one win and opens the shop");
  match.wins = 2;
  match.enemy.energy = 1;
  match.enemy.hitGrace = 0;
  match.phase = "play";
  strike(match, match.enemy, 50);
  step(match, idle, 2);
  assert(match.phase === "over" && match.victor === "player", "the chosen length ends the match");
}

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log("experience ok");
