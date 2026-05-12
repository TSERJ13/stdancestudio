import { siteContent } from '../data/content'
import './InnerPage.css'

export default function Competitions() {
  const { competitions } = siteContent

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">კონკურსები</span>
          <h1 className="display page-hero__title">
            სცენაზე — <br />
            <span className="display-italic">სადაც იწერება ისტორია</span>
          </h1>
          <p className="page-hero__lead">
            ყოველი კონკურსი — ახალი ეტაპია მოცეკვავის გზაზე. ვამზადებთ
            ჩვენს მოცეკვავეებს როგორც ეროვნული, ისე საერთაშორისო
            შეჯიბრებებისთვის.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="comp-list">
            {competitions.map((c, i) => (
              <article key={i} className="comp-card">
                <div className="comp-card__media">
                  <img src={c.image} alt={c.title} />
                  <span className="comp-card__status">{c.status}</span>
                </div>
                <div className="comp-card__body">
                  <span className="comp-card__date">{c.date}</span>
                  <h2 className="display">{c.title}</h2>
                  <p>{c.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
