import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Award, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';

const GOLD_L = '#F0D9A8';
const TIERS = [
  { f: 'rgba(212,165,90,.16)', s: '#D4A55A', t: '#F0D9A8' },
  { f: 'rgba(120,190,220,.16)', s: '#6FC3E0', t: '#BEE7F5' },
  { f: 'rgba(190,120,220,.16)', s: '#B87BDE', t: '#E3C6F5' },
  { f: 'rgba(230,120,90,.16)', s: '#E0764A', t: '#F5C7B0' },
  { f: 'rgba(120,220,150,.16)', s: '#6FD98F', t: '#C3F0D2' },
  { f: 'rgba(255,68,68,.25)', s: '#FF4444', t: '#FFB3B3' }
];

const CANVAS_W = 440;
const CANVAS_H = 580;

export default function GameBoard({ tGame, availableLives, onSpendLife, onGameOver, onScoreUpdate, onOpenQuiz, onOpenShare }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const t = tGame || {
    fastForward: '⏩ დაჩქარება',
    superBall: '⚡ სუპერ ბურთი!',
    extraBalls: '🎉 +3 ბურთი!',
    round: 'ROUND',
    speed: 'SPEED',
    balls: 'BALLS',
    score: 'SCORE',
    startGame: 'START GAME',
    playAgain: 'PLAY AGAIN',
    subtitle: 'Break golden ST bricks and top the studio leaderboard!',
    gameOver: 'GAME OVER',
    finalScore: 'FINAL SCORE'
  };

  const [gameState, setGameState] = useState('READY');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [ballCount, setBallCount] = useState(1);
  const [speedMult, setSpeedMult] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const engineRef = useRef({
    width: CANVAS_W,
    height: CANVAS_H,
    cell: (CANVAS_W - 16) / 7,
    pad: 8,
    brickH: ((CANVAS_W - 16) / 7) * 0.78,
    cols: 7,
    topY: 10,
    deathY: CANVAS_H - 52,
    launchY: CANVAS_H - 28,
    state: 'READY',
    bricks: [],
    balls: [],
    pickups: [],
    particles: [],
    bannerText: '',
    bannerTimer: 0,
    round: 1,
    score: 0,
    ballCount: 1,
    ballsPending: 0,
    aiming: false,
    aimAngle: 0,
    launchX: CANVAS_W / 2,
    nextLaunchX: null,
    superShots: 0,
    shootTimer: 0,
    speedMult: 1.0,
    holdingBoost: false,
    animId: null
  });

  const toggleFullscreen = () => {
    const el = containerRef.current;
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    if (nextState) {
      document.body.classList.add('app-fullscreen-active');
      try {
        if (el && el.requestFullscreen) el.requestFullscreen();
        else if (el && el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch (err) { /* ignore */ }
    } else {
      document.body.classList.remove('app-fullscreen-active');
      try {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch (err) { /* ignore */ }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
      if (isFs) document.body.classList.add('app-fullscreen-active');
      else document.body.classList.remove('app-fullscreen-active');
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.body.classList.remove('app-fullscreen-active');
    };
  }, []);

  const showBannerOnCanvas = (text) => {
    const engine = engineRef.current;
    engine.bannerText = text;
    engine.bannerTimer = 120;
  };

  const createParticles = (x, y, color) => {
    const engine = engineRef.current;
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      engine.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        alpha: 1,
        color
      });
    }
  };

  const addRow = useCallback(() => {
    const engine = engineRef.current;
    engine.bricks.forEach(b => b.row++);
    engine.pickups.forEach(p => p.row++);

    const hp = Math.min(8, 1 + Math.floor(engine.round / 2) + (engine.round > 6 ? 1 : 0));
    const logoRow = (engine.round % 4 === 1 && engine.round > 1);
    const used = [];
    const n = Math.min(6, 3 + Math.floor(Math.random() * 3) + (engine.round > 5 ? 1 : 0));

    for (let k = 0; k < n; k++) {
      const c = Math.floor(Math.random() * engine.cols);
      if (used.includes(c)) continue;
      used.push(c);
      const brickHp = (Math.random() < 0.3 && engine.round > 3) ? hp + 1 : hp;
      engine.bricks.push({ col: c, row: 0, hp: brickHp, logo: false, x: 0, y: 0, w: 0, h: 0 });
    }

    if (logoRow) {
      const freeCols = [];
      for (let c = 0; c < engine.cols; c++) if (!used.includes(c)) freeCols.push(c);
      for (let j = 0; j < 2 && freeCols.length > 0; j++) {
        const pk = freeCols.splice(Math.floor(Math.random() * freeCols.length), 1)[0];
        engine.bricks.push({ col: pk, row: 0, hp: Math.max(2, hp), logo: true, x: 0, y: 0, w: 0, h: 0 });
        used.push(pk);
      }
    }

    const pickupFree = [];
    for (let c = 0; c < engine.cols; c++) if (!used.includes(c)) pickupFree.push(c);
    if (pickupFree.length > 0 && Math.random() < 0.75) {
      const pc = pickupFree[Math.floor(Math.random() * pickupFree.length)];
      engine.pickups.push({ col: pc, row: 0, x: 0, y: 0, r: 7, taken: false });
    }

    layoutBricks();
  }, []);

  const layoutBricks = () => {
    const engine = engineRef.current;
    engine.bricks.forEach(b => {
      b.x = engine.pad + b.col * engine.cell;
      b.y = engine.topY + b.row * (engine.brickH + 6);
      b.w = engine.cell - 5;
      b.h = engine.brickH;
    });
    engine.pickups.forEach(p => {
      p.x = engine.pad + p.col * engine.cell + engine.cell / 2;
      p.y = engine.topY + p.row * (engine.brickH + 6) + engine.brickH / 2;
    });
  };

  const startGame = () => {
    if (availableLives <= 0) return;
    soundFx.init();
    onSpendLife();

    const engine = engineRef.current;
    engine.round = 1;
    engine.score = 0;
    engine.ballCount = 1;
    engine.superShots = 0;
    engine.nextLaunchX = null;
    engine.launchX = CANVAS_W / 2;
    engine.aimAngle = 0;
    engine.bricks = [];
    engine.balls = [];
    engine.pickups = [];
    engine.particles = [];
    engine.bannerText = '';
    engine.bannerTimer = 0;
    engine.holdingBoost = false;
    engine.state = 'AIM';

    setRound(1);
    setScore(0);
    setBallCount(1);
    setSpeedMult(1.0);
    setGameState('AIM');

    addRow(); addRow(); addRow();
  };

  const launch = () => {
    const engine = engineRef.current;
    if (engine.state !== 'AIM') return;
    engine.state = 'SHOOT';
    engine.ballsPending = engine.ballCount;
    engine.shootTimer = 0;
    engine.balls = [];
    engine.nextLaunchX = null;
    engine.holdingBoost = false;
    setGameState('SHOOT');
  };

  const spawnBall = () => {
    const engine = engineRef.current;
    const currentSpd = Math.min(2.2, 1.0 + (engine.round - 1) * 0.05);
    engine.speedMult = currentSpd;
    setSpeedMult(currentSpd);

    const baseSp = engine.superShots > 0 ? 12 : 10;
    const sp = baseSp * currentSpd;

    engine.balls.push({
      x: engine.launchX,
      y: engine.launchY,
      vx: Math.sin(engine.aimAngle) * sp,
      vy: -Math.cos(engine.aimAngle) * sp,
      r: engine.superShots > 0 ? 9 : 6,
      alive: true,
      sup: engine.superShots > 0
    });
    engine.ballsPending--;
  };

  const hitTest = (b, r) => {
    const cx = Math.max(r.x, Math.min(b.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
    const dx = b.x - cx;
    const dy = b.y - cy;
    return dx * dx + dy * dy < b.r * b.r;
  };

  const checkLogo = () => {
    const engine = engineRef.current;
    const left = engine.bricks.some(x => x.logo && x.hp > 0);
    if (!left) {
      if (Math.random() < 0.5) {
        engine.superShots = 2;
        showBannerOnCanvas(t.superBall);
        soundFx.playPowerup();
      } else {
        engine.ballCount += 3;
        setBallCount(engine.ballCount);
        showBannerOnCanvas(t.extraBalls);
        soundFx.playPowerup();
      }
    }
  };

  const endRound = () => {
    const engine = engineRef.current;
    engine.bricks = engine.bricks.filter(b => b.hp > 0);
    engine.pickups = engine.pickups.filter(p => !p.taken);
    if (engine.superShots > 0) engine.superShots--;
    if (engine.nextLaunchX !== null) engine.launchX = engine.nextLaunchX;
    engine.holdingBoost = false;

    engine.round++;
    setRound(engine.round);
    engine.score += 10;
    if (engine.round % 5 === 0) engine.score += 25;
    setScore(engine.score);
    onScoreUpdate(engine.score);

    addRow();

    const over = engine.bricks.some(b => b.y + b.h >= engine.deathY);
    if (over) {
      soundFx.playGameOver();
      engine.state = 'GAMEOVER';
      setGameState('GAMEOVER');
      onGameOver(engine.score);
      return;
    }

    engine.state = 'AIM';
    setGameState('AIM');
  };

  const setAimFromCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const engine = engineRef.current;

    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    const touchX = (clientX - rect.left) * scaleX;
    const touchY = (clientY - rect.top) * scaleY;

    const dx = touchX - engine.launchX;
    const dy = touchY - engine.launchY;
    const clampedDy = Math.min(-10, dy);
    engine.aimAngle = Math.max(-1.38, Math.min(1.38, Math.atan2(dx, -clampedDy)));
  };

  const handlePointerDown = (e) => {
    const engine = engineRef.current;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();

    if (engine.state === 'SHOOT') {
      engine.holdingBoost = true;
      return;
    }

    if (engine.state !== 'AIM') return;
    engine.aiming = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setAimFromCoords(clientX, clientY);
  };

  const handlePointerMove = (e) => {
    const engine = engineRef.current;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();

    if (engine.state === 'SHOOT') return;
    if (!engine.aiming || engine.state !== 'AIM') return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setAimFromCoords(clientX, clientY);
  };

  const handlePointerUp = (e) => {
    const engine = engineRef.current;
    if (e.cancelable && e.type && e.type.startsWith('touch')) e.preventDefault();

    if (engine.state === 'SHOOT') {
      engine.holdingBoost = false;
      return;
    }

    if (!engine.aiming || engine.state !== 'AIM') return;
    engine.aiming = false;
    launch();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    let animId;

    const render = () => {
      const engine = engineRef.current;
      const w = CANVAS_W;
      const h = CANVAS_H;

      ctx.clearRect(0, 0, w, h);

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#05060a');
      bgGrad.addColorStop(1, '#0b0a10');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(212,165,90,.05)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += engine.cell) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }

      // Red Line
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(224,86,60,.7)';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(0, engine.deathY); ctx.lineTo(w, engine.deathY); ctx.stroke();
      ctx.restore();

      // Bricks
      engine.bricks.forEach(b => {
        if (b.hp <= 0) return;
        const s = b.logo ? { f: 'rgba(212,165,90,.3)', s: GOLD_L, t: '#1a1200' } : TIERS[Math.min(b.hp - 1, TIERS.length - 1)];
        ctx.save();
        ctx.shadowColor = s.s;
        ctx.shadowBlur = b.logo ? 16 : 9;
        ctx.fillStyle = s.f;
        ctx.strokeStyle = s.s;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        else ctx.rect(b.x, b.y, b.w, b.h);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        ctx.fillStyle = b.logo ? GOLD_L : s.t;
        ctx.font = '700 ' + Math.round(engine.cell * 0.3) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.logo ? 'ST' : String(b.hp), b.x + b.w / 2, b.y + b.h / 2 + 1);
      });

      // Pickups (+1 Balls)
      engine.pickups.forEach(p => {
        if (p.taken) return;
        ctx.save();
        ctx.shadowColor = GOLD_L; ctx.shadowBlur = 12;
        ctx.strokeStyle = GOLD_L; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(240,217,168,.15)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = GOLD_L; ctx.font = '700 9px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('+1', p.x, p.y + .5);
      });

      // Particles
      engine.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        pt.x += pt.vx; pt.y += pt.vy; pt.alpha -= 0.04;
      });
      engine.particles = engine.particles.filter(pt => pt.alpha > 0);

      // FAINT LAUNCHER INDICATOR & AIM TRAJECTORY
      if (engine.state === 'AIM') {
        ctx.save();
        ctx.shadowColor = GOLD_L;
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(240, 217, 168, 0.12)';
        ctx.strokeStyle = 'rgba(240, 217, 168, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(engine.launchX, engine.launchY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = engine.superShots > 0 ? GOLD_L : 'rgba(240,217,168,.65)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(engine.launchX, engine.launchY);
        ctx.lineTo(engine.launchX + Math.sin(engine.aimAngle) * h * 1.5, engine.launchY - Math.cos(engine.aimAngle) * h * 1.5);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = engine.superShots > 0 ? GOLD_L : '#FFFFFF';
        ctx.shadowBlur = engine.superShots > 0 ? 20 : 12;
        ctx.fillStyle = engine.superShots > 0 ? GOLD_L : '#FFFFFF';
        ctx.beginPath(); ctx.arc(engine.launchX, engine.launchY, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        if (engine.ballCount > 1) {
          ctx.fillStyle = GOLD_L; ctx.font = '700 11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('x' + engine.ballCount, engine.launchX, engine.launchY + 28);
        }
      }

      // Shooting Balls update with FAST FORWARD HOLD BOOST
      if (engine.state === 'SHOOT') {
        engine.shootTimer++;
        const shootInterval = Math.max(2, 6 - Math.floor(engine.round / 4));
        if (engine.ballsPending > 0 && engine.shootTimer % shootInterval === 0) {
          spawnBall();
        }

        const steps = engine.holdingBoost ? 5 : 2;

        engine.balls.forEach(b => {
          if (!b.alive) return;
          for (let s = 0; s < steps; s++) {
            b.x += (b.vx / 2); b.y += (b.vy / 2);
            if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); soundFx.playHit(); }
            if (b.x > w - b.r) { b.x = w - b.r; b.vx = -Math.abs(b.vx); soundFx.playHit(); }
            if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy); soundFx.playHit(); }

            engine.bricks.forEach(br => {
              if (br.hp <= 0) return;
              if (hitTest(b, br)) {
                br.hp--;
                if (br.hp <= 0) {
                  engine.score += 2;
                  setScore(engine.score);
                  createParticles(br.x + br.w / 2, br.y + br.h / 2, br.logo ? GOLD_L : '#E0764A');
                  if (br.logo) checkLogo();
                  soundFx.playCombo(engine.round);
                } else {
                  soundFx.playHit();
                }
                if (!b.sup) {
                  const ox = Math.min(Math.abs(b.x - br.x), Math.abs(b.x - (br.x + br.w)));
                  const oy = Math.min(Math.abs(b.y - br.y), Math.abs(b.y - (br.y + br.h)));
                  if (oy < ox) b.vy = -b.vy; else b.vx = -b.vx;
                }
              }
            });

            engine.pickups.forEach(pu => {
              if (pu.taken) return;
              const ddx = b.x - pu.x, ddy = b.y - pu.y;
              if (ddx * ddx + ddy * ddy < (b.r + pu.r) * (b.r + pu.r)) {
                pu.taken = true;
                engine.ballCount++;
                setBallCount(engine.ballCount);
                soundFx.playPowerup();
              }
            });

            if (b.y > engine.launchY) {
              b.alive = false;
              if (engine.nextLaunchX === null) engine.nextLaunchX = Math.max(12, Math.min(w - 12, b.x));
            }
          }
        });

        engine.balls = engine.balls.filter(b => b.alive);
        if (engine.ballsPending <= 0 && engine.balls.length === 0) {
          endRound();
        }

        // Clean Bottom Badge Text on Canvas ("⏩ დაჩქარება")
        if (engine.holdingBoost) {
          ctx.save();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.5;
          const bw = 130, bh = 26, bx = (w - bw) / 2, by = h - 42;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 8);
          else ctx.rect(bx, by, bw, bh);
          ctx.fill(); ctx.stroke();

          ctx.fillStyle = '#FF6B6B';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(t.fastForward, w / 2, by + bh / 2);
          ctx.restore();
        }
      }

      // Draw Balls
      engine.balls.forEach(b => {
        if (!b.alive) return;
        ctx.save();
        ctx.shadowColor = b.sup ? GOLD_L : '#FFFFFF'; ctx.shadowBlur = b.sup ? 20 : 12;
        ctx.fillStyle = b.sup ? GOLD_L : '#FFFFFF';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // Canvas Powerup Banners
      if (engine.bannerTimer > 0) {
        engine.bannerTimer--;
        ctx.save();
        const bannerW = 200;
        const bannerH = 34;
        const bannerX = (w - bannerW) / 2;
        const bannerY = 24;

        ctx.shadowColor = 'rgba(240,217,168,0.6)';
        ctx.shadowBlur = 12;
        const grad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY);
        grad.addColorStop(0, '#D4A55A');
        grad.addColorStop(0.5, '#F0D9A8');
        grad.addColorStop(1, '#D4A55A');
        ctx.fillStyle = grad;

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 10);
        else ctx.rect(bannerX, bannerY, bannerW, bannerH);
        ctx.fill();

        ctx.fillStyle = '#151100';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(engine.bannerText, w / 2, bannerY + bannerH / 2);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isFullscreen, onGameOver, onScoreUpdate, t]);

  return (
    <div className={`game-board-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={containerRef}>
      <div className="game-top-bar glass">
        <div className="stat-pill">
          <span className="stat-lbl">{t.round}</span>
          <span className="stat-val text-gold">{round}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-lbl">{t.speed}</span>
          <span className="stat-val text-red">{speedMult.toFixed(1)}x</span>
        </div>
        <div className="stat-pill">
          <span className="stat-lbl">{t.balls}</span>
          <span className="stat-val">{ballCount}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-lbl">{t.score}</span>
          <span className="stat-val text-gold">{score.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn-icon" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="btn-icon" onClick={() => { soundFx.muted = !muted; setMuted(!muted); }}>
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {gameState === 'READY' && (
          <div className="overlay-screen glass">
            <div className="game-logo">
              <Award size={48} className="text-gold animate-pulse" />
              <h2>DANCING BRICKS</h2>
              <p>{t.subtitle}</p>
            </div>

            {availableLives > 0 ? (
              <button className="btn-play-big" onClick={startGame}>
                <Play size={20} fill="black" /> {t.startGame} (-1 ❤️)
              </button>
            ) : (
              <div className="no-lives-box">
                <ShieldAlert size={32} color="#ef4444" />
                <p>{t.noLives}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }} onClick={onOpenQuiz}>
                    {t.quizBonus}
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }} onClick={onOpenShare}>
                    {t.shareBonus}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="overlay-screen glass animate-in">
            <h2>{t.gameOver}</h2>
            <div className="final-score">
              <span>{t.finalScore}</span>
              <strong>{score.toLocaleString()}</strong>
              <span style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>{t.round}: #{round}</span>
            </div>
            {availableLives > 0 ? (
              <button className="btn-play-big" onClick={startGame}>
                <RotateCcw size={18} /> {t.playAgain} (-1 ❤️)
              </button>
            ) : (
              <div className="no-lives-box">
                <ShieldAlert size={32} color="#ef4444" />
                <p>{t.noLives}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }} onClick={onOpenQuiz}>
                    {t.quizBonus}
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px' }} onClick={onOpenShare}>
                    {t.shareBonus}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
