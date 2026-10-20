import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Trophy, Gift, Ticket, History, Copy, Check, Clock, Crown, Sparkles, Loader2,
  Send, ExternalLink, Phone, MessageCircle, X, Edit3, Save, GraduationCap, User
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import SpinModal, { getCurrentDrawMonthKey, PRIZES } from './SpinModal';
import {
  fetchCloudLeaderboard, syncCloudScore, fetchCloudWinnersHistory,
  updateWinnerPrizeDeliveryStatus, startNewSeasonInCloud,
  fetchStudioData, getStudentName, getStudentSubscription, savePortalSession,
  saveCloudPlayerAlias
} from '../../data/classcore';

export function openTelegramAccount(item) {
  if (!item) return;
  const rawId = String(item.id || '');
  const tgId = rawId.startsWith('TG-') ? rawId.replace('TG-', '') : (rawId.startsWith('USER_') ? '' : rawId);
  const username = item.username ? String(item.username).replace(/^@/, '') : '';

  // 1. If username exists
  if (username) {
    const url = `https://t.me/${username}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // 2. If numeric Telegram ID
  if (tgId && /^\d+$/.test(tgId)) {
    const tgDeepLink = `tg://user?id=${tgId}`;
    const tgWebLink = `https://t.me/openmessage?user_id=${tgId}`;

    if (window.Telegram?.WebApp) {
      try {
        window.location.href = tgDeepLink;
      } catch (e) {
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(tgWebLink);
        }
      }
      return;
    }

    const now = Date.now();
    try {
      window.location.href = tgDeepLink;
    } catch (e) {}
    setTimeout(() => {
      if (Date.now() - now < 2000) {
        window.open(tgWebLink, '_blank', 'noopener,noreferrer');
      }
    }, 600);
    return;
  }

  // 3. Fallback: if username in name
  if (item.name && item.name.startsWith('@')) {
    const cleanUser = item.name.replace('@', '');
    const url = `https://t.me/${cleanUser}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

export function matchStudentForPlayer(player, studioStudents) {
  if (!player || !Array.isArray(studioStudents) || studioStudents.length === 0) return null;
  const rawId = String(player.id || '');
  const pName = (player.name || '').toLowerCase().trim();

  // 1. Explicit linked student ID
  if (player.linkedStudentId) {
    const found = studioStudents.find(s => s.id === player.linkedStudentId || s.code === player.linkedStudentId || `ST-${s.id}` === player.linkedStudentId);
    if (found) return found;
  }

  // 2. Direct ID match
  const idMatch = studioStudents.find(s => s.id === rawId || `ST-${s.id}` === rawId || s.code === rawId);
  if (idMatch) return idMatch;

  // 3. Match by name or parent name
  if (!pName || pName === 'dancer') return null;

  return studioStudents.find(s => {
    const fn = (s.first_name || s.data?.first_name || '').toLowerCase().trim();
    const ln = (s.last_name || s.data?.last_name || '').toLowerCase().trim();
    const pn = (s.data?.parent_name || '').toLowerCase().trim();
    const full = `${fn} ${ln}`.trim();
    return (
      (full && (pName === full || pName.includes(full) || full.includes(pName))) ||
      (fn && fn.length > 3 && pName.includes(fn)) ||
      (ln && ln.length > 3 && pName.includes(ln)) ||
      (pn && pn.length > 3 && (pName.includes(pn) || pn.includes(pName)))
    );
  }) || null;
}

const TEST_LEADERBOARD = [];

const WINNERS_HISTORY = [];

function getLocalizedPrizeName(prizeName, lang) {
  if (!prizeName) return '';
  const found = PRIZES.find(p =>
    p.name.toLowerCase() === prizeName.toLowerCase() ||
    p.nameEn.toLowerCase() === prizeName.toLowerCase() ||
    p.nameRu.toLowerCase() === prizeName.toLowerCase() ||
    prizeName.toLowerCase().includes(p.name.toLowerCase())
  );
  if (!found) return prizeName;
  if (lang === 'ru') return found.nameRu || found.name;
  if (lang === 'en') return found.nameEn || found.name;
  return found.name;
}

const monthNamesKa = ["იანვრამდე", "თებერვლამდე", "მარტამდე", "აპრილამდე", "მაისამდე", "ივნისამდე", "ივლისამდე", "აგვისტომდე", "სექტემბრამდე", "ოქტომბრამდე", "ნოემბრამდე", "დეკემბრამდე"];
const monthNamesEn = ["Until Jan", "Until Feb", "Until Mar", "Until Apr", "Until May", "Until Jun", "Until Jul", "Until Aug", "Until Sept", "Until Oct", "Until Nov", "Until Dec"];
const monthNamesRu = ["До Января", "До Февраля", "До Марта", "До Апреля", "До Мая", "До Июня", "До Июля", "До Августа", "До Сентября", "До Октября", "До Ноября", "До Декабря"];

const drawNamesKa = ["20 იანვრის", "20 თებერვლის", "20 მარტის", "20 აპრილის", "20 მაისის", "20 ივნისის", "20 ივლისის", "20 აგვისტოს", "20 სექტემბრის", "20 ოქტომბრის", "20 ნოემბრის", "20 დეკემბრის"];
const drawNamesEn = ["Jan 20th", "Feb 20th", "Mar 20th", "Apr 20th", "May 20th", "Jun 20th", "Jul 20th", "Aug 20th", "Sept 20th", "Oct 20th", "Nov 20th", "Dec 20th"];
const drawNamesRu = ["20 Января", "20 Февраля", "20 Марта", "20 Апреля", "20 Мая", "20 Июня", "20 Июля", "20 Августа", "20 Сентября", "20 Октября", "20 Ноября", "20 Декабря"];

const lbTranslations = {
  ka: {
    title: 'ლიდერბორდი',
    subtitle: '20 რიცხვის გამარჯვებულები & საჩუქრები',
    spinBtn: 'დოლურა',
    ranksTab: 'რანგები',
    myPrizesTab: (count) => count > 0 ? `საჩუქრები (${count})` : 'საჩუქრები',
    historyTab: 'ისტორია',
    profileLbl: 'პროფაილი:',
    highScoreLbl: 'ჯამური ქულა: ',
    collectBtn: 'პრიზი',
    activeBadge: 'აქტიური',
    pendingBadge: 'მოლოდინში',
    deliveredBadge: 'გადაცემულია',
    markDeliveredBtn: 'გადაცემა',
    markPendingBtn: 'მოლოდინში დაბრუნება',
    emptyVouchers: 'დაიკავე #1 ადგილი 20 რიცხვში და დაატრიალე ST Dance-ის პრიზები!',
    copyCode: 'კოდის კოპირება',
    copiedText: 'დაკოპირდა!',
    pts: 'ქულა',
    games: 'თამ.',
    prizeLbl: 'პრიზი: ',
    prizeSpot: '👑 საპრიზო',
    openTelegramBtn: '✈️ Telegram ანგარიშზე გადასვლა',
    openPortalBtn: '🎓 სტუდენტის პორტალზე გადასვლა',
    playerProfileModalTitle: 'მოთამაშის პროფილი & ანგარიში',
    accountTypeTg: 'Telegram მოთამაშე',
    accountTypeStudent: 'ST Dance სტუდენტი',
    studentCardTitle: 'ST Dance Studio-ს მოსწავლე',
    parentLbl: 'მშობელი:',
    phoneLbl: 'ტელეფონი:',
    subLbl: 'აბონემენტი:',
    lessonsLeft: 'გაკვეთილი დარჩენილი',
    seasonRankLbl: 'ადგილი სეზონში',
    seasonScoreLbl: 'სეზონის ქულა',
    gamesLbl: 'თამაშები',
    studioNoteLbl: 'იდენტიფიკაცია / შენიშვნა:',
    studioNotePlaceholder: 'მაგ: მარიამის დედა...',
    saveNoteBtn: 'შენახვა',
    savedNoteSuccess: '✅ შენახულია!',
    copiedIdToast: 'ID დაკოპირდა!',
    callBtn: 'დარეკვა',
    whatsAppBtn: 'WhatsApp'
  },
  en: {
    title: 'Leaderboard',
    subtitle: '20th Winners & Prizes',
    spinBtn: 'Spin Wheel',
    ranksTab: 'Ranks',
    myPrizesTab: (count) => count > 0 ? `Prizes (${count})` : 'Prizes',
    historyTab: 'History',
    profileLbl: 'Profile:',
    highScoreLbl: 'Total Score: ',
    collectBtn: 'Collect',
    activeBadge: 'ACTIVE',
    pendingBadge: 'Pending',
    deliveredBadge: 'Delivered',
    markDeliveredBtn: 'Mark Delivered',
    markPendingBtn: 'Set Pending',
    emptyVouchers: 'Secure #1 rank on the 20th to spin exclusive ST Dance prizes!',
    copyCode: 'Copy Code',
    copiedText: 'Copied!',
    pts: 'pts',
    games: 'g',
    prizeLbl: 'Prize: ',
    prizeSpot: '👑 Prize',
    openTelegramBtn: '✈️ Open Telegram Account',
    openPortalBtn: '🎓 Open Student Portal',
    playerProfileModalTitle: 'Player Profile & Account',
    accountTypeTg: 'Telegram Player',
    accountTypeStudent: 'ST Dance Student',
    studentCardTitle: 'ST Dance Studio Student',
    parentLbl: 'Parent:',
    phoneLbl: 'Phone:',
    subLbl: 'Subscription:',
    lessonsLeft: 'lessons remaining',
    seasonRankLbl: 'Rank in season',
    seasonScoreLbl: 'Season Score',
    gamesLbl: 'Games Played',
    studioNoteLbl: 'Identification / Note:',
    studioNotePlaceholder: 'e.g. Mariam’s mom...',
    saveNoteBtn: 'Save',
    savedNoteSuccess: '✅ Saved!',
    copiedIdToast: 'ID copied!',
    callBtn: 'Call',
    whatsAppBtn: 'WhatsApp'
  },
  ru: {
    title: 'Лидерборд',
    subtitle: 'Победители 20-го числа и Призы',
    spinBtn: 'Колесо',
    ranksTab: 'Рейтинг',
    myPrizesTab: (count) => count > 0 ? `Призы (${count})` : 'Призы',
    historyTab: 'История',
    profileLbl: 'Профиль:',
    highScoreLbl: 'Общ. счет: ',
    collectBtn: 'Забрать',
    activeBadge: 'АКТИВЕН',
    pendingBadge: 'В ожидании',
    deliveredBadge: 'Выдано',
    markDeliveredBtn: 'Выдать',
    markPendingBtn: 'В ожидание',
    emptyVouchers: 'Займите 1-е место 20-го числа и выиграйте призы ST Dance!',
    copyCode: 'Скопировать код',
    copiedText: 'Скопировано!',
    pts: 'очк.',
    games: 'игр',
    prizeLbl: 'Приз: ',
    prizeSpot: '👑 Призовой',
    openTelegramBtn: '✈️ Перейти в аккаунт Telegram',
    openPortalBtn: '🎓 Перейти в портал ученика',
    playerProfileModalTitle: 'Профиль и аккаунт игрока',
    accountTypeTg: 'Игрок Telegram',
    accountTypeStudent: 'Ученик ST Dance',
    studentCardTitle: 'Ученик ST Dance Studio',
    parentLbl: 'Родитель:',
    phoneLbl: 'Телефон:',
    subLbl: 'Абонемент:',
    lessonsLeft: 'занятий осталось',
    seasonRankLbl: 'место в сезоне',
    seasonScoreLbl: 'Очки сезона',
    gamesLbl: 'Сыграно игр',
    studioNoteLbl: 'Идентификация / Заметка:',
    studioNotePlaceholder: 'напр. мама Мариам...',
    saveNoteBtn: 'Сохранить',
    savedNoteSuccess: '✅ Сохранено!',
    copiedIdToast: 'ID скопирован!',
    callBtn: 'Позвонить',
    whatsAppBtn: 'WhatsApp'
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

let LEADERBOARD_MEMORY_CACHE = null;

export default function Leaderboard({ currentTotalScore, totalGames, playerName, userId, photoUrl, onUpdatePlayerName, onOpenAdmin }) {
  const { lang } = useLanguage();
  const t = lbTranslations[lang] || lbTranslations.ka;
  const [cloudList, setCloudList] = useState(() => {
    if (Array.isArray(LEADERBOARD_MEMORY_CACHE) && LEADERBOARD_MEMORY_CACHE.length > 0) {
      return LEADERBOARD_MEMORY_CACHE;
    }
    try {
      const raw = localStorage.getItem('dancing_bricks_lb_cache');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    let isMounted = true;

    async function refreshCloudData() {
      const fetched = await fetchCloudLeaderboard();
      if (isMounted && Array.isArray(fetched) && fetched.length > 0) {
        LEADERBOARD_MEMORY_CACHE = fetched;
        try { localStorage.setItem('dancing_bricks_lb_cache', JSON.stringify(fetched)); } catch (e) {}
        setCloudList(fetched);
      }
    }

    async function initialSync() {
      await refreshCloudData();
      if (playerName && userId && (String(userId).startsWith('TG-') || String(userId).startsWith('ST-')) && (currentTotalScore || 0) > 0) {
        const synced = await syncCloudScore({
          id: userId,
          name: playerName,
          photoUrl: photoUrl || '',
          score: currentTotalScore,
          games: Math.max(1, totalGames || 1)
        });
        if (isMounted && Array.isArray(synced) && synced.length > 0) {
          LEADERBOARD_MEMORY_CACHE = synced;
          try { localStorage.setItem('dancing_bricks_lb_cache', JSON.stringify(synced)); } catch (e) {}
          setCloudList(synced);
        }
      }
    }

    initialSync();

    const handleScoreSync = (e) => {
      if (e?.detail?.updatedList && Array.isArray(e.detail.updatedList)) {
        LEADERBOARD_MEMORY_CACHE = e.detail.updatedList;
        setCloudList(e.detail.updatedList);
      }
    };
    window.addEventListener('dancing_bricks_score_synced', handleScoreSync);

    const interval = setInterval(refreshCloudData, 5000);
    return () => {
      isMounted = false;
      window.removeEventListener('dancing_bricks_score_synced', handleScoreSync);
      clearInterval(interval);
    };
  }, [userId]);

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

  const currentWinner = rankedList.find(item => item.rank === 1);
  const isUserFirstPlace = Boolean(currentWinner && (
    (userId && currentWinner.id === userId) ||
    (playerName && currentWinner.name && currentWinner.name.trim().toLowerCase() === playerName.trim().toLowerCase())
  ));

  const myCloudItem = combinedList.find(m =>
    (userId && m.id === userId) ||
    (playerName && m.name && m.name.trim().toLowerCase() === playerName.trim().toLowerCase())
  );
  const myDisplayTotalScore = Math.max(myCloudItem?.score || 0, currentTotalScore || 0);

  const [activeTab, setActiveTab] = useState('ranks');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName || '');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState('სერგო წივწივაძე');
  const [copiedCode, setCopiedCode] = useState(null);
  
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdownState, setCountdownState] = useState({ isUnlocked: false, timeLeftText: '', monthName: '' });

  const currentDrawMonthKey = getCurrentDrawMonthKey();
  const [hasAlreadySpun, setHasAlreadySpun] = useState(() => {
    try {
      if (localStorage.getItem(`dancing_bricks_spun_${currentDrawMonthKey}`) === 'true') return true;
      const raw = localStorage.getItem('dancing_bricks_my_prizes');
      const list = raw ? JSON.parse(raw) : [];
      return list.some(v => v.drawMonth === currentDrawMonthKey);
    } catch (e) { return false; }
  });

  useEffect(() => {
    const handleDrawSpun = (e) => {
      if (e?.detail?.drawMonth === currentDrawMonthKey) {
        setHasAlreadySpun(true);
      }
    };
    window.addEventListener('dancing_bricks_draw_spun', handleDrawSpun);
    return () => window.removeEventListener('dancing_bricks_draw_spun', handleDrawSpun);
  }, [currentDrawMonthKey]);

  const [cloudWinnersHistory, setCloudWinnersHistory] = useState([]);

  useEffect(() => {
    fetchCloudWinnersHistory().then(hist => {
      if (Array.isArray(hist) && hist.length > 0) {
        setCloudWinnersHistory(hist);
      }
    });

    const handleDrawSpunHistory = () => {
      fetchCloudWinnersHistory().then(hist => {
        if (Array.isArray(hist) && hist.length > 0) {
          setCloudWinnersHistory(hist);
        }
      });
    };
    window.addEventListener('dancing_bricks_draw_spun', handleDrawSpunHistory);
    window.addEventListener('dancing_bricks_delivery_updated', handleDrawSpunHistory);
    return () => {
      window.removeEventListener('dancing_bricks_draw_spun', handleDrawSpunHistory);
      window.removeEventListener('dancing_bricks_delivery_updated', handleDrawSpunHistory);
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const georgiaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (4 * 3600000));
      
      let targetYear = georgiaTime.getFullYear();
      let targetMonth = georgiaTime.getMonth();
      
      // Monthly draw is on the 20th at 22:00 Georgia Time
      const thisMonthDraw = new Date(targetYear, targetMonth, 20, 22, 0, 0);

      if (georgiaTime.getTime() >= thisMonthDraw.getTime()) {
        // This month's 20th 22:00 draw has already occurred; target is the 20th of NEXT month!
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = 0;
          targetYear += 1;
        }
      }

      const targetDate = new Date(targetYear, targetMonth, 20, 22, 0, 0);
      const diff = Math.max(0, targetDate.getTime() - georgiaTime.getTime());

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      let timeLeftText = `${d}დ ${h}სთ ${m}წთ ${s}წმ`;
      if (lang === 'en') {
        timeLeftText = `${d}d ${h}h ${m}m ${s}s`;
      } else if (lang === 'ru') {
        timeLeftText = `${d}д ${h}ч ${m}мин ${s}сек`;
      }

      let drawName = drawNamesKa[targetMonth];
      if (lang === 'en') drawName = drawNamesEn[targetMonth];
      else if (lang === 'ru') drawName = drawNamesRu[targetMonth];

      setCountdownState({ isUnlocked: false, timeLeftText, monthName: drawName, drawName });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const [updatingDeliveryMonth, setUpdatingDeliveryMonth] = useState(null);

  const isUserAdmin = Boolean(
    (typeof localStorage !== 'undefined' && localStorage.getItem('dancing_bricks_is_admin') === 'true') ||
    userId === '99999' ||
    userId === 'TG-stdancestudio' ||
    String(userId || '').toLowerCase() === 'tg-stdancestudio'
  );

  const handleToggleDelivery = async (monthKey, targetStatus) => {
    setUpdatingDeliveryMonth(monthKey);
    const ok = await updateWinnerPrizeDeliveryStatus(monthKey, targetStatus);
    if (ok) {
      const updated = await fetchCloudWinnersHistory();
      if (Array.isArray(updated) && updated.length > 0) {
        setCloudWinnersHistory(updated);
      }
      window.dispatchEvent(new CustomEvent('dancing_bricks_delivery_updated', { detail: { monthKey, delivered: targetStatus } }));
    }
    setUpdatingDeliveryMonth(null);
  };

  const [isResettingSeason, setIsResettingSeason] = useState(false);

  const handleAdminStartNewSeason = async () => {
    if (!window.confirm("🚀 ნამდვილად გსურთ ახალი სეზონის დაწყება?\n\nCloud ბაზაში ყველა მოთამაშის ქულა განულდება 0-მდე და დაიწყება ახალი თვის გათამაშება!\nწინა თვის გამარჯვებული დაცულია ისტორიაში.")) {
      return;
    }
    setIsResettingSeason(true);
    const res = await startNewSeasonInCloud();
    setIsResettingSeason(false);
    if (res.success) {
      alert("✅ ახალი სეზონი წარმატებით დაიწყო! ყველა მოთამაშის ქულა განულდა Cloud ბაზაში.");
      fetchCloudLeaderboard().then(list => {
        if (Array.isArray(list)) setCloudList(list);
      });
    } else {
      alert("❌ შეცდომა სეზონის განულებისას: " + (res.error || "უცნობი შეცდომა"));
    }
  };

  const [claimedPrizesMap, setClaimedPrizesMap] = useState(() => {
    try {
      const raw = localStorage.getItem('dancing_bricks_claimed_prizes');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  const [myVouchers, setMyVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('dancing_bricks_my_prizes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  // Real-time synchronization when Admin toggles prize claim
  useEffect(() => {
    const handleSyncClaimedPrizes = () => {
      try {
        const raw = localStorage.getItem('dancing_bricks_claimed_prizes');
        if (raw) setClaimedPrizesMap(JSON.parse(raw));
      } catch (e) {}

      try {
        const saved = localStorage.getItem('dancing_bricks_my_prizes');
        if (saved) setMyVouchers(JSON.parse(saved));
      } catch (e) {}
    };

    window.addEventListener('storage', handleSyncClaimedPrizes);
    window.addEventListener('dancing_bricks_claim_updated', handleSyncClaimedPrizes);
    return () => {
      window.removeEventListener('storage', handleSyncClaimedPrizes);
      window.removeEventListener('dancing_bricks_claim_updated', handleSyncClaimedPrizes);
    };
  }, []);

  const [studioData, setStudioData] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [aliasStudentId, setAliasStudentId] = useState('');
  const [isSavingAlias, setIsSavingAlias] = useState(false);
  const [aliasSavedToast, setAliasSavedToast] = useState(false);

  useEffect(() => {
    fetchStudioData().then(d => {
      if (d) setStudioData(d);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      setAliasInput(selectedPlayer.aliasNote || '');
      setAliasStudentId(selectedPlayer.linkedStudentId || '');
      setAliasSavedToast(false);
      setCopiedId(false);
    }
  }, [selectedPlayer]);

  const selectedPlayerStudent = useMemo(() => {
    if (!selectedPlayer || !studioData?.students) return null;
    return matchStudentForPlayer(selectedPlayer, studioData.students);
  }, [selectedPlayer, studioData]);

  const selectedPlayerSub = useMemo(() => {
    if (!selectedPlayerStudent || !studioData?.subscriptions) return null;
    try {
      return getStudentSubscription(studioData.subscriptions, selectedPlayerStudent.id);
    } catch (e) {
      return null;
    }
  }, [selectedPlayerStudent, studioData]);

  const handleSaveAlias = async () => {
    if (!selectedPlayer?.id) return;
    setIsSavingAlias(true);
    try {
      const success = await saveCloudPlayerAlias(selectedPlayer.id, {
        note: aliasInput.trim(),
        studentId: aliasStudentId || selectedPlayerStudent?.id || '',
        customName: selectedPlayer.customName || ''
      });
      if (success) {
        setAliasSavedToast(true);
        setTimeout(() => setAliasSavedToast(false), 2500);

        setCloudList(prev => prev.map(p => {
          if (p.id === selectedPlayer.id) {
            return {
              ...p,
              aliasNote: aliasInput.trim(),
              linkedStudentId: aliasStudentId || selectedPlayerStudent?.id || ''
            };
          }
          return p;
        }));

        setSelectedPlayer(prev => prev ? ({
          ...prev,
          aliasNote: aliasInput.trim(),
          linkedStudentId: aliasStudentId || selectedPlayerStudent?.id || ''
        }) : null);
      }
    } catch (err) {
      console.error('Error saving alias:', err);
    } finally {
      setIsSavingAlias(false);
    }
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      setShowNameModal(false);
    }
  };

  const openSpinForWinner = (name) => {
    const currentWinner = rankedList.find(item => item.rank === 1);
    const isUserFirstPlace = currentWinner && (
      (userId && currentWinner.id === userId) ||
      (playerName && currentWinner.name && currentWinner.name.trim().toLowerCase() === playerName.trim().toLowerCase())
    );

    const isAdminUser = localStorage.getItem('dancing_bricks_is_admin') === 'true' ||
      userId === '99999' || userId === 'TG-stdancestudio';

    if (!isUserFirstPlace && !isAdminUser) {
      alert(lang === 'ka' ? 'მხოლოდ 1-ელ ადგილზე გასულ მოთამაშეს შეუძლია პრიზის დატრიალება!' : lang === 'ru' ? 'Только игрок на 1-м месте может вращать колесо!' : 'Only the 1st place winner can spin the wheel!');
      return;
    }

    if (hasAlreadySpun && !isAdminUser) {
      alert(lang === 'ka' ? 'თქვენ უკვე დაატრიალეთ ამ თვის პრიზი! თქვენი ვაუჩერი ინახება "საჩუქრების" განყოფილებაში.' : 'You have already spun this month\'s prize! Your voucher is saved in the Prizes tab.');
      setActiveTab('my_prizes');
      return;
    }

    if (countdownState.isUnlocked || isAdminUser) {
      setSelectedWinner(currentWinner ? currentWinner.name : (name || playerName));
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

  // Merge cloud-sourced wins into My Prizes so winner sees their code
  // even if they never spun the wheel on their device / localStorage was cleared
  const allMyVouchers = useMemo(() => {
    const cloudWins = (cloudWinnersHistory || []).filter(h => {
      if (!h.code) return false;
      const isWinner = (userId && (h.winnerId === userId || h.id === userId)) ||
        (playerName && h.winner && h.winner.trim().toLowerCase() === playerName.trim().toLowerCase());
      return isWinner;
    }).map(h => ({
      id: `cloud-${h.monthKey || h.month}`,
      code: h.code,
      prizeName: h.prize || '',
      prizeDesc: '',
      prizeImg: h.prizeImg || (PRIZES.find(p => p.name === h.prize || p.nameEn === h.prize)?.img || ''),
      winnerName: h.winner || playerName || '',
      drawMonth: h.monthKey || '',
      date: h.date || h.month || ''
    }));

    // Merge: local vouchers take priority (dedup by monthKey / id)
    const localMonthKeys = new Set(myVouchers.map(v => v.drawMonth).filter(Boolean));
    const newCloudWins = cloudWins.filter(cv => !localMonthKeys.has(cv.drawMonth));
    return [...myVouchers, ...newCloudWins];
  }, [myVouchers, cloudWinnersHistory, userId, playerName]);

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="leaderboard-container glass animate-in">
      <div className="lb-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
        <div className="lb-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
          <Trophy size={18} color="#d4a64a" style={{ flexShrink: 0 }} />
          <h2 style={{ fontSize: '14px', margin: 0, fontWeight: '900', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: '#F0D9A8', fontWeight: '900', letterSpacing: '0.2px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="#d4a64a" />
            {countdownState.timeLeftText || '00:00:00'}
          </span>
          <span style={{ fontSize: '9.5px', color: '#a1a1aa', fontWeight: '700', marginTop: '2px', whiteSpace: 'nowrap' }}>
            {lang === 'ka' ? `${countdownState.drawName || '20 ოქტომბრის'} გათამაშება` : lang === 'ru' ? `Розыгрыш ${countdownState.drawName || '20 Октября'}` : `${countdownState.drawName || 'Oct 20th'} Draw`}
          </span>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div style={{ display: 'flex', gap: '4px', margin: '12px 0 16px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
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
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            padding: '0 4px'
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
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            padding: '0 4px'
          }}
        >
          <Ticket size={14} /> {t.myPrizesTab(myVouchers.filter(v => !(claimedPrizesMap[userId] || claimedPrizesMap[playerName] || claimedPrizesMap[v.winnerName] || claimedPrizesMap[v.id] || v.isClaimed)).length)}
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
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            padding: '0 4px'
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
              <strong style={{ color: '#d4a64a' }}>{(myDisplayTotalScore || 0).toLocaleString()}</strong>
            </div>
          </div>

          <div className="lb-list">
            {rankedList.map((item) => {
              const isWinner = item.rank === 1;
              const isTg = String(item.id || '').startsWith('TG-') || item.username || String(item.name || '').startsWith('@');
              const matchedStudent = matchStudentForPlayer(item, studioData?.students);

              return (
                <div
                  key={item.id}
                  className={`lb-row ${item.name === playerName ? 'is-me' : ''}`}
                  onClick={() => setSelectedPlayer(item)}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    ...(isWinner ? {
                      background: 'rgba(212, 166, 74, 0.07)',
                      border: '1px solid rgba(212, 166, 74, 0.35)',
                      borderRadius: '14px',
                      position: 'relative'
                    } : {})
                  }}
                  title="დააჭირეთ მოთამაშის პროფილის & აქაუნთის სანახავად"
                >
                  <div className="lb-rank" style={{ color: isWinner ? '#d4a64a' : item.rank === 2 ? '#6fc3e0' : item.rank === 3 ? '#b87bde' : '#a1a1aa', fontWeight: isWinner ? '900' : '700' }}>
                    #{item.rank}
                  </div>

                  <div className="lb-avatar" style={{ background: item.avatarBg, overflow: 'visible', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isWinner && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '2px',
                        transform: 'rotate(-14deg)',
                        zIndex: 10,
                        pointerEvents: 'none'
                      }}>
                        <Crown size={20} color="#FFD700" fill="#FFD700" />
                      </div>
                    )}
                    <AvatarImage src={item.photoUrl} alt={item.name} fallbackChar={item.name ? item.name.charAt(0) : 'D'} />
                  </div>

                  <div className="lb-user-info" style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      <span className="lb-name" style={{ color: isWinner ? '#F0D9A8' : 'white', fontWeight: isWinner ? '900' : '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.customName || item.name || 'Dancer'}
                      </span>
                      {isTg && (
                        <button
                          type="button"
                          className="lb-tg-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTelegramAccount(item);
                          }}
                          title="Telegram პროფილი / ჩატი"
                        >
                          <Send size={10} /> TG
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="lb-badge">ID: {item.id}</span>
                      {item.aliasNote && (
                        <span style={{ fontSize: '9.5px', color: '#d4a64a', fontWeight: '800', background: 'rgba(212,166,74,0.12)', border: '1px solid rgba(212,166,74,0.25)', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          📝 {item.aliasNote}
                        </span>
                      )}
                      {!item.aliasNote && matchedStudent && (
                        <span style={{ fontSize: '9.5px', color: '#6fc3e0', fontWeight: '800', background: 'rgba(111,195,224,0.12)', border: '1px solid rgba(111,195,224,0.25)', padding: '1px 5px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                          🎓 {getStudentName(matchedStudent)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lb-score-col" style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="lb-score" style={{ color: isWinner ? '#d4a64a' : 'white', fontWeight: '900' }}>
                      {(item.score || 0).toLocaleString()} {t.pts}
                    </span>
                    {isWinner ? (
                      (isUserFirstPlace || (localStorage.getItem('dancing_bricks_is_admin') === 'true' || userId === '99999' || userId === 'TG-stdancestudio')) ? (
                        countdownState.isUnlocked ? (
                          hasAlreadySpun ? (
                            <button
                              onClick={() => setActiveTab('my_prizes')}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '8px',
                                background: 'rgba(34,197,94,0.18)',
                                border: '1px solid rgba(34,197,94,0.4)',
                                color: '#4ADE80',
                                fontWeight: '900',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                whiteSpace: 'nowrap'
                              }}
                              title="პრიზი მიღებულია! იხილეთ ვაუჩერი"
                            >
                              <Check size={13} color="#22c55e" />
                              {lang === 'ka' ? 'ვაუჩერი' : lang === 'ru' ? 'Ваучер' : 'Voucher'}
                            </button>
                          ) : (
                            <button
                              onClick={() => openSpinForWinner(item.name)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #d4a64a 0%, #22c55e 100%)',
                                border: 'none',
                                color: '#05060a',
                                fontWeight: '900',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 3px 10px rgba(34, 197, 94, 0.45)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Trophy size={13} color="#05060a" />
                              {lang === 'ka' ? 'დაატრიალე' : lang === 'ru' ? 'Колесо' : 'Spin Wheel'}
                            </button>
                          )
                        ) : (
                          <span style={{ fontSize: '10.5px', color: '#F0D9A8', background: 'rgba(212,166,74,0.12)', border: '1px solid rgba(212,166,74,0.3)', padding: '2.5px 8px', borderRadius: '8px', fontWeight: '800', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            {t.prizeSpot}
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '10.5px', color: '#FFD700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', padding: '2.5px 8px', borderRadius: '8px', fontWeight: '800', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          👑 {lang === 'ka' ? 'გამარჯვებული' : lang === 'ru' ? 'Лидер' : 'Leader'}
                        </span>
                      )
                    ) : (
                      <span className="lb-games">{item.games || 0} {t.games}</span>
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
          {allMyVouchers.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', background: 'rgba(212,166,74,0.08)', borderRadius: '16px', border: '1px solid rgba(212,166,74,0.25)' }}>
              <Gift size={36} color="#d4a64a" style={{ margin: '0 auto 10px' }} />
              {isUserFirstPlace ? (
                <>
                  <h4 style={{ color: '#F0D9A8', fontSize: '15px', fontWeight: '900', margin: '0 0 6px' }}>
                    {lang === 'ka' ? 'შენი პრიზი ელოდება დატრიალებას!' : 'Your Prize is Waiting to be Spun!'}
                  </h4>
                  <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0 0 16px', lineHeight: '1.4' }}>
                    {lang === 'ka' ? 'გილოცავთ! თქვენ დაიკავეთ #1 ადგილი და შეგიძლიათ დაატრიალოთ ST Dance-ის პრიზი!' : 'Congratulations! You secured #1 place and can spin for your prize!'}
                  </p>
                  {countdownState.isUnlocked ? (
                    !hasAlreadySpun ? (
                      <button
                        onClick={() => openSpinForWinner(playerName)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #d4a64a 0%, #22c55e 100%)',
                          border: 'none',
                          color: '#05060a',
                          fontWeight: '900',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
                        }}
                      >
                        <Trophy size={16} color="#05060a" />
                        {lang === 'ka' ? 'დაატრიალე პრიზი' : 'Spin Wheel Now'}
                      </button>
                    ) : (
                      <span style={{ color: '#4ADE80', fontSize: '13px', fontWeight: '800' }}>
                        ✅ {lang === 'ka' ? 'თქვენ უკვე მიიღეთ ამ თვის პრიზი!' : 'Prize already collected!'}
                      </span>
                    )
                  ) : (
                    <p style={{ color: '#F0D9A8', fontSize: '13px', fontWeight: '800' }}>
                      ⏳ {lang === 'ka' ? 'გათამაშება გაიხსნება 22:00 საათზე!' : 'Draw opens at 22:00!'}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h4 style={{ color: '#F0D9A8', fontSize: '15px', fontWeight: '900', margin: '0 0 6px' }}>
                    {lang === 'ka' ? 'მოიგე ST Dance-ის პრიზები!' : 'Win ST Dance Prizes!'}
                  </h4>
                  <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '0', lineHeight: '1.4' }}>
                    {t.emptyVouchers}
                  </p>
                </>
              )}
            </div>
          ) : (
            allMyVouchers.map((v) => (
              <div
                key={v.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(212,166,74,0.14) 0%, rgba(20,20,25,0.92) 100%)',
                  border: '1.5px solid rgba(212,166,74,0.4)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Top Title & Status Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#F0D9A8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.prizeName}
                  </h4>
                  {claimedPrizesMap[userId] || claimedPrizesMap[playerName] || claimedPrizesMap[v.winnerName] || claimedPrizesMap[v.id] ? (
                    <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.22)', color: '#4ADE80', border: '1px solid #22c55e', padding: '3px 8px', borderRadius: '8px', fontWeight: '900', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      ✅ {lang === 'ka' ? 'გაცემულია' : 'Delivered'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', background: 'rgba(212,166,74,0.18)', color: '#F0D9A8', border: '1px solid rgba(212,166,74,0.4)', padding: '3px 8px', borderRadius: '8px', fontWeight: '800', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      🎁 {t.activeBadge}
                    </span>
                  )}
                </div>

                {/* Middle Info Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '70px', height: '54px', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', flexShrink: 0, border: '1.5px solid #d4a64a', padding: '2px' }}>
                    <img src={v.prizeImg} alt={v.prizeName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '13px', color: 'white', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      👤 {v.winnerName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                      📅 {lang === 'ka' ? 'თარიღი:' : 'Date:'} {v.date}
                    </div>
                  </div>
                </div>

                {/* Bottom Code & Copy Button Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(212,166,74,0.25)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '900', color: '#d4a64a', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Ticket size={15} color="#d4a64a" /> {v.code}
                  </div>
                  <button
                    onClick={() => copyVoucherCode(v.code)}
                    style={{
                      background: copiedCode === v.code ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
                      border: copiedCode === v.code ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.15)',
                      color: copiedCode === v.code ? '#4ADE80' : '#e4e4e7',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
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

      {activeTab === 'history' && (() => {
        let historyList = [];
        if (cloudWinnersHistory && cloudWinnersHistory.length > 0) {
          historyList = [...cloudWinnersHistory];
        } else {
          try {
            const raw = localStorage.getItem('dancing_bricks_winners_history');
            const customHist = raw ? JSON.parse(raw) : [];
            if (Array.isArray(customHist)) {
              historyList = [...customHist];
            }
          } catch (e) {}
        }

        if (historyList.length === 0) {
          return (
            <div style={{ padding: '36px 16px', textAlign: 'center', background: 'rgba(212,166,74,0.06)', borderRadius: '16px', border: '1px solid rgba(212,166,74,0.2)' }}>
              <History size={40} color="#d4a64a" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: '#F0D9A8', fontSize: '15px', fontWeight: '900', margin: '0 0 6px' }}>
                {lang === 'ka' ? 'გათამაშების ისტორია' : 'Draw History'}
              </h4>
              <p style={{ color: '#a1a1aa', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>
                {lang === 'ka' 
                  ? 'დღეს, 20 სექტემბერს 22:00 საათზე გაიმართება პირველი ოფიციალური გათამაშება! #1 გამარჯვებული და მოგებული პრიზი გამოჩნდება აქ.' 
                  : 'The first official monthly draw is today, Sept 20 at 22:00! The winner and their prize will appear here.'}
              </p>
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {historyList.map((h, idx) => {
              const isDelivered = Boolean(h.delivered);
              const mKey = h.monthKey || '2026-09';
              const isUpdatingThis = updatingDeliveryMonth === mKey || updatingDeliveryMonth === h.code;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    gap: '10px'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700' }}>{h.month}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.winner}</div>
                    <div style={{ fontSize: '12px', color: '#d4a64a', fontWeight: '800' }}>
                      {t.prizeLbl}{getLocalizedPrizeName(h.prize, lang)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '11px',
                      color: isDelivered ? '#4ADE80' : '#FBBF24',
                      fontWeight: '800',
                      background: isDelivered ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                      border: isDelivered ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(245,158,11,0.35)',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      {isDelivered ? `✅ ${t.deliveredBadge}` : `⏳ ${t.pendingBadge}`}
                    </span>

                    {/* Admin Direct Action Button */}
                    {isUserAdmin && (
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => handleToggleDelivery(mKey, !isDelivered)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isDelivered ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                          border: isDelivered ? '1px solid rgba(255,255,255,0.15)' : 'none',
                          color: isDelivered ? '#a1a1aa' : '#ffffff',
                          fontSize: '10px',
                          fontWeight: '900',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap',
                          boxShadow: isDelivered ? 'none' : '0 2px 6px rgba(34,197,94,0.3)'
                        }}
                        title={isDelivered ? 'მოლოდინში დაბრუნება' : 'მონიშნე გადაცემულად'}
                      >
                        {isUpdatingThis ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : isDelivered ? (
                          <>↩ {t.markPendingBtn}</>
                        ) : (
                          <>🎁 {t.markDeliveredBtn}</>
                        )}
                      </button>
                    )}

                    {(() => {
                      const canSeeCode = isUserAdmin || Boolean(
                        (userId && (h.winnerId === userId || h.id === userId)) ||
                        (playerName && h.winner && h.winner.trim().toLowerCase() === playerName.trim().toLowerCase())
                      );
                      if (!canSeeCode || !h.code) return null;
                      return (
                        <div style={{ fontSize: '10px', color: '#71717a', marginTop: '1px', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Ticket size={10} /> {h.code}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <SpinModal
        isOpen={showSpinModal}
        onClose={() => setShowSpinModal(false)}
        winnerName={selectedWinner}
        onClaimPrize={handleClaimPrize}
        userId={userId || 'GUEST'}
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

      {/* Player Account & Profile Modal */}
      {selectedPlayer && createPortal(
        <div
          className="modal-overlay"
          style={{
            zIndex: 99999,
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 6, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="modal-content glass animate-in"
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '24px 20px',
              textAlign: 'left',
              position: 'relative',
              boxSizing: 'border-box',
              background: '#0d1017',
              border: '1.5px solid rgba(212, 166, 74, 0.4)',
              borderRadius: '20px',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#a1a1aa',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* Header: Avatar, Name, Rank, ID */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: selectedPlayer.avatarBg || '#d4a64a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                {selectedPlayer.rank === 1 && (
                  <Crown size={20} color="#FFD700" fill="#FFD700" style={{ position: 'absolute', top: '-13px', left: '-2px', transform: 'rotate(-15deg)' }} />
                )}
                <AvatarImage src={selectedPlayer.photoUrl} alt={selectedPlayer.name} fallbackChar={selectedPlayer.name ? selectedPlayer.name.charAt(0) : 'D'} />
              </div>
              <div style={{ minWidth: 0, flex: 1, paddingRight: '24px' }}>
                <div style={{ fontSize: '17px', fontWeight: '900', color: '#F0D9A8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedPlayer.customName || selectedPlayer.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: selectedPlayer.rank === 1 ? '#FFD700' : '#4ADE80', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                    #{selectedPlayer.rank} {t.seasonRankLbl}
                  </span>
                  <button
                    onClick={() => {
                      try { navigator.clipboard?.writeText(String(selectedPlayer.id)); } catch (e) {}
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: 0 }}
                    title="ID კოპირება"
                  >
                    ID: {selectedPlayer.id} {copiedId ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Telegram Account Link Action */}
            {(String(selectedPlayer.id).startsWith('TG-') || selectedPlayer.username || String(selectedPlayer.name).startsWith('@')) && (
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Send size={14} /> {t.accountTypeTg}
                  </span>
                  {selectedPlayer.username && (
                    <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: '700' }}>
                      @{selectedPlayer.username.replace('@', '')}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => openTelegramAccount(selectedPlayer)}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)'
                  }}
                >
                  <Send size={15} /> {t.openTelegramBtn}
                </button>
              </div>
            )}

            {/* ClassCore Matched Student Card */}
            {selectedPlayerStudent && (
              <div style={{ background: 'rgba(212, 166, 74, 0.09)', border: '1px solid rgba(212, 166, 74, 0.35)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#F0D9A8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={15} color="#d4a64a" /> {t.studentCardTitle}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>
                  {getStudentName(selectedPlayerStudent)}
                </div>
                {selectedPlayerStudent.data?.parent_name && (
                  <div style={{ fontSize: '11.5px', color: '#d4d4d8' }}>
                    <span style={{ color: '#a1a1aa' }}>{t.parentLbl}</span> {selectedPlayerStudent.data.parent_name}
                  </div>
                )}
                {selectedPlayerStudent.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#d4d4d8', fontWeight: '700' }}>
                      📞 {selectedPlayerStudent.phone}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={`tel:${selectedPlayerStudent.phone}`}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#4ADE80', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <Phone size={11} /> {t.callBtn}
                      </a>
                      <a
                        href={`https://wa.me/${selectedPlayerStudent.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <MessageCircle size={11} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
                {selectedPlayerSub && (
                  <div style={{ fontSize: '11.5px', color: '#d4a64a', background: 'rgba(212,166,74,0.08)', padding: '6px 10px', borderRadius: '8px', fontWeight: '700' }}>
                    🎫 {t.subLbl} {selectedPlayerSub.remaining}/{selectedPlayerSub.total} {t.lessonsLeft}
                  </div>
                )}
                <button
                  onClick={() => {
                    savePortalSession(selectedPlayerStudent.id);
                    window.open('/portal/dashboard', '_blank');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #d4a64a 0%, #f59e0b 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#05060a',
                    fontWeight: '900',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  <ExternalLink size={14} /> {t.openPortalBtn}
                </button>
              </div>
            )}

            {/* Game Stats Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.seasonScoreLbl}</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#F0D9A8', marginTop: '2px' }}>
                  {(selectedPlayer.score || 0).toLocaleString()} {t.pts}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '700' }}>{t.gamesLbl}</div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#4ADE80', marginTop: '2px' }}>
                  {selectedPlayer.games || 0} {t.games}
                </div>
              </div>
            </div>

            {/* Studio Note / Recognition Field */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase' }}>
                {t.studioNoteLbl}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder={t.studioNotePlaceholder}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: 'white',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSaveAlias}
                  disabled={isSavingAlias}
                  style={{
                    background: '#22c55e',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    color: '#05060a',
                    fontWeight: '900',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isSavingAlias ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {aliasSavedToast ? t.savedNoteSuccess : t.saveNoteBtn}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
