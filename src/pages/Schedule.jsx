import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import './InnerPage.css'
import './Schedule.css'

// Weekly Schedule Events Database matching Sergi's Google Calendar exactly
const weeklyEvents = [
  // SUNDAY
  { day: 0, title: 'Ansamble 👨‍👩‍👧‍👦', time: '11:00 – 12:30', category: 'group', color: '#d4a64a' },
  { day: 0, title: 'Ballet Group 🩰', time: '13:00 – 16:00', category: 'ballet', color: '#c5a059' },
  { day: 0, title: 'Alisa ind.', time: '18:00 – 19:00', category: 'private', color: '#a89060' },

  // MONDAY
  { day: 1, title: 'FlyLife', time: '10:00 – 12:00', category: 'fitness', color: '#a89060' },
  { day: 1, title: 'Makar & Elene ind.', time: '15:30 – 16:30', category: 'private', color: '#a89060' },
  { day: 1, title: 'Golden Group 🥇', time: '16:30 – 17:30', category: 'group', color: '#ffd700' },
  { day: 1, title: 'Pre Silver Group 🥈', time: '17:30 – 18:30', category: 'group', color: '#c0c0c0' },
  { day: 1, title: 'Couples Group 💃', time: '18:30 – 19:30', category: 'group', color: '#e6c687' },
  { day: 1, title: 'Silver Group 🥈', time: '19:30 – 20:30', category: 'group', color: '#d4a64a' },
  { day: 1, title: 'Fitness 🧘', time: '21:00 – 22:00', category: 'fitness', color: '#8c7853' },

  // TUESDAY
  { day: 2, title: 'BABY 🚀', time: '17:30 – 18:15', category: 'kids', color: '#f39c12' },
  { day: 2, title: 'Bronza Group 🥉', time: '18:15 – 19:15', category: 'group', color: '#cd7f32' },
  { day: 2, title: 'Starter Group 🥉', time: '19:15 – 20:15', category: 'group', color: '#d4a64a' },
  { day: 2, title: 'Tango Argentine 💃', time: '20:15 – 21:15', category: 'adults', color: '#e74c3c' },

  // WEDNESDAY
  { day: 3, title: 'FlyLife', time: '10:00 – 12:00', category: 'fitness', color: '#a89060' },
  { day: 3, title: 'Makar & Elene ind.', time: '15:30 – 16:30', category: 'private', color: '#a89060' },
  { day: 3, title: 'Golden Group 🥇', time: '16:30 – 17:30', category: 'group', color: '#ffd700' },
  { day: 3, title: 'Pre Silver Group 🥈', time: '17:30 – 18:30', category: 'group', color: '#c0c0c0' },
  { day: 3, title: 'Couples Group 💃', time: '18:30 – 19:30', category: 'group', color: '#e6c687' },
  { day: 3, title: 'Silver Group 🥈', time: '19:30 – 20:30', category: 'group', color: '#d4a64a' },
  { day: 3, title: 'Fitness 🧘', time: '21:00 – 22:00', category: 'fitness', color: '#8c7853' },

  // THURSDAY
  { day: 4, title: 'Timur & Alisa', time: '11:00 – 12:00', category: 'private', color: '#a89060' },
  { day: 4, title: 'Dima & Adriana', time: '12:00 – 13:00', category: 'private', color: '#a89060' },
  { day: 4, title: 'Darya ind.', time: '15:30 – 16:30', category: 'private', color: '#a89060' },
  { day: 4, title: 'Elene ind.', time: '16:30 – 17:30', category: 'private', color: '#a89060' },
  { day: 4, title: 'BABY 🚀', time: '17:30 – 18:15', category: 'kids', color: '#f39c12' },
  { day: 4, title: 'Bronza Group 🥉', time: '18:15 – 19:15', category: 'group', color: '#cd7f32' },
  { day: 4, title: 'Starter Group 🥉', time: '19:15 – 20:15', category: 'group', color: '#d4a64a' },
  { day: 4, title: 'Tango Argentine 💃', time: '20:15 – 21:15', category: 'adults', color: '#e74c3c' },

  // FRIDAY
  { day: 5, title: 'FlyLife', time: '10:00 – 12:00', category: 'fitness', color: '#a89060' },
  { day: 5, title: 'Makar & Elene ind.', time: '15:30 – 16:30', category: 'private', color: '#a89060' },
  { day: 5, title: 'Golden Group 🥇', time: '16:30 – 17:30', category: 'group', color: '#ffd700' },
  { day: 5, title: 'Pre Silver Group 🥈', time: '17:30 – 18:30', category: 'group', color: '#c0c0c0' },
  { day: 5, title: 'Couples Group 💃', time: '18:30 – 19:30', category: 'group', color: '#e6c687' },
  { day: 5, title: 'Silver Group 🥈', time: '19:30 – 20:30', category: 'group', color: '#d4a64a' },
  { day: 5, title: 'Fitness 🧘', time: '21:00 – 22:00', category: 'fitness', color: '#8c7853' },

  // SATURDAY
  { day: 6, title: 'BABY 🚀', time: '10:00 – 11:00', category: 'kids', color: '#f39c12' },
  { day: 6, title: 'Bronza Group 🥉', time: '11:00 – 12:00', category: 'group', color: '#cd7f32' },
  { day: 6, title: 'Timur & Alisa ind.', time: '13:00 – 14:00', category: 'private', color: '#a89060' },
  { day: 6, title: 'Ballet/Dancesport', time: '14:00 – 15:00', category: 'ballet', color: '#c5a059' },
  { day: 6, title: 'Ballet Group 🩰', time: '15:00 – 18:00', category: 'ballet', color: '#c5a059' },
  { day: 6, title: 'Tango Argentine 💃', time: '20:00 – 21:00', category: 'adults', color: '#e74c3c' }
]

const daysOfWeekKA = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი']
const daysOfWeekEN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const daysOfWeekRU = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

export default function Schedule() {
  const { t, lang } = useLanguage()
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'google' | 'agenda'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())

  const dayNames = lang === 'ka' ? daysOfWeekKA : lang === 'ru' ? daysOfWeekRU : daysOfWeekEN
  const basePath = lang === 'ka' ? '' : `/${lang}`

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
          
          {/* LUXURY CONTROL BAR */}
          <div className="schedule-controls-bar">
            <div className="schedule-view-toggles">
              <button 
                className={`std-sched-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ✨ ST Dance Luxury Grid
              </button>
              <button 
                className={`std-sched-btn ${viewMode === 'google' ? 'active' : ''}`}
                onClick={() => setViewMode('google')}
              >
                📅 Google Calendar Live View
              </button>
            </div>

            <a 
              href="https://calendar.google.com/calendar/u/0/r?cid=stdancegroup@gmail.com" 
              target="_blank" 
              rel="noreferrer"
              className="std-sched-glink"
            >
              🔗 {lang === 'ka' ? 'Google Calendar-ში გახსნა' : lang === 'ru' ? 'Открыть в Google Календаре' : 'Open in Google Calendar'} ↗
            </a>
          </div>

          {/* VIEW 1: ST DANCE LUXURY OBSIDIAN & GOLD GRID */}
          {viewMode === 'grid' && (
            <div className="std-sched-luxury-card">
              {/* Day Filter Pills for Mobile & Quick Switch */}
              <div className="std-sched-days-bar">
                {dayNames.map((dName, dIdx) => (
                  <button
                    key={dIdx}
                    className={`std-sched-day-pill ${selectedDay === dIdx ? 'active' : ''}`}
                    onClick={() => setSelectedDay(dIdx)}
                  >
                    <span>{dName}</span>
                  </button>
                ))}
              </div>

              {/* Desktop Week Grid View */}
              <div className="std-sched-grid-desktop">
                {dayNames.map((dName, dIdx) => {
                  const dayEvts = weeklyEvents.filter((e) => e.day === dIdx)
                  return (
                    <div key={dIdx} className={`std-sched-col ${selectedDay === dIdx ? 'is-today' : ''}`}>
                      <div className="std-sched-col-header">
                        <span className="std-sched-col-name">{dName}</span>
                      </div>
                      <div className="std-sched-col-body">
                        {dayEvts.map((evt, eIdx) => (
                          <div 
                            key={eIdx} 
                            className={`std-sched-evt-card cat-${evt.category}`}
                            style={{ borderLeftColor: evt.color }}
                          >
                            <span className="std-sched-evt-time">{evt.time}</span>
                            <h5 className="std-sched-evt-title">{evt.title}</h5>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile Single Day View */}
              <div className="std-sched-mobile-view">
                <div className="std-sched-mobile-header">
                  <h4>{dayNames[selectedDay]}</h4>
                </div>
                <div className="std-sched-mobile-list">
                  {weeklyEvents.filter((e) => e.day === selectedDay).map((evt, eIdx) => (
                    <div key={eIdx} className="std-sched-mobile-evt-row">
                      <div className="std-sched-mobile-time">{evt.time}</div>
                      <div className="std-sched-mobile-info">
                        <h5>{evt.title}</h5>
                        <span className="std-sched-badge">{evt.category}</span>
                      </div>
                      <Link to={`${basePath}/register`} className="std-sched-mini-reg">
                        {lang === 'ka' ? 'ჩაწერა' : 'Join'} ➔
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: GOOGLE CALENDAR EMBED WITH DARK LUXURY FILTER */}
          {viewMode === 'google' && (
            <div className="calendar-wrap dark-gcal-frame">
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

              {/* Mobile: Agenda View */}
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
          )}

        </div>
      </section>
    </>
  )
}
