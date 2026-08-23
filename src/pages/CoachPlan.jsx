import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import SyllabusExplorer from '../components/SyllabusExplorer'
import PlanCalendar from '../components/PlanCalendar'
import './InnerPage.css'

export default function CoachPlan() {
  const { lang } = useLanguage()

  return (
    <>
      <section className="page-hero" style={{ background: 'linear-gradient(180deg, #141210 0%, #0a0908 100%)' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: '#d4a64a' }}>👨‍🏫 მწვრთნელების & პედაგოგების ოფიციალური პორტალი</span>
          <h1 className="display page-hero__title">
            WDSF მასწავლებლის სილაბუსი & <br />
            <span className="display-italic" style={{ color: '#d4af37' }}>11-თვიანი საგანმანათლებლო ალგორითმი</span>
          </h1>
          <p className="page-hero__lead">
            სერგი წივწივაძისა და ST Dance Studio-ს სამწვრთნელო შემადგენლობის ოფიციალური სახელმძღვანელო: 60-წუთიანი გაკვეთილის სტრუქტურა, WDSF ფიგურები, ტექნიკური შემოწმების ჩექ-ლისტი და 10 ოფიციალური ტურნირის კალენდარი.
          </p>
        </div>
      </section>

      {/* 2026-2027 Interactive Calendar */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <PlanCalendar />
        </div>
      </section>

      {/* Syllabus & Group Figures Explorer */}
      <SyllabusExplorer />
    </>
  )
}
