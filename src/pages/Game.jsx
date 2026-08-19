import React, { useState, useEffect } from 'react';
import { Play, Trophy, HelpCircle, Share2, Heart, Clock, Sparkles, Award, UserCheck, IdCard, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import GameBoard from '../components/game/GameBoard';
import QuizModal from '../components/game/QuizModal';
import SocialShareModal from '../components/game/SocialShareModal';
import Leaderboard from '../components/game/Leaderboard';
import LoginModal from '../components/game/LoginModal';
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
    subtitle: 'დაამსხვრიე ოქროსფერი ST აგურები და გახდი ლიდერბორდის გამარჯვებული!',
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
    subtitle: 'Break golden ST bricks and top the studio leaderboard!',
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
    subtitle: 'Разбивайте золотые блоки ST и возглавьте лидерборд студии!',
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
  const { lang } = useLanguage();
  const tGame = gameTranslations[lang] || gameTranslations.ka;

  const [activeTab, setActiveTab] = useState('play');

  // Always initialize with 3 full active lives on mount
  const [livesData, setLivesData] = useState(() => {
    const fresh = {
      dateStr: new Date().toISOString().split('T')[0],
      baseLives: 3,
      usedLives: 0,
      hasQuizLife: false,
      hasShareLife: false,
      totalGamesPlayed: 0,
      highScore: 0
    };
    saveLivesData(fresh);
    return fresh;
  });

  const [countdown, setCountdown] = useState('');

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('dancing_bricks_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: localStorage.getItem('dancing_bricks_player_name') || 'Dancer',
      isLoggedIn: false,
      highScore: 0,
      totalGames: 0
    };
  });

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const availableLives = calculateAvailableLives(livesData);

  useEffect(() => {
    document.body.classList.add('page-game-active');
    return () => {
      document.body.classList.remove('page-game-active');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const { nextResetTimeMs } = getGeorgiaResetTime();
      setCountdown(formatTimeUntilReset(nextResetTimeMs));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSpendLife = () => {
    if (availableLives <= 0) return;
    setLivesData(prev => {
      const updated = { ...prev, usedLives: Math.min(prev.baseLives || 3, prev.usedLives + 1) };
      return saveLivesData(updated);
    });
  };

  const handleScoreUpdate = (score) => {
    if (score > (userProfile.highScore || 0)) {
      setUserProfile(prev => {
        const updated = { ...prev, highScore: score };
        localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleGameOver = (score) => {
    setUserProfile(prev => {
      const updated = {
        ...prev,
        totalGames: (prev.totalGames || 0) + 1,
        highScore: Math.max(prev.highScore || 0, score)
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
      return saveLivesData(updated);
    });
  };

  const handleUnlockQuizLife = () => {
    setLivesData(prev => {
      const updated = { ...prev, hasQuizLife: true };
      return saveLivesData(updated);
    });
  };

  const handleUnlockShareLife = () => {
    setLivesData(prev => {
      const updated = { ...prev, hasShareLife: true };
      return saveLivesData(updated);
    });
  };

  const handleLogin = (userData) => {
    const updated = {
      ...userProfile,
      ...userData,
      isLoggedIn: true
    };
    setUserProfile(updated);
    localStorage.setItem('dancing_bricks_user_profile', JSON.stringify(updated));
    localStorage.setItem('dancing_bricks_player_name', userData.name);
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
    <section className="section" style={{ paddingBlock: 'clamp(2.5rem, 5vw, 4rem)', width: '100%' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="inner-page game-page-wrap">
          <div className="app-container">
            {/* Ultra-Compact Top Bar */}
            <header className="app-header glass compact-top-bar">
              {/* Left: Logo + Login button */}
              <div className="compact-header-left">
                <Award size={18} color="#d4a64a" />
                <button
                  className="user-login-btn glass"
                  onClick={() => setShowLoginModal(true)}
                >
                  {userProfile.isLoggedIn ? (
                    <>
                      <UserCheck size={13} color="#22c55e" />
                      <span>{userProfile.studentId ? `ID: ${userProfile.studentId}` : userProfile.name}</span>
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
                <div className="timer-pill">
                  <Clock size={10} color="#d4a64a" />
                  <strong>{countdown || '22:00:00'}</strong>
                </div>
                <button
                  onClick={handleResetLivesTest}
                  title="Reset Lives"
                  style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}
                >
                  <RotateCcw size={10} />
                </button>
              </div>
            </header>

            {/* Navigation Bar */}
            <nav className="app-nav glass">
              <button
                className={`nav-btn ${activeTab === 'play' ? 'active' : ''}`}
                onClick={() => setActiveTab('play')}
              >
                <Play size={14} /> {tGame.tabs.game}
              </button>

              <button
                className={`nav-btn bonus-btn quiz-tab ${livesData.hasQuizLife ? 'unlocked' : ''}`}
                onClick={() => setShowQuizModal(true)}
              >
                <HelpCircle size={14} color={livesData.hasQuizLife ? '#22c55e' : '#f59e0b'} />
                <span>+1</span>
              </button>

              <button
                className={`nav-btn bonus-btn share-tab ${livesData.hasShareLife ? 'unlocked' : ''}`}
                onClick={() => setShowShareModal(true)}
              >
                <Share2 size={14} color={livesData.hasShareLife ? '#22c55e' : '#ec4899'} />
                <span>+1</span>
              </button>

              <button
                className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={14} /> {tGame.tabs.ranks}
              </button>

              <button
                className={`nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                <Sparkles size={14} /> {tGame.tabs.rules}
              </button>
            </nav>

            <main className="main-content" style={{ width: '100%' }}>
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
                <Leaderboard
                  currentHighScore={userProfile.highScore || livesData.highScore}
                  playerName={userProfile.name}
                  onUpdatePlayerName={(name) => handleLogin({ name })}
                />
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
                          <div><strong>5-я жизнь (+1)</strong><p>Поделитесь нашим Instagram — получите ещё одну жизнь.</p></div>
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
                          <div><strong>მე-4 სიცოცხლე (+1)</strong><p>სწორად უპასუხე 3 კითხვას ქვიზში და მიიღე ბონუს სიცოცხლე.</p></div>
                        </div>
                        <div className="rule-item">
                          <Share2 size={20} color="#ec4899" />
                          <div><strong>მე-5 სიცოცხლე (+1)</strong><p>გააზიარე ჩვენი ინსტაგრამი და მიიღე +1 ბონუს სიცოცხლე.</p></div>
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
            />
          </div>
        </div>
      </div>
    </section>
  );
}
