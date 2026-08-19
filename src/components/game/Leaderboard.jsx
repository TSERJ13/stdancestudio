import React, { useState } from 'react';
import { Trophy, Gift, Ticket, History, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SpinModal from './SpinModal';

const TEST_LEADERBOARD = [
  { id: '101', rank: 1, name: 'სერგო წივწივაძე (Head Coach)', score: 2480, games: 18, isStudent: true, avatarBg: '#d4a64a' },
  { id: '102', rank: 2, name: 'მარიამი (Samba Star)', score: 1950, games: 14, isStudent: true, avatarBg: '#6fc3e0' },
  { id: '103', rank: 3, name: 'ნიკოლოზი (Cha-Cha King)', score: 1620, games: 12, isStudent: true, avatarBg: '#b87bde' },
  { id: '104', rank: 4, name: 'ანა (Rumba Queen)', score: 1340, games: 10, isStudent: true, avatarBg: '#e0764a' },
  { id: '105', rank: 5, name: 'გიორგი (Jive Champ)', score: 1110, games: 8, isStudent: true, avatarBg: '#6fd98f' },
  { id: '106', rank: 6, name: 'ელენე (Waltz Master)', score: 890, games: 6, isStudent: true, avatarBg: '#ff4444' }
];

const WINNERS_HISTORY = [
  { month: '2026 — იანვარი', winner: 'სერგო წივწივაძე', prize: 'ST Dance Studio წყლის ბოთლი', code: 'ST-WIN-9021', date: '31/01/2026' },
  { month: '2025 — დეკემბერი', winner: 'მარიამი', prize: '-50% Danceshop.Ge ვაუჩერი', code: 'ST-WIN-7814', date: '31/12/2025' },
  { month: '2025 — ნოემბერი', winner: 'ნიკოლოზი', prize: 'ST Dance Studio ზურგჩანთა', code: 'ST-WIN-5120', date: '30/11/2025' }
];

const lbTranslations = {
  ka: {
    title: 'სტუდიის ლიდერბორდი & პრიზები',
    subtitle: 'თვის გამარჯვებულები და Danceshop.Ge ვაუჩერები',
    spinBtn: 'დოლურას დატრიალება',
    ranksTab: 'რანგები',
    myPrizesTab: (count) => `ჩემი ვაუჩერები (${count})`,
    historyTab: 'გამარჯვებულების ისტორია',
    profileLbl: 'შენი პროფაილი:',
    highScoreLbl: 'რეკორდი: ',
    collectBtn: 'პრიზის მიღება',
    activeBadge: 'აქტიური',
    deliveredBadge: 'გადაცემულია',
    emptyVouchers: 'ჯერ არ გაქვს მოგებული ვაუჩერი. გახდი #1 რანგის გამარჯვებული და დაატრიალე დოლურა!',
    copyCode: 'კოდის კოპირება',
    copiedText: 'დაკოპირდა!',
    pts: 'ქულა',
    games: 'თამაში'
  },
  en: {
    title: 'Studio Leaderboard & Prizes',
    subtitle: 'Winners of the Month & Danceshop.Ge Vouchers',
    spinBtn: 'Spin Prize Wheel',
    ranksTab: 'Ranks',
    myPrizesTab: (count) => `My Vouchers (${count})`,
    historyTab: 'Winners History',
    profileLbl: 'Your Profile:',
    highScoreLbl: 'High Score: ',
    collectBtn: 'Collect Prize',
    activeBadge: 'ACTIVE',
    deliveredBadge: 'Delivered',
    emptyVouchers: 'You have no vouchers yet. Become #1 rank winner to spin the wheel!',
    copyCode: 'Copy Code',
    copiedText: 'Copied!',
    pts: 'pts',
    games: 'games'
  },
  ru: {
    title: 'Лидерборд студии и призы',
    subtitle: 'Победители месяца и ваучеры Danceshop.Ge',
    spinBtn: 'Крутить колесо',
    ranksTab: 'Рейтинг',
    myPrizesTab: (count) => `Мои ваучеры (${count})`,
    historyTab: 'История победителей',
    profileLbl: 'Ваш профиль:',
    highScoreLbl: 'Рекорд: ',
    collectBtn: 'Получить приз',
    activeBadge: 'АКТИВЕН',
    deliveredBadge: 'Выдано',
    emptyVouchers: 'У вас пока нет ваучеров. Займите 1-е место, чтобы прокрутить колесо!',
    copyCode: 'Скопировать код',
    copiedText: 'Скопировано!',
    pts: 'очков',
    games: 'игр'
  }
};

export default function Leaderboard({ currentHighScore, playerName, onUpdatePlayerName }) {
  const { lang } = useLanguage();
  const t = lbTranslations[lang] || lbTranslations.ka;

  const [activeTab, setActiveTab] = useState('ranks');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName || '');
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('სერგო წივწივაძე');
  const [copiedCode, setCopiedCode] = useState(null);

  const [myVouchers, setMyVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('dancing_bricks_my_prizes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 1,
        code: 'ST-WIN-8942',
        prizeName: '-50% ვაუჩერი',
        prizeDesc: '-50% ფასდაკლების ვაუჩერი Danceshop.Ge-ზე',
        prizeImg: '/images/prizes/voucher_50.png',
        winnerName: playerName || 'სერგო წივწივაძე',
        date: '19/08/2026'
      }
    ];
  });

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      setEditingName(false);
    }
  };

  const openSpinForWinner = (name) => {
    setSelectedWinner(name);
    setShowSpinModal(true);
  };

  const handleClaimPrize = (newVoucher) => {
    setMyVouchers(prev => {
      const updated = [newVoucher, ...prev];
      localStorage.setItem('dancing_bricks_my_prizes', JSON.stringify(updated));
      return updated;
    });
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="leaderboard-container glass animate-in">
      <div className="lb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div className="lb-title">
          <Trophy size={24} color="#d4a64a" />
          <div>
            <h2>{t.title}</h2>
            <span className="lb-subtitle">{t.subtitle}</span>
          </div>
        </div>

        <button
          onClick={() => openSpinForWinner(TEST_LEADERBOARD[0].name)}
          style={{
            padding: '8px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
            border: 'none',
            color: '#151100',
            fontWeight: '900',
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(212,166,74,0.3)'
          }}
        >
          <Gift size={16} /> {t.spinBtn}
        </button>
      </div>

      {/* Sub Navigation Bar */}
      <div style={{ display: 'flex', gap: '6px', margin: '12px 0 16px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setActiveTab('ranks')}
          style={{
            flex: 1,
            height: '34px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'ranks' ? 'rgba(212,166,74,0.2)' : 'transparent',
            color: activeTab === 'ranks' ? '#F0D9A8' : '#a1a1aa',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Trophy size={14} /> {t.ranksTab}
        </button>

        <button
          onClick={() => setActiveTab('my_prizes')}
          style={{
            flex: 1,
            height: '34px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'my_prizes' ? 'rgba(212,166,74,0.2)' : 'transparent',
            color: activeTab === 'my_prizes' ? '#F0D9A8' : '#a1a1aa',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Ticket size={14} /> {t.myPrizesTab(myVouchers.length)}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            height: '34px',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'history' ? 'rgba(212,166,74,0.2)' : 'transparent',
            color: activeTab === 'history' ? '#F0D9A8' : '#a1a1aa',
            fontWeight: '800',
            fontSize: '11.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <History size={14} /> {t.historyTab}
        </button>
      </div>

      {activeTab === 'ranks' && (
        <>
          <div className="player-profile-bar">
            <span className="profile-lbl">{t.profileLbl}</span>
            {editingName ? (
              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="შეიყვანე სახელი..."
                />
                <button className="btn-save-name" onClick={handleSaveName}>შენახვა</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontWeight: '800', color: '#F0D9A8', fontSize: '13px' }}>{playerName}</span>
                <button
                  onClick={() => setEditingName(true)}
                  style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '10px', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  შეცვლა
                </button>
              </div>
            )}
            <div className="my-score-pill">
              <span>{t.highScoreLbl}</span>
              <strong style={{ color: '#d4a64a' }}>{(currentHighScore || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div className="lb-list">
            {TEST_LEADERBOARD.map((item) => {
              const isWinner = item.rank === 1;
              return (
                <div key={item.id} className={`lb-row ${item.name === playerName ? 'is-me' : ''}`}>
                  <div className="lb-rank" style={{ color: isWinner ? '#d4a64a' : item.rank === 2 ? '#6fc3e0' : item.rank === 3 ? '#b87bde' : '#a1a1aa' }}>
                    #{item.rank}
                  </div>

                  <div className="lb-avatar" style={{ background: item.avatarBg }}>
                    {item.name.charAt(0)}
                  </div>

                  <div className="lb-user-info">
                    <span className="lb-name">{item.name}</span>
                    <span className="lb-badge">ID: {item.id}</span>
                  </div>

                  {isWinner ? (
                    <button
                      onClick={() => openSpinForWinner(item.name)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none',
                        color: 'white',
                        fontWeight: '900',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 0 12px rgba(34,197,94,0.4)'
                      }}
                    >
                      <Gift size={14} /> {t.collectBtn}
                    </button>
                  ) : (
                    <div className="lb-score-col">
                      <span className="lb-score">{item.score.toLocaleString()} {t.pts}</span>
                      <span className="lb-games">{item.games} {t.games}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'my_prizes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {myVouchers.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
              {t.emptyVouchers}
            </div>
          ) : (
            myVouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  background: 'rgba(212,166,74,0.1)',
                  border: '1.5px dashed rgba(212,166,74,0.4)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ width: '84px', height: '64px', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', flexShrink: 0, border: '1.5px solid #d4a64a', padding: '2px' }}>
                  <img src={v.prizeImg} alt={v.prizeName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#F0D9A8', margin: 0 }}>{v.prizeName}</h4>
                    <span style={{ fontSize: '9px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 6px', borderRadius: '6px', fontWeight: '800' }}>
                      {t.activeBadge}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'white', fontWeight: '700' }}>{v.winnerName}</div>
                  <div style={{ fontSize: '11px', color: '#a1a1aa' }}>თარიღი: {v.date}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#d4a64a', letterSpacing: '1px', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(212,166,74,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ticket size={14} /> {v.code}
                  </div>
                  <button
                    onClick={() => copyVoucherCode(v.code)}
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedCode === v.code ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                    {copiedCode === v.code ? t.copiedText : t.copyCode}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {WINNERS_HISTORY.map((h, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700' }}>{h.month}</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: 'white' }}>{h.winner}</div>
                <div style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '800' }}>პრიზი: {h.prize}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '800', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                  {t.deliveredBadge}
                </span>
                <div style={{ fontSize: '10px', color: '#71717a', marginTop: '4px' }}>{h.code}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SpinModal
        isOpen={showSpinModal}
        onClose={() => setShowSpinModal(false)}
        winnerName={selectedWinner}
        onClaimPrize={handleClaimPrize}
      />
    </div>
  );
}
