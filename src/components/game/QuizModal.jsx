import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';

export default function QuizModal({ isOpen, onClose, onUnlockQuizLife, hasQuizLife }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (optionIdx) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);

    const isRight = optionIdx === currentQ.correct;
    if (isRight) {
      setCorrectCount(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < 3) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
        if ((isRight ? correctCount + 1 : correctCount) >= 3) {
          onUnlockQuizLife();
        }
      }
    }, 1200);
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-in" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <HelpCircle size={20} color="#d4a64a" />
            <span>4TH LIFE CHALLENGE — DANCE QUIZ</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {hasQuizLife ? (
          <div className="quiz-unlocked-state">
            <CheckCircle2 size={56} className="text-gold animate-bounce" />
            <h3>4th Life Unlocked! (❤️ #4)</h3>
            <p>You already earned your 4th life for today by completing the dance quiz!</p>
            <button className="btn-primary" onClick={onClose}>Back to Game</button>
          </div>
        ) : !isFinished ? (
          <div className="quiz-body">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / 3) * 100}%` }} />
            </div>
            <div className="quiz-meta">
              <span>Question {currentIdx + 1} of 3</span>
              <span className="text-gold">Score: {correctCount}/3</span>
            </div>

            <h3 className="quiz-question-text">{currentQ.question}</h3>

            <div className="quiz-options-list">
              {currentQ.options.map((opt, i) => {
                let statusClass = '';
                if (selectedOption !== null) {
                  if (i === currentQ.correct) statusClass = 'correct';
                  else if (i === selectedOption) statusClass = 'wrong';
                }
                return (
                  <button
                    key={i}
                    className={`quiz-opt-btn ${statusClass}`}
                    onClick={() => handleSelect(i)}
                    disabled={selectedOption !== null}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="opt-text">{opt}</span>
                    {statusClass === 'correct' && <CheckCircle2 size={18} color="#22c55e" />}
                    {statusClass === 'wrong' && <XCircle size={18} color="#ef4444" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="quiz-result-state">
            {correctCount >= 3 ? (
              <>
                <Sparkles size={56} color="#d4a64a" className="animate-spin" />
                <h3>🎉 PERFECT SCORE!</h3>
                <p>You answered 3/3 questions correctly and earned <strong>+1 Bonus Life (❤️ #4)</strong>!</p>
                <button className="btn-primary" onClick={onClose}>Claim +1 ❤️ & Play</button>
              </>
            ) : (
              <>
                <XCircle size={56} color="#ef4444" />
                <h3>Quiz Failed ({correctCount}/3)</h3>
                <p>You need to answer all 3 questions correctly to get the 4th life.</p>
                <button className="btn-secondary" onClick={resetQuiz}>Try Quiz Again</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
