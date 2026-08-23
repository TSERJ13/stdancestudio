import React, { useState } from 'react'
import { jsPDF } from 'jspdf'
import { MONTHLY_EXAM_QUESTIONS } from '../data/examData'
import { GROUPS_INFO } from '../data/planCalendarEngine'
import { useLanguage } from '../context/LanguageContext'
import './MonthlyExamModal.css'

export default function MonthlyExamModal({ isOpen, onClose, initialMonth = '2026-08', initialGroup = 'baby_bronze' }) {
  const { lang } = useLanguage()
  const [studentName, setStudentName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(initialGroup)
  const [selectedMonth, setSelectedMonth] = useState(initialMonth)
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState(null)
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  // Questions generator (fallback to baby_bronze or presilver)
  const questionList = MONTHLY_EXAM_QUESTIONS[selectedGroup] || MONTHLY_EXAM_QUESTIONS.baby_bronze

  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  const handleSubmitExam = async (e) => {
    e.preventDefault()
    if (!studentName.trim()) {
      alert('გთხოვთ შეიყვანოთ მოსწავლის სახელი და გვარი!')
      return
    }

    let correctCount = 0
    questionList.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++
      }
    })

    const totalCount = questionList.length
    // 20 questions = 10 points (0.5 pts per correct answer)
    const score10 = (correctCount * 0.5).toFixed(1)
    const percentage = Math.round((correctCount / totalCount) * 100)

    const resultObj = {
      studentName,
      group: selectedGroup,
      month: selectedMonth,
      correctCount,
      totalCount,
      score10,
      percentage,
      date: new Date().toLocaleString('ka-GE')
    }

    setScoreResult(resultObj)
    setIsSubmitted(true)

    // Generate & Download PDF
    generatePdfReport(resultObj, questionList, answers)

    // Send Email to Studio Admin Email
    sendEmailReport(resultObj, questionList, answers)
  }

  const generatePdfReport = (res, questions, userAnswers) => {
    try {
      const doc = new jsPDF()

      // Header (Georgian / Universal PDF)
      doc.setFontSize(16)
      doc.setTextColor(212, 166, 74) // Gold
      doc.text('ST DANCE STUDIO - MONTHLY EXAMINATION REPORT (10-POINT SCALE)', 14, 20)

      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text(`Student Name: ${res.studentName}`, 14, 30)
      doc.text(`Group: ${res.group.toUpperCase()} | Month: ${res.month}`, 14, 36)
      doc.text(`Date & Time: ${res.date}`, 14, 42)
      doc.setFontSize(13)
      doc.setTextColor(34, 139, 34)
      doc.text(`FINAL SCORE: ${res.score10} / 10 POINTS (${res.correctCount} of ${res.totalCount} correct - ${res.percentage}%)`, 14, 50)

      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 54, 196, 54)

      let yPos = 62
      doc.setFontSize(9)

      questions.forEach((q, idx) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        const userAnsIdx = userAnswers[q.id]
        const isCorrect = userAnsIdx === q.correct
        const qTitle = `${idx + 1}. ${q.questionKa || q.questionEn}`
        const userChoice = userAnsIdx !== undefined ? (q.optionsKa ? q.optionsKa[userAnsIdx] : q.optionsEn[userAnsIdx]) : 'No Answer'
        const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]

        doc.setTextColor(0, 0, 0)
        doc.text(doc.splitTextToSize(qTitle, 180), 14, yPos)
        yPos += 6

        if (isCorrect) {
          doc.setTextColor(34, 139, 34) // Green
          doc.text(`[CORRECT (+0.5 pt)] Student Choice: ${userChoice}`, 18, yPos)
        } else {
          doc.setTextColor(220, 20, 60) // Red
          doc.text(`[INCORRECT (0 pt)] Student Choice: ${userChoice}`, 18, yPos)
          yPos += 5
          doc.setTextColor(70, 70, 70)
          doc.text(`Correct Answer: ${correctChoice}`, 18, yPos)
        }

        yPos += 9
      })

      // Download PDF
      doc.save(`ST_Dance_Exam_${res.studentName.replace(/\s+/g, '_')}_Score_${res.score10}_10.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
    }
  }

  const sendEmailReport = async (res, questions, userAnswers) => {
    setIsSending(true)
    try {
      const answersBreakdown = questions.map((q, idx) => {
        const userAnsIdx = userAnswers[q.id]
        const isCorrect = userAnsIdx === q.correct
        const userChoice = userAnsIdx !== undefined ? (q.optionsKa ? q.optionsKa[userAnsIdx] : q.optionsEn[userAnsIdx]) : 'პასუხი არ გაუციათ'
        const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]
        return `${idx + 1}. ${q.questionKa}\n   - მოსწავლის პასუხი: ${userChoice} (${isCorrect ? '✅ სწორია (+0.5 ქულა)' : '❌ არასწორია'})\n   - სწორი პასუხი: ${correctChoice}`
      }).join('\n\n')

      const bodyContent = `
=== ST DANCE STUDIO ონლაინ ტესტირების შედეგი (10-ქულიანი სისტემა) ===

📌 მოსწავლის სახელი და გვარი: ${res.studentName}
👥 ჯგუფი: ${res.group}
📅 თვე: ${res.month}
⏱️ თარიღი & დრო: ${res.date}

🏆 საბოლოო შეფასება: ${res.score10} / 10 ქულა (20-დან ${res.correctCount} სწორი პასუხი - ${res.percentage}%)

--- 20 კითხვის დეტალური გარჩევა ---

${answersBreakdown}

==========================================
გაგზავნილია ავტომატურად stdance.ge-ს ონლაინ გამოცდების სისტემიდან.
      `

      await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://stdance.ge',
          'Referer': 'https://stdance.ge'
        },
        body: JSON.stringify({
          name: 'ST Dance Studio',
          email: 'stdancegroupdue@gmail.com',
          _subject: `${res.studentName} - ონლაინ ტესტირება (${res.date})`,
          studentName: res.studentName,
          group: res.group,
          month: res.month,
          score: `${res.score10} / 10 ქულა (20-დან ${res.correctCount} სწორი - ${res.percentage}%)`,
          details: bodyContent
        })
      })
    } catch (e) {
      console.error('Email Dispatch Error:', e)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="exam-modal-overlay">
      <div className="exam-modal-content">
        <div className="exam-modal-header">
          <div>
            <h3>📝 28 რიცხვის ყოველთვიური ონლაინ ტესტირება (10-ქულიანი სისტემა)</h3>
            <p style={{ margin: '4px 0 0 0', color: '#b0ab9f', fontSize: '0.85rem' }}>
              შეავსეთ სახელი, გვარი და უპასუხეთ 20 შეკითხვას. 20 შეკითხვა = 10 ქულა. შედეგი და PDF რეპორტი ავტომატურად გაიგზავნება სტუდიის მეილზე.
            </p>
          </div>
          <button className="exam-close-btn" onClick={onClose}>✕</button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmitExam} className="exam-modal-body">
            {/* Student Info Bar */}
            <div className="exam-student-form">
              <div className="exam-form-field">
                <label>👤 მოსწავლის სახელი და გვარი *</label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: ნინი ბერიძე"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="exam-form-field">
                <label>👥 ჯგუფი</label>
                <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                  {GROUPS_INFO.map(g => (
                    <option key={g.id} value={g.id}>{g.ka}</option>
                  ))}
                </select>
              </div>

              <div className="exam-form-field">
                <label>📅 გამოცდის თვე</label>
                <input type="text" readOnly value={selectedMonth} />
              </div>
            </div>

            {/* Questions List */}
            <div className="exam-questions-list">
              <h4 style={{ color: 'var(--color-gold, #d4a64a)', marginBottom: '1rem' }}>
                📋 20 საკონტროლო შეკითხვა (თითოეული 0.5 ქულა):
              </h4>

              {questionList.map((q, idx) => (
                <div key={q.id} className="exam-q-card">
                  <p className="exam-q-text">
                    <strong>{idx + 1}.</strong> {q.questionKa || q.questionEn}
                  </p>
                  <div className="exam-options-grid">
                    {(q.optionsKa || q.optionsEn).map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`exam-option-label ${answers[q.id] === optIdx ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(q.id, optIdx)}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === optIdx}
                          onChange={() => handleOptionSelect(q.id, optIdx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Bar */}
            <div className="exam-submit-bar">
              <button type="submit" className="exam-submit-btn">
                ✅ ტესტირების დასრულება & PDF რეპორტის გაგზავნა
              </button>
            </div>
          </form>
        ) : (
          <div className="exam-result-card">
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ color: 'var(--color-gold, #d4a64a)', margin: 0 }}>
                ტესტირება წარმატებით დასრულდა!
              </h3>
              <p style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '8px' }}>
                {scoreResult.studentName} • {scoreResult.group.toUpperCase()}
              </p>

              <div style={{
                background: 'rgba(212,166,74,0.15)',
                border: '2px solid var(--color-gold, #d4a64a)',
                display: 'inline-block',
                padding: '16px 36px',
                borderRadius: '16px',
                margin: '1.5rem 0'
              }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffffff' }}>
                  {scoreResult.score10} / 10 ქულა
                </span>
                <p style={{ margin: '6px 0 0 0', color: '#f0c878', fontWeight: '600', fontSize: '1rem' }}>
                  ({scoreResult.correctCount} / 20 სწორი პასუხი - {scoreResult.percentage}%)
                </p>
              </div>

              <p style={{ color: '#b0ab9f', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
                ✅ PDF სერტიფიკატი გადმოიწერა თქვენს მოწყობილობაში.<br />
                📧 სრული პასუხები და 10-ქულიანი PDF რეპორტი გაიგზავნა მეილზე: <strong>stdancegroup@gmail.com</strong>
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="exam-submit-btn"
                  style={{ background: 'transparent', border: '1px solid var(--color-gold, #d4a64a)', color: '#d4a64a' }}
                  onClick={() => generatePdfReport(scoreResult, questionList, answers)}
                >
                  📥 PDF რეპორტის ჩამოტვირთვა
                </button>
                <button className="exam-submit-btn" onClick={onClose}>
                  დახურვა
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
