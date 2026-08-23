import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getAllNewsArticles } from '../data/newsData'
import './InnerPage.css'
import './NewsPage.css'

export default function NewsPage() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`
  const articles = getAllNewsArticles(lang)

  const titles = {
    ka: {
      eyebrow: 'სიახლეები & განცხადებები',
      title: 'ახალი ამბები &',
      italic: 'ოფიციალური პოსტები',
      lead: 'გაეცანით ST Dance Studio-ს უახლეს სიახლეებს, სეზონის გეგმას, სატურნირო კალენდარსა და ოფიციალურ განცხადებებს.',
      readBtn: 'სრულად წაკითხვა ➔'
    },
    en: {
      eyebrow: 'News & Announcements',
      title: 'Latest News &',
      italic: 'Official Posts',
      lead: 'Stay updated with ST Dance Studio news, season plans, tournament schedules, and studio announcements.',
      readBtn: 'Read Full Article ➔'
    },
    ru: {
      eyebrow: 'Новости и Объявления',
      title: 'Последние Новости &',
      italic: 'Официальные Посты',
      lead: 'Будьте в курсе последних новостей ST Dance Studio, планов сезона, расписания турниров и объявлений.',
      readBtn: 'Читать полностью ➔'
    }
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

      {/* 3-Column News Desktop Grid */}
      <section className="section news-page">
        <div className="container">
          <div className="news-grid-3col">
            {articles.map((article) => (
              <article key={article.slug} className="news-card-grid-item">
                <div className="news-card-thumb-wrap">
                  <img src={article.poster} alt={article.title} className="news-card-thumb-img" />
                  <span className="news-card-badge">📢 News</span>
                </div>

                <div className="news-card-content">
                  <span className="news-card-date">🗓️ {article.date}</span>
                  <h3 className="news-card-title">{article.title}</h3>
                  <p className="news-card-excerpt">{article.excerpt}</p>
                  
                  <Link to={`${basePath}/news/${article.slug}`} className="news-card-read-btn">
                    {tObj.readBtn}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
