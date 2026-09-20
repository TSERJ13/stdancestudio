import React from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Gift, Crown, Sparkles, X, Ticket, ArrowRight, Play } from 'lucide-react';
import { PRIZES } from './SpinModal';

const translations = {
  ka: {
    modalTitle: '🎉 თვის გამარჯვებული გამოვლინდა!',
    modalSub: 'ოფიციალური ყოველთვიური გათამაშება',
    winnerBadge: '#1 ადგილი & ჩემპიონი',
    scoreLbl: 'გამარჯვებული ქულა:',
    prizeWon: '🎁 მოგებული საჩუქარი:',
    notSpunYet: '👑 გამარჯვებული მალე დაატრიალებს ბორბალს და გამოვლინდება მოგებული პრიზი!',
    youAreWinnerTitle: '🎉 გილოცავთ! თქვენ ხართ #1 გამარჯვებული!',
    youAreWinnerSub: 'დაატრიალეთ ბორბალი ახლავე და მიიღეთ თქვენი ექსკლუზიური პრიზი!',
    spinNowBtn: '🎰 დაატრიალე პრიზი ახლავე',
    voucherCodeLbl: 'ვაუჩერის კოდი:',
    startNextMonthBtn: 'დაიწყე შემდეგი თვის გათამაშება',
    close: 'დახურვა'
  },
  en: {
    modalTitle: '🎉 Monthly Winner Announced!',
    modalSub: 'Official Monthly Draw Results',
    winnerBadge: '#1 Rank & Champion',
    scoreLbl: 'Winning Score:',
    prizeWon: '🎁 Won Prize:',
    notSpunYet: '👑 The winner will spin the wheel soon to claim their prize!',
    youAreWinnerTitle: '🎉 Congratulations! You are the #1 Winner!',
    youAreWinnerSub: 'Spin the wheel now to collect your exclusive prize!',
    spinNowBtn: '🎰 Spin for Prize Now',
    voucherCodeLbl: 'Voucher Code:',
    startNextMonthBtn: 'Start Next Month\'s Competition',
    close: 'Close'
  },
  ru: {
    modalTitle: '🎉 Победитель месяца объявлен!',
    modalSub: 'Официальные результаты розыгрыша',
    winnerBadge: '#1 Место и Чемпион',
    scoreLbl: 'Победный счет:',
    prizeWon: '🎁 Выигранный приз:',
    notSpunYet: '👑 Победитель скоро прокрутит колесо и определит свой приз!',
    youAreWinnerTitle: '🎉 Поздравляем! Вы победитель #1!',
    youAreWinnerSub: 'Вращайте колесо сейчас и заберите эксклюзивный приз!',
    spinNowBtn: '🎰 Вращать колесо сейчас',
    voucherCodeLbl: 'Код ваучера:',
    startNextMonthBtn: 'Начать розыгрыш следующего месяца',
    close: 'Закрыть'
  }
};

function getPrizeImage(prizeName) {
  if (!prizeName) return '/images/prizes/water_bottle.png';
  const found = PRIZES.find(p =>
    p.name.toLowerCase() === prizeName.toLowerCase() ||
    p.nameEn.toLowerCase() === prizeName.toLowerCase() ||
    p.nameRu.toLowerCase() === prizeName.toLowerCase() ||
    prizeName.toLowerCase().includes(p.name.toLowerCase())
  );
  return found ? found.img : '/images/prizes/water_bottle.png';
}

export default function MonthlyWinnerModal({
  isOpen,
  onClose,
  winner,
  drawInfo,
  isCurrentViewerWinner,
  onOpenSpin,
  lang = 'ka'
}) {
  if (!isOpen || !winner) return null;

  const t = translations[lang] || translations.ka;
  const prizeImg = drawInfo?.prizeImg || getPrizeImage(drawInfo?.prizeName);

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="modal-content glass animate-in"
        style={{
          maxWidth: '390px',
          width: '100%',
          padding: '24px 20px',
          borderRadius: '24px',
          background: 'linear-gradient(165deg, rgba(28,26,20,0.96) 0%, rgba(12,12,15,0.98) 100%)',
          border: '2px solid rgba(212,166,74,0.6)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,166,74,0.25)',
          position: 'relative',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Dancing Bricks Top Logo & Celebration Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <img
            src="/images/dancing_bricks_logo.png?v=5"
            alt="Dancing Bricks"
            onError={(e) => { e.currentTarget.src = '/images/logo-transparent.png'; }}
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(212,166,74,0.16)', border: '1px solid rgba(212,166,74,0.4)', padding: '3px 12px', borderRadius: '12px', color: '#F0D9A8', fontSize: '11px', fontWeight: '800' }}>
            <Sparkles size={12} color="#FFD700" /> {drawInfo?.monthName || '20 სექტემბერი'}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#F0D9A8', margin: '0 0 4px', letterSpacing: '0.3px' }}>
          {t.modalTitle}
        </h3>
        <p style={{ fontSize: '11.5px', color: '#a1a1aa', margin: '0 0 16px' }}>
          {t.modalSub}
        </p>

        {/* Winner Hero Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(212,166,74,0.15) 0%, rgba(20,20,25,0.8) 100%)',
            border: '1.5px solid rgba(212,166,74,0.45)',
            borderRadius: '18px',
            padding: '16px 14px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Winner Avatar */}
          <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '8px' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '16px', zIndex: 2 }}>
              <Crown size={28} color="#FFD700" fill="#FFD700" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
            </div>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#d4a64a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #FFD700', boxShadow: '0 0 16px rgba(212,166,74,0.5)' }}>
              {winner.photoUrl ? (
                <img src={winner.photoUrl} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#05060a' }}>
                  {(winner.name || 'W').charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: '17px', fontWeight: '900', color: 'white', marginBottom: '3px' }}>
            {winner.name}
          </div>
          <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '800', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: '8px', marginBottom: '8px' }}>
            {t.winnerBadge}
          </span>
          <div style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '800' }}>
            {t.scoreLbl} <strong style={{ color: '#F0D9A8', fontSize: '14px' }}>{(winner.score || 0).toLocaleString()}</strong> ქულა
          </div>
        </div>

        {/* Prize Section */}
        {drawInfo?.isSpun ? (
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'left'
            }}
          >
            <div style={{ width: '60px', height: '54px', borderRadius: '12px', background: 'white', padding: '3px', flexShrink: 0, border: '1.5px solid #d4a64a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={prizeImg} alt={drawInfo.prizeName} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '10.5px', color: '#a1a1aa', fontWeight: '700' }}>{t.prizeWon}</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#F0D9A8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {drawInfo.prizeName}
              </div>
              {drawInfo.voucherCode && (
                <div style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Ticket size={12} color="#4ADE80" /> {drawInfo.voucherCode}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(212,166,74,0.08)',
              border: '1px solid rgba(212,166,74,0.25)',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '16px'
            }}
          >
            {isCurrentViewerWinner ? (
              <>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#4ADE80', marginBottom: '4px' }}>
                  {t.youAreWinnerTitle}
                </div>
                <p style={{ fontSize: '11px', color: '#e4e4e7', margin: '0 0 12px', lineHeight: '1.4' }}>
                  {t.youAreWinnerSub}
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenSpin) onOpenSpin();
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d4a64a 0%, #22c55e 100%)',
                    border: 'none',
                    color: '#05060a',
                    fontSize: '13px',
                    fontWeight: '900',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(34,197,94,0.45)'
                  }}
                >
                  <Trophy size={16} color="#05060a" />
                  {t.spinNowBtn}
                </button>
              </>
            ) : (
              <p style={{ fontSize: '11.5px', color: '#F0D9A8', margin: 0, lineHeight: '1.5', fontWeight: '700' }}>
                {t.notSpunYet}
              </p>
            )}
          </div>
        )}

        {/* Call to Action: Start Next Month's Competition */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '13px 18px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #d4a64a 0%, #a3762b 100%)',
            border: 'none',
            color: '#05060a',
            fontSize: '13.5px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 18px rgba(212,166,74,0.4)'
          }}
        >
          <Play size={15} color="#05060a" fill="#05060a" />
          {t.startNextMonthBtn}
          <ArrowRight size={15} color="#05060a" />
        </button>
      </div>
    </div>,
    document.body
  );
}
