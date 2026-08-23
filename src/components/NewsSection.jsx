import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import './NewsSection.css'

export default function NewsSection() {
  const { lang } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const news = activeTrans.newsSection

  if (!news) return null

  const posterSrc = lang === 'ru' ? '/images/poster-ru.jpg' : lang === 'en' ? '/images/poster-en.jpg' : '/images/poster-ka.jpg'

  return (
    <section className="news-section section" id="news">
      <div className="container">
        <div className="news-card">
          
          {/* Season Opening Poster */}
          <div className="news-poster-wrapper">
            <img src={posterSrc} alt="ST Dance 2026/27 Season Opening" className="news-poster-img" />
          </div>

          <div className="news-header">
            <span className="news-badge">{news.eyebrow}</span>
            <h2 className="display news-title">{news.title}</h2>
            <p className="news-intro">{news.intro}</p>
          </div>

          {/* Tournament Schedule Block & Table */}
          <div className="tournament-block">
            <h3 className="display tournament-block__title">{news.calendarTitle}</h3>
            <p className="tournament-block__subtitle">{news.calendarSubtitle}</p>

            {/* Competition Calendar Poster */}
            <div className="tournament-poster-wrapper">
              <img src="/images/poster-calendar.jpg" alt="ST Dance Competition Calendar" className="tournament-poster-img" />
            </div>

            <div className="tournament-table-wrapper">
              <table className="tournament-table">
                <thead>
                  <tr>
                    <th>{news.tableHeaders.month}</th>
                    <th>{news.tableHeaders.tournament}</th>
                    <th>{news.tableHeaders.description}</th>
                  </tr>
                </thead>
                <tbody>
                  {news.tournaments.map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.month}</strong></td>
                      <td>{item.name}</td>
                      <td>{item.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {news.calendarNote && (
              <div className="tournament-note">
                {news.calendarNote}
              </div>
            )}
          </div>

          {/* Studio Rules & Dress Code */}
          <div className="rules-block">
            <h3 className="display rules-block__title">{news.rulesTitle}</h3>
            <p className="rules-block__intro">{news.rulesIntro}</p>

            <div className="rules-grid">
              {news.rulesList.map((rule, rIdx) => (
                <div className="rule-item" key={rIdx}>
                  <div className="rule-item__head">
                    <span className="rule-item__num">{rule.num}</span>
                    <h4 className="rule-item__title">{rule.title}</h4>
                  </div>

                  <div className="rule-item__body">
                    {rule.points && (
                      <ul>
                        {rule.points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
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
                        <div className="outfit-group" style={{ marginTop: '1rem' }}>
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

        </div>
      </div>
    </section>
  )
}
