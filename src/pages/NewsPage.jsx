import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { getNews } from '../data/db'
import NewsSection from '../components/NewsSection'
import { renderTextWithTelegramLinks } from '../utils/linkify'
import './InnerPage.css'
import './NewsPage.css'

export default function NewsPage() {
  const { lang } = useLanguage()
  const [articles, setArticles] = useState([])

  useEffect(() => {
    try {
      const items = getNews()
      if (items && Array.isArray(items)) {
        setArticles(items)
      }
    } catch (e) {
      console.error('Error loading news articles:', e)
    }
  }, [])

  const titles = {
    ka: { eyebrow: 'სიახლეები & განცხადებები', title: 'ახალი ამბები &', italic: 'ოფიციალური განცხადებები', lead: 'გაეცანით ST Dance Studio-ს უახლეს სიახლეებს, სეზონის გეგმას, ტურნირების კალენდარსა და სტუდიის განცხადებებს.' },
    en: { eyebrow: 'News & Announcements', title: 'Latest News &', italic: 'Official Announcements', lead: 'Stay updated with ST Dance Studio news, season plans, tournament schedules, and studio announcements.' },
    ru: { eyebrow: 'Новости и Объявления', title: 'Последние Новости &', italic: 'Официальные Объявления', lead: 'Будьте в курсе последних новостей ST Dance Studio, планов сезона, расписания турниров и объявлений.' }
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

      {/* Published News Articles List (If Any) */}
      {articles.length > 0 && (
        <section className="section news-page-articles">
          <div className="container">
            <div className="news-articles-grid">
              {articles.map((art) => (
                <article key={art.id || art.date} className="news-article-card">
                  {art.image && (
                    <div className="article-img-wrap">
                      <img src={art.image} alt={art.title} />
                    </div>
                  )}
                  <div className="article-content">
                    <span className="article-date">🗓️ {art.date}</span>
                    <h3 className="article-title">{art.title}</h3>
                    <div className="article-text">{renderTextWithTelegramLinks(art.content || art.text)}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Season Opening Announcement, Tournament Table, Rules & Dress Code */}
      <NewsSection />
    </>
  )
}
