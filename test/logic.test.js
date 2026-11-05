import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADRENALINE,
  COLS,
  COMBO_MAX,
  COMBO_WINDOW,
  FOOD_POINTS,
  MAX_NAMES,
  ROWS,
  START,
  WIN_BONUS,
  chaseText,
  comboAfter,
  comboPips,
  commitRun,
  createGame,
  emptySave,
  nameKey,
  parseSave,
  profileLine,
  queueDir,
  randomName,
  rankFlavor,
  rankOf,
  reasonLine,
  rememberName,
  sanitizeName,
  scoreBite,
  serializeSave,
  shadowBlurb,
  shiftsWord,
  speedForEaten,
  standings,
  tick,
  verdict,
  wipeScores,
} from '../js/logic.js';

test('name is trimmed, capped, and shared across casing', () => {
  assert.deepEqual(sanitizeName('   '), { ok: false, error: 'empty' });
  assert.deepEqual(sanitizeName('  Agent   Kvá  '), { ok: true, name: 'Agent Kvá' });
  assert.equal(sanitizeName('A'.repeat(17)).error, 'long');
  assert.equal(sanitizeName('Kachna<script>').error, 'bad');
  assert.equal(nameKey('KVÁ'), nameKey('kvá'));
});

test('random cover names fit on the marquee', () => {
  for (let i = 0; i < 20; i += 1) {
    const name = randomName(() => i / 20);
    assert.equal(sanitizeName(name).ok, true);
  }
});

test('shifts keep Czech plural', () => {
  assert.equal(shiftsWord(1), '1 směna');
  assert.equal(shiftsWord(3), '3 směny');
  assert.equal(shiftsWord(5), '5 směn');
});

test('bite score, combo meter and speed', () => {
  assert.equal(scoreBite(1, 1), FOOD_POINTS);
  assert.equal(scoreBite(2, 4), FOOD_POINTS * 2 + ADRENALINE);
  assert.equal(scoreBite(5, 8), FOOD_POINTS * 5 + ADRENALINE);
  assert.equal(comboAfter(1, 99), 1);
  assert.equal(comboAfter(1, 0), 2);
  assert.equal(comboAfter(4, COMBO_WINDOW - 1), 5);
  assert.equal(comboAfter(COMBO_MAX, 3), COMBO_MAX);
  assert.equal(comboAfter(4, COMBO_WINDOW), 1);
  assert.equal(comboPips(0), COMBO_WINDOW);
  assert.equal(comboPips(9), 1);
  assert.equal(comboPips(10), 0);
  assert.equal(speedForEaten(0), 180);
  assert.equal(speedForEaten(14), 72);
  assert.equal(speedForEaten(40), 72);
});

test('opening bite is worth the base ten and grows the duck', () => {
  const game = createGame(1);
  assert.deepEqual(game.food, START.food);
  for (let i = 0; i < 5; i += 1) tick(game);
  assert.equal(game.alive, true);
  assert.equal(game.score, 10);
  assert.equal(game.combo, 1);
  assert.equal(game.eaten, 1);
  assert.equal(game.stepsSinceEat, 0);
  assert.equal(game.snake.length, 4);
  assert.deepEqual(game.snake[0], { x: 8, y: 8 });
  assert.ok(game.snake.every((part) => part.x !== game.food.x || part.y !== game.food.y));
});

test('a fast second bite raises the combo', () => {
  const game = createGame(1);
  game.food = { x: 4, y: 8 };
  game.stepsSinceEat = 4;
  tick(game);
  assert.equal(game.combo, 2);
  assert.equal(game.score, 20);
});

test('reverse is ignored and two turns stay buffered', () => {
  const game = createGame(1);
  queueDir(game, 'left');
  tick(game);
  assert.equal(game.dir, 'right');
  assert.equal(game.snake[0].x, 4);

  const turned = createGame(1);
  queueDir(turned, 'up');
  queueDir(turned, 'left');
  tick(turned);
  tick(turned);
  assert.equal(turned.dir, 'left');
  assert.deepEqual(turned.snake[0], { x: 2, y: 7 });

  const blocked = createGame(1);
  queueDir(blocked, 'up');
  queueDir(blocked, 'down');
  assert.deepEqual(blocked.buffer, ['up']);
});

test('the tail can be entered when it is about to move', () => {
  const game = createGame(1);
  game.snake = [
    { x: 2, y: 1 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];
  game.dir = 'up';
  game.food = { x: 10, y: 10 };
  tick(game);
  assert.equal(game.alive, true);
  assert.deepEqual(game.snake[0], { x: 2, y: 0 });
});

test('wall and self end the shift', () => {
  const wall = createGame(1);
  wall.snake = [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
  ];
  wall.dir = 'left';
  tick(wall);
  assert.equal(wall.alive, false);
  assert.equal(wall.reason, 'wall');

  const self = createGame(1);
  self.snake = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
  ];
  self.dir = 'down';
  self.food = { x: 10, y: 10 };
  tick(self);
  assert.equal(self.alive, false);
  assert.equal(self.reason, 'self');
});

test('clearing the market pays the tax bonus', () => {
  const game = createGame(1);
  const rest = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (x === 0 && y === 0) continue;
      if (x === 1 && y === 0) continue;
      rest.push({ x, y });
    }
  }
  game.snake = [{ x: 1, y: 0 }, ...rest];
  game.food = { x: 0, y: 0 };
  game.dir = 'left';
  game.stepsSinceEat = 99;
  game.combo = 1;
  game.eaten = 1;
  tick(game);
  assert.equal(game.won, true);
  assert.equal(game.reason, 'win');
  assert.equal(game.score, FOOD_POINTS + WIN_BONUS);
  assert.equal(game.snake.length, COLS * ROWS);
});

test('same seed and moves spawn the same rohlík', () => {
  const run = (seed) => {
    const game = createGame(seed);
    for (let i = 0; i < 7; i += 1) tick(game);
    return { food: game.food, score: game.score };
  };
  assert.deepEqual(run(7), run(7));
});

test('save roundtrip, shadow and hall', () => {
  let db = emptySave();
  assert.equal(parseSave('{').v, 1);
  assert.equal(parseSave('{"v":2}').lastName, '');

  db = rememberName(db, '  Kvá  ');
  assert.equal(db.lastName, 'Kvá');
  let first = commitRun(db, 'Kvá', 10, 1000);
  assert.equal(verdict(first.summary).kind, 'first');
  assert.equal(verdict(first.summary).title, 'První stín je na světě.');

  let again = commitRun(first.db, 'KVÁ', 40, 2000);
  assert.equal(standings(again.db).length, 1);
  assert.equal(standings(again.db)[0].display, 'KVÁ');
  assert.equal(standings(again.db)[0].best, 40);
  assert.equal(again.summary.bestBefore, 10);
  const record = verdict(again.summary);
  assert.equal(record.kind, 'record');
  assert.equal(record.title, 'Vlastní stín je v prachu.');
  assert.match(record.detail, /Náskok 30/);

  const tie = verdict(commitRun(again.db, 'kvá', 40, 3000).summary);
  assert.equal(tie.kind, 'tie');

  const downRun = commitRun(again.db, 'kvá', 12, 2500);
  const down = verdict(downRun.summary);
  assert.equal(down.kind, 'down');

  const up = verdict(commitRun(downRun.db, 'kvá', 20, 2600).summary);
  assert.equal(up.kind, 'up');
  assert.match(up.detail, /chybí 20/);

  const flat = verdict(commitRun(downRun.db, 'kvá', 12, 2700).summary);
  assert.equal(flat.kind, 'flat');

  const zero = verdict(commitRun(emptySave(), 'Kvá', 0, 1).summary);
  assert.equal(zero.kind, 'zero');

  const restored = parseSave(serializeSave(again.db));
  assert.equal(restored.lastName, 'KVÁ');
  assert.equal(entryScore(restored), 40);
  assert.match(profileLine(restored), /KVÁ: stín 40 kvá/);
  assert.match(shadowBlurb(restored.byName[nameKey('kvá')]), /Stín: 40 kvá/);
  assert.match(reasonLine('wall'), /Zeď/);
  assert.match(reasonLine('self'), /peří/);
});

function entryScore(db) {
  return db.byName[nameKey('kvá')].best;
}

test('hall ranks the earlier shadow first when the score ties', () => {
  let db = emptySave();
  db = commitRun(db, 'Alfa', 30, 100).db;
  db = commitRun(db, 'Beta', 50, 200).db;
  db = commitRun(db, 'Gama', 30, 300).db;
  assert.deepEqual(
    standings(db).map((row) => row.display),
    ['Beta', 'Alfa', 'Gama'],
  );
  assert.equal(rankOf(db, 'beta'), 1);
  assert.equal(rankOf(db, 'Alfa'), 2);
  assert.equal(rankFlavor(1), 'První místo ve výloze. Růžové brýle to ustojí.');
  assert.match(rankFlavor(4), /4\. místo/);
  assert.equal(chaseText(0, 0), 'první stín');
  assert.equal(chaseText(10, 40), 'do stínu 30');
  assert.equal(chaseText(40, 40), 'stín dohnán');
  assert.equal(chaseText(55, 40), 'nad stínem +15');
});

test('the book forgets the weakest names and keeps the duck currently playing', () => {
  let db = emptySave();
  for (let i = 0; i < MAX_NAMES; i += 1) {
    db = commitRun(db, `Kachna ${i}`, 100 + i, 10 + i).db;
  }
  db = commitRun(db, 'Hrdina', 1, 999).db;
  assert.equal(Object.keys(db.byName).length, MAX_NAMES);
  assert.equal(db.byName[nameKey('Hrdina')].best, 1);
  assert.equal(db.byName[nameKey('Kachna 0')], undefined);
  const wiped = wipeScores(db);
  assert.equal(wiped.lastName, 'Hrdina');
  assert.equal(Object.keys(wiped.byName).length, 0);
});

test('corrupt hall entries are dropped', () => {
  const raw = JSON.stringify({
    v: 1,
    lastName: 'Kvá',
    muted: true,
    byName: {
      bad: { display: '<ne>', best: 10, last: 10, games: 1 },
      ok: { display: 'Kvá', best: 12, last: 4, games: 2, bestAt: 5 },
    },
  });
  const db = parseSave(raw);
  assert.equal(db.muted, true);
  assert.equal(Object.keys(db.byName).length, 1);
  assert.equal(db.byName[nameKey('Kvá')].best, 12);
});
