import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Award, Zap } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';

const BRICK_COLORS = {
  'Samba': '#f97316',
  'Cha-Cha': '#f59e0b',
  'Rumba': '#ef4444',
  'Paso Doble': '#8b5cf6',
  'Jive': '#22c55e',
  'Waltz': '#3b82f6',
  'Tango': '#dc2626',
  'Quickstep': '#10b981',
  'GOC Special': '#ff416c'
};

export default function GameBoard({ onGameOver, onScoreUpdate, availableLives, onSpendLife }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [gameState, setGameState] = useState('READY'); // READY, PLAYING, GAMEOVER, WON
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [muted, setMuted] = useState(false);

  const engineRef = useRef({
    score: 0,
    combo: 0,
    comboTimer: null,
    paddle: { x: 0, w: 100, h: 14, speed: 8 },
    balls: [],
    bricks: [],
    particles: [],
    animId: null,
    width: 600,
    height: 500
  });

  const initGame = useCallback(() => {
    const engine = engineRef.current;
    engine.score = 0;
    engine.combo = 0;
    setScore(0);
    setCombo(0);

    const w = engine.width;
    const h = engine.height;

    engine.paddle = {
      x: w / 2 - 50,
      y: h - 30,
      w: 100,
      h: 14,
      color: '#1db954'
    };

    engine.balls = [{
      x: w / 2,
      y: h - 50,
      vx: (Math.random() > 0.5 ? 1 : -1) * (3.5 + Math.random()),
      vy: -5,
      r: 8,
      color: '#ffffff'
    }];

    const rows = 5;
    const cols = 7;
    const padding = 8;
    const offsetTop = 50;
    const offsetLeft = 15;
    const brickW = (w - (offsetLeft * 2) - (padding * (cols - 1))) / cols;
    const brickH = 24;

    const styles = ['Samba', 'Cha-Cha', 'Rumba', 'Paso Doble', 'Jive', 'Waltz', 'Tango'];

    const bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const style = styles[(r + c) % styles.length];
        bricks.push({
          x: offsetLeft + c * (brickW + padding),
          y: offsetTop + r * (brickH + padding),
          w: brickW,
          h: brickH,
          style: style,
          color: BRICK_COLORS[style] || '#1db954',
          hp: r === 0 ? 2 : 1,
          maxHp: r === 0 ? 2 : 1,
          points: (rows - r) * 10
        });
      }
    }
    engine.bricks = bricks;
    engine.particles = [];
  }, []);

  const createParticles = (x, y, color) => {
    const engine = engineRef.current;
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      engine.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3,
        alpha: 1,
        color
      });
    }
  };

  const startGame = () => {
    if (availableLives <= 0) return;
    soundFx.init();
    onSpendLife();
    initGame();
    setGameState('PLAYING');
  };

  const handlePointerMove = (e) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const relX = clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const engine = engineRef.current;
    engine.paddle.x = Math.max(0, Math.min(canvas.width - engine.paddle.w, (relX * scaleX) - (engine.paddle.w / 2)));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING') return;
      const engine = engineRef.current;
      if (e.key === 'ArrowLeft') {
        engine.paddle.x = Math.max(0, engine.paddle.x - 20);
      } else if (e.key === 'ArrowRight') {
        engine.paddle.x = Math.min(engine.width - engine.paddle.w, engine.paddle.x + 20);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const w = Math.min(container.clientWidth - 20, 600);
      const h = Math.round(w * 0.82);
      canvas.width = w;
      canvas.height = h;
      engineRef.current.width = w;
      engineRef.current.height = h;
    };

    resize();
    window.addEventListener('resize', resize);

    let animationFrameId;

    const render = () => {
      const engine = engineRef.current;
      const w = engine.width;
      const h = engine.height;

      ctx.clearRect(0, 0, w, h);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a0a0f');
      bgGrad.addColorStop(1, '#12121e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (gameState === 'PLAYING') {
        const p = engine.paddle;
        p.y = h - 25;
        const padGrad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
        padGrad.addColorStop(0, '#d4a64a');
        padGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = padGrad;
        ctx.shadowColor = '#d4a64a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.w, p.h, 7);
        else ctx.rect(p.x, p.y, p.w, p.h);
        ctx.fill();
        ctx.shadowBlur = 0;

        engine.balls.forEach((b) => {
          b.x += b.vx;
          b.y += b.vy;

          if (b.x - b.r <= 0) { b.x = b.r; b.vx *= -1; soundFx.playHit(); }
          if (b.x + b.r >= w) { b.x = w - b.r; b.vx *= -1; soundFx.playHit(); }
          if (b.y - b.r <= 0) { b.y = b.r; b.vy *= -1; soundFx.playHit(); }

          if (b.y + b.r >= p.y && b.y - b.r <= p.y + p.h && b.x >= p.x && b.x <= p.x + p.w) {
            b.vy = -Math.abs(b.vy);
            const hitPoint = (b.x - (p.x + p.w / 2)) / (p.w / 2);
            b.vx = hitPoint * 6;
            soundFx.playPaddleHit();
          }

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          engine.bricks.forEach((brick) => {
            if (brick.hp <= 0) return;
            if (
              b.x + b.r >= brick.x &&
              b.x - b.r <= brick.x + brick.w &&
              b.y + b.r >= brick.y &&
              b.y - b.r <= brick.y + brick.h
            ) {
              b.vy *= -1;
              brick.hp -= 1;

              if (brick.hp <= 0) {
                createParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
                engine.combo += 1;
                const pointsGained = brick.points * Math.min(engine.combo, 5);
                engine.score += pointsGained;
                setScore(engine.score);
                setCombo(engine.combo);
                onScoreUpdate(engine.score);
                soundFx.playCombo(engine.combo);
              } else {
                soundFx.playHit();
              }
            }
          });
        });

        engine.balls = engine.balls.filter(b => b.y - b.r < h);
        if (engine.balls.length === 0) {
          soundFx.playGameOver();
          setGameState('GAMEOVER');
          onGameOver(engine.score);
        }

        const remainingBricks = engine.bricks.filter(b => b.hp > 0);
        if (remainingBricks.length === 0) {
          soundFx.playVictory();
          setGameState('WON');
        }

        engine.bricks.forEach((brick) => {
          if (brick.hp <= 0) return;
          ctx.fillStyle = brick.color;
          ctx.shadowColor = brick.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 5);
          else ctx.rect(brick.x, brick.y, brick.w, brick.h);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(brick.style, brick.x + brick.w / 2, brick.y + brick.h / 2);
        });

        engine.particles.forEach(pt => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.025;
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        engine.particles = engine.particles.filter(pt => pt.alpha > 0);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, onGameOver, onScoreUpdate]);

  return (
    <div className="game-board-container" ref={containerRef}>
      <div className="game-top-bar glass">
        <div className="stat-pill">
          <span className="stat-lbl">SCORE</span>
          <span className="stat-val text-gold">{score.toLocaleString()}</span>
        </div>
        {combo > 1 && (
          <div className="stat-pill combo-pill animate-bounce">
            <Zap size={14} color="#f59e0b" />
            <span className="stat-val">{combo}x COMBO!</span>
          </div>
        )}
        <button className="btn-icon" onClick={() => { soundFx.muted = !muted; setMuted(!muted); }}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      <div
        className="canvas-wrapper"
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      >
        <canvas ref={canvasRef} />

        {gameState === 'READY' && (
          <div className="overlay-screen glass">
            <div className="game-logo">
              <Award size={48} className="text-gold animate-pulse" />
              <h2>Dancing Bricks</h2>
              <p>Break the dance bricks and reach the top leaderboard!</p>
            </div>
            {availableLives > 0 ? (
              <button className="btn-play-big" onClick={startGame}>
                <Play size={22} fill="black" /> START GAME (1 ❤️)
              </button>
            ) : (
              <div className="no-lives-box">
                <ShieldAlert size={32} color="#ef4444" />
                <p>No lives left for today!</p>
                <span>Answer Quiz (+1 ❤️) or Share Post (+1 ❤️) to get bonus lives!</span>
              </div>
            )}
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div className="overlay-screen glass animate-in">
            <h2>GAME OVER</h2>
            <div className="final-score">
              <span>FINAL SCORE</span>
              <strong>{score.toLocaleString()}</strong>
            </div>
            {availableLives > 0 ? (
              <button className="btn-play-big" onClick={startGame}>
                <RotateCcw size={20} /> PLAY AGAIN (1 ❤️)
              </button>
            ) : (
              <div className="no-lives-box">
                <p>Out of lives!</p>
                <span>Complete Quiz or Share to earn +1 ❤️</span>
              </div>
            )}
          </div>
        )}

        {gameState === 'WON' && (
          <div className="overlay-screen glass animate-in">
            <h2>🏆 STAGE CLEARED!</h2>
            <div className="final-score">
              <span>WINNING SCORE</span>
              <strong>{score.toLocaleString()}</strong>
            </div>
            <button className="btn-play-big" onClick={startGame}>
              <Play size={20} fill="black" /> NEXT STAGE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
