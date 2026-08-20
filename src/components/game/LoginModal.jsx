import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, CheckCircle2, IdCard, LogIn, KeyRound, LogOut, Loader2, Sparkles, X } from 'lucide-react';
import { fetchStudioData, getStudentName } from '../../data/classcore';

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
  'ST-106': 'ელენე (Waltz Master)',
  '99999': 'TEST ADMIN (Infinite Lives)'
};

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, onLogout }) {
  const [idInput, setIdInput] = useState(() => {
    return localStorage.getItem('dancing_bricks_saved_id') || currentUser?.studentId || '';
  });
  const [nameInput, setNameInput] = useState(currentUser?.name || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classcoreStudents, setClasscoreStudents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const savedId = localStorage.getItem('dancing_bricks_saved_id');
      if (savedId && !idInput) setIdInput(savedId);

      fetchStudioData()
        .then(data => {
          if (data && data.students) setClasscoreStudents(data.students);
        })
        .catch(err => console.warn('ClassCore fetch note:', err.message));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIdSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = idInput.trim();
    if (!cleanInput) return;

    setLoading(true);

    let finalName = '';
    let finalId = cleanInput.toUpperCase();
    let isClassCoreMatched = false;

    try {
      const ccData = await fetchStudioData();
      const students = ccData?.students || classcoreStudents;

      const match = students.find(s => {
        const sid = String(s.id || '').toUpperCase();
        const code = String(s.code || s.student_code || s.data?.code || '').toUpperCase();
        const p1 = String(s.phone || '').replace(/\D/g, '');
        const p2 = String(s.data?.parent_phone || '').replace(/\D/g, '');
        const inputNum = cleanInput.replace(/\D/g, '');
        const fullName = getStudentName(s).toLowerCase();
        const inputLower = cleanInput.toLowerCase();

        return (
          sid === finalId ||
          code === finalId ||
          (inputNum.length >= 4 && (p1.includes(inputNum) || p2.includes(inputNum))) ||
          fullName.includes(inputLower)
        );
      });

      if (match) {
        finalName = getStudentName(match);
        finalId = match.code || match.student_code || `ST-${match.id}`;
        isClassCoreMatched = true;
      }
    } catch (err) {
      console.warn('ClassCore lookup fallback:', err.message);
    }

    if (!finalName) {
      finalName = STUDENT_ID_MAP[finalId] || nameInput.trim() || `მოსწავლე #${finalId}`;
    }

    localStorage.setItem('dancing_bricks_saved_id', finalId);

    const userData = {
      studentId: finalId,
      name: finalName,
      id: `student_${finalId}`,
      isStudent: true,
      isClassCore: isClassCoreMatched,
      isLoggedIn: true
    };

    setLoading(false);
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
        {/* Clean Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IdCard size={18} color="#d4a64a" />
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#F0D9A8' }}>მოსწავლის ID-ით შესვლა</span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="quiz-unlocked-state" style={{ padding: '16px 0', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" className="animate-bounce" />
            <h3 style={{ fontSize: '16px', marginTop: '8px' }}>წარმატებით შეხვედით!</h3>
            <p style={{ fontSize: '13px', color: '#e4e4e7', margin: '4px 0' }}>მოსწავლე: <strong>{currentUser?.name || idInput}</strong></p>
            <span style={{ fontSize: '11px', color: '#d4a64a', fontWeight: '800' }}>ClassCore ID: {idInput.toUpperCase()}</span>
          </div>
        ) : currentUser?.isLoggedIn ? (
          <div className="login-profile-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,166,74,0.15)', border: '2px solid rgba(212,166,74,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={36} color="#d4a64a" />
            </div>

            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'white', margin: '4px 0 2px' }}>{currentUser.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '800', background: 'rgba(212,166,74,0.12)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(212,166,74,0.3)' }}>
                  ID: {currentUser.studentId || 'ST-GUEST'}
                </span>
                {currentUser.isClassCore && (
                  <span style={{ fontSize: '10px', color: '#22c55e', background: 'rgba(34,197,94,0.15)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.4)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Sparkles size={10} /> ClassCore Verified
                  </span>
                )}
              </div>
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
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
              შეიყვანე ClassCore-ის მოსწავლის ID კოდი, რომ შენი რეკორდები და ქულები ავტომატურად შეინახოს!
            </p>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#d4a64a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <KeyRound size={14} /> მოსწავლის ID კოდი:
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="მაგ: 101, ST-101 ან 599123456"
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

            {/* Test ID Quick Pill Buttons */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10.5px', color: '#a1a1aa', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                სატესტო ID კოდები (დააჭირე შესავსებად):
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['101', '102', '103', '104', '99999'].map(testId => (
                  <button
                    key={testId}
                    type="button"
                    onClick={() => setIdInput(testId)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: idInput === testId ? 'rgba(212,166,74,0.3)' : 'rgba(255,255,255,0.06)',
                      border: idInput === testId ? '1px solid #d4a64a' : '1px solid rgba(255,255,255,0.1)',
                      color: idInput === testId ? '#F0D9A8' : '#e4e4e7',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    #{testId}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <User size={14} /> მოსწავლის სახელი / გვარი (არასავალდებულო):
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

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)', border: 'none', color: '#151100', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '2px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? 'გადამოწმება...' : 'ID კოდით შესვლა'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
