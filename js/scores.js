// Match score and the local top 10. Nothing leaves this browser.
// A collected upgrade box is worth more than a hit, and the boards
// are kept apart by difficulty.

export const BOX_POINTS = 50;
export const HIT_POINTS = 10;
export const BOARD_LIMIT = 10;
export const NAME_LIMIT = 16;
export const DEFAULT_DUCK = "Kačík";

const DIFFICULTIES = ["easy", "normal", "hard"];

export function tallyScore(hits, boxes) {
  return count(hits) * HIT_POINTS + count(boxes) * BOX_POINTS;
}

export function cleanName(raw) {
  const text = String(raw ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const cut = Array.from(text).slice(0, NAME_LIMIT).join("").trim();
  return cut || DEFAULT_DUCK;
}

export function countPhrase(n, one, few, many) {
  const value = count(n);
  const mod10 = value % 10;
  const mod100 = value % 100;
  let word = many;
  if (value === 1) word = one;
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) word = few;
  return `${value} ${word}`;
}

export function emptyBoards() {
  return { easy: [], normal: [], hard: [] };
}

export function readBoards(raw) {
  const boards = emptyBoards();
  if (!raw || typeof raw !== "object") return boards;
  for (const id of DIFFICULTIES) {
    const list = Array.isArray(raw[id]) ? raw[id] : [];
    boards[id] = list.map(cleanRow).filter(Boolean).sort(byRank).slice(0, BOARD_LIMIT);
  }
  return boards;
}

export function submitScore(boards, entry) {
  const next = readBoards(boards);
  const row = cleanRow(entry);
  const difficulty = DIFFICULTIES.includes(entry?.difficulty) ? entry.difficulty : null;
  if (!row || !difficulty) {
    return { boards: next, placed: false, rank: 0, score: row ? row.score : 0 };
  }
  const list = next[difficulty].concat(row).sort(byRank);
  const kept = list.slice(0, BOARD_LIMIT);
  const index = kept.indexOf(row);
  next[difficulty] = kept;
  return {
    boards: next,
    placed: index >= 0,
    rank: index >= 0 ? index + 1 : 0,
    score: row.score,
  };
}

function cleanRow(row) {
  if (!row || typeof row !== "object") return null;
  const hits = count(row.hits);
  const boxes = count(row.boxes);
  const score = tallyScore(hits, boxes);
  if (score <= 0) return null;
  const at = Number(row.at);
  return {
    name: cleanName(row.name),
    hits,
    boxes,
    score,
    winsNeeded: row.winsNeeded === 5 || row.winsNeeded === 8 ? row.winsNeeded : 3,
    won: row.won === true,
    at: Number.isFinite(at) ? at : 0,
  };
}

function count(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 99999);
}

function byRank(a, b) {
  return b.score - a.score
    || b.boxes - a.boxes
    || b.hits - a.hits
    || a.at - b.at
    || a.name.localeCompare(b.name, "cs");
}
