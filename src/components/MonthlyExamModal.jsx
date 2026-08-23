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
      alert(lang === 'ka' ? 'გთხოვთ შეიყვანოთ მოსწავლის სახელი და გვარი!' : 'Please enter student name!')
      return
    }

    let correctCount = 0
    questionList.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++
      }
    })

    const totalCount = questionList.length
    const percentage = Math.round((correctCount / totalCount) * 100)
    const resultObj = {
      studentName,
      group: selectedGroup,
      month: selectedMonth,
      correctCount,
      totalCount,
      percentage,
      date: new Date().toLocaleString()
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

      // Header
      doc.setFontSize(18)
      doc.setTextColor(212, 166, 74) // Gold
      doc.text('ST DANCE STUDIO - MONTHLY EXAMINATION REPORT', 14, 20)

      doc.setFontSize(11)
      doc.setTextColor(50, 50, 50)
      doc.text(`Student Name: ${res.studentName}`, 14, 30)
      doc.text(`Group: ${res.group.toUpperCase()} | Month: ${res.month}`, 14, 36)
      doc.text(`Date & Time: ${res.date}`, 14, 42)
      doc.text(`Final Score: ${res.correctCount} / ${res.totalCount} (${res.percentage}%)`, 14, 48)

      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 52, 196, 52)

      let yPos = 60
      doc.setFontSize(10)

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
        yPos += 8

        if (isCorrect) {
          doc.setTextColor(34, 139, 34) // Green
          doc.text(`[CORRECT] Student Answer: ${userChoice}`, 18, yPos)
        } else {
          doc.setTextColor(220, 20, 60) // Red
          doc.text(`[INCORRECT] Student Answer: ${userChoice}`, 18, yPos)
          yPos += 5
          doc.setTextColor(70, 70, 70)
          doc.text(`Correct Answer: ${correctChoice}`, 18, yPos)
        }

        yPos += 10
      })

      // Save PDF
      doc.save(`ST_Dance_Exam_${res.studentName.replace(/\s+/g, '_')}_${res.month}.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
    }
  }

  const sendEmailReport = async (res, questions, userAnswers) => {
    setIsSending(true)
    try {
      // Build Email Payload
      const answersBreakdown = questions.map((q, idx) => {
        const userAnsIdx = userAnswers[q.id]
        const isCorrect = userAnsIdx === q.correct
        const userChoice = userAnsIdx !== undefined ? (q.optionsKa ? q.optionsKa[userAnsIdx] : q.optionsEn[userAnsIdx]) : 'No Answer'
        const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]
        return `${idx + 1}. ${q.questionKa}\n   - სტუდენტის პასუხი: ${userChoice} (${isCorrect ? '✅ სწორია' : '❌ არასწორია'})\n   - სწორი პასუხი: ${correctChoice}`
      }).join('\n\n')

      const bodyContent = `
=== ST DANCE STUDIO ონლაინ ტესტირების შედეგი (28 რიცხვი) ===

📌 სტუდენტის სახელი და გვარი: ${res.studentName}
👥 ჯგუფი: ${res.group}
📅 თვე: ${res.month}
⏱️ თარიღი: ${res.date}
🏆 საბოლოო ქულა: ${res.correctCount} / ${res.totalCount} (${res.percentage}%)

--- 20 კითხვის დეტალური გარჩევა ---

${answersBreakdown}

==========================================
გაგზავნილია ავტომატურად stdance.ge-ს ონლაინ გამოცდების სისტემიდან.
      `

      // Webhook call to email server / form submission
      await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `📝 ტესტირების შედეგი: ${res.studentName} (${res.percentage}%)`,
          studentName: res.studentName,
          group: res.group,
          month: res.month,
          score: `${res.correctCount}/${res.totalCount} (${res.percentage}%)`,
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
            <h3>📝 {lang === 'ka' ? '28 რიცხვის ყოველთვიური ონლაინ ტესტირება' : 'Monthly Online Examination (28th)'}</h3>
            <p style={{ margin: '4px 0 0 0', color: '#b0ab9f', fontSize: '0.85rem' }}>
              {lang === 'ka' ? 'შეავსეთ სახელი, გვარი და უპასუხეთ თვის 20 შეკითხვას. შედეგი ავტომატურად გაიგზავნება სტუდიის ელ-ფოსტაზე PDF რეპორტით.' : 'Complete the 20 monthly questions. PDF report automatically generated and emailed to studio.'}
            </p>
          </div>
          <button className="exam-close-btn" onClick={onClose}>✕</button>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmitExam} className="exam-modal-body">
            {/* Student Info Bar */}
            <div className="exam-student-form">
              <div className="exam-form-field">
                <label>👤 {lang === 'ka' ? 'მოსწავლის სახელი და გვარი *' : 'Student Full Name *'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'ka' ? 'მაგ: ნინი ბერიძე' : 'e.g. Nini Beridze'}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>

              <div className="exam-form-field">
                <label>👥 {lang === 'ka' ? 'ჯგუფი' : 'Group'}</label>
                <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                  {GROUPS_INFO.map(g => (
                    <option key={g.id} value={g.id}>{g[lang] || g.ka}</option>
                  ))}
                </select>
              </div>

              <div className="exam-form-field">
                <label>📅 {lang === 'ka' ? 'გამოცდის თვე' : 'Exam Month'}</label>
                <input type="text" readOnly value={selectedMonth} />
              </div>
            </div>

            {/* Questions List */}
            <div className="exam-questions-list">
              <h4 style={{ color: 'var(--color-gold, #d4a64a)', marginBottom: '1rem' }}>
                📋 {lang === 'ka' ? '20 საკონტროლო შეკითხვა:' : '20 Examination Questions:'}
              </h4>

              {questionList.map((q, idx) => (
                <div key={q.id} className="exam-q-card">
                  <p className="exam-q-text">
                    <strong>{idx + 1}.</strong> {q[lang === 'ru' ? 'questionRu' : lang === 'en' ? 'questionEn' : 'questionKa']}
                  </p>
                  <div className="exam-options-grid">
                    {(q[lang === 'ru' ? 'optionsRu' : lang === 'en' ? 'optionsEn' : 'optionsKa'] || q.optionsKa).map((opt, optIdx) => (
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
                ✅ {lang === 'ka' ? 'ტესტირების დასრულება & PDF რეპორტის გაგზავნა' : 'Complete Exam & Send PDF Report'}
              </button>
            </div>
          </form>
        ) : (
          <div className="exam-result-card">
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ color: 'var(--color-gold, #d4a64a)', margin: 0 }}>
                {lang === 'ka' ? 'ტესტირება წარმატებით დასრულდა!' : 'Exam Completed Successfully!'}
              </h3>
              <p style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '8px' }}>
                {scoreResult.studentName} • {scoreResult.group.toUpperCase()}
              </p>

              <div style={{
                background: 'rgba(212,166,74,0.15)',
                border: '2px solid var(--color-gold, #d4a64a)',
                display: 'inline-block',
                padding: '12px 28px',
                borderRadius: '16px',
                margin: '1.5rem 0'
              }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff' }}>
                  {scoreResult.correctCount} / {scoreResult.totalCount}
                </span>
                <p style={{ margin: '4px 0 0 0', color: '#f0c878', fontWeight: '600' }}>
                  {scoreResult.percentage}% {scoreResult.percentage >= 80 ? '🌟 (წარჩინებით)' : '👍 (ჩაბარებულია)'}
                </p>
              </div>

              <p style={{ color: '#b0ab9f', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                ✅ PDF სერტიფიკატი გადმოიწერა თქვენს მოწყობილობაში.<br />
                📧 სრული პასუხები და PDF რეპორტი გაიგზავნა მეილზე: <strong>stdancegroupdue@gmail.com</strong>
              </p>

              <button className="exam-submit-btn" onClick={onClose}>
                {lang === 'ka' ? 'დახურვა' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
