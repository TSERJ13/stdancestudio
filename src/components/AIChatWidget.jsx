import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { submitRegistration } from '../data/classcore'
import './AIChatWidget.css'

// Intelligent Smart Knowledge Engine for Website Bot
function getWebsiteBotAnswer(query, lang) {
  const q = query.toLowerCase()

  // 1. General Offerings
  if (
    q.includes('გვთავაზობ') ||
    q.includes('შეთავაზებ') ||
    q.includes('სერვის') ||
    q.includes('რას ასწავლ') ||
    q.includes('რა გაქვთ') ||
    q.includes('offer') ||
    q.includes('services') ||
    q.includes('услуги')
  ) {
    if (lang === 'ka') {
      return `ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების სწავლებას ბათუმში:

1. საბავშვო ჯგუფები (4.5 – 16 წელი: Baby, Bronze, Pre-Silver, Silver, Golden)
2. წყვილების ჯგუფი (ლათინოამერიკული და სტანდარტული ცეკვები)
3. Solo კატეგორია (გოგონებისა და ბიჭებისთვის წყვილის გარეშე)
4. Hobby Class (მოყვარულთა და ზრდასრულთა ჯგუფი)
5. ინდივიდუალური გაკვეთილები (პერსონალური მწვრთნელი)
6. 100%-ით უფასო პირველი საცდელი გაკვეთილი!`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO offers professional Ballroom & Latin Sports Dance instruction in Batumi:

1. Kids Groups (Ages 4.5 to 16: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Couples Group (Latin & Standard)
3. Solo Category (Without partner)
4. Hobby Class (Adults & Amateurs)
5. Private Coaching
6. 100% Free First Trial Lesson!`
    } else {
      return `ST DANCE STUDIO предлагает профессиональное обучение бальным и спортивным танцам в Батуми:

1. Детские группы (от 4.5 до 16 лет: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Группы для пар (Латина и Стандарт)
3. Категория Solo (без партнера)
4. Hobby Class (для взрослых и любителей)
5. Персональные уроки
6. 100% Бесплатный первый пробный урок!`
    }
  }

  // 2. Registration Trigger
  if (
    q.includes('რეგისტრაცი') ||
    q.includes('დამარეგისტრირ') ||
    q.includes('ჩაწერ') ||
    q.includes('register') ||
    q.includes('записаться') ||
    q.includes('зарегистриრ')
  ) {
    if (lang === 'ka') {
      return 'სიამოვნებით! ონლაინ რეგისტრაციის ფორმა გაგიხსენით. გთხოვთ შეავსოთ მოსწავლის მონაცემები.'
    } else if (lang === 'en') {
      return 'With pleasure! The registration form is open. Please fill in your details.'
    } else {
      return 'С удовольствием! Форма онлайн-регистрации открыта. Пожалуйста, заполните данные.'
    }
  }

  // 3. Schedule & Pricing
  if (
    q.includes('განრიგ') ||
    q.includes('ფას') ||
    q.includes('ღირს') ||
    q.includes('აბონემენტ') ||
    q.includes('schedule') ||
    q.includes('price') ||
    q.includes('сколько') ||
    q.includes('цена')
  ) {
    if (lang === 'ka') {
      return `ST DANCE STUDIO — ჯგუფების განრიგი და ფასები:

1. Baby ჯგუფი (4.5 – 6 წელი)
- დღეები: სამშაბათი & ხუთშაბათი 17:30 + შაბათი 10:00
- ფასი: 130₾/თვე

2. Bronze (ბრონზა) ჯგუფი (დამწყებები)
- დღეები: სამშაბათი & ხუთშაბათი 18:15 – 19:15
- ფასი: 130₾/თვე

3. Pre-Silver ჯგუფი (1 წლიანი გამოცდილება)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 17:30
- ფასი: 130₾/თვე

4. Silver ჯგუფი (2+ წლიანი გამოცდილება)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 19:30
- ფასი: 130₾/თვე

5. Golden ჯგუფი (5+ წლიანი გამოცდილება)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 16:30
- ფასი: 130₾/თვე

6. წყვილების ჯგუფი: ორშაბათი, ოთხშაბათი, პარასკევი 18:30 (130₾/თვე)
7. Hobby Class: სამშაბათი & ხუთშაბათი 19:15 (130₾/თვე)
8. ინდივიდუალური: 1 გაკვეთილი = 70₾ | 4 = 240₾ | 8 = 400₾`
    } else {
      return `ST DANCE STUDIO — Schedule & Prices:

1. Baby Group (Ages 4.5 – 6): Tue & Thu 17:30 + Sat 10:00 (130 GEL/mo)
2. Bronze Group (Beginners): Tue & Thu 18:15 (130 GEL/mo)
3. Pre-Silver Group (1 Year Exp.): Mon, Wed, Fri 17:30 (130 GEL/mo)
4. Silver Group (2+ Years Exp.): Mon, Wed, Fri 19:30 (130 GEL/mo)
5. Golden Group (5+ Years Exp.): Mon, Wed, Fri 16:30 (130 GEL/mo)
6. Couples Group: Mon, Wed, Fri 18:30 (130 GEL/mo)
7. Hobby Class: Tue & Thu 19:15 (130 GEL/mo)
8. Private Coaching: 1 Class = 70₾ | 4 = 240₾ | 8 = 400₾`
    }
  }

  // 4. Location
  if (
    q.includes('სად') ||
    q.includes('მისამართ') ||
    q.includes('მდებარეობ') ||
    q.includes('where') ||
    q.includes('address') ||
    q.includes('где')
  ) {
    if (lang === 'ka') {
      return 'მისამართი: ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55 (3-სართულიანი თეთრი შენობის მე-3 სართული, შესასვლელი ბალოტისფერი სახლის ჭიშკრიდან). ტელ: +995 514 19 99 66.'
    } else {
      return 'Location: 55 Eka Takaishvili St, Batumi (3rd floor of 3-story white building). Tel: +995 514 19 99 66.'
    }
  }

  // General response
  if (lang === 'ka') {
    return 'ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების სწავლებას 4.5-დან 16 წლამდე ბავშვებისთვის, წყვილებისთვის და მოყვარულებისთვის (Hobby Class). პირველი საცდელი გაკვეთილი 100%-ით უფასოა!'
  } else {
    return 'ST DANCE STUDIO offers Ballroom & Sports Dance training for kids 4.5 to 16 yrs, couples, and adults. First trial class is 100% Free!'
  }
}

export default function AIChatWidget() {
  const { lang, t } = useLanguage()
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
                ? 'სიამოვნებით! ონლაინ რეგისტრაციის ფორმა გაგიხსენით. გთხოვთ შეავსოთ მოსწავლის მონაცემები.'
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
    }, 450)
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
      {/* 1. FLOATING 3D ANIMATED ROBOT MASCOT BUTTON */}
      <div className="std-bot-widget-container">
        {/* Floating Tooltip Bubble */}
        {!isOpen && (
          <div className="std-bot-tooltip-bubble" onClick={() => setIsOpen(true)}>
            <span className="std-bot-pulse-dot"></span>
            <span>🤖 AI ასისტენტი • გაქვს კითხვები?</span>
          </div>
        )}

        {/* 3D Animated Robot Mascot Trigger */}
        <button
          className={`std-bot-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="ST Dance AI Chatbot"
        >
          <div className="std-bot-avatar-3d-wrap">
            {/* 3D Glossy Sphere Background */}
            <div className="std-bot-3d-sphere"></div>
            {/* Robot Face / Icon */}
            <svg
              className="std-bot-3d-robot-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="11" width="18" height="10" rx="4" />
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
              <path d="M12 2v4" />
              <circle cx="12" cy="2" r="1" fill="currentColor" />
              <path d="M10 19h4" strokeLinecap="round" />
            </svg>
            <span className="std-bot-ring-aura"></span>
          </div>
        </button>
      </div>

      {/* 2. CHAT MODAL / FULLSCREEN MOBILE DRAWER */}
      {isOpen && (
        <div className="std-bot-overlay" onClick={() => setIsOpen(false)}>
          <div className="std-bot-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Top Drag Indicator */}
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
                  {isRegMode ? '💬 ჩატზე დაბრუნება' : '✨ რეგისტრაცია'}
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
                    <h4 className="std-bot-reg-title">✨ ონლაინ რეგისტრაცია</h4>
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

                {/* Quick Suggestion Pills */}
                <div className="std-bot-pills-row">
                  <button className="std-bot-pill" onClick={() => handleSend('რა ღირს აბონემენტი?')}>
                    💰 რა ღირს აბონემენტი?
                  </button>
                  <button className="std-bot-pill" onClick={() => handleSend('როდის არის გაკვეთილები?')}>
                    📅 განრიგი
                  </button>
                  <button className="std-bot-pill" onClick={() => handleSend('მინდა რეგისტრაცია')}>
                    ✨ რეგისტრაცია
                  </button>
                  <button className="std-bot-pill" onClick={() => handleSend('სად მდებარეობს სტუდია?')}>
                    📍 მისამართი
                  </button>
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
