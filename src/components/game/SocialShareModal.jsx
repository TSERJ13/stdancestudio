import React, { useState } from 'react';
import { Share2, Check, Copy, Heart, Sparkles, ExternalLink } from 'lucide-react';

function InstagramIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

const shareTranslations = {
  ka: {
    title: '5-ე სიცოცხლის გამოწვევა — ინსტაგრამზე გაზიარება',
    unlockedTitle: '5-ე სიცოცხლე გახსნილია! (+1 Life)',
    unlockedSub: 'ინსტაგრამზე გაზიარებით შენ მიიღე დღევანდელი მე-5 ბონუს სიცოცხლე!',
    backBtn: 'თამაშში დაბრუნება',
    shareTitle: 'გააზიარე ST Dance Studio და მიიღე +1 ბონუს სიცოცხლე',
    shareSub: 'გახსენი @stdancestudio.ge ინსტაგრამზე ან დააკოპირე თამაშის პრომო ლინკი მე-5 სიცოცხლის მისაღებად!',
    igBtn: 'Instagram-ზე გაზიარება (+1 Life)',
    nativeShareBtn: 'მობილურით გაზიარება',
    copyBtn: 'ლინკის კოპირება',
    copiedText: '✓ ლინკი დაკოპირდა!',
    successBonus: '+1 Bonus Life Added!'
  },
  en: {
    title: '5th Life Challenge — Instagram Share',
    unlockedTitle: '5th Life Unlocked! (+1 Life)',
    unlockedSub: 'You earned your 5th bonus life for today by sharing on Instagram!',
    backBtn: 'Back to Game',
    shareTitle: 'Share ST Dance Studio to get +1 Bonus Life',
    shareSub: 'Open @stdancestudio.ge on Instagram or copy game link to unlock your 5th daily life!',
    igBtn: 'Share on Instagram (+1 Life)',
    nativeShareBtn: 'Native Mobile Share',
    copyBtn: 'Copy Link',
    copiedText: '✓ Link Copied to Clipboard!',
    successBonus: '+1 Bonus Life Added!'
  },
  ru: {
    title: '5-я Жизнь — Поделиться в Instagram',
    unlockedTitle: '5-я Жизнь Разблокирована! (+1 Life)',
    unlockedSub: 'Вы получили 5-ю бонусную жизнь на сегодня за публикацию в Instagram!',
    backBtn: 'Вернуться в игру',
    shareTitle: 'Поделитесь ST Dance Studio и получите +1 Бонусную Жизнь',
    shareSub: 'Откройте @stdancestudio.ge в Instagram или скопируйте ссылку на игру для получения 5-й жизни!',
    igBtn: 'Поделиться в Instagram (+1 Life)',
    nativeShareBtn: 'Поделиться с телефона',
    copyBtn: 'Скопировать ссылку',
    copiedText: '✓ Ссылка скопирована!',
    successBonus: '+1 Bonus Life Added!'
  }
};

export default function SocialShareModal({ isOpen, onClose, onUnlockShareLife, hasShareLife, lang = 'ka' }) {
  const t = shareTranslations[lang] || shareTranslations.ka;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!isOpen) return null;

  const triggerBonus = () => {
    setShared(true);
    onUnlockShareLife();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://stdance.ge/game');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      triggerBonus();
    }, 1200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ST Dance Studio — Dancing Bricks',
          text: 'ითამაშე Dancing Bricks და მოიგე Danceshop.Ge-ს ვაუჩერები!',
          url: 'https://stdance.ge/game'
        });
        triggerBonus();
      } catch (err) {
        /* User cancelled or not supported */
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstagramShare = () => {
    window.open('https://www.instagram.com/stdancestudio.ge', '_blank');
    setTimeout(triggerBonus, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px', padding: '20px' }}>
        <div className="modal-header" style={{ marginBottom: '14px' }}>
          <div className="quiz-title-badge">
            <Share2 size={18} color="#d4a64a" />
            <span style={{ fontSize: '12px', fontWeight: '800' }}>{t.title}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {hasShareLife ? (
          <div className="quiz-unlocked-state" style={{ padding: '16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Heart size={56} fill="#ef4444" color="#ef4444" className="animate-bounce" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'white', margin: '4px 0' }}>{t.unlockedTitle}</h3>
            <p style={{ fontSize: '12.5px', color: '#e4e4e7', margin: '4px 0 16px', lineHeight: '1.4' }}>{t.unlockedSub}</p>

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
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              {t.backBtn}
            </button>
          </div>
        ) : (
          <div className="share-modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Instagram Glowing Avatar Icon */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              padding: '3px',
              boxShadow: '0 0 20px rgba(225,48,108,0.4)',
              marginBottom: '10px'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#0c0a12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <InstagramIcon size={34} color="#e1306c" />
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'white', margin: '4px 0 6px' }}>
              {t.shareTitle}
            </h3>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '0 0 16px', lineHeight: '1.4' }}>
              {t.shareSub}
            </p>

            <div className="share-actions-column" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Primary Instagram Share Button */}
              <button
                onClick={handleInstagramShare}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(225,48,108,0.35)'
                }}
              >
                <InstagramIcon size={18} color="white" /> {t.igBtn}
              </button>

              {/* Secondary Options Row */}
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={15} /> {t.nativeShareBtn}
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? <Check size={15} color="#22c55e" /> : <Copy size={15} />}
                  {copied ? t.copiedText : t.copyBtn}
                </button>
              </div>
            </div>

            {shared && (
              <div className="share-success-alert animate-in" style={{ width: '100%', marginTop: '14px', padding: '10px 14px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '12px', color: '#22c55e', fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                <Sparkles size={18} color="#22c55e" />
                <span>{t.successBonus}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
