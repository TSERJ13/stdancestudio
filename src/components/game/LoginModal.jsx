import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, ShieldCheck, CheckCircle2, IdCard, LogIn, KeyRound, Loader2, Sparkles, X, Trophy, Flame, PlayCircle, Crown, Users, Radio, RefreshCw, BarChart2 } from 'lucide-react';
import { fetchStudioData, getStudentName, fetchCloudLeaderboard, submitFormAnswer } from '../../data/classcore';

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

const loginTranslations = {
  ka: {
    modalTitle: 'მოთამაშის პროფაილი & სტატისტიკა',
    inputTitle: 'მოსწავლის ID-ით შესვლა',
    successTitle: 'წარმატებით შეხვედით!',
    student: 'მოსწავლე:',
    statsHeader: 'თამაშის სტატისტიკა',
    highScore: 'რეკორდი',
    totalScore: 'ჯამური ქულა',
    totalGames: 'ნათამაშები',
    verified: 'ClassCore დადასტურებული',
    enterIdSub: 'შეიყვანე ClassCore-ის მოსწავლის ID კოდი, რომ შენი რეკორდები ავტომატურად შეინახოს!',
    idLabel: 'მოსწავლის ID კოდი:',
    idPlaceholder: 'მაგ: 101, ST-101 ან ტელეფონის ნომერი',
    nameLabel: 'მოსწავლის სახელი / გვარი (არასავალდებულო):',
    namePlaceholder: 'მაგ: სერგო წივწივაძე',
    testIdsLabel: 'სატესტო ID კოდები (დააჭირე შესავსებად):',
    checking: 'გადამოწმება...',
    submitBtn: 'ID კოდით შესვლა',
    adminTitle: '👑 ადმინ პანელი',
    adminSubTitle: '● რეალური დროის ცოცხალი ანალიტიკა & პრიზები',
    adminBtnText: '👑 ST Dance Studio — ადმინ პანელი & ანალიტიკა',
    totalPlayers: 'სულ რეგისტრირებული',
    activeOnline: 'ახლა ონლაინში / თამაშობს',
    totalGamesPlayed: 'სულ ნათამაშები თამაშები',
    topLeader: '#1 მიმდინარე ლიდერი',
    playersListHeader: '🎮 მოთამაშეები & საჩუქრის გაცემის სტატუსი',
    refreshBtn: 'განახლება'
  },
  en: {
    modalTitle: 'Player Profile & Live Stats',
    inputTitle: 'Student ID Login',
    successTitle: 'Successfully logged in!',
    student: 'Student:',
    statsHeader: 'Game Statistics',
    highScore: 'High Score',
    totalScore: 'Total Score',
    totalGames: 'Games Played',
    verified: 'ClassCore Verified',
    enterIdSub: 'Enter your ClassCore Student ID to automatically save your high scores!',
    idLabel: 'Student ID Code:',
    idPlaceholder: 'e.g. 101, ST-101 or phone number',
    nameLabel: 'Student Name / Surname (Optional):',
    namePlaceholder: 'e.g. Sergi Tsivtsivadze',
    testIdsLabel: 'Test IDs (Click to fill):',
    checking: 'Checking...',
    submitBtn: 'Login with ID',
    adminTitle: '👑 Admin Panel',
    adminSubTitle: '● Real-Time Live Analytics & Prizes',
    adminBtnText: '👑 ST Dance Studio — Admin Panel & Analytics',
    totalPlayers: 'Total Registered Players',
    activeOnline: 'Active Online / Playing Now',
    totalGamesPlayed: 'Total Games Played',
    topLeader: '#1 Current Leader',
    playersListHeader: '🎮 Players & Prize Delivery Status',
    refreshBtn: 'Refresh'
  },
  ru: {
    modalTitle: 'Профиль игрока и статистика',
    inputTitle: 'Вход по ID ученика',
    successTitle: 'Успешный вход!',
    student: 'Ученик:',
    statsHeader: 'Статистика игры',
    highScore: 'Рекорд',
    totalScore: 'Всего очков',
    totalGames: 'Сыграно игр',
    verified: 'ClassCore Проверено',
    enterIdSub: 'Введите ваш ID код студента ClassCore для синхронизации очков!',
    idLabel: 'ID код студента:',
    idPlaceholder: 'напр. 101, ST-101 или телефон',
    nameLabel: 'Имя и фамилия (необязательно):',
    namePlaceholder: 'напр. Серго Цивцивадзе',
    testIdsLabel: 'Тестовые ID коды (нажмите для выбора):',
    checking: 'Проверка...',
    submitBtn: 'Войти по ID коду',
    adminTitle: '👑 Панель Администратора',
    adminSubTitle: '● Живая аналитика в реальном времени и призы',
    adminBtnText: '👑 ST Dance Studio — Панель и аналитика',
    totalPlayers: 'Всего зарегистрировано',
    activeOnline: 'Онлайн / Играют сейчас',
    totalGamesPlayed: 'Всего сыграно игр',
    topLeader: '#1 Текущий лидер',
    playersListHeader: '🎮 Игроки и статус выдачи призов',
    refreshBtn: 'Обновить'
  }
};

export default function LoginModal({ isOpen, onClose, currentUser, onLogin, lang = 'ka' }) {
  const t = loginTranslations[lang] || loginTranslations.ka;
  const isAdmin = currentUser?.studentId === '99999' ||
    currentUser?.studentId === 'TG-stdancestudio' ||
    currentUser?.username?.toLowerCase() === 'stdancestudio' ||
    String(currentUser?.studentId || '').toLowerCase() === 'tg-stdancestudio';

  const [claimedPrizes, setClaimedPrizes] = useState(() => {
    try {
      const raw = localStorage.getItem('dancing_bricks_claimed_prizes');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  const [claimToast, setClaimToast] = useState(null);

  const handleTogglePrizeClaim = (playerId, playerName) => {
    setClaimedPrizes(prev => {
      const nextState = !prev[playerId];
      const updated = {
        ...prev,
        [playerId]: nextState,
        [playerName]: nextState,
        [playerName.toLowerCase()]: nextState
      };
      localStorage.setItem('dancing_bricks_claimed_prizes', JSON.stringify(updated));
      setClaimToast(nextState ? `✅ ${playerName}-ის საჩუქარი გაცემულად მოინიშნა!` : `🎁 ${playerName}-ის საჩუქარი გაუცემელზე დაბრუნდა.`);
      setTimeout(() => setClaimToast(null), 3500);

      // Auto-generate voucher in user prizes list if claimed
      if (nextState) {
        try {
          const rawPrizes = localStorage.getItem('dancing_bricks_my_prizes');
          let prizes = rawPrizes ? JSON.parse(rawPrizes) : [];
          if (!Array.isArray(prizes)) prizes = [];
          const existingIdx = prizes.findIndex(p => p.winnerName === playerName || p.playerId === playerId);
          if (existingIdx !== -1) {
            prizes[existingIdx].isClaimed = true;
          } else {
            prizes.unshift({
              id: `voucher_claimed_${playerId}`,
              code: `ST-WIN-${Math.floor(1000 + Math.random() * 9000)}`,
              prizeName: '-100% ვაუჩერი & ST Dance merch',
              prizeImg: '/images/prizes/voucher_100.png',
              winnerName: playerName,
              playerId: playerId,
              date: new Date().toLocaleDateString('ka-GE'),
              isClaimed: true
            });
          }
          localStorage.setItem('dancing_bricks_my_prizes', JSON.stringify(prizes));
        } catch (e) {}

        // Add to winners history list
        try {
          const rawHistory = localStorage.getItem('dancing_bricks_winners_history');
          let histList = rawHistory ? JSON.parse(rawHistory) : [];
          if (!Array.isArray(histList)) histList = [];
          if (!histList.some(h => h.winner === playerName || h.id === playerId)) {
            histList.unshift({
              month: 'აგვისტო 2026',
              winner: playerName,
              id: playerId,
              prize: '-100% ვაუჩერი & ST Dance merch',
              code: `ST-WIN-${Math.floor(1000 + Math.random() * 9000)}`,
              isClaimed: true
            });
            localStorage.setItem('dancing_bricks_winners_history', JSON.stringify(histList));
          }
        } catch (e) {}
      }

      // Sync claim state to Supabase Cloud DB
      submitFormAnswer({
        form_slug: 'admin_prize_claim',
        user_id: playerId || 'GUEST',
        user_name: playerName,
        data: {
          player_id: playerId,
          player_name: playerName,
          is_claimed: nextState,
          claimed_at: new Date().toISOString()
        }
      }).catch(() => {});

      // Send email alert on prize claim
      if (nextState) {
        try {
          const rawPrizes = localStorage.getItem('dancing_bricks_my_prizes');
          let prizes = rawPrizes ? JSON.parse(rawPrizes) : [];
          const foundVoucher = Array.isArray(prizes) ? prizes.find(p => p.winnerName === playerName || p.playerId === playerId) : null;
          const hasSpun = Boolean(foundVoucher && foundVoucher.prizeName);
          const prizeName = hasSpun ? foundVoucher.prizeName : '-100% ვაუჩერი & ST Dance merch';
          const code = foundVoucher?.code || `ST-WIN-${Math.floor(1000 + Math.random() * 9000)}`;

          fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              _subject: `🎁 [ST DANCE GAME] საჩუქარი გაცემულია: ${playerName}`,
              "👤 გამარჯვებული / მოთამაშე": playerName,
              "🆔 ID": playerId,
              "🎰 დოლურას სტატუსი": hasSpun ? `✅ დოლურა დატრიალებულია (მოგებული: ${prizeName})` : `⏳ დოლურა ჯერ არ დაუტრიალებია (ელოდება დატრიალებას)`,
              "🎁 მოგებული პრიზი": prizeName,
              "🎟️ ვაუჩერის კოდი": code,
              "🎁 სტატუსი": "✅ საჩუქარი გაცემულია (ჩაბარებულია)",
              "🕒 დრო": new Date().toLocaleString('ka-GE')
            })
          }).catch(() => {});
        } catch (e) {}
      }

      return updated;
    });
  };
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalPlayersCount: 0,
    activeLiveCount: 0,
    totalGamesCount: 0,
    topLeaderName: '—',
    players: []
  });

  const loadAdminAnalytics = async () => {
    setAdminLoading(true);
    try {
      const list = await fetchCloudLeaderboard();
      let playersList = Array.isArray(list) ? [...list] : [];

      // Sort strictly by score descending (highest score first)
      playersList.sort((a, b) => {
        const scoreA = Number(a.score ?? a.high_score ?? a.total_score ?? 0);
        const scoreB = Number(b.score ?? b.high_score ?? b.total_score ?? 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const gamesA = Number(a.games ?? a.total_games ?? 0);
        const gamesB = Number(b.games ?? b.total_games ?? 0);
        return gamesB - gamesA;
      });

      const totalPlayersCount = playersList.length;
      const totalGamesCount = playersList.reduce((sum, p) => sum + Number(p.games ?? p.total_games ?? 0), 0);
      const topLeaderName = playersList[0]?.name || '—';

      const tenMinsAgo = Date.now() - (10 * 60 * 1000);
      const activeLiveCount = playersList.filter(p => p.updatedAt && new Date(p.updatedAt).getTime() > tenMinsAgo).length || 1;

      setAdminStats({
        totalPlayersCount,
        activeLiveCount,
        totalGamesCount,
        topLeaderName,
        players: playersList
      });
    } catch (e) {
      console.warn('Admin analytics fetch failed:', e);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (showAdminDashboard) {
      loadAdminAnalytics();
    }
  }, [showAdminDashboard]);

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
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#F0D9A8' }}>
              {currentUser?.isLoggedIn ? t.modalTitle : t.inputTitle}
            </span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="quiz-unlocked-state" style={{ padding: '16px 0', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#22c55e" className="animate-bounce" />
            <h3 style={{ fontSize: '16px', marginTop: '8px' }}>{t.successTitle}</h3>
            <p style={{ fontSize: '13px', color: '#e4e4e7', margin: '4px 0' }}>{t.student} <strong>{currentUser?.name || idInput}</strong></p>
            <span style={{ fontSize: '11px', color: '#d4a64a', fontWeight: '800' }}>ID: {idInput.toUpperCase()}</span>
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
                    <Sparkles size={10} /> {t.verified}
                  </span>
                )}
              </div>
            </div>

            {/* Real-time Live Statistics Display */}
            <div style={{ width: '100%', marginTop: '6px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', color: '#F0D9A8', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                📊 {t.statsHeader}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {/* High Score */}
                <div style={{ background: 'rgba(212,165,90,0.1)', padding: '8px 6px', borderRadius: '10px', border: '1px solid rgba(212,165,90,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Trophy size={16} color="#d4a64a" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '9.5px', color: '#a1a1aa', fontWeight: '700' }}>{t.highScore}</span>
                  <b style={{ color: '#F0D9A8', fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>
                    {(currentUser.monthlyHighScore || currentUser.highScore || 0).toLocaleString()}
                  </b>
                </div>

                {/* Total Score */}
                <div style={{ background: 'rgba(56,189,248,0.1)', padding: '8px 6px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Flame size={16} color="#38BDF8" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '9.5px', color: '#a1a1aa', fontWeight: '700' }}>{t.totalScore}</span>
                  <b style={{ color: '#BAE6FD', fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>
                    {(currentUser.monthlyTotalScore || currentUser.totalScore || 0).toLocaleString()}
                  </b>
                </div>

                {/* Games Played */}
                <div style={{ background: 'rgba(74,222,128,0.1)', padding: '8px 6px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <PlayCircle size={16} color="#4ADE80" style={{ marginBottom: '4px' }} />
                  <span style={{ fontSize: '9.5px', color: '#a1a1aa', fontWeight: '700' }}>{t.totalGames}</span>
                  <b style={{ color: '#DCFCE7', fontSize: '15px', fontWeight: '900', marginTop: '2px' }}>
                    {currentUser.monthlyGames || currentUser.totalGames || 0}
                  </b>
                </div>
              </div>
            </div>

            {/* Exclusive Admin Dashboard Button (Only for @stdancestudio) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowAdminDashboard(true)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d4a64a 0%, #a3762b 100%)',
                  color: '#05060a',
                  fontWeight: '900',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '10px',
                  boxShadow: '0 4px 14px rgba(212,166,74,0.45)'
                }}
              >
                <Crown size={17} color="#05060a" />
                {t.adminBtnText}
              </button>
            )}
          </div>
        ) : (
          <form className="login-form-body" onSubmit={handleIdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
              {t.enterIdSub}
            </p>

            <div className="input-group">
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#d4a64a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <KeyRound size={14} /> {t.idLabel}
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder={t.idPlaceholder}
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
                {t.testIdsLabel}
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
                <User size={14} /> {t.nameLabel}
              </label>
              <input
                type="text"
                placeholder={t.namePlaceholder}
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
              {loading ? t.checking : t.submitBtn}
            </button>
          </form>
        )}
      </div>

      {/* Exclusive Admin Dashboard Overlay Modal */}
      {showAdminDashboard && createPortal(
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="modal-content glass animate-in" style={{ maxWidth: '450px', width: '94%', maxHeight: '88vh', overflowY: 'auto', padding: '16px', borderRadius: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(212,166,74,0.3)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={22} color="#d4a64a" />
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#F0D9A8', margin: 0 }}>{t.adminTitle}</h3>
                  <span style={{ fontSize: '10.5px', color: '#4ADE80', fontWeight: '700' }}>{t.adminSubTitle}</span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowAdminDashboard(false)}>
                <X size={18} />
              </button>
            </div>

            {adminLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#F0D9A8' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '12px' }}>მონაცემები იტვირთება Cloud-იდან...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Top Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'rgba(212,166,74,0.12)', border: '1px solid rgba(212,166,74,0.3)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                    <Users size={18} color="#d4a64a" style={{ margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.totalPlayers}</div>
                    <b style={{ fontSize: '17px', color: '#F0D9A8', fontWeight: '900' }}>{adminStats.totalPlayersCount}</b>
                  </div>

                  <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                    <Radio size={18} color="#22c55e" style={{ margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.activeOnline}</div>
                    <b style={{ fontSize: '17px', color: '#4ADE80', fontWeight: '900' }}>{adminStats.activeLiveCount} 🟢 LIVE</b>
                  </div>

                  <div style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                    <PlayCircle size={18} color="#38BDF8" style={{ margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.totalGamesPlayed}</div>
                    <b style={{ fontSize: '17px', color: '#BAE6FD', fontWeight: '900' }}>{adminStats.totalGamesCount}</b>
                  </div>

                  <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
                    <Trophy size={18} color="#f43f5e" style={{ margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.topLeader}</div>
                    <b style={{ fontSize: '12px', color: '#FECDD3', fontWeight: '900', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminStats.topLeaderName}</b>
                  </div>
                </div>

                {/* Scrollable Player List Table with Prize Claim Toggle */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '900', color: '#F0D9A8', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t.playersListHeader}</span>
                    <button onClick={loadAdminAnalytics} style={{ background: 'transparent', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <RefreshCw size={12} /> {t.refreshBtn}
                    </button>
                  </div>

                  {claimToast && (
                    <div style={{ background: 'rgba(34,197,94,0.18)', border: '1px solid #22c55e', color: '#4ADE80', padding: '7px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', textAlign: 'center', marginBottom: '8px' }}>
                      {claimToast}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '270px', overflowY: 'auto' }}>
                    {adminStats.players.map((pl, idx) => {
                      const pKey = pl.id || pl.name;
                      const isClaimed = !!claimedPrizes[pKey];
                      const isWinner = idx === 0;
                      const prizeText = isWinner ? '🏆 #1 გამარჯვებული (100% ვაუჩერი & ST Dance merch — 20 სექტემბერი)' : `#${idx + 1} პრეტენდენტი`;

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 11px', background: isWinner ? 'rgba(212,166,74,0.15)' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isWinner ? '1px solid rgba(212,166,74,0.4)' : '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                              <span style={{ fontSize: '12px', fontWeight: '900', color: isWinner ? '#FFD700' : '#a1a1aa', width: '20px', flexShrink: 0 }}>#{idx + 1}</span>
                              <div style={{ textAlign: 'left', minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '800', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</div>
                                <span style={{ fontSize: '9.5px', color: '#a1a1aa' }}>ID: {pl.id}</span>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#F0D9A8' }}>{(pl.score || pl.high_score || 0).toLocaleString()} ქ</div>
                                <span style={{ fontSize: '9.5px', color: '#4ADE80' }}>{Math.max(1, pl.games || pl.total_games || 1)} თამაში</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleTogglePrizeClaim(pKey, pl.name)}
                                style={{
                                  background: isClaimed ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(239,68,68,0.18)',
                                  border: isClaimed ? '1px solid #22c55e' : '1px solid rgba(239,68,68,0.5)',
                                  color: isClaimed ? '#ffffff' : '#f87171',
                                  borderRadius: '8px',
                                  padding: '5px 9px',
                                  fontSize: '10px',
                                  fontWeight: '900',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  boxShadow: isClaimed ? '0 2px 8px rgba(34,197,94,0.3)' : 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                title="საჩუქრის გაცემის სტატუსი"
                              >
                                {isClaimed ? '✅ გაცემულია' : '🎁 გაცემა'}
                              </button>
                            </div>
                          </div>

                          <div style={{ fontSize: '9.5px', color: isWinner ? '#F0D9A8' : '#818cf8', fontWeight: '700', background: isWinner ? 'rgba(212,166,74,0.2)' : 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '6px', width: 'fit-content', marginTop: '2px' }}>
                            {prizeText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
