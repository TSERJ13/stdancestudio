import React, { useState, useEffect } from 'react';
import { Trophy, User } from 'lucide-react';

const INITIAL_LEADERBOARD = [
  { id: '1', name: 'სერგო წივწივაძე', score: 18500, games: 42, badge: '🏆 Head Coach' },
  { id: '2', name: 'მარიამი (Samba Star)', score: 14200, games: 31, badge: '🥇 Gold' },
  { id: '3', name: 'ნიკოლოზი (Cha-Cha King)', score: 12800, games: 27, badge: '🥈 Silver' },
  { id: '4', name: 'ანა (Rumba Queen)', score: 11400, games: 22, badge: '🥉 Bronze' },
  { id: '5', name: 'გიორგი (Jive Champ)', score: 9600, games: 19, badge: '🔥 Dancer' },
  { id: '6', name: 'ელენე (Waltz Master)', score: 8400, games: 15, badge: '🔥 Dancer' },
];

export default function Leaderboard({ currentHighScore, playerName, onUpdatePlayerName }) {
  const [board, setBoard] = useState(() => {
    const saved = localStorage.getItem('dancing_bricks_leaderboard');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_LEADERBOARD;
  });

  const [inputName, setInputName] = useState(playerName || 'Dancer');

  useEffect(() => {
    if (!currentHighScore || currentHighScore <= 0) return;

    setBoard(prev => {
      const existingIdx = prev.findIndex(item => item.name === playerName);
      let updated = [...prev];

      if (existingIdx >= 0) {
        if (currentHighScore > updated[existingIdx].score) {
          updated[existingIdx].score = currentHighScore;
        }
        updated[existingIdx].games += 1;
      } else {
        updated.push({
          id: `player_${Date.now()}`,
          name: playerName || 'Dancer',
          score: currentHighScore,
          games: 1,
          badge: '🔥 Player'
        });
      }

      updated.sort((a, b) => b.score - a.score);
      localStorage.setItem('dancing_bricks_leaderboard', JSON.stringify(updated));
      return updated;
    });
  }, [currentHighScore, playerName]);

  const handleSaveName = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      onUpdatePlayerName(inputName.trim());
    }
  };

  return (
    <div className="leaderboard-container glass animate-in">
      <div className="lb-header">
        <div className="lb-title">
          <Trophy size={24} color="#d4a64a" />
          <h2>Studio Leaderboard</h2>
        </div>
        <span className="lb-subtitle">Top Dancers & High Scores</span>
      </div>

      <form className="player-profile-bar glass" onSubmit={handleSaveName}>
        <User size={18} color="#d4a64a" />
        <span className="profile-lbl">Dancer Name:</span>
        <input
          type="text"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
          placeholder="Enter your name..."
        />
        <button type="submit" className="btn-save-name">Save</button>
      </form>

      <div className="lb-list">
        {board.map((item, index) => {
          const isTop3 = index < 3;
          const isMe = item.name === playerName;
          return (
            <div key={item.id} className={`lb-row ${isMe ? 'is-me' : ''} ${isTop3 ? 'top-rank' : ''}`}>
              <div className="lb-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="lb-avatar" style={{ background: isTop3 ? 'rgba(212, 166, 74, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                {item.name.charAt(0).toUpperCase()}
              </div>
              <div className="lb-user-info">
                <span className="lb-name">{item.name}</span>
                <span className="lb-badge">{item.badge || '🔥 Player'}</span>
              </div>
              <div className="lb-score-col">
                <span className="lb-score">{item.score.toLocaleString()} pts</span>
                <span className="lb-games">{item.games} games</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
