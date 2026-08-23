import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Terms() {
  const { lang } = useLanguage()

  const content = {
    ka: {
      title: 'მომსახურების პირობები',
      subtitle: 'ST Dance Studio-ს სარგებლობის წესები და პირობები',
      lastUpdated: 'ბოლო განახლება: 2026 წლის 1 აგვისტო',
      intro: 'კეთილი იყოს თქვენი მობრძანება ST Dance Studio-ს ოფიციალურ ვებგვერდზე (stdance.ge). წინამდებარე მომსახურების პირობები განსაზღვრავს ჩვენი სტუდიის მომსახურებით, ვებგვერდითა და ონლაინ სერვისებით სარგებლობის წესებს.',
      section1Title: '1. სტუდიის მომსახურება',
      section1Text: 'ST Dance Studio სთავაზობს მომხმარებლებს სპორტული ცეკვების, სამეჯლისო ცეკვებისა და ქორეოგრაფიულ მეცადინეობებს ბათუმში. მეცადინეობების განრიგი და ფასები მოცემულია ვებგვერდზე და ექვემდებარება პერიოდულ განახლებას.',
      section2Title: '2. რეგისტრაცია და წესები',
      section2Text: 'სტუდიაში მოსწავლის მიღებისას:',
      section2List: [
        'ონლაინ რეგისტრაციის ფორმა უნდა შეივსოს არასრულწლოვანი მოსწავლის მშობლის ან კანონიერი წარმომადგენლის მიერ.',
        'მოსწავლეები და მშობლები ვალდებულნი არიან დაიცვან შინაგანაწესი და მწვრთნელების მითითებები მეცადინეობების დროს.'
      ],
      section3Title: '3. გადახდები და გაუქმება',
      section3Text: 'სწავლის საფასურის გადახდა ხორციელდება ყოველთვიურად ან შეთანხმებული პაკეტების მიხედვით. ონლაინ ანგარიშსწორება ხდება უსაფრთხო საბანკო გადახდის სისტემის მეშვეობით.',
      section4Title: '4. ავტომატიზებული სერვისები',
      section4Text: 'ჩვენი Instagram Direct ასისტენტი იყენებს ხელოვნურ ინტელექტს (AI) ზოგად კითხვებზე სწრაფი პასუხის გასაცემად. სპეციფიკურ საკითხებზე სტუდიის ადმინისტრაცია პირადად დაგიკავშირდებათ.',
      section5Title: '5. საკონტაქტო ინფორმაცია',
      section5Text: 'კითხვების შემთხვევაში შეგიძლიათ დაგვიკავშირდეთ: ელ-ფოსტა: stdancegroupdue@gmail.com, მისამართი: ბათუმი, ე. თაყაიშვილის 55, ტელეფონი: +995 514 19 99 66.'
    },
    en: {
      title: 'Terms of Service',
      subtitle: 'ST Dance Studio Terms & Conditions',
      lastUpdated: 'Last Updated: August 1, 2026',
      intro: 'Welcome to the official website of ST Dance Studio (stdance.ge). These Terms of Service govern your use of our dance studio services, website, registration systems, and related online features.',
      section1Title: '1. Studio Services',
      section1Text: 'ST Dance Studio provides sports dance, ballroom dance, and choreography classes in Batumi. Class schedules and pricing are specified on our website and subject to periodic updates.',
      section2Title: '2. Enrollment & Studio Conduct',
      section2Text: 'When registering for classes:',
      section2List: [
        'Online registration forms for minor students must be completed by a parent or legal guardian.',
        'Students and visitors agree to comply with studio rules and instructor guidance during training sessions.'
      ],
      section3Title: '3. Fees & Online Payments',
      section3Text: 'Tuition fees are payable monthly or in accordance with selected training packages. Online payments processed via our website are conducted securely through official payment gateways.',
      section4Title: '4. Automated Communication Services',
      section4Text: 'Our automated Instagram Direct assistant utilizes Artificial Intelligence (AI) to handle general inquiries. For custom requests or official matters, studio administration will follow up directly.',
      section5Title: '5. Contact Information',
      section5Text: 'For inquiries regarding these Terms, please contact us at: Email: stdancegroupdue@gmail.com, Address: E. Takaishvili 55, Batumi, Phone: +995 514 19 99 66.'
    },
    ru: {
      title: 'Условия обслуживания',
      subtitle: 'Правила и условия пользования ST Dance Studio',
      lastUpdated: 'Последнее обновление: 1 августа 2026 г.',
      intro: 'Добро пожаловать на официальный сайт ST Dance Studio (stdance.ge). Настоящие Условия обслуживания регулируют использование наших танцевальных услуг, сайта, систем регистрации и онлайн-сервисов.',
      section1Title: '1. Услуги студии',
      section1Text: 'ST Dance Studio предлагает занятия по спортивным, бальным танцам и хореографии в Батуми. Расписание и стоимость указаны на сайте и могут периодически обновляться.',
      section2Title: '2. Запись и правила поведения',
      section2Text: 'При записи на занятия:',
      section2List: [
        'Форма онлайн-регистрации несовершеннолетнего ученика должна заполняться родителем или законным представителем.',
        'Ученики и посетители обязуются соблюдать внутренний распорядок студии и указания тренеров.'
      ],
      section3Title: '3. Оплата и условия',
      section3Text: 'Оплата обучения производится ежемесячно или согласно выбранным пакетам. Онлайн-платежи на сайте осуществляются через защищенные банковские шлюзы.',
      section4Title: '4. Автоматизированные сервисы',
      section4Text: 'Наш ассистент в Instagram Direct использует ИИ для ответов на общие вопросы. По индивидуальным вопросам с вами свяжется администрация студии.',
      section5Title: '5. Контактная информация',
      section5Text: 'По вопросам Условий обращайтесь к нам: Эл. почта: stdancestudio13@gmail.com, Адрес: Батуми, ул. Е. Такаишвили 55, Телефон: +995 514 19 99 66.'
    }
  }

  const t = content[lang] || content.ka

  return (
    <div className="inner-page container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="inner-page__header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t.title}</h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem' }}>{t.subtitle}</p>
        <span style={{ color: '#777', fontSize: '0.9rem', display: 'block', marginTop: '0.5rem' }}>{t.lastUpdated}</span>
      </div>

      <div className="inner-page__content" style={{ color: '#e0e0e0', lineHeight: '1.8', fontSize: '1rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>{t.intro}</p>

        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>{t.section1Title}</h3>
        <p style={{ marginBottom: '1.5rem' }}>{t.section1Text}</p>

        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>{t.section2Title}</h3>
        <p style={{ marginBottom: '0.5rem' }}>{t.section2Text}</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          {t.section2List.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
          ))}
        </ul>

        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>{t.section3Title}</h3>
        <p style={{ marginBottom: '1.5rem' }}>{t.section3Text}</p>

        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>{t.section4Title}</h3>
        <p style={{ marginBottom: '1.5rem' }}>{t.section4Text}</p>

        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>{t.section5Title}</h3>
        <p style={{ marginBottom: '1.5rem' }}>{t.section5Text}</p>
      </div>
    </div>
  )
}
