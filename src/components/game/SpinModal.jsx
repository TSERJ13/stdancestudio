import React, { useState, useEffect, useRef } from 'react';
import { Gift, Sparkles, Trophy, Award, RotateCw, Ticket, Copy, Check } from 'lucide-react';

export const PRIZES = [
  { id: 'bottle', name: 'წყლის ბოთლი', desc: 'ST Dance Studio ბრენდირებული წყლის ბოთლი', img: '/images/prizes/water_bottle.png', color: '#F0D9A8' },
  { id: 'umbrella', name: 'ქოლგა', desc: 'ST Dance Studio ბრენდირებული ქოლგა', img: '/images/prizes/umbrella.png', color: '#6FC3E0' },
  { id: 'v50', name: '-50% ვაუჩერი', desc: '-50% ფასდაკლების ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_50.png', color: '#F0D9A8' },
  { id: 'raincoat', name: 'საწვიმარი', desc: 'ST Dance Studio ბრენდირებული საწვიმარი', img: '/images/prizes/raincoat.png', color: '#B87BDE' },
  { id: 'backpack', name: 'ზურგჩანთა', desc: 'ST Dance Studio ბრენდირებული ზურგჩანთა', img: '/images/prizes/backpack.png', color: '#E0764A' },
  { id: 'phone_case', name: 'ქეისი', desc: 'ST Dance Studio ბრენდირებული ქეისი', img: '/images/prizes/phone_case.png', color: '#6FD98F' },
  { id: 'v30', name: '-30% ვაუჩერი', desc: '-30% ფასდაკლების ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_30.png', color: '#F0D9A8' },
  { id: 'v100', name: '-100% ვაუჩერი', desc: '100% უფასო სრული ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_100.png', color: '#FF4444' }
];

export default function SpinModal({ isOpen, onClose, winnerName = 'ჩემპიონი', onClaimPrize }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [copied, setCopied] = useState(false);

  const angleRef = useRef(0);
  const loadedImgsRef = useRef([]);

  useEffect(() => {
    const loaded = [];
    let count = 0;
    PRIZES.forEach((p, idx) => {
      const img = new Image();
      img.src = p.img;
      img.onload = () => {
        count++;
        loaded[idx] = img;
        if (count === PRIZES.length && canvasRef.current) {
          drawWheel(angleRef.current);
        }
      };
      img.onerror = () => {
        loaded[idx] = null;
      };
    });
    loadedImgsRef.current = loaded;
  }, []);

  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 360; // Extra High DPI Crisp Resolution
    canvas.width = size;
    canvas.height = size;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const center = size / 2;
    const radius = size / 2 - 12;
    const numSlices = PRIZES.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    ctx.clearRect(0, 0, size, size);

    // Draw Outer Gold Ring Glow
    ctx.save();
    ctx.shadowColor = '#d4a64a';
    ctx.shadowBlur = 22;
    ctx.strokeStyle = '#d4a64a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw Slices
    for (let i = 0; i < numSlices; i++) {
      const startA = currentAngle + i * sliceAngle;
      const endA = startA + sliceAngle;
      const prize = PRIZES[i];

      // Slice sector fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startA, endA);
      ctx.closePath();

      ctx.fillStyle = i % 2 === 0 ? 'rgba(212, 166, 74, 0.22)' : 'rgba(15, 15, 25, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 166, 74, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Transform context to slice middle angle
      ctx.save();
      const midA = startA + sliceAngle / 2;
      ctx.translate(center, center);
      ctx.rotate(midA);

      // 1. Draw Text Label near outer rim (radius * 0.82)
      ctx.save();
      ctx.translate(radius * 0.82, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#F0D9A8';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();

      // 2. Draw Prize Image Thumbnail on PURE WHITE BACKGROUND CIRCLE (radius * 0.48)
      const img = loadedImgsRef.current[i];
      const imgDist = radius * 0.48;
      const imgSize = 48;

      if (img) {
        ctx.save();
        ctx.translate(imgDist, 0);
        ctx.rotate(Math.PI / 2);

        // Pure White Circular Background
        ctx.beginPath();
        ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.clip();

        // Draw image cleanly centered inside white circle
        ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
        ctx.restore();

        // Glowing Gold Ring Around White Image Circle
        ctx.save();
        ctx.translate(imgDist, 0);
        ctx.strokeStyle = '#d4a64a';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#d4a64a';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, imgSize / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
    }

    // Center Golden Cap (NO ST TEXT)
    ctx.save();
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 14;
    const capRadius = 26;
    const grad = ctx.createLinearGradient(center - capRadius, center - capRadius, center + capRadius, center + capRadius);
    grad.addColorStop(0, '#d4a64a');
    grad.addColorStop(1, '#f0d9a8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center, center, capRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Gold Star Accent (No ST text)
    ctx.fillStyle = '#151100';
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => drawWheel(angleRef.current), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setWonPrize(null);

    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = (Math.PI * 2) / PRIZES.length;
    const targetSliceAngle = (PRIZES.length - prizeIdx) * sliceAngle - sliceAngle / 2 - Math.PI / 2;
    const totalRotation = Math.PI * 2 * 6 + targetSliceAngle;

    const startAngle = angleRef.current;
    const startTime = performance.now();
    const duration = 4800;

    const animateWheel = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      const currentAngle = startAngle + (totalRotation - startAngle) * easeOut;

      angleRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animateWheel);
      } else {
        setSpinning(false);
        const prize = PRIZES[prizeIdx];
        const randomCode = `ST-WIN-${Math.floor(1000 + Math.random() * 9000)}`;
        setWonPrize(prize);
        setVoucherCode(randomCode);

        const newVoucher = {
          id: Date.now(),
          code: randomCode,
          prizeName: prize.name,
          prizeDesc: prize.desc,
          prizeImg: prize.img,
          winnerName,
          date: new Date().toLocaleDateString('ka-GE')
        };

        if (onClaimPrize) onClaimPrize(newVoucher);

        try {
          fetch('https://formspree.io/f/sergitsivtsivadze@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: `ST DANCE GAME WINNER: ${winnerName}`,
              winner: winnerName,
              prize: prize.name,
              code: randomCode,
              date: new Date().toISOString()
            })
          }).catch(() => {});
        } catch {}
      }
    };

    requestAnimationFrame(animateWheel);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px', padding: '20px' }}>
        <div className="modal-header" style={{ marginBottom: '10px' }}>
          <div className="quiz-title-badge">
            <Gift size={18} color="#d4a64a" />
            <span style={{ fontSize: '12px', fontWeight: '800' }}>MONTH-END PRIZE DRUM / დოლურა</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!wonPrize ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Trophy size={18} color="#d4a64a" />
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'white', margin: 0 }}>
                {winnerName} — თვის გამარჯვებული!
              </h3>
            </div>
            <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 10px' }}>
              დაატრიალე დოლურა და მიიღე ST DANCE STUDIO & Danceshop.Ge-ს პრიზი!
            </p>

            {/* High Resolution Canvas Wheel Container with Top Pointer */}
            <div style={{ position: 'relative', width: '300px', height: '300px', margin: '4px 0 16px' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderTop: '22px solid #ef4444',
                zIndex: 30,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))'
              }} />

              <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none',
                color: '#151100',
                fontWeight: '900',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(212,166,74,0.35)',
                opacity: spinning ? 0.7 : 1
              }}
            >
              <RotateCw size={18} className={spinning ? 'animate-spin' : ''} />
              {spinning ? 'დოლურა ტრიალებს...' : 'დოლურას დატრიალება (SPIN)'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0' }}>
            <Sparkles size={44} color="#d4a64a" className="animate-bounce" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '800' }}>გილოცავთ! თქვენ მოიგეთ:</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#F0D9A8', margin: '4px 0 10px' }}>
              {wonPrize.name}
            </h3>

            {/* Crisp Pure White Studio Background Showcase Card */}
            <div style={{
              width: '260px',
              height: '170px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2.5px solid #d4a64a',
              boxShadow: '0 8px 25px rgba(212,166,74,0.35)',
              marginBottom: '14px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              boxSizing: 'border-box'
            }}>
              <img
                src={wonPrize.img}
                alt={wonPrize.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Official Voucher Card */}
            <div style={{
              width: '100%',
              background: 'rgba(212,166,74,0.12)',
              border: '1.5px dashed rgba(212,166,74,0.5)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '800' }}>ოფიციალური ვაუჩერი</span>
                <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '900', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '8px' }}>
                  ACTIVE
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: 'white', marginBottom: '2px' }}>
                {winnerName}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#F0D9A8', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Ticket size={16} /> {voucherCode}
                <button
                  onClick={handleCopyCode}
                  style={{ background: 'transparent', border: 'none', color: '#d4a64a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none',
                color: '#151100',
                fontWeight: '900',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ვაუჩერის შენახვა / COLLECT VOUCHER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
