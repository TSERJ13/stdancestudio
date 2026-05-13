import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './Header.css'

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage()
  return (
    <div className="lang-switcher">
      <button onClick={() => setLang('ka')} className={lang === 'ka' ? 'active' : ''}>
        <span className="flag">🇬🇪</span> GE
      </button>
      <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>
        <span className="flag">🇺🇸</span> EN
      </button>
      <button onClick={() => setLang('ru')} className={lang === 'ru' ? 'active' : ''}>
        <span className="flag">🇷🇺</span> RU
      </button>
    </div>
  )
}

const FloatingLangSwitcher = () => {
  const { lang, setLang } = useLanguage()
  return (
    <div className="floating-lang">
      <button onClick={() => setLang('ka')} className={lang === 'ka' ? 'active' : ''}>GE</button>
      <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
      <button onClick={() => setLang('ru')} className={lang === 'ru' ? 'active' : ''}>RU</button>
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.schedule'), to: '/schedule' },
    { label: t('nav.payment'), to: '/payment' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header__inner container">
          <Link to="/" className="header__brand" onClick={() => setMobileOpen(false)}>
            <img src="/images/logo-transparent.png" alt="ST Dance Studio" className="header__logo" />
            <div className="header__brand-text" style={{ fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase' }}>
              <span className="header__brand-name" style={{ color: 'var(--color-gold)', fontSize: '1.1rem', letterSpacing: '0.1em' }}>ST DANCE</span>
              <div style={{ height: '1px', background: 'var(--color-gold)', margin: '1px 0' }}></div>
              <span className="header__brand-sub" style={{ color: '#fff', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'lowercase' }}>studio</span>
            </div>
          </Link>

          <nav className="header__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `header__link ${isActive ? 'is-active' : ''}`
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
            <LanguageSwitcher />
          </nav>

          <Link to="/contact" className="btn btn-primary header__cta">
            {t('nav.contact')}
          </Link>

          <button
            className={`header__burger ${mobileOpen ? 'is-open' : ''}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`mobile-menu ${mobileOpen ? 'is-open' : ''}`}>
          <nav className="mobile-menu__nav">
            {navItems.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                className={({ isActive }) =>
                  `mobile-menu__link ${isActive ? 'is-active' : ''}`
                }
                end={item.to === '/'}
              >
                <span className="mobile-menu__num">0{i + 1}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="btn btn-primary mobile-menu__cta"
          >
            {t('nav.contact')}
          </Link>
        </div>
      </header>
      <FloatingLangSwitcher />
    </>
  )
}
