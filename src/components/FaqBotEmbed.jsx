import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { studioKnowledgeBase } from '../data/aiKnowledge'
import { getSmartFallbackAnswer } from './AIChatWidget'
import { renderTextWithTelegramLinks } from '../utils/linkify'
import './FaqBotEmbed.css'

const initialWelcome = {
  ka: 'გამარჯობა! მე ვარ ST Dance Studio-ს AI ასისტენტი. დასვით ნებისმიერი შეკითხვა ფასების, განრიგის, წესების, ჩაცმულობის ან ლოკაციის შესახებ.',
  en: 'Hello! I am ST Dance Studio AI Assistant. Ask any question regarding prices, schedule, rules, dress code, or location.',
  ru: 'Здравствуйте! Я AI-помощник ST Dance Studio. Задайте любой вопрос о ценах, расписании, правилах, дресс-коде или локации.'
}

const pills = {
  ka: [
    '💰 რა ღირს აბონემენტი?',
    '📅 განრიგი',
    'ჩაცმულობა',
    '🏆 2026-2027 წესები & ტურნირები',
    '📍 მისამართი & ლოკაცია'
  ],
  en: [
    '💰 Prices & Packages',
    '📅 Schedule',
    'Dress Code',
    '🏆 Rules & Tournaments',
    '📍 Location & Contact'
  ],
  ru: [
    '💰 Цены и абонементы',
    '📅 Расписание',
    'Дресс-код',
    '🏆 Правила и турниры',
    '📍 Адрес и контакты'
  ]
}

export default function FaqBotEmbed() {
  const { lang } = useLanguage()
  const [messages, setMessages] = useState([
    { sender: 'bot', text: initialWelcome[lang] || initialWelcome.ka }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatBodyRef = useRef(null)

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg = { sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')
    setLoading(true)

    setTimeout(async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (apiKey) {
          const promptContext = `You are the official AI Assistant of ST Dance Studio in Batumi, Georgia.
Use the knowledge base below to answer the user's question accurately in the language they used (Georgian, English, or Russian).
Knowledge Base:
${studioKnowledgeBase}

User Question: ${query}`

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptContext }] }]
            })
          })

          const data = await response.json()
          const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (answer && answer.trim()) {
            setMessages(prev => [...prev, { sender: 'bot', text: answer }])
            setLoading(false)
            return
          }
        }
      } catch (err) {
        console.error('Gemini fetch error, using built-in knowledge engine:', err)
      }

      // Built-in Studio Knowledge Engine fallback (100% reliable, zero error messages!)
      const fallbackAns = getSmartFallbackAnswer(query, lang)
      setMessages(prev => [...prev, { sender: 'bot', text: fallbackAns }])
      setLoading(false)
    }, 300)
  }

  const activePills = pills[lang] || pills.ka

  return (
    <div className="faq-bot-embed">
      <div className="faq-bot-embed__head">
        <div className="faq-bot-embed__brand">
          <div className="faq-bot-embed__avatar">✨</div>
          <div className="faq-bot-embed__info">
            <h4>ST Dance AI Smart Assistant</h4>
            <p>● Live Knowledge Base (24/7)</p>
          </div>
        </div>
      </div>

      <div className="faq-bot-embed__body" ref={chatBodyRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`faq-chat-msg ${msg.sender}`}>
            <div className="faq-msg-bubble">{renderTextWithTelegramLinks(msg.text)}</div>
          </div>
        ))}
        {loading && (
          <div className="faq-chat-msg bot">
            <div className="faq-msg-bubble">⏳ {lang === 'ka' ? 'AI ფიქრობს...' : 'AI is thinking...'}</div>
          </div>
        )}
      </div>

      {/* Suggestion Pills */}
      <div className="faq-pills-bar">
        {activePills.map((pillText, idx) => (
          <button key={idx} className="faq-pill-btn" onClick={() => handleSend(pillText)}>
            {pillText}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form className="faq-bot-embed__input-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <input
          type="text"
          className="faq-bot-embed__input"
          placeholder={lang === 'ka' ? 'დასვით შეკითხვა AI-ს...' : lang === 'ru' ? 'Спросите AI...' : 'Ask AI anything...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="faq-bot-embed__send-btn" disabled={loading}>
          {lang === 'ka' ? 'გაგზავნა ➔' : 'Send ➔'}
        </button>
      </form>
    </div>
  )
}
