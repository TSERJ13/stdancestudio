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

export default function SocialShareModal({ isOpen, onClose, onUnlockShareLife, hasShareLife }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://stdance.ge/promo');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    window.open('https://www.instagram.com/stdancestudio/', '_blank');
    setTimeout(() => {
      setShared(true);
      onUnlockShareLife();
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <Share2 size={20} color="#d4a64a" />
            <span>5TH LIFE CHALLENGE — SOCIAL SHARE</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {hasShareLife ? (
          <div className="quiz-unlocked-state">
            <Heart size={56} fill="#ef4444" color="#ef4444" className="animate-bounce" />
            <h3>5th Life Unlocked! (❤️ #5)</h3>
            <p>You earned your 5th life for today by sharing on Instagram!</p>
            <button className="btn-primary" onClick={onClose}>Back to Game</button>
          </div>
        ) : (
          <div className="share-modal-body">
            <div className="share-hero-icon">
              <InstagramIcon size={48} color="#e1306c" />
            </div>

            <h3>Share ST Dance Studio to get +1 Bonus Life (❤️ #5)</h3>
            <p>Share our Instagram Reel / Studio page or copy the invite link to unlock your 5th daily life!</p>

            <div className="share-actions-column">
              <button className="btn-ig-share" onClick={handleInstagramShare}>
                <InstagramIcon size={20} /> Open @stdancestudio & Share Story
              </button>

              <button className="btn-copy-link" onClick={handleCopyLink}>
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
                {copied ? 'Link Copied to Clipboard!' : 'Copy Game Promo Link'}
              </button>
            </div>

            {shared && (
              <div className="share-success-alert animate-in">
                <Sparkles size={20} color="#d4a64a" />
                <span>+1 ❤️ Bonus Life Added!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
