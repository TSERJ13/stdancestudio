import { useState } from 'react'
import { siteContent } from '../data/content'
import './InnerPage.css'

export default function Contact() {
  const { contact } = siteContent
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })

  const onSubmit = (e) => {
    e.preventDefault()
    // For now just show success state; later you can wire this up to
    // Formspree, Resend, EmailJS, or a Vercel serverless function.
    console.log('Form submitted:', form)
    setSubmitted(true)
  }

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">კონტაქტი</span>
          <h1 className="display page-hero__title">
            დავიწყოთ <br />
            <span className="display-italic">საუბარი</span>
          </h1>
          <p className="page-hero__lead">
            დაგვიკავშირდით ნებისმიერი კითხვით. პასუხს მალე მიიღებთ.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2 className="display">სად ვართ</h2>
            <ul className="contact-list">
              <li>
                <span className="contact-list__label">ტელეფონი</span>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </li>
              <li>
                <span className="contact-list__label">ელ-ფოსტა</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <span className="contact-list__label">მისამართი</span>
                <p>{contact.address}</p>
              </li>
            </ul>

            <div className="contact-social">
              <span className="contact-list__label">სოც. ქსელები</span>
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
                <h3 className="display">გმადლობთ!</h3>
                <p>თქვენი მოთხოვნა მიღებულია — მალე დაგიკავშირდებით.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={onSubmit}>
                <h2 className="display">დაგვიტოვეთ შეტყობინება</h2>

                <div className="form-field">
                  <label htmlFor="name">სახელი</label>
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
                  <label htmlFor="phone">ტელეფონი</label>
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
                  <label htmlFor="message">შეტყობინება</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={form.message}
                    onChange={onChange}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">გაგზავნა</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
