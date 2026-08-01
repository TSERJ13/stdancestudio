import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteContent } from '../data/content'
import './InnerPage.css'

export default function Contact() {
  const { contact } = siteContent
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const onSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('contact.eyebrow')}</span>
          <h1 className="display page-hero__title">
            {t('contact.title')}
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2 className="display">{t('contact.address')}</h2>
            <ul className="contact-list">
              <li>
                <span className="contact-list__label">{t('contact.phone')}</span>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
              <li>
                <span className="contact-list__label">{t('contact.email')}</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span className="contact-list__label">{t('contact.address')}</span>
                <p>{t('contact.addressText')}</p>
              </li>
            </ul>

            <div className="contact-social">
              <span className="contact-list__label">Social</span>
              <div className="contact-social__links">
                <a href={contact.instagram} target="_blank" rel="noreferrer">Instagram</a>
                <a href={contact.facebook} target="_blank" rel="noreferrer">Facebook</a>
                <a href={contact.youtube} target="_blank" rel="noreferrer">YouTube</a>
              </div>
            </div>

            <div className="contact-map" style={{ marginTop: '3rem' }}>
              <span className="contact-list__label">Map</span>
              <a 
                href="https://maps.app.goo.gl/iyBGVtNeiNUGZmq86" 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'block', marginTop: '1rem', border: '1px solid var(--color-line)', borderRadius: '4px', overflow: 'hidden', height: '250px', position: 'relative' }}
              >
                <iframe
                  src="https://maps.google.com/maps?q=E.%20Takaishvili%2055,%20Batumi&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)', pointerEvents: 'none' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </a>
            </div>
          </div>

          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success__icon">✓</div>
                <h3 className="display">Success!</h3>
                <p>{t('contact.success')}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={onSubmit}>
                <h2 className="display">{t('contact.title')}</h2>

                <div className="form-field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={onChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">{t('contact.phone')}</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={onChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={form.message}
                    onChange={onChange}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">{t('contact.send')}</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
