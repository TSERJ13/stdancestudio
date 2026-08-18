import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';

const quizTranslations = {
  ka: {
    title: '4-ე სიცოცხლის გამოწვევა — ცეკვის კვიზი',
    unlockedTitle: '4-ე სიცოცხლე გახსნილია! (+1 Life)',
    unlockedSub: 'დღევანდელი მე-4 სიცოცხლე უკვე მოპოვებული გაქვს კვიზის გავლით!',
    backBtn: 'თამაშში დაბრუნება',
    qMeta: (idx, total, count) => `შეკითხვა ${idx} / ${total} | ქულა: ${count}/3`,
    perfectScore: 'იდეალური შედეგი! (3/3)',
    perfectSub: 'შენ უპასუხე 3-ვე შეკითხვას სწორად და დაიმსახურე +1 ბონუს სიცოცხლე!',
    claimBtn: 'მიიღე +1 Life & ეთამაშე',
    failedTitle: 'კვიზი ვერ გაიარე',
    failedSub: 'მე-4 სიცოცხლის მისაღებად საჭიროა 3-ვე შეკითხვაზე სწორი პასუხი.',
    retryBtn: 'თავიდან ცდა'
  },
  en: {
    title: '4th Life Challenge — Dance Quiz',
    unlockedTitle: '4th Life Unlocked! (+1 Life)',
    unlockedSub: 'You already earned your 4th life for today by completing the dance quiz!',
    backBtn: 'Back to Game',
    qMeta: (idx, total, count) => `Question ${idx} of ${total} | Score: ${count}/3`,
    perfectScore: 'PERFECT SCORE! (3/3)',
    perfectSub: 'You answered all 3 questions correctly and earned +1 Bonus Life!',
    claimBtn: 'Claim +1 Life & Play',
    failedTitle: 'Quiz Failed',
    failedSub: 'You need to answer all 3 questions correctly to get the 4th life.',
    retryBtn: 'Try Again'
  },
  ru: {
    title: '4-я Жизнь — Викторина Танцев',
    unlockedTitle: '4-я Жизнь Разблокирована! (+1 Life)',
    unlockedSub: 'Вы уже получили 4-ю жизнь на сегодня за прохождение викторины!',
    backBtn: 'Вернуться в игру',
    qMeta: (idx, total, count) => `Вопрос ${idx} из ${total} | Счет: ${count}/3`,
    perfectScore: 'ИДЕАЛЬНЫЙ РЕЗУЛЬТАТ! (3/3)',
    perfectSub: 'Вы правильно ответили на 3 вопроса и получили +1 Бонусную Жизнь!',
    claimBtn: 'Забрать +1 Life и Играть',
    failedTitle: 'Викторина не пройдена',
    failedSub: 'Для получения 4-й жизни нужно ответить правильно на все 3 вопроса.',
    retryBtn: 'Попробовать снова'
  }
};

export default function QuizModal({ isOpen, onClose, onUnlockQuizLife, hasQuizLife, lang = 'ka' }) {
  const t = quizTranslations[lang] || quizTranslations.ka;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx] || QUIZ_QUESTIONS[0];

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
      <div className="modal-content glass animate-in" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="quiz-title-badge">
            <HelpCircle size={20} color="#d4a64a" />
            <span>{t.title}</span>
          </div>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {hasQuizLife ? (
          <div className="quiz-unlocked-state">
            <CheckCircle2 size={56} color="#22c55e" className="animate-bounce" />
            <h3>{t.unlockedTitle}</h3>
            <p>{t.unlockedSub}</p>
            <button className="btn-primary" style={{ marginTop: '10px' }} onClick={onClose}>
              {t.backBtn}
            </button>
          </div>
        ) : !isFinished ? (
          <div className="quiz-body">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / 3) * 100}%` }} />
            </div>
            <div className="quiz-meta">
              <span>{t.qMeta(currentIdx + 1, 3, correctCount)}</span>
            </div>

            <h3 className="quiz-question-text" style={{ fontSize: '15px', color: 'white', marginTop: '10px' }}>
              {currentQ.question}
            </h3>

            <div className="quiz-options-list" style={{ marginTop: '14px' }}>
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
                <Sparkles size={56} color="#d4a64a" className="animate-bounce" />
                <h3>{t.perfectScore}</h3>
                <p>{t.perfectSub}</p>
                <button className="btn-primary" style={{ marginTop: '12px' }} onClick={onClose}>
                  {t.claimBtn}
                </button>
              </>
            ) : (
              <>
                <XCircle size={56} color="#ef4444" />
                <h3>{t.failedTitle} ({correctCount}/3)</h3>
                <p>{t.failedSub}</p>
                <button className="btn-secondary" style={{ marginTop: '12px' }} onClick={resetQuiz}>
                  {t.retryBtn}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
