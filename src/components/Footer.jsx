import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import './Footer.css'

export default function Footer() {
  const { contact } = siteContent
  const { t } = useLanguage()

  const navItems = [
    { label: t('nav.home'), to: '/' },
    { label: t('nav.about'), to: '/about' },
    { label: t('nav.schedule'), to: '/schedule' },
    { label: t('nav.payment'), to: '/payment' },
    { label: t('nav.contact'), to: '/contact' },
  ]

  return (
    <footer className="footer">
      <div className="footer__decor" aria-hidden></div>

      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/images/logo-transparent.png" alt="ST Dance Studio" className="footer__logo" />
          <div className="footer__brand-text" style={{ fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase', marginBottom: '1.5rem', maxWidth: 'fit-content' }}>
            <span className="footer__name" style={{ color: 'var(--color-gold)', fontSize: '1.5rem', letterSpacing: '0.1em', display: 'block', marginBottom: '0' }}>ST DANCE</span>
            <div style={{ height: '1px', background: 'var(--color-gold)', margin: '2px 0', width: '100%' }}></div>
            <span className="footer__tagline" style={{ color: '#fff', fontSize: '1rem', letterSpacing: '0.4em', display: 'block', textTransform: 'lowercase' }}>studio</span>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('about.eyebrow')}</h4>
          <ul className="footer__links">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('contact.eyebrow')}</h4>
          <ul className="footer__contact">
            <li>
              <span>{t('contact.phone')}</span>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
            </li>
            <li>
              <span>{t('contact.email')}</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <span>{t('contact.address')}</span>
              <p>{contact.address}</p>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Social</h4>
          <ul className="footer__social">
            <li><a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href={contact.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href={contact.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} ST Dance Studio. {t('footer.rights')}.</p>
      </div>
    </footer>
  )
}
