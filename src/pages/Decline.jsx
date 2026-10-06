import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Decline() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  return (
    <section className="page-hero" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container">
        <div className="success-icon" style={{ 
          fontSize: '5rem', 
          color: '#d96b5c', 
          marginBottom: '2rem',
          animation: 'fadeUp 0.8s var(--ease) forwards'
        }}>
          ✕
        </div>

        <h1 className="display page-hero__title" style={{ animationDelay: '0.2s' }}>
          {lang === 'ka' ? (
            <>
              გადახდა <br />
              <span className="display-italic" style={{ color: '#d96b5c' }}>ვერ შესრულდა</span>
            </>
          ) : lang === 'ru' ? (
            <>
              Оплата <br />
              <span className="display-italic" style={{ color: '#d96b5c' }}>не прошла</span>
            </>
          ) : (
            <>
              Payment <br />
              <span className="display-italic" style={{ color: '#d96b5c' }}>was unsuccessful</span>
            </>
          )}
        </h1>

        <p style={{ 
          maxWidth: '500px', 
          margin: '2rem auto', 
          color: 'var(--color-text-muted)',
          animation: 'fadeUp 1s var(--ease) backwards',
          animationDelay: '0.4s'
        }}>
          {lang === 'ka' ? (
            'ოპერაცია შეჩერდა ან ბანკის მიერ უარყოფილია. გთხოვთ გადაამოწმოთ ბარათის ბალანსი ან სცადოთ ხელახლა. დამატებითი კითხვების შემთხვევაში, გთხოვთ დაგვიკავშირდეთ.'
          ) : lang === 'ru' ? (
            'Транзакция была отменена или отклонена банком. Пожалуйста, проверьте баланс карты или повторите попытку. При возникновении вопросов свяжитесь с нами.'
          ) : (
            'The transaction was cancelled or declined by your bank. Please check your card balance or try again. If you have questions, please contact us.'
          )}
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 1.2s var(--ease) backwards', animationDelay: '0.6s' }}>
          <Link to={`${basePath}/payment`} className="btn btn-primary">
            {lang === 'ka' ? 'ხელახლა ცდა' : lang === 'ru' ? 'Попробовать снова' : 'Try Again'}
          </Link>
          <Link to={`${basePath}/`} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>
            {lang === 'ka' ? 'მთავარ გვერდზე დაბრუნება' : lang === 'ru' ? 'На главную' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </section>
  )
}
