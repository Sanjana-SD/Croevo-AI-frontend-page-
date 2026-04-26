// Shared game logic for built-in games (copied from GameLab)
const C = {
  bg: '#050810',
  player: '#00e5ff',
  enemy: '#e45',
  collectible: '#fa0',
  platform: '#1a3a6a',
  text: '#00e5ff',
  dim: '#7eb8cc',
  white: '#fff',
};

const FONT = '"Orbitron", monospace';

function clearCanvas(ctx, w, h) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);
}
function drawText(ctx, text, x, y, size = 14, color = C.text, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}
function drawOverlay(ctx, w, h, line1, line2) {
  ctx.fillStyle = 'rgba(5,8,16,0.82)';
  ctx.fillRect(0, 0, w, h);
  drawText(ctx, line1, w / 2, h / 2 - 14, 26, C.text, 'center');
  drawText(ctx, line2, w / 2, h / 2 + 22, 13, C.dim, 'center');
}

function startAsteroids(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let ship = { x: W / 2 - 15, y: H - 50, w: 30, h: 20 };
  let rocks = [];
  let score = 0, lives = 3, over = false, frame = 0;
  const spawnRate = () => Math.max(18, 50 - Math.floor(score / 5));
  function reset() { ship.x = W / 2 - 15; rocks = []; score = 0; lives = 3; over = false; frame = 0; }
  function tick() {
    if (over) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, 'GAME OVER', `Score: ${score}  —  Press R to restart`); return; }
    if (keys['ArrowLeft'] || keys['a']) ship.x -= 5;
    if (keys['ArrowRight'] || keys['d']) ship.x += 5;
    ship.x = Math.max(0, Math.min(W - ship.w, ship.x));
    if (frame % spawnRate() === 0) { const rw = 18 + Math.random() * 22; rocks.push({ x: Math.random() * (W - rw), y: -20, w: rw, h: rw, speed: 2 + Math.random() * 2 + score * 0.05 }); }
    rocks.forEach(r => { r.y += r.speed; });
    rocks = rocks.filter(r => { if (r.y > H) return false; if (r.x < ship.x + ship.w && r.x + r.w > ship.x && r.y < ship.y + ship.h && r.y + r.h > ship.y) { lives--; if (lives <= 0) over = true; return false; } return true; });
    if (frame % 30 === 0 && !over) score++;
    frame++;
    clearCanvas(ctx, W, H);
    ctx.fillStyle = C.player; ctx.beginPath(); ctx.moveTo(ship.x + ship.w / 2, ship.y); ctx.lineTo(ship.x, ship.y + ship.h); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.closePath(); ctx.fill(); ctx.shadowColor = C.player; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = C.enemy; rocks.forEach(r => { ctx.beginPath(); ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, Math.PI * 2); ctx.fill(); });
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
    drawText(ctx, `LIVES: ${'♥'.repeat(lives)}`, W - 12, 24, 14, lives === 1 ? C.enemy : C.text, 'right');
  }
  return { tick, reset };
}

function startSnake(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const SZ = 20;
  const cols = Math.floor(W / SZ), rows = Math.floor(H / SZ);
  let snake, dir, food, score, over, frame, dirQueue;
  function placeFood() { let fx, fy; do { fx = Math.floor(Math.random() * cols); fy = Math.floor(Math.random() * rows); } while (snake.some(s => s.x === fx && s.y === fy)); return { x: fx, y: fy }; }
  function reset() { const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2); snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }]; dir = { x: 1, y: 0 }; dirQueue = []; food = placeFood(); score = 0; over = false; frame = 0; }
  reset();
  function tick() {
    if (over) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, 'GAME OVER', `Score: ${score}  —  Press R to restart`); return; }
    if ((keys['ArrowUp'] || keys['w']) && dir.y === 0) dirQueue.push({ x: 0, y: -1 });
    else if ((keys['ArrowDown'] || keys['s']) && dir.y === 0) dirQueue.push({ x: 0, y: 1 });
    else if ((keys['ArrowLeft'] || keys['a']) && dir.x === 0) dirQueue.push({ x: -1, y: 0 });
    else if ((keys['ArrowRight'] || keys['d']) && dir.x === 0) dirQueue.push({ x: 1, y: 0 });
    if (frame % 8 === 0) { if (dirQueue.length) dir = dirQueue.shift(); const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }; if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) { over = true; } else { snake.unshift(head); if (head.x === food.x && head.y === food.y) { score++; food = placeFood(); } else snake.pop(); } }
    frame++;
    clearCanvas(ctx, W, H);
    ctx.strokeStyle = 'rgba(0,229,255,0.04)'; for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * SZ, 0); ctx.lineTo(i * SZ, H); ctx.stroke(); } for (let i = 0; i <= rows; i++) { ctx.beginPath(); ctx.moveTo(0, i * SZ); ctx.lineTo(W, i * SZ); ctx.stroke(); }
    ctx.fillStyle = C.collectible; ctx.shadowColor = C.collectible; ctx.shadowBlur = 10; ctx.fillRect(food.x * SZ + 2, food.y * SZ + 2, SZ - 4, SZ - 4); ctx.shadowBlur = 0;
    snake.forEach((s, i) => { ctx.fillStyle = i === 0 ? C.player : `rgba(0,229,255,${0.9 - i * 0.02})`; ctx.fillRect(s.x * SZ + 1, s.y * SZ + 1, SZ - 2, SZ - 2); });
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

const GAME_STARTERS = {
  asteroids: startAsteroids,
  snake: startSnake,
};

const KEYWORD_MAP = [
  { keys: ['snake', 'worm', 'slither'], game: 'snake' },
  { keys: ['brick', 'breaker', 'paddle', 'pong', 'ball'], game: 'brickbreaker' },
  { keys: ['platform', 'jump', 'run', 'hop', 'gap', 'climb'], game: 'platformer' },
  { keys: ['space', 'invader', 'shoot', 'laser', 'alien', 'bullet', 'gun', 'war'], game: 'spaceinvaders' },
  { keys: ['coin', 'collect', 'gold', 'pickup', 'treasure'], game: 'coincollector' },
];

function resolveGame(prompt) {
  const lower = (prompt || '').toLowerCase();
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keys) {
      if (lower.includes(kw)) return entry.game;
    }
  }
  return 'asteroids';
}

export { C, FONT, clearCanvas, drawText, drawOverlay, GAME_STARTERS, resolveGame };
