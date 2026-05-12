import { siteContent } from '../data/content'
import './InnerPage.css'
import './Home.css' // Reuse home styles for sections

export default function About() {
  const { programs, teachers, competitions } = siteContent

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">ჩვენ შესახებ</span>
          <h1 className="display page-hero__title">
            სტუდია, სადაც <br />
            <span className="display-italic">შედეგი ფასდება</span>
          </h1>
        </div>
      </section>

      {/* ===================== STORY ===================== */}
      <section className="section">
        <div className="container split">
          <div className="split__media">
            <img src="/images/dancer-2.png" alt="Dancer" />
          </div>
          <div className="split__copy">
            <h2 className="display">სპორტი, რომელიც აყალიბებს ხასიათს</h2>
            <p>
              ST Dance Studio არის სივრცე, სადაც სპორტული ცეკვა მხოლოდ ჰობი არ არის.
              ჩვენი მიზანია ბავშვებს ვასწავლოთ დისციპლინა, შრომისმოყვარეობა და 
              დავეხმაროთ მათ ფიზიკურ თუ ემოციურ განვითარებაში.
            </p>
            <p>
              პარკეტზე გატარებული ყოველი საათი აყალიბებს თავდაჯერებულობას, 
              რომელიც მოცეკვავეებს არა მხოლოდ შეჯიბრებებზე, არამედ ცხოვრებაშიც 
              ეხმარებათ.
            </p>
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS ===================== */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">მიმართულებები</span>
            <h2 className="display section-head__title">
              რას <span className="display-italic">ვასწავლით</span>
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
        </div>
      </section>

      {/* ===================== TEACHERS ===================== */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">მასწავლებლები</span>
            <h2 className="display section-head__title">
              ჩვენი <span className="display-italic">გუნდი</span>
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

      {/* ===================== TOURNAMENTS ===================== */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">ტურნირები</span>
            <h2 className="display section-head__title">
              უახლოესი <span className="display-italic">შეჯიბრებები</span>
            </h2>
          </div>
          <div className="tournaments-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {competitions.map((c, i) => (
              <div key={i} className="tourney-card" style={{ background: 'var(--color-bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-line)' }}>
                <img src={c.image} alt={c.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                <div style={{ padding: '1.5rem' }}>
                  <div className="eyebrow" style={{ fontSize: '0.7rem', marginBottom: '0.5rem' }}>{c.date}</div>
                  <h3 className="display" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
