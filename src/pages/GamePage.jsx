import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw, Gamepad2, ArrowLeft, Loader, Send, Sparkles, Settings, MessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDraggable } from '../hooks/useDraggable';
import './GamePage.css';

/* ══════════════════════════════════════════════
   COLOR PALETTE & HELPERS
   ══════════════════════════════════════════════ */
const C = {
  bg: '#050810',
  player: '#00e5ff',
  enemy: '#ee4455',
  collectible: '#ffaa00',
  platform: '#1a3a6a',
  text: '#00e5ff',
  white: '#ffffff',
};

function clearCanvas(ctx, W, H) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
}

function drawText(ctx, text, x, y, size = 14, color = C.text, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${size}px Orbitron, monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

function drawOverlay(ctx, W, H, title, subtitle) {
  ctx.fillStyle = 'rgba(5, 8, 16, 0.9)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.text;
  ctx.font = `26px Orbitron, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(title, W / 2, H / 2 - 20);
  ctx.font = `13px Orbitron, monospace`;
  ctx.fillText(subtitle, W / 2, H / 2 + 20);
  ctx.textAlign = 'left';
}

/* ═════ 1. ASTEROIDS ═════ */
function startAsteroids(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let ship, rocks, bullets, score, lives, over, frame, shieldUsed = false;

  function reset() {
    ship = { x: W / 2, y: H / 2, w: 20, h: 20, angle: 0, vx: 0, vy: 0 };
    rocks = [];
    for (let i = 0; i < 4; i++) rocks.push({ x: Math.random() * W, y: Math.random() * (H / 2), w: 40, h: 40, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
    bullets = [];
    score = 0;
    lives = 3;
    over = false;
    frame = 0;
    shieldUsed = false;
    if (onScore) onScore(score);
  }
  reset();

  function tick() {
    if (over) { if (keys['r'] || keys['R']) reset(); drawOverlay(ctx, W, H, 'GAME OVER', `Score: ${score}  —  Press R to restart`); return; }

    if (keys['ArrowLeft'] || keys['a']) ship.angle -= 6;
    if (keys['ArrowRight'] || keys['d']) ship.angle += 6;
    if (keys['ArrowUp'] || keys['w']) { ship.vx += Math.cos(ship.angle * Math.PI / 180) * 0.5; ship.vy += Math.sin(ship.angle * Math.PI / 180) * 0.5; }
    if (keys[' '] && frame % 12 === 0) bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.angle * Math.PI / 180) * 5, vy: Math.sin(ship.angle * Math.PI / 180) * 5 });

    ship.x += ship.vx; ship.y += ship.vy; ship.vx *= 0.99; ship.vy *= 0.99;
    if (ship.x < 0) ship.x = W; if (ship.x > W) ship.x = 0;
    if (ship.y < 0) ship.y = H; if (ship.y > H) ship.y = 0;

    bullets.forEach((b, i) => { b.x += b.vx; b.y += b.vy; if (b.x < 0 || b.x > W || b.y < 0 || b.y > H) bullets.splice(i, 1); });

    rocks.forEach((r, ri) => {
      r.x += r.vx; r.y += r.vy;
      if (r.x < 0) r.x = W; if (r.x > W) r.x = 0;
      if (r.y < 0) r.y = H; if (r.y > H) r.y = 0;

      bullets.forEach((b, bi) => {
        if (Math.hypot(b.x - (r.x + r.w / 2), b.y - (r.y + r.h / 2)) < r.w / 2) {
          score += 25;
          if (onScore) onScore(score);
          bullets.splice(bi, 1);
          if (r.w > 20) {
            rocks.push({ x: r.x, y: r.y, w: r.w / 2, h: r.h / 2, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
            rocks.push({ x: r.x, y: r.y, w: r.w / 2, h: r.h / 2, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
          }
          rocks.splice(ri, 1);
        }
      });

      if (Math.hypot(ship.x - (r.x + r.w / 2), ship.y - (r.y + r.h / 2)) < r.w / 2 + 10) {
        if (options.hasShield && !shieldUsed) {
          shieldUsed = true;
        } else {
          lives--;
          if (lives <= 0) over = true;
          else { ship.x = W / 2; ship.y = H / 2; ship.vx = 0; ship.vy = 0; }
        }
      }
    });

    if (rocks.length === 0 && frame % 30 === 0) {
      for (let i = 0; i < 4; i++) rocks.push({ x: Math.random() * W, y: Math.random() * (H / 2), w: 40, h: 40, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3 });
    }

    frame++;
    clearCanvas(ctx, W, H);
    ctx.fillStyle = C.player;
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.w / 2, ship.y);
    ctx.lineTo(ship.x, ship.y + ship.h);
    ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowColor = C.player;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = C.enemy;
    rocks.forEach(r => {
      ctx.beginPath();
      ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
    drawText(ctx, `LIVES: ${'♥'.repeat(lives)}`, W - 12, 24, 14, lives === 1 ? C.enemy : C.text, 'right');
  }
  return { tick, reset };
}

/* ═════ 2. SNAKE ═════ */
function startSnake(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const SZ = 20;
  const cols = Math.floor(W / SZ), rows = Math.floor(H / SZ);
  let snake, dir, food, score, over, frame, dirQueue, shieldUsed = false;
  const speedScale = options.speedHack ? 1.4 : 1;

  function placeFood() {
    let fx, fy;
    do {
      fx = Math.floor(Math.random() * cols);
      fy = Math.floor(Math.random() * rows);
    } while (snake.some(s => s.x === fx && s.y === fy));
    return { x: fx, y: fy };
  }

  function reset() {
    const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
    snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
    dir = { x: 1, y: 0 };
    dirQueue = [];
    food = placeFood();
    score = 0;
    over = false;
    frame = 0;
    shieldUsed = false;
    if (onScore) onScore(0);
  }
  reset();

  function tick() {
    if (over) {
      if (keys['r'] || keys['R']) reset();
      drawOverlay(ctx, W, H, 'GAME OVER', `Score: ${score}  —  Press R to restart`);
      return;
    }

    if ((keys['ArrowUp'] || keys['w']) && dir.y === 0) dirQueue.push({ x: 0, y: -1 });
    else if ((keys['ArrowDown'] || keys['s']) && dir.y === 0) dirQueue.push({ x: 0, y: 1 });
    else if ((keys['ArrowLeft'] || keys['a']) && dir.x === 0) dirQueue.push({ x: -1, y: 0 });
    else if ((keys['ArrowRight'] || keys['d']) && dir.x === 0) dirQueue.push({ x: 1, y: 0 });

    if (frame % Math.round(8 * speedScale) === 0) {
      if (dirQueue.length) dir = dirQueue.shift();
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x === head.x && s.y === head.y)) {
        if (options.hasShield && !shieldUsed) {
          shieldUsed = true;
          if (dir.x !== 0) {
            dir = { x: 0, y: head.y <= 1 ? 1 : -1 };
          } else {
            dir = { x: head.x <= 1 ? 1 : -1, y: 0 };
          }
          dirQueue = [];
        } else {
          over = true;
        }
      } else {
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          score++;
          if (onScore) onScore(score);
          food = placeFood();
        } else snake.pop();
      }
    }

    frame++;
    clearCanvas(ctx, W, H);
    ctx.strokeStyle = 'rgba(0,229,255,0.04)';
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * SZ, 0);
      ctx.lineTo(i * SZ, H);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * SZ);
      ctx.lineTo(W, i * SZ);
      ctx.stroke();
    }

    ctx.fillStyle = C.collectible;
    ctx.shadowColor = C.collectible;
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x * SZ + 2, food.y * SZ + 2, SZ - 4, SZ - 4);
    ctx.shadowBlur = 0;

    snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? C.player : `rgba(0,229,255,${0.9 - i * 0.02})`;
      ctx.fillRect(s.x * SZ + 1, s.y * SZ + 1, SZ - 2, SZ - 2);
    });
    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 3. BRICK BREAKER ═════ */
function startBrickBreaker(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let paddle, ball, bricks, score, over, won, shieldUsed = false;
  const BRICK_ROWS = 5, BRICK_COLS = 10;
  const speedScale = options.speedHack ? 0.7 : 1;

  function makeBricks() {
    const arr = [];
    const bw = (W - 40) / BRICK_COLS;
    const bh = 18;
    const colors = ['#e45', '#fa0', '#0f0', '#00e5ff', '#bc13fe'];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        arr.push({
          x: 20 + c * bw,
          y: 50 + r * (bh + 4),
          w: bw - 4,
          h: bh,
          alive: true,
          color: colors[r]
        });
      }
    }
    return arr;
  }

  function reset() {
    paddle = { x: W / 2 - 45, y: H - 30, w: 90, h: 12 };
    ball = { x: W / 2, y: H - 50, r: 7, dx: 3 * speedScale, dy: -3 * speedScale };
    bricks = makeBricks();
    score = 0;
    over = false;
    won = false;
    shieldUsed = false;
    if (onScore) onScore(0);
  }
  reset();

  function tick() {
    if (over || won) {
      if (keys['r'] || keys['R']) reset();
      drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Score: ${score}  —  Press R to restart`);
      return;
    }

    if (keys['ArrowLeft'] || keys['a']) paddle.x -= 6;
    if (keys['ArrowRight'] || keys['d']) paddle.x += 6;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.x - ball.r < 0 || ball.x + ball.r > W) ball.dx *= -1;
    if (ball.y - ball.r < 0) ball.dy *= -1;

    if (ball.y + ball.r > H) {
      if (options.hasShield && !shieldUsed) {
        shieldUsed = true;
        ball.dy *= -1;
        ball.y = paddle.y - 12;
      } else {
        over = true;
        return;
      }
    }

    if (ball.dy > 0 && ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w && ball.y + ball.r <= paddle.y + paddle.h + 6) {
      ball.dy *= -1;
      ball.dx += (ball.x - (paddle.x + paddle.w / 2)) * 0.08;
    }

    let allDead = true;
    bricks.forEach(b => {
      if (!b.alive) return;
      allDead = false;
      if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
        b.alive = false;
        score += 10;
        if (onScore) onScore(score);
        ball.dy *= -1;
      }
    });
    if (allDead) won = true;

    clearCanvas(ctx, W, H);
    bricks.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    });

    ctx.fillStyle = C.player;
    ctx.shadowColor = C.player;
    ctx.shadowBlur = 8;
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 4. PLATFORMER ═════ */
function startPlatformer(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const G = options.speedHack ? 0.35 : 0.5;
  let player, platforms, coins, score, over, frame, shieldUsed = false;

  function makePlatforms() {
    const p = [{ x: 0, y: H - 20, w: W, h: 20 }];
    for (let i = 0; i < 7; i++) {
      p.push({
        x: 40 + Math.random() * (W - 160),
        y: H - 70 - i * 50,
        w: 80 + Math.random() * 60,
        h: 14
      });
    }
    return p;
  }

  function makeCoins(plats) {
    return plats.slice(1).map(p => ({
      x: p.x + p.w / 2,
      y: p.y - 18,
      r: 8,
      alive: true
    }));
  }

  function reset() {
    platforms = makePlatforms();
    coins = makeCoins(platforms);
    player = { x: W / 2 - 10, y: H - 50, w: 20, h: 26, vx: 0, vy: 0, onGround: false };
    score = 0;
    over = false;
    frame = 0;
    shieldUsed = false;
    if (onScore) onScore(0);
  }
  reset();

  function tick() {
    if (over) {
      if (keys['r'] || keys['R']) reset();
      drawOverlay(ctx, W, H, coins.every(c => !c.alive) ? 'YOU WIN!' : 'GAME OVER', `Coins: ${score}  —  Press R to restart`);
      return;
    }

    player.vx = 0;
    if (keys['ArrowLeft'] || keys['a']) player.vx = options.speedHack ? -6 : -4;
    if (keys['ArrowRight'] || keys['d']) player.vx = options.speedHack ? 6 : 4;
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround) {
      player.vy = options.speedHack ? -11 : -10;
      player.onGround = false;
    }

    player.vy += G;
    player.x += player.vx;
    player.y += player.vy;

    player.onGround = false;
    platforms.forEach(p => {
      if (player.vy >= 0 && player.x + player.w > p.x && player.x < p.x + p.w && player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 8) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;

    if (player.y > H + 40) {
      if (options.hasShield && !shieldUsed) {
        shieldUsed = true;
        player.x = W / 2;
        player.y = H - 80;
        player.vy = -6;
      } else {
        over = true;
      }
    }

    coins.forEach(c => {
      if (!c.alive) return;
      const dx = (player.x + player.w / 2) - c.x, dy = (player.y + player.h / 2) - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + 12) {
        c.alive = false;
        score++;
        if (onScore) onScore(score);
      }
    });

    if (coins.every(c => !c.alive)) over = true;

    frame++;
    clearCanvas(ctx, W, H);
    ctx.fillStyle = C.platform;
    platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

    coins.forEach(c => {
      if (!c.alive) return;
      ctx.fillStyle = C.collectible;
      ctx.shadowColor = C.collectible;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = C.player;
    ctx.shadowColor = C.player;
    ctx.shadowBlur = 8;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    drawText(ctx, `COINS: ${score}/${coins.length}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 5. SPACE INVADERS ═════ */
function startSpaceInvaders(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let ship, bullets, enemies, enemyBullets, score, over, won, frame, eDir, eSpeed, shieldUsed = false;
  const speedScale = options.speedHack ? 0.6 : 1;

  function makeEnemies() {
    const arr = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        arr.push({
          x: 50 + c * 52,
          y: 40 + r * 36,
          w: 30,
          h: 20,
          alive: true
        });
      }
    }
    return arr;
  }

  function reset() {
    ship = { x: W / 2 - 15, y: H - 40, w: 30, h: 18 };
    bullets = [];
    enemyBullets = [];
    enemies = makeEnemies();
    score = 0;
    over = false;
    won = false;
    frame = 0;
    eDir = 1;
    eSpeed = 0.4 * speedScale;
    shieldUsed = false;
    if (onScore) onScore(0);
  }
  reset();

  function tick() {
    if (over || won) {
      if (keys['r'] || keys['R']) reset();
      drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Score: ${score}  —  Press R to restart`);
      return;
    }

    if (keys['ArrowLeft'] || keys['a']) ship.x -= 5;
    if (keys['ArrowRight'] || keys['d']) ship.x += 5;
    ship.x = Math.max(0, Math.min(W - ship.w, ship.x));

    if (keys[' '] && frame % 12 === 0) {
      bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y - 6, w: 4, h: 10 });
    }

    bullets.forEach(b => b.y -= 6);
    bullets = bullets.filter(b => b.y > -10);

    let hitEdge = false;
    const alive = enemies.filter(e => e.alive);
    alive.forEach(e => {
      e.x += eDir * eSpeed;
      if (e.x <= 5 || e.x + e.w >= W - 5) hitEdge = true;
    });

    if (hitEdge) {
      eDir *= -1;
      alive.forEach(e => e.y += 12);
      eSpeed += 0.05 * speedScale;
    }

    if (frame % 60 === 0 && alive.length) {
      const shooter = alive[Math.floor(Math.random() * alive.length)];
      enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 8 });
    }

    enemyBullets.forEach(b => b.y += 3.5 * speedScale);
    enemyBullets = enemyBullets.filter(b => b.y < H + 10);

    bullets.forEach(b => {
      enemies.forEach(e => {
        if (e.alive && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
          e.alive = false;
          score += 25;
          if (onScore) onScore(score);
          b.y = -999;
        }
      });
    });

    enemyBullets.forEach(b => {
      if (b.x < ship.x + ship.w && b.x + b.w > ship.x && b.y < ship.y + ship.h && b.y + b.h > ship.y) {
        if (options.hasShield && !shieldUsed) {
          shieldUsed = true;
          b.y = H + 999;
        } else {
          over = true;
        }
      }
    });

    if (alive.some(e => e.y + e.h >= ship.y)) {
      if (options.hasShield && !shieldUsed) {
        shieldUsed = true;
        alive.forEach(e => {
          e.y -= 40;
        });
      } else {
        over = true;
      }
    }

    if (alive.length === 0) won = true;

    frame++;
    clearCanvas(ctx, W, H);

    ctx.fillStyle = C.player;
    ctx.shadowColor = C.player;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(ship.x + ship.w / 2, ship.y);
    ctx.lineTo(ship.x, ship.y + ship.h);
    ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = C.player;
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    ctx.fillStyle = C.enemy;
    enemies.forEach(e => {
      if (e.alive) ctx.fillRect(e.x, e.y, e.w, e.h);
    });

    ctx.fillStyle = '#f55';
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

    drawText(ctx, `SCORE: ${score}`, 12, 24, 14);
  }
  return { tick, reset };
}

/* ═════ 6. COIN COLLECTOR ═════ */
function startCoinCollector(canvas, keys, onScore, options = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let player, coins, obstacles, score, over, won, totalCoins, frame, shieldUsed = false;
  const speedScale = options.speedHack ? 0.65 : 1;

  function makeCoins(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: 30 + Math.random() * (W - 60),
        y: 30 + Math.random() * (H - 60),
        r: 8,
        alive: true
      });
    }
    return arr;
  }

  function makeObstacles(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        w: 14,
        h: 14,
        dx: (Math.random() - 0.5) * 2.5 * speedScale,
        dy: (Math.random() - 0.5) * 2.5 * speedScale
      });
    }
    return arr;
  }

  function reset() {
    player = { x: W / 2 - 10, y: H / 2 - 10, w: 20, h: 20 };
    totalCoins = 12;
    coins = makeCoins(totalCoins);
    obstacles = makeObstacles(5);
    score = 0;
    over = false;
    won = false;
    frame = 0;
    shieldUsed = false;
    if (onScore) onScore(0);
  }
  reset();

  function tick() {
    if (over || won) {
      if (keys['r'] || keys['R']) reset();
      drawOverlay(ctx, W, H, won ? 'YOU WIN!' : 'GAME OVER', `Coins: ${score}/${totalCoins}  —  Press R to restart`);
      return;
    }

    if (keys['ArrowLeft'] || keys['a']) player.x -= 4;
    if (keys['ArrowRight'] || keys['d']) player.x += 4;
    if (keys['ArrowUp'] || keys['w']) player.y -= 4;
    if (keys['ArrowDown'] || keys['s']) player.y += 4;

    player.x = Math.max(0, Math.min(W - player.w, player.x));
    player.y = Math.max(0, Math.min(H - player.h, player.y));

    obstacles.forEach(o => {
      o.x += o.dx;
      o.y += o.dy;
      if (o.x <= 0 || o.x + o.w >= W) o.dx *= -1;
      if (o.y <= 0 || o.y + o.h >= H) o.dy *= -1;

      if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
        if (options.hasShield && !shieldUsed) {
          shieldUsed = true;
          o.dx *= -1;
          o.dy *= -1;
        } else {
          over = true;
        }
      }
    });

    coins.forEach(c => {
      if (!c.alive) return;
      const dx = (player.x + player.w / 2) - c.x, dy = (player.y + player.h / 2) - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + 12) {
        c.alive = false;
        score++;
        if (onScore) onScore(score);
      }
    });

    if (score === totalCoins) won = true;

    frame++;
    clearCanvas(ctx, W, H);

    coins.forEach(c => {
      if (!c.alive) return;
      ctx.fillStyle = C.collectible;
      ctx.shadowColor = C.collectible;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.fillStyle = C.enemy;
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));

    ctx.fillStyle = C.player;
    ctx.shadowColor = C.player;
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

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

function resolveGame(prompt) {
  const lower = (prompt || '').toLowerCase();
  if (lower.includes('snake') || lower.includes('worm')) return 'snake';
  if (lower.includes('brick') || lower.includes('breaker')) return 'brickbreaker';
  if (lower.includes('platform') || lower.includes('jump')) return 'platformer';
  if (lower.includes('space') || lower.includes('invader') || lower.includes('asteroid')) return 'asteroids';
  if (lower.includes('coin') || lower.includes('collect')) return 'coincollector';
  return 'asteroids';
}

const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const promptParam = searchParams.get('prompt');
  const gamePrompt = location.state?.prompt || promptParam || 'asteroids';

  // Game state
  const [gameMode, setGameMode] = useState('none');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [currentScore, setCurrentScore] = useState(0);
  const [shieldActive, setShieldActive] = useState(() => {
    return localStorage.getItem('croevo_shield_active') === 'true';
  });
  const [speedHackActive, setSpeedHackActive] = useState(() => {
    return localStorage.getItem('croevo_speed_hack_active') === 'true';
  });

  // AI Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Draggable elements
  const gameDraggable = useDraggable({ x: 20, y: 80 });
  const aiDraggable = useDraggable({ x: 680, y: 80 });

  const canvasRef = useRef(null);
  const canvasWrapperRef = useRef(null);
  const gameRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({});
  const chatEndRef = useRef(null);

  const shieldActiveRef = useRef(shieldActive);
  const speedHackActiveRef = useRef(speedHackActive);

  useEffect(() => {
    shieldActiveRef.current = shieldActive;
  }, [shieldActive]);

  useEffect(() => {
    speedHackActiveRef.current = speedHackActive;
  }, [speedHackActive]);

  // Keyboard tracking
  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
      }
    };
    const up = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleScoreUpdate = useCallback((score) => {
    setCurrentScore(score);
  }, []);

  // AI Chat handler
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    // Add user message to chat
    const newHistory = [...chatHistory, { role: 'user', content: userMsg }];
    setChatHistory(newHistory);
    setIsAILoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/games/temp/ai-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMsg,
          conversationHistory: chatHistory,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setChatHistory(prev => [...prev, { role: 'error', content: data.error }]);
      } else {
        // Add AI response
        const aiReply = data.message || 'Game settings updated based on your request!';
        setChatHistory(prev => [...prev, { role: 'assistant', content: aiReply }]);
        setToast('Game modified! Changes will apply on next restart.');
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'error', content: 'Failed to connect to AI service. Make sure the server is running.' }]);
    } finally {
      setIsAILoading(false);
    }
  }, [inputText, chatHistory]);

  const launchBuiltinGame = useCallback((text) => {
    const _launch = (attempt = 0) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      keysRef.current = {};
      setError('');
      setCurrentScore(0);

      const gameKey = resolveGame(text);
      const canvas = canvasRef.current;
      if (!canvas) {
        if (attempt < 8) {
          setTimeout(() => _launch(attempt + 1), 120);
        } else {
          setError('Unable to find game canvas. Try reloading the page.');
        }
        return;
      }

      canvas.width = 600;
      canvas.height = 400;

      const starter = GAME_STARTERS[gameKey];
      const gameStarter = starter(canvas, keysRef.current, handleScoreUpdate, {
        hasShield: shieldActiveRef.current,
        speedHack: speedHackActiveRef.current
      });
      gameRef.current = gameStarter;
      setGameMode('builtin');

      if (canvasWrapperRef.current) {
        setTimeout(() => canvasWrapperRef.current.focus(), 100);
      }

      function loop() {
        try {
          gameStarter.tick();
        } catch (_) {}
        rafRef.current = requestAnimationFrame(loop);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    _launch(0);
  }, [handleScoreUpdate]);

  useEffect(() => {
    launchBuiltinGame(gamePrompt);
  }, []);

  const handleRestart = () => {
    if (gameMode === 'builtin' && gameRef.current) {
      launchBuiltinGame(gamePrompt);
    }
  };

  const handleBack = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    navigate('/');
  };

  return (
    <div className="game-page">
      <div className="game-page-header">
        <button className="game-page-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <div className="game-page-title">
          <Gamepad2 size={20} />
          <span>{gamePrompt}</span>
        </div>
        <div className="game-page-actions">
          {gameMode === 'builtin' && (
            <>
              <button className="game-page-tool-btn" onClick={handleRestart}>
                <RotateCcw size={16} /> Restart
              </button>
              <button 
                className={`game-page-tool-btn ${showAIPanel ? 'active' : ''}`} 
                onClick={() => setShowAIPanel(!showAIPanel)}
              >
                <Sparkles size={16} /> AI Editor
              </button>
            </>
          )}
        </div>
      </div>

      <div className="game-workspace">
        {/* Game Canvas - Draggable */}
        <div 
          className="draggable-card game-view-card" 
          ref={gameDraggable.elementRef}
          style={gameDraggable.style}
          onMouseDown={gameDraggable.handleMouseDown}
        >
          <div className="panel-drag-handle">
            <div className="drag-handle-left">
              <Gamepad2 size={16} />
              <span>Game Canvas - Score: {currentScore}</span>
            </div>
          </div>

          <div className="panel-inner-content game-canvas-wrapper-inner" ref={canvasWrapperRef} tabIndex={0} style={{ outline: 'none' }}>
            <canvas ref={canvasRef} style={{ display: gameMode === 'builtin' ? 'block' : 'none' }} />
            {error && <div className="game-page-error">{error}</div>}
          </div>
        </div>

        {/* AI Editor - Draggable */}
        {showAIPanel && (
          <div 
            className="draggable-card ai-editor-card" 
            ref={aiDraggable.elementRef}
            style={aiDraggable.style}
            onMouseDown={aiDraggable.handleMouseDown}
          >
            <div className="panel-drag-handle">
              <div className="drag-handle-left">
                <Sparkles size={16} />
                <span>AI Game Modifier</span>
              </div>
              <button 
                className="close-btn"
                onClick={() => setShowAIPanel(false)}
              >
                ✕
              </button>
            </div>

            <div className="panel-inner-content ai-chat-content">
              <div className="ai-chat-info">
                <MessageSquare size={14} />
                <span>Describe changes you want to make to the game</span>
              </div>

              <div className="chat-messages">
                {chatHistory.length === 0 ? (
                  <div className="chat-placeholder">
                    <Settings size={20} />
                    <p>Ask to change game colors, speed, difficulty, or any game mechanics!</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                      <div className="message-content">
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {isAILoading && (
                  <div className="chat-message assistant loading">
                    <div className="message-content">
                      <Loader className="spinner" size={16} />
                      <span>Processing your request...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-area">
                <textarea
                  className="chat-input"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Change colors, speed, difficulty..."
                  disabled={isAILoading}
                />
                <button 
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={isAILoading || !inputText.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`game-lab-toast ${toast ? 'visible' : ''}`}>{toast}</div>
    </div>
  );
};

export default GamePage;
