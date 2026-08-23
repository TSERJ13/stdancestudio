import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './PlanCalendar.css'

const monthsData = [
  { id: '2026-08', label: { ka: 'აგვისტო 2026', en: 'August 2026', ru: 'Август 2026' }, year: 2026, month: 7, daysCount: 31, startDay: 5 }, // Aug 1 2026 is Sat (day 5)
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

// Highlights for 2026-2027
const specialEvents = {
  '2026-08-25': { ka: '🚀 სეზონის სტარტი', en: '🚀 Season Opening', ru: '🚀 Старт сезона', type: 'tournament' },
  '2026-11-15': { ka: '🏆 ქუთაისი & თბილისი', en: '🏆 Kutaisi & Tbilisi', ru: '🏆 Кутаиси и Тбилиси', type: 'tournament' },
  '2026-12-20': { ka: '🏆 წლის დასკვნითი', en: '🏆 Year End Cup', ru: '🏆 Финал года', type: 'tournament' },
  '2026-12-28': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Vacation', ru: '🎄 Зимние каникулы', type: 'holiday' },
  '2026-12-29': { ka: '🎄 არდადეგები', en: '🎄 Vacation', ru: '🎄 Каникулы', type: 'holiday' },
  '2026-12-30': { ka: '🎄 არდადეგები', en: '🎄 Vacation', ru: '🎄 Каникулы', type: 'holiday' },
  '2026-12-31': { ka: '🎄 ახალი წელი', en: '🎄 New Year', ru: '🎄 Новый год', type: 'holiday' },
  '2027-01-01': { ka: '🎄 ახალი წელი', en: '🎄 New Year', ru: '🎄 Новый год', type: 'holiday' },
  '2027-01-07': { ka: '🎄 შობა', en: '🎄 Christmas', ru: '🎄 Рождество', type: 'holiday' },
  '2027-01-10': { ka: '🎄 არდადეგები', en: '🎄 Vacation', ru: '🎄 Каникулы', type: 'holiday' },
  '2027-01-11': { ka: '✨ სწავლის განახლება', en: '✨ Classes Resume', ru: '✨ Уроки возобновляются', type: 'tournament' },
  '2027-01-24': { ka: '🎓 მასტერკლასები', en: '🎓 Masterclasses', ru: '🎓 Мастер-классы', type: 'tournament' },
  '2027-02-14': { ka: '🏆 აჭარის ჩემპიონატი', en: '🏆 Adjara Championship', ru: '🏆 Чемпионат Аджарии', type: 'tournament' },
  '2027-03-03': { ka: '🇬🇪 დედის დღე', en: '🇬🇪 Mother\'s Day', ru: '🇬🇪 День матери', type: 'holiday' },
  '2027-03-08': { ka: '🇬🇪 ქალთა დღე', en: '🇬🇪 Women\'s Day', ru: '🇬🇪 Женский день', type: 'holiday' },
  '2027-03-21': { ka: '🏆 გაზაფხულის ტურნირი', en: '🏆 Spring Cup', ru: '🏆 Весенний турнир', type: 'tournament' },
  '2027-04-09': { ka: '🇬🇪 9 აპრილი', en: '🇬🇪 April 9', ru: '🇬🇪 9 Апреля', type: 'holiday' },
  '2027-04-25': { ka: '🏆 გასვლითი ტურნირი', en: '🏆 Away Cup', ru: '🏆 Выездной турнир', type: 'tournament' },
  '2027-05-09': { ka: '🇬🇪 9 მაისი', en: '🇬🇪 May 9', ru: '🇬🇪 9 Мая', type: 'holiday' },
  '2027-05-12': { ka: '🇬🇪 12 მაისი', en: '🇬🇪 May 12', ru: '🇬🇪 12 Мая', type: 'holiday' },
  '2027-05-23': { ka: '🏆 კავკასიის თასი', en: '🏆 Caucasus Cup', ru: '🏆 Кубок Кавказа', type: 'tournament' },
  '2027-05-26': { ka: '🇬🇪 დამოუკიდებლობის დღე', en: '🇬🇪 Independence Day', ru: '🇬🇪 День Независимости', type: 'holiday' },
  '2027-07-18': { ka: '🏆 Batumi Open', en: '🏆 Batumi Open', ru: '🏆 Batumi Open', type: 'tournament' }
}

export default function PlanCalendar() {
  const { lang } = useLanguage()
  const [activeMonthId, setActiveMonthId] = useState('2026-08')

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
    cells.push({ day, fullDateKey, evt: specialEvents[fullDateKey] })
  }

  return (
    <div className="plan-calendar">
      <div className="plan-calendar__head">
        <h3 className="plan-calendar__title">
          🗓️ {activeMonth.label[lang] || activeMonth.label.ka}
        </h3>
      </div>

      {/* Month Selector */}
      <div className="month-selector-bar">
        {monthsData.map((m) => (
          <button
            key={m.id}
            className={`month-btn ${activeMonthId === m.id ? 'active' : ''}`}
            onClick={() => setActiveMonthId(m.id)}
          >
            {m.label[lang] || m.label.ka}
          </button>
        ))}
      </div>

      {/* Grid Header */}
      <div className="cal-grid">
        {weekHeaders.map((wh, idx) => (
          <div key={idx} className="cal-day-header">{wh}</div>
        ))}

        {/* Grid Cells */}
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="cal-cell empty"></div>
          }

          const { day, evt } = cell
          const isTournament = evt?.type === 'tournament'
          const isHoliday = evt?.type === 'holiday'

          let cellClass = 'cal-cell'
          if (isTournament) cellClass += ' is-tournament'
          if (isHoliday) cellClass += ' is-holiday'

          return (
            <div key={idx} className={cellClass}>
              <span className="cal-cell-num">{day}</span>
              {evt && (
                <span className={`cal-cell-badge ${isTournament ? 'badge-tournament' : isHoliday ? 'badge-holiday' : 'badge-regular'}`}>
                  {evt[lang] || evt.ka}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--color-gold, #d4a64a)' }}></div>
          <span>{lang === 'ka' ? 'ტურნირები & პიკური დღეები' : lang === 'ru' ? 'Турниры и пиковые дни' : 'Tournaments & Peak Days'}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f44336' }}></div>
          <span>{lang === 'ka' ? 'არდადეგები & ოფიციალური უქმეები' : lang === 'ru' ? 'Каникулы и выходные' : 'Holidays & Off Days'}</span>
        </div>
      </div>
    </div>
  )
}
