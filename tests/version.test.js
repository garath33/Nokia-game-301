import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GAME_VERSION, versionLabel } from "../js/version.js";

const label = versionLabel();

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("verze je hlavní číslo a subverze", () => {
  assert.match(String(GAME_VERSION), /^\d+\.\d+$/);
  const [major, minor] = String(GAME_VERSION).split(".").map(Number);
  assert.ok(major >= 15);
  assert.ok(minor >= 1);
});

test("stránky, záznam i kód ukazují stejnou verzi", () => {
  const source = read("js/version.js");
  const index = read("index.html");
  const kachna = read("kachna.html");
  const log = read("docs/verze.md");
  const readme = read("README.md");

  assert.match(source, new RegExp(`export const GAME_VERSION = "${GAME_VERSION}";`));
  for (const page of [index, kachna]) {
    const marks = page.match(/verze \d+\.\d+/g) || [];
    assert.ok(marks.length > 0);
    assert.deepEqual(marks, marks.map(() => label));
  }
  assert.match(readme, new RegExp(`\\*\\*${GAME_VERSION}\\*\\*`));

  const headings = [...log.matchAll(/^## (\d+(?:\.\d+)?) — /gm)].map((match) => match[1]);
  assert.ok(headings.length > 0);
  assert.equal(headings[0], String(GAME_VERSION));
  const value = (text) => {
    const [major, minor = 0] = String(text).split(".").map(Number);
    return major * 1000 + minor;
  };
  const sorted = [...headings].sort((a, b) => value(b) - value(a));
  assert.deepEqual(headings, sorted);
});
