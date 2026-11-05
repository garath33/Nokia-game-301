import {
  AIR,
  CLAY,
  COLS,
  GRAVEL,
  PAD,
  ROCK,
  ROWS,
  SAND,
  SOIL,
  TILE,
  WALL,
  duckLevel,
  fighterPixel,
  ghostSpot,
  shelterAt,
} from "./sim.js";

export function createView() {
  return {
    camX: 0,
    camY: 0,
    shake: 0,
    particles: [],
    floaters: [],
    radar: 0,
    blip: null,
    blipT: 0,
    ready: false,
  };
}

export function noteEvents(view, match, theme) {
  for (const event of match.events) {
    if (event.t === "dig" || event.t === "chip") {
      burst(view, event.x, event.y, theme, event.t === "dig" ? 7 : 4);
    }
    if (event.t === "hit") {
      const pos = tileCenter(event.x, event.y);
      view.floaters.push({
        x: pos.x,
        y: pos.y - 10,
        text: `-${Math.max(1, Math.round(event.amount))}`,
        life: 0.7,
        max: 0.7,
        color: event.kind === "player" ? theme.danger : theme.good,
      });
      if (event.kind === "player") view.shake = Math.max(view.shake, 5);
    }
    if (event.t === "boom") explode(view, event.x, event.y, theme);
    if (event.t === "shoot") burst(view, event.x, event.y, theme, 2);
    if (event.t === "loot") {
      const pos = tileCenter(event.x, event.y);
      view.floaters.push({
        x: pos.x,
        y: pos.y - 12,
        text: lootLabel(event.id),
        life: 1.4,
        max: 1.4,
        color: theme.accent || theme.good,
      });
    }
  }
}

function lootLabel(id) {
  if (id === "power") return "Účinnost střelby";
  if (id === "rate") return "Rychlost střelby";
  if (id === "speed") return "Rychlejší chůze";
  if (id === "spread") return "Trojstřel";
  if (id === "jack") return "Zbíječka";
  if (id === "ghost") return "GhostDuck";
  if (id === "laser") return "Laser";
  return "I AM INVINCIBLE";
}

export function drawWorld(ctx, w, h, match, theme, view, time, dt) {
  const player = match.player;
  const focus = fighterPixel(player);
  const destX = focus.x - w / 2;
  const destY = focus.y - h / 2;
  const follow = view.ready ? 1 - Math.exp(-Math.max(dt, 0.016) * 7) : 1;
  view.camX += (destX - view.camX) * follow;
  view.camY += (destY - view.camY) * follow;
  view.ready = true;
  if (view.shake > 0) view.shake = Math.max(0, view.shake - dt * 16);

  const sx = view.shake > 0 ? Math.round((Math.random() - 0.5) * view.shake) : 0;
  const sy = view.shake > 0 ? Math.round((Math.random() - 0.5) * view.shake) : 0;

  ctx.fillStyle = theme.void;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(-Math.round(view.camX) + sx, -Math.round(view.camY) + sy);

  const x0 = Math.max(0, Math.floor(view.camX / TILE) - 1);
  const y0 = Math.max(0, Math.floor(view.camY / TILE) - 1);
  const x1 = Math.min(COLS, x0 + Math.ceil(w / TILE) + 3);
  const y1 = Math.min(ROWS, y0 + Math.ceil(h / TILE) + 3);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * COLS + x;
      if (!match.seen[i]) {
        ctx.fillStyle = theme.void;
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        continue;
      }
      drawTile(ctx, match, theme, x, y, i, match.lit[i] ? 1 : 0.38, time);
    }
  }

  drawLamp(ctx, theme, match.player, time, match, 1);
  drawLamp(ctx, theme, match.enemy, time, match, 2);

  for (const ball of match.balls) {
    const tx = Math.floor(ball.x / TILE);
    const ty = Math.floor(ball.y / TILE);
    const id = ty * COLS + tx;
    const visible = ball.owner === "player" || (id >= 0 && match.seen[id]);
    if (!visible) continue;
    drawBall(ctx, ball, theme);
  }

  if (enemyVisible(match)) drawDuck(ctx, match.enemy, theme.enemy, theme, time);
  drawGhost(ctx, match, theme, time);
  if (match.player.alive) drawDuck(ctx, match.player, theme.player, theme, time);

  updateBits(ctx, view, dt);
  ctx.restore();

  const ui = screenLayout(w, h);
  drawRadar(ctx, match, theme, view, dt, ui.radar);
  drawHud(ctx, w, h, match, theme, ui);
  drawMarkers(ctx, w, h, match, theme, view);
  if (match.bannerT > 0) drawBanner(ctx, w, match, theme, ui);
}

export function drawAttract(ctx, w, h, theme, time) {
  ctx.fillStyle = theme.void;
  ctx.fillRect(0, 0, w, h);
  const originX = Math.round(w * 0.5 - 8 * TILE);
  const originY = Math.round(h * 0.62);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 16; x++) {
      const n = hash(x + 3, y + 5);
      const soil = n % 5 === 0 ? CLAY : SOIL;
      const fake = soil;
      ctx.globalAlpha = 0.95;
      paintGround(ctx, theme, fake, originX + x * TILE, originY + y * TILE, n, true);
      ctx.globalAlpha = 1;
    }
  }
  const dug = Math.floor((time * 1.4) % 10);
  ctx.fillStyle = theme.air;
  for (let i = 0; i < dug; i++) ctx.fillRect(originX + TILE + i * TILE, originY + 3 * TILE, TILE, TILE);
  ctx.fillStyle = theme.pad;
  ctx.fillRect(originX, originY + 2 * TILE, TILE * 2, TILE * 3);
  ctx.fillStyle = theme.wall;
  ctx.fillRect(originX, originY + TILE, TILE * 2, TILE);
  ctx.fillRect(originX, originY + 5 * TILE, TILE * 2, TILE);

  drawDuckAt(
    ctx,
    originX + TILE + dug * TILE + TILE / 2,
    originY + 3 * TILE + TILE / 2,
    2,
    theme.player,
    theme,
    time,
    true,
    true,
  );
  drawDuckAt(
    ctx,
    originX + 14 * TILE,
    originY + 3 * TILE + TILE / 2,
    6,
    theme.enemy,
    theme,
    time,
    false,
    false,
  );
  const bx = originX + TILE + dug * TILE + 18;
  ctx.fillStyle = theme.ball;
  ctx.beginPath();
  ctx.arc(bx, originY + 3 * TILE + TILE / 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawTile(ctx, match, theme, x, y, i, light, time) {
  const cell = match.type[i];
  const px = x * TILE;
  const py = y * TILE;
  ctx.globalAlpha = light < 1 ? 0.55 : 1;
  if (cell === AIR) {
    ctx.fillStyle = theme.air;
    ctx.fillRect(px, py, TILE, TILE);
    if (theme.glow && light === 1) edgeGlow(ctx, match, theme, x, y, px, py);
  } else if (cell === PAD) {
    ctx.fillStyle = match.pad[i] === 1 ? theme.pad : theme.padEnemy;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = theme.padLine;
    ctx.globalAlpha = (light < 1 ? 0.35 : 0.7) * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 3 + x)));
    ctx.fillRect(px, py + TILE - 3, TILE, 2);
    ctx.globalAlpha = light < 1 ? 0.55 : 1;
  } else if (cell === WALL) {
    ctx.fillStyle = theme.wall;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = theme.wallHi;
    ctx.fillRect(px, py, TILE, 3);
  } else {
    const cracks = digCracks(match, x, y);
    paintGround(ctx, theme, cell, px, py, hash(x, y), light === 1);
    if (cracks > 0) {
      ctx.strokeStyle = theme.crack;
      ctx.globalAlpha = cracks;
      ctx.strokeRect(px + 4, py + 4, TILE - 8, TILE - 8);
      ctx.globalAlpha = light < 1 ? 0.55 : 1;
    }
  }
  if (match.scar && match.scar[i]) drawScar(ctx, x, y, match.scar[i]);
  ctx.globalAlpha = 1;
}

function drawScar(ctx, x, y, level) {
  const px = x * TILE;
  const py = y * TILE;
  const n = hash(x, y);
  const span = TILE - 6;
  const streaks = 2 + level;
  ctx.save();
  ctx.lineCap = "square";
  ctx.lineWidth = 2 + level;
  ctx.globalAlpha = 0.95;
  for (let s = 0; s < streaks; s++) {
    const x1 = px + 3 + ((n >>> (s * 3)) % span);
    const y1 = py + 3 + ((n >>> (s * 3 + 5)) % span);
    const x2 = px + 3 + ((n >>> (s * 3 + 9)) % span);
    const y2 = py + 3 + ((n >>> (s * 3 + 13)) % span);
    ctx.strokeStyle = "#120804";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = s % 2 ? "#f2d7a2" : "#6b3a16";
    const chunk = 4 + level;
    ctx.fillRect((x1 + x2) / 2 - chunk / 2, (y1 + y2) / 2 - chunk / 2, chunk, chunk);
  }
  ctx.restore();
}

function paintGround(ctx, theme, cell, px, py, n, full) {
  const pal = cell === ROCK
    ? theme.rock
    : cell === CLAY
      ? theme.clay
      : cell === SAND
        ? theme.sand
        : cell === GRAVEL
          ? theme.gravel
          : theme.soil;
  ctx.fillStyle = pal[n % pal.length];
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = pal[(n >> 3) % pal.length];
  const speck = full ? 5 : 2;
  for (let s = 0; s < speck; s++) {
    const sx = px + ((n >> (s + 1)) % (TILE - 3));
    const sy = py + ((n >> (s + 3)) % (TILE - 3));
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function edgeGlow(ctx, match, theme, x, y, px, py) {
  ctx.fillStyle = (x + y) % 2 === 0 ? theme.glowA : theme.glowB;
  if (solidish(match, x, y - 1)) ctx.fillRect(px, py, TILE, 2);
  if (solidish(match, x, y + 1)) ctx.fillRect(px, py + TILE - 2, TILE, 2);
  if (solidish(match, x - 1, y)) ctx.fillRect(px, py, 2, TILE);
  if (solidish(match, x + 1, y)) ctx.fillRect(px + TILE - 2, py, 2, TILE);
}

function solidish(match, x, y) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
  const c = match.type[y * COLS + x];
  return c !== AIR && c !== PAD;
}

function digCracks(match, x, y) {
  for (const f of [match.player, match.enemy]) {
    if (f && f.digging && f.digX === x && f.digY === y) return Math.min(1, f.digT / f.digNeed);
  }
  return 0;
}

function drawLamp(ctx, theme, f, time, match, owner) {
  if (!f) return;
  const i = f.homeY * COLS + f.homeX;
  if (!match.seen[i]) return;
  const x = (f.homeX - 1.2) * TILE;
  const y = (f.homeY - 0.8) * TILE;
  const pulse = 0.55 + 0.45 * Math.sin(time * 4 + owner);
  ctx.fillStyle = owner === 1 ? theme.player.beak : theme.enemy.body;
  ctx.globalAlpha = 0.35 + pulse * 0.4;
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBall(ctx, ball, theme) {
  const color = ball.laser ? "#ff2a2a" : ball.owner === "player" ? theme.ball : theme.ballEnemy;
  const len = Math.hypot(ball.vx, ball.vy) || 1;
  if (ball.laser) {
    ctx.strokeStyle = "#ff2a2a";
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);
    ctx.lineTo(ball.x - (ball.vx / len) * 34, ball.y - (ball.vy / len) * 34);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fff5f5";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(ball.x - (ball.vx / len) * 22, ball.y - (ball.vy / len) * 22);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r || 3.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.8)";
  ctx.fillRect(ball.x - 1, ball.y - 1, 1, 1);
}

const CHROME = { body: "#9aa6b2", wing: "#6a737c", beak: "#4e565e", eye: "#ff1a10" };
const GHOST = { body: "#d7fff8", wing: "#9ee7dc", beak: "#7d8d99", eye: "#e8ffff" };

function drawGhost(ctx, match, theme, time) {
  const f = match.player;
  if (!f || f.ghostT <= 0) return;
  const spot = ghostSpot(f);
  ctx.save();
  ctx.globalAlpha = 0.45;
  drawDuckAt(ctx, spot.x, spot.y, f.facing, GHOST, theme, time, false, false, false, false);
  ctx.restore();
}

function drawDuck(ctx, f, palette, theme, time) {
  const pos = fighterPixel(f);
  const armor = f.armorT > 0 && f.armorLevel > 0;
  const chrome = f.kind === "player" && f.invT > 0;
  drawDuckAt(ctx, pos.x, pos.y, f.facing, chrome ? CHROME : palette, theme, time, f.digging, armor, f.kind === "enemy", chrome);
  if (chrome) {
    ctx.fillStyle = "#ff240f";
    ctx.font = "12px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText("I AM INVINCIBLE", pos.x, pos.y - 38);
    ctx.textAlign = "left";
  }
  const pct = clamp(f.energy / 100, 0, 1);
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.fillRect(pos.x - 14, pos.y - 30, 28, 4);
  ctx.fillStyle = pct < 0.3 ? theme.danger : palette.body;
  ctx.fillRect(pos.x - 14, pos.y - 30, 28 * pct, 4);
}

function drawDuckAt(ctx, x, y, facing, palette, theme, time, digging, armor, rival, chrome) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(1.55, 1.55);
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 8, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  const ang = facing * (Math.PI / 4) - Math.PI / 2;
  ctx.rotate(ang);
  const bob = Math.sin(time * (digging ? 18 : 6)) * (digging ? 1.3 : 0.45);
  ctx.translate(bob, 0);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = palette.eye;
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.ellipse(-7, 0, 4.2, 3.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, 8.2, 6.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.wing;
  ctx.beginPath();
  ctx.ellipse(1, -6.6, 4.3, 2.15, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(1, 6.6, 4.3, 2.15, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.body;
  ctx.beginPath();
  ctx.arc(6.4, 0, 4.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (rival) {
    ctx.fillStyle = "#d01212";
    ctx.fillRect(3.1, -2.5, 2.5, 5);
  }
  ctx.fillStyle = palette.beak;
  ctx.beginPath();
  ctx.moveTo(9.2, -2.2);
  ctx.lineTo(16.6, 0);
  ctx.lineTo(9.2, 2.2);
  ctx.closePath();
  ctx.fill();
  if (chrome) {
    ctx.fillStyle = "#ff240f";
    ctx.fillRect(6.2, -2.4, 2.1, 1.8);
    ctx.fillStyle = "#2a3138";
    ctx.fillRect(6.2, 0.7, 1.6, 1.5);
  } else {
    ctx.fillStyle = palette.eye;
    ctx.fillRect(6.2, -2.15, 1.6, 1.5);
    ctx.fillRect(6.2, 0.7, 1.6, 1.5);
  }
  if (armor) {
    ctx.strokeStyle = theme.shield;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(1, 0, 15, 11.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function updateBits(ctx, view, dt) {
  if (view.blast) {
    view.blast.life -= dt;
    const t = 1 - Math.max(0, view.blast.life / view.blast.max);
    ctx.save();
    ctx.globalAlpha = Math.max(0, view.blast.life / view.blast.max);
    ctx.fillStyle = "#ffb15a";
    ctx.beginPath();
    ctx.arc(view.blast.x, view.blast.y, 22 + t * 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a1208";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(view.blast.x, view.blast.y, 30 + t * 64, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    if (view.blast.life <= 0) view.blast = null;
  }
  for (let i = view.particles.length - 1; i >= 0; i--) {
    const p = view.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) {
      view.particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1;
  }
  for (let i = view.floaters.length - 1; i >= 0; i--) {
    const f = view.floaters[i];
    f.life -= dt;
    f.y -= 18 * dt;
    if (f.life <= 0) {
      view.floaters.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.fillStyle = f.color;
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText(f.text, f.x - 8, f.y);
    ctx.globalAlpha = 1;
  }
}

function explode(view, tx, ty, theme) {
  view.shake = 18;
  const c = tileCenter(tx, ty);
  const colors = [theme.player.body, theme.player.beak, theme.player.wing, "#ff5a1f", "#1a0c08", theme.ball, theme.danger];
  for (let i = 0; i < 56; i++) {
    if (view.particles.length > 320) view.particles.shift();
    const ang = (i / 56) * Math.PI * 2;
    const speed = 36 + (i % 5) * 22;
    view.particles.push({
      x: c.x,
      y: c.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 0.55 + (i % 4) * 0.12,
      max: 1,
      size: 3 + (i % 4),
      color: colors[i % colors.length],
    });
  }
  view.blast = { x: c.x, y: c.y, life: 0.42, max: 0.42 };
}

function burst(view, tx, ty, theme, count) {
  const c = tileCenter(tx, ty);
  for (let i = 0; i < count; i++) {
    if (view.particles.length > 180) view.particles.shift();
    view.particles.push({
      x: c.x + (Math.random() - 0.5) * 8,
      y: c.y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 40,
      vy: (Math.random() - 0.5) * 40,
      life: 0.25 + Math.random() * 0.25,
      max: 0.5,
      size: 2 + (Math.random() * 2) | 0,
      color: theme.mote,
    });
  }
}

function screenLayout(w, h) {
  const narrow = w < 760;
  const radarSize = narrow ? 104 : 168;
  const radar = {
    x: w - radarSize - (narrow ? 8 : 14),
    y: narrow ? 8 : 14,
    size: radarSize,
  };
  return {
    narrow,
    radar,
    panelW: narrow ? Math.max(150, radar.x - 22) : Math.min(300, w - 36),
  };
}

function drawRadar(ctx, match, theme, view, dt, radar) {
  const { x, y, size } = radar;
  ctx.fillStyle = theme.panel;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  const sx = size / COLS;
  const sy = size / ROWS;
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const i = ty * COLS + tx;
      if (!match.seen[i]) continue;
      const cell = match.type[i];
      ctx.fillStyle = radarColor(cell, theme);
      ctx.fillRect(x + tx * sx, y + ty * sy, Math.ceil(sx), Math.ceil(sy));
    }
  }
  const pp = match.player;
  ctx.fillStyle = theme.player.body;
  ctx.fillRect(x + pp.tx * sx - 1, y + pp.ty * sy - 1, 3, 3);

  view.radar = (view.radar + dt * 1.4) % (Math.PI * 2);
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.strokeStyle = theme.radarSweep;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(view.radar) * size * 0.48, cy + Math.sin(view.radar) * size * 0.48);
  ctx.stroke();

  const enemy = match.enemy;
  if (enemy && enemy.alive) {
    const ang = Math.atan2(enemy.ty - ROWS / 2, enemy.tx - COLS / 2);
    let delta = Math.atan2(Math.sin(ang - view.radar), Math.cos(ang - view.radar));
    if (Math.abs(delta) < 0.18) {
      const err = match.diff.radar;
      const jitter = hash(Math.floor(match.roundTime * 2), match.round) % 1000 / 1000;
      view.blip = {
        x: enemy.tx + (jitter - 0.5) * err * 2,
        y: enemy.ty + ((hash(enemy.tx, Math.floor(match.roundTime)) % 1000) / 1000 - 0.5) * err * 2,
      };
      view.blipT = 0.55;
    }
  }
  if (view.blip && view.blipT > 0) {
    view.blipT -= dt;
    ctx.fillStyle = theme.danger;
    ctx.globalAlpha = Math.min(1, view.blipT * 2);
    ctx.beginPath();
    ctx.arc(x + view.blip.x * sx, y + view.blip.y * sy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = theme.muted;
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText("RADAR", x + 8, y + size - 8);
}

function radarColor(cell, theme) {
  if (cell === AIR) return theme.radarAir;
  if (cell === PAD) return theme.radarPad;
  if (cell === WALL) return theme.wall;
  if (cell === ROCK) return theme.rock[0];
  if (cell === SAND) return theme.sand[2] || theme.sand[0];
  if (cell === CLAY) return theme.clay[0];
  if (cell === GRAVEL) return theme.gravel[0];
  return theme.radarDirt;
}

function drawHud(ctx, w, h, match, theme, ui) {
  const load = duckLevel(match.upgrades);
  const panelW = ui.panelW;
  const panelH = ui.narrow ? 108 : 136;
  ctx.fillStyle = theme.panel;
  ctx.fillRect(14, 14, panelW, panelH);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, panelW - 2, panelH - 2);

  ctx.fillStyle = theme.text;
  ctx.font = ui.narrow ? "13px ui-monospace, monospace" : "14px ui-monospace, monospace";
  const score = `${match.wins}:${match.losses}`;
  if (ui.narrow) {
    ctx.fillText(`K${match.round} · ${score}/${match.winsNeeded} · ${match.points} b`, 26, 34);
  } else {
    ctx.fillText(`KOLO ${match.round}`, 28, 36);
    ctx.fillText(`BODY ${match.points}`, 150, 36);
    ctx.fillText(`ZÁPAS ${score} NA ${match.winsNeeded}`, 28, 54);
    ctx.fillText(`ÚR ${load}`, 230, 54);
  }

  const life = Math.max(0, Math.min(100, Math.round(match.player.energy)));
  const barY = ui.narrow ? 46 : 68;
  labeledBar(ctx, 28, barY, panelW - 28, match.player.energy / 100, theme.good, `ŽIVOT ${life} %`, theme);
  const armorPct = armorFraction(match.player);
  const armorLabel = match.player.armorLevel > 0
    ? `PANCÍŘ ${Math.ceil(match.player.armorT)} s`
    : "BEZ PANCÍŘE";
  labeledBar(ctx, 28, barY + 32, panelW - 28, armorPct, theme.shield, armorLabel, theme);

  const hint = hudHint(match);
  ctx.font = ui.narrow ? "12px ui-monospace, monospace" : "13px ui-monospace, monospace";
  const width = Math.min(w - 20, Math.max(ui.narrow ? 120 : 280, ctx.measureText(hint).width + 24));
  const hintTop = h - (ui.narrow ? 226 : 48);
  ctx.fillStyle = theme.panel;
  ctx.fillRect(14, hintTop, width, 32);
  ctx.strokeStyle = theme.line;
  ctx.strokeRect(15, hintTop + 1, width - 2, 30);
  ctx.save();
  ctx.beginPath();
  ctx.rect(20, hintTop + 2, width - 16, 28);
  ctx.clip();
  ctx.fillStyle = theme.text;
  ctx.fillText(hint, 26, hintTop + 21);
  ctx.restore();
}

function labeledBar(ctx, x, y, width, pct, color, label, theme) {
  ctx.fillStyle = theme.muted;
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText(label, x, y);
  ctx.fillStyle = "rgba(255,255,255,.1)";
  ctx.fillRect(x, y + 4, width, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 4, width * clamp(pct, 0, 1), 8);
}

function armorFraction(f) {
  if (!f.armorLevel) return 0;
  const max = f.armorLevel === 1 ? 20 : 36;
  return clamp(f.armorT / max, 0, 1);
}

function hudHint(match) {
  const p = match.player;
  if (p.invT > 0) return `I AM INVINCIBLE · ${Math.ceil(p.invT)} s`;
  if (p.jackT > 0) return `Zbíječka · ${Math.ceil(p.jackT)} s. Zem neklade odpor.`;
  if (p.ghostT > 0) return `GhostDuck · ${Math.ceil(p.ghostT)} s. Kryje střely před tebou.`;
  const onPad = shelterAt(match, p) !== "none";
  if (p.lowPower) return "Málo života na probití. Vrať se do krytu.";
  if (p.digging) return `Probíjíš: ${p.digName}. Střela je rychlejší a žere víc.`;
  if (onPad && p.energy < 99.5) {
    if (match.upgrades.armor > 0 && p.armorT <= 0) {
      return `Dobíjení ${Math.floor(p.energy)} %. Pancíř čeká na 100 %.`;
    }
    return `Dobíjení ${Math.floor(p.energy)} %. Počkej, až se život vrátí naplno.`;
  }
  if (onPad) return "Kryt je plný. Můžeš zase ven.";
  if (p.energy < 34) return "Život dochází. Dobije tě vlastní i cizí kryt.";
  if (match.roundTime < 18) return "Knipl nebo šipky hrabou. Kulaté tlačítko a mezerník střílí.";
  return "Život ubývá pořád. Soupeř tě hledá stejně, jako ty jeho.";
}

function drawMarkers(ctx, w, h, match, theme, view) {
  const home = tileCenter(match.player.homeX, match.player.homeY);
  const sx = home.x - view.camX;
  const sy = home.y - view.camY;
  if (!(sx > 40 && sy > 40 && sx < w - 40 && sy < h - 40)) {
    const cx = clamp(sx, 36, w - 36);
    const cy = clamp(sy, 140, h - (w < 760 ? 230 : 70));
    ctx.strokeStyle = theme.good;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = theme.good;
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText("K", cx - 4, cy + 4);
  }

  if (match.rumor && match.rumor.ttl > 0) {
    const rx = (match.rumor.x + 0.5) * TILE - view.camX;
    const ry = (match.rumor.y + 0.5) * TILE - view.camY;
    const mx = clamp(rx, 28, w - 190);
    const my = clamp(ry, 140, h - (w < 760 ? 230 : 70));
    ctx.fillStyle = theme.danger;
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText("HRABE", mx - 18, my);
  }
  drawShotCue(ctx, w, h, match, theme, view);
}

function drawShotCue(ctx, w, h, match, theme, view) {
  const cue = match.shotCue;
  if (!cue || cue.ttl <= 0) return;
  const rx = (cue.x + 0.5) * TILE - view.camX;
  const ry = (cue.y + 0.5) * TILE - view.camY;
  const left = 28;
  const top = 150;
  const right = w - 28;
  const bottom = h - (w < 760 ? 230 : 72);
  const on = rx >= left && rx <= right && ry >= top && ry <= bottom;
  const mx = clamp(rx, left, right);
  const my = clamp(ry, top, bottom);
  ctx.save();
  ctx.translate(mx, my);
  ctx.fillStyle = theme.danger;
  ctx.font = "12px ui-monospace, monospace";
  ctx.textAlign = "center";
  if (!on) {
    const ang = Math.atan2(ry - my, rx - mx);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(-ang);
    ctx.fillText("STŘÍLÍ", 0, 20);
  } else {
    ctx.fillText("STŘÍLÍ", 0, -12);
  }
  ctx.restore();
  ctx.textAlign = "left";
}

function drawBanner(ctx, w, match, theme, ui) {
  ctx.font = ui.narrow ? "13px ui-monospace, monospace" : "20px ui-monospace, monospace";
  const width = ctx.measureText(match.banner).width;
  const gapLeft = 14 + ui.panelW + 12;
  const gapRight = ui.radar.x - 12;
  const fits = !ui.narrow && width < gapRight - gapLeft;
  const y = fits ? 48 : ui.radar.y + ui.radar.size + 22;
  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  ctx.fillText(match.banner, w / 2, y);
  if (match.round > 1 && !ui.narrow) {
    ctx.font = "13px ui-monospace, monospace";
    ctx.fillStyle = theme.muted;
    const bonus = Math.round((match.roundScale - 1) * 100);
    if (bonus > 0) ctx.fillText(`Soupeř je ostřejší o ${bonus} %`, w / 2, y + 22);
  }
  ctx.textAlign = "left";
}

function enemyVisible(match) {
  const e = match.enemy;
  if (!e || !e.alive) return false;
  const i = e.ty * COLS + e.tx;
  return !!match.lit[i];
}

function tileCenter(x, y) {
  return { x: (x + 0.5) * TILE, y: (y + 0.5) * TILE };
}

function hash(x, y) {
  let n = (Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
