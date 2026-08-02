import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import { siteContent } from '../data/content'
import './InnerPage.css'
import './Home.css'

export default function About() {
  const { lang, t } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const programs = activeTrans.programs || siteContent.programs
  const teachers = activeTrans.teachers || siteContent.teachers
  const competitions = activeTrans.competitions || siteContent.competitions

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h1 className="display page-hero__title">
            {t('about.title')} <br />
            <span className="display-italic">{t('about.titleItalic')}</span>
          </h1>
        </div>
      </section>

      {/* ===================== STORY ===================== */}
      <section className="section">
        <div className="container split">
          <div className="split__media" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img 
              src="/images/about-kids-clean.jpg?v=5" 
              alt="Dancers" 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
          <div className="split__copy">
            <h2 className="display">{t('about.storyTitle')}</h2>
            <p>
              {t('about.desc1')}
            </p>
            <p>
              {t('about.desc2')}
            </p>
          </div>
        </div>
      </section>

      {/* ===================== PROGRAMS ===================== */}
      <section className="section section--alt">
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
        </div>
      </section>

      {/* ===================== TEACHERS ===================== */}
      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">{t('home.teamEyebrow')}</span>
            <h2 className="display section-head__title">
              {t('home.teamTitle')} <span className="display-italic">{t('home.teamTitleItalic')}</span>
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

      {/* ===================== TOURNAMENTS ===================== */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{activeTrans.about?.tourneyEyebrow || 'ტურნირები'}</span>
            <h2 className="display section-head__title">
              {activeTrans.about?.tourneyTitle || 'უახლოესი'} <span className="display-italic">{activeTrans.about?.tourneyTitleItalic || 'შეჯიბრებები'}</span>
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
