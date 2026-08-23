import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getNewsArticleBySlug } from '../data/newsData'
import { translations } from '../data/translations'
import { renderTextWithTelegramLinks } from '../utils/linkify'
import './InnerPage.css'
import './NewsSinglePage.css'
import '../components/NewsSection.css'

export default function NewsSinglePage() {
  const { slug } = useParams()
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const article = getNewsArticleBySlug(slug, lang)
  const activeTrans = translations[lang] || translations.ka
  const newsTrans = activeTrans.newsSection || translations.ka.newsSection

  const backText = lang === 'ka' ? '← ყველა სიახლეზე დაბრუნება' : lang === 'ru' ? '← Назад ко всем новостям' : '← Back to All News'

  if (!article) {
    return (
      <div className="container" style={{ padding: '6rem 0', color: '#fff' }}>
        <h2>{lang === 'ka' ? 'სტატია ვერ მოიძებნა' : 'Article Not Found'}</h2>
        <Link to={`${basePath}/news`} className="news-single-back-btn">{backText}</Link>
      </div>
    )
  }

  return (
    <>
      <section className="section news-single-page">
        <div className="container">
          
          {/* Back Button */}
          <Link to={`${basePath}/news`} className="news-single-back-btn">
            {backText}
          </Link>

          <article className="news-single-card">
            
            {/* Article Header */}
            <div className="news-single-header">
              <span className="news-single-date">🗓️ {article.date}</span>
              <h1 className="display news-single-title">{article.title}</h1>
            </div>

            {/* Poster Image */}
            {article.poster && (
              <div className="news-single-poster-wrap">
                <img src={article.poster} alt={article.title} />
              </div>
            )}

            {/* Article Body Content */}
            <div className="news-single-body">

              {/* SPECIAL TYPE 1: SEASON OPENING & RULES ARTICLE */}
              {article.type === 'season' && (
                <div className="rules-block" style={{ marginTop: 0 }}>
                  <p className="news-intro" style={{ fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                    {newsTrans.intro}
                  </p>

                  <h3 className="display rules-block__title">{newsTrans.rulesTitle}</h3>
                  <p className="rules-block__intro">{newsTrans.rulesIntro}</p>

                  <div className="rules-grid">
                    {newsTrans.rulesList.map((rule, rIdx) => (
                      <div className="rule-item" key={rIdx}>
                        <div className="rule-item__head">
                          <span className="rule-item__num">{rule.num}</span>
                          <h4 className="rule-item__title">{rule.title}</h4>
                        </div>

                        <div className="rule-item__body">
                          {rule.points && (
                            <ul>
                              {rule.points.map((pt, pIdx) => (
                                <li key={pIdx}>{renderTextWithTelegramLinks(pt)}</li>
                              ))}
                            </ul>
                          )}

                          {/* Dress Code Links */}
                          {rule.num === '3' && (
                            <div className="outfit-section">
                              <p>{rule.introText}</p>
                              
                              {/* Boys Outfits */}
                              <div className="outfit-group">
                                <span className="outfit-label">{rule.boysText}</span>
                                <div className="outfit-links-wrap">
                                  {rule.boysLinks.map((link, lIdx) => (
                                    <React.Fragment key={lIdx}>
                                      <a 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="outfit-link"
                                      >
                                        {link.text}
                                      </a>
                                      {lIdx < rule.boysLinks.length - 1 && <span className="outfit-separator">|</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>

                              {/* Girls Outfits */}
                              <div className="outfit-group">
                                <span className="outfit-label">{rule.girlsText}</span>
                                <div className="outfit-links-wrap">
                                  {rule.girlsLinks.map((link, lIdx) => (
                                    <React.Fragment key={lIdx}>
                                      <a 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="outfit-link"
                                      >
                                        {link.text}
                                      </a>
                                      {lIdx < rule.girlsLinks.length - 1 && <span className="outfit-separator">|</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIAL TYPE 2: TOURNAMENT CALENDAR ARTICLE */}
              {article.type === 'tournament' && (
                <div className="tournament-block" style={{ marginTop: 0 }}>
                  <p className="tournament-block__subtitle" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
                    {newsTrans.calendarSubtitle}
                  </p>

                  {/* Connecting Preparation Note */}
                  {newsTrans.calendarNote && (
                    <div className="tournament-note" style={{ marginBottom: '2rem' }}>
                      💡 <strong>{lang === 'ka' ? 'მომზადების წესი:' : lang === 'ru' ? 'Правило подготовки:' : 'Preparation Rule:'}</strong> {newsTrans.calendarNote}
                    </div>
                  )}

                  {/* Standalone 10-Tournament Schedule Table */}
                  <div className="tournament-table-wrapper">
                    <table className="tournament-table">
                      <thead>
                        <tr>
                          <th>{newsTrans.tableHeaders.month}</th>
                          <th>{newsTrans.tableHeaders.tournament}</th>
                          <th>{newsTrans.tableHeaders.description}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newsTrans.tournaments.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{item.month}</strong></td>
                            <td>{item.name}</td>
                            <td>{item.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* DYNAMIC ADMIN ARTICLE CONTENT */}
              {article.type === 'admin' && (
                <div className="news-admin-article-content">
                  {renderTextWithTelegramLinks(article.content)}
                </div>
              )}

            </div>

          </article>
        </div>
      </section>
    </>
  )
}
