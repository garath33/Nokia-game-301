import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
const audio = readFileSync(new URL("../js/audio.js", import.meta.url), "utf8");

test("hudba a efekty mají vlastní ovládání v menu i v pauze", () => {
  assert.equal((html.match(/data-sound="music"/g) || []).length, 2);
  assert.equal((html.match(/data-sound="effects"/g) || []).length, 2);
  assert.equal(html.includes('id="mute"'), false);
  assert.match(main, /function toggleMusic\(/);
  assert.match(main, /function toggleEffects\(/);
  assert.match(main, /key === "m"/);
  assert.match(main, /key === "n"/);
  assert.match(main, /audio\.nextRound\(\)/);
  assert.match(audio, /setMusic\(value\)/);
  assert.match(audio, /setEffects\(value\)/);
});
