import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './Header.css'

const FloatingLangSwitcher = () => {
  const { lang, setLang } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const switchLanguage = (targetLang) => {
    setLang(targetLang)
    let path = location.pathname
    
    if (path.startsWith('/ru/') || path === '/ru') {
      path = path.replace(/^\/ru/, '')
    } else if (path.startsWith('/en/') || path === '/en') {
      path = path.replace(/^\/en/, '')
    } else if (path.startsWith('/ka/') || path === '/ka') {
      path = path.replace(/^\/ka/, '')
    }
    
    if (!path || path === '') path = '/'
    
    if (targetLang !== 'ka') {
      path = `/${targetLang}${path === '/' ? '' : path}`
    }
    navigate(path)
  }

  const handleLangClick = (newLang) => {
    if (!expanded) {
      setExpanded(true)
      if (newLang !== lang) {
        switchLanguage(newLang)
      }
    } else {
      setExpanded(false)
      if (newLang !== lang) {
        switchLanguage(newLang)
      }
    }
  }

  return (
    <div className={`floating-lang ${expanded ? 'is-expanded' : 'is-collapsed'}`}>
      <button 
        onClick={() => handleLangClick('ka')} 
        className={lang === 'ka' ? 'active' : ''}
      >
        GE
      </button>
      <button 
        onClick={() => handleLangClick('en')} 
        className={lang === 'en' ? 'active' : ''}
      >
        EN
      </button>
      <button 
        onClick={() => handleLangClick('ru')} 
        className={lang === 'ru' ? 'active' : ''}
      >
        RU
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation()
          window.dispatchEvent(new CustomEvent('open-ai-chat'))
        }} 
        title="AI Chat"
        style={{ cursor: 'pointer', fontSize: '1rem', padding: '0.6rem 0.8rem' }}
      >
        🤖
      </button>
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, lang } = useLanguage()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [mobileOpen])

  const basePath = lang === 'ka' ? '' : `/${lang}`

  const navItems = [
    { label: t('nav.home'), to: `${basePath}/` },
    { label: t('nav.about'), to: `${basePath}/about` },
    { label: t('nav.schedule'), to: `${basePath}/schedule` },
    { label: t('nav.news'), to: `${basePath}/news` },
    { label: t('nav.payment'), to: `${basePath}/payment` },
    { label: t('nav.contact'), to: `${basePath}/contact` },
  ]

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header__inner container">
          <Link to={`${basePath}/`} className="header__brand" onClick={() => setMobileOpen(false)}>
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
                end={item.to === `${basePath}/`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link to={`${basePath}/contact`} className="btn btn-primary header__cta">
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
                end={item.to === `${basePath}/`}
              >
                <span className="mobile-menu__num">0{i + 1}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to={`${basePath}/contact`}
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
