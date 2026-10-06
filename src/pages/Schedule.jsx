import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'
import './Schedule.css'

// Weekly Schedule Events Database — Matching ST Dance Google Calendar Schedule & Live Palette
const defaultWeeklyEvents = [
  // MONDAY (0)
  { day: 0, title: 'FlyLife', time: '10:00 – 12:00', category: 'fitness', color: '#e06d53' },
  { day: 0, title: 'Makar & Elene ind.', time: '15:30 – 16:30', category: 'private', color: '#0b8043' },
  { day: 0, title: 'Golden Group🥇​', time: '16:30 – 17:30', category: 'group', color: '#ff5722' },
  { day: 0, title: 'Pre Silver Group 🏅', time: '17:30 – 18:30', category: 'group', color: '#039be5' },
  { day: 0, title: 'Couples Group 🎖️', time: '18:30 – 19:30', category: 'group', color: '#8e24aa' },
  { day: 0, title: 'Silver Group 🥈​', time: '19:30 – 20:30', category: 'group', color: '#78909c' },
  { day: 0, title: 'Fitness 🧘🏻‍♀️', time: '21:00 – 22:00', category: 'fitness', color: '#00b0ff' },

  // TUESDAY (1)
  { day: 1, title: 'Fitness 🧘🏻‍♀️', time: '12:30 – 13:30', category: 'fitness', color: '#00b0ff' },
  { day: 1, title: 'Hobby Class', time: '16:00 – 17:00', category: 'group', color: '#e91e63' },
  { day: 1, title: 'BABY 🚀', time: '17:30 – 18:15', category: 'kids', color: '#f3b23e' },
  { day: 1, title: 'Bronza Group 🥉', time: '18:15 – 19:15', category: 'group', color: '#d96b5c' },
  { day: 1, title: 'Starter 🏁', time: '19:15 – 20:15', category: 'group', color: '#3f51b5' },
  { day: 1, title: 'Tango Argentine 💃', time: '20:15 – 21:15', category: 'adults', color: '#d50000' },

  // WEDNESDAY (2)
  { day: 2, title: 'Flylife', time: '10:00 – 12:00', category: 'fitness', color: '#e06d53' },
  { day: 2, title: 'Makar & Elene', time: '15:30 – 16:30', category: 'private', color: '#0b8043' },
  { day: 2, title: 'Golden Group🥇', time: '16:30 – 17:30', category: 'group', color: '#ff5722' },
  { day: 2, title: 'Pre Silver Group 🏅', time: '17:30 – 18:30', category: 'group', color: '#039be5' },
  { day: 2, title: 'Couples Group 🎖️', time: '18:30 – 19:30', category: 'group', color: '#8e24aa' },
  { day: 2, title: 'Silver Group 🥈', time: '19:30 – 20:30', category: 'group', color: '#78909c' },
  { day: 2, title: 'Fitness 🧘🏻‍♀️', time: '21:00 – 22:00', category: 'fitness', color: '#00b0ff' },

  // THURSDAY (3)
  { day: 3, title: 'Fitness 🧘🏻‍♀️', time: '12:30 – 13:30', category: 'fitness', color: '#00b0ff' },
  { day: 3, title: 'Hobby Class', time: '16:00 – 17:00', category: 'group', color: '#e91e63' },
  { day: 3, title: 'BABY 🚀', time: '17:30 – 18:15', category: 'kids', color: '#f3b23e' },
  { day: 3, title: 'Bronza Group 🥉', time: '18:15 – 19:15', category: 'group', color: '#d96b5c' },
  { day: 3, title: 'Starter 🏁', time: '19:15 – 20:15', category: 'group', color: '#3f51b5' },
  { day: 3, title: 'Tango Argentine 💃', time: '20:15 – 21:15', category: 'adults', color: '#d50000' },

  // FRIDAY (4)
  { day: 4, title: 'Flylife', time: '10:00 – 12:00', category: 'fitness', color: '#e06d53' },
  { day: 4, title: 'Fitness 🧘🏻‍♀️', time: '12:30 – 13:30', category: 'fitness', color: '#00b0ff' },
  { day: 4, title: 'Makar & Elene', time: '15:30 – 16:30', category: 'private', color: '#0b8043' },
  { day: 4, title: 'Golden Group🥇', time: '16:30 – 17:30', category: 'group', color: '#ff5722' },
  { day: 4, title: 'Pre Silver Group 🏅', time: '17:30 – 18:30', category: 'group', color: '#039be5' },
  { day: 4, title: 'Couples Group 🎖️', time: '18:30 – 19:30', category: 'group', color: '#8e24aa' },
  { day: 4, title: 'Silver Group 🥈', time: '19:30 – 20:30', category: 'group', color: '#78909c' },
  { day: 4, title: 'Fitness 🧘🏻‍♀️', time: '21:00 – 22:00', category: 'fitness', color: '#00b0ff' },

  // SATURDAY (5)
  { day: 5, title: 'BABY 🚀', time: '10:00 – 11:00', category: 'kids', color: '#f3b23e' },
  { day: 5, title: 'Bronza Group 🥉', time: '11:00 – 12:00', category: 'group', color: '#d96b5c' },
  { day: 5, title: 'Starter 🏁', time: '12:00 – 13:00', category: 'group', color: '#3f51b5' },
  { day: 5, title: 'Practice ⏱️', time: '13:00 – 14:30', category: 'group', color: '#d4a64a' },
  { day: 5, title: 'Ballet Group 🩰', time: '15:00 – 18:00', category: 'ballet', color: '#ab47bc' },
  { day: 5, title: 'Tango Argentine', time: '20:00 – 21:00', category: 'adults', color: '#d50000' },

  // SUNDAY (6)
  { day: 6, title: 'Ballet Group 🩰', time: '13:00 – 17:00', category: 'ballet', color: '#ab47bc' }
]

// Week starting from MONDAY
const daysOfWeekKA = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა']
const daysOfWeekEN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const daysOfWeekRU = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export default function Schedule() {
  const { t, lang } = useLanguage()
  
  // Calculate current day index starting Monday (0 = Mon, ..., 6 = Sun)
  const currentJsDay = new Date().getDay() // 0 = Sun, 1 = Mon...
  const initialMondayBasedDay = currentJsDay === 0 ? 6 : currentJsDay - 1
  const [selectedDay, setSelectedDay] = useState(initialMondayBasedDay)
  const [weeklyEvents, setWeeklyEvents] = useState(defaultWeeklyEvents)

  useEffect(() => {
    // Dynamically sync latest events from Google Calendar
    fetch('/api/calendar-events')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.events && data.events.length > 0) {
          setWeeklyEvents(data.events)
        }
      })
      .catch(err => {
        console.warn('Live calendar sync fallback to default static schedule:', err)
      })
  }, [])

  const dayNames = lang === 'ka' ? daysOfWeekKA : lang === 'ru' ? daysOfWeekRU : daysOfWeekEN

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
          
          {/* ST DANCE LUXURY OBSIDIAN & GOLD GRID */}
          <div className="std-sched-luxury-card">
            
            {/* Day Filter Pills for MOBILE ONLY (hidden on desktop) */}
            <div className="std-sched-days-bar mobile-only-days">
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

            {/* Desktop 7-Day Grid View (Mon -> Sun) */}
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
                          className="std-sched-evt-card"
                          style={{ 
                            background: `${evt.color}22`,
                            border: `1px solid ${evt.color}55`,
                            borderLeft: `4px solid ${evt.color}`
                          }}
                        >
                          <span className="std-sched-evt-time" style={{ color: evt.color, fontWeight: '700' }}>{evt.time}</span>
                          <h5 className="std-sched-evt-title" style={{ color: '#ffffff' }}>{evt.title}</h5>
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
                  <div 
                    key={eIdx} 
                    className="std-sched-mobile-evt-row"
                    style={{ 
                      background: `${evt.color}20`,
                      border: `1px solid ${evt.color}44`,
                      borderLeft: `4px solid ${evt.color}`
                    }}
                  >
                    <div className="std-sched-mobile-time" style={{ color: evt.color, fontWeight: '700' }}>{evt.time}</div>
                    <div className="std-sched-mobile-info">
                      <h5 style={{ color: '#ffffff', margin: 0 }}>{evt.title}</h5>
                      <span className="std-sched-badge" style={{ color: evt.color, fontWeight: '600', fontSize: '11px' }}>{evt.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  )
}
