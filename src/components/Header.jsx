import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import './Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header__inner container">
        <Link to="/" className="header__brand" onClick={() => setMobileOpen(false)}>
          <img src="/images/logo.png" alt="ST Dance Studio" className="header__logo" />
          <span className="header__brand-text">
            <span className="header__brand-name">ST Dance</span>
            <span className="header__brand-sub">studio</span>
          </span>
        </Link>

        <nav className="header__nav">
          {siteContent.nav.map((item) => (
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
        </nav>

        <Link to="/contact" className="btn btn-primary header__cta">
          ჩაწერა
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
          {siteContent.nav.map((item, i) => (
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
          ჩაწერა
        </Link>
      </div>
    </header>
  )
}
