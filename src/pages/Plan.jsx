import React from 'react'
import { useLanguage } from '../context/LanguageContext'
import SyllabusExplorer from '../components/SyllabusExplorer'
import PlanCalendar from '../components/PlanCalendar'
import './InnerPage.css'

export default function Plan() {
  const { lang } = useLanguage()

  const titles = {
    ka: { eyebrow: 'საგანმანათლებლო გეგმა', title: '11-თვიანი სასწავლო გეგმა &', italic: 'WDSF სილაბუსი', lead: 'გაეცანით 2026-2027 წლის სრულ საგანმანათლებლო ალგორითმს, ტურნირების კალენდარს, არდადეგებსა და ჯგუფების მიხედვით WDSF-ის ოფიციალურ ფიგურებს.' },
    en: { eyebrow: 'Educational Plan', title: '11-Month Curriculum &', italic: 'WDSF Syllabus', lead: 'Explore the complete 2026-2027 educational algorithm, tournament calendar, holiday schedule, and official WDSF figures per group.' },
    ru: { eyebrow: 'Учебный План', title: '11-месячная программа &', italic: 'Силлабус WDSF', lead: 'Ознакомьтесь с полным учебным алгоритмом на 2026-2027 гг., турнирным календарем, праздничными днями и официальными фигурами WDSF по группам.' }
  }

  const tObj = titles[lang] || titles.ka

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{tObj.eyebrow}</span>
          <h1 className="display page-hero__title">
            {tObj.title} <br />
            <span className="display-italic">{tObj.italic}</span>
          </h1>
          <p className="page-hero__lead">
            {tObj.lead}
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
