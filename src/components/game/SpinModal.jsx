import React, { useState } from 'react';
import { Gift, Sparkles, Trophy, Award, RotateCw, CheckCircle2, Ticket, Mail, Copy, Check } from 'lucide-react';

export const PRIZES = [
  { id: 'bottle', name: 'წყლის ბოთლი', desc: 'ST Dance Studio ბრენდირებული წყლის ბოთლი', img: '/images/prizes/water_bottle.jpg', color: '#3b82f6' },
  { id: 'umbrella', name: 'ქოლგა', desc: 'ST Dance Studio ბრენდირებული ქოლგა', img: '/images/prizes/umbrella.jpg', color: '#8b5cf6' },
  { id: 'v50', name: '-50% ვაუჩერი', desc: '-50% ფასდაკლების ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_50.jpg', color: '#eab308' },
  { id: 'raincoat', name: 'საწვიმარი', desc: 'ST Dance Studio ბრენდირებული საწვიმარი', img: '/images/prizes/raincoat.jpg', color: '#06b6d4' },
  { id: 'backpack', name: 'ზურგჩანთა', desc: 'ST Dance Studio ბრენდირებული ზურგჩანთა', img: '/images/prizes/backpack.jpg', color: '#ec4899' },
  { id: 'phone_case', name: 'მობილურის ქეისი', desc: 'ST Dance Studio ბრენდირებული ქეისი', img: '/images/prizes/phone_case.jpg', color: '#10b981' },
  { id: 'v30', name: '-30% ვაუჩერი', desc: '-30% ფასდაკლების ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_30.jpg', color: '#f97316' },
  { id: 'v100', name: '-100% ვაუჩერი', desc: '100% უფასო სრული ვაუჩერი Danceshop.Ge-ზე', img: '/images/prizes/voucher_100.jpg', color: '#ef4444' }
];

export default function SpinModal({ isOpen, onClose, winnerName = 'ჩემპიონი', onClaimPrize }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setWonPrize(null);

    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 * 5 + (360 - (prizeIdx * segmentAngle + segmentAngle / 2));

    setRotation(prev => prev + targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[prizeIdx];
      const randomCode = `ST-WIN-${Math.floor(1000 + Math.random() * 9000)}`;
      setWonPrize(prize);
      setVoucherCode(randomCode);

      // Save won prize to local state & invoke claim callback
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

      // Send silent email notification simulation
      try {
        fetch('https://formspree.io/f/sergitsivtsivadze@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `🎉 ST DANCE GAME WINNER: ${winnerName}`,
            winner: winnerName,
            prize: prize.name,
            code: randomCode,
            date: new Date().toISOString()
          })
        }).catch(() => {});
      } catch {}
    }, 4500);
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

            {/* Wheel Container with Pointer */}
            <div style={{ position: 'relative', width: '260px', height: '260px', margin: '6px 0 16px' }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '20px solid #ef4444',
                zIndex: 20,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
              }} />

              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '6px solid #d4a64a',
                  boxShadow: '0 0 25px rgba(212,166,74,0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.15, 1)' : 'none'
                }}
              >
                {PRIZES.map((prize, i) => {
                  const angle = (360 / PRIZES.length) * i;
                  return (
                    <div
                      key={prize.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '50%',
                        height: '50%',
                        transformOrigin: '0% 100%',
                        transform: `rotate(${angle}deg)`,
                        background: i % 2 === 0 ? 'rgba(212,166,74,0.22)' : 'rgba(255,255,255,0.06)',
                        borderLeft: '1px solid rgba(212,166,74,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                      }}
                    >
                      <span style={{
                        transform: `rotate(${360 / PRIZES.length / 2}deg) translateY(-35px)`,
                        fontSize: '9px',
                        fontWeight: '800',
                        color: prize.color,
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                      }}>
                        {prize.name}
                      </span>
                    </div>
                  );
                })}

                <div style={{
                  position: 'absolute',
                  inset: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                  border: '3px solid #000',
                  boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={22} color="#151100" />
                </div>
              </div>
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

            {/* Prize Image Showcase */}
            <div style={{
              width: '180px',
              height: '160px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(212,166,74,0.5)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              marginBottom: '12px',
              background: '#0a0a0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={wonPrize.img} alt={wonPrize.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
