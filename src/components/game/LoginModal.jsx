import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, IdCard, LogIn, KeyRound } from 'lucide-react';

// Student ID Pre-mapped dictionary (Can be expanded by Sergi)
const STUDENT_ID_MAP = {
  '101': 'სერგო წივწივაძე (Head Coach)',
  'ST-101': 'სერგო წივწივაძე (Head Coach)',
  '102': 'მარიამი (Samba Star)',
  'ST-102': 'მარიამი (Samba Star)',
  '103': 'ნიკოლოზი (Cha-Cha King)',
  'ST-103': 'ნიკოლოზი (Cha-Cha King)',
  '104': 'ანა (Rumba Queen)',
  'ST-104': 'ანა (Rumba Queen)',
  '105': 'გიორგი (Jive Champ)',
  'ST-105': 'გიორგი (Jive Champ)',
  '106': 'ელენე (Waltz Master)',
  'ST-106': 'ელენე (Waltz Master)'
};

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [idInput, setIdInput] = useState(currentUser?.studentId || '');
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleIdSubmit = (e) => {
    e.preventDefault();
    const cleanId = idInput.trim().toUpperCase();
    if (!cleanId) return;

    // Look up in ID map or generate fallback name
    const foundName = STUDENT_ID_MAP[cleanId] || nameInput.trim() || `მოსწავლე #${cleanId}`;

    const userData = {
      studentId: cleanId,
      name: foundName,
      id: `student_${cleanId}`,
      isStudent: true,
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
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <IdCard size={20} color="#d4a64a" />
            <span>STUDENT ID PROFILE LOGIN</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {isSubmitted ? (
          <div className="quiz-unlocked-state">
            <CheckCircle2 size={56} color="#22c55e" className="animate-bounce" />
            <h3>წარმატებით შეხვედით!</h3>
            <p>მოსწავლე: <strong>{currentUser?.name || idInput}</strong></p>
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>ID: {idInput.toUpperCase()}</span>
          </div>
        ) : currentUser?.isLoggedIn ? (
          <div className="share-modal-body">
            <div className="share-hero-icon" style={{ background: 'rgba(212,166,74,0.12)', padding: '16px', borderRadius: '50%' }}>
              <ShieldCheck size={48} color="#d4a64a" />
            </div>

            <h3>{currentUser.name}</h3>
            <span style={{ fontSize: '13px', color: '#d4a64a', fontWeight: '800' }}>
              🆔 მოსწავლის ID: {currentUser.studentId || 'ST-GUEST'}
            </span>

            <div className="statrow" style={{ marginTop: '14px', gap: '20px' }}>
              <div>
                <span>რეკორდი</span>
                <b style={{ color: '#d4a64a', fontSize: '18px' }}>{(currentUser.highScore || 0).toLocaleString()} ქულა</b>
              </div>
              <div>
                <span>ნათამაშები</span>
                <b style={{ color: 'white', fontSize: '18px' }}>{currentUser.totalGames || 0} თამაში</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={onLogout}>
                გამოსვლა (Logout)
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={onClose}>
                თამაშში დაბრუნება
              </button>
            </div>
          </div>
        ) : (
          <form className="login-form-body" onSubmit={handleIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                🆔 შესვლა მოსწავლის ID კოდით
              </h3>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0 }}>
                შეიყვანე შენი მოსწავლის ID კოდი, რომ შენი რეკორდები, სიცოცხლეები და ქულები შეინახოს!
              </p>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#d4a64a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <KeyRound size={14} /> მოსწავლის ID კოდი:
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="მაგ: 101 ან ST-101"
                value={idInput}
                onChange={e => setIdInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(212,166,74,0.4)',
                  color: '#F0D9A8',
                  padding: '0 14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  outline: 'none'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <User size={14} /> სახელი / გვარი (არასავალდებულო):
              </label>
              <input
                type="text"
                placeholder="მაგ: სერგო წივწივაძე"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  padding: '0 14px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}>
              <LogIn size={18} /> ID კოდით შესვლა
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
