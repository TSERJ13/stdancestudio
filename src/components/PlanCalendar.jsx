import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import {
  HOLIDAYS_MAP,
  TOURNAMENTS_MAP,
  GROUPS_INFO,
  getMacroCyclePhase,
  getDailyLessonTask
} from '../data/planCalendarEngine'
import './PlanCalendar.css'

const monthsData = [
  { id: '2026-08', label: { ka: 'აგვისტო 2026', en: 'August 2026', ru: 'Август 2026' }, year: 2026, month: 7, daysCount: 31, startDay: 5 },
  { id: '2026-09', label: { ka: 'სექტემბერი 2026', en: 'September 2026', ru: 'Сентябрь 2026' }, year: 2026, month: 8, daysCount: 30, startDay: 1 },
  { id: '2026-10', label: { ka: 'ოქტომბერი 2026', en: 'October 2026', ru: 'Октябрь 2026' }, year: 2026, month: 9, daysCount: 31, startDay: 3 },
  { id: '2026-11', label: { ka: 'ნოემბერი 2026', en: 'November 2026', ru: 'Ноябрь 2026' }, year: 2026, month: 10, daysCount: 30, startDay: 6 },
  { id: '2026-12', label: { ka: 'დეკემბერი 2026', en: 'December 2026', ru: 'Декабрь 2026' }, year: 2026, month: 11, daysCount: 31, startDay: 1 },
  { id: '2027-01', label: { ka: 'იანვარი 2027', en: 'January 2027', ru: 'Январь 2027' }, year: 2027, month: 0, daysCount: 31, startDay: 4 },
  { id: '2027-02', label: { ka: 'თებერვალი 2027', en: 'February 2027', ru: 'February 2027' }, year: 2027, month: 1, daysCount: 28, startDay: 0 },
  { id: '2027-03', label: { ka: 'მარტი 2027', en: 'March 2027', ru: 'Март 2027' }, year: 2027, month: 2, daysCount: 31, startDay: 0 },
  { id: '2027-04', label: { ka: 'აპრილი 2027', en: 'April 2027', ru: 'Апрель 2027' }, year: 2027, month: 3, daysCount: 30, startDay: 3 },
  { id: '2027-05', label: { ka: 'მაისი 2027', en: 'May 2027', ru: 'Май 2027' }, year: 2027, month: 4, daysCount: 31, startDay: 5 },
  { id: '2027-06', label: { ka: 'ივნისი 2027', en: 'June 2027', ru: 'Июнь 2027' }, year: 2027, month: 5, daysCount: 30, startDay: 1 },
  { id: '2027-07', label: { ka: 'ივლისი 2027', en: 'July 2027', ru: 'Июль 2027' }, year: 2027, month: 6, daysCount: 31, startDay: 3 }
]

export default function PlanCalendar() {
  const { lang } = useLanguage()
  const [activeMonthId, setActiveMonthId] = useState('2026-08')
  const [selectedGroup, setSelectedGroup] = useState('baby_bronze')
  const [selectedDateKey, setSelectedDateKey] = useState('2026-08-25')

  const activeMonth = monthsData.find(m => m.id === activeMonthId) || monthsData[0]
  const weekHeaders = lang === 'ka' ? ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვ'] : lang === 'ru' ? ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'] : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

  // Build grid days array
  const cells = []
  for (let i = 0; i < activeMonth.startDay; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= activeMonth.daysCount; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`
    const fullDateKey = `${activeMonth.id}-${dayStr}`
    const holiday = HOLIDAYS_MAP[fullDateKey]
    const tournament = TOURNAMENTS_MAP[fullDateKey]
    cells.push({ day, fullDateKey, holiday, tournament })
  }

  // Active selected day info
  const selectedTask = getDailyLessonTask(selectedDateKey, selectedGroup, lang)
  const selectedPhase = getMacroCyclePhase(selectedDateKey)
  const activeGroupObj = GROUPS_INFO.find(g => g.id === selectedGroup) || GROUPS_INFO[0]

  return (
    <div className="plan-calendar">
      <div className="plan-calendar__head">
        <div>
          <h3 className="plan-calendar__title">
            🗓️ {lang === 'ka' ? 'ინტერაქტიული საგანმანათლებლო კალენდარი (2026-2027)' : lang === 'ru' ? 'Интерактивный учебный календарь (2026-2027)' : 'Interactive Educational Calendar (2026-2027)'}
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#b0ab9f', fontSize: '0.88rem' }}>
            {lang === 'ka' ? 'აირჩიეთ ჯგუფი და დააჭირეთ ნებისმიერ თარიღს 15 ივლისამდე დღიური ალგორითმისა და დავალების სანახავად.' : 'Select a group and click any date up to July 15 to inspect the daily lesson task and goal.'}
          </p>
        </div>
      </div>

      {/* Group Selector Bar */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-gold, #d4a64a)' }}>
          👥 {lang === 'ka' ? 'ჯგუფის არჩევა:' : lang === 'ru' ? 'Выбор группы:' : 'Select Group:'}
        </span>
        {GROUPS_INFO.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            style={{
              background: selectedGroup === g.id ? g.color : 'rgba(255,255,255,0.04)',
              color: selectedGroup === g.id ? '#000' : '#d8d3c5',
              border: `1px solid ${selectedGroup === g.id ? g.color : 'rgba(255,255,255,0.1)'}`,
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {g[lang] || g.ka}
          </button>
        ))}
      </div>

      {/* Month Selector Bar */}
      <div className="month-selector-bar">
        {monthsData.map((m) => (
          <button
            key={m.id}
            className={`month-btn ${activeMonthId === m.id ? 'active' : ''}`}
            onClick={() => {
              setActiveMonthId(m.id)
              setSelectedDateKey(`${m.id}-01`)
            }}
          >
            {m.label[lang] || m.label.ka}
          </button>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="cal-grid">
        {weekHeaders.map((wh, idx) => (
          <div key={idx} className="cal-day-header">{wh}</div>
        ))}

        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="cal-cell empty"></div>
          }

          const { day, fullDateKey, holiday, tournament } = cell
          const isSelected = selectedDateKey === fullDateKey
          const isHoliday = !!holiday
          const isTournament = !!tournament
          const isOutRange = fullDateKey < '2026-08-25' || fullDateKey > '2027-07-15'

          let cellClass = 'cal-cell'
          if (isSelected) cellClass += ' is-selected'
          if (isHoliday) cellClass += ' is-holiday'
          if (isTournament) cellClass += ' is-tournament'
          if (isOutRange) cellClass += ' is-outrange'

          return (
            <div
              key={idx}
              className={cellClass}
              onClick={() => setSelectedDateKey(fullDateKey)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="cal-cell-num">{day}</span>
                {isHoliday && <span style={{ fontSize: '0.7rem' }}>🔒</span>}
                {isTournament && <span style={{ fontSize: '0.7rem' }}>🏆</span>}
              </div>

              {holiday && (
                <span className="cal-cell-badge badge-holiday">
                  {holiday[lang] || holiday.ka}
                </span>
              )}
              {tournament && (
                <span className="cal-cell-badge badge-tournament">
                  {tournament[lang] || tournament.ka}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend" style={{ marginTop: '1.25rem' }}>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--color-gold, #d4a64a)' }}></div>
          <span>{lang === 'ka' ? '🏆 ტურნირები & პიკური დღეები' : '🏆 Tournaments & Peak Days'}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f44336' }}></div>
          <span>{lang === 'ka' ? '🔒 არდადეგები & ჩაკეტილი უქმეები' : '🔒 Holidays & Locked Off Days'}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#4caf50' }}></div>
          <span>{lang === 'ka' ? '✨ აქტიური სასწავლო დღე' : '✨ Active Training Day'}</span>
        </div>
      </div>

      {/* Day Inspector Card (Detailed Daily Lesson Plan & Target Goals) */}
      {selectedDateKey && (
        <div className="day-inspector-card" style={{
          marginTop: '1.75rem',
          background: 'linear-gradient(135deg, rgba(20,20,24,0.95), rgba(30,28,22,0.95))',
          border: '1.5px solid var(--color-gold, #d4a64a)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gold, #d4a64a)', fontWeight: 'bold' }}>
                📅 {selectedDateKey} • {activeGroupObj[lang] || activeGroupObj.ka}
              </span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: '#ffffff' }}>
                {selectedTask.isLocked 
                  ? selectedTask.title 
                  : selectedTask.isOffDay 
                  ? selectedTask.title 
                  : selectedTask.danceName}
              </h4>
            </div>
            {selectedPhase && !selectedTask.isLocked && (
              <span style={{ background: 'rgba(212,166,74,0.15)', color: '#f0c878', border: '1px solid #d4a64a', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {selectedPhase.nameKa}
              </span>
            )}
          </div>

          {/* Locked / Holiday Case */}
          {selectedTask.isLocked && (
            <div style={{ background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', padding: '14px', borderRadius: '12px', color: '#ff8a80' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                {selectedTask.title}
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem', color: '#ffd180' }}>
                {selectedTask.desc}
              </p>
            </div>
          )}

          {/* Non-Training Day Case */}
          {selectedTask.isOffDay && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '12px', color: '#b0ab9f' }}>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem', color: '#e0d8c3' }}>
                {selectedTask.title}
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.88rem' }}>
                {selectedTask.desc}
              </p>
            </div>
          )}

          {/* Active Training Day Case */}
          {!selectedTask.isLocked && !selectedTask.isOffDay && (
            <div>
              <div style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '12px', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#a8a39a', fontWeight: 'bold' }}>
                  🎯 {lang === 'ka' ? 'დღევანდელი WDSF სამიზნე ფიგურები:' : 'Target WDSF Figures:'}
                </p>
                <p style={{ margin: 0, color: '#f0c878', fontWeight: '600', fontSize: '0.95rem' }}>
                  {selectedTask.targetFigures}
                </p>
              </div>

              {/* Minute Breakdown */}
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#a8a39a', fontWeight: 'bold' }}>
                ⏱️ {lang === 'ka' ? 'გაკვეთილის წუთობრივი ალგორითმი:' : 'Lesson Minute Breakdown:'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                {selectedTask.breakdown.map((b, idx) => (
                  <div key={idx} style={{ background: 'rgba(212,166,74,0.08)', border: '1px solid rgba(212,166,74,0.2)', padding: '10px 12px', borderRadius: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--color-gold, #d4a64a)', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px' }}>
                      {b.time}
                    </span>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#ffffff', fontWeight: '500' }}>
                      {b.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Daily Goal towards July 15 */}
              <div style={{ background: 'linear-gradient(90deg, rgba(212,166,74,0.2), rgba(212,166,74,0.05))', borderLeft: '4px solid var(--color-gold, #d4a64a)', padding: '10px 14px', borderRadius: '0 10px 10px 0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#d4a64a', textTransform: 'uppercase' }}>
                  🚩 {lang === 'ka' ? 'დღის მიზანი 15 ივლისის პიკური ფორმისთვის:' : 'Daily Goal for July 15 Peak Form:'}
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#ffffff', fontWeight: '600' }}>
                  {selectedTask.dailyGoal}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
