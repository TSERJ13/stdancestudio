import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Schedule() {
  const { t } = useLanguage()
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('schedule.eyebrow')}</span>
          <h1 className="display page-hero__title">
            {t('schedule.title')} <br />
            <span className="display-italic">{t('schedule.titleItalic')}</span>
          </h1>
          <p className="page-hero__lead">
            {t('schedule.desc')}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="calendar-wrap" style={{ 
            position: 'relative', 
            paddingBottom: '140%', 
            minHeight: '800px',
            height: 0, 
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: '#fff'
          }}>
            <iframe 
              src="https://calendar.google.com/calendar/embed?src=stdancegroup%40gmail.com&ctz=Asia%2FTbilisi&mode=WEEK&showPrint=0&showTabs=0&showCalendars=0&showTitle=0" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              frameBorder="0" 
              scrolling="no"
              title="ST Dance Studio Schedule"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}
