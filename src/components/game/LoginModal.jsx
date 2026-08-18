import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, IdCard, LogIn, KeyRound, LogOut } from 'lucide-react';

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
      <div className="modal-content glass animate-in" style={{ maxWidth: '400px', padding: '20px' }}>
        <div className="modal-header" style={{ marginBottom: '14px' }}>
          <div className="quiz-title-badge">
            <IdCard size={18} color="#d4a64a" />
            <span style={{ fontSize: '12px', fontWeight: '800' }}>STUDENT ID PROFILE LOGIN</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {isSubmitted ? (
          <div className="quiz-unlocked-state" style={{ padding: '16px 0', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" className="animate-bounce" />
            <h3 style={{ fontSize: '16px', marginTop: '8px' }}>წარმატებით შეხვედით!</h3>
            <p style={{ fontSize: '13px', color: '#e4e4e7', margin: '4px 0' }}>მოსწავლე: <strong>{currentUser?.name || idInput}</strong></p>
            <span style={{ fontSize: '11px', color: '#a1a1aa' }}>ID: {idInput.toUpperCase()}</span>
          </div>
        ) : currentUser?.isLoggedIn ? (
          <div className="login-profile-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,166,74,0.15)', border: '2px solid rgba(212,166,74,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={36} color="#d4a64a" />
            </div>

            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'white', margin: '4px 0 2px' }}>{currentUser.name}</h3>
              <span style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '800', background: 'rgba(212,166,74,0.12)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(212,166,74,0.3)' }}>
                🆔 ID: {currentUser.studentId || 'ST-GUEST'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', width: '100%', margin: '10px 0', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#a1a1aa', display: 'block', fontWeight: '700' }}>რეკორდი</span>
                <b style={{ color: '#d4a64a', fontSize: '16px', fontWeight: '900' }}>{(currentUser.highScore || 0).toLocaleString()}</b>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{ fontSize: '10px', color: '#a1a1aa', display: 'block', fontWeight: '700' }}>ნათამაშები</span>
                <b style={{ color: 'white', fontSize: '16px', fontWeight: '900' }}>{currentUser.totalGames || 0}</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
              <button
                onClick={onLogout}
                style={{ flex: 1, height: '42px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LogOut size={15} /> გამოსვლა
              </button>
              <button
                onClick={onClose}
                style={{ flex: 1, height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)', border: 'none', color: '#151100', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}
              >
                დაბრუნება
              </button>
            </div>
          </div>
        ) : (
          <form className="login-form-body" onSubmit={handleIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'white', marginBottom: '4px' }}>
                🆔 შესვლა მოსწავლის ID კოდით
              </h3>
              <p style={{ fontSize: '11px', color: '#a1a1aa', margin: 0, lineHeight: '1.4' }}>
                შეიყვანე შენი მოსწავლის ID კოდი, რომ შენი რეკორდები და ქულები შეინახოს!
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
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(212,166,74,0.4)',
                  color: '#F0D9A8',
                  padding: '0 14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  outline: 'none',
                  boxSizing: 'border-box'
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
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  padding: '0 14px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" style={{ width: '100%', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)', border: 'none', color: '#151100', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
              <LogIn size={18} /> ID კოდით შესვლა
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
