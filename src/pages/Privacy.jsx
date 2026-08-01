import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Privacy() {
  const { lang } = useLanguage()

  const content = {
    ka: {
      title: 'კონფიდენციალურობის პოლიტიკა',
      subtitle: 'ST Dance Studio-ს მონაცემთა დაცვის პოლიტიკა',
      lastUpdated: 'ბოლო განახლება: 2026 წლის 1 აგვისტო',
      intro: 'ST Dance Studio (მდებარე: ბათუმი, ე. თაყაიშვილის 55) პატივს სცემს თქვენს კონფიდენციალურობას და იცავს თქვენს პერსონალურ მონაცემებს. წინამდებარე პოლიტიკა განმარტავს, თუ როგორ ვაგროვებთ, ვიყენებთ და ვიცავთ თქვენს მონაცემებს ჩვენს ვებგვერდზე (stdance.ge), ონლაინ რეგისტრაციის ფორმებსა და Instagram-ის ავტომატიზებულ სერვისებში.',
      section1Title: '1. რა ინფორმაციას ვაგროვებთ',
      section1Text: 'ჩვენ შეიძლება შევაგროვოთ შემდეგი ტიპის ინფორმაცია:',
      section1List: [
        'საკონტაქტო მონაცემები: მშობლის სახელი, გვარი, ტელეფონის ნომერი და ელ-ფოსტის მისამართი.',
        'მოსწავლის მონაცემები: ბავშვის სახელი, გვარი, დაბადების თარიღი და სკოლის/ბაღის ცვლა.',
        'სოციალური მედია და ჩატები: Instagram Direct-ის შეტყობინებები, რომლებსაც გზავნით ჩვენს ოფიციალურ გვერდზე (@stdancestudio).'
      ],
      section2Title: '2. მონაცემთა გამოყენების მიზნები',
      section2Text: 'თქვენი პერსონალური მონაცემები გამოიყენება მხოლოდ შემდეგი მიზნებისთვის:',
      section2List: [
        'სტუდიაში მოსწავლის რეგისტრაციის პროცესის მართვა და ჯგუფების ფორმირება.',
        'მშობლებთან დაკავშირება მეცადინეობების განრიგის, სიახლეებისა და ღონისძიებების შესახებ.',
        'Instagram Direct-ში ავტომატიზებული ასისტენტის (AI) მეშვეობით თქვენს კითხვებზე სწრაფი პასუხის გაცემა.'
      ],
      section3Title: '3. მონაცემთა უსაფრთხოება და მესამე პირები',
      section3Text: 'ჩვენ არ ვყიდით და არ გადავცემთ თქვენს პერსონალურ მონაცემებს მესამე პირებს მარკეტინგული მიზნებისთვის. მონაცემები შეიძლება დამუშავდეს მხოლოდ უსაფრთხო ტექნოლოგიურ პარტნიორებთან (მაგ. Meta Graph API და Google Gemini) ავტომატიზებული პასუხების უზრუნველსაყოფად.',
      section4Title: '4. თქვენი უფლებები',
      section4Text: 'თქვენ უფლება გაქვთ მოითხოვოთ თქვენი პერსონალური მონაცემების ნახვა, შესწორება ან სრული წაშლა ჩვენი ბაზიდან. ამისთვის დაგვიკავშირდით ელ-ფოსტაზე: stdancestudio13@gmail.com ან ტელეფონზე: +995 514 19 99 66.'
    },
    en: {
      title: 'Privacy Policy',
      subtitle: 'ST Dance Studio Data Protection Policy',
      lastUpdated: 'Last Updated: August 1, 2026',
      intro: 'ST Dance Studio (located at Batumi, E. Takaishvili 55) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information on our website (stdance.ge), registration forms, and automated Instagram services.',
      section1Title: '1. Information We Collect',
      section1Text: 'We may collect the following types of personal information:',
      section1List: [
        "Contact Data: Parent's full name, phone number, and email address.",
        "Student Data: Child's full name, date of birth, and school/kindergarten schedule.",
        'Social Media & Chat Interactions: Instagram Direct messages sent to our official page (@stdancestudio).'
      ],
      section2Title: '2. How We Use Your Information',
      section2Text: 'Your personal data is used strictly for the following purposes:',
      section2List: [
        'Managing student enrollment, registration, and group placements.',
        'Communicating with parents regarding class schedules, studio updates, and events.',
        'Providing automated responses to inquiries on Instagram Direct via our AI assistant.'
      ],
      section3Title: '3. Data Security & Third Parties',
      section3Text: 'We do not sell or trade your personal information to third parties for marketing purposes. Data processing is handled securely using trusted technical infrastructure (such as Meta Graph API and Google Gemini) solely to fulfill automated inquiry services.',
      section4Title: '4. Your Rights',
      section4Text: 'You have the right to inspect, update, or request the deletion of your personal data at any time. To exercise your rights, please contact us at stdancestudio13@gmail.com or call +995 514 19 99 66.'
    },
    ru: {
      title: 'Политика конфиденциальности',
      subtitle: 'Политика защиты данных ST Dance Studio',
      lastUpdated: 'Последнее обновление: 1 августа 2026 г.',
      intro: 'Студия ST Dance Studio (расположенная по адресу: Батуми, ул. Е. Такаишвили 55) уважает вашу конфиденциальность и защищает ваши персональные данные. Настоящая Политика объясняет, как мы собираем, используем и защищаем вашу информацию на нашем сайте (stdance.ge), в формах регистрации и автоматизированных сервисах Instagram.',
      section1Title: '1. Какую информацию мы собираем',
      section1Text: 'Мы можем собирать следующие типы персональных данных:',
      section1List: [
        'Контактные данные: имя, фамилия родителя, номер телефона и адрес электронной почты.',
        'Данные ученика: имя, фамилия ребенка, дата рождения и смена в школе/детском саду.',
        'Сообщения в соцсетях: сообщения Instagram Direct, отправленные на нашу страницу (@stdancestudio).'
      ],
      section2Title: '2. Цели использования информации',
      section2Text: 'Ваши персональные данные используются исключительно в следующих целях:',
      section2List: [
        'Управление процессом записи учеников и формирование групп.',
        'Связь с родителями по поводу расписания занятий, новостей и мероприятий студии.',
        'Предоставление автоматических ответов на вопросы в Instagram Direct с помощью ИИ-ассистента.'
      ],
      section3Title: '3. Безопасность данных и третьи лица',
      section3Text: 'Мы не продаем и не передаем ваши персональные данные третьим лицам в маркетинговых целях. Обработка данных осуществляется надежными сервисами (такими как Meta Graph API и Google Gemini) исключительно для автоматизированных ответов.',
      section4Title: '4. Ваши права',
      section4Text: 'Вы имеете право запросить просмотр, исправление или полное удаление ваших персональных данных. Для этого свяжитесь с нами по эл. почте: stdancestudio13@gmail.com или по телефону: +995 514 19 99 66.'
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
        <p style={{ marginBottom: '0.5rem' }}>{t.section1Text}</p>
        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
          {t.section1List.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>{item}</li>
          ))}
        </ul>

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
      </div>
    </div>
  )
}
