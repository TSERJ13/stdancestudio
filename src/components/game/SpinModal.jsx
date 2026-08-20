import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Gift, Sparkles, Trophy, Award, RotateCw, Ticket, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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

const modalTranslations = {
  ka: {
    badgeTitle: 'ყოველი თვის 20 რიცხვის გათამაშება',
    winnerTitle: (name) => `${name} — 20 რიცხვის გამარჯვებული!`,
    subtitle: 'დაატრიალე დოლურა და მიიღე ST DANCE STUDIO & Danceshop.Ge-ს პრიზი!',
    spinBtn: 'დოლურას დატრიალება',
    spinningText: 'დოლურა ტრიალებს...',
    congratsText: 'გილოცავთ! თქვენ მოიგეთ:',
    officialVoucher: 'ოფიციალური ვაუჩერი',
    activeBadge: 'აქტიური',
    collectBtn: 'ვაუჩერის შენახვა'
  },
  en: {
    badgeTitle: '20th of the Month Prize Wheel',
    winnerTitle: (name) => `${name} — 20th of the Month Winner!`,
    subtitle: 'Spin the wheel to win a prize from ST Dance Studio & Danceshop.Ge!',
    spinBtn: 'Spin Prize Wheel',
    spinningText: 'Spinning wheel...',
    congratsText: 'Congratulations! You won:',
    officialVoucher: 'Official Voucher',
    activeBadge: 'ACTIVE',
    collectBtn: 'Collect Voucher'
  },
  ru: {
    badgeTitle: 'Колесо призов 20-го числа',
    winnerTitle: (name) => `${name} — Победитель 20-го числа!`,
    subtitle: 'Крутите колесо и получите приз от ST Dance Studio и Danceshop.Ge!',
    spinBtn: 'Крутить колесо',
    spinningText: 'Колесо крутится...',
    congratsText: 'Поздравляем! Вы выиграли:',
    officialVoucher: 'Официальный ваучер',
    activeBadge: 'АКТИВЕН',
    collectBtn: 'Сохранить ваучер'
  }
};

export default function SpinModal({ isOpen, onClose, winnerName = 'ჩემპიონი', onClaimPrize }) {
  const { lang } = useLanguage();
  const t = modalTranslations[lang] || modalTranslations.ka;

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

      // Slice sector fill
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startA, endA);
      ctx.closePath();

      ctx.fillStyle = i % 2 === 0 ? 'rgba(212, 166, 74, 0.22)' : 'rgba(15, 15, 25, 0.95)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(212, 166, 74, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Transform context to slice middle angle
      ctx.save();
      const midA = startA + sliceAngle / 2;
      ctx.translate(center, center);
      ctx.rotate(midA);

      // 1. Draw Text Label near outer rim
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

      // 2. Draw Prize Image Thumbnail on PURE WHITE BACKGROUND DISK
      const img = loadedImgsRef.current[i];
      const imgDist = radius * 0.48;
      const imgSize = 54;
      const imgRadius = imgSize / 2;

      if (img) {
        ctx.save();
        ctx.translate(imgDist, 0);
        ctx.rotate(Math.PI / 2);

        // A. Draw Pure White Solid Background Disk
        ctx.beginPath();
        ctx.arc(0, 0, imgRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // B. Clip Image cleanly inside White Disk
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, imgRadius - 0.5, 0, Math.PI * 2);
        ctx.clip();

        const maxDim = imgSize * 0.78;
        const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height || 1);
        let drawW = maxDim;
        let drawH = maxDim;
        if (aspect > 1) {
          drawH = maxDim / aspect;
        } else {
          drawW = maxDim * aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        // C. Draw Crisp Sharp Gold Border Ring ON TOP
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

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px', padding: '20px' }}>
        <div className="modal-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={18} color="#d4a64a" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#F0D9A8' }}>{t.badgeTitle}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {!wonPrize ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Ultra HD Canvas Wheel Container with Top Pointer */}
            <div style={{ position: 'relative', width: '320px', height: '320px', margin: '4px 0 16px' }}>
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

              <canvas
                ref={canvasRef}
                style={{
                  display: 'block',
                  width: '320px',
                  height: '320px'
                }}
              />
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
              {spinning ? t.spinningText : t.spinBtn}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0' }}>
            <Sparkles size={44} color="#d4a64a" className="animate-bounce" style={{ marginBottom: '6px' }} />
            <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '800' }}>{t.congratsText}</span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#F0D9A8', margin: '4px 0 10px' }}>
              {wonPrize.name}
            </h3>

            {/* Crisp Pure White Studio Background Showcase Card */}
            <div style={{
              width: '270px',
              height: '180px',
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
                <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '800' }}>{t.officialVoucher}</span>
                <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: '900', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '8px' }}>
                  {t.activeBadge}
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
              {t.collectBtn}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
