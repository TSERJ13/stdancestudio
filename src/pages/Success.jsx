import { Link } from 'react-router-dom'
import './InnerPage.css'

export default function Success() {
  return (
    <section className="page-hero" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div className="container">
        <div className="success-icon" style={{ 
          fontSize: '5rem', 
          color: 'var(--color-gold)', 
          marginBottom: '2rem',
          animation: 'fadeUp 0.8s var(--ease) forwards'
        }}>
          ✓
        </div>
        <h1 className="display page-hero__title" style={{ animationDelay: '0.2s' }}>
          გადახდა <br />
          <span className="display-italic">წარმატებით დასრულდა</span>
        </h1>
        <p style={{ 
          maxWidth: '500px', 
          margin: '2rem auto', 
          color: 'var(--color-text-muted)',
          animation: 'fadeUp 1s var(--ease) backwards',
          animationDelay: '0.4s'
        }}>
          გმადლობთ ნდობისთვის. თქვენი ტრანზაქცია წარმატებით დამუშავდა. 
          დამატებითი კითხვების შემთხვევაში, გთხოვთ დაგვიკავშირდეთ.
        </p>
        <div style={{ animation: 'fadeUp 1.2s var(--ease) backwards', animationDelay: '0.6s' }}>
          <Link to="/" className="btn btn-primary">
            მთავარ გვერდზე დაბრუნება
          </Link>
        </div>
      </div>
    </section>
  )
}
