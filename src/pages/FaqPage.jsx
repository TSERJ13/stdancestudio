import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import FaqBotEmbed from '../components/FaqBotEmbed'
import FaqSection from '../components/FaqSection'
import './InnerPage.css'

export default function FaqPage() {
  const { lang } = useLanguage()

  const titles = {
    ka: { eyebrow: 'FAQ & AI ასისტენტი', title: 'ხშირად დასმული კითხვები &', italic: 'ჭკვიანი ასისტენტი', lead: 'დასვით ნებისმიერი შეკითხვა ონლაინ AI ასისტენტთან ან გაეცანით სტუდიის ოფიციალურ პასუხებს ქვემოთ.' },
    en: { eyebrow: 'FAQ & AI Assistant', title: 'Frequently Asked Questions &', italic: 'AI Assistant', lead: 'Ask any question to our online AI assistant above or browse official studio answers below.' },
    ru: { eyebrow: 'FAQ и AI Ассистент', title: 'Часто Задаваемые Вопросы &', italic: 'AI Ассистент', lead: 'Задайте любой вопрос онлайн AI-ассистенту выше или ознакомьтесь с официальными ответами студии ниже.' }
  }

  const tObj = titles[lang] || titles.ka

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{tObj.eyebrow}</span>
          <h1 className="display page-hero__title">
            {tObj.title} <br />
            <span className="display-italic">{tObj.italic}</span>
          </h1>
          <p className="page-hero__lead">
            {tObj.lead}
          </p>
        </div>
      </section>

      {/* Top Embedded AI Bot Assistant */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <FaqBotEmbed />
        </div>
      </section>

      {/* Bottom Complete FAQ Accordion */}
      <FaqSection />
    </>
  )
}
