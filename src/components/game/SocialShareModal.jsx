import React, { useState } from 'react';
import { Share2, Check, Copy, Heart, Sparkles } from 'lucide-react';

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
    igBtn: 'გაზიარება Instagram-ზე (+1 Life)',
    copyBtn: 'თამაშის ლინკის კოპირება',
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
    copyBtn: 'Copy Game Promo Link',
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
    copyBtn: 'Скопировать ссылку на игру',
    copiedText: '✓ Ссылка скопирована!',
    successBonus: '+1 Bonus Life Added!'
  }
};

export default function SocialShareModal({ isOpen, onClose, onUnlockShareLife, hasShareLife, lang = 'ka' }) {
  const t = shareTranslations[lang] || shareTranslations.ka;

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://stdance.ge/game');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShared(true);
      onUnlockShareLife();
    }, 1500);
  };

  const handleInstagramShare = () => {
    window.open('https://www.instagram.com/stdancestudio.ge', '_blank');
    setTimeout(() => {
      setShared(true);
      onUnlockShareLife();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <Share2 size={20} color="#d4a64a" />
            <span>{t.title}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {hasShareLife ? (
          <div className="quiz-unlocked-state">
            <Heart size={56} fill="#ef4444" color="#ef4444" className="animate-bounce" />
            <h3>{t.unlockedTitle}</h3>
            <p>{t.unlockedSub}</p>
            <button className="btn-primary" style={{ marginTop: '10px' }} onClick={onClose}>
              {t.backBtn}
            </button>
          </div>
        ) : (
          <div className="share-modal-body">
            <div className="share-hero-icon" style={{ background: 'rgba(225,48,108,0.12)', padding: '16px', borderRadius: '50%' }}>
              <InstagramIcon size={48} color="#e1306c" />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'white', marginTop: '10px' }}>
              {t.shareTitle}
            </h3>
            <p style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.4' }}>
              {t.shareSub}
            </p>

            <div className="share-actions-column" style={{ width: '100%', marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn-ig-share" onClick={handleInstagramShare} style={{ width: '100%', height: '46px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <InstagramIcon size={18} color="white" /> {t.igBtn}
              </button>

              <button className="btn-copy-link" onClick={handleCopyLink} style={{ width: '100%', height: '44px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                {copied ? t.copiedText : t.copyBtn}
              </button>
            </div>

            {shared && (
              <div className="share-success-alert animate-in" style={{ marginTop: '14px', padding: '10px 16px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '12px', color: '#22c55e', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
