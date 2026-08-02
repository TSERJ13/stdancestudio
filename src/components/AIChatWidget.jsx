import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { submitRegistration } from '../data/classcore'
import { studioKnowledgeBase } from '../data/aiKnowledge'
import { trackAnalyticsEvent } from '../utils/analytics'
import './AIChatWidget.css'

const GEMINI_KEY = atob('QVEuQWI4Uk42SnhSZVRtaWZfOEFCSHBnUWhLRS11dmhlUG5YMTdYSkhBaTZNQjZQQm9ZUg==')

// Full Multi-language UI & Registration Form translations dictionary
const botTranslations = {
  ka: {
    tooltip: 'AI ასისტენტი • გაქვს კითხვები?',
    subtitle: 'ონლაინ ასისტენტი • 24/7',
    regBtn: 'რეგისტრაცია',
    backBtn: 'ჩატზე დაბრუნება',
    inputPlaceholder: 'ჰკითხეთ AI-ს რაიმე...',
    welcome: 'გამარჯობა! მე ვარ ST Dance Studio-ს AI ასისტენტი. რა გაინტერესებთ სტუდიის შესახებ?',
    pillPrice: '💰 რა ღირს აბონემენტი?',
    pillSchedule: '📅 განრიგი',
    pillRegister: '✨ რეგისტრაცია',
    pillAddress: '📍 მისამართი',
    // Registration Form
    regTitle: 'ონლაინ რეგისტრაცია',
    regSub: 'ჩაეწერეთ 100%-ით უფასო საცდელ გაკვეთილზე',
    studentNameLabel: 'მოსწავლის სახელი და გვარი *',
    studentNamePlaceholder: 'მაგ: ნინი წივწივაძე',
    birthDateLabel: 'დაბადების თარიღი *',
    groupLabel: 'სასურველი ჯგუფი *',
    parentNameLabel: 'მშობლის სახელი და გვარი *',
    parentNamePlaceholder: 'მაგ: გიორგი წივწივაძე',
    parentPhoneLabel: 'მშობლის ტელეფონი (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'რეგისტრაციის გაგზავნა ➔',
    groups: [
      'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)',
      'Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)',
      'Pre-Silver ჯგუფი (1 წლიანი გამოცდილება) | 17:30 (130₾/თვე)',
      'Silver ჯგუფი (2+ წლიანი გამოცდილება) | 19:30 (130₾/თვე)',
      'Golden ჯგუფი (5+ წლიანი გამოცდილება) | 16:30 (130₾/თვე)',
      'წყვილების ჯგუფი | 18:30 (130₾/თვე)',
      'Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (130₾/თვე)',
      'ინდივიდუალური გაკვეთილები (70₾ - 400₾)'
    ]
  },
  en: {
    tooltip: 'AI Assistant • Have questions?',
    subtitle: 'Online Assistant • 24/7',
    regBtn: 'Registration',
    backBtn: 'Back to Chat',
    inputPlaceholder: 'Ask AI anything...',
    welcome: 'Hello! I am ST Dance Studio AI Assistant. How can I help you today?',
    pillPrice: '💰 Prices & Packages',
    pillSchedule: '📅 Schedule',
    pillRegister: '✨ Register',
    pillAddress: '📍 Location',
    // Registration Form
    regTitle: 'Online Registration',
    regSub: 'Sign up for 100% Free Trial Lesson',
    studentNameLabel: "Student's Full Name *",
    studentNamePlaceholder: 'e.g. Nini Tsivtsivadze',
    birthDateLabel: 'Date of Birth *',
    groupLabel: 'Select Group *',
    parentNameLabel: "Parent's Full Name *",
    parentNamePlaceholder: 'e.g. Giorgi Tsivtsivadze',
    parentPhoneLabel: 'Parent Phone (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'Submit Registration ➔',
    groups: [
      'Baby Group (Ages 4.5-6) | 17:30 (130 GEL/mo)',
      'Bronze Group (Beginners) | 18:15 (130 GEL/mo)',
      'Pre-Silver Group (1 Yr Exp) | 17:30 (130 GEL/mo)',
      'Silver Group (2+ Yrs Exp) | 19:30 (130 GEL/mo)',
      'Golden Group (5+ Yrs Exp) | 16:30 (130 GEL/mo)',
      'Couples Group | 18:30 (130 GEL/mo)',
      'Hobby Class (Adults / Amateurs) | 19:15 (130 GEL/mo)',
      'Private Coaching (70 GEL - 400 GEL)'
    ]
  },
  ru: {
    tooltip: 'AI Помощник • Есть вопросы?',
    subtitle: 'Онлайн ассистент • 24/7',
    regBtn: 'Регистрация',
    backBtn: 'Назад в чат',
    inputPlaceholder: 'Спросите AI...',
    welcome: 'Здравствуйте! Я AI-помощник ST Dance Studio. Чем могу помочь?',
    pillPrice: '💰 Цены и абонементы',
    pillSchedule: '📅 Расписание',
    pillRegister: '✨ Регистрация',
    pillAddress: '📍 Локация',
    // Registration Form
    regTitle: 'Онлайн регистрация',
    regSub: 'Запишитесь на 100% бесплатный пробный урок',
    studentNameLabel: 'Имя и фамилия ученика *',
    studentNamePlaceholder: 'Например: Нини Цивцивадзе',
    birthDateLabel: 'Дата рождения *',
    groupLabel: 'Желаемая группа *',
    parentNameLabel: 'Имя и фамилия родителя *',
    parentNamePlaceholder: 'Например: Георгий Цивцивадзе',
    parentPhoneLabel: 'Телефон родителя (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'Отправить регистрацию ➔',
    groups: [
      'Baby группа (4.5-6 лет) | 17:30 (130 GEL/мес)',
      'Bronze группа (Новички) | 18:15 (130 GEL/мес)',
      'Pre-Silver группа (1 год опыта) | 17:30 (130 GEL/мес)',
      'Silver группа (2+ года опыта) | 19:30 (130 GEL/мес)',
      'Golden группа (5+ лет опыта) | 16:30 (130 GEL/мес)',
      'Группа для пар | 18:30 (130 GEL/мес)',
      'Hobby Class (Взрослые / Любители) | 19:15 (130 GEL/мес)',
      'Индивидуальные уроки (70 GEL - 400 GEL)'
    ]
  }
}

// Comprehensive Creative Smart Fallback Engine (15+ Topics)
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
    } else if (lang === 'ru') {
      return `💰 ST DANCE STUDIO — Цены и Абонементы:

🎁 Первый пробный урок: 100% Бесплатно!

🔹 Месячный абонемент: 130 GEL / месяц (12 занятий)
🔹 Скидка для братьев/сестер: 100 GEL за ученика

👤 Индивидуальные уроки:
• 1 урок = 70 GEL | 4 урока = 240 GEL | 8 уроков = 400 GEL`
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
    } else if (lang === 'ru') {
      return `📅 ST DANCE STUDIO — Расписание:

👶 Baby группа (4.5 – 6 лет): Вт и Чт 17:30 + Сб 10:00
🥉 Bronze (Новички): Вт и Чт 18:15
🥈 Pre-Silver (1 год оп.): Пн, Ср, Пт 17:30
🥇 Silver (2+ года): Пн, Ср, Пт 19:30
🏆 Golden (5+ лет): Пн, Ср, Пт 16:30
💃 Группа пар: Пн, Ср, Пт 18:30
✨ Hobby Class (Взрослые): Вт и Чт 19:15`
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
    q.includes('где') ||
    q.includes('адрес')
  ) {
    if (lang === 'ka') {
      return `📍 ST DANCE STUDIO — ლოკაცია:

🏛️ ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55
(3-სართულიანი თეთრი შენობის მე-3 სართული, შესასვლელი ბალოტისფერი სახლის ჭიშკრიდან).

📞 ტელეფონი / WhatsApp: +995 514 19 99 66`
    } else if (lang === 'ru') {
      return `📍 ST DANCE STUDIO — Адрес:

🏛️ Батуми, ул. Эка Такаишвили 55 (3 этаж белого здания).
📞 Тел / WhatsApp: +995 514 19 99 66`
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

  // 5. Dress code & Shoes
  if (
    q.includes('ჩაცმ') ||
    q.includes('ფორმ') ||
    q.includes('ფეხსაცმელ') ||
    q.includes('კოსტიუმ') ||
    q.includes('dress') ||
    q.includes('shoes') ||
    q.includes('одежда')
  ) {
    if (lang === 'ka') {
      return `👕 დრესკოდი და საცეკვაო ფეხსაცმელი:

• ბავშვი ვარჯიშზე აუცილებლად უნდა გამოცხადდეს საცეკვაო სავარჯიშო ფორმით.
• აუცილებელია სპეციალური სამეჯლისო საცეკვაო ფეხსაცმელი, რომლის შეძენაც შეგიძლიათ უშუალოდ სტუდიის მაღაზიაში.
• ტურნირებისთვის სასცენო კოსტიუმების შეკერვა ხდება ინდივიდუალურად მწვრთნელის რეკომენდაციით.`
    } else {
      return `👕 Dress Code & Dance Shoes: Special dance shoes are required and available directly at our studio shop. Practice clothes must be worn for all classes.`
    }
  }

  // 6. Solo category & Partners
  if (
    q.includes('წყვილ') ||
    q.includes('სოლო') ||
    q.includes('solo') ||
    q.includes('პარტნიორ') ||
    q.includes('партнер')
  ) {
    if (lang === 'ka') {
      return `💃 წყვილში მოსვლა აუცილებელი არ არის! 

გოგონებსა და ბიჭებს შეუძლიათ იარონ და ივარჯიშონ Solo კატეგორიაში. პროგრამა მოიცავს როგორც წყვილურ, ისე ინდივიდუალურ საცეკვაო ტექნიკასა და ქორეოგრაფიას.`
    } else {
      return `💃 Coming with a partner is NOT required! Boys and girls can train and compete in the Solo category.`
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
  } else if (lang === 'ru') {
    return `✨ ST DANCE STUDIO — ведущая студия бальных и спортивных танцев в Батуми под руководством международного судьи WDSF Серго Цивцивадзе!

🎁 Первый пробный урок 100% бесплатно! Нажмите "Регистрация" для записи.`
  } else {
    return `✨ ST DANCE STUDIO is a premier ballroom dance academy in Batumi directed by WDSF International Judge Sergi Tsivtsivadze!

🎁 First trial lesson is 100% Free! Click Registration to join us.`
  }
}

export default function AIChatWidget() {
  const { lang } = useLanguage()
  const activeTrans = botTranslations[lang] || botTranslations.ka

  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Registration Sub-Form State
  const [isRegMode, setIsRegMode] = useState(false)
  const [regForm, setRegForm] = useState({
    student_name: '',
    birth_date: '',
    shift: activeTrans.groups[0],
    parent_name: '',
    parent_phone: ''
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: activeTrans.welcome
    }
  ])

  // Update initial welcome message & registration select group default when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'bot') {
      setMessages([{ role: 'bot', text: activeTrans.welcome }])
    }
    setRegForm((prev) => ({ ...prev, shift: activeTrans.groups[0] }))
  }, [lang])

  // Listen for custom global trigger event "open-ai-chat"
  useEffect(() => {
    const handleGlobalOpen = () => {
      setIsOpen(true)
      trackAnalyticsEvent('bot_opened')
    }
    window.addEventListener('open-ai-chat', handleGlobalOpen)
    return () => window.removeEventListener('open-ai-chat', handleGlobalOpen)
  }, [])

  // Track opening
  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) trackAnalyticsEvent('bot_opened')
      return next
    })
  }

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

    trackAnalyticsEvent('bot_question_asked', { query })

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
      trackAnalyticsEvent('bot_registration_triggered')
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
                : lang === 'ru'
                ? '✨ Форма онлайн-регистрации открыта. Пожалуйста, заполните данные.'
                : 'With pleasure! Please fill out the registration form below.'
          }
        ])
      }, 300)
      return
    }

    // Attempt Gemini AI Call with clean studio prompt
    try {
      const promptText = `შენ ხარ ST DANCE STUDIO-ს ოფიციალური AI ასისტენტი.\n\n${studioKnowledgeBase}\n\nყურადღება:\n1. უპასუხე იმავე ენაზე, რომელზეც მომხმარებელი გეკითხება (${lang}).\n2. იყავი კრეატიული, თავაზიანი, ამომწურავი და მეგობრული.\n3. გამოიყენე ემოჯიები (📅, 💰, 📍, 🏆, 👶, ✨, 🎁) სექციების გამოსაყოფად.\n\nმომხმარებლის შეკითხვა: ${query}`

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
    trackAnalyticsEvent('bot_registration_submitted', { name: regForm.student_name })

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
        shift: activeTrans.groups[0],
        parent_name: '',
        parent_phone: ''
      })
    }
  }

  return (
    <>
      {/* 1. FLOATING LUXURY OBSIDIAN & CHAMPAGNE GOLD BOT BUTTON */}
      <div className="std-bot-widget-container">
        {/* Floating Tooltip Bubble with Dynamic Language */}
        {!isOpen && (
          <div className="std-bot-tooltip-bubble" onClick={toggleOpen}>
            <span className="std-bot-pulse-dot"></span>
            <span>{activeTrans.tooltip}</span>
          </div>
        )}

        {/* 3D Gold & Obsidian Mascot Trigger */}
        <button
          className={`std-bot-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={toggleOpen}
          aria-label="ST Dance AI Chatbot"
        >
          <div className="std-bot-avatar-3d-wrap">
            {/* Dark Obsidian Circle with Gold Border */}
            <div className="std-bot-3d-sphere"></div>
            {/* Pure Champagne Gold Robot Icon with Blinking Eyes */}
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
                  <p className="std-bot-subtitle">{activeTrans.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`std-bot-mode-btn ${isRegMode ? 'active' : ''}`}
                  onClick={() => setIsRegMode(!isRegMode)}
                >
                  {isRegMode ? activeTrans.backBtn : activeTrans.regBtn}
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
                    <h4>{lang === 'ka' ? 'რეგისტრაცია მიღებულია!' : lang === 'ru' ? 'Регистрация принята!' : 'Registration Successful!'}</h4>
                    <p>{lang === 'ka' ? 'ჩვენი ადმინისტრატორი მალე დაგიკავშირდებათ WhatsApp-ზე ან ტელეფონზე.' : lang === 'ru' ? 'Наш администратор скоро свяжется с вами по WhatsApp или телефону.' : 'Our administrator will contact you shortly on WhatsApp or phone.'}</p>
                    <button
                      className="std-bot-submit-btn"
                      onClick={() => {
                        setRegSuccess(false)
                        setIsRegMode(false)
                      }}
                    >
                      {activeTrans.backBtn}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegSubmit} className="std-bot-reg-form">
                    <h4 className="std-bot-reg-title">{activeTrans.regTitle}</h4>
                    <p className="std-bot-reg-sub">{activeTrans.regSub}</p>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.studentNameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={activeTrans.studentNamePlaceholder}
                        value={regForm.student_name}
                        onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.birthDateLabel}</label>
                      <input
                        type="date"
                        required
                        value={regForm.birth_date}
                        onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.groupLabel}</label>
                      <select
                        value={regForm.shift}
                        onChange={(e) => setRegForm({ ...regForm, shift: e.target.value })}
                      >
                        {activeTrans.groups.map((gOpt, idx) => (
                          <option key={idx} value={gOpt}>{gOpt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.parentNameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={activeTrans.parentNamePlaceholder}
                        value={regForm.parent_name}
                        onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.parentPhoneLabel}</label>
                      <input
                        type="tel"
                        required
                        placeholder={activeTrans.parentPhonePlaceholder}
                        value={regForm.parent_phone}
                        onChange={(e) => setRegForm({ ...regForm, parent_phone: e.target.value })}
                      />
                    </div>

                    <button type="submit" disabled={regLoading} className="std-bot-submit-btn">
                      {regLoading ? '...' : activeTrans.submitBtn}
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

                {/* Fixed Non-Squishing Quick Suggestion Pills Row with Dynamic Languages */}
                <div className="std-bot-pills-wrapper">
                  <div className="std-bot-pills-row">
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillPrice)}>
                      {activeTrans.pillPrice}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillSchedule)}>
                      {activeTrans.pillSchedule}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillRegister)}>
                      {activeTrans.pillRegister}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillAddress)}>
                      {activeTrans.pillAddress}
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
                    placeholder={activeTrans.inputPlaceholder}
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
