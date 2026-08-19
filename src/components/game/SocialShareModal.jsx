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
    shareSub: 'გახსენი @stdancestudio.ge ან @stdancestudio ინსტაგრამზე მე-5 სიცოცხლის მისაღებად!',
    igBtn: 'Instagram (@stdancestudio.ge) (+1 Life)',
    igBtn2: 'Instagram (@stdancestudio)',
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
    shareSub: 'Open @stdancestudio.ge or @stdancestudio on Instagram to unlock your 5th daily life!',
    igBtn: 'Instagram (@stdancestudio.ge) (+1 Life)',
    igBtn2: 'Instagram (@stdancestudio)',
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
    shareSub: 'Откройте @stdancestudio.ge или @stdancestudio в Instagram для получения 5-й жизни!',
    igBtn: 'Instagram (@stdancestudio.ge) (+1 Life)',
    igBtn2: 'Instagram (@stdancestudio)',
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

  const handleInstagramShare1 = () => {
    window.open('https://www.instagram.com/stdancestudio.ge', '_blank');
    setTimeout(triggerBonus, 1500);
  };

  const handleInstagramShare2 = () => {
    window.open('https://www.instagram.com/stdancestudio', '_blank');
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
              {/* Primary Instagram Share Buttons */}
              <button
                onClick={handleInstagramShare1}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                  border: 'none',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(225,48,108,0.35)'
                }}
              >
                <InstagramIcon size={18} color="white" />
                {t.igBtn}
              </button>

              <button
                onClick={handleInstagramShare2}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(225,48,108,0.15)',
                  border: '1px solid rgba(225,48,108,0.4)',
                  color: '#f43f5e',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <InstagramIcon size={16} color="#f43f5e" />
                {t.igBtn2}
              </button>

              {/* Native Mobile Share Button */}
              <button
                onClick={handleNativeShare}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e4e4e7',
                  fontWeight: '800',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Share2 size={16} color="#d4a64a" />
                {t.nativeShareBtn}
              </button>

              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: '1px dashed rgba(212,166,74,0.4)',
                  color: '#d4a64a',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                {copied ? t.copiedText : t.copyBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
