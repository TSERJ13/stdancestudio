import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { siteContent } from '../data/content'
import './Home.css'

export default function Home() {
  const { hero, stats, programs, teachers, testimonials } = siteContent
  const [testimonialIdx, setTestimonialIdx] = useState(0)

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
              {hero.eyebrow}
            </span>

            <h1 className="hero__title display fade-up" style={{ animationDelay: '0.35s' }}>
              {hero.title}{' '}
              <span className="display-italic">{hero.titleItalic}</span>
              <br />
              {hero.titleEnd}
            </h1>

            <p className="hero__desc fade-up" style={{ animationDelay: '0.55s' }}>
              {hero.description}
            </p>

            <div className="hero__actions fade-up" style={{ animationDelay: '0.75s' }}>
              <Link to="/contact" className="btn btn-primary">
                გავიცნოთ ერთმანეთი
              </Link>
              <Link to="/programs" className="btn btn-ghost">
                მიმართულებები
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
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="stat__value display">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== ABOUT BLURB ===================== */}
      <section className="section about-blurb">
        <div className="container about-blurb__grid">
          <div className="about-blurb__media" style={{ background: '#000' }}>
            <img 
              src="/images/about-kids-extended.jpg?v=3" 
              alt="ST Dance Studio" 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
            <div className="about-blurb__badge">
              <span className="display-italic">est.</span>
              <strong>2014</strong>
            </div>
          </div>

          <div className="about-blurb__copy">
            <span className="eyebrow">ჩვენ შესახებ</span>
            <h2 className="display about-blurb__title">
              წარმატება <br />
              <span className="display-italic">პარკეტზე იწყება</span>
            </h2>
            <p>
              კეთილი იყოს თქვენი მობრძანება სპორტული ცეკვების სამყაროში. ჩვენი
              სტუდია არის ადგილი, სადაც ყოველ ბავშვს ეთმობა დრო და ენერგია,
              რათა დაეუფლოს ცეკვის ტექნიკას და ჩამოყალიბდეს ნამდვილ
              სპორტსმენად.
            </p>
            <p>
              ჩვენი მთავარი აქცენტი მოცეკვავეების მომავალი თაობის
              ჩამოყალიბებაზეა — ვაერთიანებთ ტექნიკურ ოსტატობას, მუსიკალურობასა
              და სცენურ კულტურას.
            </p>
            <Link to="/about" className="btn btn-arrow">
              მეტი ჩვენ შესახებ
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS ===================== */}
      <section className="section programs-preview">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">მიმართულებები</span>
            <h2 className="display section-head__title">
              ცეკვის ოთხი <span className="display-italic">სამყარო</span>
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
                  <span>ასაკი:</span> {p.ages}
                </div>
              </article>
            ))}
          </div>

          <div className="section-foot">
            <Link to="/programs" className="btn btn-ghost">
              ყველა მიმართულება
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== TEACHERS ===================== */}
      <section className="section teachers-preview">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">მასწავლებლები</span>
            <h2 className="display section-head__title">
              გუნდი, რომელიც <br />
              <span className="display-italic">მოგამზადებთ შედეგისთვის</span>
            </h2>
          </div>

          <div className="teachers-grid">
            {teachers.map((t, i) => (
              <article key={i} className="teacher-card">
                <div className="teacher-card__photo">
                  <img src={t.photo} alt={t.name} />
                </div>
                <div className="teacher-card__body">
                  <div className="teacher-card__role">{t.role}</div>
                  <h3 className="teacher-card__name display">{t.name}</h3>
                  <p>{t.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="section testimonials">
        <div className="container">
          <div className="testimonials__quote-mark">"</div>
          <div className="testimonials__slider">
            {testimonials.map((t, i) => (
              <blockquote
                key={i}
                className={`testimonial ${i === testimonialIdx ? 'is-active' : ''}`}
              >
                <p className="testimonial__quote display">{t.quote}</p>
                <footer>
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="testimonials__dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === testimonialIdx ? 'is-active' : ''}`}
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="cta">
        <div className="container cta__inner">
          <div className="cta__copy">
            <h2 className="display cta__title">
              მზად ხართ <span className="display-italic">პირველი ნაბიჯისთვის?</span>
            </h2>
            <p>
              დაგვიკავშირდით — საცდელი გაკვეთილი უფასოა. დაუტოვეთ თქვენი
              ნომერი და ჩვენ დაგირეკავთ.
            </p>
          </div>
          <Link to="/contact" className="btn btn-primary cta__btn">
            ჩაწერა საცდელ გაკვეთილზე
          </Link>
        </div>
      </section>
    </>
  )
}
