import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import './Bio.css'

export default function Bio() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const content = {
    ka: {
      title: 'ST DANCE STUDIO',
      subtitle: 'სპორტული და სამეჯლისო ცეკვების სტუდია',
      location: 'ბათუმი, ე. თაყაიშვილის 55',
      ctaBadge: 'მიღება ღიაა 4-16 წლის ბავშვებისთვის',
      ctaTitle: 'ონლაინ რეგისტრაცია',
      ctaSubtitle: 'ჩაეწერეთ უფასო საცდელ მეცადინეობაზე',
      videoTitle: 'სტუდიის ვიდეო / სიახლეები',
      cards: [
        {
          id: 'schedule',
          title: 'მეცადინეობების განრიგი',
          desc: 'გაეცანით ჯგუფებსა და საათებს',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          title: 'ონლაინ გადახდა',
          desc: 'სწრაფი და უსაფრთხო ანგარიშსწორება',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          title: 'ჩვენ შესახებ & გუნდი',
          desc: 'გაიცანით პროფესიონალი მწვრთნელები',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'call',
          title: 'დარეკვა ადმინისტრაციასთან',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp ჩატი',
          desc: 'მოგვწერეთ პირდაპირ ჩატში',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        },
        {
          id: 'maps',
          title: 'ლოკაცია Google Maps-ზე',
          desc: 'ბათუმი, ე. თაყაიშვილის 55',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          )
        }
      ]
    },
    en: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Sports & Ballroom Dance Studio in Batumi',
      location: '55 E. Takaishvili St, Batumi',
      ctaBadge: 'Enrollment Open for Kids 4-16',
      ctaTitle: 'Online Registration',
      ctaSubtitle: 'Book a Free Trial Class',
      videoTitle: 'Studio Video & Highlights',
      cards: [
        {
          id: 'schedule',
          title: 'Class Schedule',
          desc: 'Explore groups and training hours',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          title: 'Online Payment',
          desc: 'Quick and secure checkout',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          title: 'About Us & Trainers',
          desc: 'Meet our professional instructors',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'call',
          title: 'Call Administration',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp Chat',
          desc: 'Chat with us directly',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        },
        {
          id: 'maps',
          title: 'Location on Google Maps',
          desc: '55 E. Takaishvili St, Batumi',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          )
        }
      ]
    },
    ru: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Студия спортивных и бальных танцев в Батуми',
      location: 'Батуми, ул. Е. Такаишвили 55',
      ctaBadge: 'Набор открыт для детей 4-16 лет',
      ctaTitle: 'Онлайн Регистрация',
      ctaSubtitle: 'Запишитесь на бесплатный урок',
      videoTitle: 'Видео / Новости студии',
      cards: [
        {
          id: 'schedule',
          title: 'Расписание Занятий',
          desc: 'Ознакомьтесь с группами и часами',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          title: 'Онлайн Оплата',
          desc: 'Быстрый и безопасный расчет',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          title: 'О нас и Тренерах',
          desc: 'Познакомьтесь с нашей командой',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'call',
          title: 'Позвонить Администратору',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp Чат',
          desc: 'Напишите нам напрямую',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        },
        {
          id: 'maps',
          title: 'Локация на Google Maps',
          desc: 'Батуми, ул. Е. Такаишвили 55',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          )
        }
      ]
    }
  }

  const t = content[lang] || content.ka

  return (
    <div className="bio-page-container">
      {/* Floating Language Switcher */}
      <div className="bio-lang-switcher">
        <Link to="/bio" className={`bio-lang-btn ${lang === 'ka' ? 'active' : ''}`}>
          GE
        </Link>
        <Link to="/en/bio" className={`bio-lang-btn ${lang === 'en' ? 'active' : ''}`}>
          EN
        </Link>
        <Link to="/ru/bio" className={`bio-lang-btn ${lang === 'ru' ? 'active' : ''}`}>
          RU
        </Link>
      </div>

      <div className="bio-wrapper">
        {/* Header */}
        <header className="bio-header">
          <div className="bio-profile-avatar-wrap">
            <img
              src="/images/logo-transparent.png"
              alt="ST Dance Studio Logo"
              className="bio-profile-avatar"
            />
            <div className="bio-verified-badge">✓</div>
          </div>

          <h1 className="bio-title-main">{t.title}</h1>
          <p className="bio-title-sub">{t.subtitle}</p>

          <div className="bio-location-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{t.location}</span>
          </div>
        </header>

        {/* Main Action Cards */}
        <main className="bio-cards-container">
          {/* Primary CTA Sleek Card - Register */}
          <Link to={`${basePath}/register`} className="bio-card-cta">
            <div className="bio-cta-content">
              <div className="bio-cta-badge">
                <span className="bio-pulse-dot"></span>
                <span>{t.ctaBadge}</span>
              </div>
              <div className="bio-cta-title">{t.ctaTitle}</div>
              <div className="bio-cta-subtitle">{t.ctaSubtitle}</div>
            </div>
            <div className="bio-cta-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </Link>

          {/* Secondary Standard Cards */}
          {t.cards.map((card) => {
            if (card.to) {
              return (
                <Link key={card.id} to={card.to} className="bio-card-item">
                  <div className="bio-card-icon-wrap">{card.icon}</div>
                  <div className="bio-card-info">
                    <div className="bio-card-title">{card.title}</div>
                    <div className="bio-card-desc">{card.desc}</div>
                  </div>
                  <div className="bio-card-chevron">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </Link>
              )
            }
            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bio-card-item"
              >
                <div className="bio-card-icon-wrap">{card.icon}</div>
                <div className="bio-card-info">
                  <div className="bio-card-title">{card.title}</div>
                  <div className="bio-card-desc">{card.desc}</div>
                </div>
                <div className="bio-card-chevron">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </a>
            )
          })}
        </main>

        {/* Embedded Instagram Reel / Post DYy9WNRDjyT Showcase */}
        <section className="bio-video-card">
          <div className="bio-video-card-header">
            <div className="bio-video-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-champagne)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <span>{t.videoTitle}</span>
            </div>
            <span className="bio-ig-tag">@stdancestudio</span>
          </div>

          <div className="bio-embed-container">
            <iframe
              className="bio-embed-iframe"
              src="https://www.instagram.com/p/DYy9WNRDjyT/embed"
              title="ST Dance Studio Instagram Post DYy9WNRDjyT"
              allowTransparency={true}
              allow="encrypted-media"
              frameBorder="0"
              scrolling="no"
            ></iframe>
          </div>
        </section>

        {/* Social Links */}
        <div className="bio-social-bar">
          <a
            href="https://www.instagram.com/stdancestudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a
            href="https://wa.me/995514199966"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
