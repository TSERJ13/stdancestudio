import React, { useState } from 'react';
import { User, Phone, LogIn, CheckCircle2, ShieldCheck, Sparkles, Send } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = (provider) => {
    let name = '';
    if (provider === 'Google') name = 'Google User';
    else if (provider === 'Telegram') name = 'Telegram User';
    else if (provider === 'Instagram') name = '@stdancestudio Fan';
    else if (provider === 'Facebook') name = 'FB Dancer';

    const userData = {
      name: currentUser?.name && currentUser.name !== 'Dancer' ? currentUser.name : name,
      provider: provider,
      id: `${provider.toLowerCase()}_${Date.now()}`,
      isLoggedIn: true
    };

    onLogin(userData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const userData = {
      name: nameInput.trim(),
      phone: phoneInput.trim() || null,
      id: currentUser?.id || `user_${Date.now()}`,
      provider: 'Form',
      isLoggedIn: true
    };

    onLogin(userData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <User size={20} color="#d4a64a" />
            <span>MOVES & POINTS PROFILE LOGIN</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {isSubmitted ? (
          <div className="quiz-unlocked-state">
            <CheckCircle2 size={56} color="#22c55e" className="animate-bounce" />
            <h3>წარმატებით შეხვედით!</h3>
            <p>მოგესალმებით, <strong>{nameInput}</strong>! შენი ქულები და რეკორდები შენახულია.</p>
          </div>
        ) : currentUser?.isLoggedIn ? (
          <div className="share-modal-body">
            <div className="share-hero-icon" style={{ background: 'rgba(212,166,74,0.12)', padding: '16px', borderRadius: '50%' }}>
              <ShieldCheck size={48} color="#d4a64a" />
            </div>

            <h3>{currentUser.name}</h3>
            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
              {currentUser.provider ? `🔐 Logged in via ${currentUser.provider}` : '👤 მოცეკვავის პროფილი'}
            </span>

            <div className="statrow" style={{ marginTop: '10px', gap: '20px' }}>
              <div>
                <span>რეკორდი</span>
                <b style={{ color: '#d4a64a', fontSize: '18px' }}>{(currentUser.highScore || 0).toLocaleString()} ქულა</b>
              </div>
              <div>
                <span>ნათამაშები</span>
                <b style={{ color: 'white', fontSize: '18px' }}>{currentUser.totalGames || 0} თამაში</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '16px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={onLogout}>
                გამოსვლა (Logout)
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>
                თამაშში დაბრუნება
              </button>
            </div>
          </div>
        ) : (
          <div className="login-modal-content-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', textAlign: 'center', margin: 0 }}>
              აირჩიე ავტორიზაციის მეთოდი, რომ შენი რეკორდები, სიცოცხლეები და საჩუქრები შეინახოს:
            </p>

            {/* Social Logins */}
            <div className="social-login-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="social-btn google-btn"
                onClick={() => handleSocialLogin('Google')}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <GoogleIcon /> Google
              </button>

              <button
                type="button"
                className="social-btn telegram-btn"
                onClick={() => handleSocialLogin('Telegram')}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(42, 171, 238, 0.12)',
                  border: '1px solid rgba(42, 171, 238, 0.3)',
                  color: '#2aabee',
                  fontWeight: '700',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} color="#2aabee" /> Telegram
              </button>

              <button
                type="button"
                className="social-btn instagram-btn"
                onClick={() => handleSocialLogin('Instagram')}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(225, 48, 108, 0.12)',
                  border: '1px solid rgba(225, 48, 108, 0.3)',
                  color: '#e1306c',
                  fontWeight: '700',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <InstagramIcon /> Instagram
              </button>

              <button
                type="button"
                className="social-btn facebook-btn"
                onClick={() => handleSocialLogin('Facebook')}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(24, 119, 242, 0.12)',
                  border: '1px solid rgba(24, 119, 242, 0.3)',
                  color: '#1877f2',
                  fontWeight: '700',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FacebookIcon /> Facebook
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px' }}>ან სახელით / ნომრით</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <form className="login-form-body" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                required
                placeholder="სახელი / გვარი"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '0 14px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <button type="submit" className="btn-primary" style={{ width: '100%', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <LogIn size={16} /> სწრაფი შესვლა
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
