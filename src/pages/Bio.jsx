import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Link } from 'react-router-dom'
import { studioKnowledgeBase } from '../data/aiKnowledge'
import { submitRegistration } from '../data/classcore'
import './Bio.css'

const GEMINI_KEY = atob('QVEuQWI4Uk42SnhSZVRtaWZfOEFCSHBnUWhLRS11dmhlUG5YMTdYSkhBaTZNQjZQQm9ZUg==')

// Truly Intelligent Smart Instant Knowledge Engine (No Emojis)
function getSmartKnowledgeAnswer(query, lang) {
  const q = query.toLowerCase()

  // 1. General Greetings & Offerings ("რას გვთავაზობ?", "რა სერვისები გაქვთ?", "რას ასწავლით?", "რა შეთავაზება გაქვთ?")
  if (
    q.includes('გვთავაზობ') ||
    q.includes('შეთავაზებ') ||
    q.includes('სერვის') ||
    q.includes('რას ასწავლ') ||
    q.includes('რა გაქვთ') ||
    q.includes('რა არის') ||
    q.includes('offer') ||
    q.includes('services') ||
    q.includes('предлагаете') ||
    q.includes('услуги')
  ) {
    if (lang === 'ka') {
      return `ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების პროფესიონალურ სწავლებას ბათუმში:

1. საბავშვო ჯგუფები (4.5-დან 16 წლამდე: Baby, Bronze, Pre-Silver, Silver, Golden)
2. წყვილების ჯგუფი (ლათინოამერიკული და სტანდარტული ცეკვები)
3. Solo კატეგორია (გოგონებისა და ბიჭებისთვის წყვილის გარეშე)
4. Hobby Class (მოყვარულთა და ზრდასრულთა ჯგუფი)
5. ინდივიდუალური გაკვეთილები (პერსონალური მწვრთნელი)
6. მონაწილეობა ტურნირებში, საცეკვაო ბანაკებსა (Camps) და შოუ-პროგრამებში
7. 100%-ით უფასო პირველი საცდელი გაკვეთილი!

ჩასაწერად მოგვწერეთ "დამარეგისტრირე" და გახსნით სარეგისტრაციო ფორმას.`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO offers professional Ballroom & Latin Sports Dance instruction in Batumi:

1. Kids Groups (Ages 4.5 to 16: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Couples Group (Latin & Standard Dances)
3. Solo Category (For girls & boys without a partner)
4. Hobby Class (Adults & Amateurs)
5. Private Lessons (Personal Coaching)
6. Competitions, Dance Camps, and Show Performances
7. 100% Free First Trial Lesson!

Reply "Register me" to open the registration form.`
    } else {
      return `ST DANCE STUDIO предлагает профессиональное обучение бальным и спортивным танцам в Батуми:

1. Детские группы (от 4.5 до 16 лет: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Группы для пар (Латина и Стандарт)
3. Категория Solo (для девочек и мальчиков без партнера)
4. Hobby Class (для взрослых и любителей)
5. Индивидуальные уроки (Персональный тренер)
6. Участие в турнирах, танцевальных лагерях (Camps) и шоу
7. 100% Бесплатный первый пробный урок!

Напишите "Зарегистрировать" для открытия формы записи.`
    }
  }

  // 2. Register trigger
  if (
    q.includes('რეგისტრაცი') ||
    q.includes('დამარეგისტრირ') ||
    q.includes('ჩაწერ') ||
    q.includes('register') ||
    q.includes('записаться') ||
    q.includes('зарегистрир')
  ) {
    if (lang === 'ka') {
      return 'ონლაინ რეგისტრაციის ფორმა გახსნილია ეკრანზე. გთხოვთ შეავსოთ მონაცემები.'
    } else if (lang === 'en') {
      return 'The online registration form is now open on your screen. Please fill in your details.'
    } else {
      return 'Форма онлайн-регистрации открыта на экране. Пожалуйста, заполните данные.'
    }
  }

  // 3. Solo Category & Couples
  if (
    q.includes('წყვილ') ||
    q.includes('სოლო') ||
    q.includes('solo') ||
    q.includes('კატეგორი') ||
    q.includes('პარტნიორ') ||
    q.includes('couple') ||
    q.includes('пара')
  ) {
    if (lang === 'ka') {
      return 'წყვილში მოსვლა აუცილებელი არ არის. გოგონებს (ისევე როგორც ბიჭებს) შეუძლიათ იარონ და ივარჯიშონ Solo კატეგორიაში. პროგრამა ითვალისწინებს როგორც წყვილურ, ისე ინდივიდუალურ საცეკვაო ტექნიკასა და ქორეოგრაფიას.'
    } else if (lang === 'en') {
      return 'Coming with a partner is not required. Girls and boys can practice in the Solo category. The program covers both couples and individual dance techniques.'
    } else {
      return 'Приходить с партнером не обязательно. Девочки и мальчики могут заниматься в категории Solo. Программа включает как парную, так и индивидуальную технику.'
    }
  }

  // 4. Parents Attendance
  if (
    q.includes('მშობელ') ||
    q.includes('დასწრებ') ||
    q.includes('დარბაზ') ||
    q.includes('parent') ||
    q.includes('родител')
  ) {
    if (lang === 'ka') {
      return 'ბავშვების მაქსიმალური კონცენტრაციისა და სავარჯიშო პროცესის ეფექტურობისთვის, მშობლების დასწრება უშუალოდ დარბაზში არ არის რეკომენდებული (გარდა ღია გაკვეთილებისა). მშობლებს შეუძლიათ კომფორტულად დაელოდონ ბავშვებს სტუდიის მოსაცდელ სივრცეში.'
    } else if (lang === 'en') {
      return 'For maximum focus and efficiency, parents are not recommended to stay inside the training room during classes (except open events). Parents can wait comfortably in the waiting lounge.'
    } else {
      return 'Для максимальной концентрации присутствие родителей в зале не рекомендуется (кроме открытых уроков). Родители могут подождать в комфортной зоне ожидания.'
    }
  }

  // 5. Costumes & Dresses
  if (
    q.includes('კოსტიუმ') ||
    q.includes('კაბ') ||
    q.includes('სასცენო') ||
    q.includes('costume') ||
    q.includes('dress') ||
    q.includes('костюм') ||
    q.includes('плать')
  ) {
    if (lang === 'ka') {
      return 'ინდივიდუალური/საკონკურსო კოსტიუმები ტურნირებისთვის შეკერვა ან შეძენა ხდება ინდივიდუალურად (მწვრთნელის რეკომენდაციით). ჯგუფური და საშობაო გამოსვლებისას სტუდია აქტიურად ეხმარება მშობლებს კოსტიუმების ორგანიზებაში (ჯგუფური შეკვეთით ან იჯარით).'
    } else if (lang === 'en') {
      return 'Individual competition costumes are ordered or made independently with coach guidance. For group performances, the studio organizes costumes together with parents.'
    } else {
      return 'Костюмы для соревнований заказываются индивидуально по рекомендации тренера. Для групповых выступлений студия помогает организовать костюмы.'
    }
  }

  // 6. Sickness & Makeup classes
  if (
    q.includes('ავად') ||
    q.includes('ცნობ') ||
    q.includes('ექიმ') ||
    q.includes('აღდგენ') ||
    q.includes('გადატან') ||
    q.includes('sick') ||
    q.includes('болезнь') ||
    q.includes('справк')
  ) {
    if (lang === 'ka') {
      return 'დიახ, ავადმყოფობის ან ექიმის ცნობის წარდგენის შემთხვევაში, გაცდენილი გაკვეთილები არ იკარგება — ხდება მათი გადატანა/აღდგენა სხვა პარალელურ ჯგუფებთან შეთანხმებით ან მომდევნო თვის გადასახადზე ასახვით.'
    } else if (lang === 'en') {
      return 'Yes, upon presenting a doctor certificate, missed classes are not lost and can be rescheduled or adjusted in the next month subscription.'
    } else {
      return 'Да, при предоставлении медицинской справки пропущенные занятия не сгорают и переносятся на другой период.'
    }
  }

  // 7. Items required for practice
  if (
    q.includes('თან') ||
    q.includes('ნივთ') ||
    q.includes('წყალ') ||
    q.includes('პირსახოც') ||
    q.includes('water') ||
    q.includes('towel') ||
    q.includes('вода') ||
    q.includes('полотенц')
  ) {
    if (lang === 'ka') {
      return 'ვარჯიშზე ბავშვს თან უნდა ჰქონდეს: 1. სასმელი წყალი (პატარა ბოთლით), 2. პატარა პირსახოცი, 3. საცეკვაო ფეხსაცმელი, 4. მოხერხებული სავარჯიშო ფორმა.'
    } else if (lang === 'en') {
      return 'Items required for training: 1. Water bottle, 2. Small towel, 3. Dance shoes, 4. Comfortable practice clothes.'
    } else {
      return 'Что брать с собой: 1. Бутылочка воды, 2. Небольшое полотенце, 3. Танцевальная обувь, 4. Удобная форма.'
    }
  }

  // 8. Dance Camps & Intensives
  if (
    q.includes('ბანაკ') ||
    q.includes('შეკრებ') ||
    q.includes('ინტენსივ') ||
    q.includes('camp') ||
    q.includes('лагерь') ||
    q.includes('сбор')
  ) {
    if (lang === 'ka') {
      return 'დიახ, სტუდია პერიოდულად ატარებს სეზონურ ინტენსივებსა და საცეკვაო ბანაკებს (როგორც ქალაქგარეთ, ისე ადგილზე — Masterclass & Camp-ის ფორმატში).'
    } else if (lang === 'en') {
      return 'Yes, the studio periodically organizes seasonal dance camps and intensive masterclasses.'
    } else {
      return 'Да, студия регулярно проводит сезонные танцевальные лагеря и интенсивы.'
    }
  }

  // 9. Certificates & Awards
  if (
    q.includes('სერტიფიკატ') ||
    q.includes('დიპლომ') ||
    q.includes('თას') ||
    q.includes('მედალ') ||
    q.includes('certificate') ||
    q.includes('award') ||
    q.includes('сертификат') ||
    q.includes('диплом')
  ) {
    if (lang === 'ka') {
      return 'დიახ, სასწავლო წლის/სეზონის ბოლოს, ასევე შიდა ტურნირებსა და საჩვენებელ ღონისძიებებზე, ყველა მოსწავლეს გადაეცემა სტუდიის ოფიციალური სერტიფიკატები, ხოლო წარმატებული გამოსვლებისთვის — თასები და მედლები.'
    } else if (lang === 'en') {
      return 'Yes, at the end of each season and internal events, all students receive official certificates, trophies, and medals.'
    } else {
      return 'Да, в конце сезона и на внутренних мероприятиях все ученики получают официальные сертификаты, кубки и медали.'
    }
  }

  // 10. Schedule & Pricing per specific group
  if (
    q.includes('განრიგ') ||
    q.includes('როდის') ||
    q.includes('დღე') ||
    q.includes('საათ') ||
    q.includes('schedule') ||
    q.includes('days') ||
    q.includes('when') ||
    q.includes('расписание') ||
    q.includes('когда') ||
    q.includes('ჯგუფი') ||
    q.includes('group')
  ) {
    if (lang === 'ka') {
      return `ST DANCE STUDIO — ჯგუფების განრიგი და ფასები:

1. Baby ჯგუფი (4.5 – 6 წელი)
- დღეები: სამშაბათი და ხუთშაბათი 17:30 – 18:15 + შაბათს 10:00
- ფასი: 130₾/თვე (დედმამიშვილზე 100₾)

2. Bronze (ბრონზა) ჯგუფი (დამწყებები / 1-ელი წელი)
- დღეები: სამშაბათი და ხუთშაბათი 18:15 – 19:15
- ფასი: 130₾/თვე (დედმამიშვილზე 100₾)

3. Pre-Silver ჯგუფი (1 წელი ნასიარულები)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 17:30
- ფასი: 130₾/თვე

4. Silver ჯგუფი (2+ წელი ნასიარულები)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 19:30
- ფასი: 130₾/თვე

5. Golden ჯგუფი (5+ წელი ნასიარულები)
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 16:30
- ფასი: 130₾/თვე

6. წყვილების ჯგუფი
- დღეები: ორშაბათი, ოთხშაბათი, პარასკევი 18:30
- ფასი: 130₾/თვე

7. Hobby Class (მოყვარულები / ზრდასრულები)
- დღეები: სამშაბათი და ხუთშაბათი 19:15 – 20:15
- ფასი: 130₾/თვე

8. ინდივიდუალური გაკვეთილები
- დღეები: შეთანხმებით (თავისუფალი გრაფიკი)
- ფასი: 1 გაკვეთილი = 70₾ | 4 პაკეტი = 240₾ | 8 პაკეტი = 400₾

ჩასაწერად მოგვწერეთ "დამარეგისტრირე" და გახსნით სარეგისტრაციო ფორმას!`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO — Groups Schedule & Pricing:

1. Baby Class (Ages 4.5 – 6)
- Days: Tue & Thu 17:30 – 18:15 + Sat 10:00
- Price: 130 GEL/mo (100 GEL for siblings)

2. Bronze Group (Beginners / 1st Year)
- Days: Tue & Thu 18:15 – 19:15
- Price: 130 GEL/mo (100 GEL for siblings)

3. Pre-Silver Group (1 Year Exp.)
- Days: Mon, Wed, Fri 17:30
- Price: 130 GEL/mo

4. Silver Group (2+ Years Exp.)
- Days: Mon, Wed, Fri 19:30
- Price: 130 GEL/mo

5. Golden Group (5+ Years Exp.)
- Days: Mon, Wed, Fri 16:30
- Price: 130 GEL/mo

6. Couples Group
- Days: Mon, Wed, Fri 18:30
- Price: 130 GEL/mo

7. Hobby Class (Adults / Amateurs)
- Days: Tue & Thu 19:15 – 20:15
- Price: 130 GEL/mo

8. Private Lessons
- Days: Flexible by appointment
- Price: 1 Class = 70₾ | 4 Package = 240₾ | 8 Package = 400₾

Reply "Register me" to sign up instantly!`
    } else {
      return `ST DANCE STUDIO — Расписание и цены групп:

1. Группа Baby (4.5 – 6 лет)
- Дни: Вторник и Четверг 17:30 – 18:15 + Суббота 10:00
- Цена: 130 GEL/мес (100 GEL для сестер/братьев)

2. Группа Bronze (Начинающие / 1-й год)
- Дни: Вторник и Четверг 18:15 – 19:15
- Цена: 130 GEL/мес (100 GEL для сестер/братьев)

3. Группа Pre-Silver (1 год опыта)
- Дни: Понедельник, Среда, Пятница 17:30
- Цена: 130 GEL/мес

4. Группа Silver (2+ года опыта)
- Дни: Понедельник, Среда, Пятница 19:30
- Цена: 130 GEL/мес

5. Группа Golden (5+ лет опыта)
- Дни: Понедельник, Среда, Пятница 16:30
- Цена: 130 GEL/мес

6. Группа для Пар
- Дни: Понедельник, Среда, Пятница 18:30
- Цена: 130 GEL/мес

7. Hobby Class (Взрослые / Любители)
- Дни: Вторник и Четверг 19:15 – 20:15
- Цена: 130 GEL/мес

8. Индивидуальные уроки
- Дни: По договоренности
- Цена: 1 урок = 70₾ | 4 урока = 240₾ | 8 уроков = 400₾

Напишите "Зарегистрировать" для онлайн записи!`
    }
  }

  // 11. Trainer & Leadership (სერგო წივწივაძე)
  if (
    q.includes('მწვრთნელ') ||
    q.includes('ტრენერ') ||
    q.includes('სერგ') ||
    q.includes('წივწივაძ') ||
    q.includes('ხელმძღვანელ') ||
    q.includes('მსაჯ') ||
    q.includes('trainer') ||
    q.includes('coach') ||
    q.includes('founder') ||
    q.includes('тренер') ||
    q.includes('руковод')
  ) {
    if (lang === 'ka') {
      return 'ST Dance Studio-ს დამფუძნებელი, მფლობელი და მთავარი მწვრთნელია სერგო (სერგი) წივწივაძე — პროფესიონალი პედაგოგი და WDSF-ის მოქმედი საერთაშორისო მსაჯი.'
    } else if (lang === 'en') {
      return 'ST Dance Studio founder and head coach is Sergo (Sergi) Tsivtsivadze — professional educator and active international WDSF Judge.'
    } else {
      return 'Основатель и главный тренер ST Dance Studio — Серго (Серги) Цивцивадзе, профессиональный педагог и действующий международный судья WDSF.'
    }
  }

  // 12. Dance Styles & Directions
  if (
    q.includes('ქართულ') ||
    q.includes('ჰიპ') ||
    q.includes('ბალეტ') ||
    q.includes('მიმართულებ') ||
    q.includes('რა ცეკვ') ||
    q.includes('სტილ') ||
    q.includes('style') ||
    q.includes('dance') ||
    q.includes('танец') ||
    q.includes('стиль')
  ) {
    if (lang === 'ka') {
      return 'ჩვენთან ისწავლება მხოლოდ სამეჯლისო-სპორტული ცეკვები (ლათინოამერიკული და სტანდარტული). არ ვასწავლით ქართულ ცეკვებს ან ჰიპ-ჰოპს.'
    } else if (lang === 'en') {
      return 'We teach exclusively Sports & Ballroom Dancing (Latin & Standard). We do not offer Georgian national dances or hip-hop.'
    } else {
      return 'Мы обучаем исключительно бальным и спортивным танцам (латина и стандарт). Грузинские танцы и хип-хоп у нас не преподаются.'
    }
  }

  // 13. Siblings Discount
  if (
    q.includes('დედმამიშვილ') ||
    q.includes('და-ძმ') ||
    q.includes('ორი შვილ') ||
    q.includes('ორი ბავშვ') ||
    q.includes('sibling') ||
    q.includes('brother') ||
    q.includes('sister') ||
    q.includes('двое детей') ||
    q.includes('сестр')
  ) {
    if (lang === 'ka') {
      return 'დიახ, დედმამიშვილებზე მოქმედებს ფასდაკლება — 100 ლარი 1 მოსწავლეზე (ანუ 200 ლარი 2 დედმამიშვილზე თვეში).'
    } else if (lang === 'en') {
      return 'Yes! Sibling discount applies — 100 GEL per student (200 GEL for two siblings monthly).'
    } else {
      return 'Да! Действует скидка для братьев и сестер — 100 GEL за ученика (200 GEL за двоих в месяц).'
    }
  }

  // 14. Private Lessons
  if (
    q.includes('ინდივიდუალური') ||
    q.includes('პირადი') ||
    q.includes('პერსონალური') ||
    q.includes('private') ||
    q.includes('personal') ||
    q.includes('индивидуальნ')
  ) {
    if (lang === 'ka') {
      return `ინდივიდუალური გაკვეთილები:
- 1 გაკვეთილი = 70 ლარი
- 4 გაკვეთილის პაკეტი = 240 ლარი
- 8 გაკვეთილის პაკეტი = 400 ლარი
(შენიშვნა: ინდივიდუალურზე დედმამიშვილების ფასდაკლება არ ვრცელდება).`
    } else if (lang === 'en') {
      return `Private Lessons:
- 1 lesson = 70 GEL
- 4 lessons package = 240 GEL
- 8 lessons package = 400 GEL
(Note: Sibling discount does not apply to private lessons).`
    } else {
      return `Индивидуальные уроки:
- 1 урок = 70 GEL
- Пакет 4 урока = 240 GEL
- Пакет 8 уроков = 400 GEL
(Примечание: Скидка для сестер/братьев не распространяется на личные уроки).`
    }
  }

  // 15. Price & Tuition General
  if (
    q.includes('ფას') ||
    q.includes('ღირს') ||
    q.includes('აბონემენტ') ||
    q.includes('გადახდ') ||
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('сколько') ||
    q.includes('цена') ||
    q.includes('стоит')
  ) {
    if (lang === 'ka') {
      return `ST DANCE STUDIO — ფასების ჩამონათვალი:

- თვიური აბონემენტი: 130 ლარი (30 კალენდარული დღე)
- დედმამიშვილების ფასდაკლება: 100 ლარი 1 მოსწავლეზე (200₾ ორივეზე)
- ინდივიდუალური: 1 გაკვეთილი = 70₾ | 4 = 240₾ | 8 = 400₾
- პირველი საცდელი გაკვეთილი 100%-ით უფასოა!

ჩასაწერად მოგვწერეთ "დამარეგისტრირე"!`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO — Pricing List:

- Monthly Subscription: 130 GEL (30 calendar days)
- Sibling Discount: 100 GEL per student (200 GEL for both)
- Private Lessons: 1 class = 70₾ | 4 = 240₾ | 8 = 400₾
- First trial class is 100% Free!

Reply "Register me" to sign up!`
    } else {
      return `ST DANCE STUDIO — Прейскурант цен:

- Месячный абонемент: 130 GEL (30 календарных дней)
- Скидка для братьев/сестер: 100 GEL за ученика (200 GEL за двоих)
- Индивидуальные уроки: 1 урок = 70₾ | 4 = 240₾ | 8 = 400₾
- Первый пробный урок 100% бесплатный!

Напишите "Зарегистрировать" для записи!`
    }
  }

  // 16. Location & Address
  if (
    q.includes('სად') ||
    q.includes('მისამართ') ||
    q.includes('მდებარეობ') ||
    q.includes('where') ||
    q.includes('location') ||
    q.includes('address') ||
    q.includes('где') ||
    q.includes('адрес')
  ) {
    if (lang === 'ka') {
      return 'მისამართი: ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55 (3-სართულიანი თეთრი შენობის მე-3 სართული, შესასვლელი ბალოტისფერი სახლის ჭიშკრიდან). ტელ: +995 514 19 99 66.'
    } else if (lang === 'en') {
      return 'Location: 55 Eka Takaishvili St, Batumi (3rd floor of 3-story white building, entrance through olive gate). Tel: +995 514 19 99 66.'
    } else {
      return 'Адрес: Батуми, ул. Екатирене Такаишвили №55 (3-й этаж 3-этажного белого здания, вход через оливковые ворота). Тел: +995 514 19 99 66.'
    }
  }

  // Smart General Dynamic Response (Replacing the old generic fallback)
  if (lang === 'ka') {
    return `ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების სწავლებას 4.5-დან 16 წლამდე ბავშვებისთვის, წყვილებისთვის და მოყვარულებისთვის (Hobby Class).

პირველი საცდელი გაკვეთილი 100%-ით უფასოა!

ჩასაწერად მოგვწერეთ "დამარეგისტრირე" ან ჰკითხეთ AI-ს ფასების, განრიგის ან მისამართის შესახებ.`
  } else if (lang === 'en') {
    return `ST DANCE STUDIO offers Ballroom & Sports Dance training for kids 4.5 to 16 yrs, couples, and adults (Hobby Class).

First trial class is 100% Free!

Reply "Register me" to sign up or ask AI about schedule, pricing, or location.`
  } else {
    return `ST DANCE STUDIO предлагает обучение бальным и спортивным танцам для детей от 4.5 до 16 лет, пар и взрослых (Hobby Class).

Первый пробный урок 100% бесплатный!

Напишите "Зарегистрировать" для записи или спросите AI о расписании, ценах или адресе.`
  }
}

export default function Bio() {
  const { lang } = useLanguage()
  const basePath = lang === 'ka' ? '' : `/${lang}`

  const [activeTab, setActiveTab] = useState('all')
  const [toastMessage, setToastMessage] = useState('')
  const canvasRef = useRef(null)

  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false)
  const [regForm, setRegForm] = useState({
    student_name: '',
    birth_date: '',
    shift: 'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)',
    parent_name: '',
    parent_phone: ''
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regError, setRegError] = useState('')

  // Instagram Carousel state with AUTOPLAY
  const [carouselIndex, setCarouselIndex] = useState(0)
  const instagramFeed = [
    { type: 'reel', url: 'https://www.instagram.com/reel/DbdH5LcOCh3/embed', title: 'რილსი' },
    { type: 'post', url: 'https://www.instagram.com/p/DYy9WNRDjyT/embed', title: 'პოსტი' }
  ]

  // Autoplay Instagram Carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % instagramFeed.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [instagramFeed.length])

  // AI Chat state
  const [aiInput, setAiInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const chatViewportRef = useRef(null)

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text:
        lang === 'ka'
          ? 'გამარჯობა! მე ვარ ST Dance Studio-ს AI ასისტენტი. რა გაინტერესებთ სტუდიის შესახებ?'
          : lang === 'en'
          ? 'Hello! I am ST Dance Studio AI Assistant. How can I help you today?'
          : 'Здравствуйте! Я AI-помощник ST Dance Studio. Чем могу помочь?'
    }
  ])

  // Scroll chat to bottom
  useEffect(() => {
    if (chatViewportRef.current) {
      chatViewportRef.current.scrollTop = chatViewportRef.current.scrollHeight
    }
  }, [messages, isAiLoading])

  // Registration Form Handler
  const handleRegSubmit = async (e) => {
    e.preventDefault()
    if (!regForm.student_name || !regForm.birth_date || !regForm.parent_name || !regForm.parent_phone) {
      setRegError('გთხოვთ შეავსოთ ყველა აუცილებელი ველი')
      return
    }

    setRegLoading(true)
    setRegError('')

    const res = await submitRegistration({
      student_name: regForm.student_name,
      birth_date: regForm.birth_date,
      shift: regForm.shift,
      parent_name: regForm.parent_name,
      parent_phone: regForm.parent_phone,
      status: 'pending'
    })

    setRegLoading(false)
    if (res) {
      setRegSuccess(true)
      setRegForm({ student_name: '', birth_date: '', shift: 'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)', parent_name: '', parent_phone: '' })
    } else {
      setRegError('შეცდომა რეგისტრაციისას. გთხოვთ სცადოთ ხელახლა.')
    }
  }

  // Call Gemini REST API with Instant Smart Knowledge Fallback
  const handleSendAiMessage = async (userMsg) => {
    const query = userMsg || aiInput
    if (!query.trim() || isAiLoading) return

    const newMsgs = [...messages, { role: 'user', text: query }]
    setMessages(newMsgs)
    setAiInput('')

    // Check if user is asking to register
    const qLower = query.toLowerCase()
    if (
      qLower.includes('რეგისტრაცი') ||
      qLower.includes('დამარეგისტრირ') ||
      qLower.includes('ჩაწერ') ||
      qLower.includes('register')
    ) {
      setIsRegModalOpen(true)
    }

    setIsAiLoading(true)

    try {
      const systemPrompt = `${studioKnowledgeBase}\n\nყურადღება: უპასუხე იმავე ენაზე, რომელზეც მომხმარებელი გეკითხება. არ გამოიყენო ემოჯიები! იყავი თავაზიანი, მეგობრული, ამომწურავი და მკაფიო.`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: ${query}` }
                ]
              }
            ]
          })
        }
      )

      const data = await res.json()
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (reply) {
        setMessages([...newMsgs, { role: 'bot', text: reply }])
      } else {
        const fallbackReply = getSmartKnowledgeAnswer(query, lang)
        setMessages([...newMsgs, { role: 'bot', text: fallbackReply }])
      }
    } catch (err) {
      const fallbackReply = getSmartKnowledgeAnswer(query, lang)
      setMessages([...newMsgs, { role: 'bot', text: fallbackReply }])
    } finally {
      setIsAiLoading(false)
    }
  }

  // Floating toast message
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }

  // Copy helper
  const copyText = (text, label) => {
    try {
      navigator.clipboard.writeText(text)
      showToast(label)
    } catch (e) {
      showToast(label)
    }
  }

  // Share API
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ST Dance Studio | Link in Bio',
        url: window.location.href
      }).catch(() => {})
    } else {
      copyText(window.location.href, 'ბმული დაკოპირდა!')
    }
  }

  // Canvas Particles Background Effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < 0) p.y = height
        if (p.x < 0 || p.x > width) p.x = Math.random() * width

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(229, 193, 88, ${p.alpha})`
        ctx.fill()
      })
      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const content = {
    ka: {
      title: 'ST DANCE STUDIO',
      subtitle: 'სპორტული და სამეჯლისო ცეკვების სტუდია',
      location: 'ბათუმი, ე. თაყაიშვილის 55',
      phone: '+995 514 19 99 66',
      ctaBadge: 'მიღება ღიაა 4-16 წლის ბავშვებისთვის',
      ctaTitle: 'ონლაინ რეგისტრაცია',
      ctaSubtitle: 'ჩაეწერეთ უფასო საცდელ მეცადინეობაზე',
      videoTitle: 'ინსტაგრამის ფიდი / სიახლეები',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: 'ბათუმი, ე. თაყაიშვილის 55',
      mapBtn: 'Google Maps',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI ასისტენტი',
      aiSubtitle: 'დასვით ნებისმიერი კითხვა',
      aiSuggestions: [
        'რას გვთავაზობთ?',
        'დამარეგისტრირე',
        'განრიგი & ფასები',
        'რა ღირს სწავლა?'
      ],
      tabs: [
        { id: 'all', label: 'ყველა' },
        { id: 'reg', label: 'რეგისტრაცია' },
        { id: 'info', label: 'განრიგი & ფასები' },
        { id: 'contact', label: 'კონტაქტი' }
      ],
      stats: [
        { num: '12+', label: 'წლის გამოცდილება' },
        { num: '300+', label: 'აქტიური მოსწავლე' },
        { num: '50+', label: 'ჯილდო & თასი' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'განრიგი',
          desc: 'ჯგუფები და საათები',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          category: 'info',
          title: 'გადახდა',
          desc: 'ონლაინ ანგარიშსწორება',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          category: 'info',
          title: 'ჩვენ შესახებ',
          desc: 'გუნდი და მწვრთნელები',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp ჩატი',
          desc: 'პირდაპირი მიმოწერა',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    },
    en: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Sports & Ballroom Dance Studio in Batumi',
      location: '55 E. Takaishvili St, Batumi',
      phone: '+995 514 19 99 66',
      ctaBadge: 'Enrollment Open for Kids 4-16',
      ctaTitle: 'Online Registration',
      ctaSubtitle: 'Book a Free Trial Class',
      videoTitle: 'Instagram Feed & Carousel',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: '55 E. Takaishvili St, Batumi',
      mapBtn: 'Open Maps',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI Assistant',
      aiSubtitle: 'Ask any question about studio',
      aiSuggestions: [
        'What do you offer?',
        'Register me',
        'Schedule & Prices',
        'How much is tuition?'
      ],
      tabs: [
        { id: 'all', label: 'All' },
        { id: 'reg', label: 'Register' },
        { id: 'info', label: 'Schedule & Info' },
        { id: 'contact', label: 'Contact' }
      ],
      stats: [
        { num: '12+', label: 'Years Experience' },
        { num: '300+', label: 'Active Students' },
        { num: '50+', label: 'Trophies Won' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'Schedule',
          desc: 'Groups & Class Hours',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          category: 'info',
          title: 'Payment',
          desc: 'Quick & Secure Checkout',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          category: 'info',
          title: 'About Us',
          desc: 'Team & Instructors',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp Chat',
          desc: 'Direct Message',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    },
    ru: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Студия спортивных и бальных танцев в Батуми',
      location: 'Батуми, ул. Е. Такаишвили 55',
      phone: '+995 514 19 99 66',
      ctaBadge: 'Набор открыт для детей 4-16 лет',
      ctaTitle: 'Онлайн Регистрация',
      ctaSubtitle: 'Запишитесь на бесплатный урок',
      videoTitle: 'Лента Instagram и карусель',
      mapTitle: 'ST Dance Studio Batumi',
      mapAddress: 'Батуми, ул. Е. Такаишвили 55',
      mapBtn: 'Google Maps',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI Помощник',
      aiSubtitle: 'Задайте любой вопрос',
      aiSuggestions: [
        'Что предлагаете?',
        'Записать меня',
        'Расписание и цены',
        'Сколько стоит обучение?'
      ],
      tabs: [
        { id: 'all', label: 'Все' },
        { id: 'reg', label: 'Регистрация' },
        { id: 'info', label: 'Расписание' },
        { id: 'contact', label: 'Контакт' }
      ],
      stats: [
        { num: '12+', label: 'Лет Опыта' },
        { num: '300+', label: 'Учеников' },
        { num: '50+', label: 'Наград' }
      ],
      cards: [
        {
          id: 'schedule',
          category: 'info',
          title: 'Расписание',
          desc: 'Группы и часы',
          to: `${basePath}/schedule`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'payment',
          category: 'info',
          title: 'Оплата',
          desc: 'Онлайн расчет',
          to: `${basePath}/payment`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          )
        },
        {
          id: 'about',
          category: 'info',
          title: 'О нас',
          desc: 'Команда и тренеры',
          to: `${basePath}/about`,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H18M6 9a3 3 0 01-3-3V4h18v2a3 3 0 01-3 3M6 9v3a6 6 0 006 6v3M18 9v3a6 6 0 01-6 6M9 21h6"></path>
            </svg>
          )
        },
        {
          id: 'whatsapp',
          category: 'contact',
          title: 'WhatsApp Чат',
          desc: 'Прямая связь',
          href: 'https://wa.me/995514199966',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          )
        }
      ]
    }
  }

  const t = content[lang] || content.ka

  const filteredCards = t.cards.filter(
    (card) => activeTab === 'all' || card.category === activeTab
  )

  return (
    <div className="bio-page-container">
      {/* Canvas Particles Background */}
      <canvas ref={canvasRef} className="bio-particle-canvas" />

      {/* Top Action Controls Bar */}
      <div className="bio-top-controls">
        <button
          className="bio-action-icon-btn"
          onClick={handleShare}
          title="Share / გაზიარება"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        {/* Floating Glass Language Bar */}
        <div className="bio-lang-bar">
          <Link to="/bio" className={`bio-lang-link ${lang === 'ka' ? 'active' : ''}`}>
            GE
          </Link>
          <Link to="/en/bio" className={`bio-lang-link ${lang === 'en' ? 'active' : ''}`}>
            EN
          </Link>
          <Link to="/ru/bio" className={`bio-lang-link ${lang === 'ru' ? 'active' : ''}`}>
            RU
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && <div className="bio-toast">{toastMessage}</div>}

      <div className="bio-wrapper">
        {/* Header & Crest Profile */}
        <header className="bio-header">
          <div className="bio-avatar-container">
            <div className="bio-avatar-ring"></div>
            <img
              src="/images/logo-transparent.png"
              alt="ST Dance Studio Crest"
              className="bio-avatar-img"
            />
            <div className="bio-verified-check">✓</div>
          </div>

          <h1 className="bio-brand-title">{t.title}</h1>
          <p className="bio-brand-subtitle">{t.subtitle}</p>

          {/* Distinct Action Buttons (Call & Google Maps) */}
          <div className="bio-action-buttons-row">
            <a href="tel:+995514199966" className="bio-btn-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
              <span>{t.phone}</span>
            </a>

            <a
              href="https://maps.app.goo.gl/iyBGVtNeiNUGZmq86"
              target="_blank"
              rel="noopener noreferrer"
              className="bio-btn-action"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{t.location}</span>
            </a>
          </div>
        </header>

        {/* Live Stats Counter Bar */}
        <div className="bio-stats-bar">
          {t.stats.map((st, idx) => (
            <div key={idx} className="bio-stat-item">
              <div className="bio-stat-num">{st.num}</div>
              <div className="bio-stat-label">{st.label}</div>
            </div>
          ))}
        </div>

        {/* EMBEDDED AI CHAT BOT BENTO CARD */}
        <section className="bio-ai-card">
          <div className="bio-ai-header">
            <div className="bio-ai-title-wrap">
              <div className="bio-ai-avatar">AI</div>
              <div>
                <div className="bio-ai-title">{t.aiTitle}</div>
              </div>
            </div>
            <div className="bio-ai-tag">{t.aiTag}</div>
          </div>

          {/* Chat Messages Viewport */}
          <div className="ai-chat-viewport" ref={chatViewportRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg-item ${m.role}`}>
                <div className="ai-msg-bubble">{m.text}</div>
              </div>
            ))}
            {isAiLoading && (
              <div className="ai-msg-item bot">
                <div className="ai-msg-bubble">AI ფიქრობს...</div>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="ai-suggestions-row">
            {t.aiSuggestions.map((sug, idx) => (
              <button
                key={idx}
                className="ai-sug-pill"
                onClick={() => handleSendAiMessage(sug)}
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            className="ai-chat-input-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSendAiMessage()
            }}
          >
            <input
              type="text"
              className="ai-chat-input"
              placeholder={
                lang === 'ka'
                  ? 'ჰკითხეთ AI-ს რაიმე...'
                  : lang === 'en'
                  ? 'Ask AI anything...'
                  : 'Спросите AI...'
              }
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
            />
            <button
              type="submit"
              className="ai-chat-send-btn"
              disabled={isAiLoading || !aiInput.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </section>

        {/* Category Filter Tabs */}
        <div className="bio-filter-tabs">
          {t.tabs.map((tab) => (
            <button
              key={tab.id}
              className={`bio-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BENTO GRID ACTION CARDS */}
        <section className="bio-bento-section">
          {/* HERO BENTO CTA CARD — Opens Inline Registration Form */}
          {(activeTab === 'all' || activeTab === 'reg') && (
            <div
              className="bento-hero-card"
              onClick={() => setIsRegModalOpen(true)}
            >
              <div className="bento-hero-info">
                <div className="bento-hero-badge">
                  <span className="radar-pulse"></span>
                  <span>{t.ctaBadge}</span>
                </div>
                <div className="bento-hero-title">{t.ctaTitle}</div>
                <div className="bento-hero-desc">{t.ctaSubtitle}</div>
              </div>
              <div className="bento-hero-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          )}

          {/* 2-COLUMN BENTO GRID FOR CORE ACTIONS */}
          <div className="bento-grid-2col">
            {filteredCards.map((card) => {
              if (card.to) {
                return (
                  <Link key={card.id} to={card.to} className="bento-mini-card">
                    <div className="bento-mini-top">
                      <div className="bento-icon-box">{card.icon}</div>
                      <div className="bento-mini-arrow">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="bento-mini-bottom">
                      <div className="bento-mini-title">{card.title}</div>
                      <div className="bento-mini-desc">{card.desc}</div>
                    </div>
                  </Link>
                )
              }
              return (
                <a
                  key={card.id}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bento-mini-card"
                >
                  <div className="bento-mini-top">
                    <div className="bento-icon-box">{card.icon}</div>
                    <div className="bento-mini-arrow">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="bento-mini-bottom">
                    <div className="bento-mini-title">{card.title}</div>
                    <div className="bento-mini-desc">{card.desc}</div>
                  </div>
                </a>
              )
            })}
          </div>

          {/* FULL-WIDTH MAP BENTO CARD */}
          {(activeTab === 'all' || activeTab === 'contact') && (
            <a
              href="https://maps.app.goo.gl/iyBGVtNeiNUGZmq86"
              target="_blank"
              rel="noopener noreferrer"
              className="bento-map-card"
            >
              <div className="bento-map-header">
                <div className="bento-map-left">
                  <div className="bento-map-pin-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <div className="bento-map-name">{t.mapTitle}</div>
                    <div className="bento-map-sub">{t.mapAddress}</div>
                  </div>
                </div>
                <div className="bento-map-button">
                  <span>{t.mapBtn}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </a>
          )}
        </section>

        {/* INSTAGRAM AUTOPLAY CAROUSEL SHOWCASE SECTION */}
        <section className="bio-carousel-section">
          <div className="bio-carousel-header">
            <div className="bio-carousel-title-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>{t.videoTitle}</span>
            </div>

            <div className="bio-carousel-nav">
              <button
                className="bio-cnav-btn"
                onClick={() =>
                  setCarouselIndex((prev) =>
                    prev === 0 ? instagramFeed.length - 1 : prev - 1
                  )
                }
              >
                ◀
              </button>
              <button
                className="bio-cnav-btn"
                onClick={() =>
                  setCarouselIndex((prev) => (prev + 1) % instagramFeed.length)
                }
              >
                ▶
              </button>
            </div>
          </div>

          <div className="bio-carousel-viewport">
            <div className="bio-carousel-slide">
              <iframe
                className="bio-carousel-iframe"
                src={instagramFeed[carouselIndex].url}
                title={`ST Dance Studio Instagram Feed ${carouselIndex + 1}`}
                allowTransparency={true}
                allow="encrypted-media"
                frameBorder="0"
                scrolling="no"
              ></iframe>
            </div>
          </div>
        </section>

        {/* SOCIAL FOOTER ICONS */}
        <footer className="bio-social-footer">
          <a
            href="https://www.instagram.com/stdancestudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
            aria-label="Instagram"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
            aria-label="Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
            aria-label="YouTube"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0-.46-5.33 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a
            href="https://wa.me/995514199966"
            target="_blank"
            rel="noopener noreferrer"
            className="bio-social-btn"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        </footer>
      </div>

      {/* INLINE REGISTRATION MODAL / DRAWER */}
      {isRegModalOpen && (
        <div className="bio-modal-overlay" onClick={() => setIsRegModalOpen(false)}>
          <div className="bio-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="bio-modal-close" onClick={() => setIsRegModalOpen(false)}>
              ✕
            </button>

            {regSuccess ? (
              <div className="bio-modal-success">
                <div className="bio-success-icon">✓</div>
                <h2 className="bio-modal-title">რეგისტრაცია წარმატებულია!</h2>
                <p className="bio-modal-sub" style={{ margin: '12px 0 20px' }}>
                  თქვენი განაცხადი მიღებულია. ადმინისტრაცია მალე დაგიკავშირდებათ საცდელ გაკვეთილზე დასასწრებად.
                </p>
                <button
                  className="bio-form-submit-btn"
                  onClick={() => {
                    setRegSuccess(false)
                    setIsRegModalOpen(false)
                  }}
                >
                  დახურვა
                </button>
              </div>
            ) : (
              <div>
                <div className="bio-modal-header">
                  <h2 className="bio-modal-title">ონლაინ რეგისტრაცია</h2>
                  <p className="bio-modal-sub">ჩაეწერეთ უფასო საცდელ გაკვეთილზე</p>
                </div>

                {regError && (
                  <div style={{ color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegSubmit}>
                  <div className="bio-form-group">
                    <label className="bio-form-label">მოსწავლის სახელი და გვარი *</label>
                    <input
                      type="text"
                      className="bio-form-input"
                      placeholder="მაგ: ნინი წივწივაძე"
                      value={regForm.student_name}
                      onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="bio-form-group">
                    <label className="bio-form-label">დაბადების თარიღი *</label>
                    <input
                      type="date"
                      className="bio-form-input"
                      value={regForm.birth_date}
                      onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="bio-form-group">
                    <label className="bio-form-label">სასურველი ჯგუფი და დრო *</label>
                    <select
                      className="bio-form-select"
                      value={regForm.shift}
                      onChange={(e) => setRegForm({ ...regForm, shift: e.target.value })}
                    >
                      <option value="Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)">
                        Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)
                      </option>
                      <option value="Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)">
                        Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)
                      </option>
                      <option value="Pre-Silver ჯგუფი (1 წელი) | 17:30 (130₾/თვე)">
                        Pre-Silver ჯგუფი (1 წელი) | 17:30 (130₾/თვე)
                      </option>
                      <option value="Silver ჯგუფი (2+ წელი) | 19:30 (130₾/თვე)">
                        Silver ჯგუფი (2+ წელი) | 19:30 (130₾/თვე)
                      </option>
                      <option value="Golden ჯგუფი (5+ წელი) | 16:30 (130₾/თვე)">
                        Golden ჯგუფი (5+ წელი) | 16:30 (130₾/თვე)
                      </option>
                      <option value="წყვილების ჯგუფი | 18:30 (130₾/თვე)">
                        წყვილების ჯგუფი | 18:30 (130₾/თვე)
                      </option>
                      <option value="Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (130₾/თვე)">
                        Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (130₾/თვე)
                      </option>
                      <option value="ინდივიდუალური გაკვეთილები (70₾ - 400₾)">
                        ინდივიდუალური გაკვეთილები (70₾ - 400₾)
                      </option>
                    </select>
                  </div>

                  <div className="bio-form-group">
                    <label className="bio-form-label">მშობლის სახელი და გვარი *</label>
                    <input
                      type="text"
                      className="bio-form-input"
                      placeholder="მაგ: გიორგი წივწივაძე"
                      value={regForm.parent_name}
                      onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="bio-form-group">
                    <label className="bio-form-label">მშობლის ტელეფონი (WhatsApp) *</label>
                    <input
                      type="tel"
                      className="bio-form-input"
                      placeholder="+995 5XX XX XX XX"
                      value={regForm.parent_phone}
                      onChange={(e) => setRegForm({ ...regForm, parent_phone: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bio-form-submit-btn"
                    disabled={regLoading}
                  >
                    {regLoading ? 'რეგისტრაცია...' : 'რეგისტრაციის გაგზავნა ➔'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
