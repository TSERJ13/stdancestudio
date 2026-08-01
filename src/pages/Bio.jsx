import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import './Bio.css'

export default function Bio() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const content = {
    ka: {
      title: 'ST DANCE STUDIO',
      subtitle: '🏆 სპორტული ცეკვების სტუდია ბათუმში',
      location: 'ბათუმი, ე. თაყაიშვილის 55',
      ctaBadge: 'მიღება ღიაა 4-16 წლის ბავშვებისთვის',
      ctaTitle: '✨ ონლაინ რეგისტრაცია',
      ctaSubtitle: 'ჩაეწერე უფასო საცდელ გაკვეთილზე',
      videoTitle: '🔥 სტუდიის რილსი / ვიდეო',
      cards: [
        {
          id: 'schedule',
          title: 'მეცადინეობების განრიგი',
          desc: 'გაეცანით ჯგუფებსა და საათებს',
          to: `${basePath}/schedule`,
          icon: '🗓️'
        },
        {
          id: 'payment',
          title: 'ონლაინ გადახდა',
          desc: 'სწრაფი და უსაფრთხო ანგარიშსწორება',
          to: `${basePath}/payment`,
          icon: '💳'
        },
        {
          id: 'about',
          title: 'ჩვენ შესახებ & გუნდი',
          desc: 'გაიცანით პროფესიონალი მწვრთნელები',
          to: `${basePath}/about`,
          icon: '🏆'
        },
        {
          id: 'call',
          title: 'დარეკვა ადმინისტრაციასთან',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: '📞'
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp ჩატი',
          desc: 'მოგვწერეთ პირდაპირ ჩატში',
          href: 'https://wa.me/995514199966',
          icon: '💬'
        },
        {
          id: 'maps',
          title: 'ლოკაცია Google Maps-ზე',
          desc: 'ბათუმი, ე. თაყაიშვილის 55',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: '🗺️'
        }
      ]
    },
    en: {
      title: 'ST DANCE STUDIO',
      subtitle: '🏆 Sports Dance Studio in Batumi',
      location: '55 E. Takaishvili St, Batumi',
      ctaBadge: 'Enrollment Open for Kids 4-16',
      ctaTitle: '✨ Online Registration',
      ctaSubtitle: 'Book a Free Trial Class',
      videoTitle: '🔥 Studio Reel / Highlights',
      cards: [
        {
          id: 'schedule',
          title: 'Class Schedule',
          desc: 'Explore groups and training hours',
          to: `${basePath}/schedule`,
          icon: '🗓️'
        },
        {
          id: 'payment',
          title: 'Online Payment',
          desc: 'Quick and secure checkout',
          to: `${basePath}/payment`,
          icon: '💳'
        },
        {
          id: 'about',
          title: 'About Us & Trainers',
          desc: 'Meet our professional instructors',
          to: `${basePath}/about`,
          icon: '🏆'
        },
        {
          id: 'call',
          title: 'Call Administration',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: '📞'
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp Chat',
          desc: 'Chat with us directly',
          href: 'https://wa.me/995514199966',
          icon: '💬'
        },
        {
          id: 'maps',
          title: 'Location on Google Maps',
          desc: '55 E. Takaishvili St, Batumi',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: '🗺️'
        }
      ]
    },
    ru: {
      title: 'ST DANCE STUDIO',
      subtitle: '🏆 Студия спортивных танцев в Батуми',
      location: 'Батуми, ул. Е. Такаишвили 55',
      ctaBadge: 'Набор открыт для детей 4-16 лет',
      ctaTitle: '✨ Онлайн Регистрация',
      ctaSubtitle: 'Запишитесь на бесплатный урок',
      videoTitle: '🔥 Видео / Рилс студии',
      cards: [
        {
          id: 'schedule',
          title: 'Расписание Занятий',
          desc: 'Ознакомьтесь с группами и часами',
          to: `${basePath}/schedule`,
          icon: '🗓️'
        },
        {
          id: 'payment',
          title: 'Онлайн Оплата',
          desc: 'Быстрый и безопасный расчет',
          to: `${basePath}/payment`,
          icon: '💳'
        },
        {
          id: 'about',
          title: 'О нас и Тренерах',
          desc: 'Познакомьтесь с нашей командой',
          to: `${basePath}/about`,
          icon: '🏆'
        },
        {
          id: 'call',
          title: 'Позвонить Администратору',
          desc: '+995 514 19 99 66',
          href: 'tel:+995514199966',
          icon: '📞'
        },
        {
          id: 'whatsapp',
          title: 'WhatsApp Чат',
          desc: 'Напишите нам напрямую',
          href: 'https://wa.me/995514199966',
          icon: '💬'
        },
        {
          id: 'maps',
          title: 'Локация на Google Maps',
          desc: 'Батуми, ул. Е. Такаишвили 55',
          href: 'https://maps.google.com/?q=55+Eka+Takaishvili+St,+Batumi',
          icon: '🗺️'
        }
      ]
    }
  }

  const t = content[lang] || content.ka

  return (
    <div className="bio-page-container">
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
            <span>📍 {t.location}</span>
          </div>
        </header>

        {/* Main Action Cards */}
        <main className="bio-cards-container">
          {/* Primary CTA Golden Card - Register */}
          <Link to={`${basePath}/register`} className="bio-card-cta">
            <div className="bio-cta-content">
              <div className="bio-cta-badge">
                <span className="bio-pulse-dot"></span>
                <span>{t.ctaBadge}</span>
              </div>
              <div className="bio-cta-title">{t.ctaTitle}</div>
              <div className="bio-cta-subtitle">{t.ctaSubtitle}</div>
            </div>
            <div className="bio-cta-arrow">➔</div>
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
                  <div className="bio-card-chevron">➔</div>
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
                <div className="bio-card-chevron">➔</div>
              </a>
            )
          })}
        </main>

        {/* Embedded Instagram Reel / Video Player Showcase */}
        <section className="bio-video-card">
          <div className="bio-video-card-header">
            <div className="bio-video-card-title">
              <span>{t.videoTitle}</span>
            </div>
            <span className="bio-ig-tag">@stdancestudio</span>
          </div>

          <div className="bio-embed-container">
            <iframe
              className="bio-embed-iframe"
              src="https://www.instagram.com/reel/C8_1wD0IS2z/embed"
              title="ST Dance Studio Instagram Reel"
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
            📸
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="Facebook"
          >
            📘
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="YouTube"
          >
            ▶️
          </a>
          <a
            href="https://wa.me/995514199966"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-icon-btn"
            aria-label="WhatsApp"
          >
            💬
          </a>
        </div>
      </div>
    </div>
  )
}
