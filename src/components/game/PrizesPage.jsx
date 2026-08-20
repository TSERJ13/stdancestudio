import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRIZES } from './SpinModal';
import { useLanguage } from '../../context/LanguageContext';

export default function PrizesPage() {
  const { lang } = useLanguage();
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const loadedImgsRef = useRef([]);
  const [imagesReady, setImagesReady] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const geo = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 4 * 3600000);
      let yr = geo.getFullYear(), mo = geo.getMonth();
      if (geo.getDate() > 25) { mo++; if (mo > 11) { mo = 0; yr++; } }
      const target = new Date(yr, mo, 20, 22, 0, 0);
      const diff = target - geo;
      if (diff <= 0) { setCountdown(''); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(`${d}დ ${h}სთ ${m}წთ ${s}წმ`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Load images
  useEffect(() => {
    const loaded = [];
    let count = 0;
    PRIZES.forEach((p, idx) => {
      const img = new Image();
      img.src = p.img;
      img.onload = () => { count++; loaded[idx] = img; if (count === PRIZES.length) setImagesReady(true); };
      img.onerror = () => { count++; loaded[idx] = null; if (count === PRIZES.length) setImagesReady(true); };
    });
    loadedImgsRef.current = loaded;
  }, []);

  // Draw wheel — exact same as SpinModal
  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const displaySize = 320;
    const dpr = Math.max(2, window.devicePixelRatio || 2);
    const pixelSize = displaySize * dpr;

    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const center = displaySize / 2;
    const radius = displaySize / 2 - 10;
    const numSlices = PRIZES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, displaySize, displaySize);

    // Outer Gold Ring Glow
    ctx.save();
    ctx.shadowColor = '#d4a64a';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#d4a64a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const startA = currentAngle + i * sliceAngle;
      const endA = startA + sliceAngle;
      const prize = PRIZES[i];

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startA, endA);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? 'rgba(212, 166, 74, 0.22)' : 'rgba(15, 15, 25, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 166, 74, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      const midA = startA + sliceAngle / 2;
      ctx.translate(center, center);
      ctx.rotate(midA);

      // Text label near outer rim
      ctx.save();
      ctx.translate(radius * 0.83, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#F0D9A8';
      ctx.font = '900 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();

      // Prize image disk
      const img = loadedImgsRef.current[i];
      const imgDist = radius * 0.48;
      const imgSize = 54;
      const imgRadius = imgSize / 2;

      if (img) {
        ctx.save();
        ctx.translate(imgDist, 0);
        ctx.rotate(Math.PI / 2);

        ctx.beginPath();
        ctx.arc(0, 0, imgRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, imgRadius - 0.5, 0, Math.PI * 2);
        ctx.clip();
        const maxDim = imgSize * 0.78;
        const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height || 1);
        let drawW = maxDim, drawH = maxDim;
        if (aspect > 1) drawH = maxDim / aspect; else drawW = maxDim * aspect;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, imgRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#D4A64A';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // Center Golden Cap
    ctx.save();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 14;
    const capRadius = 24;
    const grad = ctx.createLinearGradient(center - capRadius, center - capRadius, center + capRadius, center + capRadius);
    grad.addColorStop(0, '#d4a64a');
    grad.addColorStop(1, '#f0d9a8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, capRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#151100';
    ctx.beginPath();
    ctx.arc(center, center, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  };

  // Auto-spin loop
  useEffect(() => {
    if (!imagesReady) return;
    const animate = () => {
      angleRef.current += 0.006;
      drawWheel(angleRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [imagesReady]);

  // Tap handler — find which slice was tapped
  const handleTap = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY;
    if (clientX == null) return;

    const x = (clientX - rect.left) * (canvas.width / rect.width / (Math.max(2, window.devicePixelRatio || 2))) - 160;
    const y = (clientY - rect.top) * (canvas.height / rect.height / (Math.max(2, window.devicePixelRatio || 2))) - 160;

    let clickAngle = Math.atan2(y, x) - angleRef.current;
    clickAngle = ((clickAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sliceAngle = (Math.PI * 2) / PRIZES.length;
    const idx = Math.floor(clickAngle / sliceAngle) % PRIZES.length;
    setSelectedPrize(PRIZES[idx]);
  };

  return (
    <div className="rules-card glass animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', overflowY: 'auto', paddingBottom: '80px' }}>

      <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#F0D9A8', margin: 0 }}>
          🎁 {lang === 'ka' ? '20 რიცხვის გათამაშება' : 'Monthly Prize Draw'}
        </h2>
        {countdown ? (
          <span style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '900' }}>⏱ {countdown}</span>
        ) : null}
      </div>

      <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
        {lang === 'ka'
          ? 'იყავი #1 ლიდერბორდზე 20 რიცხვამდე. სექტორზე შეეხე, პრიზი ნახე!'
          : 'Be #1 on leaderboard until the 20th. Tap a sector to preview the prize!'}
      </p>

      {/* Wheel */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
          borderTop: '20px solid #ef4444',
          zIndex: 10, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
        }} />
        <canvas
          ref={canvasRef}
          onClick={handleTap}
          onTouchEnd={handleTap}
          style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '50%', cursor: 'pointer', touchAction: 'none' }}
        />
      </div>

      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
        {lang === 'ka' ? '☝️ სექტორზე შეეხე პრიზის სანახავად' : '☝️ Tap a sector to see the prize'}
      </p>

      {/* Prize popup modal */}
      {selectedPrize && createPortal(
        <div
          className="modal-overlay"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedPrize(null)}
        >
          <div
            className="modal-content glass animate-in"
            style={{ maxWidth: '320px', padding: '24px', textAlign: 'center', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn-close"
              onClick={() => setSelectedPrize(null)}
              style={{ position: 'absolute', top: '12px', right: '12px' }}
            >✕</button>

            <div style={{
              width: '140px', height: '140px', margin: '0 auto 16px',
              background: '#ffffff', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10px', border: `2.5px solid ${selectedPrize.color || '#d4a64a'}`,
              boxShadow: `0 8px 30px ${selectedPrize.color || '#d4a64a'}55`
            }}>
              <img src={selectedPrize.img} alt={selectedPrize.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h3 style={{ color: selectedPrize.color || '#F0D9A8', fontSize: '20px', fontWeight: '900', margin: '0 0 6px' }}>
              {selectedPrize.name}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '12px', lineHeight: '1.5', margin: '0 0 16px' }}>
              {selectedPrize.desc}
            </p>

            <div style={{
              background: 'rgba(212,166,74,0.1)', border: '1px solid rgba(212,166,74,0.3)',
              borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#F0D9A8',
              fontWeight: '800', lineHeight: '1.6', marginBottom: '8px'
            }}>
              🏆 {lang === 'ka'
                ? 'შეინარჩუნე ლიდერობა 20 სექტემბრამდე და მიიღე ST Dance-ის მერჩის საჩუქრები!'
                : 'Stay #1 until the 20th and win exclusive ST Dance merch!'}
            </div>

            {countdown ? (
              <div style={{ fontSize: '13px', color: '#d4a64a', fontWeight: '900', marginBottom: '16px' }}>
                ⏱ {countdown}
              </div>
            ) : null}

            <button
              onClick={() => setSelectedPrize(null)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none', color: '#151100', fontWeight: '900', fontSize: '14px', cursor: 'pointer'
              }}
            >
              {lang === 'ka' ? 'გასაგებია' : 'Got it'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
