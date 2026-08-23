import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { useLanguage } from '../context/LanguageContext'
import { GROUPS_INFO } from '../data/planCalendarEngine'
import { MONTHLY_EXAM_QUESTIONS } from '../data/examData'
import './PlanParentPortal.css'

export default function Plan() {
  const { lang } = useLanguage()
  const [selectedGroup, setSelectedGroup] = useState('baby')
  const [selectedMonth, setSelectedMonth] = useState('2026-08')
  const [viewTab, setViewTab] = useState('today') // 'today' | 'week' | 'month'

  const activeGroupObj = GROUPS_INFO.find(g => g.id === selectedGroup) || GROUPS_INFO[0]
  const questionList = MONTHLY_EXAM_QUESTIONS[selectedGroup] || MONTHLY_EXAM_QUESTIONS.baby

  // Generate & Download Parent Printable Study Sheet (PDF)
  const handlePrintStudySheet = () => {
    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(16)
      doc.setTextColor(212, 166, 74) // Gold
      doc.text('ST DANCE STUDIO - PARENT & STUDENT HOME STUDY GUIDE', 14, 20)

      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text(`Group: ${activeGroupObj.ka} | Month: ${selectedMonth}`, 14, 30)
      doc.text(`Head Coach: Sergi Tsivtsivadze | Contact: +995 514 19 99 66`, 14, 36)
      doc.text(`Print Date: ${new Date().toLocaleDateString('ka-GE')}`, 14, 42)

      doc.setLineWidth(0.5)
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 46, 196, 46)

      // Section 1: Lesson & WDSF Figures
      doc.setFontSize(13)
      doc.setTextColor(212, 166, 74)
      doc.text('1. TODAY & THIS MONTH WDSF DANCE FIGURES:', 14, 56)

      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      doc.text('- Slow Waltz & Cha-Cha-Cha Core Footwork & Posture', 18, 64)
      doc.text('- Home Practice: 15 mins daily posture alignment & timing practice with music.', 18, 70)

      // Section 2: 20 Exam Questions & Answers for 28th Monthly Exam
      doc.setFontSize(13)
      doc.setTextColor(212, 166, 74)
      doc.text('2. MONTHLY EXAM STUDY GUIDE (20 QUESTIONS & ANSWER KEY):', 14, 82)

      let yPos = 92
      doc.setFontSize(9)

      questionList.forEach((q, idx) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        const qTitle = `${idx + 1}. ${q.questionKa}`
        const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]

        doc.setTextColor(0, 0, 0)
        doc.text(doc.splitTextToSize(qTitle, 180), 14, yPos)
        yPos += 6

        doc.setTextColor(34, 139, 34) // Green for correct answer
        doc.text(`Correct Answer: ${correctChoice}`, 18, yPos)
        yPos += 8
      })

      // Download
      doc.save(`ST_Dance_Study_Guide_${selectedGroup}_${selectedMonth}.pdf`)
    } catch (e) {
      console.error('PDF Export Error:', e)
    }
  }

  return (
    <div className="parent-portal-page">
      {/* Page Hero */}
      <section className="parent-hero">
        <div className="container">
          <div className="parent-hero-top">
            <span className="parent-eyebrow">👨‍👩‍👧 მშობლის & მოსწავლის სასწავლო პორტალი</span>
            <Link to="/coachplan" className="parent-coach-link">
              👨‍🏫 მწვრთნელების WDSF სილაბუსი & ალგორითმი (/coachplan) ➔
            </Link>
          </div>

          <h1 className="parent-title">
            რას სწავლობს ჩემი შვილი <br />
            <span className="parent-title-italic">დღეს, ამ კვირას და ამ თვეში?</span>
          </h1>

          <p className="parent-lead">
            აირჩიეთ თქვენი შვილის ჯგუფი და თვე. გაეცანით დღევანდელი გაკვეთილის თემას, WDSF ფიგურებსა და 28 რიცხვის ონლაინ ტესტირების 20 საგამოცდო შეკითხვას. ჩამოტვირთეთ დასაბეჭდი სასწავლო ფურცელი სახლში სამეცადინოდ!
          </p>

          {/* Download / Print Study Sheet Button */}
          <div className="parent-download-wrap">
            <button className="parent-download-btn" onClick={handlePrintStudySheet}>
              🖨️ / 📥 ბავშვის სასწავლო მასალის ჩამოტვირთვა / ამობეჭდვა (PDF)
            </button>
            <a
              href={`/exam?group=${selectedGroup}&month=${selectedMonth}`}
              target="_blank"
              rel="noopener noreferrer"
              className="parent-exam-link-btn"
            >
              📝 28 რიცხვის ონლაინ ტესტის შევსება ➔
            </a>
          </div>
        </div>
      </section>

      {/* Main Interactive Portal Body */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="parent-card">

            {/* 1. Group Selector */}
            <div className="parent-group-selector">
              <label className="parent-label">👥 აირჩიეთ ბავშვის ჯგუფი:</label>
              <div className="parent-group-grid">
                {GROUPS_INFO.map((g) => {
                  const isSelected = selectedGroup === g.id
                  return (
                    <button
                      key={g.id}
                      className={`parent-group-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedGroup(g.id)}
                      style={{
                        borderColor: isSelected ? g.color : 'rgba(255,255,255,0.1)',
                        background: isSelected ? `${g.color}25` : 'rgba(255,255,255,0.03)'
                      }}
                    >
                      {g.ka}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Month Selector */}
            <div className="parent-month-selector">
              <label className="parent-label">📅 სასწავლო თვე:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="parent-month-select"
              >
                <option value="2026-08">2026 წლის აგვისტო (II ნახევარი)</option>
                <option value="2026-09">2026 წლის სექტემბერი</option>
                <option value="2026-10">2026 წლის ოქტომბერი</option>
                <option value="2026-11">2026 წლის ნოემბერი</option>
                <option value="2026-12">2026 წლის დეკემბერი</option>
                <option value="2027-01">2027 წლის იანვარი</option>
                <option value="2027-02">2027 წლის თებერვალი</option>
                <option value="2027-03">2027 წლის მარტი</option>
                <option value="2027-04">2027 წლის აპრილი</option>
                <option value="2027-05">2027 წლის მაისი</option>
                <option value="2027-06">2027 წლის ივნისი</option>
              </select>
            </div>

            {/* 3. View Mode Navigation Tabs */}
            <div className="parent-tabs">
              <button
                className={`parent-tab-btn ${viewTab === 'today' ? 'active' : ''}`}
                onClick={() => setViewTab('today')}
              >
                📌 დღევანდელი გაკვეთილი (Today)
              </button>
              <button
                className={`parent-tab-btn ${viewTab === 'week' ? 'active' : ''}`}
                onClick={() => setViewTab('week')}
              >
                📅 ამ კვირის პროგრამა (This Week)
              </button>
              <button
                className={`parent-tab-btn ${viewTab === 'month' ? 'active' : ''}`}
                onClick={() => setViewTab('month')}
              >
                📚 ამ თვის საგამოცდო მასალა (28 რიცხვის ტესტი)
              </button>
            </div>

            {/* 4. Tab Content */}

            {/* TAB 1: TODAY'S LESSON */}
            {viewTab === 'today' && (
              <div className="parent-tab-content">
                <div className="parent-badge-bar">
                  <span className="parent-tag-badge" style={{ background: activeGroupObj.color, color: '#000' }}>
                    {activeGroupObj.ka}
                  </span>
                  <span className="parent-tag-badge" style={{ background: 'rgba(212,166,74,0.2)', color: '#f0c878' }}>
                    60-წუთიანი გაკვეთილი • მთავარი მწვრთნელი: სერგი წივწივაძე
                  </span>
                </div>

                <div className="parent-section-grid">
                  <div className="parent-info-box">
                    <h4>💃 დღევანდელი საცეკვაო თემა & WDSF ფიგურები:</h4>
                    <ul>
                      <li><strong>ნელი ვალსი (Slow Waltz):</strong> Closed Changes, Natural Turn, Hesitation Change.</li>
                      <li><strong>ჩა-ჩა-ჩა (Cha-Cha-Cha):</strong> Time Step, Basic Movement, New York & Hand to Hand.</li>
                      <li><strong>რიტმი & მუსიკალურობა:</strong> 3/4 ტაქტი ვალსში (1-2-3 count) და 4/4 ტაქტი ჩა-ჩა-ჩაში (2-3-4-&-1).</li>
                    </ul>
                  </div>

                  <div className="parent-info-box">
                    <h4>⏱️ 60-წუთიანი გაკვეთილის განრიგი დარბაზში:</h4>
                    <ul>
                      <li><strong>15 წუთი:</strong> ტრენაჟი / ფეხის ტექნიკა (Footwork) & დგომის (Posture) გასწორება.</li>
                      <li><strong>30 წუთი:</strong> ახალი WDSF ფიგურების ახსნა და დეტალური დამუშავება.</li>
                      <li><strong>15 წუთი:</strong> პრაქტიკა მუსიკაში დახვეწით & ფინალების შეუჩერებელი პრაგონი.</li>
                    </ul>
                  </div>
                </div>

                <div className="parent-home-guide">
                  💡 <strong>რჩევა მშობელს სახლში სამეცადინოდ:</strong> სთხოვეთ ბავშვს აჩვენოს დღეს ნასწავლი "Natural Turn" ვალსში ან "New York" ჩა-ჩა-ჩაში. საკმარისია 10-15 წუთი დღეში სარკის წინ დგომის დაცვით!
                </div>
              </div>
            )}

            {/* TAB 2: THIS WEEK'S FOCUS */}
            {viewTab === 'week' && (
              <div className="parent-tab-content">
                <h3 style={{ color: '#d4a64a', marginTop: 0 }}>📅 ამ კვირის მთავარი საგანმანათლებლო ფოკუსი:</h3>
                
                <div className="parent-section-grid">
                  <div className="parent-info-box">
                    <h4>🎯 ტექნიკური მიზნები კვირის განმავლობაში:</h4>
                    <ul>
                      <li><strong>ტანსადგამი (Posture & Frame):</strong> ზურგის გამართვა, მხრების ჩაწევა და თავის სწორი პოზიცია.</li>
                      <li><strong>ფეხის ტექნიკა (Footwork):</strong> Heel-Toe (ქუსლი-წვეტი) გადაგორება ვალსში და Ball-Flat ჩა-ჩა-ჩაში.</li>
                      <li><strong>ბალანსი & წონა:</strong> წონის გადატანა მარცხენა ფეხიდან მარჯვენაზე მუსიკის ტაქტში.</li>
                    </ul>
                  </div>

                  <div className="parent-info-box">
                    <h4>✨ შაბათის სპეციალური ინტენსივი (13:00 - 15:00):</h4>
                    <ul>
                      <li>120 წუთიანი კომპლექსური ვარჯიში სატურნირო ჯგუფებისთვის.</li>
                      <li>საბალეტო კლასიკა, ქორეოგრაფია, ფიზიკური მომზადება (OFP) და სრული გაწელვები.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MONTHLY EXAM STUDY GUIDE */}
            {viewTab === 'month' && (
              <div className="parent-tab-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                  <h3 style={{ color: '#d4a64a', margin: 0 }}>
                    📚 28 რიცხვის ონლაინ ტესტის საგამოცდო კითხვები ({questionList.length} შეკითხვა):
                  </h3>
                  <button className="parent-download-btn" onClick={handlePrintStudySheet} style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    🖨️ ამობეჭდე ეს მასალა (PDF)
                  </button>
                </div>

                <p style={{ color: '#b0ab9f', fontSize: '0.95rem' }}>
                  ეს არის 20 საგამოცდო შეკითხვა და სწორი პასუხები, რომლითაც მშობელს შეუძლია ამეცადინოს ბავშვი თვის განმავლობაში. 28 რიცხვში ბავშვი აბარებს ამ ონლაინ ტესტს 10-ქულიან სისტემაში!
                </p>

                <div className="parent-exam-questions-list">
                  {questionList.map((q, idx) => {
                    const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]
                    return (
                      <div key={q.id} className="parent-q-card">
                        <p className="parent-q-title">
                          <strong>{idx + 1}.</strong> {q.questionKa || q.questionEn}
                        </p>
                        <div className="parent-q-answer">
                          ✅ <strong>სწორი პასუხი:</strong> {correctChoice}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  )
}
