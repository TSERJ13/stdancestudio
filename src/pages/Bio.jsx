import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import './Bio.css'

export default function Bio() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const [activeTab, setActiveTab] = useState('all')
  const [activeVideo, setActiveVideo] = useState('post')
  const [toastMessage, setToastMessage] = useState('')
  const canvasRef = useRef(null)

  // Trigger floating toast message
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }

  // Copy to clipboard helper
  const copyText = (text, label) => {
    try {
      navigator.clipboard.writeText(text)
      showToast(`✨ ${label}`)
    } catch (e) {
      showToast(`✨ ${label}`)
    }
  }

  // Web Share API or copy link
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ST Dance Studio | Link in Bio',
        url: window.location.href
      }).catch(() => {})
    } else {
      copyText(window.location.href, 'ბმული დაკოპირდა!')
    }
  }

  // Interactive Floating Particles Effect on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < 0) p.y = height
        if (p.x < 0 || p.x > width) p.x = Math.random() * width

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(229, 193, 88, ${p.alpha})`
        ctx.fill()
      })
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const content = {
    ka: {
      title: 'ST DANCE STUDIO',
      subtitle: 'სპორტული და სამეჯლისო ცეკვების სტუდია',
      location: 'ბათუმი, ე. თაყაიშვილის 55',
      phone: '+995 514 19 99 66',
      ctaBadge: 'მიღება ღიაა 4-16 წლის ბავშვებისთვის',
      ctaTitle: 'ონლაინ რეგისტრაცია',
      ctaSubtitle: 'ჩაეწერეთ უფასო საცდელ მეცადინეობაზე',
      videoTitle: 'სტუდიის ვიდეო / სიახლეები',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: 'ბათუმი, ე. თაყაიშვილის 55',
      mapBtn: 'Google Maps',
      tabs: [
        { id: 'all', label: '✨ ყველა' },
        { id: 'reg', label: '📝 რეგისტრაცია' },
        { id: 'info', label: '📅 განრიგი & ფასები' },
        { id: 'contact', label: '📞 კონტაქტი' }
      ],
      stats: [
        { num: '12+', label: 'წლის გამოცდილება' },
        { num: '300+', label: 'აქტიური მოსწავლე' },
        { num: '50+', label: 'ჯილდო & თასი' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'განრიგი',
          desc: 'ჯგუფები და საათები',
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
          category: 'info',
          title: 'გადახდა',
          desc: 'ონლაინ ანგარიშსწორება',
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
          category: 'info',
          title: 'ჩვენ შესახებ',
          desc: 'გუნდი და მწვრთნელები',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp ჩატი',
          desc: 'პირდაპირი მიმოწერა',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    },
    en: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Sports & Ballroom Dance Studio in Batumi',
      location: '55 E. Takaishvili St, Batumi',
      phone: '+995 514 19 99 66',
      ctaBadge: 'Enrollment Open for Kids 4-16',
      ctaTitle: 'Online Registration',
      ctaSubtitle: 'Book a Free Trial Class',
      videoTitle: 'Studio Video & Highlights',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: '55 E. Takaishvili St, Batumi',
      mapBtn: 'Open Maps',
      tabs: [
        { id: 'all', label: '✨ All' },
        { id: 'reg', label: '📝 Register' },
        { id: 'info', label: '📅 Schedule & Info' },
        { id: 'contact', label: '📞 Contact' }
      ],
      stats: [
        { num: '12+', label: 'Years Experience' },
        { num: '300+', label: 'Active Students' },
        { num: '50+', label: 'Trophies Won' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'Schedule',
          desc: 'Groups & Class Hours',
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
          category: 'info',
          title: 'Payment',
          desc: 'Quick & Secure Checkout',
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
          category: 'info',
          title: 'About Us',
          desc: 'Team & Instructors',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp Chat',
          desc: 'Direct Message',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    },
    ru: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Студия спортивных и бальных танцев в Батуми',
      location: 'Батуми, ул. Е. Такаишвили 55',
      phone: '+995 514 19 99 66',
      ctaBadge: 'Набор открыт для детей 4-16 лет',
      ctaTitle: 'Онлайн Регистрация',
      ctaSubtitle: 'Запишитесь на бесплатный урок',
      videoTitle: 'Видео / Новости студии',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: 'Батуми, ул. Е. Такаишвили 55',
      mapBtn: 'Google Maps',
      tabs: [
        { id: 'all', label: '✨ Все' },
        { id: 'reg', label: '📝 Регистрация' },
        { id: 'info', label: '📅 Расписание' },
        { id: 'contact', label: '📞 Контакт' }
      ],
      stats: [
        { num: '12+', label: 'Лет Опыта' },
        { num: '300+', label: 'Учеников' },
        { num: '50+', label: 'Наград' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'Расписание',
          desc: 'Группы и часы',
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
          category: 'info',
          title: 'Оплата',
          desc: 'Онлайн расчет',
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
          category: 'info',
          title: 'О нас',
          desc: 'Команда и тренеры',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp Чат',
          desc: 'Прямая связь',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    }
  }

  const t = content[lang] || content.ka

  const filteredCards = t.cards.filter(
    (card) => activeTab === 'all' || card.category === activeTab
  )

  return (
    <div className="bio-page-container">
      {/* Canvas Gold Dust Particles Background */}
      <canvas ref={canvasRef} className="bio-particle-canvas" />

      {/* Top Action Controls Bar */}
      <div className="bio-top-controls">
        <button
          className="bio-action-icon-btn"
          onClick={handleShare}
          title="Share / გაზიარება"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        {/* Floating Glass Language Bar */}
        <div className="bio-lang-bar">
          <Link to="/bio" className={`bio-lang-link ${lang === 'ka' ? 'active' : ''}`}>
            GE
          </Link>
          <Link to="/en/bio" className={`bio-lang-link ${lang === 'en' ? 'active' : ''}`}>
            EN
          </Link>
          <Link to="/ru/bio" className={`bio-lang-link ${lang === 'ru' ? 'active' : ''}`}>
            RU
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && <div className="bio-toast">{toastMessage}</div>}

      <div className="bio-wrapper">
        {/* Header & Crest Profile */}
        <header className="bio-header">
          <div className="bio-avatar-container">
            <div className="bio-avatar-ring"></div>
            <img
              src="/images/logo-transparent.png"
              alt="ST Dance Studio Crest"
              className="bio-avatar-img"
            />
            <div className="bio-verified-check">✓</div>
          </div>

          <h1 className="bio-brand-title">{t.title}</h1>
          <p className="bio-brand-subtitle">{t.subtitle}</p>

          {/* Interactive Chips */}
          <div className="bio-chips-row">
            <button
              onClick={() => copyText(t.location, 'მისამართი დაკოპირდა!')}
              className="bio-status-chip"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{t.location}</span>
            </button>
            <button
              onClick={() => copyText(t.phone, 'ნომერი დაკოპირდა!')}
              className="bio-status-chip"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
              <span>{t.phone}</span>
            </button>
          </div>
        </header>

        {/* Live Stats Counter Bar */}
        <div className="bio-stats-bar">
          {t.stats.map((st, idx) => (
            <div key={idx} className="bio-stat-item">
              <div className="bio-stat-num">{st.num}</div>
              <div className="bio-stat-label">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Category Filter Tabs */}
        <div className="bio-filter-tabs">
          {t.tabs.map((tab) => (
            <button
              key={tab.id}
              className={`bio-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BENTO GRID ACTION CARDS (PLACED HIGH UP BEFORE MEDIA) */}
        <section className="bio-bento-section">
          {/* HERO BENTO CTA CARD — Online Registration */}
          {(activeTab === 'all' || activeTab === 'reg') && (
            <Link to={`${basePath}/register`} className="bento-hero-card">
              <div className="bento-hero-info">
                <div className="bento-hero-badge">
                  <span className="radar-pulse"></span>
                  <span>{t.ctaBadge}</span>
                </div>
                <div className="bento-hero-title">{t.ctaTitle}</div>
                <div className="bento-hero-desc">{t.ctaSubtitle}</div>
              </div>
              <div className="bento-hero-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          )}

          {/* 2-COLUMN BENTO GRID FOR CORE ACTIONS */}
          <div className="bento-grid-2col">
            {filteredCards.map((card) => {
              if (card.to) {
                return (
                  <Link key={card.id} to={card.to} className="bento-mini-card">
                    <div className="bento-mini-top">
                      <div className="bento-icon-box">{card.icon}</div>
                      <div className="bento-mini-arrow">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="bento-mini-bottom">
                      <div className="bento-mini-title">{card.title}</div>
                      <div className="bento-mini-desc">{card.desc}</div>
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
                  className="bento-mini-card"
                >
                  <div className="bento-mini-top">
                    <div className="bento-icon-box">{card.icon}</div>
                    <div className="bento-mini-arrow">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="bento-mini-bottom">
                    <div className="bento-mini-title">{card.title}</div>
                    <div className="bento-mini-desc">{card.desc}</div>
                  </div>
                </a>
              )
            })}
          </div>

          {/* FULL-WIDTH INTERACTIVE MAP BENTO CARD */}
          {(activeTab === 'all' || activeTab === 'contact') && (
            <a
              href="https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi"
              target="_blank"
              rel="noopener noreferrer"
              className="bento-map-card"
            >
              <div className="bento-map-header">
                <div className="bento-map-left">
                  <div className="bento-map-pin-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="bento-map-name">{t.mapTitle}</div>
                    <div className="bento-map-sub">{t.mapAddress}</div>
                  </div>
                </div>
                <div className="bento-map-button">
                  <span>{t.mapBtn}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </a>
          )}
        </section>

        {/* INSTAGRAM EMBED SHOWCASE WITH VIDEO SWITCHER (LOWER DOWN) */}
        <section className="bio-video-section">
          <div className="bio-video-header">
            <div className="bio-video-title-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <span>{t.videoTitle}</span>
            </div>
            
            <div className="bio-video-tabs">
              <button
                className={`bio-vtab-btn ${activeVideo === 'post' ? 'active' : ''}`}
                onClick={() => setActiveVideo('post')}
              >
                პოსტი
              </button>
              <button
                className={`bio-vtab-btn ${activeVideo === 'reel' ? 'active' : ''}`}
                onClick={() => setActiveVideo('reel')}
              >
                რილსი
              </button>
            </div>
          </div>

          <div className="bio-embed-frame-wrap">
            <iframe
              className="bio-embed-frame"
              src={
                activeVideo === 'post'
                  ? 'https://www.instagram.com/p/DYy9WNRDjyT/embed'
                  : 'https://www.instagram.com/reel/C8_1wD0IS2z/embed'
              }
              title="ST Dance Studio Instagram Showcase"
              allowTransparency={true}
              allow="encrypted-media"
              frameBorder="0"
              scrolling="no"
            ></iframe>
          </div>
        </section>

        {/* SOCIAL FOOTER ICONS */}
        <footer className="bio-social-footer">
          <a
            href="https://www.instagram.com/stdancestudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
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
            className="bio-social-btn"
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
            className="bio-social-btn"
            aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0-.46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a
            href="https://wa.me/995514199966"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </footer>
      </div>
    </div>
  )
}
