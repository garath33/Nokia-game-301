import { createAudio } from "./audio.js";
import { drawAttract, drawWorld, createView, noteEvents } from "./render.js";
import {
  DIFFICULTIES,
  SHOP,
  WINS_OPTIONS,
  buy,
  createMatch,
  describeLoadout,
  duckLevel,
  startNextRound,
  step,
} from "./sim.js";

const CLASSIC_DUCK = { body: "#ffd000", wing: "#f2a400", beak: "#ff7a00", eye: "#2b1608" };
const RIVAL_DUCK = {
  body: "#d5d8de",
  bodyEdge: "#8d939c",
  head: "#f7f8fa",
  eye: "#6e1420",
  beak: "#f07812",
  tail: "#2a2f36",
  outline: "#16181c",
  life: "#6e1420",
};
const RIVAL_DUCK_CYBER = {
  body: "#f2f2f2",
  bodyEdge: "#6e6e6e",
  head: "#ffffff",
  eye: "#111111",
  beak: "#1a1a1a",
  tail: "#111111",
  outline: "#000000",
  life: "#f4f4f4",
};
const CYBER_DUCK = {
  body: "#64248f",
  tile: "#c43d96",
  wing: "#c43d96",
  beak: "#2ee6d6",
  eye: "#140814",
  rim: "#2ee6d6",
  glint: "#2ee6d6",
};

const THEMES = {
  classic: {
    id: "classic",
    name: "Klasický Tunneler",
    void: "#000000",
    air: "#050403",
    soil: ["#6b3a12", "#8a5318", "#a06a22", "#3f7a28", "#8a2e22", "#c2a24a"],
    clay: ["#5c3418", "#7a4520", "#4a2a14"],
    rock: ["#3e3e46", "#55555e", "#2c2c32"],
    wall: "#8eacc4",
    wallHi: "#d5e6f2",
    pad: "#0c3266",
    padEnemy: "#3a1a18",
    padLine: "#9fd0ff",
    crack: "#1a0c06",
    mote: "#c4894a",
    player: CLASSIC_DUCK,
    enemy: RIVAL_DUCK,
    sand: ["#e6c36a", "#f0d48a", "#c9a24e"],
    gravel: ["#8d8a82", "#6e6a62", "#a39e94"],
    ball: "#f4f1d8",
    ballEnemy: "#ffd0c8",
    shield: "#f2f2f2",
    good: "#b6ff3c",
    danger: "#ff5a3c",
    text: "#f3e2c2",
    muted: "#b69762",
    line: "#d59a3a",
    panel: "rgba(8,6,4,.88)",
    radarAir: "#1a140c",
    radarDirt: "#6a4218",
    radarPad: "#2a6ea8",
    radarSweep: "rgba(214,255,74,.8)",
    glow: false,
    glowA: "#3dffe8",
    glowB: "#ff2a55",
    swatch: ["#6b3a12", "#ffd000", "#ff7a00", "#d5d8de", "#6e1420"],
  },
  cyber: {
    id: "cyber",
    name: "Cyberpunk",
    void: "#070014",
    air: "#090015",
    soil: ["#64248f", "#54207a", "#c43d96", "#a83280"],
    clay: ["#d452a4", "#b03888", "#e060b0", "#8e2874"],
    rock: ["#1c1430", "#2a1c44", "#141024", "#321e50"],
    wall: "#12343a",
    wallHi: "#2ee6d6",
    pad: "#0e2428",
    padEnemy: "#2a1030",
    padLine: "#2ee6d6",
    padLineEnemy: "#c43d96",
    crack: "#2ee6d6",
    mote: "#c43d96",
    grout: "#14081c",
    spark: "#2ee6d6",
    tiles: true,
    player: CYBER_DUCK,
    enemy: RIVAL_DUCK_CYBER,
    sand: ["#e7a0d4", "#d080c0", "#f0b8e4", "#c068b0"],
    gravel: ["#3a3480", "#2c3e78", "#4a3c90", "#243868"],
    ball: "#b8fff8",
    ballEnemy: "#f2f2f2",
    shield: "#d46bff",
    good: "#2ee6d6",
    danger: "#ff2a55",
    text: "#f6eeff",
    muted: "#c4a6e4",
    line: "#2ee6d6",
    panel: "rgba(10,4,20,.9)",
    radarAir: "#14081f",
    radarDirt: "#3a1868",
    radarPad: "#0e6e78",
    radarSweep: "rgba(255,42,85,.9)",
    glow: true,
    glowA: "rgba(46,230,214,.9)",
    glowB: "rgba(196,61,150,.8)",
    swatch: ["#64248f", "#c43d96", "#2ee6d6", "#f2f2f2", "#111111"],
  },
};

const SAVE_KEY = "tunik-save";
const canvas = document.getElementById("view");
const ctx = canvas.getContext("2d", { alpha: false });
const audio = createAudio();
const view = createView();

const splash = document.getElementById("splash");
const menu = document.getElementById("menu");
const shop = document.getElementById("shop");
const between = document.getElementById("between");
const pause = document.getElementById("pause");
const over = document.getElementById("over");
const status = document.getElementById("status");

let save = loadSave();
let themeId = save.theme === "cyber" ? "cyber" : "classic";
let difficulty = DIFFICULTIES[save.difficulty] ? save.difficulty : "normal";
let winsNeeded = WINS_OPTIONS.includes(save.winsNeeded) ? save.winsNeeded : 3;
let mode = "splash";
let match = null;
let best = save.matches || 0;
audio.setMuted(!!save.mute);

const keys = { left: false, right: false, up: false, down: false, shoot: false };
let last = performance.now();

applyTheme();
renderMenu();
requestAnimationFrame(frame);

document.getElementById("play").addEventListener("click", () => startGame());
document.getElementById("again").addEventListener("click", () => startGame());
document.getElementById("resume").addEventListener("click", () => {
  if (mode === "pause") setMode("play");
});
document.getElementById("to-menu").addEventListener("click", () => setMode("menu"));
document.getElementById("over-menu").addEventListener("click", () => setMode("menu"));
document.getElementById("next").addEventListener("click", () => continueRound());
document.getElementById("between-next").addEventListener("click", () => continueRound());
document.getElementById("mute").addEventListener("click", () => toggleMute());

for (const button of document.querySelectorAll("[data-diff]")) {
  button.addEventListener("click", () => {
    difficulty = button.dataset.diff;
    audio.click();
    renderMenu();
    persist();
  });
}
for (const button of document.querySelectorAll("[data-wins]")) {
  button.addEventListener("click", () => {
    winsNeeded = Number(button.dataset.wins);
    audio.click();
    renderMenu();
    persist();
  });
}
for (const button of document.querySelectorAll("[data-theme]")) {
  button.addEventListener("click", () => {
    themeId = button.dataset.theme;
    audio.click();
    applyTheme();
    renderMenu();
    persist();
  });
}

splash.addEventListener("click", () => {
  if (mode !== "splash") return;
  audio.resume();
  setMode("menu");
});

window.addEventListener("keydown", (event) => {
  if (mode === "splash") {
    event.preventDefault();
    audio.resume();
    setMode("menu");
    return;
  }
  audio.resume();
  const move = setKey(event.code, true);
  if (move) event.preventDefault();
  if (event.repeat) return;
  const key = event.key.toLowerCase();
  if (key === "m") {
    toggleMute();
    return;
  }
  if (key === "escape") {
    if (mode === "play") setMode("pause");
    else if (mode === "pause") setMode("play");
    return;
  }
  if (key === "enter") {
    if (mode === "menu" || mode === "over") startGame();
    else if (mode === "pause") setMode("play");
    else if (mode === "shop" || mode === "between") continueRound();
    return;
  }
  if (mode === "shop" && (key === "1" || key === "2" || key === "3")) {
    const item = SHOP[Number(key) - 1];
    tryBuy(item.id);
  }
});

window.addEventListener("keyup", (event) => {
  if (setKey(event.code, false)) event.preventDefault();
});
window.addEventListener("blur", () => {
  keys.left = keys.right = keys.up = keys.down = keys.shoot = false;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mode === "play") setMode("pause");
});

bindHold(document.getElementById("up"), "up");
bindHold(document.getElementById("down"), "down");
bindHold(document.getElementById("left"), "left");
bindHold(document.getElementById("right"), "right");
bindHold(document.getElementById("fire"), "shoot");

function bindHold(node, name) {
  const on = (event) => {
    event.preventDefault();
    keys[name] = true;
    audio.resume();
  };
  const off = (event) => {
    event.preventDefault();
    keys[name] = false;
  };
  node.addEventListener("pointerdown", on);
  node.addEventListener("pointerup", off);
  node.addEventListener("pointerleave", off);
  node.addEventListener("pointercancel", off);
}

function setKey(code, down) {
  const map = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    KeyA: "left",
    KeyD: "right",
    KeyW: "up",
    KeyS: "down",
    Space: "shoot",
  };
  if (!map[code]) return false;
  keys[map[code]] = down;
  return true;
}

function startGame() {
  audio.click();
  audio.resume();
  match = createMatch({
    seed: (Date.now() ^ (Math.random() * 0x7fffffff)) >>> 0,
    difficulty,
    winsNeeded,
  });
  view.ready = false;
  view.particles.length = 0;
  view.floaters.length = 0;
  view.blip = null;
  setMode("play");
}

function continueRound() {
  if (!match || (match.phase !== "shop" && match.phase !== "between")) return;
  audio.click();
  startNextRound(match);
  view.ready = false;
  setMode("play");
}

function tryBuy(id) {
  if (!match) return;
  const result = buy(match, id);
  if (!result.ok) audio.deny();
  else audio.click();
  renderShop();
}

function setMode(next) {
  mode = next;
  splash.classList.toggle("hidden", mode !== "splash");
  menu.classList.toggle("hidden", mode !== "menu");
  shop.classList.toggle("hidden", mode !== "shop");
  between.classList.toggle("hidden", mode !== "between");
  pause.classList.toggle("hidden", mode !== "pause");
  over.classList.toggle("hidden", mode !== "over");
  document.getElementById("touch").classList.toggle("hidden", mode !== "play" && mode !== "pause");
  if (mode === "menu") {
    status.textContent = "Menu Kačík";
    renderMenu();
  } else if (mode === "shop") {
    status.textContent = "Obchod mezi koly";
    renderShop();
  } else if (mode === "between") {
    status.textContent = "Kolo pro soupeře";
    renderBetween();
  } else if (mode === "over") {
    status.textContent = "Konec hry";
    renderOver();
  } else if (mode === "pause") status.textContent = "Pauza";
  else status.textContent = `Kolo ${match.round}`;
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const { w, h } = viewSize();
  resize();
  const theme = THEMES[themeId];
  if (mode === "menu" || !match) {
    drawAttract(ctx, w, h, theme, now / 1000);
  } else {
    if (mode === "play") {
      const before = match.phase;
      const energy = match.player.energy;
      step(match, keys, dt);
      noteEvents(view, match, theme);
      react(before, energy);
      match.events.length = 0;
    }
    drawWorld(ctx, w, h, match, theme, view, now / 1000, mode === "play" ? dt : 0);
  }
  requestAnimationFrame(frame);
}

function react(before, energy) {
  for (const event of match.events) {
    if (event.t === "dig" && event.kind === "player") audio.dig();
    if (event.t === "shoot") audio.shoot(event.kind === "enemy");
    if (event.t === "hit") {
      audio.hit(event.kind === "player");
      if (event.kind === "player") audio.quack();
    }
    if (event.t === "boom" && event.kind === "enemy") audio.win();
    if (event.t === "boom" && event.kind === "player") audio.lose();
  }
  if (energy < 99.5 && match.player.energy >= 100) audio.tick();
  if (before === "play" && match.phase === "shop") setMode("shop");
  if (before === "play" && match.phase === "between") setMode("between");
  if (before === "play" && match.phase === "over") {
    if (match.victor === "player") {
      best += 1;
      persist();
    }
    setMode("over");
  }
}

function renderMenu() {
  document.getElementById("menu-lead").textContent = themeId === "cyber"
    ? "Kačenka je ze dvou fialových a tyrkysového zobáku. Zem pod ní jsou fialové kostky ve dvou odstínech, spáry a potrubí svítí tyrkysově. Soupeř je černobílý a při pancíři má hráč stříbrnou helmu. Zápas se hraje na 3, 5 nebo 8 vítězných kol."
    : "Žlutá kačenka proti světle šedému soupeři s oranžovým zobákem a ocasem ze tří per. Při pancíři si hráč nasadí stříbrnou helmu. Mapa je z písku, hlíny, jílu, štěrku a skály a malé golfové míčky. Hustší zem klade větší odpor. Zápas se hraje na 3, 5 nebo 8 vítězných kol.";
  document.getElementById("blurb").textContent = DIFFICULTIES[difficulty].blurb;
  document.getElementById("best").textContent = best
    ? `Vyhrané zápasy: ${best}`
    : "Ještě žádný vyhraný zápas.";
  document.getElementById("mute").textContent = audio.muted ? "Zvuk: vypnuto" : "Zvuk: zapnuto";
  for (const button of document.querySelectorAll("[data-diff]")) {
    button.setAttribute("aria-pressed", String(button.dataset.diff === difficulty));
  }
  for (const button of document.querySelectorAll("[data-wins]")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.wins) === winsNeeded));
  }
  for (const button of document.querySelectorAll("[data-theme]")) {
    button.setAttribute("aria-pressed", String(button.dataset.theme === themeId));
  }
  const sw = document.getElementById("swatches");
  sw.replaceChildren();
  for (const color of THEMES[themeId].swatch) {
    const chip = document.createElement("i");
    chip.style.background = color;
    sw.appendChild(chip);
  }
}

function renderShop() {
  const load = describeLoadout(match.upgrades);
  document.getElementById("round-label").textContent = `Kolo ${match.round} tvoje · ${match.wins}:${match.losses}`;
  document.getElementById("point-label").textContent = `${match.points} bodů`;
  document.getElementById("level-label").textContent = `Úroveň kačenky ${duckLevel(match.upgrades)}`;
  const note = document.getElementById("shop-note");
  if (match.points === 2 && match.upgrades.armor === 0) {
    note.textContent = "Máš 2 body. Když je neutratíš, příští sestřel udělá 4 a stačí na pancíř.";
  } else if (match.points >= 4 && match.upgrades.armor < 2) {
    note.textContent = "Na pancíř už to vychází. Malé vylepšení pořád stojí jen 2.";
  } else if (match.points < 2) {
    note.textContent = "Další sestřel přidá zase 2 body. Mezi koly se neztratí.";
  } else {
    note.textContent = "Body zůstávají, dokud je neutratíš.";
  }
  const root = document.getElementById("cards");
  root.replaceChildren();
  const details = {
    power: load.nextPower
      ? `Teď průraz ${load.pen} a zásah ${load.dmg}. Další stupeň: průraz ${load.nextPower.pen}, zásah ${load.nextPower.dmg}.`
      : `Průraz ${load.pen}, zásah ${load.dmg}. Výš už to nejde.`,
    rate: load.nextRate
      ? `Pauza ${load.cool.toFixed(2)} s. Další stupeň ${load.nextRate.toFixed(2)} s.`
      : `Pauza ${load.cool.toFixed(2)} s. Rychleji už to nejde.`,
    armor: load.nextArmor
      ? `Další pancíř: ${load.nextArmor.seconds} s a ${load.nextArmor.absorb} % zásahu schová pancíř.`
      : `Pancíř ${load.armor.seconds} s, kryje ${load.armor.absorb} %. Znovu se zapne až na 100 % života.`,
  };
  SHOP.forEach((item, index) => {
    const level = match.upgrades[item.id];
    const button = document.createElement("button");
    button.className = "item";
    const can = match.points >= item.cost && level < item.max;
    if (item.id === "armor" && can) button.classList.add("hinted");
    button.disabled = !can;
    button.addEventListener("click", () => tryBuy(item.id));
    const title = document.createElement("b");
    title.textContent = `${index + 1}  ${item.name}`;
    const cost = document.createElement("div");
    cost.className = "cost";
    cost.textContent = level >= item.max ? "HOTOVO" : `${item.cost} BODY`;
    const rank = document.createElement("div");
    rank.textContent = `Stupeň ${level}/${item.max}`;
    const text = document.createElement("small");
    text.textContent = `${item.blurb} ${details[item.id]}`;
    button.append(title, cost, rank, text);
    root.appendChild(button);
  });
}

function renderBetween() {
  document.getElementById("between-copy").textContent =
    `Soupeř má tohle kolo. Stav ${match.wins}:${match.losses} na ${match.winsNeeded}. Další kolo začíná z nového krytu.`;
}

function renderOver() {
  const won = match.victor === "player";
  document.getElementById("over-title").textContent = won ? "Zápas je tvůj" : "Soupeř vyhrál zápas";
  document.getElementById("over-copy").textContent = won
    ? `Výhra ${match.wins}:${match.losses} na ${match.winsNeeded}. Bodů zbylo ${match.points}. Vyhraných zápasů: ${best}.`
    : `Prohra ${match.wins}:${match.losses} na ${match.winsNeeded}. Bodů zbylo ${match.points}.`;
}

function applyTheme() {
  document.body.dataset.theme = themeId;
}

function toggleMute() {
  audio.setMuted(!audio.muted);
  if (!audio.muted) {
    audio.resume();
    audio.click();
  }
  persist();
  if (mode === "menu") renderMenu();
}

function viewSize() {
  return {
    dpr: Math.min(2, window.devicePixelRatio || 1),
    w: Math.max(320, window.innerWidth),
    h: Math.max(240, window.innerHeight),
  };
}

function resize() {
  const { dpr, w, h } = viewSize();
  const cw = Math.round(w * dpr);
  const ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function persist() {
  const data = { theme: themeId, difficulty, winsNeeded, matches: best, mute: audio.muted };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  save = data;
}

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
  } catch {
    return {};
  }
}

window.TUNIK = {
  get match() {
    return match;
  },
  get mode() {
    return mode;
  },
};
