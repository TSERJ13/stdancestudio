import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { siteContent } from '../data/content'
import { translations } from '../data/translations'
import { useLanguage } from '../context/LanguageContext'
import './Home.css'

export default function Home() {
  const { testimonials } = siteContent
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const { lang, t } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const activeTrans = translations[lang] || translations.ka
  const programs = activeTrans.programs || siteContent.programs
  const teachers = activeTrans.teachers || siteContent.teachers

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(id)
  }, [testimonials.length])

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="hero__bg">
          <img src="/images/hero-1.png" alt="" />
          <div className="hero__bg-overlay"></div>
        </div>

        <div className="hero__inner container">
          <div className="hero__copy">
            <span className="eyebrow fade-up" style={{ animationDelay: '0.2s' }}>
              {t('hero.eyebrow')}
            </span>

            <h1 className="hero__title display fade-up" style={{ animationDelay: '0.35s' }}>
              {t('hero.title')}{' '}
              <span className="display-italic">{t('hero.titleItalic')}</span>
              <br />
              {t('hero.titleEnd')}
            </h1>

            <p className="hero__desc fade-up" style={{ animationDelay: '0.55s' }}>
              {t('hero.desc')}
            </p>

            <div className="hero__actions fade-up" style={{ animationDelay: '0.75s' }}>
              <Link to={`${basePath}/register`} className="btn btn-primary">
                {t('hero.cta')}
              </Link>
              <Link to={`${basePath}/about`} className="btn btn-ghost">
                {t('nav.about')}
              </Link>
            </div>
          </div>

          <div className="hero__scroll">
            <span>scroll</span>
            <div className="hero__scroll-line"></div>
          </div>
        </div>
      </section>

      {/* ===================== STATS ===================== */}
      <section className="stats">
        <div className="container stats__inner">
          <div className="stat">
            <div className="stat__value display">10+</div>
            <div className="stat__label">{t('stats.exp')}</div>
          </div>
          <div className="stat">
            <div className="stat__value display">150+</div>
            <div className="stat__label">{t('stats.students')}</div>
          </div>
          <div className="stat">
            <div className="stat__value display">50+</div>
            <div className="stat__label">{t('stats.awards')}</div>
          </div>
          <div className="stat">
            <div className="stat__value display">5</div>
            <div className="stat__label">{t('stats.trainers')}</div>
          </div>
        </div>
      </section>

      {/* ===================== ABOUT BLURB ===================== */}
      <section className="section about-blurb">
        <div className="container about-blurb__grid">
          <div className="about-blurb__media" style={{ background: '#000', overflow: 'hidden' }}>
            <img 
              src="/images/about-kids-clean.jpg?v=5" 
              alt="ST Dance Studio" 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
            <div className="about-blurb__badge">
              <span className="display-italic">est.</span>
              <strong>2014</strong>
            </div>
          </div>

          <div className="about-blurb__copy">
            <span className="eyebrow">{t('about.eyebrow')}</span>
            <h2 className="display about-blurb__title">
              {t('about.title')} <br />
              <span className="display-italic">{t('about.titleItalic')}</span>
            </h2>
            <p>
              {t('about.desc1')}
            </p>
            <p>
              {t('about.desc2')}
            </p>
            <Link to={`${basePath}/about`} className="btn btn-arrow">
              {t('about.more')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS ===================== */}
      <section className="section programs-preview">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t('home.progEyebrow')}</span>
            <h2 className="display section-head__title">
              {t('home.progTitle')} <span className="display-italic">{t('home.progTitleItalic')}</span>
            </h2>
          </div>

          <div className="programs-grid">
            {programs.map((p) => (
              <article key={p.id} className="prog-card">
                <div className="prog-card__num">{p.number}</div>
                <h3 className="prog-card__title display">{p.title}</h3>
                <div className="prog-card__latin">{p.latin}</div>
                <p className="prog-card__desc">{p.description}</p>
                <div className="prog-card__meta">
                  <span>AGE:</span> {p.ages}
                </div>
              </article>
            ))}
          </div>

          <div className="section-foot">
            <Link to={`${basePath}/about`} className="btn btn-ghost">
              {t('about.more')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== TEACHERS ===================== */}
      <section className="section teachers-preview">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{t('home.teamEyebrow')}</span>
            <h2 className="display section-head__title">
              {t('home.teamTitle')} <br />
              <span className="display-italic">{t('home.teamTitleItalic')}</span>
            </h2>
          </div>

          <div className="teachers-grid">
            {teachers.map((teach, i) => (
              <article key={i} className="teacher-card">
                <div className="teacher-card__photo">
                  <img src={teach.photo} alt={teach.name} />
                </div>
                <div className="teacher-card__body">
                  <div className="teacher-card__role">{teach.role}</div>
                  <h3 className="teacher-card__name display">{teach.name}</h3>
                  <p>{teach.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="section testimonials">
        <div className="container testimonials__inner">
          <div className="eyebrow">შეფასებები</div>
          <div className="testimonial">
            <blockquote className="testimonial__quote display">
              "{testimonials[testimonialIdx].quote}"
            </blockquote>
            <cite className="testimonial__author">
              <strong>{testimonials[testimonialIdx].author}</strong>
              <span>{testimonials[testimonialIdx].role}</span>
            </cite>
          </div>
          <div className="testimonials__dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === testimonialIdx ? 'dot--active' : ''}`}
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="section cta-section">
        <div className="container cta-section__inner">
          <h2 className="display cta-section__title">
            {t('home.ctaTitle')} <br />
            <span className="display-italic">{t('home.ctaTitleItalic')}</span>
          </h2>
          <p className="cta-section__desc">
            {t('home.ctaDesc')}
          </p>
          <Link to={`${basePath}/register`} className="btn btn-primary">
            {t('home.ctaBtn')}
          </Link>
        </div>
      </section>
    </>
  )
}
