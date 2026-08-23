import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { MONTHLY_EXAM_QUESTIONS } from '../data/examData'
import { GROUPS_INFO } from '../data/planCalendarEngine'
import './PublicExamView.css'

export default function PublicExamView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlGroup = searchParams.get('group') || 'baby'
  const urlMonth = searchParams.get('month') || '2026-08'
  const isTeacherViewParam = searchParams.get('preview') === 'true'

  const [studentName, setStudentName] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(urlGroup)
  const [selectedMonth, setSelectedMonth] = useState(urlMonth)
  const [answers, setAnswers] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState(null)
  const [isTeacherMode, setIsTeacherMode] = useState(isTeacherViewParam)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (urlGroup) setSelectedGroup(urlGroup)
    if (urlMonth) setSelectedMonth(urlMonth)
  }, [urlGroup, urlMonth])

  const questionList = MONTHLY_EXAM_QUESTIONS[selectedGroup] || MONTHLY_EXAM_QUESTIONS.baby

  const handleOptionSelect = (qId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }))
  }

  const handleCopyExamLink = () => {
    const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://stdance.ge'
    const shareableUrl = `${currentHost}/exam?group=${selectedGroup}&month=${selectedMonth}`
    
    navigator.clipboard.writeText(shareableUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
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
    // 20 questions = 10 points (0.5 pts each)
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
      date: new Date().toLocaleDateString('ka-GE')
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
      doc.setFontSize(16)
      doc.setTextColor(212, 166, 74) // Gold
      doc.text('ST DANCE STUDIO - MONTHLY EXAMINATION REPORT', 14, 20)

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

      // Save PDF
      doc.save(`ST_Dance_Exam_${res.studentName.replace(/\s+/g, '_')}_Score_${res.score10}_10.pdf`)
    } catch (err) {
      console.error('PDF Generation Error:', err)
    }
  }

  const sendEmailReport = async (res, questions, userAnswers) => {
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
⏱️ თარიღი: ${res.date}

🏆 საბოლოო შეფასება: ${res.score10} / 10 ქულა (20-დან ${res.correctCount} სწორი პასუხი - ${res.percentage}%)

--- 20 კითხვის დეტალური გარჩევა ---

${answersBreakdown}

==========================================
გაგზავნილია ავტომატურად stdance.ge-ს ონლაინ გამოცდების პორტალიდან.
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
    }
  }

  return (
    <div className="pub-exam-container">
      <div className="pub-exam-card">
        {/* Header */}
        <div className="pub-exam-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem' }}>📝</span>
            <div>
              <h2>ST DANCE STUDIO — ონლაინ ტესტირება</h2>
              <p>20 საკონტროლო შეკითხვა • 10-ქულიანი შეფასების სისტემა</p>
            </div>
          </div>

          {/* Teacher Mode & Link Generation Controls */}
          <div className="pub-exam-teacher-bar">
            <button
              className={`pub-exam-mode-btn ${isTeacherMode ? 'active' : ''}`}
              onClick={() => setIsTeacherMode(!isTeacherMode)}
            >
              {isTeacherMode ? '👨‍🏫 მასწავლებლის რეჟიმი (პასუხები გამოჩენილია)' : '👁️ პასუხების გადამოწმება (მასწავლებელი)'}
            </button>

            <button className="pub-exam-copy-btn" onClick={handleCopyExamLink}>
              {copiedLink ? '✅ ლინკი დაკოპირდა!' : '🔗 ტესტის ლინკის კოპირება ჩატისთვის'}
            </button>
          </div>
        </div>

        {/* Group & Month Selector */}
        <div className="pub-exam-controls">
          <div className="pub-exam-control-group">
            <label>👥 აირჩიეთ ჯგუფი:</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value)
                setSearchParams({ group: e.target.value, month: selectedMonth })
              }}
            >
              {GROUPS_INFO.map(g => (
                <option key={g.id} value={g.id}>{g.ka}</option>
              ))}
            </select>
          </div>

          <div className="pub-exam-control-group">
            <label>📅 გამოცდის თვე:</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value)
                setSearchParams({ group: selectedGroup, month: e.target.value })
              }}
            >
              <option value="2026-08">2026 წლის აგვისტო (28 რიცხვი)</option>
              <option value="2026-09">2026 წლის სექტემბერი (28 რიცხვი)</option>
              <option value="2026-10">2026 წლის ოქტომბერი (28 რიცხვი)</option>
              <option value="2026-11">2026 წლის ნოემბერი (28 რიცხვი)</option>
              <option value="2026-12">2026 წლის დეკემბერი (28 რიცხვი)</option>
              <option value="2027-01">2027 წლის იანვარი (28 რიცხვი)</option>
              <option value="2027-02">2027 წლის თებერვალი (28 რიცხვი)</option>
              <option value="2027-03">2027 წლის მარტი (28 რიცხვი)</option>
              <option value="2027-04">2027 წლის აპრილი (28 რიცხვი)</option>
              <option value="2027-05">2027 წლის მაისი (28 რიცხვი)</option>
              <option value="2027-06">2027 წლის ივნისი (28 რიცხვი)</option>
            </select>
          </div>
        </div>

        {/* Teacher Mode Alert Banner */}
        {isTeacherMode && (
          <div className="pub-exam-teacher-banner">
            🎯 <strong>მასწავლებლის რეჟიმი აქტიურია:</strong> ქვემოთ ყველა კითხვაზე მწვანედ მონიშნულია სწორი პასუხი (`✅ სწორი პასუხი`). გადაამოწმეთ კითხვები და ჩააგდეთ გენერირებული ლინკი ჯგუფურ ჩატში.
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmitExam} className="pub-exam-form">
            {/* Student Name */}
            <div className="pub-exam-input-card">
              <label>👤 მოსწავლის სახელი და გვარი *</label>
              <input
                type="text"
                required
                placeholder="შეიყვანეთ თქვენი სახელი და გვარი (მაგ: გიორგი ბერიძე)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {/* Questions List */}
            <div className="pub-exam-q-list">
              <h3 style={{ color: 'var(--color-gold, #d4a64a)', marginBottom: '1.2rem' }}>
                📋 20 საკონტროლო შეკითხვა (თითოეული სწორი პასუხი = 0.5 ქულა):
              </h3>

              {questionList.map((q, idx) => (
                <div key={q.id} className="pub-exam-q-item">
                  <p className="pub-exam-q-title">
                    <strong>{idx + 1}.</strong> {q.questionKa || q.questionEn}
                  </p>

                  <div className="pub-exam-options">
                    {(q.optionsKa || q.optionsEn).map((opt, optIdx) => {
                      const isCorrectAnswerKey = optIdx === q.correct
                      const isUserSelected = answers[q.id] === optIdx

                      return (
                        <label
                          key={optIdx}
                          className={`pub-exam-opt-label ${isUserSelected ? 'selected' : ''} ${isTeacherMode && isCorrectAnswerKey ? 'teacher-correct' : ''}`}
                          onClick={() => handleOptionSelect(q.id, optIdx)}
                        >
                          <input
                            type="radio"
                            name={`pub-q-${q.id}`}
                            checked={isUserSelected}
                            onChange={() => handleOptionSelect(q.id, optIdx)}
                          />
                          <span>
                            {opt}
                            {isTeacherMode && isCorrectAnswerKey && (
                              <strong style={{ color: '#2e7d32', marginLeft: '10px' }}>
                                (✅ სწორი პასუხი)
                              </strong>
                            )}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pub-exam-submit-wrap">
              <button type="submit" className="pub-exam-submit-btn">
                ✅ ტესტირების დასრულება & PDF რეპორტის მიღება
              </button>
            </div>
          </form>
        ) : (
          /* Result Screen */
          <div className="pub-exam-result">
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🎉</div>
            <h2 style={{ color: 'var(--color-gold, #d4a64a)' }}>ტესტირება წარმატებით დასრულდა!</h2>
            <p style={{ fontSize: '1.2rem', color: '#ffffff' }}>
              {scoreResult.studentName} • {scoreResult.group.toUpperCase()}
            </p>

            <div className="pub-exam-score-box">
              <span className="pub-exam-score-num">{scoreResult.score10} / 10 ქულა</span>
              <p>({scoreResult.correctCount} / 20 სწორი პასუხი - {scoreResult.percentage}%)</p>
            </div>

            <p style={{ color: '#b0ab9f', maxWidth: '560px', margin: '1rem auto' }}>
              ✅ PDF სერტიფიკატი გადმოიწერა თქვენს მოწყობილობაში.<br />
              📧 სრული პასუხები და 10-ქულიანი რეპორტი გადაეგზავნა სტუდიის მეილს: <strong>stdancegroupdue@gmail.com</strong>
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button
                className="pub-exam-submit-btn"
                style={{ background: 'transparent', border: '1px solid var(--color-gold, #d4a64a)', color: '#d4a64a' }}
                onClick={() => generatePdfReport(scoreResult, questionList, answers)}
              >
                📥 PDF რეპორტის ჩამოტვირთვა
              </button>
              <button className="pub-exam-submit-btn" onClick={() => setIsSubmitted(false)}>
                🔄 ხელახლა შევსება
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
