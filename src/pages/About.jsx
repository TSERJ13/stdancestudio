import { siteContent } from '../data/content'
import './InnerPage.css'

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">ჩვენ შესახებ</span>
          <h1 className="display page-hero__title">
            ჩვენი ისტორია, <br />
            <span className="display-italic">ჩვენი მისია</span>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="split__media">
            <img src="/images/dancer-2.png" alt="Dancer" />
          </div>
          <div className="split__copy">
            <h2 className="display">ცეკვა, რომელიც აყალიბებს ხასიათს</h2>
            <p>
              S_T Dance Studio დაარსდა {siteContent.brand.director}-ის
              ინიციატივით — სტუდია, სადაც სამეჯლისო ცეკვა არ არის უბრალოდ
              ჰობი, არამედ ცხოვრების სტილი, ფილოსოფია და ხელოვნება.
            </p>
            <p>
              ჩვენ გვჯერა, რომ ცეკვა ბავშვს აძლევს ბევრად მეტს, ვიდრე
              ფიზიკურ მომზადებას. იგი აყალიბებს დისციპლინას,
              თავდაჯერებულობას, მუსიკალურობასა და ემოციური ინტელექტის
              უნარს — ისეთ თვისებებს, რომლებიც სიცოცხლის ბოლომდე ეხმარება
              ადამიანს.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split split--reverse">
          <div className="split__media">
            <img src="/images/studio.jpg" alt="Studio" />
          </div>
          <div className="split__copy">
            <h2 className="display">ჩვენი სივრცე</h2>
            <p>
              ბათუმის გულში მდებარე სტუდია არის ადგილი, სადაც ბავშვები თავს
              გრძნობენ კომფორტულად. პროფესიონალური საცეკვაო იატაკი,
              სარკეები, კარგი ვენტილაცია და თბილი ატმოსფერო — ყველაფერი
              იმისთვის, რომ გაკვეთილი იყოს მაქსიმალურად ეფექტური და
              სასიამოვნო.
            </p>
            <p>
              გვაქვს ასევე ცალკე სივრცე მშობლებისთვის — საიდანაც შეგიძლიათ
              დააკვირდეთ შვილის გაკვეთილს ისე, რომ ხელი არ შეუშალოთ
              პროცესს.
            </p>
          </div>
        </div>
      </section>

      <section className="section values">
        <div className="container">
          <div className="section-head section-head--center">
            <span className="eyebrow">ღირებულებები</span>
            <h2 className="display section-head__title">
              რას ვაფასებთ <span className="display-italic">ყველაზე მეტად</span>
            </h2>
          </div>
          <div className="values__grid">
            {[
              { num: '01', title: 'ხელოვნება', text: 'არ ვასწავლით უბრალოდ ნაბიჯებს — ვასწავლით სცენაზე იყოს ცოცხალი.' },
              { num: '02', title: 'ინდივიდუალობა', text: 'ყველა მოცეკვავე უნიკალურია. ვპოულობთ თითოეულის ძლიერ მხარეებს.' },
              { num: '03', title: 'დისციპლინა', text: 'წარმატება ხელოვნებაში მუშაობით მოდის. ვუნერგავთ მოცეკვავეებს მუშაობის კულტურას.' },
              { num: '04', title: 'სიყვარული', text: 'სტუდიაში ბავშვები გრძნობენ, რომ მათ აქ ელოდებიან და უყვარდებათ.' },
            ].map((v) => (
              <div key={v.num} className="value">
                <div className="value__num">{v.num}</div>
                <h3 className="display">{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
