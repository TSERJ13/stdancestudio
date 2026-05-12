import { Link } from 'react-router-dom'
import { siteContent } from '../data/content'
import './Footer.css'

export default function Footer() {
  const { brand, contact, nav } = siteContent

  return (
    <footer className="footer">
      <div className="footer__decor" aria-hidden></div>

      <div className="container footer__inner">
        <div className="footer__brand">
          <img src="/images/logo.png" alt="" className="footer__logo" />
          <h3 className="footer__name">
            {brand.name.split(' ').map((w, i) => (
              <span key={i} className={i === 1 ? 'display-italic' : ''}>{w} </span>
            ))}
          </h3>
          <p className="footer__tagline">{brand.tagline}</p>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">ნავიგაცია</h4>
          <ul className="footer__links">
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">კონტაქტი</h4>
          <ul className="footer__contact">
            <li>
              <span>ტელეფონი</span>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
            </li>
            <li>
              <span>ელ-ფოსტა</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </li>
            <li>
              <span>მისამართი</span>
              <p>{contact.address}</p>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">სოც. ქსელები</h4>
          <ul className="footer__social">
            <li><a href={contact.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href={contact.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href={contact.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} ST Dance Studio. ყველა უფლება დაცულია.</p>
        <p className="footer__credit">
          მოამზადა <span className="display-italic">სიყვარულით</span>
        </p>
      </div>
    </footer>
  )
}
