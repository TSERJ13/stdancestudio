import { siteContent } from '../data/content'
import { Link } from 'react-router-dom'
import './InnerPage.css'

export default function Programs() {
  const { programs } = siteContent

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">მიმართულებები</span>
          <h1 className="display page-hero__title">
            ცეკვის ოთხი <br />
            <span className="display-italic">სამყარო</span>
          </h1>
          <p className="page-hero__lead">
            თითოეული მიმართულება — ცალკე სამყაროა საკუთარი ხასიათით,
            მუსიკით, რიტმითა და ემოციით. შეარჩიე ის, რომელიც შენთვის ჟღერს.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {programs.map((p, i) => (
            <article key={p.id} className={`prog-detail ${i % 2 === 0 ? '' : 'prog-detail--alt'}`}>
              <div className="prog-detail__num display">{p.number}</div>
              <div className="prog-detail__content">
                <div className="prog-detail__head">
                  <h2 className="display">{p.title}</h2>
                  <span className="prog-detail__latin">{p.latin}</span>
                </div>
                <p>{p.description}</p>
                <div className="prog-detail__meta">
                  <div>
                    <span className="meta-label">ასაკი</span>
                    <strong>{p.ages}</strong>
                  </div>
                  <div>
                    <span className="meta-label">სიხშირე</span>
                    <strong>2–3×/კვირაში</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}

          <div className="programs-cta">
            <h3 className="display">არ იცი რომელი აირჩიო?</h3>
            <p>დაგეხმარებით — ერთი საცდელი გაკვეთილი და ყველაფერი გასაგები გახდება.</p>
            <Link to="/contact" className="btn btn-primary">საცდელი გაკვეთილი</Link>
          </div>
        </div>
      </section>
    </>
  )
}
