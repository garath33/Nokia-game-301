import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GAME_VERSION, versionLabel } from "../js/version.js";

const label = versionLabel();

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("číslo verze je kladné celé číslo", () => {
  assert.equal(Number.isInteger(GAME_VERSION), true);
  assert.ok(GAME_VERSION >= 10);
});

test("stránky, záznam i kód ukazují stejnou verzi", () => {
  const source = read("js/version.js");
  const index = read("index.html");
  const kachna = read("kachna.html");
  const log = read("docs/verze.md");
  const readme = read("README.md");

  assert.match(source, new RegExp(`export const GAME_VERSION = ${GAME_VERSION};`));
  for (const page of [index, kachna]) {
    const marks = page.match(/verze \d+/g) || [];
    assert.ok(marks.length > 0);
    assert.deepEqual(marks, marks.map(() => label));
  }
  assert.match(readme, new RegExp(`\\*\\*${GAME_VERSION}\\*\\*`));

  const headings = [...log.matchAll(/^## (\d+) — /gm)].map((match) => Number(match[1]));
  assert.ok(headings.length > 0);
  assert.equal(headings[0], GAME_VERSION);
  const sorted = [...headings].sort((a, b) => b - a);
  assert.deepEqual(headings, sorted);
});
