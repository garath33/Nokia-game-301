// Kachna 3310 scoring.
// A bite scores 10 × combo, plus 5 adrenaline on every 4th bite.
// Combo starts at ×1. It rises by one (cap ×5) when the 10-pip meter
// still has a light on, and drops back to ×1 when the meter is dark.
// The personal shadow is the best score stored for a name on this device.
// The hall keeps one best score per name. Nothing is sent to a server.

export const COLS = 16;
export const ROWS = 16;
export const COMBO_WINDOW = 10;
export const COMBO_MAX = 5;
export const FOOD_POINTS = 10;
export const ADRENALINE = 5;
export const WIN_BONUS = 50;
export const SPEED_START = 180;
export const SPEED_STEP = 8;
export const SPEED_MIN = 72;
export const MAX_NAMES = 30;
export const HALL_LIMIT = 8;
export const SCORE_CAP = 999999;

export const START = {
  snake: Object.freeze([
    Object.freeze({ x: 3, y: 8 }),
    Object.freeze({ x: 2, y: 8 }),
    Object.freeze({ x: 1, y: 8 }),
  ]),
  dir: 'right',
  food: Object.freeze({ x: 8, y: 8 }),
};

const DELTAS = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
};

const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };

export const RANDOM_NAMES = [
  'Agent Kvá',
  'Růžový Zobák',
  'Fialový Firewall',
  'TurboCroissant',
  'Madam Packet',
  'GlitchHusa',
  'ByteKachna',
  'Neonový Knedlík',
  'Quack.exe',
  'Wi-Fi Kachna',
  'Slečna 404',
  'Baron von Kvá',
];

export const QUIPS = [
  'Synthrohlík sám sebe nesežere. Některé kachny to zkusí.',
  'Růžové brýle nejsou doplněk. Jsou to brýle.',
  'Zeď je jediný kritik, kterého nezajímá krycí jméno.',
  'Kombo je když jíš, jako bys někomu utíkal. Utíkáš. Vlastnímu stínu.',
  'Noční trh neřeší, jestli jsi had. Trh řeší, jestli máš rohlík.',
  'Stín nepodvádí. Stín je tvoje lepší směna.',
];

export const COPY = {
  title: 'Kachna 3310',
  tagline: 'Kachnička v růžových brýlích. Fialové peří, tyrkysový zobák, tyrkysové číro.',
  nameLabel: 'Krycí jméno',
  namePlaceholder: 'třeba Agent Kvá',
  nameEmpty: 'Bezejmenná kachna je jen polévka. Napiš jméno.',
  nameLong: 'Trh si pamatuje maximálně 16 znaků. Zbytek spolkne zeď.',
  nameBad: 'Tohle jméno nejde ani kváknout.',
  submitName: 'Jdu kvákat',
  randomName: 'Nemám jméno, mám peří',
  rename: 'Jiné krycí jméno',
  start: 'Vypustit kachnu',
  noShadow: 'Zatím žádný stín. Ideální čas si nějaký udělat.',
  again: 'Ještě jedno kolo',
  backToMarket: 'Zpět na trh',
  pauseTitle: 'Peří v klidu.',
  pauseBody: 'Mezerník, P, nebo tlačítko KVÁ. Ulice počká.',
  resume: 'Ještě kváknu',
  giveUp: 'Vzdát směnu',
  bannerRecord: 'STÍN PŘEKONÁN',
  hallTitle: 'Síň kváknutí',
  bookTitle: 'Kniha stínů',
  bookLede: 'Stín je nejlepší skóre pod tvým jménem. Celá hra je o tom ho přerůst.',
  hallEmpty: 'Ve výloze je jen prach a jeden neon. První kachna vyhrává i pomalu.',
  hallNote: 'Síň žije v tomhle prohlížeči. Kamarád ať si půjčí telefon, nebo ať si pořídí vlastní stín.',
  wipe: 'Vymazat paměť trhu',
  wipeConfirm: 'Fakt? Tohle smaže stíny.',
  muteLabel: 'Ztišit zobák',
  unmuteLabel: 'Probudit zobák',
  legal: 'Žádná kachna nebyla při výrobě téhle hry uvařena.',
  flash: 'přeflashováno na nočním trhu',
  howTo: 'Šipky, WASD, tah prstem nebo tlačítka pod displejem. P nebo mezerník je pauza.',
  noRenameMidRun: 'Jméno počká. Nejdřív dohraj, nebo to vzdej z pauzy.',
  profileNoName: 'Nejdřív krycí jméno. Bezejmenné peří se do knihy nepíše.',
  profileAwait: 'už má jméno. Stín přijde s první směnou.',
  profileZero: 'má v knize nulu. To se dá přerůst i pomalu.',
  meMark: 'ty',
  rules: [
    'Jednotka je kvá a neskloňuje se. Kachna má jinou práci.',
    'Synthrohlík dá 10 kvá krát kombo. První sousto směny je ×1 a rozsvítí deset dílků. Každý krok bez rohlíku jeden zhasne. Dokud svítí aspoň jeden, další sousto zvedne kombo o jedna, nanejvýš na ×5. Když zhasne všechno, další rohlík je zase ×1 a meter naskočí znovu.',
    'Každý čtvrtý rohlík přidá 5 kvá adrenalinu a ulice zrychlí. Sežrání celého trhu je výhra a přihodí 50 kvá jako daňový bonus.',
    'Stín je nejlepší skóre pod stejným krycím jménem v tomhle prohlížeči. Směna se zapíše, když narazíš, vzdáš to z pauzy, nebo sežereš celý trh. Zavřená stránka je útěk a stín to nepočítá. Síň kváknutí je výloha nejlepších kachen na tomhle přístroji.',
  ],
};

export function shiftsWord(count) {
  const n = Math.abs(Math.floor(count));
  if (n === 1) return '1 směna';
  if (n >= 2 && n <= 4) return `${n} směny`;
  return `${n} směn`;
}

export function randomName(rng = Math.random) {
  const index = Math.floor(rng() * RANDOM_NAMES.length);
  return RANDOM_NAMES[index] ?? RANDOM_NAMES[0];
}

export function sanitizeName(raw) {
  if (typeof raw !== 'string') return { ok: false, error: 'empty' };
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!name) return { ok: false, error: 'empty' };
  if ([...name].length > 16) return { ok: false, error: 'long' };
  if (/[<>]/.test(name)) return { ok: false, error: 'bad' };
  return { ok: true, name };
}

export function nameKey(name) {
  return name.toLocaleLowerCase('cs');
}

export function emptySave() {
  return { v: 1, lastName: '', muted: false, byName: {} };
}

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(SCORE_CAP, Math.floor(value)));
}

export function parseSave(raw) {
  if (typeof raw !== 'string' || !raw) return emptySave();
  try {
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || typeof data.byName !== 'object' || data.byName == null) {
      return emptySave();
    }
    const db = emptySave();
    db.muted = Boolean(data.muted);
    const last = sanitizeName(typeof data.lastName === 'string' ? data.lastName : '');
    db.lastName = last.ok ? last.name : '';
    for (const entry of Object.values(data.byName)) {
      if (!entry || typeof entry !== 'object') continue;
      const clean = sanitizeName(typeof entry.display === 'string' ? entry.display : '');
      if (!clean.ok) continue;
      const best = clampScore(Number(entry.best));
      const lastScore = clampScore(Number(entry.last));
      const games = Number(entry.games);
      if (!Number.isFinite(games)) continue;
      db.byName[nameKey(clean.name)] = {
        display: clean.name,
        best,
        bestAt: Number(entry.bestAt) || 0,
        last: lastScore,
        lastAt: Number(entry.lastAt) || 0,
        games: Math.max(0, Math.floor(games)),
      };
    }
    return db;
  } catch {
    return emptySave();
  }
}

export function serializeSave(db) {
  return JSON.stringify(db);
}

function cloneSave(db) {
  return structuredClone(db);
}

function prune(db) {
  const entries = Object.entries(db.byName);
  if (entries.length <= MAX_NAMES) return;
  const keep = nameKey(db.lastName || '');
  entries.sort((a, b) => a[1].best - b[1].best || b[1].bestAt - a[1].bestAt);
  for (const [key] of entries) {
    if (Object.keys(db.byName).length <= MAX_NAMES) break;
    if (key === keep) continue;
    delete db.byName[key];
  }
}

export function rememberName(db, name) {
  const clean = sanitizeName(name);
  if (!clean.ok) return db;
  const next = cloneSave(db);
  next.lastName = clean.name;
  return next;
}

export function setMuted(db, muted) {
  const next = cloneSave(db);
  next.muted = Boolean(muted);
  return next;
}

export function wipeScores(db) {
  const next = emptySave();
  next.lastName = db.lastName;
  next.muted = db.muted;
  return next;
}

export function entryFor(db, name) {
  if (!name) return null;
  return db.byName[nameKey(name)] ?? null;
}

export function commitRun(db, name, score, now = Date.now()) {
  const clean = sanitizeName(name);
  if (!clean.ok) return { db, summary: null };
  const next = cloneSave(db);
  const key = nameKey(clean.name);
  const prev = next.byName[key];
  const bestBefore = prev?.best ?? 0;
  const lastBefore = prev ? prev.last : null;
  const gamesBefore = prev?.games ?? 0;
  const value = clampScore(score);
  const isRecord = value > bestBefore && value > 0;
  const games = gamesBefore + 1;
  next.byName[key] = {
    display: clean.name,
    best: Math.max(bestBefore, value),
    bestAt: !prev || isRecord ? now : prev.bestAt,
    last: value,
    lastAt: now,
    games,
  };
  next.lastName = clean.name;
  prune(next);
  return {
    db: next,
    summary: {
      score: value,
      bestBefore,
      lastBefore,
      gamesBefore,
      best: next.byName[key].best,
      games,
      isRecord,
    },
  };
}

export function standings(db) {
  return Object.entries(db.byName)
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => b.best - a.best || a.bestAt - b.bestAt || a.display.localeCompare(b.display, 'cs'));
}

export function topHall(db, limit = HALL_LIMIT) {
  return standings(db).slice(0, limit);
}

export function rankOf(db, name) {
  if (!name) return null;
  const key = nameKey(name);
  const index = standings(db).findIndex((entry) => entry.key === key);
  return index === -1 ? null : index + 1;
}

export function profileLine(db) {
  if (!db.lastName) return COPY.profileNoName;
  const entry = entryFor(db, db.lastName);
  if (!entry) return `${db.lastName} ${COPY.profileAwait}`;
  if (entry.best === 0) return `${entry.display} ${COPY.profileZero}`;
  return `${entry.display}: stín ${entry.best} kvá, minule ${entry.last}, ${shiftsWord(entry.games)}.`;
}

export function shadowBlurb(entry) {
  if (!entry || entry.games === 0) return COPY.noShadow;
  if (entry.best === 0) return 'V knize je nula. To se dá přerůst i pomalu.';
  return `Stín: ${entry.best} kvá. Minule ${entry.last}. ${shiftsWord(entry.games)}.`;
}

export function chaseText(score, target) {
  if (!target) return 'první stín';
  if (score > target) return `nad stínem +${score - target}`;
  if (score === target) return 'stín dohnán';
  return `do stínu ${target - score}`;
}

export function rankFlavor(rank) {
  if (rank == null) return 'Do síně se zapisuje až po směně.';
  if (rank === 1) return 'První místo ve výloze. Růžové brýle to ustojí.';
  if (rank <= 3) return `${rank}. místo. Výloha tě snese.`;
  return `${rank}. místo. Výloha má standardy, ty máš příště.`;
}

export function comboAfter(combo, stepsSinceEat) {
  if (stepsSinceEat < COMBO_WINDOW) return Math.min(COMBO_MAX, combo + 1);
  return 1;
}

export function comboPips(stepsSinceEat) {
  if (stepsSinceEat >= COMBO_WINDOW) return 0;
  return COMBO_WINDOW - stepsSinceEat;
}

export function scoreBite(combo, eatenCount) {
  return FOOD_POINTS * combo + (eatenCount % 4 === 0 ? ADRENALINE : 0);
}

export function speedForEaten(eaten) {
  return Math.max(SPEED_MIN, SPEED_START - eaten * SPEED_STEP);
}

export function verdict(summary) {
  const delta = summary.score - summary.bestBefore;
  const gap = summary.bestBefore - summary.score;
  let kind;
  let title;
  let detail;
  if (summary.score === 0) {
    kind = 'zero';
    title = 'Nula kvá.';
    detail = summary.gamesBefore > 0
      ? `Synthrohlík se směje do brýlí. Stín na ${summary.bestBefore} kvá se zatím nudí.`
      : 'Synthrohlík zůstal na chodníku a směje se do růžových brýlí.';
  } else if (summary.gamesBefore === 0) {
    kind = 'first';
    title = 'První stín je na světě.';
    detail = `${summary.score} kvá. Odteď je koho honit: vlastní stín. Hodně štěstí. Jsi rychlejší, než to vypadá. Možná.`;
  } else if (summary.score > summary.bestBefore) {
    kind = 'record';
    title = 'Vlastní stín je v prachu.';
    detail = `Nový stín: ${summary.score} kvá. Ten starý měl ${summary.bestBefore}. Náskok ${delta}.`;
  } else if (summary.score === summary.bestBefore) {
    kind = 'tie';
    title = 'Remíza se vlastním stínem.';
    detail = `Zase ${summary.score} kvá. Buď konzistence, nebo prokletí. Trh to nerozlišuje.`;
  } else if (summary.lastBefore != null && summary.score > summary.lastBefore) {
    kind = 'up';
    title = 'Lepší než minule.';
    detail = `Minule ${summary.lastBefore}, teď ${summary.score}. Do stínu chybí ${gap} kvá a trocha drzosti.`;
  } else if (summary.lastBefore != null && summary.score === summary.lastBefore) {
    kind = 'flat';
    title = 'Jako minule, na chlup.';
    detail = `${summary.score} kvá, stejné jako minule. Stín na ${summary.bestBefore} z toho má radost, což je podezřelé.`;
  } else {
    kind = 'down';
    title = 'Stín pořád vede.';
    const lastBit = summary.lastBefore == null ? '' : ` Minule bylo ${summary.lastBefore}.`;
    detail = `Dnes ${summary.score}, stín ${summary.bestBefore}.${lastBit} Plán je jednoduchý: nejíst vlastní záda.`;
  }
  return { kind, title, detail, delta };
}

export function reasonLine(reason) {
  switch (reason) {
    case 'wall':
      return 'Zeď neměla brýle a stejně tě viděla.';
    case 'self':
      return 'Náraz do vlastního peří. Klasika nočního trhu.';
    case 'win':
      return 'Celý trh je snědený. Hygiena je na cestě a daňový bonus +50 kvá už sedí ve skóre.';
    case 'quit':
      return 'Směna je složená. Body platí, pověst počká.';
    default:
      return 'Směna skončila. Trh mlčí, což je u trhu podezřelé.';
  }
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGame(seed = 1) {
  return {
    snake: START.snake.map((part) => ({ x: part.x, y: part.y })),
    dir: START.dir,
    buffer: [],
    food: { x: START.food.x, y: START.food.y },
    score: 0,
    combo: 1,
    stepsSinceEat: 99,
    eaten: 0,
    tickMs: SPEED_START,
    alive: true,
    won: false,
    reason: null,
    rng: mulberry32(seed >>> 0),
  };
}

export function queueDir(state, dir) {
  if (!state.alive || !DELTAS[dir]) return state;
  const last = state.buffer[state.buffer.length - 1] ?? state.dir;
  if (dir === last || OPPOSITE[last] === dir) return state;
  state.buffer.push(dir);
  if (state.buffer.length > 2) state.buffer.shift();
  return state;
}

function addScore(state, amount) {
  state.score = clampScore(state.score + amount);
}

export function spawnFood(state) {
  const taken = new Set(state.snake.map((part) => `${part.x},${part.y}`));
  const free = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (!free.length) return null;
  const index = Math.floor(state.rng() * free.length);
  return free[index];
}

function die(state, reason) {
  state.alive = false;
  state.reason = reason;
  state.buffer.length = 0;
  return state;
}

export function tick(state) {
  if (!state.alive) return state;
  if (state.buffer.length) {
    const nextDir = state.buffer.shift();
    if (nextDir && DELTAS[nextDir] && OPPOSITE[state.dir] !== nextDir) state.dir = nextDir;
  }
  const [dx, dy] = DELTAS[state.dir];
  const head = state.snake[0];
  const next = { x: head.x + dx, y: head.y + dy };
  if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS) return die(state, 'wall');
  const willEat = next.x === state.food.x && next.y === state.food.y;
  const hitSelf = state.snake.some((part, index) => {
    if (!willEat && index === state.snake.length - 1) return false;
    return part.x === next.x && part.y === next.y;
  });
  if (hitSelf) return die(state, 'self');
  state.snake.unshift(next);
  if (!willEat) {
    state.snake.pop();
    state.stepsSinceEat += 1;
    return state;
  }
  const combo = comboAfter(state.combo, state.stepsSinceEat);
  state.eaten += 1;
  state.combo = combo;
  addScore(state, scoreBite(combo, state.eaten));
  state.stepsSinceEat = 0;
  state.tickMs = speedForEaten(state.eaten);
  const food = spawnFood(state);
  if (!food) {
    state.food = { x: -1, y: -1 };
    addScore(state, WIN_BONUS);
    state.won = true;
    return die(state, 'win');
  }
  state.food = food;
  return state;
}
