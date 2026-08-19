import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';

const quizTranslations = {
  ka: {
    title: 'ცეკვის კვიზის გამოწვევა (+1 Life)',
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
    title: 'Dance Quiz Challenge (+1 Life)',
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
    title: 'Викторина Танцев (+1 Life)',
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
  const [randomQuestions, setRandomQuestions] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      const shuffled = [...QUIZ_QUESTIONS].sort(() => 0.5 - Math.random());
      setRandomQuestions(shuffled.slice(0, 3));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = randomQuestions[currentIdx] || QUIZ_QUESTIONS[0];

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
      <div className="modal-content glass animate-in" style={{ maxWidth: '440px', padding: '20px' }}>
        {/* Modal Header with Clean Horizontal Alignment */}
        <div className="modal-header" style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="#d4a64a" />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#F0D9A8' }}>{t.title}</span>
          </div>
          <button className="btn-close" onClick={onClose} style={{ width: '44px', height: '44px', fontSize: '20px' }}>✕</button>
        </div>

        {hasQuizLife ? (
          <div className="quiz-unlocked-state" style={{ padding: '16px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid rgba(34,197,94,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 0 20px rgba(34,197,94,0.3)'
            }}>
              <CheckCircle2 size={44} color="#22c55e" className="animate-bounce" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'white', margin: '4px 0 6px' }}>{t.unlockedTitle}</h3>
            <p style={{ fontSize: '12.5px', color: '#e4e4e7', margin: '0 0 16px', lineHeight: '1.4' }}>{t.unlockedSub}</p>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                border: 'none',
                color: '#151100',
                fontWeight: '900',
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              {t.backBtn}
            </button>
          </div>
        ) : !isFinished ? (
          <div className="quiz-body">
            <div className="quiz-progress-bar" style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              <div className="quiz-progress-fill" style={{ width: `${((currentIdx + 1) / 3) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #d4a64a, #f0d9a8)', transition: 'width 0.3s' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#a1a1aa', fontWeight: '700', marginBottom: '12px' }}>
              <span>{t.qMeta(currentIdx + 1, 3, correctCount)}</span>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'white', marginBottom: '14px', lineHeight: '1.4' }}>
              {currentQ.question}
            </h3>

            <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentQ.options.map((opt, oIdx) => {
                let btnStyle = {
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e4e4e7',
                  fontWeight: '700',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: selectedOption !== null ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                };

                if (selectedOption !== null) {
                  if (oIdx === currentQ.correct) {
                    btnStyle.background = 'rgba(34,197,94,0.2)';
                    btnStyle.border = '1px solid #22c55e';
                    btnStyle.color = '#4ade80';
                  } else if (oIdx === selectedOption) {
                    btnStyle.background = 'rgba(239,68,68,0.2)';
                    btnStyle.border = '1px solid #ef4444';
                    btnStyle.color = '#f87171';
                  }
                }

                return (
                  <button key={oIdx} style={btnStyle} onClick={() => handleSelect(oIdx)}>
                    <span>{opt}</span>
                    {selectedOption !== null && oIdx === currentQ.correct && <CheckCircle2 size={16} color="#22c55e" />}
                    {selectedOption !== null && oIdx === selectedOption && oIdx !== currentQ.correct && <XCircle size={16} color="#ef4444" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="quiz-finished-state" style={{ textAlign: 'center', padding: '10px 0' }}>
            {correctCount >= 3 ? (
              <>
                <Sparkles size={48} color="#d4a64a" className="animate-bounce" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#F0D9A8', margin: '4px 0' }}>{t.perfectScore}</h3>
                <p style={{ fontSize: '12.5px', color: '#e4e4e7', margin: '4px 0 16px', lineHeight: '1.4' }}>{t.perfectSub}</p>

                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #d4a64a, #f0d9a8)',
                    border: 'none',
                    color: '#151100',
                    fontWeight: '900',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  {t.claimBtn}
                </button>
              </>
            ) : (
              <>
                <XCircle size={48} color="#ef4444" style={{ marginBottom: '10px' }} />
                <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>{t.failedTitle}</h3>
                <p style={{ fontSize: '12.5px', color: '#a1a1aa', margin: '4px 0 16px', lineHeight: '1.4' }}>{t.failedSub}</p>

                <button
                  onClick={resetQuiz}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
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
