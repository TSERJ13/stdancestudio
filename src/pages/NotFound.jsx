import { Link } from 'react-router-dom'
import './InnerPage.css'

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <div className="not-found__num display">404</div>
        <h1 className="display not-found__title">
          ეს გვერდი <span className="display-italic">არ ცეკვავს</span>
        </h1>
        <p>თქვენ მიერ მოთხოვნილი გვერდი ვერ მოიძებნა.</p>
        <Link to="/" className="btn btn-primary">მთავარ გვერდზე</Link>
      </div>
    </section>
  )
}
