import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import './Footer.css'

export default function Footer() {
  const { contact } = siteContent
  const { lang, t } = useLanguage()

  const basePath = lang === 'ka' ? '' : `/${lang}`

  const navItems = [
    { label: t('nav.home'), to: `${basePath}/` },
    { label: t('nav.about'), to: `${basePath}/about` },
    { label: t('nav.schedule'), to: `${basePath}/schedule` },
    { label: t('nav.payment'), to: `${basePath}/payment` },
    { label: t('nav.contact'), to: `${basePath}/contact` },
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
            <li><Link to={`${basePath}/privacy`}>{lang === 'ka' ? 'კონფიდენციალურობა' : lang === 'ru' ? 'Политика Конфиденциальности' : 'Privacy Policy'}</Link></li>
            <li><Link to={`${basePath}/terms`}>{lang === 'ka' ? 'წესები და პირობები' : lang === 'ru' ? 'Условия Использования' : 'Terms & Conditions'}</Link></li>
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
              <p>{t('contact.addressText')}</p>
            </li>
          </ul>
        </div>

        <div className="footer__col footer__col--social">
          <h4 className="footer__heading">Social</h4>
          <ul className="footer__social-icons">
            <li>
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </li>
            <li>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </li>
            <li>
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <p>© {new Date().getFullYear()} ST Dance Studio. {t('footer.rights')}.</p>
      </div>
    </footer>
  )
}
