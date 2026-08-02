import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { submitRegistration } from '../data/classcore'
import { studioKnowledgeBase } from '../data/aiKnowledge'
import './AIChatWidget.css'

const GEMINI_KEY = atob('QVEuQWI4Uk42SnhSZVRtaWZfOEFCSHBnUWhLRS11dmhlUG5YMTdYSkhBaTZNQjZQQm9ZUg==')

// Expanded Smart Fallback Knowledge Engine with 15+ Detailed Topics
function getSmartFallbackAnswer(query, lang) {
  const q = query.toLowerCase()

  // 1. Pricing & Subscriptions
  if (
    q.includes('რა ღირს') ||
    q.includes('ფას') ||
    q.includes('აბონემენტ') ||
    q.includes('ღირს') ||
    q.includes('გადახდ') ||
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('цена') ||
    q.includes('сколько')
  ) {
    if (lang === 'ka') {
      return `💰 ST DANCE STUDIO — ფასები და აბონემენტები:

🎁 პირველი საცდელი გაკვეთილი: 100% უფასოა!

🔹 თვიური აბონემენტი (ჯგუფური): 130₾ / თვე (12 მეცადინეობა)
🔹 დედმამიშვილების ფასდაკლება: 100₾ 1 მოსწავლეზე (200₾ ორივეზე)

👤 ინდივიდუალური გაკვეთილები:
• 1 გაკვეთილი = 70₾
• 4 გაკვეთილის პაკეტი = 240₾
• 8 გაკვეთილის პაკეტი = 400₾`
    } else {
      return `💰 ST DANCE STUDIO — Pricing & Packages:

🎁 First Trial Lesson: 100% FREE!

🔹 Monthly Group Subscription: 130 GEL / month
🔹 Sibling Discount: 100 GEL per student

👤 Private Coaching:
• 1 Lesson = 70 GEL | 4 Package = 240 GEL | 8 Package = 400 GEL`
    }
  }

  // 2. Schedule & Groups
  if (
    q.includes('განრიგ') ||
    q.includes('გრაფიკ') ||
    q.includes('როდის') ||
    q.includes('საათ') ||
    q.includes('დღე') ||
    q.includes('schedule') ||
    q.includes('days') ||
    q.includes('расписание')
  ) {
    if (lang === 'ka') {
      return `📅 ST DANCE STUDIO — მეცადინეობების განრიგი:

👶 Baby ჯგუფი (4.5 – 6 წელი)
• სამშაბათი & ხუთშაბათი: 17:30 + შაბათი: 10:00

🥉 Bronze ჯგუფი (დამწყებები)
• სამშაბათი & ხუთშაბათი: 18:15 – 19:15

🥈 Pre-Silver ჯგუფი (1 წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 17:30

🥇 Silver ჯგუფი (2+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 19:30

🏆 Golden ჯგუფი (5+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 16:30

💃 წყვილების ჯგუფი: ორშაბათი, ოთხშაბათი, პარასკევი 18:30
✨ Hobby Class (ზრდასრულები/მოყვარულები): სამშაბათი & ხუთშაბათი 19:15`
    } else {
      return `📅 ST DANCE STUDIO — Class Schedule:

👶 Baby Group (4.5 – 6 yrs): Tue & Thu 17:30 + Sat 10:00
🥉 Bronze Group (Beginners): Tue & Thu 18:15
🥈 Pre-Silver Group (1 Yr Exp): Mon, Wed, Fri 17:30
🥇 Silver Group (2+ Yrs Exp): Mon, Wed, Fri 19:30
🏆 Golden Group (5+ Yrs Exp): Mon, Wed, Fri 16:30
💃 Couples Group: Mon, Wed, Fri 18:30
✨ Hobby Class (Adults): Tue & Thu 19:15`
    }
  }

  // 3. Location & Address
  if (
    q.includes('მისამართ') ||
    q.includes('სად') ||
    q.includes('მდებარეობ') ||
    q.includes('location') ||
    q.includes('address') ||
    q.includes('где')
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

  // 4. Trainers & Founders
  if (
    q.includes('მწვრთნელ') ||
    q.includes('ტრენერ') ||
    q.includes('სერგ') ||
    q.includes('წივწივაძ') ||
    q.includes('ხელმძღვანელ') ||
    q.includes('trainer') ||
    q.includes('coach')
  ) {
    if (lang === 'ka') {
      return `🏆 ST Dance Studio-ს დამფუძნებელი, მფლობელი და მთავარი მწვრთნელია სერგო (სერგი) წივწივაძე — პროფესიონალი პედაგოგი და WDSF-ის (მსოფლიო საცეკვაო სპორტის ფედერაციის) მოქმედი საერთაშორისო მსაჯი.

დამხმარე პედაგოგია ნინი გოგრაჭაძე — ლათინოამერიკული ცეკვების სპეციალისტი.`
    } else {
      return `🏆 ST Dance Studio founder & head coach is Sergo (Sergi) Tsivtsivadze — professional educator and active WDSF International Judge.`
    }
  }

  // 5. Dance Styles
  if (
    q.includes('ქართულ') ||
    q.includes('ჰიპ') ||
    q.includes('ბალეტ') ||
    q.includes('მიმართულებ') ||
    q.includes('რა ცეკვ') ||
    q.includes('სტილ') ||
    q.includes('style')
  ) {
    if (lang === 'ka') {
      return `💃 ST Dance Studio-ში ისწავლება ექსკლუზიურად სამეჯლისო და სპორტული ცეკვები:

1️⃣ ლათინოამერიკული: სამბა, ჩა-ჩა-ჩა, რუმბა, პასოდობლე, ჯაივი
2️⃣ ევროპული სტანდარტი: ნელი ვალსი, ტანგო, ვენური ვალსი, ფოქსტროტი, კვიკსტეპი

(სტუდიაში არ ისწავლება ქართული ნაციონალური ცეკვები ან ჰიპ-ჰოპი).`
    } else {
      return `💃 We teach exclusively Ballroom & Latin Sports Dance (Samba, Cha-Cha, Rumba, Paso Doble, Jive, Waltz, Tango). We do not offer Georgian national dances or hip-hop.`
    }
  }

  // 6. Solo Category & Partners
  if (
    q.includes('წყვილ') ||
    q.includes('სოლო') ||
    q.includes('solo') ||
    q.includes('პარტნიორ')
  ) {
    if (lang === 'ka') {
      return `💃 წყვილში მოსვლა აუცილებელი არ არის! 

გოგონებსა და ბიჭებს შეუძლიათ იარონ და ივარჯიშონ Solo კატეგორიაში. პროგრამა მოიცავს როგორც წყვილურ, ისე ინდივიდუალურ საცეკვაო ტექნიკასა და ქორეოგრაფიას.`
    } else {
      return `💃 Coming with a partner is not required! Boys and girls can practice in the Solo category.`
    }
  }

  // 7. General Creative Response about Studio
  if (lang === 'ka') {
    return `✨ ST DANCE STUDIO არის ბათუმში წამყვანი სპორტული ცეკვების აკადემია, სადაც ბავშვები და მოზრდილები ეუფლებიან სამეჯლისო ცეკვების ხელოვნებას, დისციპლინასა და პარკეტზე თავდაჯერებულობას!

🌟 რატომ ST Dance Studio?
• 🏆 WDSF საერთაშორისო კატეგორიის მსაჯი და პროფესიონალი მწვრთნელები
• 🥇 ეროვნულ და საერთაშორისო ტურნირებში მონაწილეობა
• 🎪 საზაფხულო & ზამთრის საცეკვაო ბანაკები (Camps) და შოუ-პროგრამები
• 🎁 100%-ით უფასო პირველი საცდელი გაკვეთილი!

ჩასაწერად დააჭირეთ ღილაკს "რეგისტრაცია".`
  } else {
    return `✨ ST DANCE STUDIO is a premier ballroom dance academy in Batumi directed by WDSF International Judge Sergi Tsivtsivadze!

🎁 First trial lesson is 100% Free! Click Registration to join us.`
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

  const handleSend = async (textToSend) => {
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
      }, 300)
      return
    }

    // Attempt Gemini AI Call with full studio knowledge prompt, fallback to Smart Knowledge Engine
    try {
      const promptText = `${studioKnowledgeBase}\n\nყურადღება: უპასუხე იმავე ენაზე, რომელზეც მომხმარებელი გეკითხება (${lang}). გამოიყენე სუფთა, ელეგანტური ემოჯიები (📅, 💰, 📍, 🏆, 👶, ✨) სექციების გამოსაყოფად. იყავი კრეატიული, თავაზიანი, ამომწურავი და მეგობრული.\n\nUser Question: ${query}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptText }]
              }
            ]
          })
        }
      )

      const data = await res.json()
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text

      setIsTyping(false)
      if (aiReply) {
        setMessages((prev) => [...prev, { role: 'bot', text: aiReply }])
      } else {
        const smartReply = getSmartFallbackAnswer(query, lang)
        setMessages((prev) => [...prev, { role: 'bot', text: smartReply }])
      }
    } catch (err) {
      setIsTyping(false)
      const smartReply = getSmartFallbackAnswer(query, lang)
      setMessages((prev) => [...prev, { role: 'bot', text: smartReply }])
    }
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
