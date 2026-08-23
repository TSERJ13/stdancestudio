import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { syllabusData } from '../data/syllabusData'
import './SyllabusExplorer.css'

export default function SyllabusExplorer() {
  const { lang } = useLanguage()
  const data = syllabusData[lang] || syllabusData.ka

  const [activeGroupId, setActiveGroupId] = useState(data.groups[0]?.id || 'baby_bronze')

  const activeGroup = data.groups.find(g => g.id === activeGroupId) || data.groups[0]

  return (
    <section className="syllabus-explorer section" id="syllabus">
      <div className="container">
        
        {/* Section Header */}
        <div className="syllabus-head">
          <span className="eyebrow">WDSF SYLLABUS & SCHEDULE ALGORITHM</span>
          <h2 className="display syllabus-title">{data.title}</h2>
          <p className="syllabus-subtitle">{data.subtitle}</p>
        </div>

        {/* Season Parameters & Holidays Banner */}
        <div className="syllabus-banner">
          <span className="banner-start-badge">🗓️ {data.seasonStart}</span>

          <div className="banner-info-grid">
            <div className="banner-info-item">
              <h5>🎄 {data.holidaysTitle}</h5>
              <p>{data.winterHolidays}</p>
            </div>
            <div className="banner-info-item">
              <h5>🇬🇪 {data.officialHolidays.split(':')[0]}</h5>
              <p>{data.officialHolidays.split(':')[1]}</p>
            </div>
            <div className="banner-info-item">
              <h5>🏆 {data.tournamentPeaks.split(':')[0]}</h5>
              <p>{data.tournamentPeaks.split(':')[1]}</p>
            </div>
          </div>
        </div>

        {/* 11-Month Macro Cycle Goals */}
        <div className="macro-cycles-block">
          <h3 className="display section-sub-title">{data.macroCyclesTitle}</h3>
          <div className="macro-grid">
            {data.macroCycles.map((mc, idx) => (
              <div key={idx} className="macro-card">
                <span className="macro-badge">{mc.badge}</span>
                <div className="macro-period">{mc.period}</div>
                <h4 className="macro-name">{mc.name}</h4>
                <p className="macro-desc">{mc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Lesson Structure Algorithm */}
        <div className="algorithm-block">
          <h3 className="display section-sub-title">{data.algorithmTitle}</h3>
          <div className="algorithm-grid">
            {data.algorithm.map((algo, idx) => (
              <div key={idx} className="algo-card">
                <div className="algo-head">
                  <span className="algo-type">{algo.dayType}</span>
                  <span className="algo-duration">{algo.duration}</span>
                </div>
                <div className="algo-list">
                  {algo.breakdown.map((b, bIdx) => (
                    <div key={bIdx} className="algo-row">
                      <span className="algo-time">{b.time}</span>
                      <span className="algo-text">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Group Syllabus & Figure Explorer */}
        <div className="group-explorer-block">
          <h3 className="display section-sub-title" style={{ marginBottom: '1.25rem' }}>{data.groupsTitle}</h3>

          {/* Group Selector Tabs */}
          <div className="group-tabs">
            {data.groups.map((group) => (
              <button
                key={group.id}
                className={`group-tab-btn ${activeGroupId === group.id ? 'active' : ''}`}
                onClick={() => setActiveGroupId(group.id)}
              >
                {group.name}
              </button>
            ))}
          </div>

          {/* Active Group Details */}
          {activeGroup && (
            <div className="group-detail-card">
              <div className="group-detail-head">
                <h4 className="group-detail-title">{activeGroup.name}</h4>
                <span className="group-detail-level">{activeGroup.level}</span>
              </div>

              <div className="group-info-row">
                <strong>💃 {lang === 'ka' ? 'ცეკვები' : lang === 'ru' ? 'Танцы' : 'Dances'}:</strong> {activeGroup.dances}
              </div>
              <div className="group-info-row">
                <strong>🔄 {lang === 'ka' ? 'კვირის როტაცია' : lang === 'ru' ? 'Недельная ротация' : 'Weekly Rotation'}:</strong> {activeGroup.rotation}
              </div>

              {/* WDSF Figures Grid (Aug-Jan vs. Feb-Jul) */}
              <div className="wdsf-figures-grid">
                
                {/* Aug - Jan Figures */}
                <div className="figures-box">
                  <h5 className="figures-box-title">
                    📅 {lang === 'ka' ? 'WDSF ფიგურები (აგვისტო - იანვარი)' : lang === 'ru' ? 'Фигуры WDSF (Август - Январь)' : 'WDSF Figures (Aug - Jan)'}
                  </h5>

                  {Object.entries(activeGroup.figuresAugJan).map(([danceKey, figList], fIdx) => (
                    <div key={fIdx} className="figures-dance-item">
                      <div className="figures-dance-name">{danceKey.toUpperCase()}</div>
                      <div className="figures-tags">
                        {figList.map((fig, tagIdx) => (
                          <span key={tagIdx} className="figure-tag">{fig}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feb - Jul Figures */}
                <div className="figures-box">
                  <h5 className="figures-box-title" style={{ color: '#00e676' }}>
                    📅 {lang === 'ka' ? 'WDSF ფიგურები (თებერვალი - ივლისი)' : lang === 'ru' ? 'Фигуры WDSF (Февраль - Июль)' : 'WDSF Figures (Feb - Jul)'}
                  </h5>

                  {Object.entries(activeGroup.figuresFebJul).map(([danceKey, figList], fIdx) => (
                    <div key={fIdx} className="figures-dance-item">
                      <div className="figures-dance-name">{danceKey.toUpperCase()}</div>
                      <div className="figures-tags">
                        {figList.map((fig, tagIdx) => (
                          <span key={tagIdx} className="figure-tag" style={{ background: 'rgba(0, 230, 118, 0.1)', color: '#a7ffeb' }}>{fig}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  )
}
