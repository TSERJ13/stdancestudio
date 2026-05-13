import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Schedule() {
  const { t, lang } = useLanguage()
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
          <div className="calendar-wrap">
            {/* Desktop: Week View */}
            <iframe 
              className="calendar-iframe desktop-only"
              src={`https://calendar.google.com/calendar/embed?src=stdancegroup%40gmail.com&ctz=Asia%2FTbilisi&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&hl=${lang}`} 
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
              title="Schedule Desktop"
            ></iframe>

            {/* Mobile: Agenda View (hides empty time slots) */}
            <iframe 
              className="calendar-iframe mobile-only"
              src={`https://calendar.google.com/calendar/embed?src=stdancegroup%40gmail.com&ctz=Asia%2FTbilisi&mode=AGENDA&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&hl=${lang}`} 
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
              title="Schedule Mobile"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}
