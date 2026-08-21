import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRIZES, getPrizeName, getPrizeDesc } from './SpinModal';
import { useLanguage } from '../../context/LanguageContext';
import { fetchCloudLeaderboard } from '../../data/classcore';
import { Trophy, Gift, CheckCircle2, Calendar, User, Award } from 'lucide-react';

// Global Instant Image Preloader — cached in browser RAM before mount
const PRELOADED_PRIZE_IMAGES = PRIZES.map(p => {
  const img = new Image();
  img.src = p.img;
  return img;
});

export default function PrizesPage() {
  const { lang } = useLanguage();
  const canvasRef = useRef(null);
  const angleRef = useRef(window.__stdance_wheel_angle || 0);
  const loadedImgsRef = useRef(PRELOADED_PRIZE_IMAGES);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [drawInfo, setDrawInfo] = useState({ titleText: '20 სექტემბრის გათამაშება', monthName: 'სექტემბრამდე' });
  const [topWinner, setTopWinner] = useState(null);
  const [recentWinners, setRecentWinners] = useState([]);

  // Fetch Cloud Leader & History
  useEffect(() => {
    fetchCloudLeaderboard().then(list => {
      if (Array.isArray(list) && list.length > 0) {
        const sorted = [...list].sort((a, b) => Number(b.score ?? b.high_score ?? 0) - Number(a.score ?? a.high_score ?? 0));
        setTopWinner(sorted[0]);
      }
    }).catch(() => {});

    try {
      const rawHist = localStorage.getItem('dancing_bricks_winners_history');
      const hist = rawHist ? JSON.parse(rawHist) : [];
      setRecentWinners(Array.isArray(hist) ? hist : []);
    } catch (e) {}
  }, []);

  // Countdown & Dynamic Draw Month
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const geo = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (4 * 3600000));
      let yr = geo.getFullYear();
      let mo = geo.getMonth();

      const thisMonthTarget = new Date(yr, mo, 20, 22, 0, 0);
      if (geo.getTime() >= thisMonthTarget.getTime()) {
        mo++;
        if (mo > 11) {
          mo = 0;
          yr++;
        }
      }

      const targetDate = new Date(yr, mo, 20, 22, 0, 0);
      const diff = targetDate.getTime() - geo.getTime();

      const monthGenitiveKa = ["იანვრის", "თებერვლის", "მარტის", "აპრილის", "მაისის", "ივნისის", "ივლისის", "აგვისტოს", "სექტემბრის", "ოქტომბრის", "ნოემბრის", "დეკემბრის"];
      const monthGenitiveEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
      const monthGenitiveRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];

      let mName = monthGenitiveKa[mo];
      let tTitle = `20 ${mName} გათამაშება`;
      if (lang === 'en') {
        mName = monthGenitiveEn[mo];
        tTitle = `${mName} 20th Prize Draw`;
      } else if (lang === 'ru') {
        mName = monthGenitiveRu[mo];
        tTitle = `Розыгрыш 20 ${mName}`;
      }

      setDrawInfo({ titleText: tTitle, monthName: mName });

      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);

      let timeStr = `${d}დ ${h}სთ ${m}წთ ${s}წმ`;
      if (lang === 'en') {
        timeStr = `${d}d ${h}h ${m}m ${s}s`;
      } else if (lang === 'ru') {
        timeStr = `${d}д ${h}ч ${m}мин ${s}сек`;
      }
      setCountdown(timeStr);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [lang]);

  // Draw wheel immediately on mount using preloaded RAM images
  useEffect(() => {
    if (canvasRef.current) drawWheel(angleRef.current);
    const t1 = setTimeout(() => {
      if (canvasRef.current) drawWheel(angleRef.current);
    }, 10);
    return () => clearTimeout(t1);
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
      ctx.fillText(getPrizeName(prize, lang), 0, 0);
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

  // Auto-spin wheel animation loop
  useEffect(() => {
    let animId;
    const animate = () => {
      angleRef.current += 0.005;
      window.__stdance_wheel_angle = angleRef.current;
      if (canvasRef.current) drawWheel(angleRef.current);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Tap handler — find which slice was tapped
  const handleTap = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    if (clientX == null || clientY == null) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    let clickAngle = Math.atan2(y, x) - angleRef.current;
    clickAngle = ((clickAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const sliceAngle = (Math.PI * 2) / PRIZES.length;
    const idx = Math.floor(clickAngle / sliceAngle) % PRIZES.length;
    setSelectedPrize(PRIZES[idx]);
  };

  return (
    <div className="rules-card glass animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', overflowY: 'auto', paddingBottom: '80px' }}>

      <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '900', color: '#F0D9A8', margin: 0, textAlign: 'center' }}>
          🎁 {drawInfo.titleText}
        </h2>
        {countdown ? (
          <span style={{ fontSize: '13px', color: '#d4a64a', fontWeight: '900', background: 'rgba(212,166,74,0.12)', padding: '5px 14px', borderRadius: '10px', border: '1px solid rgba(212,166,74,0.3)', whiteSpace: 'nowrap' }}>
            ⏱ {countdown}
          </span>
        ) : null}
      </div>

      <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
        {lang === 'ka'
          ? `იყავი #1 ლიდერბორდზე 20 ${drawInfo.monthName} გათამაშებამდე. სექტორზე შეეხე, პრიზი ნახე!`
          : lang === 'ru'
          ? `Будьте #1 в лидерборде до розыгрыша 20 ${drawInfo.monthName}. Нажмите на сектор для просмотра!`
          : `Be #1 on the leaderboard until the ${drawInfo.monthName} 20th draw. Tap a sector to preview!`}
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
          style={{ display: 'block', width: '100%', height: 'auto', borderRadius: '50%', cursor: 'pointer' }}
        />
      </div>

      <p style={{ fontSize: '11px', color: '#52525b', margin: 0 }}>
        {lang === 'ka' ? '☝️ სექტორზე შეეხე პრიზის სანახავად' : '☝️ Tap a sector to see the prize'}
      </p>

      {/* Winners History Section (გამარჯვებულების ისტორია) */}
      <div style={{ width: '100%', maxWidth: '340px', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: '900', color: '#F0D9A8', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(212,166,74,0.3)', paddingBottom: '6px' }}>
          <Trophy size={16} color="#d4a64a" />
          <span>{lang === 'ka' ? 'გამარჯვებულების ისტორია' : 'Winners History'}</span>
        </div>

        {/* Winners History Cards */}
        {recentWinners.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a1a1aa', fontSize: '12px', padding: '16px 12px', fontWeight: '700', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(212,166,74,0.3)' }}>
            🏆 {lang === 'ka' ? 'ჯერ არავის მოუგია. იყავი პირველი 20 რიცხვში!' : 'No winners yet. Be the first on the 20th!'}
          </div>
        ) : (
          recentWinners.map((w, idx) => (
            <div
              key={idx}
              style={{
                background: 'linear-gradient(145deg, rgba(212,166,74,0.12) 0%, rgba(20,20,25,0.95) 100%)',
                border: '1.5px solid rgba(212,166,74,0.35)',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 8px 22px rgba(0,0,0,0.4)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Header Row: Month Tag + Delivered Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#F0D9A8', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Calendar size={13} color="#d4a64a" />
                  <span>{w.month || (lang === 'ka' ? 'გათამაშება' : 'Draw')}</span>
                </div>

                <span style={{ fontSize: '10px', color: '#4ADE80', background: 'rgba(34,197,94,0.18)', border: '1px solid #22c55e', padding: '3px 8px', borderRadius: '8px', fontWeight: '900', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <CheckCircle2 size={11} color="#4ADE80" />
                  {lang === 'ka' ? 'გადაცემულია' : 'Delivered'}
                </span>
              </div>

              {/* Winner Name & Score Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,166,74,0.2)', border: '1px solid #d4a64a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={15} color="#F0D9A8" />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.winner}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#FFD700', fontWeight: '900', background: 'rgba(255,215,0,0.12)', padding: '4px 10px', borderRadius: '10px', border: '1px solid rgba(255,215,0,0.3)', flexShrink: 0 }}>
                  <Award size={13} color="#FFD700" />
                  <span>{w.score ? `${Number(w.score).toLocaleString()} ქულა` : (w.scoreStr || '—')}</span>
                </div>
              </div>

              {/* Prize Won Banner Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 0, 0, 0.45)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(212,166,74,0.25)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffffff', overflow: 'hidden', border: '1.5px solid #d4a64a', padding: '2px', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <img
                    src={w.prizeImg || (w.prize?.includes('50%') ? '/images/prizes/voucher_50.png' : '/images/prizes/voucher_100.png')}
                    alt={w.prize || 'Prize'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>
                    🎁 {lang === 'ka' ? 'მოგებული პრიზი:' : 'Prize Won:'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#F0D9A8', fontWeight: '900', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {w.prize || '-100% ვაუჩერი & ST Dance merch'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
              <img src={selectedPrize.img} alt={getPrizeName(selectedPrize, lang)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h3 style={{ color: selectedPrize.color || '#F0D9A8', fontSize: '20px', fontWeight: '900', margin: '0 0 6px' }}>
              {getPrizeName(selectedPrize, lang)}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '12px', lineHeight: '1.5', margin: '0 0 16px' }}>
              {getPrizeDesc(selectedPrize, lang)}
            </p>

            <div style={{
              background: 'rgba(212,166,74,0.1)', border: '1px solid rgba(212,166,74,0.3)',
              borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#F0D9A8',
              fontWeight: '800', lineHeight: '1.6', marginBottom: '8px'
            }}>
              🏆 {lang === 'ka'
                ? `შეინარჩუნე ლიდერობა 20 ${drawInfo.monthName} გათამაშებამდე და მიიღე ST Dance-ის მერჩის საჩუქრები!`
                : lang === 'ru'
                ? `Удерживайте лидерство до 20 ${drawInfo.monthName} и получите мерч ST Dance!`
                : `Keep 1st place lead until the 20th of ${drawInfo.monthName} and win exclusive ST Dance merch!`}
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
