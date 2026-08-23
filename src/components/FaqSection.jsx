import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import './FaqSection.css'

export default function FaqSection() {
  const { lang } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const faqData = activeTrans.faq

  const [openId, setOpenId] = useState(faqData?.items?.[0]?.id || null)

  if (!faqData || !faqData.items) return null

  const toggleItem = (id) => {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <section className="faq-section section" id="faq">
      <div className="container">
        <div className="faq-head">
          <span className="eyebrow">{faqData.eyebrow}</span>
          <h2 className="display faq-head__title">
            {faqData.title}{' '}
            <span className="display-italic">{faqData.titleItalic}</span>
          </h2>
        </div>

        <div className="faq-list">
          {faqData.items.map((item, idx) => {
            const isOpen = openId === item.id
            const numStr = idx < 9 ? `0${idx + 1}` : `${idx + 1}`
            return (
              <div 
                key={item.id} 
                className={`faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button 
                  className="faq-question" 
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                >
                  <div>
                    <span className="faq-num-prefix">{numStr}</span>
                    <span>{item.q}</span>
                  </div>
                  <span className="faq-icon">+</span>
                </button>

                <div className="faq-answer">
                  <div className="faq-answer__inner">
                    {item.a}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
