import React, { useState } from 'react';
import { User, Phone, LogIn, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [phoneInput, setPhoneInput] = useState(currentUser?.phone || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const userData = {
      name: nameInput.trim(),
      phone: phoneInput.trim() || null,
      id: currentUser?.id || `user_${Date.now()}`,
      isStudent: !!phoneInput.trim()
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
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px' }}>
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
              {currentUser.phone ? `📱 ${currentUser.phone} (ST Student)` : '👤 მოცეკვავის პროფილი'}
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
          <form className="login-form-body" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5' }}>
              შეიყვანე შენი სახელი ან სტუდიის ნომერი, რომ შენი რეკორდები, სიცოცხლეები და პრიზები შეინახოს!
            </p>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#d4a64a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <User size={14} /> სახელი / გვარი:
              </label>
              <input
                type="text"
                required
                placeholder="მაგ: სერგო წივწივაძე"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '0 14px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Phone size={14} /> ტელეფონის ნომერი (არასავალდებულო):
              </label>
              <input
                type="tel"
                placeholder="5XX XX XX XX"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  padding: '0 14px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LogIn size={18} /> შესვლა & Проფილის შენახვა
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
