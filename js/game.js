import { drawScene } from './draw.js';
import { showVersion } from './version.js';
import {
  COMBO_MAX,
  COMBO_WINDOW,
  COPY,
  QUIPS,
  WIN_BONUS,
  chaseText,
  comboAfter,
  comboPips,
  commitRun,
  createGame,
  emptySave,
  entryFor,
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
  serializeSave,
  setMuted,
  shadowBlurb,
  tick,
  topHall,
  verdict,
  wipeScores,
} from './logic.js';

const SAVE_KEY = 'kachna3310';

const KEY_DIR = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  W: 'up',
  A: 'left',
  S: 'down',
  D: 'right',
};

const lcd = document.querySelector('.lcd');
const playfield = document.querySelector('#playfield');
const glass = document.querySelector('#glass');
const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const marquee = document.querySelector('#marquee');
const hud = document.querySelector('#hud');
const hudName = document.querySelector('#hud-name');
const hudScore = document.querySelector('#hud-score');
const hudShadow = document.querySelector('#hud-shadow');
const hudCombo = document.querySelector('#hud-combo');
const hudMeter = document.querySelector('#hud-meter');
const banner = document.querySelector('#banner');
const countdown = document.querySelector('#countdown');
const softName = document.querySelector('#soft-name');
const softMute = document.querySelector('#soft-mute');
const pad = document.querySelector('#pad');
const live = document.querySelector('#live');
const you = document.querySelector('#you');
const hall = document.querySelector('#hall');
const hallEmpty = document.querySelector('#hall-empty');
const wipeButton = document.querySelector('#wipe');

let db = loadDb();
let screen = 'home';
let editing = !db.lastName;
let game = null;
let runTarget = 0;
let surpassed = false;
let ended = false;
let countLeft = 0;
let countNext = 0;
let acc = 0;
let previous = performance.now();
let shake = 0;
let particles = [];
let popups = [];
let bannerUntil = 0;
let wipeArm = 0;
let swipe = null;
let audioCtx = null;
const quip = QUIPS[Math.floor(Math.random() * QUIPS.length)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

for (let i = 0; i < COMBO_WINDOW; i += 1) hudMeter.append(document.createElement('i'));

showVersion('Kachna 3310');
document.querySelector('#tagline').textContent = COPY.tagline;
document.querySelector('#flash').textContent = COPY.flash;
document.querySelector('#legal').textContent = COPY.legal;
document.querySelector('#book-lede').textContent = COPY.bookLede;
document.querySelector('#hall-note').textContent = COPY.hallNote;
hallEmpty.textContent = COPY.hallEmpty;
document.querySelector('#rules').replaceChildren(
  ...COPY.rules.map((line) => {
    const p = document.createElement('p');
    p.textContent = line;
    return p;
  }),
);

softName.textContent = 'Jméno';
wipeButton.textContent = COPY.wipe;
renderMute();
renderDossier();
buildOverlay();
showChrome();

softName.addEventListener('click', onSoftName);
softMute.addEventListener('click', () => {
  unlock();
  toggleMute();
});
pad.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  button.blur();
  unlock();
  if (button.dataset.dir) aim(button.dataset.dir);
  if (button.id === 'kva') primary();
});
wipeButton.addEventListener('click', onWipe);

playfield.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button, input, a, label')) return;
  swipe = { x: event.clientX, y: event.clientY };
});
window.addEventListener('pointerup', (event) => {
  if (!swipe) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  swipe = null;
  if (Math.hypot(dx, dy) < 28) return;
  aim(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
});
playfield.addEventListener('touchmove', (event) => {
  if (swipe) event.preventDefault();
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (isTyping()) return;
  const dir = KEY_DIR[event.key];
  if (dir) {
    if (screen === 'play' || screen === 'pause' || countLeft > 0) {
      event.preventDefault();
      unlock();
      aim(dir);
      setPad(dir, true);
    }
    return;
  }
  if (event.key === 'm' || event.key === 'M') {
    unlock();
    toggleMute();
    return;
  }
  if ((event.key === ' ' || event.key === 'p' || event.key === 'P') && focusedButton()) return;
  if (event.key === 'Enter' && focusedButton()) return;
  if (event.key === ' ' || event.key === 'p' || event.key === 'P') {
    if (screen === 'play' || screen === 'pause') {
      event.preventDefault();
      unlock();
      primary();
    }
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    unlock();
    primary();
  }
});
window.addEventListener('keyup', (event) => {
  const dir = KEY_DIR[event.key];
  if (dir) setPad(dir, false);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'play' && countLeft === 0) pause();
});

requestAnimationFrame(frame);

function loadDb() {
  try {
    return parseSave(localStorage.getItem(SAVE_KEY));
  } catch {
    return emptySave();
  }
}

function persist() {
  localStorage.setItem(SAVE_KEY, serializeSave(db));
}

function renderMute() {
  softMute.textContent = db.muted ? COPY.unmuteLabel : COPY.muteLabel;
  softMute.setAttribute('aria-pressed', db.muted ? 'true' : 'false');
}

function renderDossier() {
  you.textContent = profileLine(db);
  const rows = topHall(db);
  const me = db.lastName ? nameKey(db.lastName) : '';
  hall.replaceChildren();
  hall.hidden = rows.length === 0;
  hallEmpty.hidden = rows.length !== 0;
  for (const row of rows) {
    const li = document.createElement('li');
    if (row.key === me) li.className = 'me';
    const name = document.createElement('span');
    name.textContent = row.display;
    const score = document.createElement('b');
    score.textContent = `${row.best} kvá`;
    li.append(name, score);
    hall.append(li);
  }
}

function showChrome() {
  marquee.hidden = screen !== 'home';
  hud.hidden = screen === 'home';
  lcd.classList.toggle('sheet-cover', screen === 'over' || screen === 'pause');
  lcd.classList.toggle('is-home', screen === 'home');
  renderMute();
}

function buildOverlay() {
  overlay.replaceChildren();
  if (screen === 'home') overlay.append(homeSheet());
  else if (screen === 'pause') overlay.append(pauseCard());
  else if (screen === 'over') overlay.append(overSheet());
  overlay.hidden = overlay.childElementCount === 0;
}

function homeSheet() {
  const wrap = document.createElement('div');
  const entry = entryFor(db, db.lastName);
  if (!db.lastName || editing) {
    wrap.append(nameForm());
  } else {
    const hello = document.createElement('p');
    hello.textContent = `Ahoj, ${db.lastName}. Trh už o tobě špitá.`;
    const shadow = document.createElement('p');
    shadow.textContent = shadowBlurb(entry);
    const joke = document.createElement('p');
    joke.className = 'quip';
    joke.textContent = quip;
    const rank = rankOf(db, db.lastName);
    const place = document.createElement('p');
    place.className = 'fine';
    place.textContent = rankFlavor(rank);
    wrap.append(hello, shadow, joke, place, button(COPY.start, 'primary', () => startRound()), button(COPY.rename, 'ghost', () => {
      editing = true;
      buildOverlay();
      document.querySelector('#name')?.focus();
    }));
  }
  const how = document.createElement('p');
  how.className = 'howto';
  how.textContent = COPY.howTo;
  wrap.append(how);
  return wrap;
}

function nameForm() {
  const form = document.createElement('form');
  form.id = 'name-form';
  const label = document.createElement('label');
  label.htmlFor = 'name';
  label.textContent = COPY.nameLabel;
  const input = document.createElement('input');
  input.id = 'name';
  input.name = 'name';
  input.maxLength = 16;
  input.placeholder = COPY.namePlaceholder;
  input.autocomplete = 'nickname';
  input.spellcheck = false;
  input.enterKeyHint = 'done';
  input.value = db.lastName || '';
  const error = document.createElement('p');
  error.className = 'error';
  error.setAttribute('role', 'alert');
  input.addEventListener('input', () => {
    error.textContent = '';
  });
  const row = document.createElement('div');
  row.className = 'row';
  const submit = button(COPY.submitName, 'primary');
  submit.type = 'submit';
  const surprise = button(COPY.randomName, 'ghost');
  surprise.type = 'button';
  surprise.addEventListener('click', () => {
    input.value = randomName();
    error.textContent = '';
    input.focus();
  });
  row.append(submit, surprise);
  form.append(label, input, error, row);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = sanitizeName(input.value);
    if (!result.ok) {
      error.textContent = result.error === 'long' ? COPY.nameLong : result.error === 'bad' ? COPY.nameBad : COPY.nameEmpty;
      return;
    }
    const first = !db.lastName;
    db = rememberName(db, result.name);
    persist();
    editing = false;
    renderDossier();
    if (first) startRound();
    else buildOverlay();
  });
  return form;
}

function pauseCard() {
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('h2');
  title.textContent = COPY.pauseTitle;
  const body = document.createElement('p');
  body.textContent = COPY.pauseBody;
  const row = document.createElement('div');
  row.className = 'row';
  row.append(
    button(COPY.resume, 'primary', resume),
    button(COPY.giveUp, 'ghost', giveUp),
  );
  card.append(title, body, row);
  return card;
}

function overSheet() {
  const wrap = document.createElement('div');
  const current = lastSummary();
  if (!current) return wrap;
  const summary = verdict(current);
  const reason = document.createElement('p');
  reason.className = 'reason';
  reason.textContent = reasonLine(lastReason);
  const title = document.createElement('h2');
  title.className = `kind-${summary.kind}`;
  title.textContent = summary.title;
  const detail = document.createElement('p');
  detail.textContent = summary.detail;
  const place = document.createElement('p');
  place.className = 'fine';
  place.textContent = rankFlavor(rankOf(db, db.lastName));
  const list = document.createElement('ol');
  list.className = 'mini-hall';
  const me = nameKey(db.lastName);
  for (const row of topHall(db, 3)) {
    const li = document.createElement('li');
    if (row.key === me) li.className = 'me';
    const name = document.createElement('span');
    name.textContent = row.display;
    const score = document.createElement('b');
    score.textContent = `${row.best} kvá`;
    li.append(name, score);
    list.append(li);
  }
  const row = document.createElement('div');
  row.className = 'row';
  row.append(
    button(COPY.again, 'primary', () => startRound()),
    button(COPY.backToMarket, 'ghost', () => {
      editing = false;
      goHome();
    }),
  );
  wrap.append(reason, title, detail, place, list, row);
  return wrap;
}

function button(text, kind, onClick) {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = kind;
  node.textContent = text;
  if (onClick) {
    node.addEventListener('click', () => {
      node.blur();
      unlock();
      onClick();
    });
  }
  return node;
}

let summaryCache = null;
let lastReason = 'wall';

function lastSummary() {
  return summaryCache;
}

function goHome() {
  screen = 'home';
  countLeft = 0;
  countdown.hidden = true;
  banner.hidden = true;
  document.title = 'Kachna 3310';
  buildOverlay();
  showChrome();
  renderDossier();
}

function onSoftName() {
  unlock();
  if (screen === 'play' && countLeft === 0) {
    flashToast(COPY.noRenameMidRun);
    return;
  }
  if (screen === 'pause') {
    flashToast(COPY.noRenameMidRun);
    return;
  }
  editing = true;
  if (screen !== 'home') goHome();
  else buildOverlay();
  document.querySelector('#name')?.focus();
}

function primary() {
  if (screen === 'home') {
    if (!db.lastName || editing) {
      document.querySelector('#name-form')?.requestSubmit();
      return;
    }
    startRound();
    return;
  }
  if (screen === 'play' && countLeft > 0) {
    countLeft = 0;
    countdown.hidden = true;
    acc = 0;
    return;
  }
  if (screen === 'play') {
    pause();
    return;
  }
  if (screen === 'pause') {
    resume();
    return;
  }
  if (screen === 'over') startRound();
}

function startRound() {
  unlock();
  if (!db.lastName) {
    editing = true;
    screen = 'home';
    buildOverlay();
    return;
  }
  game = createGame((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
  runTarget = entryFor(db, db.lastName)?.best || 0;
  surpassed = false;
  ended = false;
  acc = 0;
  particles = [];
  popups = [];
  screen = 'play';
  countLeft = 4;
  countNext = performance.now() + 620;
  countdown.hidden = false;
  countdown.textContent = '3';
  banner.hidden = true;
  overlay.replaceChildren();
  overlay.hidden = true;
  showChrome();
  updateHud();
}

function pause() {
  if (screen !== 'play' || countLeft > 0) return;
  screen = 'pause';
  buildOverlay();
  showChrome();
}

function resume() {
  if (screen !== 'pause') return;
  screen = 'play';
  acc = 0;
  previous = performance.now();
  overlay.replaceChildren();
  overlay.hidden = true;
  showChrome();
}

function giveUp() {
  if (screen !== 'pause' || !game) return;
  game.alive = false;
  game.reason = 'quit';
  endRun();
}

function endRun() {
  if (ended || !game || !db.lastName) return;
  ended = true;
  countLeft = 0;
  countdown.hidden = true;
  lastReason = game.reason || 'wall';
  const result = commitRun(db, db.lastName, game.score, Date.now());
  if (result.summary) {
    db = result.db;
    summaryCache = result.summary;
    persist();
  }
  screen = 'over';
  const head = game.snake[0];
  if (head) {
    const colors = lastReason === 'win'
      ? ['#ffd24a', '#ff4d9a', '#2ee6d6']
      : ['#ff4d9a', '#2ee6d6', '#b06bff'];
    burst(head.x, head.y, lastReason === 'quit' ? 0 : 14, colors);
  }
  if (!reduced && (lastReason === 'wall' || lastReason === 'self')) shake = 16;
  renderDossier();
  buildOverlay();
  showChrome();
  const summary = summaryCache ? verdict(summaryCache) : null;
  if (summary && (summary.kind === 'record' || summary.kind === 'first' || lastReason === 'win')) fanfare();
  else buzz();
  if (summary) live.textContent = `${reasonLine(lastReason)} ${summary.title} ${summary.detail}`;
}

function aim(dir) {
  if (!game) return;
  if (screen === 'play' || screen === 'pause') queueDir(game, dir);
}

function frame(now) {
  const dt = Math.min(34, now - previous);
  previous = now;
  if (countLeft > 0 && now >= countNext) {
    countLeft -= 1;
    if (countLeft > 0) {
      countdown.hidden = false;
      countdown.textContent = ['', 'KVÁ', '1', '2', '3'][countLeft];
      countNext = now + 620;
      if (countLeft === 1) quack(1.45);
    } else countdown.hidden = true;
  }
  if (screen === 'play' && countLeft === 0 && game?.alive) {
    acc += dt;
    let guard = 0;
    while (acc >= game.tickMs && game.alive && screen === 'play' && guard < 4) {
      acc -= game.tickMs;
      guard += 1;
      const before = game.score;
      const food = { x: game.food.x, y: game.food.y };
      tick(game);
      const gained = game.score - before;
      if (gained > 0) noteBite(food, gained);
      if (runTarget > 0 && game.score > runTarget && !surpassed) {
        surpassed = true;
        banner.className = '';
        banner.textContent = COPY.bannerRecord;
        banner.hidden = false;
        bannerUntil = now + 2200;
        live.textContent = COPY.bannerRecord;
        const head = game.snake[0];
        if (head) burst(head.x, head.y, 16, ['#ff4d9a', '#ffd24a', '#2ee6d6']);
      }
      if (!game.alive) endRun();
    }
  } else acc = 0;
  updateJuice(dt, now);
  updateHud();
  layoutCanvas();
  drawScene(ctx, {
    mode: screen,
    game,
    time: now,
    shake: reduced ? 0 : shake,
    popups,
    particles,
    reduced,
  });
  requestAnimationFrame(frame);
}

function noteBite(food, gained) {
  const bonus = game.won ? WIN_BONUS : 0;
  const bite = gained - bonus;
  if (bite > 0) {
    const adrenaline = game.eaten > 0 && game.eaten % 4 === 0;
    popups.push(popup(food.x, food.y, adrenaline ? `+${bite} adrenalin` : `+${bite}`, adrenaline ? '#ffd24a' : '#fff6fb'));
    burst(food.x, food.y, 8, ['#ffd24a', '#ff4d9a', '#2ee6d6']);
    quack(0.72 + game.combo * 0.14);
  }
  if (bonus > 0) popups.push(popup(food.x, Math.max(0, food.y - 0.6), `+${bonus} daň`, '#ffd24a'));
}

function popup(x, y, text, color) {
  return {
    x: x + 0.5,
    y: y + 0.5,
    vy: reduced ? 0 : -0.0011,
    text,
    life: 760,
    max: 760,
    color,
  };
}

function burst(cellX, cellY, count, colors) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 0.0035 + Math.random() * 0.006;
    particles.push({
      x: cellX + 0.5,
      y: cellY + 0.5,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 360 + Math.random() * 240,
      max: 600,
      color: colors[i % colors.length],
      r: 0.1 + Math.random() * 0.12,
    });
  }
  if (particles.length > 90) particles.splice(0, particles.length - 90);
}

function updateJuice(dt, now) {
  for (const bit of particles) {
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
    bit.life -= dt;
  }
  particles = particles.filter((bit) => bit.life > 0);
  for (const pop of popups) {
    pop.y += pop.vy * dt;
    pop.life -= dt;
  }
  popups = popups.filter((pop) => pop.life > 0);
  if (shake > 0) shake = Math.max(0, shake - dt * 0.045);
  if (!banner.hidden && now > bannerUntil) banner.hidden = true;
  if (wipeArm && now > wipeArm) {
    wipeArm = 0;
    wipeButton.textContent = COPY.wipe;
  }
}

function updateHud() {
  if (!game || screen === 'home') return;
  hudName.textContent = db.lastName;
  hudScore.textContent = `${game.score} kvá`;
  hudShadow.textContent = chaseText(game.score, runTarget);
  const upcoming = comboAfter(game.combo, game.stepsSinceEat);
  const pips = comboPips(game.stepsSinceEat);
  const burning = upcoming >= COMBO_MAX && pips > 0;
  hudCombo.textContent = burning ? `další ×${upcoming} hoří` : `další ×${upcoming}`;
  hudMeter.classList.toggle('hot', burning);
  [...hudMeter.children].forEach((pip, index) => {
    pip.classList.toggle('on', index < pips);
  });
  if (screen === 'play' || screen === 'over') {
    document.title = `${game.score} kvá — Kachna 3310`;
  }
}

function layoutCanvas() {
  const bounds = playfield.getBoundingClientRect();
  const size = Math.floor(Math.min(bounds.width, bounds.height));
  if (size < 40) return;
  glass.style.width = `${size}px`;
  glass.style.height = `${size}px`;
  const buffer = Math.max(280, Math.floor(size * Math.min(2, window.devicePixelRatio || 1)));
  if (canvas.width !== buffer) {
    canvas.width = buffer;
    canvas.height = buffer;
  }
}

function onWipe() {
  const now = performance.now();
  if (!wipeArm || now > wipeArm) {
    wipeArm = now + 4000;
    wipeButton.textContent = COPY.wipeConfirm;
    return;
  }
  db = wipeScores(db);
  persist();
  wipeArm = 0;
  wipeButton.textContent = COPY.wipe;
  renderDossier();
  if (screen === 'home') buildOverlay();
  live.textContent = 'Paměť trhu je prázdná. Stíny šly spát.';
}

function flashToast(text) {
  banner.className = 'toast';
  banner.textContent = text;
  banner.hidden = false;
  bannerUntil = performance.now() + 1700;
}

function isTyping() {
  const el = document.activeElement;
  return Boolean(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'));
}

function focusedButton() {
  return document.activeElement?.tagName === 'BUTTON';
}

function setPad(dir, on) {
  pad.querySelector(`[data-dir="${dir}"]`)?.classList.toggle('is-down', on);
}

function toggleMute() {
  db = setMuted(db, !db.muted);
  persist();
  renderMute();
}

function unlock() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  if (!audioCtx) audioCtx = new Context();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function quack(pitch) {
  if (db.muted || !audioCtx) return;
  const start = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(190 * pitch, start);
  osc.frequency.exponentialRampToValueAtTime(90 * pitch, start + 0.08);
  osc.frequency.exponentialRampToValueAtTime(150 * pitch, start + 0.13);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.045, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + 0.17);
}

function buzz() {
  if (db.muted || !audioCtx) return;
  const start = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, start);
  osc.frequency.exponentialRampToValueAtTime(40, start + 0.28);
  gain.gain.setValueAtTime(0.04, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + 0.31);
}

function fanfare() {
  [1, 1.26, 1.5].forEach((pitch, index) => {
    window.setTimeout(() => quack(pitch), index * 90);
  });
}
