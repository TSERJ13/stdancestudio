import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PRIZES } from './SpinModal';
import { useLanguage } from '../../context/LanguageContext';

export default function PrizesPage() {
  const { lang } = useLanguage();
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const imagesRef = useRef([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Pre-load all prize images
  useEffect(() => {
    let loaded = 0;
    const imgs = PRIZES.map((prize, i) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === PRIZES.length) setImagesLoaded(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === PRIZES.length) setImagesLoaded(true);
      };
      img.src = prize.img;
      return img;
    });
    imagesRef.current = imgs;
  }, []);

  // Draw wheel function
  const drawWheel = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.parentElement?.offsetWidth || 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const center = size / 2;
    const radius = center - 6;
    const sliceAngle = (Math.PI * 2) / PRIZES.length;

    const bgColors = [
      '#1a0e00', '#0e0a1a', '#001a10', '#1a0a00',
      '#0a001a', '#001010', '#1a1500', '#1a0000'
    ];

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);

    PRIZES.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = bgColors[i % bgColors.length];
      ctx.fill();
      ctx.strokeStyle = '#d4a64a';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Prize image
      const midAngle = startAngle + sliceAngle / 2;
      const imgDist = radius * 0.62;
      const imgX = Math.cos(midAngle) * imgDist;
      const imgY = Math.sin(midAngle) * imgDist;
      const imgRadius = radius * 0.18;
      const drawW = imgRadius * 2;
      const drawH = imgRadius * 2;

      ctx.save();
      ctx.translate(imgX, imgY);
      ctx.rotate(midAngle + Math.PI / 2);

      // White circle bg for image
      ctx.beginPath();
      ctx.arc(0, 0, imgRadius + 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fill();

      const img = imagesRef.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, imgRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, imgRadius, 0, Math.PI * 2);
      ctx.strokeStyle = prize.color || '#d4a64a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();

    // Gold border ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#d4a64a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center cap
    ctx.save();
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
    const capR = size * 0.07;
    const grad = ctx.createLinearGradient(center - capR, center - capR, center + capR, center + capR);
    grad.addColorStop(0, '#d4a64a');
    grad.addColorStop(1, '#f0d9a8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, capR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#151100';
    ctx.beginPath();
    ctx.arc(center, center, capR * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Auto-spin animation
  useEffect(() => {
    if (!imagesLoaded) return;

    const speed = 0.006; // slow continuous spin
    const animate = () => {
      angleRef.current += speed;
      drawWheel(angleRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [imagesLoaded]);

  // Handle canvas tap — determine which slice was clicked
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left - rect.width / 2;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top - rect.height / 2;

    // Get angle relative to wheel's current rotation
    let clickAngle = Math.atan2(y, x) - angleRef.current;
    // Normalize to [0, 2π]
    clickAngle = ((clickAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    const sliceAngle = (Math.PI * 2) / PRIZES.length;
    const idx = Math.floor(clickAngle / sliceAngle) % PRIZES.length;
    setSelectedPrize(PRIZES[idx]);
  };

  return (
    <div className="rules-card glass animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', overflowY: 'auto', paddingBottom: '80px' }}>

      <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#F0D9A8', margin: 0, alignSelf: 'flex-start' }}>
        {lang === 'ka' ? '🎁 20 რიცხვის გათამაშება' : '🎁 Monthly Prize Draw'}
      </h2>

      <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
        {lang === 'ka'
          ? 'დარჩი #1 და 20 რიცხვს დაატრიალებ ამ დოლურას! შეეხე ნებისმიერ სექტორს, რომ ნახო პრიზი.'
          : 'Stay #1 and spin this wheel on the 20th! Tap any sector to see the prize.'}
      </p>

      {/* Spinning Wheel */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
        {/* Top pointer */}
        <div style={{
          position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
          borderTop: '20px solid #ef4444',
          zIndex: 10, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
        }} />
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onTouchEnd={handleCanvasClick}
          style={{ display: 'block', width: '100%', borderRadius: '50%', cursor: 'pointer' }}
        />
      </div>

      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
        {lang === 'ka' ? '☝️ სექტორზე შეეხე პრიზის სანახავად' : '☝️ Tap a sector to preview the prize'}
      </p>

      {/* Prize list below wheel */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PRIZES.map((prize, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedPrize(prize)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${prize.color}33`,
              borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left', width: '100%'
            }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '8px', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px',
              border: `1.5px solid ${prize.color || '#d4a64a'}`, flexShrink: 0
            }}>
              <img src={prize.img} alt={prize.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: prize.color || '#F0D9A8' }}>{prize.name}</div>
              <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>{prize.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Prize Detail Modal */}
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
              boxShadow: `0 8px 30px ${selectedPrize.color || '#d4a64a'}44`
            }}>
              <img src={selectedPrize.img} alt={selectedPrize.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h3 style={{ color: selectedPrize.color || '#F0D9A8', fontSize: '20px', fontWeight: '900', margin: '0 0 8px' }}>
              {selectedPrize.name}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '13px', lineHeight: '1.6', margin: '0 0 20px' }}>
              {selectedPrize.desc}
            </p>

            <div style={{
              background: 'rgba(212,166,74,0.1)', border: '1px solid rgba(212,166,74,0.3)',
              borderRadius: '12px', padding: '12px 16px', fontSize: '12px', color: '#F0D9A8',
              fontWeight: '700', lineHeight: '1.5'
            }}>
              {lang === 'ka'
                ? '🏆 იყავი #1 ლიდერბორდზე 20 რიცხვამდე და გაიმარჯვე ამ პრიზში!'
                : '🏆 Be #1 on the leaderboard until the 20th to win this prize!'}
            </div>

            <button
              onClick={() => setSelectedPrize(null)}
              style={{
                marginTop: '16px', width: '100%', padding: '12px', borderRadius: '12px',
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
