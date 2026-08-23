import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { useLanguage } from '../context/LanguageContext'
import { GROUPS_INFO, HOLIDAYS_MAP, TOURNAMENTS_MAP } from '../data/planCalendarEngine'
import { MONTHLY_EXAM_QUESTIONS } from '../data/examData'
import './PlanParentPortal.css'

// Helper: Days in month generator for Calendar Grid
function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function getFirstDayOfWeek(year, monthIndex) {
  const day = new Date(year, monthIndex, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

// Daily Syllabus Data Engine for Parents
function getParentDailyLessonData(groupId, dateKey) {
  const [yearStr, monthStr, dayStr] = dateKey.split('-')
  const dayNum = parseInt(dayStr, 10)

  const lessons = {
    baby: {
      dance: ' Slow Waltz (ნელი ვალსი) & 💃 Cha-Cha-Cha (ჩა-ჩა-ჩა)',
      figures: ['Closed Changes (დახურული ცვლილებები)', 'Natural Turn (მარჯვენა ბრუნი)', 'Time Step (ტაიმ სტეპი)'],
      posture: 'დგომი (Posture): ზურგი გამართული, მხრები ჩაწეული, თავი ოდნავ მარცხნივ.',
      rhythm: 'ვალსი: 1-2-3 (1-ზე ჩაჯდომა, 2-3 აწევა). ჩა-ჩა: 2-3-4-&-1.',
      homePractice: '10 წუთი სარკის წინ: 3-ჯერ Natural Turn (მარჯვენა ბრუნი) და 3-ჯერ Time Step.',
      examQ: 'რა ჰქვია ნელი ვალსის ძირითად მარჯვენა ბრუნს?',
      examA: 'Natural Turn'
    },
    bronze: {
      dance: ' Slow Waltz (ნელი ვალსი) & 💃 Cha-Cha-Cha (ჩა-ჩა-ჩა)',
      figures: ['Natural Turn & Reverse Turn', 'Whisk & Chasse from PP', 'New York & Hand to Hand'],
      posture: 'ხელების სწორი ჩარჩო (Frame), იდაყვები აწეული.',
      rhythm: 'ვალსი: რიტმული დაყოვნება 3-ზე. ჩა-ჩა: მკვეთრი ბარძაყის მოძრაობა.',
      homePractice: '15 წუთი: Whisk & Chasse გადაბმა მუსიკის ტაქტში.',
      examQ: 'რა ჰქვია ჩა-ჩა-ჩას ფიგურას, სადაც ხელს ვკიდებთ პარტნიორს?',
      examA: 'Hand to Hand'
    },
    presilver_silver: {
      dance: ' Quickstep (ქვიქსტეპი) & 💃 Jive (ჯაივი)',
      figures: ['Quarter Turn & Progressive Chasse', 'Forward Lock', 'Fallaway Rock & Link'],
      posture: 'სწრაფი წონის გადატანა, მუხლების რბილი ამორტიზაცია.',
      rhythm: 'ქვიქსტეპი: Slow-Quick-Quick. ჯაივი: 1-2, 3-a-4, 5-a-6.',
      homePractice: '15 წუთი: Jive-ის ძირითადი Rock Step და Link.',
      examQ: 'რა არის ჯაივის ძირითადი რიტმული დათვლა?',
      examA: '1-2, 3-a-4, 5-a-6'
    },
    golden: {
      dance: ' Tango (ტანგო) & 💃 Samba (სამბა)',
      figures: ['Progressive Link & Closed Promenade', 'Back Corté', 'Samba Whisks & Bota Fogos'],
      posture: 'ტანგოს მკვეთრი კომპაქტური დგომი, სამბას Bounse (ზამბარა).',
      rhythm: 'ტანგო: Slow-Slow-Quick-Quick-Slow. სამბა: 1-a-2.',
      homePractice: '20 წუთი: Bota Fogos და Voltas ბალანსის მართვით.',
      examQ: 'რა ჰქვია სამბას ზამბარისებურ მოძრაობას?',
      examA: 'Samba Bounce'
    },
    couples: {
      dance: '🏆 WDSF 10 Dance (ევროპული & ლათინური სატურნირო წყვილები)',
      figures: ['Open Telemark & Wing', 'Paso Doble Appel & Deplacement', 'Rumba Sliding Doors'],
      posture: 'წყვილში კონტაქტი, პარტნიორობა (Lead & Follow), AJS შეფასება.',
      rhythm: 'მუსიკალურობა, სიჩქარე, ექსპრესია და სცენური პრეზენტაცია.',
      homePractice: '20 წუთი: წყვილში ფინალების პრაგონი მუსიკაში.',
      examQ: 'რა ჰქვია WDSF-ის შეფასების ოფიციალურ სისტემას?',
      examA: 'AJS (Absolute Judging System)'
    },
    hobby: {
      dance: '🍷 Adult Hobby Class (სალონური & ლათინური მიქსი)',
      figures: ['Slow Waltz Basic', 'Cha-Cha Social Steps', 'Salsa & Bachata Basic'],
      posture: 'თავისუფალი, პლასტიკური, მხიარული და ენერგიული მოძრაობა.',
      rhythm: 'მუსიკის შეგრძნება და განტვირთვა.',
      homePractice: '10 წუთი: საყვარელი მუსიკის ფონზე ცეკვა!',
      examQ: 'რამდენ ლარს შეადგენს Hobby Class-ის თვიური აბონემენტი?',
      examA: '120 ლარი'
    }
  }

  const groupData = lessons[groupId] || lessons.baby

  return {
    dateDisplay: `${dayNum} ${getMonthKaName(parseInt(monthStr, 10))}, ${yearStr}`,
    ...groupData
  }
}

function getMonthKaName(mNum) {
  const names = ['', 'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
  return names[mNum] || ''
}

export default function Plan() {
  const { lang } = useLanguage()

  // Default to current date (Aug 24, 2026 or Today)
  const [selectedGroup, setSelectedGroup] = useState('baby')
  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonthIdx, setCurrentMonthIdx] = useState(7) // 7 = August (0-indexed)
  const [selectedDateKey, setSelectedDateKey] = useState('2026-08-24')

  const activeGroupObj = GROUPS_INFO.find(g => g.id === selectedGroup) || GROUPS_INFO[0]
  const questionList = MONTHLY_EXAM_QUESTIONS[selectedGroup] || MONTHLY_EXAM_QUESTIONS.baby

  // Generate Calendar Grid Days
  const daysInMonth = getDaysInMonth(currentYear, currentMonthIdx)
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonthIdx)
  const monthStr = String(currentMonthIdx + 1).padStart(2, '0')
  const activeMonthKey = `${currentYear}-${monthStr}`

  const daysArray = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0')
    daysArray.push(`${activeMonthKey}-${dayStr}`)
  }

  const activeLessonData = getParentDailyLessonData(selectedGroup, selectedDateKey)

  // One-Click Pristine Georgian Print / PDF Generator for Parents
  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <div className="parent-portal-page">
      {/* Top Banner */}
      <section className="parent-hero">
        <div className="container">
          <h1 className="parent-main-title">
            რას სწავლობს ჩემი შვილი <span style={{ color: 'var(--color-gold, #d4a64a)', fontStyle: 'italic' }}>დღეს?</span>
          </h1>
          <p className="parent-sub-lead">
            დააჭირეთ კალენდარში დღევანდელ თარიღს და ნახეთ ზუსტად რა ცეკვას, WDSF ფიგურებსა და საგამოცდო მასალას სწავლობს თქვენი შვილის ჯგუფი!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ paddingTop: '1.5rem' }}>
        <div className="container">
          <div className="parent-container-card">

            {/* 1. Select Child's Group */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="parent-sec-title">👥 1. აირჩიეთ ბავშვის ჯგუფი:</label>
              <div className="parent-group-buttons">
                {GROUPS_INFO.map(g => {
                  const isSelected = selectedGroup === g.id
                  return (
                    <button
                      key={g.id}
                      className={`parent-g-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedGroup(g.id)}
                      style={{
                        background: isSelected ? g.color : 'rgba(255,255,255,0.03)',
                        color: isSelected ? '#000' : '#fff',
                        borderColor: isSelected ? g.color : 'rgba(255,255,255,0.1)'
                      }}
                    >
                      {g.ka}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Interactive Month & Calendar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <label className="parent-sec-title">
                  📅 2. კალენდარი — აირჩიეთ თარიღი:
                </label>

                {/* Month Navigator */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className="parent-nav-month-btn"
                    onClick={() => {
                      if (currentMonthIdx === 0) {
                        setCurrentMonthIdx(11)
                        setCurrentYear(y => y - 1)
                      } else {
                        setCurrentMonthIdx(m => m - 1)
                      }
                    }}
                  >
                    ◀
                  </button>
                  <span style={{ fontWeight: 'bold', color: '#d4a64a', minWidth: '130px', textAlign: 'center' }}>
                    {getMonthKaName(currentMonthIdx + 1)} {currentYear}
                  </span>
                  <button
                    className="parent-nav-month-btn"
                    onClick={() => {
                      if (currentMonthIdx === 11) {
                        setCurrentMonthIdx(0)
                        setCurrentYear(y => y + 1)
                      } else {
                        setCurrentMonthIdx(m => m + 1)
                      }
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="parent-cal-grid">
                {['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'].map((d, i) => (
                  <div key={i} className="parent-cal-header-cell">{d}</div>
                ))}

                {/* Calendar Date Cells */}
                {daysArray.map((dateKey, idx) => {
                  if (!dateKey) {
                    return <div key={`empty-${idx}`} className="parent-cal-cell empty"></div>
                  }

                  const dayNum = parseInt(dateKey.split('-')[2], 10)
                  const isSelected = selectedDateKey === dateKey
                  const is28th = dateKey.endsWith('-28')
                  const isHoliday = !!HOLIDAYS_MAP[dateKey]
                  const isTournament = !!TOURNAMENTS_MAP[dateKey]

                  return (
                    <div
                      key={dateKey}
                      className={`parent-cal-cell ${isSelected ? 'selected' : ''} ${is28th ? 'is-exam' : ''} ${isHoliday ? 'is-holiday' : ''} ${isTournament ? 'is-tourn' : ''}`}
                      onClick={() => setSelectedDateKey(dateKey)}
                    >
                      <span className="parent-day-num">{dayNum}</span>
                      {is28th && <span className="parent-cell-badge">📝 ტესტი</span>}
                      {isTournament && !is28th && <span className="parent-cell-badge">🏆</span>}
                      {isHoliday && <span className="parent-cell-badge">🌴</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. TODAY'S LESSON CARD FOR PARENTS (SUPER CLEAN & VISUAL - NO WALL OF TEXT!) */}
            <div className="parent-lesson-card">
              <div className="parent-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>📌</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#d4a64a', fontSize: '1.3rem' }}>
                      გაკვეთილის ბარათი — {activeLessonData.dateDisplay}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: '#b0ab9f' }}>
                      ჯგუფი: <strong>{activeGroupObj.ka}</strong> • მწვრთნელი: <strong>სერგი წივწივაძე</strong>
                    </span>
                  </div>
                </div>

                <button className="parent-card-print-btn" onClick={handlePrintPdf}>
                  🖨️ ამობეჭდვა (PDF)
                </button>
              </div>

              {/* Structured Info Boxes */}
              <div className="parent-boxes-grid">
                
                {/* Box 1: Dance & Figures */}
                <div className="parent-box">
                  <div className="parent-box-icon">💃</div>
                  <h4>დღევანდელი ცეკვა & WDSF ფიგურები</h4>
                  <p className="parent-box-main-text">{activeLessonData.dance}</p>
                  <ul className="parent-pill-list">
                    {activeLessonData.figures.map((fig, i) => (
                      <li key={i}>🔸 {fig}</li>
                    ))}
                  </ul>
                </div>

                {/* Box 2: Posture & Rhythm */}
                <div className="parent-box">
                  <div className="parent-box-icon">✨</div>
                  <h4>დგომი & რიტმი (Posture & Rhythm)</h4>
                  <p><strong>🧍 დგომი (Posture):</strong> {activeLessonData.posture}</p>
                  <p><strong>🎵 რიტმი (Rhythm):</strong> {activeLessonData.rhythm}</p>
                </div>

                {/* Box 3: Home Practice */}
                <div className="parent-box">
                  <div className="parent-box-icon">🏡</div>
                  <h4>სახლის სავარჯიშო (მშობლის ინსტრუქცია)</h4>
                  <p className="parent-box-highlight">{activeLessonData.homePractice}</p>
                  <p style={{ fontSize: '0.85rem', color: '#b0ab9f', marginTop: '6px' }}>
                    💡 საკმარისია 10-15 წუთი დღეში სარკის წინ დგომის დაცვით!
                  </p>
                </div>

                {/* Box 4: Exam Question for 28th */}
                <div className="parent-box exam-box">
                  <div className="parent-box-icon">📝</div>
                  <h4>28 რიცხვის ტესტის საგამოცდო კითხვა</h4>
                  <p><strong>❓ კითხვა:</strong> {activeLessonData.examQ}</p>
                  <p className="parent-exam-ans">✅ <strong>სწორი პასუხი:</strong> {activeLessonData.examA}</p>
                  <Link
                    to={`/exam?group=${selectedGroup}&month=${activeMonthKey}`}
                    className="parent-card-exam-link"
                  >
                    📝 28 რიცხვის ონლაინ ტესტის შევსება ➔
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. DEDICATED PRINTABLE FULL 1-MONTH GEORGIAN STUDY SHEET FOR WINDOW.PRINT() */}
      <div id="printable-parent-sheet">
        <div className="print-header">
          <h2>ST DANCE STUDIO — მშობლის & მოსწავლის თვიური სასწავლო გზამკვლევი</h2>
          <p style={{ fontSize: '1.05rem', margin: '4px 0' }}>
            <strong>ჯგუფი:</strong> {activeGroupObj.ka} | <strong>სასწავლო თვე:</strong> {getMonthKaName(currentMonthIdx + 1)} {currentYear}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#555', margin: '2px 0' }}>
            <strong>მთავარი მწვრთნელი:</strong> სერგი წივწივაძე | <strong>ტელ / WhatsApp:</strong> +995 514 19 99 66
          </p>
        </div>
        <hr style={{ border: 'none', borderTop: '2px solid #b5832a', margin: '14px 0' }} />

        {/* Section 1: Month Syllabus */}
        <div className="print-section">
          <h3>💃 1. თვის საცეკვაო პროგრამა & WDSF ფიგურები:</h3>
          <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '4px 0' }}>{activeLessonData.dance}</p>
          <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
            {activeLessonData.figures.map((fig, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>• {fig}</li>
            ))}
          </ul>
          <p><strong>🧍 დგომი (Posture):</strong> {activeLessonData.posture}</p>
          <p><strong>🎵 რიტმი (Rhythm):</strong> {activeLessonData.rhythm}</p>
          <p style={{ background: '#f8f9fa', borderLeft: '4px solid #b5832a', padding: '8px 12px', margin: '8px 0' }}>
            <strong>🏡 სახლის სავარჯიშო ინსტრუქცია:</strong> {activeLessonData.homePractice}
          </p>
        </div>

        {/* Section 2: Full 20 Exam Questions for the 28th Monthly Test */}
        <div className="print-section print-exam-container" style={{ marginTop: '16px' }}>
          <h3>📚 2. 28 რიცხვის ონლაინ ტესტის საგამოცდო კითხვები ({questionList.length} შეკითხვა):</h3>
          <p style={{ fontSize: '0.88rem', color: '#555', marginBottom: '12px' }}>
            ეს არის 28 რიცხვის ონლაინ ტესტირების 20-ვე შეკითხვა და სწორი პასუხები. მშობელს შეუძლია ამობეჭდოს ეს მასალა და ამეცადინოს ბავშვი თვის განმავლობაში!
          </p>

          <div className="print-questions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questionList.map((q, idx) => {
              const correctChoice = q.optionsKa ? q.optionsKa[q.correct] : q.optionsEn[q.correct]
              return (
                <div key={q.id} style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '8px 12px', background: '#fafafa', pageBreakInside: 'avoid' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {idx + 1}. {q.questionKa || q.questionEn}
                  </p>
                  <p style={{ margin: 0, color: '#2e7d32', fontWeight: '600', fontSize: '0.9rem' }}>
                    ✅ <strong>სწორი პასუხი:</strong> {correctChoice}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="print-footer" style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #ccc', fontSize: '0.82rem', color: '#777', textAlign: 'center' }}>
          ოფიციალური ვებ-საიტი: https://stdance.ge | ონლაინ ტესტირება: https://stdance.ge/exam
        </div>
      </div>
    </div>
  )
}
