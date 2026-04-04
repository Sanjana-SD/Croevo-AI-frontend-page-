import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5173;

function resolveGame(prompt) {
  const lower = (prompt || '').toLowerCase();
  const map = [
    { keys: ['snake', 'worm', 'slither'], game: 'snake' },
    { keys: ['brick', 'breaker', 'paddle', 'pong', 'ball'], game: 'brickbreaker' },
    { keys: ['platform', 'jump', 'run', 'hop', 'gap', 'climb'], game: 'platformer' },
    { keys: ['space', 'invader', 'shoot', 'laser', 'alien', 'bullet', 'gun', 'war'], game: 'spaceinvaders' },
    { keys: ['coin', 'collect', 'gold', 'pickup', 'treasure'], game: 'coincollector' },
    { keys: ['asteroid', 'dodge', 'asteroids'], game: 'asteroids' },
  ];
  for (const e of map) {
    for (const k of e.keys) if (lower.includes(k)) return e.game;
  }
  return 'coincollector';
}

function makeFallbackHtml(mode, userPrompt) {
  // Minimal single-file HTML generator for a few simple games.
  // Keeps to the same palette and size as the front-end expectations.
  const palette = {
    bg: '#050810', player: '#00e5ff', enemy: '#ee4455', collectible: '#ffaa00', platform: '#1a3a6a', text: '#00e5ff'
  };

  // Small generic game that changes behavior based on mode.
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>AI Generated Game</title>
<style>
  html,body{height:100%;margin:0;background:${palette.bg};display:flex;align-items:center;justify-content:center}
  canvas{box-shadow:0 6px 30px rgba(0,0,0,0.6);background:${palette.bg}}
</style>
</head>
<body>
<canvas id="game" width="600" height="400"></canvas>
<script>
(() => {
  const mode = ${JSON.stringify(mode)};
  const prompt = ${JSON.stringify(userPrompt || '')};
  const C = ${JSON.stringify(palette)};
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let keys = {};
  window.addEventListener('keydown', (e)=>{ keys[e.key]=true; });
  window.addEventListener('keyup', (e)=>{ keys[e.key]=false; });

  function clear(){ ctx.fillStyle = C.bg; ctx.fillRect(0,0,W,H); }
  function text(t,x,y,size=18,align='center'){ ctx.fillStyle=C.text; ctx.font = size+"px Orbitron,monospace"; ctx.textAlign = align; ctx.fillText(t,x,y); }

  // Common overlays
  function overlay(title, sub){ ctx.fillStyle='rgba(5,8,16,0.86)'; ctx.fillRect(0,0,W,H); text(title, W/2, H/2 - 10, 28); ctx.fillStyle='#7eb8cc'; ctx.font='14px Orbitron,monospace'; ctx.fillText(sub, W/2, H/2 + 18); }

  // Very small implementations for three modes
  if (mode === 'asteroids') {
    let ship = { x: W/2, y: H-48, w:30 }, rocks = [], score=0, lives=3, over=false;
    function spawn(){ rocks.push({x:Math.random()*(W-20),y:-20,r:12+Math.random()*20,sp:2+Math.random()*2}); }
    let frame=0;
    function loop(){ if (over){ overlay('GAME OVER', 'Press R to restart'); if (keys['r']||keys['R']){ rocks=[]; score=0; lives=3; over=false; } return; } if (keys['ArrowLeft']||keys['a']) ship.x-=5; if (keys['ArrowRight']||keys['d']) ship.x+=5; ship.x=Math.max(0,Math.min(W-ship.w,ship.x)); if (frame%30===0) spawn(); rocks.forEach(r=>r.y+=r.sp); rocks=rocks.filter(r=>{ if (r.y>H){ return false;} if (r.x<ship.x+ship.w && r.x+r.r>ship.x && r.y<ship.y+30 && r.y+r.r>ship.y){ lives--; if (lives<=0) over=true; return false;} return true; }); clear(); ctx.fillStyle=C.player; ctx.beginPath(); ctx.moveTo(ship.x+ship.w/2,ship.y); ctx.lineTo(ship.x,ship.y+20); ctx.lineTo(ship.x+ship.w,ship.y+20); ctx.closePath(); ctx.fill(); ctx.fillStyle=C.enemy; rocks.forEach(r=>{ ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,Math.PI*2); ctx.fill(); }); ctx.fillStyle=C.text; ctx.font='14px Orbitron,monospace'; ctx.fillText('SCORE: '+score,12,22); ctx.fillText('LIVES: '+lives, W-12,22); frame++; requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
    return;
  }

  if (mode === 'platformer') {
    let player = { x:W/2-10,y:H-60,w:20,h:28,vx:0,vy:0,on:false }, G=0.5, platforms=[{x:0,y:H-20,w:W,h:20}], coins=[], score=0, over=false;
    for (let i=0;i<5;i++){ const p={x:50+i*90,y:H-120-i*20,w:80,h:12}; platforms.push(p); coins.push({x:p.x+p.w/2,y:p.y-14,r:8,alive:true}); }
    function loop(){ if (over){ overlay(coins.every(c=>!c.alive)?'YOU WIN!':'GAME OVER', 'Press R to restart'); if (keys['r']||keys['R']){ coins.forEach(c=>c.alive=true); score=0; over=false; player.x=W/2; player.y=H-60; } return; } player.vx=0; if (keys['ArrowLeft']||keys['a']) player.vx=-4; if (keys['ArrowRight']||keys['d']) player.vx=4; if ((keys['ArrowUp']||keys['w']||keys[' ']) && player.on){ player.vy=-10; player.on=false; } player.vy+=G; player.x+=player.vx; player.y+=player.vy; player.on=false; platforms.forEach(p=>{ if (player.vy>=0 && player.x+player.w>p.x && player.x<p.x+p.w && player.y+player.h>=p.y && player.y+player.h<=p.y+p.h+8){ player.y=p.y-player.h; player.vy=0; player.on=true; } }); coins.forEach(c=>{ if (!c.alive) return; const dx=(player.x+player.w/2)-c.x, dy=(player.y+player.h/2)-c.y; if (Math.sqrt(dx*dx+dy*dy)<c.r+12){ c.alive=false; score++; } }); if (player.y>H+40) over=true; clear(); ctx.fillStyle=C.platform; platforms.forEach(p=>ctx.fillRect(p.x,p.y,p.w,p.h)); coins.forEach(c=>{ if (!c.alive) return; ctx.fillStyle=C.collectible; ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2); ctx.fill(); }); ctx.fillStyle=C.player; ctx.fillRect(player.x,player.y,player.w,player.h); ctx.fillStyle=C.text; ctx.font='14px Orbitron,monospace'; ctx.fillText('COINS: '+score+'/'+coins.length,12,22); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
    return;
  }

  // default: simple coin collector
  let player={x:W/2-10,y:H/2-10,w:20,h:20}, coins=[], score=0, over=false; for (let i=0;i<8;i++){ coins.push({x:30+Math.random()*(W-60),y:30+Math.random()*(H-60),r:8,alive:true}); }
  function loop(){ if (over){ overlay(score===coins.length?'YOU WIN!':'GAME OVER', 'Press R to restart'); if (keys['r']||keys['R']){ coins.forEach(c=>c.alive=true); score=0; over=false; player.x=W/2-10; player.y=H/2-10; } return; } if (keys['ArrowLeft']||keys['a']) player.x-=4; if (keys['ArrowRight']||keys['d']) player.x+=4; if (keys['ArrowUp']||keys['w']) player.y-=4; if (keys['ArrowDown']||keys['s']) player.y+=4; player.x=Math.max(0,Math.min(W-player.w,player.x)); player.y=Math.max(0,Math.min(H-player.h,player.y)); coins.forEach(c=>{ if (!c.alive) return; const dx=(player.x+player.w/2)-c.x, dy=(player.y+player.h/2)-c.y; if (Math.sqrt(dx*dx+dy*dy)<c.r+12){ c.alive=false; score++; } }); if (score===coins.length) over=true; clear(); coins.forEach(c=>{ if (!c.alive) return; ctx.fillStyle=C.collectible; ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2); ctx.fill(); }); ctx.fillStyle=C.player; ctx.fillRect(player.x,player.y,player.w,player.h); ctx.fillStyle=C.text; ctx.font='14px Orbitron,monospace'; ctx.fillText('COINS: '+score+'/'+coins.length,12,22); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`;
}

app.post('/api/v2/generate-game', async (req, res) => {
  try {
    const body = req.body || {};
    // Attempt to extract user prompt from Gemini v2-like body
    let prompt = '';
    try {
      const contents = body.contents || [];
      if (Array.isArray(contents) && contents.length > 0) {
        // find first user role
        for (const c of contents) {
          if (c.role === 'user' && Array.isArray(c.parts) && c.parts.length > 0) {
            const part = c.parts[0];
            if (part && part.text) { prompt = part.text; break; }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // If prompt contains SYSTEM_INSTRUCTIONS block, strip it
    if (prompt.includes('USER PROMPT:')) {
      const idx = prompt.indexOf('USER PROMPT:');
      prompt = prompt.slice(idx + 'USER PROMPT:'.length).trim();
    }

    const mode = resolveGame(prompt);

    // If a real Gemini endpoint/key is configured, attempt to proxy the request
    const GEMINI_KEY = process.env.GOOGLE_GEMINI_API_KEY;
    const GEMINI_ENDPOINT = process.env.GOOGLE_GEMINI_ENDPOINT; // optional

    if (GEMINI_KEY && GEMINI_ENDPOINT) {
      try {
        const fetchRes = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_KEY}`
          },
          body: JSON.stringify(req.body),
        });
        const text = await fetchRes.text();
        // If the remote returned HTML-like content, try to forward it
        if (fetchRes.ok) {
          // Try parse as JSON
          try {
            const json = JSON.parse(text);
            return res.json(json);
          } catch (e) {
            return res.json({ candidates: [{ content: { parts: [{ text }] }] } });
          }
        }
      } catch (err) {
        console.error('Gemini proxy failed, falling back to local generator', err);
      }
    }

    // Fallback: return simple generated HTML
    const html = makeFallbackHtml(mode, prompt);
    return res.json({ candidates: [{ content: { parts: [{ text: html }] } }] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Game generator server listening on port ${PORT}`);
});
