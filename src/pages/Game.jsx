import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Trophy, HelpCircle, Share2, Heart, Clock, Sparkles, Award, UserCheck, IdCard, Globe, Gift, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import GameBoard from '../components/game/GameBoard';
import QuizModal from '../components/game/QuizModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SocialShareModal from '../components/game/SocialShareModal';
import Leaderboard from '../components/game/Leaderboard';
import PrizesPage from '../components/game/PrizesPage';
import LoginModal from '../components/game/LoginModal';
import { syncCloudScore } from '../data/classcore';
import { loadLivesData, saveLivesData, calculateAvailableLives, formatTimeUntilReset, getGeorgiaResetTime } from '../utils/livesManager';
import './Game.css';

export const gameTranslations = {
  ka: {
    fastForward: 'დაჩქარება',
    superBall: 'სუპერ ბურთი!',
    extraBalls: '+3 ბურთი!',
    round: 'რაუნდი',
    speed: 'სიჩქარე',
    balls: 'ბურთები',
    score: 'ქულა',
    startGame: 'დაწყება',
    playAgain: 'ხელახლა დაწყება',
    subtitle: 'ითამაშე და მოიგე ST Dance-ის მერჩის პრიზები',
    gameOver: 'GAME OVER',
    finalScore: 'საბოლოო ქულა',
    loginBtn: 'ID შესვლა',
    studentIdLabel: 'მოსწავლის ID',
    noLives: 'სიცოცხლე ამოიწურა!',
    quizBonus: '+1',
    shareBonus: '+1',
    tabs: {
      game: 'თამაში',
      quiz: '+1',
      share: '+1',
      ranks: 'რეიტინგი',
      prizes: 'პრიზები',
      rules: 'წესები'
    }
  },
  en: {
    fastForward: 'FAST FORWARD',
    superBall: 'SUPER BALL!',
    extraBalls: '+3 EXTRA BALLS!',
    round: 'ROUND',
    speed: 'SPEED',
    balls: 'BALLS',
    score: 'SCORE',
    startGame: 'START GAME',
    playAgain: 'PLAY AGAIN',
    subtitle: 'Play and win official ST Dance merch prizes!',
    gameOver: 'GAME OVER',
    finalScore: 'FINAL SCORE',
    loginBtn: 'ID LOGIN',
    studentIdLabel: 'Student ID',
    noLives: 'Out of lives!',
    quizBonus: '+1',
    shareBonus: '+1',
    tabs: {
      game: 'Game',
      quiz: '+1',
      share: '+1',
      ranks: 'Ranks',
      prizes: 'Prizes',
      rules: 'Rules'
    }
  },
  ru: {
    fastForward: 'УСКОРЕНИЕ',
    superBall: 'СУПЕР МЯЧ!',
    extraBalls: '+3 МЯЧА!',
    round: 'РАУНД',
    speed: 'СКОРОСТЬ',
    balls: 'МЯЧИ',
    score: 'СЧЕТ',
    startGame: 'НАЧАТЬ ИГРУ',
    playAgain: 'ИГРАТЬ СНОВА',
    subtitle: 'Играйте и выигрывайте мерч-призы ST Dance!',
    gameOver: 'ИГРА ОКОНЧЕНА',
    finalScore: 'ИТОГОВЫЙ СЧЕТ',
    loginBtn: 'ID ВХОД',
    studentIdLabel: 'ID Ученика',
    noLives: 'Жизни закончились!',
    quizBonus: '+1',
    shareBonus: '+1',
    tabs: {
      game: 'Игра',
      quiz: '+1',
      share: '+1',
      ranks: 'Рейтинг',
      rules: 'Правила'
    }
  }
};

export default function Game() {
  const [searchParams] = useSearchParams();
  const { lang: contextLang } = useLanguage();
  const langParam = searchParams.get('lang');
  const lang = ['ka', 'en', 'ru'].includes(langParam) ? langParam : (contextLang || 'ka');
  const tGame = gameTranslations[lang] || gameTranslations.ka;

  const [activeTab, setActiveTab] = useState('play');

  const [livesData, setLivesData] = useState(() => {
    return loadLivesData();
  });

  const [countdown, setCountdown] = useState('');

  const [userProfile, setUserProfile] = useState(() => loadSavedUserProfile());

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const isTestAccount =
    userProfile?.studentId === '99999' ||
    userProfile?.studentId === 'TG-stdancestudio' ||
    (tgUser?.username && tgUser.username.toLowerCase() === 'stdancestudio') ||
    (userProfile?.username && userProfile.username.toLowerCase() === 'stdancestudio');

  const availableLives = isTestAccount ? 999 : calculateAvailableLives(livesData);

  useEffect(() => {
    document.body.classList.add('page-game-active');
    if (activeTab === 'play') {
      document.body.classList.add('game-tab-play');
    } else {
      document.body.classList.remove('game-tab-play');
    }
    return () => {
      document.body.classList.remove('page-game-active');
      document.body.classList.remove('game-tab-play');
    };
  }, [activeTab]);

  // Telegram Web App Auto-Login
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const twa = window.Telegram.WebApp;
      twa.ready();
      twa.expand();
      try {
        if (twa.setHeaderColor) twa.setHeaderColor('#05060a');
        if (twa.setBackgroundColor) twa.setBackgroundColor('#05060a');
      } catch (e) {}

      if (typeof twa.disableVerticalSwipes === 'function') {
        twa.disableVerticalSwipes();
      }

      const tgUserObj = twa.initDataUnsafe?.user;
      if (tgUserObj) {
        const tgUserId = `TG-${tgUserObj.id}`;
        const savedCustomName = localStorage.getItem(`dancing_bricks_custom_name_${tgUserId}`);
        const fullName = savedCustomName || [tgUserObj.first_name, tgUserObj.last_name].filter(Boolean).join(' ') || tgUserObj.username || 'Dancer';
        
        setUserProfile(prev => {
          const freshSaved = loadSavedUserProfile();
          const updated = sanitizeSeasonalProfile({
            ...freshSaved,
            ...prev,
            studentId: tgUserId,
            name: fullName,
            username: tgUserObj.username || '',
            photoUrl: tgUserObj.photo_url || prev.photoUrl || freshSaved.photoUrl || '',
            isLoggedIn: true,
            isTelegram: true,
            highScore: Math.max(freshSaved.highScore || 0, prev.highScore || 0, 0),
            totalScore: Math.max(freshSaved.totalScore || 0, prev.totalScore || 0, 0),
            totalGames: Math.max(freshSaved.totalGames || 0, prev.totalGames || 0, 0),
            monthlyHighScore: Math.max(freshSaved.monthlyHighScore || 0, prev.monthlyHighScore || 0, 0),
            monthlyTotalScore: Math.max(freshSaved.monthlyTotalScore || 0, prev.monthlyTotalScore || 0, 0),
            monthlyGames: Math.max(freshSaved.monthlyGames || 0, prev.monthlyGames || 0, 0)
          });
          localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
          localStorage.setItem('dancing_bricks_player_name', updated.name);
          return updated;
        });

        // Sync with cloud leaderboard to pull user's cloud score if present
        fetchCloudLeaderboard().then(cloudData => {
          if (cloudData && cloudData.length > 0) {
            const found = cloudData.find(item => item.id === tgUserId);
            if (found) {
              setUserProfile(curr => {
                const merged = sanitizeSeasonalProfile({
                  ...curr,
                  highScore: Math.max(curr.highScore || 0, found.high_score || found.score || 0),
                  totalScore: Math.max(curr.totalScore || 0, found.total_score || found.score || 0),
                  totalGames: Math.max(curr.totalGames || 0, found.total_games || found.games || 0),
                  monthlyHighScore: Math.max(curr.monthlyHighScore || 0, found.score || 0),
                  monthlyTotalScore: Math.max(curr.monthlyTotalScore || 0, found.score || 0),
                  monthlyGames: Math.max(curr.monthlyGames || 0, found.games || 0)
                });
                localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }).catch(() => {});
      }
    }
  }, []);

  // Reload user-scoped lives when studentId becomes available
  useEffect(() => {
    if (userProfile?.studentId) {
      setLivesData(loadLivesData(userProfile.studentId));
    }
  }, [userProfile.studentId]);

  // Automatically sync current user score & profile to Supabase Cloud on load/change
  useEffect(() => {
    if (userProfile?.studentId && (userProfile.studentId.startsWith('TG-') || userProfile.studentId.startsWith('ST-'))) {
      syncCloudScore({
        id: userProfile.studentId,
        name: userProfile.name,
        photoUrl: userProfile.photoUrl || '',
        score: userProfile.totalScore || userProfile.highScore || 0,
        games: userProfile.totalGames || 0
      }).catch(() => {});
    }
  }, [userProfile.studentId, userProfile.name, userProfile.photoUrl, userProfile.highScore, userProfile.totalGames, userProfile.totalScore]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const georgiaTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (4 * 3600000));
      const h = georgiaTime.getHours().toString().padStart(2, '0');
      const m = georgiaTime.getMinutes().toString().padStart(2, '0');
      const s = georgiaTime.getSeconds().toString().padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSpendLife = () => {
    if (isTestAccount) return;
    if (availableLives <= 0) return;
    setLivesData(prev => {
      const updated = { ...prev, usedLives: Math.min(prev.baseLives || 3, prev.usedLives + 1) };
      return saveLivesData(updated, userProfile?.studentId);
    });
  };

  const handleScoreUpdate = (score) => {
    setUserProfile(prev => {
      const sanitized = sanitizeSeasonalProfile(prev);
      const updated = {
        ...sanitized,
        highScore: Math.max(sanitized.highScore || 0, score),
        monthlyHighScore: Math.max(sanitized.monthlyHighScore || 0, score)
      };
      localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const handleGameOver = (score) => {
    setUserProfile(prev => {
      const sanitized = sanitizeSeasonalProfile(prev);
      const updated = {
        ...sanitized,
        totalGames: (sanitized.totalGames || 0) + 1,
        monthlyGames: (sanitized.monthlyGames || 0) + 1,
        highScore: Math.max(sanitized.highScore || 0, score),
        monthlyHighScore: Math.max(sanitized.monthlyHighScore || 0, score),
        totalScore: (sanitized.totalScore || 0) + score,
        monthlyTotalScore: (sanitized.monthlyTotalScore || 0) + score
      };
      localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
      return updated;
    });

    setLivesData(prev => {
      const updated = {
        ...prev,
        totalGamesPlayed: (prev.totalGamesPlayed || 0) + 1,
        highScore: Math.max(prev.highScore || 0, score)
      };
      return saveLivesData(updated, userProfile?.studentId);
    });
  };

  const handleUnlockQuizLife = () => {
    setLivesData(prev => {
      const updated = { ...prev, hasQuizLife: true };
      return saveLivesData(updated, userProfile?.studentId);
    });
  };

  const handleUnlockShareLife = () => {
    setLivesData(prev => {
      const updated = { ...prev, hasShareLife: true };
      return saveLivesData(updated, userProfile?.studentId);
    });
  };

  const handleUpdateName = (newName) => {
    const userId = userProfile.studentId || `USER_${newName}`;
    localStorage.setItem(`dancing_bricks_custom_name_${userId}`, newName);
    localStorage.setItem('dancing_bricks_player_name', newName);

    setUserProfile(prev => {
      const updated = { ...prev, name: newName };
      syncCloudScore({
        id: userId,
        name: newName,
        photoUrl: prev.photoUrl || '',
        score: prev.totalScore || prev.highScore || 0,
        games: prev.totalGames || 0
      });
      return updated;
    });
  };

  const handleLogin = (userData) => {
    setUserProfile(prev => {
      const freshSaved = loadSavedUserProfile();
      const updated = sanitizeSeasonalProfile({
        ...freshSaved,
        ...prev,
        ...userData,
        isLoggedIn: true
      });
      localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
      localStorage.setItem('dancing_bricks_player_name', userData.name);
      return updated;
    });
  };

  const handleLogout = () => {
    const updated = {
      name: 'Dancer',
      isLoggedIn: false,
      highScore: userProfile.highScore || 0,
      totalGames: userProfile.totalGames || 0
    };
    setUserProfile(updated);
    localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
  };

  const handleResetLivesTest = () => {
    const fresh = {
      dateStr: new Date().toISOString().split('T')[0],
      baseLives: 3,
      usedLives: 0,
      hasQuizLife: false,
      hasShareLife: false,
      totalGamesPlayed: 0,
      highScore: userProfile.highScore || 0
    };
    saveLivesData(fresh);
    setLivesData(fresh);
  };

  return (
    <section className="section" style={{ paddingBlock: 0, width: '100%', minHeight: '100dvh', display: 'flex', background: '#05060a' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: 0, flex: 1 }}>
        <div className="inner-page game-page-wrap" style={{ flex: 1, paddingTop: 0 }}>
          <div className="app-container">
            {/* Ultra-Compact Top Bar */}
            <header className="app-header glass compact-top-bar">
              {/* Left: Logo + Login button */}
              <div className="compact-header-left">
                <img
                  src="/images/dancing_bricks_logo.png"
                  alt="Dancing Bricks"
                  style={{
                    width: '36px',
                    height: '36px',
                    minWidth: '36px',
                    minHeight: '36px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: 0,
                    padding: 0
                  }}
                />
                <button
                  className="user-login-btn glass"
                  onClick={() => setShowLoginModal(true)}
                >
                  {userProfile.isLoggedIn ? (
                    <>
                      <UserCheck size={13} color="#22c55e" />
                      <span>{String(userProfile.studentId || '').startsWith('TG-') ? userProfile.name : (userProfile.studentId ? `ID: ${userProfile.studentId}` : (userProfile.name || '').split(' ')[0])}</span>
                    </>
                  ) : (
                    <>
                      <IdCard size={13} color="#d4a64a" />
                      <span>{tGame.loginBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right: Hearts + Timer + Reset */}
              <div className="compact-header-right">
                <div className="hearts-row">
                  {[1, 2, 3].map(num => (
                    <Heart
                      key={`base_${num}`}
                      size={14}
                      fill={num <= (3 - livesData.usedLives) ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                      color={num <= (3 - livesData.usedLives) ? '#ef4444' : '#52525b'}
                      className={num <= (3 - livesData.usedLives) ? 'heart-pulse' : ''}
                    />
                  ))}
                  <Heart
                    key="quiz_4"
                    size={14}
                    fill={livesData.hasQuizLife ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                    color={livesData.hasQuizLife ? '#f59e0b' : '#52525b'}
                  />
                  <Heart
                    key="share_5"
                    size={14}
                    fill={livesData.hasShareLife ? '#ec4899' : 'rgba(255,255,255,0.1)'}
                    color={livesData.hasShareLife ? '#ec4899' : '#52525b'}
                  />
                </div>
                <div className="timer-pill" title="მიმდინარე დრო (თბილისი)">
                  <Clock size={10} color="#d4a64a" />
                  <strong>{countdown || '22:00:00'}</strong>
                </div>
                <button
                  onClick={() => {
                    const langs = ['ka', 'en', 'ru'];
                    setLang(langs[(langs.indexOf(lang) + 1) % langs.length]);
                  }}
                  title="Change Language"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#d4a64a', cursor: 'pointer', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px', fontSize: '9px', fontWeight: 'bold' }}
                >
                  <Globe size={10} /> {lang === 'ka' ? 'GE' : lang.toUpperCase()}
                </button>
              </div>
            </header>

            {/* Navigation Bar */}
            <nav className="app-nav glass" style={{ gap: '2px', padding: '3px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
              <button
                className={`nav-btn ${activeTab === 'play' ? 'active' : ''}`}
                onClick={() => setActiveTab('play')}
                style={{ flex: '1.4', minWidth: 0, gap: '3px', padding: '0 4px', fontSize: '10.5px' }}
              >
                <Play size={12} /> {tGame.tabs.game}
              </button>

              <button
                className={`nav-btn bonus-btn quiz-tab ${livesData.hasQuizLife ? 'unlocked' : ''}`}
                onClick={() => setShowQuizModal(true)}
                style={{ flex: '0.9', minWidth: 0, padding: '0 2px', gap: '2px', fontSize: '9.5px' }}
              >
                <HelpCircle size={12} color={livesData.hasQuizLife ? '#22c55e' : '#f59e0b'} />
                <span>+1</span>
              </button>

              <button
                className={`nav-btn bonus-btn share-tab ${livesData.hasShareLife ? 'unlocked' : ''}`}
                onClick={() => setShowShareModal(true)}
                style={{ flex: '0.9', minWidth: 0, padding: '0 2px', gap: '2px', fontSize: '9.5px' }}
              >
                <Share2 size={12} color={livesData.hasShareLife ? '#22c55e' : '#ec4899'} />
                <span>+1</span>
              </button>

              <button
                className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
                style={{ flex: '0.9', minWidth: 0, padding: 0 }}
              >
                <Trophy size={14} />
              </button>

              <button
                className={`nav-btn ${activeTab === 'prizes' ? 'active' : ''}`}
                onClick={() => setActiveTab('prizes')}
                style={{ flex: '0.9', minWidth: 0, padding: 0 }}
              >
                <Gift size={14} />
              </button>

              <button
                className={`nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
                style={{ flex: '0.9', minWidth: 0, padding: 0 }}
              >
                <FileText size={14} />
              </button>
            </nav>

            <main className="main-content" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
              {activeTab === 'play' && (
                <GameBoard
                  tGame={tGame}
                  availableLives={availableLives}
                  onSpendLife={handleSpendLife}
                  onGameOver={handleGameOver}
                  onScoreUpdate={handleScoreUpdate}
                  onOpenQuiz={() => setShowQuizModal(true)}
                  onOpenShare={() => setShowShareModal(true)}
                />
              )}

              {activeTab === 'leaderboard' && (
                <ErrorBoundary>
                  <Leaderboard
                    currentTotalScore={userProfile.totalScore || userProfile.highScore || 0}
                    totalGames={userProfile.totalGames || 0}
                    playerName={userProfile.name || 'Dancer'}
                    userId={userProfile.studentId}
                    photoUrl={userProfile.photoUrl}
                    onUpdatePlayerName={handleUpdateName}
                  />
                </ErrorBoundary>
              )}

              {activeTab === 'prizes' && (
                <PrizesPage />
              )}

              {activeTab === 'rules' && (
                <div className="rules-card glass animate-in">
                  {lang === 'ru' ? (
                    <>
                      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Как играть</h2>
                      <div className="rules-list">
                        <div className="rule-item">
                          <Heart size={20} color="#ef4444" />
                          <div><strong>3 жизни в день</strong><p>Каждый день даётся 3 жизни. Одна игра — одна жизнь. Обновление в 22:00.</p></div>
                        </div>
                        <div className="rule-item">
                          <HelpCircle size={20} color="#f59e0b" />
                          <div><strong>4-я жизнь (+1)</strong><p>Ответьте на 3 вопроса про танцы — получите бонусную жизнь.</p></div>
                        </div>
                        <div className="rule-item">
                          <Share2 size={20} color="#ec4899" />
                          <div><strong>5-я жизнь (+1)</strong><p>Поделитесь нашим последним рилсом в Instagram — получите ещё одну жизнь.</p></div>
                        </div>
                        <div className="rule-item">
                          <Trophy size={20} color="#d4a64a" />
                          <div><strong>Лидерборд</strong><p>Разбивайте блоки, набирайте очки и попадите в ТОП!</p></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>როგორ ვითამაშოთ</h2>
                      <div className="rules-list">
                        <div className="rule-item">
                          <Heart size={20} color="#ef4444" />
                          <div><strong>3 სიცოცხლე დღეში</strong><p>ყოველდღიურად 3 სიცოცხლე. 1 თამაში = 1 სიცოცხლე. განახლება 22:00-ზე.</p></div>
                        </div>
                        <div className="rule-item">
                          <HelpCircle size={20} color="#f59e0b" />
                          <div><strong>მე-4 სიცოცხლე (+1)</strong><p>სწორედ უპასუხე 3 კითხვას და მიიღე + 1 ბონუს სიცოცხლე.</p></div>
                        </div>
                        <div className="rule-item">
                          <Share2 size={20} color="#ec4899" />
                          <div><strong>მე-5 სიცოცხლე (+1)</strong><p>გააზიარე ჩვენი ბოლო რილსი ინსტაგრამზე და მიიღე +1 ბონუს სიცოცხლე.</p></div>
                        </div>
                        <div className="rule-item">
                          <Trophy size={20} color="#d4a64a" />
                          <div><strong>ლიდერბორდი</strong><p>დაამსხვრიე ოქროსფერი ST აგურები, დააგროვე ქულები და გახდი #1!</p></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </main>

            <QuizModal
              isOpen={showQuizModal}
              onClose={() => setShowQuizModal(false)}
              hasQuizLife={livesData.hasQuizLife}
              onUnlockQuizLife={handleUnlockQuizLife}
              lang={lang}
            />

            <SocialShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              hasShareLife={livesData.hasShareLife}
              onUnlockShareLife={handleUnlockShareLife}
              lang={lang}
            />

            <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              currentUser={userProfile}
              onLogin={handleLogin}
              onLogout={handleLogout}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
