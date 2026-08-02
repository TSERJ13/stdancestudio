import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function NotFound() {
  const { lang, t } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const translations = {
    ka: {
      title1: 'ეს გვერდი',
      titleItalic: 'არ ცეკვავს',
      desc: 'თქვენ მიერ მოთხოვნილი გვერდი ვერ მოიძებნა.',
      btn: 'მთავარ გვერდზე'
    },
    en: {
      title1: 'This page',
      titleItalic: "doesn't dance",
      desc: 'The requested page could not be found.',
      btn: 'Back to Home'
    },
    ru: {
      title1: 'Эта страница',
      titleItalic: 'не танцует',
      desc: 'Запрашиваемая страница не найдена.',
      btn: 'На главную'
    }
  }

  const activeTrans = translations[lang] || translations.ka

  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <div className="not-found__num display">404</div>
        <h1 className="display not-found__title">
          {activeTrans.title1} <span className="display-italic">{activeTrans.titleItalic}</span>
        </h1>
        <p>{activeTrans.desc}</p>
        <Link to={`${basePath}/`} className="btn btn-primary">{activeTrans.btn}</Link>
      </div>
    </section>
  )
}
