import React, { useState, useEffect } from 'react';
import { Play, Trophy, HelpCircle, Share2, Heart, Clock, Sparkles, Award, UserCheck, LogIn, IdCard } from 'lucide-react';
import GameBoard from '../components/game/GameBoard';
import QuizModal from '../components/game/QuizModal';
import SocialShareModal from '../components/game/SocialShareModal';
import Leaderboard from '../components/game/Leaderboard';
import LoginModal from '../components/game/LoginModal';
import { loadLivesData, saveLivesData, calculateAvailableLives, formatTimeUntilReset, getGeorgiaResetTime } from '../utils/livesManager';
import './Game.css';

export default function Game() {
  const [activeTab, setActiveTab] = useState('play'); // play, leaderboard, rules
  const [livesData, setLivesData] = useState(() => loadLivesData());
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

  // Hide floating chat bot & language selector while playing game
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

      const fresh = loadLivesData();
      if (fresh.usedLives !== livesData.usedLives || fresh.hasQuizLife !== livesData.hasQuizLife) {
        setLivesData(fresh);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [livesData]);

  const handleSpendLife = () => {
    if (availableLives <= 0) return;
    setLivesData(prev => {
      const updated = { ...prev, usedLives: prev.usedLives + 1 };
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

  return (
    <section className="section" style={{ paddingBlock: 'clamp(3rem, 6vw, 5rem)', width: '100%' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div className="inner-page game-page-wrap">
          <div className="app-container">
            {/* Header */}
            <header className="app-header glass">
              <div className="header-brand">
                <div className="brand-icon">
                  <Award size={24} color="#d4a64a" />
                </div>
                <div>
                  <h1 className="brand-title">DANCING BRICKS</h1>
                  <span className="brand-sub">ST DANCE STUDIO</span>
                </div>
              </div>

              <div className="header-status-strip">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className="user-login-btn glass"
                    onClick={() => setShowLoginModal(true)}
                  >
                    {userProfile.isLoggedIn ? (
                      <>
                        <UserCheck size={14} color="#22c55e" />
                        <span>{userProfile.studentId ? `ID: ${userProfile.studentId}` : userProfile.name}</span>
                      </>
                    ) : (
                      <>
                        <IdCard size={14} color="#d4a64a" />
                        <span>🆔 შესვლა</span>
                      </>
                    )}
                  </button>

                  <div className="lives-display">
                    <div className="hearts-row">
                      {[1, 2, 3].map(num => (
                        <Heart
                          key={`base_${num}`}
                          size={18}
                          fill={num <= (3 - livesData.usedLives) ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                          color={num <= (3 - livesData.usedLives) ? '#ef4444' : '#52525b'}
                          className={num <= (3 - livesData.usedLives) ? 'heart-pulse' : ''}
                        />
                      ))}

                      <Heart
                        key="quiz_4"
                        size={18}
                        fill={livesData.hasQuizLife ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                        color={livesData.hasQuizLife ? '#f59e0b' : '#52525b'}
                      />

                      <Heart
                        key="share_5"
                        size={18}
                        fill={livesData.hasShareLife ? '#ec4899' : 'rgba(255,255,255,0.1)'}
                        color={livesData.hasShareLife ? '#ec4899' : '#52525b'}
                      />
                    </div>
                  </div>
                </div>

                <div className="timer-badge">
                  <Clock size={13} color="#d4a64a" />
                  <span>Reset 22:00: <strong>{countdown || '22:00:00'}</strong></span>
                </div>
              </div>
            </header>

            {/* Navigation Bar */}
            <nav className="app-nav glass">
              <button
                className={`nav-btn ${activeTab === 'play' ? 'active' : ''}`}
                onClick={() => setActiveTab('play')}
              >
                <Play size={16} /> Game
              </button>

              <button
                className={`nav-btn bonus-btn ${livesData.hasQuizLife ? 'unlocked' : ''}`}
                onClick={() => setShowQuizModal(true)}
              >
                <HelpCircle size={16} color={livesData.hasQuizLife ? '#22c55e' : '#f59e0b'} />
                <span>4th Quiz</span>
                {livesData.hasQuizLife && <span className="check-badge">✓</span>}
              </button>

              <button
                className={`nav-btn bonus-btn ${livesData.hasShareLife ? 'unlocked' : ''}`}
                onClick={() => setShowShareModal(true)}
              >
                <Share2 size={16} color={livesData.hasShareLife ? '#22c55e' : '#ec4899'} />
                <span>5th Share</span>
                {livesData.hasShareLife && <span className="check-badge">✓</span>}
              </button>

              <button
                className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={16} /> Ranks
              </button>

              <button
                className={`nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
                onClick={() => setActiveTab('rules')}
              >
                <Sparkles size={16} /> Rules
              </button>
            </nav>

            <main className="main-content" style={{ width: '100%' }}>
              {activeTab === 'play' && (
                <GameBoard
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
                  <h2>📜 How to Play Dancing Bricks</h2>
                  <div className="rules-list">
                    <div className="rule-item">
                      <Heart size={24} color="#ef4444" />
                      <div>
                        <strong>3 Base Daily Lives (❤️❤️❤️)</strong>
                        <p>Every player gets 3 lives every day. Playing 1 game spends 1 life. Lives refresh automatically at 22:00 Georgia Time (UTC+4).</p>
                      </div>
                    </div>

                    <div className="rule-item">
                      <HelpCircle size={24} color="#f59e0b" />
                      <div>
                        <strong>4th Life Unlock (Dance Quiz)</strong>
                        <p>Answer 3 dance questions correctly in the Dance Quiz challenge to gain +1 Bonus Life (❤️ #4).</p>
                      </div>
                    </div>

                    <div className="rule-item">
                      <Share2 size={24} color="#ec4899" />
                      <div>
                        <strong>5th Life Unlock (Instagram Share)</strong>
                        <p>Share our studio link or Instagram post to unlock your 5th Bonus Life (❤️ #5).</p>
                      </div>
                    </div>

                    <div className="rule-item">
                      <Trophy size={24} color="#d4a64a" />
                      <div>
                        <strong>Leaderboard & High Scores</strong>
                        <p>Break Samba, Cha-Cha, Rumba, Paso Doble, Jive & Waltz bricks to score points and top the Studio Leaderboard!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>

            <QuizModal
              isOpen={showQuizModal}
              onClose={() => setShowQuizModal(false)}
              hasQuizLife={livesData.hasQuizLife}
              onUnlockQuizLife={handleUnlockQuizLife}
            />

            <SocialShareModal
              isOpen={showShareModal}
              onClose={() => setShowShareModal(false)}
              hasShareLife={livesData.hasShareLife}
              onUnlockShareLife={handleUnlockShareLife}
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
