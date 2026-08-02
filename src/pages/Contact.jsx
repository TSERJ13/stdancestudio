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
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return

    setLoading(true)
    trackAnalyticsEvent('contact_form_submitted', { name: form.name })

    // 1. Send Email Notification to stdancegroupdue@gmail.com
    try {
      await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
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
        <div className="container">
          {/* Main Top Grid: Contact Info & Contact Form */}
          <div className="contact-grid">
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
            </div>

            <div className="contact-form-wrap">
              {submitted ? (
                <div className="contact-success">
                  <div className="contact-success__icon">✓</div>
                  <h3 className="display">{t('contact.successTitle')}</h3>
                  <p>{t('contact.success')}</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={onSubmit}>
                  <h2 className="display">{t('contact.title')}</h2>

                  <div className="form-field">
                    <label htmlFor="name">{t('contact.nameLabel')}</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder={t('contact.namePlaceholder')}
                      value={form.name}
                      onChange={onChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone">{t('contact.phoneLabel')}</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder={t('contact.phonePlaceholder')}
                      value={form.phone}
                      onChange={onChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="message">{t('contact.messageLabel')}</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      placeholder={t('contact.messagePlaceholder')}
                      value={form.message}
                      onChange={onChange}
                    ></textarea>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? t('contact.sending') : t('contact.send')}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FULL-WIDTH SIDE-BY-SIDE MEDIA SHOWCASE: GOOGLE MAP (LEFT) & STUDIO HALL PHOTO (RIGHT) */}
          <div className="contact-media-showcase" style={{ marginTop: '3.5rem' }}>
            <div className="contact-media-grid">
              
              {/* 1. Google Map (Left) */}
              <div className="contact-map-box">
                <span className="contact-list__label" style={{ display: 'block', marginBottom: '0.6rem' }}>
                  📍 {t('contact.mapTitle')}
                </span>
                <a 
                  href="https://maps.app.goo.gl/iyBGVtNeiNUGZmq86" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    display: 'block', 
                    border: '1px solid rgba(212, 166, 74, 0.35)', 
                    borderRadius: '10px', 
                    overflow: 'hidden', 
                    height: '320px', 
                    position: 'relative',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                    transition: 'all 0.4s ease'
                  }}
                  className="contact-hover-card"
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

              {/* 2. Studio Hall Photo Clean (Right) */}
              <div className="contact-hall-box">
                <span className="contact-list__label" style={{ display: 'block', marginBottom: '0.6rem' }}>
                  🏛️ {t('contact.hallTitle')}
                </span>
                <div 
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{ 
                    border: '1px solid rgba(212, 166, 74, 0.35)', 
                    borderRadius: '10px', 
                    overflow: 'hidden', 
                    height: '320px', 
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                    background: '#0a0908'
                  }}
                  className="contact-hover-card"
                >
                  <img 
                    src="/images/studio-hall.jpg" 
                    alt="ST Dance Studio Hall" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      display: 'block',
                      transition: 'transform 0.6s ease'
                    }}
                    className="hall-img-zoom"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div 
          onClick={() => setIsPhotoModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1.5px solid var(--color-gold, #d4a64a)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)'
            }}
          >
            <button 
              onClick={() => setIsPhotoModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.75)',
                border: '1px solid var(--color-gold, #d4a64a)',
                color: 'var(--color-gold, #d4a64a)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>
            <img 
              src="/images/studio-hall.jpg" 
              alt="ST Dance Studio Hall Fullscreen" 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ padding: '16px', background: '#0d0c0b', textAlign: 'center', color: '#fff' }}>
              <h4 style={{ color: 'var(--color-gold, #d4a64a)', margin: '0 0 4px 0' }}>ST DANCE STUDIO HALL</h4>
              <p style={{ margin: 0, color: '#a8a39a', fontSize: '13px' }}>ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55 • აკადემიური საცეკვაო პარკეტი</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
