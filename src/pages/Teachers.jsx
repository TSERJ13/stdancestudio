import { siteContent } from '../data/content'
import './InnerPage.css'

export default function Teachers() {
  const { teachers } = siteContent

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">მასწავლებლები</span>
          <h1 className="display page-hero__title">
            ხალხი, რომლისგანაც <br />
            <span className="display-italic">ბევრს ისწავლი</span>
          </h1>
          <p className="page-hero__lead">
            ჩვენი მასწავლებლები არიან არა მხოლოდ პროფესიონალი მოცეკვავეები,
            არამედ პედაგოგებიც. ისინი გრძნობენ ბავშვს და იციან, როგორ
            გადასცენ მას ცეკვის სიყვარული.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="teachers-detail">
            {teachers.map((t, i) => (
              <article key={i} className="teacher-detail">
                <div className="teacher-detail__photo">
                  <img src={t.photo} alt={t.name} />
                </div>
                <div className="teacher-detail__body">
                  <div className="teacher-detail__role">{t.role}</div>
                  <h2 className="display">{t.name}</h2>
                  <p>{t.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
