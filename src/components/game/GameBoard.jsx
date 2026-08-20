import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Heart, Award, Maximize2, Minimize2, HelpCircle, Share2 } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';

const GOLD_L = '#F0D9A8';
const TIERS = [
  { f: 'rgba(212,165,90,.22)', s: '#D4A55A', t: '#F0D9A8' }, // 1 - Gold / Yellow
  { f: 'rgba(56,189,248,.22)', s: '#38BDF8', t: '#BAE6FD' }, // 2 - Bright Cyan / Blue
  { f: 'rgba(192,132,252,.22)', s: '#C084FC', t: '#F3E8FF' }, // 3 - Neon Purple
  { f: 'rgba(251,146,60,.22)', s: '#FB923C', t: '#FFEDD5' }, // 4 - Vivid Orange
  { f: 'rgba(74,222,128,.22)', s: '#4ADE80', t: '#DCFCE7' }, // 5 - Emerald Green
  { f: 'rgba(248,113,113,.26)', s: '#F87171', t: '#FEE2E2' }, // 6 - Electric Crimson Red
  { f: 'rgba(244,114,182,.22)', s: '#F472B6', t: '#FCE7F3' }, // 7 - Neon Magenta Pink
  { f: 'rgba(251,191,36,.22)', s: '#FBBF24', t: '#FEF3C7' }, // 8 - Amber Sun
  { f: 'rgba(45,212,191,.22)', s: '#2DD4BF', t: '#CCFBF1' }, // 9 - Bright Teal
  { f: 'rgba(129,140,248,.22)', s: '#818CF8', t: '#E0E7FF' }  // 10 - Royal Indigo
];

const CANVAS_W = 440;
// CANVAS_H is now dynamic based on wrapper aspect ratio

export default function GameBoard({ tGame, availableLives, onSpendLife, onGameOver, onScoreUpdate, onOpenQuiz, onOpenShare }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const stLogoImgRef = useRef(null);

  const t = tGame || {
    fastForward: 'FAST FORWARD',
    superBall: 'SUPER BALL!',
    extraBalls: '+3 BALLS!',
    round: 'ROUND',
    speed: 'SPEED',
    balls: 'BALLS',
    score: 'SCORE',
    startGame: 'დაწყება',
    playAgain: 'ხელახლა დაწყება',
    subtitle: 'დაამსხვრიე ოქროსფერი ST აგურები და გახდი ლიდერბორდის გამარჯვებული!',
    gameOver: 'GAME OVER',
    finalScore: 'საბოლოო ქულა'
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
    height: 600,
    cell: (CANVAS_W - 16) / 7,
    pad: 8,
    brickH: ((CANVAS_W - 16) / 7) * 0.78,
    cols: 7,
    topY: 10,
    deathY: 600 - 52,
    launchY: 600 - 28,
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

  useEffect(() => {
    const img = new Image();
    img.src = '/images/st_logo.png';
    img.onload = () => {
      stLogoImgRef.current = img;
    };
  }, []);

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

    const hp = Math.max(1, engine.round);
    const used = [];
    // More bricks per row as rounds increase: 4-5 early, 6-7 from round 10+
    const minBricks = engine.round >= 10 ? 5 : 4;
    const maxBricks = engine.round >= 15 ? 7 : engine.round >= 10 ? 6 : 5;
    const n = Math.min(engine.cols, minBricks + Math.floor(Math.random() * (maxBricks - minBricks + 1)));

    for (let k = 0; k < n; k++) {
      let c;
      let attempts = 0;
      do { c = Math.floor(Math.random() * engine.cols); attempts++; } while (used.includes(c) && attempts < 20);
      if (used.includes(c)) continue;
      used.push(c);
      engine.bricks.push({
        col: c, row: 0, hp, specialType: null, x: 0, y: 0, w: 0, h: 0
      });
    }

    if (engine.round % 4 === 0 && engine.round > 1) {
      const freeCols = [];
      for (let c = 0; c < engine.cols; c++) if (!used.includes(c)) freeCols.push(c);

      if (freeCols.length > 0) {
        const pk = freeCols[Math.floor(Math.random() * freeCols.length)];
        const rand = Math.random();
        let specialType = 'logo_gold';
        let specialHp = 1; // Special bonus logo bricks break in 1 single hit!

        if (rand < 0.25) {
          specialType = 'logo_green';
        } else if (rand < 0.50) {
          specialType = 'logo_purple';
        } else if (rand < 0.75) {
          specialType = 'super_pearl';
          specialHp = 1;
        }

        engine.bricks.push({
          col: pk, row: 0, hp: specialHp, specialType, x: 0, y: 0, w: 0, h: 0
        });
        used.push(pk);
      }
    }

    // Ball pickups get rarer at higher rounds to limit ball accumulation
    const pickupChance = Math.max(0.15, 0.65 - engine.round * 0.01);
    const pickupFree = [];
    for (let c = 0; c < engine.cols; c++) if (!used.includes(c)) pickupFree.push(c);
    if (pickupFree.length > 0 && Math.random() < pickupChance && engine.ballCount < 20) {
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
    // Speed ramps +0.064 per round (20% easier than +0.08), cap at 4.0x
    const currentSpd = Math.min(4.0, 1.0 + (engine.round - 1) * 0.064);
    engine.speedMult = currentSpd;
    setSpeedMult(currentSpd);

    const baseSp = engine.superShots > 0 ? 9.6 : 8.0;
    const sp = baseSp * currentSpd;

    engine.balls.push({
      x: engine.launchX,
      y: engine.launchY,
      vx: Math.sin(engine.aimAngle) * sp,
      vy: -Math.cos(engine.aimAngle) * sp,
      r: engine.superShots > 0 ? 9 : 6,
      alive: true,
      sup: engine.superShots > 0,
      sideBounces: 0
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

  const handleSpecialBrickDestroyed = (b) => {
    const engine = engineRef.current;
    const MAX_BALLS = 20;
    if (b.specialType === 'logo_gold') {
      engine.ballCount = Math.min(MAX_BALLS, engine.ballCount + 1);
      setBallCount(engine.ballCount);
      showBannerOnCanvas('+1 BALL!');
      soundFx.playPowerup();
    } else if (b.specialType === 'logo_green') {
      engine.ballCount = Math.min(MAX_BALLS, engine.ballCount + 2);
      setBallCount(engine.ballCount);
      showBannerOnCanvas('+2 BALLS!');
      soundFx.playPowerup();
    } else if (b.specialType === 'logo_purple') {
      engine.ballCount = Math.min(MAX_BALLS, engine.ballCount + 3);
      setBallCount(engine.ballCount);
      showBannerOnCanvas('+3 BALLS!');
      soundFx.playPowerup();
    } else if (b.specialType === 'super_pearl') {
      engine.superShots = 2;
      showBannerOnCanvas(t.superBall);
      soundFx.playPowerup();
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
    const scaleY = engine.height / rect.height;

    const touchX = (clientX - rect.left) * scaleX;
    const touchY = (clientY - rect.top) * scaleY;

    const dx = touchX - engine.launchX;
    const dy = touchY - engine.launchY;
    const clampedDy = Math.min(-12, dy);

    engine.aimAngle = Math.max(-1.45, Math.min(1.45, Math.atan2(dx, -clampedDy)));
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
    const wrapper = canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const aspect = (rect.height && rect.width) ? (rect.height / rect.width) : 1.25;
    let dynamicH = Math.floor(CANVAS_W * Math.max(1.18, Math.min(1.32, aspect)));
    dynamicH = Math.max(520, Math.min(560, dynamicH)); // Tight ergonomic bounds for mobile

    const engine = engineRef.current;
    engine.height = dynamicH;
    engine.deathY = dynamicH - 68;
    engine.launchY = dynamicH - 38;

    canvas.width = CANVAS_W;
    canvas.height = dynamicH;
    const ctx = canvas.getContext('2d');

    let animId;

    const render = () => {
      const engine = engineRef.current;
      const w = CANVAS_W;
      const h = engine.height;

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

      // Render Bricks
      engine.bricks.forEach(b => {
        if (b.hp <= 0) return;

        // Every HP number has its own fixed distinct color!
        let style = TIERS[(b.hp - 1) % TIERS.length];

        if (b.specialType === 'logo_gold') {
          style = { f: 'rgba(212,165,90,.38)', s: GOLD_L, t: '#1a1200' };
        } else if (b.specialType === 'logo_green') {
          style = { f: 'rgba(34,197,94,.38)', s: '#22c55e', t: '#ffffff' };
        } else if (b.specialType === 'logo_purple') {
          style = { f: 'rgba(168,85,247,.38)', s: '#a855f7', t: '#ffffff' };
        } else if (b.specialType === 'super_pearl') {
          style = { f: 'rgba(236,72,153,.45)', s: '#ec4899', t: '#ffffff' };
        }

        ctx.save();
        ctx.shadowColor = style.s;
        ctx.shadowBlur = b.specialType ? 18 : 8;
        ctx.fillStyle = style.f;
        ctx.strokeStyle = style.s;
        ctx.lineWidth = b.specialType ? 2.8 : 1.8;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        else ctx.rect(b.x, b.y, b.w, b.h);
        ctx.fill(); ctx.stroke();
        ctx.restore();

        if (b.specialType && stLogoImgRef.current) {
          ctx.save();
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          const img = stLogoImgRef.current;
          const imgW = b.w * 0.85;
          const imgH = b.h * 0.85;
          const imgX = b.x + (b.w - imgW) / 2;
          const imgY = b.y + (b.h - imgH) / 2;

          ctx.drawImage(img, imgX, imgY, imgW, imgH);
          ctx.restore();
        } else {
          ctx.fillStyle = style.t;
          ctx.font = '700 ' + Math.round(engine.cell * 0.3) + 'px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(b.hp), b.x + b.w / 2, b.y + b.h / 2 + 1);
        }
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

        // Calculate Wall-Bounce Aim Trajectory Line
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = engine.superShots > 0 ? GOLD_L : 'rgba(240,217,168,.75)';
        ctx.lineWidth = 2.2;

        const startX = engine.launchX;
        const startY = engine.launchY;
        const dirX = Math.sin(engine.aimAngle);
        const dirY = -Math.cos(engine.aimAngle);

        let tWall = 10000;
        let hitSide = null;

        if (dirX < -0.0001) {
          const tLeft = (8 - startX) / dirX;
          if (tLeft > 0 && tLeft < tWall) { tWall = tLeft; hitSide = 'left'; }
        } else if (dirX > 0.0001) {
          const tRight = ((w - 8) - startX) / dirX;
          if (tRight > 0 && tRight < tWall) { tWall = tRight; hitSide = 'right'; }
        }

        const tTop = (8 - startY) / dirY;
        if (tTop > 0 && tTop < tWall) {
          tWall = tTop;
          hitSide = 'top';
        }

        const bounceX = startX + dirX * tWall;
        const bounceY = startY + dirY * tWall;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(bounceX, bounceY);
        ctx.stroke();

        if (hitSide === 'left' || hitSide === 'right') {
          const dirX2 = -dirX;
          const dirY2 = dirY;
          let len2 = 280;

          if (dirY2 < 0) {
            const tTop2 = (8 - bounceY) / dirY2;
            if (tTop2 > 0 && tTop2 < len2) {
              len2 = tTop2;
            }
          }

          const endX = bounceX + dirX2 * len2;
          const endY = bounceY + dirY2 * len2;

          ctx.beginPath();
          ctx.moveTo(bounceX, bounceY);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Reflection Dot on Wall
          ctx.restore();
          ctx.save();
          ctx.fillStyle = GOLD_L;
          ctx.shadowColor = GOLD_L;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(bounceX, bounceY, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        ctx.save();
        ctx.shadowColor = engine.superShots > 0 ? GOLD_L : '#FFFFFF';
        ctx.shadowBlur = engine.superShots > 0 ? 20 : 12;
        ctx.fillStyle = engine.superShots > 0 ? GOLD_L : '#FFFFFF';
        ctx.beginPath(); ctx.arc(engine.launchX, engine.launchY, 7, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Always show ball count at launch position
        ctx.save();
        ctx.fillStyle = GOLD_L;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = GOLD_L;
        ctx.shadowBlur = 8;
        ctx.fillText('×' + engine.ballCount, engine.launchX, engine.launchY + 26);
        ctx.restore();
      }

      if (engine.state === 'SHOOT') {
        // Show ball count indicator during shoot at last known launch position
        ctx.save();
        ctx.fillStyle = 'rgba(240,217,168,0.6)';
        ctx.font = '700 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('×' + engine.ballCount, engine.launchX, engine.launchY - 16);
        ctx.restore();
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

            if (b.x < b.r) {
              b.x = b.r;
              b.vx = Math.abs(b.vx);
              b.sideBounces = (b.sideBounces || 0) + 1;
              if (b.sideBounces > 6) {
                b.vy += 0.25;
              }
              soundFx.playHit();
            }
            if (b.x > w - b.r) {
              b.x = w - b.r;
              b.vx = -Math.abs(b.vx);
              b.sideBounces = (b.sideBounces || 0) + 1;
              if (b.sideBounces > 6) {
                b.vy += 0.25;
              }
              soundFx.playHit();
            }

            if (b.y < b.r) {
              b.y = b.r;
              b.vy = Math.abs(b.vy);
              soundFx.playHit();
            }

            engine.bricks.forEach(br => {
              if (br.hp <= 0) return;
              if (hitTest(b, br)) {
                br.hp--;
                if (br.hp <= 0) {
                  engine.score += br.specialType ? 6 : 2;
                  setScore(engine.score);
                  createParticles(br.x + br.w / 2, br.y + br.h / 2, br.specialType ? GOLD_L : '#E0764A');
                  if (br.specialType) handleSpecialBrickDestroyed(br);
                  soundFx.playCombo(engine.round);
                } else {
                  soundFx.playHit();
                }
                if (!b.sup) {
                  const brickCenterX = br.x + br.w / 2;
                  const brickCenterY = br.y + br.h / 2;
                  const diffX = b.x - brickCenterX;
                  const diffY = b.y - brickCenterY;

                  const minDistX = br.w / 2 + b.r;
                  const minDistY = br.h / 2 + b.r;

                  const overlapX = minDistX - Math.abs(diffX);
                  const overlapY = minDistY - Math.abs(diffY);

                  if (overlapX < overlapY) {
                    b.vx = diffX > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
                    b.x += diffX > 0 ? overlapX : -overlapX;
                  } else {
                    b.vy = diffY > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
                    b.y += diffY > 0 ? overlapY : -overlapY;
                  }
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

        if (engine.holdingBoost) {
          ctx.save();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1.5;
          const bw = 120, bh = 26, bx = (w - bw) / 2, by = h - 42;
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

      engine.balls.forEach(b => {
        if (!b.alive) return;
        ctx.save();
        ctx.shadowColor = b.sup ? GOLD_L : '#FFFFFF'; ctx.shadowBlur = b.sup ? 20 : 12;
        ctx.fillStyle = b.sup ? GOLD_L : '#FFFFFF';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      if (engine.bannerTimer > 0) {
        engine.bannerTimer--;
        ctx.save();
        const bannerW = 180;
        const bannerH = 32;
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
            <div className="game-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', transform: 'translateY(-34px)' }}>
              <img
                src="/images/dancing_bricks_logo.png"
                alt="Dancing Bricks"
                style={{
                  width: '160px',
                  height: 'auto',
                  maxHeight: '160px',
                  objectFit: 'contain',
                  marginBottom: '4px',
                  display: 'block',
                  animation: 'slowLogoShimmer 4s ease-in-out infinite'
                }}
              />
              <h2 style={{
                fontSize: '23px',
                fontWeight: '900',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #FFF6D6 0%, #F0D9A8 45%, #D4A55A 80%, #A3762B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'slowGoldGlowPulse 3.5s ease-in-out infinite',
                margin: '4px 0 6px'
              }}>
                DANCING BRICKS
              </h2>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 8px', maxWidth: '290px', lineHeight: '1.45', fontWeight: '500' }}>
                {t.subtitle}
              </p>
            </div>

            {availableLives > 0 ? (
              <button className="btn-play-big" onClick={startGame} style={{ margin: '0 auto' }}>
                <Play size={20} fill="black" /> {t.startGame}
              </button>
            ) : (
              <div className="no-lives-box">
                <Heart size={28} color="#ef4444" strokeWidth={2.2} />
                <p>{t.noLives}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onOpenQuiz}>
                    <HelpCircle size={14} color="#f59e0b" /> +1
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onOpenShare}>
                    <Share2 size={14} color="#ec4899" /> +1
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
                <RotateCcw size={18} /> {t.playAgain}
              </button>
            ) : (
              <div className="no-lives-box">
                <Heart size={28} color="#ef4444" strokeWidth={2.2} />
                <p>{t.noLives}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onOpenQuiz}>
                    <HelpCircle size={14} color="#f59e0b" /> +1
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={onOpenShare}>
                    <Share2 size={14} color="#ec4899" /> +1
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
