import React, { useState } from 'react';
import { Share2, Check, Copy, Heart, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

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
    title: 'გააზიარე და დაბრუნდი თამაშში',
    unlockedTitle: '5-ე სიცოცხლე გახსნილია! (+1 Life)',
    unlockedSub: 'ინსტაგრამზე გაზიარებით შენ მიიღე დღევანდელი მე-5 ბონუს სიცოცხლე!',
    backBtn: 'თამაშში დაბრუნება',
    shareTitle: 'გააზიარე ST Dance Studio და მიიღე +1 ბონუს სიცოცხლე',
    shareSub: 'გადადი @stdancestudio.ge-ს ინსტაგრამზე, გააზიარე და დაბრუნდი თამაშში!',
    igBtn: 'Instagram-ზე გაზიარება (+1 Life)',
    verifyingText: 'მოწმდება გაზიარება...',
    copyBtn: 'ლინკის კოპირება',
    copiedText: '✓ ლინკი დაკოპირდა!'
  },
  en: {
    title: 'Share & Return to Game',
    unlockedTitle: '5th Life Unlocked! (+1 Life)',
    unlockedSub: 'You earned your 5th bonus life for today by sharing on Instagram!',
    backBtn: 'Back to Game',
    shareTitle: 'Share ST Dance Studio to get +1 Bonus Life',
    shareSub: 'Go to @stdancestudio.ge on Instagram, share and return to game!',
    igBtn: 'Share on Instagram (+1 Life)',
    verifyingText: 'Verifying share...',
    copyBtn: 'Copy Link',
    copiedText: '✓ Link Copied!'
  },
  ru: {
    title: 'Поделитесь и вернитесь в игру',
    unlockedTitle: '5-я Жизнь Разблокирована! (+1 Life)',
    unlockedSub: 'Вы получили 5-ю бонусную жизнь на сегодня за публикацию в Instagram!',
    backBtn: 'Вернуться в игру',
    shareTitle: 'Поделитесь ST Dance Studio и получите +1 Бонусную Жизнь',
    shareSub: 'Перейдите в @stdancestudio.ge в Instagram, поделитесь и вернитесь в игру!',
    igBtn: 'Поделиться в Instagram (+1 Life)',
    verifyingText: 'Проверка публикации...',
    copyBtn: 'Скопировать ссылку',
    copiedText: '✓ Ссылка скопирована!'
  }
};

export default function SocialShareModal({ isOpen, onClose, onUnlockShareLife, hasShareLife, lang = 'ka' }) {
  const t = shareTranslations[lang] || shareTranslations.ka;

  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const triggerBonus = () => {
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

  const handleInstagramShare = () => {
    if (verifying) return;
    setVerifying(true);
    window.open('https://www.instagram.com/stdancestudio.ge', '_blank');

    setTimeout(() => {
      setVerifying(false);
      triggerBonus();
    }, 2200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px', padding: '20px' }}>
        {/* Modal Header with Clean Horizontal Alignment */}
        <div className="modal-header" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} color="#d4a64a" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#F0D9A8' }}>{t.title}</span>
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
              {/* Single Main Instagram Share Button with Verification Loader */}
              <button
                onClick={handleInstagramShare}
                disabled={verifying}
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
                  boxShadow: '0 4px 15px rgba(225,48,108,0.35)',
                  opacity: verifying ? 0.8 : 1
                }}
              >
                {verifying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{t.verifyingText}</span>
                  </>
                ) : (
                  <>
                    <InstagramIcon size={18} color="white" />
                    <span>{t.igBtn}</span>
                  </>
                )}
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
