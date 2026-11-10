import assert from "node:assert/strict";
import test from "node:test";
import { SONGS, pickSongIndex } from "../js/audio.js";

test("čtyři různé skladby mají stejné délky hlasů", () => {
  assert.equal(SONGS.length, 4);
  const names = SONGS.map((song) => song.name);
  assert.deepEqual(names, ["Pochod", "Bažina", "Rychlík", "Kolébka"]);
  assert.equal(new Set(names).size, names.length);
  for (const song of SONGS) {
    assert.equal(song.lead.length, song.bass.length);
    assert.ok(song.lead.length >= 32);
    assert.ok(song.bpm >= 70 && song.bpm <= 160);
    for (const note of [...song.lead, ...song.bass]) {
      assert.equal(Number.isInteger(note), true);
      assert.ok(note === 0 || (note >= 36 && note <= 96));
    }
  }
});

test("další kolo nezvolí stejnou skladbu", () => {
  assert.equal(pickSongIndex(0, 4, () => 0), 1);
  assert.equal(pickSongIndex(1, 4, () => 0.5), 2);
  assert.equal(pickSongIndex(2, 4, () => 0.5), 3);
  assert.equal(pickSongIndex(3, 4, () => 0.99), 0);
  for (let current = 0; current < SONGS.length; current += 1) {
    for (let i = 0; i < 20; i += 1) {
      const next = pickSongIndex(current, SONGS.length, Math.random);
      assert.notEqual(next, current);
      assert.ok(next >= 0 && next < SONGS.length);
    }
  }
});
