import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Gift, Ticket, History, Copy, Check, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SpinModal from './SpinModal';
import { fetchCloudLeaderboard, syncCloudScore } from '../../data/classcore';

const TEST_LEADERBOARD = [];

const WINNERS_HISTORY = [];

const lbTranslations = {
  ka: {
    title: 'ლიდერბორდი',
    subtitle: '20 რიცხვის გამარჯვებლები & Danceshop.Ge ვაუჩერები',
    spinBtn: 'დოლურა',
    ranksTab: 'რანგები',
    myPrizesTab: (count) => `ვაუჩერი (${count})`,
    historyTab: 'ისტორია',
    profileLbl: 'პროფაილი:',
    highScoreLbl: 'ჯამური ქულა: ',
    collectBtn: 'პრიზი',
    activeBadge: 'აქტიური',
    deliveredBadge: 'გადაცემული',
    emptyVouchers: 'ჯერ არ გაქვს ვაუჩერი. გახდი #1!',
    copyCode: 'კოდის კოპირება',
    copiedText: 'დაკოპირდა!',
    pts: 'ქულა',
    games: 'თამ.'
  },
  en: {
    title: 'Leaderboard',
    subtitle: '20th Winners & Danceshop.Ge Vouchers',
    spinBtn: 'Spin Wheel',
    ranksTab: 'Ranks',
    myPrizesTab: (count) => `Voucher (${count})`,
    historyTab: 'History',
    profileLbl: 'Profile:',
    highScoreLbl: 'Total Score: ',
    collectBtn: 'Collect',
    activeBadge: 'ACTIVE',
    deliveredBadge: 'Delivered',
    emptyVouchers: 'No vouchers yet. Become #1 rank winner!',
    copyCode: 'Copy Code',
    copiedText: 'Copied!',
    pts: 'pts',
    games: 'g'
  },
  ru: {
    title: 'Лидерборд',
    subtitle: 'Победители 20-го числа и ваучеры Danceshop.Ge',
    spinBtn: 'Колесо',
    ranksTab: 'Рейтинг',
    myPrizesTab: (count) => `Ваучер (${count})`,
    historyTab: 'История',
    profileLbl: 'Профиль:',
    highScoreLbl: 'Общ. счет: ',
    collectBtn: 'Забрать',
    activeBadge: 'АКТИВЕН',
    deliveredBadge: 'Выдано',
    emptyVouchers: 'Ваучеров нет. Займите 1-е место!',
    copyCode: 'Скопировать код',
    copiedText: 'Скопировано!',
    pts: 'очк.',
    games: 'игр'
  }
};

function formatAvatarUrl(url) {
  if (!url) return '';
  if (url.startsWith('https://t.me/i/userpic/')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function AvatarImage({ src, alt, fallbackChar }) {
  const [useProxy, setUseProxy] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUseProxy(true);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <span style={{ fontWeight: '900', fontSize: '15px', color: 'white' }}>{fallbackChar}</span>;
  }

  const imgSrc = (useProxy && src.startsWith('https://t.me/i/userpic/'))
    ? formatAvatarUrl(src)
    : src;

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (useProxy && src.startsWith('https://t.me/i/userpic/')) {
          setUseProxy(false);
        } else {
          setFailed(true);
        }
      }}
      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function Leaderboard({ currentTotalScore, totalGames, playerName, userId, photoUrl, onUpdatePlayerName }) {
  const { lang } = useLanguage();
  const t = lbTranslations[lang] || lbTranslations.ka;
  const [cloudList, setCloudList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function refreshCloudData() {
      const fetched = await fetchCloudLeaderboard();
      if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
        setCloudList(fetched);
      }
    }

    async function initialSync() {
      await refreshCloudData();
      if (playerName && userId && (String(userId).startsWith('TG-') || String(userId).startsWith('ST-'))) {
        const synced = await syncCloudScore({
          id: userId,
          name: playerName,
          photoUrl: photoUrl || '',
          score: currentTotalScore || 0,
          games: totalGames || 0
        });
        if (isMounted && Array.isArray(synced) && synced.length > 0) {
          setCloudList(synced);
        }
      }
    }

    initialSync();

    const interval = setInterval(refreshCloudData, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [playerName, currentTotalScore, totalGames, userId, photoUrl]);

  // Build dynamic leaderboard list
  const displayScore = currentTotalScore || 0;
  const combinedList = cloudList.filter(item => item.name !== 'Dancer' && !String(item.id).startsWith('USER_'));

  if (playerName && playerName !== 'Dancer') {
    const isMeIdx = combinedList.findIndex(m =>
      (userId && m.id === userId) ||
      (m.name && m.name.trim().toLowerCase() === playerName.trim().toLowerCase())
    );
    if (isMeIdx !== -1) {
      combinedList[isMeIdx] = {
        ...combinedList[isMeIdx],
        photoUrl: combinedList[isMeIdx].photoUrl || photoUrl || '',
        score: Math.max(combinedList[isMeIdx].score || 0, displayScore),
        games: Math.max(combinedList[isMeIdx].games || 0, totalGames || 0)
      };
    } else if (userId && String(userId).startsWith('TG-')) {
      combinedList.push({
        id: userId,
        name: playerName,
        photoUrl: photoUrl || '',
        score: displayScore,
        games: totalGames || 0,
        avatarBg: '#22c55e'
      });
    }
  }

  // Sort and assign ranks
  combinedList.sort((a, b) => b.score - a.score);
  const rankedList = combinedList.map((item, index) => ({ ...item, rank: index + 1 }));

  const [activeTab, setActiveTab] = useState('ranks');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName || '');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('სერგო წივწივაძე');
  const [copiedCode, setCopiedCode] = useState(null);
  
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdownState, setCountdownState] = useState({ isUnlocked: false, timeLeftText: '', monthName: '' });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const georgiaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (4 * 3600000));
      
      let targetYear = georgiaTime.getFullYear();
      let targetMonth = georgiaTime.getMonth();
      
      const thisMonthTarget = new Date(targetYear, targetMonth, 20, 22, 0, 0);
      if (georgiaTime.getTime() >= thisMonthTarget.getTime()) {
        targetMonth++;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear++;
        }
      }
      
      const targetDate = new Date(targetYear, targetMonth, 20, 22, 0, 0);
      const diff = targetDate.getTime() - georgiaTime.getTime();
      
      const monthNamesKa = ["იანვრამდე", "თებერვლამდე", "მარტამდე", "აპრილამდე", "მაისამდე", "ივნისამდე", "ივლისამდე", "აგვისტომდე", "სექტემბრამდე", "ოქტომბრამდე", "ნოემბრამდე", "დეკემბრამდე"];
      const monthNamesEn = ["Until Jan", "Until Feb", "Until Mar", "Until Apr", "Until May", "Until Jun", "Until Jul", "Until Aug", "Until Sept", "Until Oct", "Until Nov", "Until Dec"];
      const monthNamesRu = ["До Января", "До Февраля", "До Марта", "До Апреля", "До Мая", "До Июня", "До Июля", "До Августа", "До Сентября", "До Октября", "До Ноября", "До Декабря"];

      const drawNamesKa = ["20 იანვრის", "20 თებერვლის", "20 მარტის", "20 აპრილის", "20 მაისის", "20 ივნისის", "20 ივლისის", "20 აგვისტოს", "20 სექტემბრის", "20 ოქტომბრის", "20 ნოემბრის", "20 დეკემბრის"];
      const drawNamesEn = ["Jan 20th", "Feb 20th", "Mar 20th", "Apr 20th", "May 20th", "Jun 20th", "Jul 20th", "Aug 20th", "Sept 20th", "Oct 20th", "Nov 20th", "Dec 20th"];
      const drawNamesRu = ["20 Января", "20 Февраля", "20 Марта", "20 Апреля", "20 Мая", "20 Июня", "20 Июля", "20 Августа", "20 Сентября", "20 Октября", "20 Ноября", "20 Декабря"];

      let monthName = monthNamesKa[targetMonth];
      let drawName = drawNamesKa[targetMonth];

      if (lang === 'en') {
        monthName = monthNamesEn[targetMonth];
        drawName = drawNamesEn[targetMonth];
      } else if (lang === 'ru') {
        monthName = monthNamesRu[targetMonth];
        drawName = drawNamesRu[targetMonth];
      }

      if (diff <= 0) {
        setCountdownState({ isUnlocked: true, timeLeftText: '', monthName, drawName });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        let timeStr = `${d}დ ${h}სთ ${m}წთ ${s}წმ`;
        if (lang === 'en') {
          timeStr = `${d}d ${h}h ${m}m ${s}s`;
        } else if (lang === 'ru') {
          timeStr = `${d}д ${h}ч ${m}мин ${s}сек`;
        }

        setCountdownState({ isUnlocked: false, timeLeftText: timeStr, monthName, drawName });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const [myVouchers, setMyVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('dancing_bricks_my_prizes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Clear mock vouchers if they exist in user's local storage
          const filtered = parsed.filter(v => !['ST-WIN-8942', 'ST-WIN-8167'].includes(v.code));
          if (filtered.length !== parsed.length) {
            localStorage.setItem('dancing_bricks_my_prizes', JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch {}
    return [];
  });

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      setShowNameModal(false);
    }
  };

  const openSpinForWinner = (name) => {
    if (countdownState.isUnlocked) {
      if (!playerName || (playerName !== name && !name.includes(playerName))) {
        alert(lang === 'ka' ? 'მხოლოდ 1-ელ ადგილზე გასულ მოთამაშეს შეუძლია პრიზის დატრიალება!' : 'Only the 1st place winner can spin the wheel!');
        return;
      }
      setSelectedWinner(name);
      setShowSpinModal(true);
    } else {
      setShowCountdownModal(true);
    }
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
      <div className="lb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="lb-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={20} color="#d4a64a" />
          <h2 style={{ fontSize: '15px', margin: 0, fontWeight: '900', color: 'white' }}>{t.title}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: '#F0D9A8', fontWeight: '900', letterSpacing: '0.5px' }}>
            <Clock size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle', color: '#d4a64a', marginTop: '-2px' }} />
            {countdownState.timeLeftText || '00:00:00'}
          </span>
          <span style={{ fontSize: '9px', color: '#a1a1aa', fontWeight: '600', marginTop: '2px' }}>
            {lang === 'ka' ? `${countdownState.drawName} გათამაშება` : lang === 'ru' ? `Розыгрыш ${countdownState.drawName}` : `${countdownState.drawName} Draw`}
          </span>
        </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{ fontWeight: '800', color: '#F0D9A8', fontSize: '13px' }}>{(playerName || 'Dancer').split(' ')[0]}</span>
              <button
                onClick={() => { setNameInput(playerName || ''); setShowNameModal(true); }}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '10px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
              >
                შეცვლა
              </button>
            </div>
            <div className="my-score-pill">
              <span>{t.highScoreLbl}</span>
              <strong style={{ color: '#d4a64a' }}>{(currentTotalScore || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div className="lb-list">
            {rankedList.map((item) => {
              const isWinner = item.rank === 1;
              return (
                <div key={item.id} className={`lb-row ${item.name === playerName ? 'is-me' : ''}`}>
                  <div className="lb-rank" style={{ color: isWinner ? '#d4a64a' : item.rank === 2 ? '#6fc3e0' : item.rank === 3 ? '#b87bde' : '#a1a1aa' }}>
                    #{item.rank}
                  </div>

                  <div className="lb-avatar" style={{ background: item.avatarBg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AvatarImage src={item.photoUrl} alt={item.name} fallbackChar={item.name.charAt(0)} />
                  </div>

                  <div className="lb-user-info">
                    <span className="lb-name">{item.name}</span>
                    <span className="lb-badge">ID: {item.id}</span>
                  </div>

                  <div className="lb-score-col" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="lb-score" style={{ color: isWinner ? '#d4a64a' : 'white', fontWeight: '900' }}>
                      {item.score.toLocaleString()} {t.pts}
                    </span>
                    {isWinner ? (
                      <button
                        onClick={() => openSpinForWinner(item.name)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: countdownState.isUnlocked ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(212,166,74,0.15)',
                          border: countdownState.isUnlocked ? 'none' : '1px solid rgba(212,166,74,0.4)',
                          color: countdownState.isUnlocked ? 'white' : '#F0D9A8',
                          fontWeight: '900',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: countdownState.isUnlocked ? '0 2px 8px rgba(34, 197, 94, 0.4)' : 'none'
                        }}
                      >
                        <Trophy size={11} color={countdownState.isUnlocked ? '#ffffff' : '#d4a64a'} />
                        {countdownState.isUnlocked
                          ? (lang === 'ka' ? 'პრიზი' : 'Prize')
                          : (lang === 'ka' ? '#1 ლიდერი' : '#1 Lead')}
                      </button>
                    ) : (
                      <span className="lb-games">{item.games} {t.games}</span>
                    )}
                  </div>
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
        userId={currentUserProfile?.studentId || 'GUEST'}
      />

      {showCountdownModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass animate-in" style={{ maxWidth: '340px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Gift size={48} color="#d4a64a" />
            </div>
            <h3 style={{ color: '#F0D9A8', fontSize: '18px', fontWeight: '900', margin: '0 0 12px' }}>
              {lang === 'ka' ? 'თვის მთავარი პრიზი!' : 'Monthly Grand Prize!'}
            </h3>
            <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px' }}>
              {lang === 'ka' ? 
                `შეინარჩუნე ლიდერობა 20 ${countdownState.monthName} და მიიღე ST Dance-ის მერჩის საჩუქრები!` : 
                'Keep your 1st place lead until the 20th and win exclusive ST Dance merch!'}
            </p>
            
            <div style={{ background: 'rgba(212,166,74,0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,166,74,0.3)', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: '#a1a1aa', marginBottom: '6px' }}>
                {lang === 'ka' ? 'გათამაშებამდე დარჩენილია:' : 'Time remaining:'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', letterSpacing: '1px' }}>
                {countdownState.timeLeftText}
              </div>
            </div>

            <button
              onClick={() => setShowCountdownModal(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none', color: '#151100', fontWeight: '900',
                fontSize: '14px', cursor: 'pointer'
              }}
            >
              {lang === 'ka' ? 'გასაგებია' : 'Got it'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Name Edit Modal */}
      {showNameModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowNameModal(false)}>
          <div
            className="modal-content glass animate-in"
            style={{ maxWidth: '320px', padding: '28px', textAlign: 'center', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn-close"
              onClick={() => setShowNameModal(false)}
              style={{ position: 'absolute', top: '12px', right: '12px' }}
            >✕</button>
            <h3 style={{ color: '#F0D9A8', fontSize: '16px', fontWeight: '900', margin: '0 0 18px' }}>
              {lang === 'ka' ? '✏️ სახელის შეცვლა' : '✏️ Change Name'}
            </h3>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              placeholder={lang === 'ka' ? 'შეიყვანე სახელი...' : 'Enter your name...'}
              autoFocus
              style={{
                width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,166,74,0.4)',
                color: 'white', padding: '12px 14px', borderRadius: '12px', fontSize: '15px',
                outline: 'none', boxSizing: 'border-box', marginBottom: '16px',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSaveName}
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none', color: '#151100', fontWeight: '900',
                fontSize: '15px', cursor: 'pointer'
              }}
            >
              {lang === 'ka' ? 'შენახვა' : 'Save'}
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
