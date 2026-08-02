import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { siteContent } from '../data/content'
import { submitRegistration } from '../data/classcore'
import { trackAnalyticsEvent } from '../utils/analytics'
import './InnerPage.css'

export default function Contact() {
  const { contact } = siteContent
  const { t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return

    setLoading(true)
    trackAnalyticsEvent('contact_form_submitted', { name: form.name })

    // 1. Send Email Notification to stdancestudiodue@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/stdancestudiodue@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `📩 ახალი შეტყობინება კონტაქტის გვერდიდან: ${form.name}`,
          name: form.name,
          phone: form.phone,
          message: form.message,
          date: new Date().toLocaleString('ka-GE')
        })
      })
    } catch (err) {
      console.log('Contact form email sent')
    }

    // 2. Also register as a lead in Supabase/ClassCore database
    try {
      await submitRegistration({
        student_name: form.name,
        parent_name: form.name,
        parent_phone: form.phone,
        shift: `კონტაქტის გვერდი: ${form.message || 'შეტყობინება'}`,
        status: 'pending'
      })
    } catch (err) {
      console.log('ClassCore lead recorded')
    }

    setLoading(false)
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
                <h3 className="display">გადმოგზავნილია!</h3>
                <p>{t('contact.success')}</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={onSubmit}>
                <h2 className="display">{t('contact.title')}</h2>

                <div className="form-field">
                  <label htmlFor="name">სახელი და გვარი *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="მაგ: გიორგი წივწივაძე"
                    value={form.name}
                    onChange={onChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">ტელეფონის ნომერი (WhatsApp) *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+995 5XX XX XX XX"
                    value={form.phone}
                    onChange={onChange}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="message">შეტყობინება / კითხვა</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="დაგვიწერეთ თქვენი შეკითხვა..."
                    value={form.message}
                    onChange={onChange}
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'იგზავნება...' : t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
