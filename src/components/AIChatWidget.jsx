import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { submitRegistration } from '../data/classcore'
import './AIChatWidget.css'

// Intelligent Smart Knowledge Engine for Website Bot
function getWebsiteBotAnswer(query, lang) {
  // Strip emojis & normalize query
  const cleanQ = query
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim()
    .toLowerCase()

  // 1. Pricing / Fasi / Cost
  if (
    cleanQ.includes('რა ღირს') ||
    cleanQ.includes('ფას') ||
    cleanQ.includes('აბონემენტ') ||
    cleanQ.includes('ღირს') ||
    cleanQ.includes('გადახდ') ||
    cleanQ.includes('price') ||
    cleanQ.includes('cost') ||
    cleanQ.includes('цена') ||
    cleanQ.includes('сколько')
  ) {
    if (lang === 'ka') {
      return `💰 ST DANCE STUDIO — ფასები და აბონემენტები:

🎁 პირველი საცდელი გაკვეთილი: 100% უფასოა!

🔹 თვიური აბონემენტი (ჯგუფური): 130₾ / თვე (12 მეცადინეობა)
🔹 დედმამიშვილების ფასდაკლება: 100₾ 1 მოსწავლეზე

👤 ინდივიდუალური გაკვეთილები:
• 1 გაკვეთილი = 70₾
• 4 გაკვეთილის პაკეტი = 240₾
• 8 გაკვეთილის პაკეტი = 400₾`
    } else if (lang === 'en') {
      return `💰 ST DANCE STUDIO — Prices & Packages:

🎁 First Trial Lesson: 100% FREE!

🔹 Monthly Subscription: 130 GEL / month (12 sessions)
🔹 Sibling Discount: 100 GEL per student

👤 Private Coaching:
• 1 Lesson = 70 GEL
• 4 Lessons Package = 240 GEL
• 8 Lessons Package = 400 GEL`
    } else {
      return `💰 ST DANCE STUDIO — Цены и Абонементы:

🎁 Первый пробный урок: 100% Бесплатно!

🔹 Месячный абонемент: 130 GEL / месяц (12 занятий)
🔹 Скидка для сестер/братьев: 100 GEL за ученика

👤 Индивидуальные уроки:
• 1 урок = 70 GEL
• Пакет 4 урока = 240 GEL
• Пакет 8 уроков = 400 GEL`
    }
  }

  // 2. Schedule / Ganrigi
  if (
    cleanQ.includes('განრიგ') ||
    cleanQ.includes('გრაფიკ') ||
    cleanQ.includes('როდის') ||
    cleanQ.includes('საათ') ||
    cleanQ.includes('დღე') ||
    cleanQ.includes('schedule') ||
    cleanQ.includes('days') ||
    cleanQ.includes('расписание')
  ) {
    if (lang === 'ka') {
      return `📅 ST DANCE STUDIO — მეცადინეობების განრიგი:

👶 Baby ჯგუფი (4.5 – 6 წელი)
• სამშაბათი & ხუთშაბათი: 17:30 + შაბათი: 10:00

🥉 Bronze (ბრონზა) ჯგუფი (დამწყებები)
• სამშაბათი & ხუთშაბათი: 18:15 – 19:15

🥈 Pre-Silver ჯგუფი (1 წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 17:30

🥇 Silver ჯგუფი (2+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 19:30

🏆 Golden ჯგუფი (5+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 16:30

💃 წყვილების ჯგუფი
• ორშაბათი, ოთხშაბათი, პარასკევი: 18:30

✨ Hobby Class (ზრდასრულები/მოყვარულები)
• სამშაბათი & ხუთშაბათი: 19:15 – 20:15`
    } else {
      return `📅 ST DANCE STUDIO — Class Schedule:

👶 Baby Group (Ages 4.5 – 6): Tue & Thu 17:30 + Sat 10:00
🥉 Bronze Group (Beginners): Tue & Thu 18:15
🥈 Pre-Silver Group (1 Yr Exp): Mon, Wed, Fri 17:30
🥇 Silver Group (2+ Yrs Exp): Mon, Wed, Fri 19:30
🏆 Golden Group (5+ Yrs Exp): Mon, Wed, Fri 16:30
💃 Couples Group: Mon, Wed, Fri 18:30
✨ Hobby Class (Adults): Tue & Thu 19:15`
    }
  }

  // 3. Location / Misamarti
  if (
    cleanQ.includes('მისამართ') ||
    cleanQ.includes('სად') ||
    cleanQ.includes('მდებარეობ') ||
    cleanQ.includes('location') ||
    cleanQ.includes('address') ||
    cleanQ.includes('где') ||
    cleanQ.includes('ადრეს')
  ) {
    if (lang === 'ka') {
      return `📍 ST DANCE STUDIO — ლოკაცია:

🏛️ ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55
(3-სართულიანი თეთრი შენობის მე-3 სართული, შესასვლელი ბალოტისფერი სახლის ჭიშკრიდან).

📞 ტელეფონი / WhatsApp: +995 514 19 99 66`
    } else {
      return `📍 ST DANCE STUDIO — Location:

🏛️ 55 Eka Takaishvili St, Batumi (3rd Floor of white building).
📞 Phone / WhatsApp: +995 514 19 99 66`
    }
  }

  // 4. Registration Intent
  if (
    cleanQ.includes('რეგისტრაცი') ||
    cleanQ.includes('დამარეგისტრირ') ||
    cleanQ.includes('ჩაწერ') ||
    cleanQ.includes('register') ||
    cleanQ.includes('записаться')
  ) {
    if (lang === 'ka') {
      return '✨ ონლაინ რეგისტრაციის ფორმა გაგიხსენით! გთხოვთ შეავსოთ მოსწავლის მონაცემები.'
    } else {
      return '✨ Online registration form opened! Please fill in the details.'
    }
  }

  // 5. Offerings / Services
  if (
    cleanQ.includes('გვთავაზობ') ||
    cleanQ.includes('შეთავაზებ') ||
    cleanQ.includes('სერვის') ||
    cleanQ.includes('რას ასწავლ') ||
    cleanQ.includes('რა გაქვთ') ||
    cleanQ.includes('offer') ||
    cleanQ.includes('services')
  ) {
    if (lang === 'ka') {
      return `🏆 ST DANCE STUDIO გთავაზობთ:

1️⃣ საბავშვო ჯგუფები (4.5-დან 16 წლამდე)
2️⃣ წყვილების ჯგუფი (ლათინო და სტანდარტი)
3️⃣ Solo კატეგორია (წყვილის გარეშე)
4️⃣ Hobby Class (ზრდასრულები და მოყვარულები)
5️⃣ ინდივიდუალური გაკვეთილები

🎁 100%-ით უფასო პირველი საცდელი გაკვეთილი!`
    } else {
      return `🏆 ST DANCE STUDIO offers:

1️⃣ Kids Groups (Ages 4.5 – 16)
2️⃣ Couples Group (Latin & Standard)
3️⃣ Solo Category (Without partner)
4️⃣ Hobby Class (Adults)
5️⃣ Private Coaching

🎁 100% Free First Trial Lesson!`
    }
  }

  // Default response
  if (lang === 'ka') {
    return `✨ ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების სწავლებას 4.5-დან 16 წლამდე ბავშვებისთვის, წყვილებისთვის და ზრდასრულებისთვის.

🎁 პირველი საცდელი გაკვეთილი 100%-ით უფასოა! ჩასაწერად დააჭირეთ "რეგისტრაცია"-ს.`
  } else {
    return `✨ ST DANCE STUDIO offers Ballroom & Sports Dance training for kids, couples, and adults. First trial lesson is 100% Free!`
  }
}

export default function AIChatWidget() {
  const { lang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Registration Sub-Form State
  const [isRegMode, setIsRegMode] = useState(false)
  const [regForm, setRegForm] = useState({
    student_name: '',
    birth_date: '',
    shift: 'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)',
    parent_name: '',
    parent_phone: ''
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text:
        lang === 'ka'
          ? 'გამარჯობა! მე ვარ ST Dance Studio-ს AI ასისტენტი. რა გაინტერესებთ სტუდიის შესახებ?'
          : lang === 'en'
          ? 'Hello! I am ST Dance Studio AI Assistant. How can I help you today?'
          : 'Здравствуйте! Я AI-помощник ST Dance Studio. Чем могу помочь?'
    }
  ])

  // Listen for custom global trigger event "open-ai-chat"
  useEffect(() => {
    const handleGlobalOpen = () => setIsOpen(true)
    window.addEventListener('open-ai-chat', handleGlobalOpen)
    return () => window.removeEventListener('open-ai-chat', handleGlobalOpen)
  }, [])

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isRegMode, isTyping])

  const handleSend = (textToSend) => {
    const query = textToSend || inputMsg
    if (!query.trim() || isTyping) return

    const newMsgs = [...messages, { role: 'user', text: query }]
    setMessages(newMsgs)
    setInputMsg('')
    setIsTyping(true)

    // Check registration intent
    const qLower = query.toLowerCase()
    if (
      qLower.includes('რეგისტრაცი') ||
      qLower.includes('დამარეგისტრირ') ||
      qLower.includes('ჩაწერ') ||
      qLower.includes('register') ||
      qLower.includes('записаться')
    ) {
      setTimeout(() => {
        setIsTyping(false)
        setIsRegMode(true)
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text:
              lang === 'ka'
                ? '✨ ონლაინ რეგისტრაციის ფორმა გაგიხსენით. გთხოვთ შეავსოთ მოსწავლის მონაცემები.'
                : 'With pleasure! Please fill out the registration form below.'
          }
        ])
      }, 350)
      return
    }

    // Instant Smart Answer
    setTimeout(() => {
      const answer = getWebsiteBotAnswer(query, lang)
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: 'bot', text: answer }])
    }, 400)
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    if (!regForm.student_name || !regForm.birth_date || !regForm.parent_name || !regForm.parent_phone) {
      return
    }
    setRegLoading(true)
    const res = await submitRegistration({
      student_name: regForm.student_name,
      birth_date: regForm.birth_date,
      shift: regForm.shift,
      parent_name: regForm.parent_name,
      parent_phone: regForm.parent_phone,
      status: 'pending'
    })
    setRegLoading(false)
    if (res) {
      setRegSuccess(true)
      setRegForm({
        student_name: '',
        birth_date: '',
        shift: 'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)',
        parent_name: '',
        parent_phone: ''
      })
    }
  }

  return (
    <>
      {/* 1. FLOATING LUXURY OBSIDIAN & CHAMPAGNE GOLD BOT BUTTON */}
      <div className="std-bot-widget-container">
        {/* Floating Tooltip Bubble */}
        {!isOpen && (
          <div className="std-bot-tooltip-bubble" onClick={() => setIsOpen(true)}>
            <span className="std-bot-pulse-dot"></span>
            <span>AI ასისტენტი • გაქვს კითხვები?</span>
          </div>
        )}

        {/* 3D Gold & Obsidian Mascot Trigger */}
        <button
          className={`std-bot-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="ST Dance AI Chatbot"
        >
          <div className="std-bot-avatar-3d-wrap">
            {/* Dark Obsidian Circle with Gold Border */}
            <div className="std-bot-3d-sphere"></div>
            {/* Pure Champagne Gold Robot Icon */}
            <svg
              className="std-bot-3d-robot-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="10" rx="4" fill="rgba(212,175,55,0.1)" />
              <circle cx="8.5" cy="15.5" r="1.5" fill="#d4af37" className="robot-eye" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="#d4af37" className="robot-eye" />
              <path d="M12 2v4" stroke="#d4af37" strokeLinecap="round" />
              <circle cx="12" cy="2" r="1.2" fill="#d4af37" />
              <path d="M9.5 19h5" stroke="#d4af37" strokeLinecap="round" />
            </svg>
            <span className="std-bot-ring-aura"></span>
          </div>
        </button>
      </div>

      {/* 2. CHAT MODAL / FULLSCREEN MOBILE DRAWER */}
      {isOpen && (
        <div className="std-bot-overlay" onClick={() => setIsOpen(false)}>
          <div className="std-bot-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Top Drag Handle */}
            <div className="std-bot-mobile-handle"></div>

            {/* Modal Header */}
            <div className="std-bot-header">
              <div className="std-bot-header-info">
                <div className="std-bot-avatar-badge">
                  <span>AI</span>
                </div>
                <div>
                  <h3 className="std-bot-title">ST Dance AI</h3>
                  <p className="std-bot-subtitle">ონლაინ ასისტენტი • 24/7</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`std-bot-mode-btn ${isRegMode ? 'active' : ''}`}
                  onClick={() => setIsRegMode(!isRegMode)}
                >
                  {isRegMode ? 'ჩატზე დაბრუნება' : 'რეგისტრაცია'}
                </button>
                <button className="std-bot-close-btn" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Registration Mode OR Normal Chat */}
            {isRegMode ? (
              <div className="std-bot-reg-container">
                {regSuccess ? (
                  <div className="std-bot-reg-success">
                    <div className="std-bot-success-icon">✓</div>
                    <h4>რეგისტრაცია მიღებულია!</h4>
                    <p>ჩვენი ადმინისტრატორი მალე დაგიკავშირდებათ WhatsApp-ზე ან ტელეფონზე.</p>
                    <button
                      className="std-bot-submit-btn"
                      onClick={() => {
                        setRegSuccess(false)
                        setIsRegMode(false)
                      }}
                    >
                      ჩატზე დაბრუნება
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegSubmit} className="std-bot-reg-form">
                    <h4 className="std-bot-reg-title">ონლაინ რეგისტრაცია</h4>
                    <p className="std-bot-reg-sub">ჩაეწერეთ 100%-ით უფასო საცდელ გაკვეთილზე</p>

                    <div className="std-bot-form-group">
                      <label>მოსწავლის სახელი და გვარი *</label>
                      <input
                        type="text"
                        required
                        placeholder="მაგ: ნინი წივწივაძე"
                        value={regForm.student_name}
                        onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>დაბადების თარიღი *</label>
                      <input
                        type="date"
                        required
                        value={regForm.birth_date}
                        onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>სასურველი ჯგუფი *</label>
                      <select
                        value={regForm.shift}
                        onChange={(e) => setRegForm({ ...regForm, shift: e.target.value })}
                      >
                        <option>Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)</option>
                        <option>Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)</option>
                        <option>Pre-Silver ჯგუფი (1 წელი) | 17:30 (130₾/თვე)</option>
                        <option>Silver ჯგუფი (2+ წელი) | 19:30 (130₾/თვე)</option>
                        <option>Golden ჯგუფი (5+ წელი) | 16:30 (130₾/თვე)</option>
                        <option>წყვილების ჯგუფი | 18:30 (130₾/თვე)</option>
                        <option>Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (130₾/თვე)</option>
                        <option>ინდივიდუალური გაკვეთილები (70₾ - 400₾)</option>
                      </select>
                    </div>

                    <div className="std-bot-form-group">
                      <label>მშობლის სახელი და გვარი *</label>
                      <input
                        type="text"
                        required
                        placeholder="მაგ: გიორგი წივწივაძე"
                        value={regForm.parent_name}
                        onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>მშობლის ტელეფონი (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+995 5XX XX XX XX"
                        value={regForm.parent_phone}
                        onChange={(e) => setRegForm({ ...regForm, parent_phone: e.target.value })}
                      />
                    </div>

                    <button type="submit" disabled={regLoading} className="std-bot-submit-btn">
                      {regLoading ? 'იგზავნება...' : 'რეგისტრაციის გაგზავნა ➔'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="std-bot-chat-body">
                {/* Messages Viewport */}
                <div className="std-bot-messages-viewport">
                  {messages.map((m, i) => (
                    <div key={i} className={`std-bot-msg-row ${m.role}`}>
                      <div className="std-bot-msg-bubble">{m.text}</div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="std-bot-msg-row bot">
                      <div className="std-bot-msg-bubble typing">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Fixed Non-Squishing Quick Suggestion Pills Row */}
                <div className="std-bot-pills-wrapper">
                  <div className="std-bot-pills-row">
                    <button className="std-bot-pill" onClick={() => handleSend('რა ღირს აბონემენტი?')}>
                      💰 რა ღირს აბონემენტი?
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend('მეცადინეობების განრიგი')}>
                      📅 განრიგი
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend('მინდა რეგისტრაცია')}>
                      ✨ რეგისტრაცია
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend('სად მდებარეობს სტუდია?')}>
                      📍 მისამართი
                    </button>
                  </div>
                </div>

                {/* Chat Input Form */}
                <form
                  className="std-bot-input-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                >
                  <input
                    type="text"
                    className="std-bot-input"
                    placeholder="ჰკითხეთ AI-ს რაიმე..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                  />
                  <button type="submit" className="std-bot-send-btn" disabled={!inputMsg.trim()}>
                    ➔
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
