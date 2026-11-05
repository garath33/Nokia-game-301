import { COLS } from './logic.js';

const FEATHER = '#c084fc';
const FEATHER_DEEP = '#6d28d9';
const TEAL = '#2ee6d6';
const PINK = '#ff4d9a';
const INK = '#1a0a24';
const GOLD = '#ffd24a';

export function drawScene(ctx, view) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  if (view.shake > 0) {
    ctx.translate((Math.random() - 0.5) * view.shake, (Math.random() - 0.5) * view.shake);
  }
  if (view.mode === 'home' || !view.game) drawPoster(ctx, width, height, view);
  else drawBoard(ctx, width, height, view);
  ctx.restore();
}

function drawPoster(ctx, width, height, view) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#3a1848');
  sky.addColorStop(0.42, '#1a1028');
  sky.addColorStop(1, '#09070f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  drawWindows(ctx, width, height);
  if (!view.reduced) drawRain(ctx, width, height, view.time);

  ctx.fillStyle = '#07060c';
  ctx.fillRect(0, height * 0.72, width, height * 0.28);
  ctx.fillStyle = PINK;
  ctx.fillRect(0, height * 0.72, width, Math.max(3, height * 0.008));
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, height * 0.735, width, Math.max(2, height * 0.005));

  neonSign(ctx, 'KVÁ', width * 0.24, height * 0.16, PINK, width * 0.075);
  neonSign(ctx, 'ROHLÍK', width * 0.74, height * 0.15, TEAL, width * 0.058);

  const bob = view.reduced ? 0 : Math.sin(view.time / 380) * height * 0.012;
  const blink = !view.reduced && view.time % 2900 < 130;
  drawDuckFront(ctx, width * 0.46, height * 0.5 + bob, width * 0.4, blink);
  const float = view.reduced ? 0 : Math.sin(view.time / 460) * height * 0.02;
  drawCroissant(ctx, width * 0.8, height * 0.58 + float, width * 0.11, view.time);
  speech(ctx, width * 0.7, height * 0.3, 'kvá?', width);
}

function drawWindows(ctx, width, height) {
  const blocks = [
    [0.04, 0.08, 0.16, 0.58],
    [0.22, 0.18, 0.12, 0.48],
    [0.58, 0.06, 0.18, 0.6],
    [0.8, 0.2, 0.16, 0.46],
  ];
  blocks.forEach(([x, y, w, h], index) => {
    ctx.fillStyle = index % 2 ? '#241433' : '#1a1028';
    ctx.fillRect(x * width, y * height, w * width, h * height);
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const lit = (index + row + col) % 3 === 0;
        ctx.fillStyle = lit ? (col === 1 ? 'rgba(255,77,154,0.75)' : 'rgba(46,230,214,0.7)') : 'rgba(255,255,255,0.04)';
        const wx = (x + 0.03 + col * (w / 3.4)) * width;
        const wy = (y + 0.08 + row * (h / 5)) * height;
        ctx.fillRect(wx, wy, width * 0.025, height * 0.035);
      }
    }
  });
}

function drawRain(ctx, width, height, time) {
  ctx.strokeStyle = 'rgba(184, 255, 244, 0.16)';
  ctx.lineWidth = Math.max(1, width * 0.003);
  for (let i = 0; i < 16; i += 1) {
    const x = (i * 97 + time * 0.04) % width;
    const y = (i * 53 + time * 0.18) % height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - width * 0.008, y + height * 0.03);
    ctx.stroke();
  }
}

function neonSign(ctx, text, x, y, color, size) {
  ctx.save();
  ctx.font = `700 ${Math.floor(size)}px ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const plateWidth = ctx.measureText(text).width + size * 0.7;
  const plateHeight = size * 1.45;
  ctx.fillStyle = '#120810';
  ctx.fillRect(x - plateWidth / 2, y - plateHeight / 2, plateWidth, plateHeight);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.strokeRect(x - plateWidth / 2, y - plateHeight / 2, plateWidth, plateHeight);
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function speech(ctx, x, y, text, width) {
  const size = Math.max(14, width * 0.045);
  ctx.save();
  ctx.font = `700 ${Math.floor(size)}px ui-monospace, monospace`;
  const plateWidth = ctx.measureText(text).width + size;
  const plateHeight = size * 1.5;
  ctx.fillStyle = '#fff7fb';
  roundRect(ctx, x, y, plateWidth, plateHeight, size * 0.4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.4, y + plateHeight);
  ctx.lineTo(x + size * 0.2, y + plateHeight + size * 0.45);
  ctx.lineTo(x + size, y + plateHeight);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + plateWidth / 2, y + plateHeight / 2);
  ctx.restore();
}

function drawDuckFront(ctx, x, y, size, blink) {
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, r * 1.08, r * 0.62, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(-r * 0.14, -r * 0.78);
  ctx.lineTo(-r * 0.02, -r * 1.38);
  ctx.lineTo(r * 0.1, -r * 0.74);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.04, -r * 0.68);
  ctx.lineTo(r * 0.24, -r * 1.12);
  ctx.lineTo(r * 0.34, -r * 0.6);
  ctx.fill();

  const head = ctx.createRadialGradient(-r * 0.32, -r * 0.42, r * 0.12, 0, 0, r);
  head.addColorStop(0, '#ead4ff');
  head.addColorStop(0.48, FEATHER);
  head.addColorStop(1, FEATHER_DEEP);
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.92, r, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7ef6ee';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.66, r * 0.36, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const lens = r * 0.34;
  const gap = r * 0.4;
  const gy = -r * 0.2;
  drawLens(ctx, -gap, gy, lens, blink, true);
  drawLens(ctx, gap, gy, lens, blink, true);
  ctx.strokeStyle = PINK;
  ctx.lineWidth = Math.max(2.5, r * 0.075);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-gap + lens * 0.78, gy);
  ctx.lineTo(gap - lens * 0.78, gy);
  ctx.stroke();

  drawBeak(ctx, r);
  ctx.restore();
}

function drawBeak(ctx, r) {
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(-r * 0.18, r * 0.2);
  ctx.quadraticCurveTo(-r * 0.22, r * 0.32, 0, r * 0.42);
  ctx.quadraticCurveTo(r * 0.22, r * 0.32, r * 0.18, r * 0.2);
  ctx.quadraticCurveTo(0, r * 0.25, -r * 0.18, r * 0.2);
  ctx.closePath();
  ctx.fill();
}

function drawLens(ctx, x, y, radius, blink, shine) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(255, 77, 154, 0.28)';
  ctx.strokeStyle = PINK;
  ctx.lineWidth = Math.max(2, radius * 0.22);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (!blink) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(radius * 0.12, radius * 0.08, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    if (shine) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(-radius * 0.28, -radius * 0.32, radius * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.5, radius * 0.12);
    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, 0);
    ctx.lineTo(radius * 0.4, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBoard(ctx, width, height, view) {
  ctx.fillStyle = '#100c18';
  ctx.fillRect(0, 0, width, height);
  const cell = width / COLS;
  ctx.strokeStyle = 'rgba(46, 230, 214, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < COLS; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(width, i * cell);
    ctx.stroke();
  }
  ctx.strokeStyle = PINK;
  ctx.lineWidth = Math.max(3, cell * 0.08);
  ctx.strokeRect(cell * 0.08, cell * 0.08, width - cell * 0.16, height - cell * 0.16);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = Math.max(1.5, cell * 0.045);
  ctx.strokeRect(cell * 0.2, cell * 0.2, width - cell * 0.4, height - cell * 0.4);

  const { game } = view;
  if (game.food && game.food.x >= 0) {
    drawCroissant(
      ctx,
      (game.food.x + 0.5) * cell,
      (game.food.y + 0.5) * cell,
      cell * 0.92,
      view.time,
    );
  }

  const blink = !view.reduced && view.time % 2600 < 120;
  for (let index = game.snake.length - 1; index >= 0; index -= 1) {
    const part = game.snake[index];
    const x = (part.x + 0.5) * cell;
    const y = (part.y + 0.5) * cell;
    if (index === 0) drawDuckPlay(ctx, x, y, cell, game.dir, blink);
    else drawTrail(ctx, x, y, cell, index, game.snake.length);
  }

  for (const bit of view.particles) {
    ctx.globalAlpha = Math.max(0, bit.life / bit.max);
    ctx.fillStyle = bit.color;
    ctx.beginPath();
    ctx.arc(bit.x * cell, bit.y * cell, bit.r * cell, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const pop of view.popups) {
    ctx.globalAlpha = Math.max(0, pop.life / pop.max);
    ctx.fillStyle = pop.color;
    ctx.font = `700 ${Math.floor(cell * 0.42)}px ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pop.text, pop.x * cell, pop.y * cell);
  }
  ctx.globalAlpha = 1;

  if (view.mode === 'over') {
    ctx.fillStyle = 'rgba(8, 4, 16, 0.28)';
    ctx.fillRect(0, 0, width, height);
  }
}

function drawTrail(ctx, x, y, cell, index, length) {
  const t = index / Math.max(1, length);
  const radius = cell * (0.34 - t * 0.12);
  ctx.fillStyle = t % 0.2 > 0.08 ? '#9a4dff' : FEATHER_DEEP;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function drawDuckPlay(ctx, x, y, cell, facing, blink) {
  const r = cell * 0.6;
  const vec = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[facing] ?? [1, 0];
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.4);
  ctx.lineTo(r * 0.32, -r * 0.5);
  ctx.lineTo(-r * 0.32, -r * 0.5);
  ctx.fill();

  ctx.fillStyle = FEATHER;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, cell * 0.07);
  ctx.strokeStyle = FEATHER_DEEP;
  ctx.stroke();

  ctx.fillStyle = '#8ef7ee';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.38, r * 0.42, r * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = TEAL;
  ctx.beginPath();
  const bx = vec[0] * r * 0.72;
  const by = vec[1] * r * 0.72;
  if (vec[0] !== 0) {
    ctx.moveTo(bx, by - r * 0.32);
    ctx.lineTo(bx + vec[0] * r * 0.78, by);
    ctx.lineTo(bx, by + r * 0.32);
  } else {
    ctx.moveTo(bx - r * 0.32, by);
    ctx.lineTo(bx, by + vec[1] * r * 0.78);
    ctx.lineTo(bx + r * 0.32, by);
  }
  ctx.closePath();
  ctx.fill();

  const lens = r * 0.42;
  const gx = vec[0] * r * 0.1;
  const gy = -r * 0.12 + vec[1] * r * 0.06;
  ctx.lineWidth = Math.max(2, r * 0.16);
  drawLens(ctx, gx - lens * 0.9, gy, lens, blink, false);
  drawLens(ctx, gx + lens * 0.9, gy, lens, blink, false);
  ctx.strokeStyle = PINK;
  ctx.beginPath();
  ctx.moveTo(gx - lens * 0.15, gy);
  ctx.lineTo(gx + lens * 0.15, gy);
  ctx.stroke();
  ctx.restore();
}

function drawCroissant(ctx, x, y, size, time) {
  const pulse = 1 + Math.sin(time / 180) * 0.06;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.6);
  ctx.scale(pulse, pulse);
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = size * 0.35;
  ctx.fillStyle = PINK;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1.5, size * 0.1);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.34, Math.PI * 0.15, Math.PI * 1.35);
  ctx.arc(size * 0.08, size * 0.02, size * 0.24, Math.PI * 1.15, Math.PI * 0.05, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  ctx.rect(x, y, width, height);
}
