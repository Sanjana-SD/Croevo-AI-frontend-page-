import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Share2, Gamepad2, Loader } from 'lucide-react';
import './GameLab.css';

/* ══════════════════════════════════════════════
   SYSTEM PROMPT FOR GEMINI
   ══════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are a 2D browser game developer. When given a game idea, respond with ONLY a single self-contained HTML file that is a fully playable 2D game.

Rules:
- Use HTML5 Canvas and vanilla JavaScript ONLY — no external libraries, no imports, no CDN links.
- The game must: have clear win/lose conditions or an infinite score loop, show score on the canvas, handle keyboard input (arrow keys or WASD), be under 500 lines, and start automatically on page load.
- Use this exact color palette: background #050810, player #00e5ff, enemies/obstacles #ee4455, collectibles #ffaa00, platforms #1a3a6a, text #00e5ff.
- Use the font family: "Orbitron", monospace for all canvas text.
- The canvas should be 600×400 pixels.
- Show a GAME OVER or YOU WIN overlay when the game ends, with the text "Press R to restart".
- Listen for the R key to restart the game without reloading the page.
- Wrap the game loop in try/catch so it never crashes.
- Do NOT include any explanation, markdown, or code fences — respond with raw HTML only, starting with <!DOCTYPE html>.`;

/* ── keyword → game resolver (for quick chips / fallback) ── */
const KEYWORD_MAP = [
  { keys: ['snake', 'worm', 'slither'], game: 'snake' },
  { keys: ['brick', 'breaker', 'paddle', 'pong', 'ball'], game: 'brickbreaker' },
  { keys: ['platform', 'jump', 'run', 'hop', 'gap', 'climb'], game: 'platformer' },
  { keys: ['space', 'invader', 'shoot', 'laser', 'alien', 'bullet', 'gun', 'war'], game: 'spaceinvaders' },
  { keys: ['coin', 'collect', 'gold', 'pickup', 'treasure'], game: 'coincollector' },
];

function resolveGame(prompt) {
  const lower = prompt.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    for (const kw of entry.keys) {
      if (lower.includes(kw)) return entry.game;
    }
  }
  return 'asteroids';
}

/* ── colour palette shared by all built-in games ── */
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

/* ══════════════════════════════════════════════
   BUILT-IN GAME IMPLEMENTATIONS
   ══════════════════════════════════════════════ */

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

/* ═════ 1. ASTEROID DODGE ═════ */
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

/* ═════ 2. SNAKE ═════ */
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

/* ═════ 3. BRICK BREAKER ═════ */
function startBrickBreaker(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let paddle, ball, bricks, score, over, won;
  const BRICK_ROWS = 5, BRICK_COLS = 10;
  function makeBricks() { const arr = []; const bw = (W - 40) / BRICK_COLS; const bh = 18; const colors = ['#e45', '#fa0', '#0f0', '#00e5ff', '#bc13fe']; for (let r = 0; r < BRICK_ROWS; r++) { for (let c = 0; c < BRICK_COLS; c++) { arr.push({ x: 20 + c * bw, y: 50 + r * (bh + 4), w: bw - 4, h: bh, alive: true, color: colors[r] }); } } return arr; }
  function reset() { paddle = { x: W / 2 - 45, y: H - 30, w: 90, h: 12 }; ball = { x: W / 2, y: H - 50, r: 7, dx: 3, dy: -3 }; bricks = makeBricks(); score = 0; over = false; won = false; }
  reset();
  function tick() {
    if (over || won) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Score: ${score}  —  Press R to restart`); return; }
    if (keys['ArrowLeft'] || keys['a']) paddle.x -= 6; if (keys['ArrowRight'] || keys['d']) paddle.x += 6; paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
    ball.x += ball.dx; ball.y += ball.dy; if (ball.x - ball.r < 0 || ball.x + ball.r > W) ball.dx *= -1; if (ball.y - ball.r < 0) ball.dy *= -1; if (ball.y + ball.r > H) { over = true; return; }
    if (ball.dy > 0 && ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w && ball.y + ball.r <= paddle.y + paddle.h + 6) { ball.dy *= -1; ball.dx += (ball.x - (paddle.x + paddle.w / 2)) * 0.08; }
    let allDead = true; bricks.forEach(b => { if (!b.alive) return; allDead = false; if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) { b.alive = false; score += 10; ball.dy *= -1; } }); if (allDead) won = true;
    clearCanvas(ctx, W, H);
    bricks.forEach(b => { if (!b.alive) return; ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); });
    ctx.fillStyle = C.player; ctx.shadowColor = C.player; ctx.shadowBlur = 8; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h); ctx.shadowBlur = 0;
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 4. PLATFORMER ═════ */
function startPlatformer(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const G = 0.5;
  let player, platforms, coins, score, over, frame;
  function makePlatforms() { const p = [{ x: 0, y: H - 20, w: W, h: 20 }]; for (let i = 0; i < 7; i++) { p.push({ x: 40 + Math.random() * (W - 160), y: H - 70 - i * 50, w: 80 + Math.random() * 60, h: 14 }); } return p; }
  function makeCoins(plats) { return plats.slice(1).map(p => ({ x: p.x + p.w / 2, y: p.y - 18, r: 8, alive: true })); }
  function reset() { platforms = makePlatforms(); coins = makeCoins(platforms); player = { x: W / 2 - 10, y: H - 50, w: 20, h: 26, vx: 0, vy: 0, onGround: false }; score = 0; over = false; frame = 0; }
  reset();
  function tick() {
    if (over) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, coins.every(c => !c.alive) ? 'YOU WIN!' : 'GAME OVER', `Coins: ${score}  —  Press R to restart`); return; }
    player.vx = 0; if (keys['ArrowLeft'] || keys['a']) player.vx = -4; if (keys['ArrowRight'] || keys['d']) player.vx = 4;
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) { player.vy = -10; player.onGround = false; }
    player.vy += G; player.x += player.vx; player.y += player.vy;
    player.onGround = false; platforms.forEach(p => { if (player.vy >= 0 && player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 8) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; } });
    if (player.x < 0) player.x = 0; if (player.x + player.w > W) player.x = W - player.w; if (player.y > H + 40) over = true;
    coins.forEach(c => { if (!c.alive) return; const dx = (player.x + player.w / 2) - c.x, dy = (player.y + player.h / 2) - c.y; if (Math.sqrt(dx * dx + dy * dy) < c.r + 12) { c.alive = false; score++; } });
    if (coins.every(c => !c.alive)) over = true;
    frame++;
    clearCanvas(ctx, W, H);
    ctx.fillStyle = C.platform; platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));
    coins.forEach(c => { if (!c.alive) return; ctx.fillStyle = C.collectible; ctx.shadowColor = C.collectible; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
    ctx.fillStyle = C.player; ctx.shadowColor = C.player; ctx.shadowBlur = 8; ctx.fillRect(player.x, player.y, player.w, player.h); ctx.shadowBlur = 0;
    drawText(ctx, `COINS: ${score}/${coins.length}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 5. SPACE INVADERS ═════ */
function startSpaceInvaders(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let ship, bullets, enemies, enemyBullets, score, over, won, frame, eDir, eSpeed;
  function makeEnemies() { const arr = []; for (let r = 0; r < 4; r++) { for (let c = 0; c < 8; c++) { arr.push({ x: 50 + c * 52, y: 40 + r * 36, w: 30, h: 20, alive: true }); } } return arr; }
  function reset() { ship = { x: W / 2 - 15, y: H - 40, w: 30, h: 18 }; bullets = []; enemyBullets = []; enemies = makeEnemies(); score = 0; over = false; won = false; frame = 0; eDir = 1; eSpeed = 0.4; }
  reset();
  function tick() {
    if (over || won) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Score: ${score}  —  Press R to restart`); return; }
    if (keys['ArrowLeft'] || keys['a']) ship.x -= 5; if (keys['ArrowRight'] || keys['d']) ship.x += 5; ship.x = Math.max(0, Math.min(W - ship.w, ship.x));
    if (keys[' '] && frame % 12 === 0) { bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y - 6, w: 4, h: 10 }); }
    bullets.forEach(b => b.y -= 6); bullets = bullets.filter(b => b.y > -10);
    let hitEdge = false; const alive = enemies.filter(e => e.alive); alive.forEach(e => { e.x += eDir * eSpeed; if (e.x <= 5 || e.x + e.w >= W - 5) hitEdge = true; }); if (hitEdge) { eDir *= -1; alive.forEach(e => e.y += 12); eSpeed += 0.05; }
    if (frame % 60 === 0 && alive.length) { const shooter = alive[Math.floor(Math.random() * alive.length)]; enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 8 }); } enemyBullets.forEach(b => b.y += 3.5); enemyBullets = enemyBullets.filter(b => b.y < H + 10);
    bullets.forEach(b => { enemies.forEach(e => { if (e.alive && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) { e.alive = false; score += 25; b.y = -999; } }); });
    enemyBullets.forEach(b => { if (b.x < ship.x + ship.w && b.x + b.w > ship.x && b.y < ship.y + ship.h && b.y + b.h > ship.y) { over = true; } });
    if (alive.some(e => e.y + e.h >= ship.y)) over = true; if (alive.length === 0) won = true;
    frame++;
    clearCanvas(ctx, W, H);
    ctx.fillStyle = C.player; ctx.shadowColor = C.player; ctx.shadowBlur = 8; ctx.beginPath(); ctx.moveTo(ship.x + ship.w / 2, ship.y); ctx.lineTo(ship.x, ship.y + ship.h); ctx.lineTo(ship.x + ship.w, ship.y + ship.h); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = C.player; bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.fillStyle = C.enemy; enemies.forEach(e => { if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h); });
    ctx.fillStyle = '#f55'; enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 6. COIN COLLECTOR ═════ */
function startCoinCollector(canvas, keys) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let player, coins, obstacles, score, over, won, totalCoins, frame;
  function makeCoins(n) { const arr = []; for (let i = 0; i < n; i++) { arr.push({ x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60), r: 8, alive: true }); } return arr; }
  function makeObstacles(n) { const arr = []; for (let i = 0; i < n; i++) { arr.push({ x: 40 + Math.random() * (W - 80), y: 40 + Math.random() * (H - 80), w: 14, h: 14, dx: (Math.random() - 0.5) * 2.5, dy: (Math.random() - 0.5) * 2.5 }); } return arr; }
  function reset() { player = { x: W / 2 - 10, y: H / 2 - 10, w: 20, h: 20 }; totalCoins = 12; coins = makeCoins(totalCoins); obstacles = makeObstacles(5); score = 0; over = false; won = false; frame = 0; }
  reset();
  function tick() {
    if (over || won) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Coins: ${score}/${totalCoins}  —  Press R to restart`); return; }
    if (keys['ArrowLeft'] || keys['a']) player.x -= 4; if (keys['ArrowRight'] || keys['d']) player.x += 4; if (keys['ArrowUp'] || keys['w']) player.y -= 4; if (keys['ArrowDown'] || keys['s']) player.y += 4;
    player.x = Math.max(0, Math.min(W - player.w, player.x)); player.y = Math.max(0, Math.min(H - player.h, player.y));
    obstacles.forEach(o => { o.x += o.dx; o.y += o.dy; if (o.x <= 0 || o.x + o.w >= W) o.dx *= -1; if (o.y <= 0 || o.y + o.h >= H) o.dy *= -1; if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) { over = true; } });
    coins.forEach(c => { if (!c.alive) return; const dx = (player.x + player.w / 2) - c.x, dy = (player.y + player.h / 2) - c.y; if (Math.sqrt(dx * dx + dy * dy) < c.r + 12) { c.alive = false; score++; } });
    if (score === totalCoins) won = true;
    frame++;
    clearCanvas(ctx, W, H);
    coins.forEach(c => { if (!c.alive) return; ctx.fillStyle = C.collectible; ctx.shadowColor = C.collectible; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });
    ctx.fillStyle = C.enemy; obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
    ctx.fillStyle = C.player; ctx.shadowColor = C.player; ctx.shadowBlur = 10; ctx.fillRect(player.x, player.y, player.w, player.h); ctx.shadowBlur = 0;
    drawText(ctx, `COINS: ${score}/${totalCoins}`, 12, 24, 14);
  }
  return { tick, reset };
}

const GAME_STARTERS = {
  asteroids: startAsteroids,
  snake: startSnake,
  brickbreaker: startBrickBreaker,
  platformer: startPlatformer,
  spaceinvaders: startSpaceInvaders,
  coincollector: startCoinCollector,
};

/* ══════════════════════════════════════════════
   GEMINI AI — generate custom game HTML
   ══════════════════════════════════════════════ */
async function generateGameFromAI(promptText) {
  const response = await fetch('/api/v2/generate-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${SYSTEM_PROMPT}\n\nUSER PROMPT: Create a game: ${promptText}` }]
      }]
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  let html = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!html) {
    throw new Error('Invalid game HTML received');
  }

  // Gemini often wraps code in markdown fences even when told not to
  if (html.includes('```')) {
    html = html.replace(/```html/g, '').replace(/```/g, '').trim();
  }

  return html;
}

/* ══════════════════════════════════════════════
   REACT COMPONENT
   ══════════════════════════════════════════════ */
const CHIPS = [
  { label: 'Asteroid Dodge', prompt: 'dodge falling asteroids' },
  { label: 'Snake',          prompt: 'classic snake game' },
  { label: 'Brick Breaker',  prompt: 'break all the bricks with a ball' },
  { label: 'Platformer',     prompt: 'jump between platforms and collect coins' },
  { label: 'Space Invaders', prompt: 'shoot alien invaders from space' },
  { label: 'Coin Collector', prompt: 'collect all the gold coins' },
];

const CHIP_PROMPTS = new Set(CHIPS.map(c => c.prompt));

const GameLab = () => {
  const [prompt, setPrompt] = useState('');
  const [gameMode, setGameMode] = useState('none'); // 'none' | 'builtin' | 'ai' | 'loading'
  const [aiHtml, setAiHtml] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const textareaRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({});

  /* ---- keyboard listeners ---- */
  useEffect(() => {
    const isTyping = () => {
      const tag = document.activeElement?.tagName;
      return tag === 'TEXTAREA' || tag === 'INPUT';
    };
    const down = (e) => {
      if (isTyping()) return;
      keysRef.current[e.key] = true;
      if ((gameMode === 'builtin' || gameMode === 'ai') && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const up = (e) => {
      if (isTyping()) return;
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameMode]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  /* ---- focus the game area ---- */
  const focusGameArea = useCallback(() => {
    setTimeout(() => {
      if (canvasWrapperRef.current) {
        canvasWrapperRef.current.focus();
        canvasWrapperRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  /* ---- launch a built-in game ---- */
  const launchBuiltinGame = useCallback((text) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    keysRef.current = {};
    setError('');
    setAiHtml('');

    const gameKey = resolveGame(text);
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 600;
    canvas.height = 400;

    const starter = GAME_STARTERS[gameKey];
    const game = starter(canvas, keysRef.current);
    gameRef.current = game;
    setGameMode('builtin');

    if (textareaRef.current) textareaRef.current.blur();
    focusGameArea();

    function loop() {
      try { game.tick(); } catch (_) {}
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [focusGameArea]);

  /* ---- launch an AI-generated game ---- */
  const launchAIGame = useCallback(async (text) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    gameRef.current = null;
    keysRef.current = {};
    setError('');
    setAiHtml('');
    setGameMode('loading');

    if (textareaRef.current) textareaRef.current.blur();

    try {
      const html = await generateGameFromAI(text);
      setAiHtml(html);
      setGameMode('ai');
      focusGameArea();
    } catch (err) {
      console.error('AI generation failed, falling back to built-in game:', err);
      // Show a brief toast about fallback, then launch built-in
      setToast('AI unavailable — loading closest match');
      setTimeout(() => setToast(''), 3000);
      launchBuiltinGame(text);
    }
  }, [focusGameArea, launchBuiltinGame]);

  /* ---- handle submit ---- */
  const handleSubmit = useCallback(() => {
    const text = prompt.trim() || 'asteroids';
    // If it's one of the built-in chip prompts, launch immediately
    if (CHIP_PROMPTS.has(text)) {
      launchBuiltinGame(text);
    } else {
      // Custom prompt → use AI generation
      launchAIGame(text);
    }
  }, [prompt, launchBuiltinGame, launchAIGame]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleRestart = () => {
    if (gameMode === 'builtin' && gameRef.current) {
      gameRef.current.reset();
    } else if (gameMode === 'ai' && iframeRef.current) {
      // Reload the iframe by re-setting srcdoc
      const iframe = iframeRef.current;
      const src = iframe.srcdoc;
      iframe.srcdoc = '';
      setTimeout(() => { iframe.srcdoc = src; }, 50);
    }
    setTimeout(() => { if (canvasWrapperRef.current) canvasWrapperRef.current.focus(); }, 100);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(prompt || 'Asteroid Dodge').then(() => {
      setToast('Prompt copied to clipboard!');
      setTimeout(() => setToast(''), 2000);
    }).catch(() => {});
    setTimeout(() => { if (canvasWrapperRef.current) canvasWrapperRef.current.focus(); }, 100);
  };

  const handleChip = (chipPrompt) => {
    setPrompt(chipPrompt);
    launchBuiltinGame(chipPrompt);
  };

  const hasGame = gameMode === 'builtin' || gameMode === 'ai';
  const isLoading = gameMode === 'loading';

  return (
    <section id="game-lab" className="game-lab">
      <div className="game-lab-inner">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="game-lab-heading">Game <span>Lab</span></h2>
          <p className="game-lab-subtitle">Describe a game. Play it instantly.</p>
        </motion.div>

        {/* Input */}
        <motion.div className="game-lab-input-area" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.5 }}>
          <textarea
            ref={textareaRef}
            className="game-lab-textarea"
            placeholder="e.g. a cat jumping over obstacles to collect fish..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isLoading}
          />
          <div className="game-lab-submit-row">
            <button className="game-lab-generate-btn" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (<><Loader size={16} className="game-lab-spinner" /> GENERATING...</>) : 'GENERATE'}
            </button>
          </div>
        </motion.div>

        {/* Quick Chips */}
        <motion.div className="game-lab-chips" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.5 }}>
          {CHIPS.map((c) => (
            <button key={c.label} className="game-lab-chip" onClick={() => handleChip(c.prompt)} disabled={isLoading}>{c.label}</button>
          ))}
        </motion.div>

        {/* Canvas / Iframe Area */}
        <motion.div
          ref={canvasWrapperRef}
          className={`game-lab-canvas-wrapper ${isLoading ? 'loading' : ''}`}
          tabIndex={0}
          style={{ outline: 'none' }}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Placeholder */}
          {gameMode === 'none' && (
            <div className="game-lab-placeholder">
              <Gamepad2 size={48} />
              <span>YOUR GAME APPEARS HERE</span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="game-lab-placeholder game-lab-loading-state">
              <Loader size={48} className="game-lab-spinner" />
              <span>GENERATING YOUR GAME...</span>
              <span className="game-lab-loading-sub">AI is building a custom game for you</span>
            </div>
          )}

          {/* Built-in canvas */}
          <canvas ref={canvasRef} style={{ display: gameMode === 'builtin' ? 'block' : 'none' }} />

          {/* AI-generated iframe */}
          {gameMode === 'ai' && aiHtml && (
            <iframe
              ref={iframeRef}
              srcDoc={aiHtml}
              title="AI Generated Game"
              sandbox="allow-scripts"
              style={{
                width: '100%',
                aspectRatio: '3 / 2',
                border: 'none',
                display: 'block',
                background: '#050810',
              }}
            />
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div className="game-lab-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </motion.div>
        )}

        {/* Toolbar */}
        {hasGame && (
          <motion.div className="game-lab-toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <button className="game-lab-tool-btn" onClick={handleRestart}><RotateCcw size={16} /> Restart</button>
            <button className="game-lab-tool-btn" onClick={handleShare}><Share2 size={16} /> Share</button>
          </motion.div>
        )}
      </div>

      {/* Toast */}
      <div className={`game-lab-toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </section>
  );
};

export default GameLab;
