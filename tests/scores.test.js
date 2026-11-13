import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  BOARD_LIMIT,
  BOX_POINTS,
  DEFAULT_DUCK,
  HIT_POINTS,
  cleanName,
  countPhrase,
  emptyBoards,
  readBoards,
  submitScore,
  tallyScore,
} from "../js/scores.js";

test("bednička váží víc než zásah", () => {
  assert.equal(tallyScore(0, 0), 0);
  assert.equal(tallyScore(1, 0), HIT_POINTS);
  assert.equal(tallyScore(0, 1), BOX_POINTS);
  assert.equal(tallyScore(3, 2), 3 * HIT_POINTS + 2 * BOX_POINTS);
  assert.ok(BOX_POINTS > HIT_POINTS);
  assert.equal(tallyScore(-4, 1.9), BOX_POINTS);
});

test("jméno kačenky se ořeže a prázdné spadne na Kačík", () => {
  assert.equal(cleanName("  Žluťásek  "), "Žluťásek");
  assert.equal(cleanName("A   B"), "A B");
  assert.equal(cleanName(""), DEFAULT_DUCK);
  assert.equal(cleanName("   "), DEFAULT_DUCK);
  assert.equal(cleanName(null), DEFAULT_DUCK);
  assert.equal(Array.from(cleanName("Ž".repeat(40))).length, 16);
  assert.equal(cleanName("abc\u0000de"), "abcde");
});

test("počty skloňují bedničky a zásahy", () => {
  assert.equal(countPhrase(1, "bednička", "bedničky", "bedniček"), "1 bednička");
  assert.equal(countPhrase(3, "bednička", "bedničky", "bedniček"), "3 bedničky");
  assert.equal(countPhrase(5, "zásah", "zásahy", "zásahů"), "5 zásahů");
  assert.equal(countPhrase(11, "zásah", "zásahy", "zásahů"), "11 zásahů");
  assert.equal(countPhrase(22, "zásah", "zásahy", "zásahů"), "22 zásahy");
});

test("desítka je zvlášť pro každou obtížnost a drží jen deset", () => {
  let boards = emptyBoards();
  for (let n = 1; n <= 12; n++) {
    const saved = submitScore(boards, {
      name: `K${n}`,
      difficulty: "hard",
      hits: n,
      boxes: 0,
      winsNeeded: 5,
      won: n % 2 === 0,
      at: n,
    });
    boards = saved.boards;
  }
  assert.equal(boards.hard.length, BOARD_LIMIT);
  assert.equal(boards.easy.length, 0);
  assert.equal(boards.normal.length, 0);
  assert.equal(boards.hard[0].name, "K12");
  assert.equal(boards.hard[0].score, 12 * HIT_POINTS);
  assert.equal(boards.hard[9].name, "K3");
  assert.equal(boards.hard.some((row) => row.name === "K1"), false);
  assert.equal(boards.hard[0].won, true);
  assert.equal(boards.hard[0].winsNeeded, 5);

  const easy = submitScore(boards, {
    name: "Lehká kačka",
    difficulty: "easy",
    hits: 0,
    boxes: 1,
    winsNeeded: 8,
    won: false,
    at: 1,
  });
  assert.equal(easy.placed, true);
  assert.equal(easy.rank, 1);
  assert.equal(easy.boards.easy.length, 1);
  assert.equal(easy.boards.hard.length, BOARD_LIMIT);
});

test("stejné skóre drží dřívější zápis a nula se nezapisuje", () => {
  const first = submitScore(emptyBoards(), {
    name: "  ",
    difficulty: "normal",
    hits: 0,
    boxes: 1,
    winsNeeded: 3,
    won: true,
    at: 10,
  });
  assert.equal(first.boards.normal[0].name, DEFAULT_DUCK);
  const second = submitScore(first.boards, {
    name: "Pozdě",
    difficulty: "normal",
    hits: 5,
    boxes: 0,
    winsNeeded: 3,
    won: false,
    at: 11,
  });
  assert.equal(tallyScore(5, 0), tallyScore(0, 1));
  assert.equal(second.boards.normal[0].name, DEFAULT_DUCK);
  assert.equal(second.rank, 2);

  const packed = emptyBoards();
  packed.normal = Array.from({ length: BOARD_LIMIT }, (_, index) => ({
    name: `M${index}`,
    hits: 0,
    boxes: 1,
    winsNeeded: 3,
    won: true,
    at: index + 1,
  }));
  const outside = submitScore(packed, {
    name: "Mimo",
    difficulty: "normal",
    hits: 0,
    boxes: 1,
    winsNeeded: 3,
    won: true,
    at: 100,
  });
  assert.equal(outside.placed, false);
  assert.equal(outside.rank, 0);
  assert.equal(outside.boards.normal.some((row) => row.name === "Mimo"), false);

  const blank = submitScore(first.boards, {
    name: "Nikdo",
    difficulty: "normal",
    hits: 0,
    boxes: 0,
    at: 1,
  });
  assert.equal(blank.placed, false);
  assert.equal(blank.score, 0);
  assert.equal(blank.boards.normal.length, 1);
});

test("rozbitý záznam se při čtení zahodí", () => {
  const boards = readBoards({
    easy: [{ name: "<kačka>", hits: 2, boxes: 1, winsNeeded: 4, won: true, at: 5 }, null, "ne"],
    normal: { nope: true },
    hard: [{ hits: 0, boxes: 0, name: "Nula" }],
  });
  assert.equal(boards.easy.length, 1);
  assert.equal(boards.easy[0].name, "<kačka>");
  assert.equal(boards.easy[0].winsNeeded, 3);
  assert.equal(boards.easy[0].score, tallyScore(2, 1));
  assert.equal(boards.normal.length, 0);
  assert.equal(boards.hard.length, 0);
});

test("texty hry nepoužívají pojmenování tunelera", () => {
  const files = [
    "index.html",
    "kachna.html",
    "README.md",
    "docs/verze.md",
    "js/main.js",
    "js/render.js",
    "js/sim.js",
    "css/tunik.css",
  ];
  for (const path of files) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    assert.equal(/tunel(?:er|ovka)/i.test(source), false, path);
  }
});
