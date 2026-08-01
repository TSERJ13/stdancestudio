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

ჩასაწერად მოგვწერეთ "დამარეგისტრირე" ან დააჭირეთ ონლაინ რეგისტრაციის ღილაკს.`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO offers professional Ballroom & Latin Sports Dance instruction in Batumi:

1. Kids Groups (Ages 4.5 to 16: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Couples Group (Latin & Standard Dances)
3. Solo Category (For girls & boys without a partner)
4. Hobby Class (Adults & Amateurs)
5. Private Lessons (Personal Coaching)
6. Competitions, Dance Camps, and Show Performances
7. 100% Free First Trial Lesson!

Click the Online Registration button to sign up.`
    } else {
      return `ST DANCE STUDIO предлагает профессиональное обучение бальным и спортивным танцам в Батуми:

1. Детские группы (от 4.5 до 16 лет: Baby, Bronze, Pre-Silver, Silver, Golden)
2. Группы для пар (Латина и Стандарт)
3. Категория Solo (для девочек и мальчиков без партнера)
4. Hobby Class (для взрослых и любителей)
5. Индивидуальные уроки (Персональный тренер)
6. Участие в турнирах, танцевальных лагерях (Camps) и шоу
7. 100% Бесплатный первый пробный урок!

Нажмите кнопку Онлайн-Регистрация для записи.`
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
      return 'ონლაინ რეგისტრაციისთვის შეგიძლიათ გამოიყენოთ გვერდზე განთავსებული "ონლაინ რეგისტრაციის" ღილაკი ან განრიგის ჩანართი.'
    } else if (lang === 'en') {
      return 'For online registration, please click the "Online Registration" button on the page.'
    } else {
      return 'Для онлайн-регистрации нажмите кнопку "Онлайн Регистрация" на странице.'
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
- ფასი: 1 გაკვეთილი = 70₾ | 4 პაკეტი = 240₾ | 8 პაკეტი = 400₾`
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
- Price: 1 Class = 70₾ | 4 Package = 240₾ | 8 Package = 400₾`
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
- Цена: 1 урок = 70₾ | 4 урока = 240₾ | 8 уроков = 400₾`
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
- პირველი საცდელი გაკვეთილი 100%-ით უფასოა!`
    } else if (lang === 'en') {
      return `ST DANCE STUDIO — Pricing List:

- Monthly Subscription: 130 GEL (30 calendar days)
- Sibling Discount: 100 GEL per student (200 GEL for both)
- Private Lessons: 1 class = 70₾ | 4 = 240₾ | 8 = 400₾
- First trial class is 100% Free!`
    } else {
      return `ST DANCE STUDIO — Прейскурант цен:

- Месячный абонемент: 130 GEL (30 календарных дней)
- Скидка для братьев/сестер: 100 GEL за ученика (200 GEL за двоих)
- Индивидуальные уроки: 1 урок = 70₾ | 4 = 240₾ | 8 = 400₾
- Первый пробный урок 100% бесплатный!`
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

  // Smart General Dynamic Response
  if (lang === 'ka') {
    return `ST DANCE STUDIO გთავაზობთ სამეჯლისო და სპორტული ცეკვების სწავლებას 4.5-დან 16 წლამდე ბავშვებისთვის, წყვილებისთვის და მოყვარულებისთვის (Hobby Class).

პირველი საცდელი გაკვეთილი 100%-ით უფასოა!`
  } else if (lang === 'en') {
    return `ST DANCE STUDIO offers Ballroom & Sports Dance training for kids 4.5 to 16 yrs, couples, and adults (Hobby Class).

First trial class is 100% Free!`
  } else {
    return `ST DANCE STUDIO предлагает обучение бальным и спортивным танцам для детей от 4.5 до 16 лет, пар и взрослых (Hobby Class).

Первый пробный урок 100% бесплатный!`
  }
}

export default function Bio() {
  const { lang } = useLanguage()

  const [toastMessage, setToastMessage] = useState('')
  const canvasRef = useRef(null)

  // Modals States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [activeInstaTab, setActiveInstaTab] = useState('grid') // 'grid', 'reels', 'tagged'

  // Registration Form State
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

  // Studio Schedule Groups Data
  const studioGroupsList = [
    {
      name: 'Baby ჯგუფი',
      age: '4.5 – 6 წელი (პატარები)',
      days: 'სამშაბათი & ხუთშაბათი 17:30 (45 წთ) + შაბათი 10:00',
      price: '130₾ / თვე (100₾ დედმამიშვილზე)',
      val: 'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)'
    },
    {
      name: 'Bronze (ბრონზა) ჯგუფი',
      age: 'დამწყებები (1-ელი წელი)',
      days: 'სამშაბათი & ხუთშაბათი 18:15 – 19:15',
      price: '130₾ / თვე (100₾ დედმამიშვილზე)',
      val: 'Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)'
    },
    {
      name: 'Pre-Silver (პრე-სილვერი) ჯგუფი',
      age: '1 წელი ნასიარულები',
      days: 'ორშაბათი, ოთხშაბათი, პარასკევი 17:30',
      price: '130₾ / თვე',
      val: 'Pre-Silver ჯგუფი (1 წელი) | 17:30 (130₾/თვე)'
    },
    {
      name: 'Silver (სილვერი) ჯგუფი',
      age: '2+ წელი ნასიარულები',
      days: 'ორშაბათი, ოთხშაბათი, პარასკევი 19:30',
      price: '130₾ / თვე',
      val: 'Silver ჯგუფი (2+ წელი) | 19:30 (130₾/თვე)'
    },
    {
      name: 'Golden (გოლდენი) ჯგუფი',
      age: '5+ წელი ნასიარულები',
      days: 'ორშაბათი, ოთხშაბათი, პარასკევი 16:30',
      price: '130₾ / თვე',
      val: 'Golden ჯგუფი (5+ წელი) | 16:30 (130₾/თვე)'
    },
    {
      name: 'წყვილების ჯგუფი',
      age: 'სამეჯლისო-სპორტული წყვილები',
      days: 'ორშაბათი, ოთხშაბათი, პარასკევი 18:30',
      price: '130₾ / თვე',
      val: 'წყვილების ჯგუფი | 18:30 (130₾/თვე)'
    },
    {
      name: 'Hobby Class (მოყვარულები)',
      age: 'ზრდასრულები & მოყვარულები',
      days: 'სამშაბათი & ხუთშაბათი 19:15 – 20:15',
      price: '130₾ / თვე',
      val: 'Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (130₾/თვე)'
    },
    {
      name: 'ინდივიდუალური გაკვეთილები',
      age: 'პერსონალური მწვრთნელი',
      days: 'თავისუფალი გრაფიკი (შეთანხმებით)',
      price: '1 გაკვეთილი = 70₾ | 4 = 240₾ | 8 = 400₾',
      val: 'ინდივიდუალური გაკვეთილები (70₾ - 400₾)'
    }
  ]

  // Native Instagram Profile 3-Column Grid Data
  const instaGridItems = [
    {
      id: 1,
      img: '/images/about-kids.jpg',
      type: 'reel',
      url: 'https://www.instagram.com/reel/DbdH5LcOCh3/',
      likes: '184',
      comments: '22'
    },
    {
      id: 2,
      img: '/images/studio.jpg',
      type: 'photo',
      url: 'https://www.instagram.com/p/DYy9WNRDjyT/',
      likes: '240',
      comments: '35'
    },
    {
      id: 3,
      img: '/images/competition.png',
      type: 'carousel',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '356',
      comments: '48'
    },
    {
      id: 4,
      img: '/images/dancer-1.png',
      type: 'reel',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '210',
      comments: '19'
    },
    {
      id: 5,
      img: '/images/dancer-2.png',
      type: 'carousel',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '298',
      comments: '41'
    },
    {
      id: 6,
      img: '/images/hero-1.png',
      type: 'reel',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '480',
      comments: '63'
    },
    {
      id: 7,
      img: '/images/hero-2.png',
      type: 'photo',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '195',
      comments: '27'
    },
    {
      id: 8,
      img: '/images/sergi.jpg',
      type: 'reel',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '620',
      comments: '94'
    },
    {
      id: 9,
      img: '/images/nini.jpg',
      type: 'photo',
      url: 'https://www.instagram.com/stdancestudio/',
      likes: '310',
      comments: '52'
    }
  ]

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

  // Scroll chat internal viewport ONLY
  useEffect(() => {
    if (chatViewportRef.current) {
      const el = chatViewportRef.current
      el.scrollTop = el.scrollHeight
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

    setIsAiLoading(true)

    try {
      const systemPrompt = `${studioKnowledgeBase}\n\nყურადღება: უპასუხე იმავე ენაზე, რომელზეც მომხმარებელი გეკითხება. არ გამოიყენო ემოჯიები! იყავი თავაზიანი, მეგობრული, ამომწურავი და მკაფიო.`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/generateContent?key=${GEMINI_KEY}`,
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
        ctx.fillStyle = `rgba(197, 160, 89, ${p.alpha})`
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
      videoTitle: 'Instagram Feed Grid (@stdancestudio)',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI ასისტენტი',
      aiSuggestions: [
        'რას გვთავაზობთ?',
        'დამარეგისტრირე',
        'განრიგი & ფასები',
        'რა ღირს სწავლა?'
      ]
    },
    en: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Sports & Ballroom Dance Studio in Batumi',
      videoTitle: 'Instagram Feed Grid (@stdancestudio)',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI Assistant',
      aiSuggestions: [
        'What do you offer?',
        'Register me',
        'Schedule & Prices',
        'How much is tuition?'
      ]
    },
    ru: {
      title: 'ST DANCE STUDIO',
      subtitle: 'Студия спортивных и бальных танцев в Батуми',
      videoTitle: 'Лента Instagram (@stdancestudio)',
      aiTitle: 'ST Dance AI',
      aiTag: 'AI Помощник',
      aiSuggestions: [
        'Что предлагаете?',
        'Записать меня',
        'Расписание и цены',
        'Сколько стоит обучение?'
      ]
    }
  }

  const t = content[lang] || content.ka

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

          {/* TOP PRIMARY NAVIGATION MENU GRID */}
          <div className="bio-header-nav-grid">
            <button
              className="bio-header-nav-btn highlight"
              onClick={() => setIsRegModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{lang === 'ka' ? 'რეგისტრაცია' : lang === 'en' ? 'Register' : 'Регистрация'}</span>
            </button>

            <button
              className="bio-header-nav-btn"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{lang === 'ka' ? 'განრიგი & ფასები' : lang === 'en' ? 'Schedule & Prices' : 'Расписание и цены'}</span>
            </button>

            <button
              className="bio-header-nav-btn"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{lang === 'ka' ? 'მისამართი' : lang === 'en' ? 'Address' : 'Адрес'}</span>
            </button>

            <button
              className="bio-header-nav-btn"
              onClick={() => setIsContactModalOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
              </svg>
              <span>{lang === 'ka' ? 'კონტაქტები' : lang === 'en' ? 'Contacts' : 'Контакты'}</span>
            </button>
          </div>
        </header>

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

          {/* Extended Height Chat Messages Viewport for Visible History */}
          <div className="ai-chat-viewport tall" ref={chatViewportRef}>
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
              onFocus={(e) => {
                try {
                  e.target.focus({ preventScroll: true })
                } catch (err) {}
              }}
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

        {/* NATIVE INSTAGRAM PROFILE 3-COLUMN GRID SHOWCASE */}
        <section className="bio-insta-native-section">
          {/* Header Bar */}
          <div className="insta-profile-header">
            <div className="insta-profile-left">
              <img
                src="/images/logo-transparent.png"
                alt="ST Dance Studio Instagram Avatar"
                className="insta-profile-avatar"
              />
              <div>
                <div className="insta-username">stdancestudio</div>
                <div className="insta-subtext">ST Dance Studio Batumi</div>
              </div>
            </div>

            <a
              href="https://www.instagram.com/stdancestudio/"
              target="_blank"
              rel="noopener noreferrer"
              className="insta-follow-btn"
            >
              Instagram ➔
            </a>
          </div>

          {/* Instagram View Tabs (Grid, Reels, Tagged) */}
          <div className="insta-tabs-bar">
            <button
              className={`insta-tab-icon ${activeInstaTab === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveInstaTab('grid')}
              title="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>

            <button
              className={`insta-tab-icon ${activeInstaTab === 'reels' ? 'active' : ''}`}
              onClick={() => setActiveInstaTab('reels')}
              title="Reels View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>

            <button
              className={`insta-tab-icon ${activeInstaTab === 'tagged' ? 'active' : ''}`}
              onClick={() => setActiveInstaTab('tagged')}
              title="Tagged Photos"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          </div>

          {/* 3-COLUMN INSTAGRAM POSTS GRID */}
          <div className="insta-3col-grid">
            {instaGridItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="insta-grid-item"
              >
                <img src={item.img} alt={`ST Dance Studio Post ${item.id}`} className="insta-grid-img" />
                
                {/* Reel / Multi-photo Icon Badge */}
                <div className="insta-type-icon">
                  {item.type === 'reel' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  ) : item.type === 'carousel' ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="2" width="16" height="16" rx="2"></rect>
                      <path d="M22 6v14a2 2 0 0 1-2 2H6"></path>
                    </svg>
                  ) : null}
                </div>

                {/* Hover Overlay */}
                <div className="insta-grid-hover-overlay">
                  <div className="insta-hover-stat">
                    <span>♥</span> {item.likes}
                  </div>
                  <div className="insta-hover-stat">
                    <span>💬</span> {item.comments}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer Direct Profile CTA */}
          <a
            href="https://www.instagram.com/stdancestudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="insta-full-feed-link"
          >
            <span>იხილეთ ყველა პოსტი & რილსი Instagram-ზე (@stdancestudio) ➔</span>
          </a>
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

      {/* 1. INLINE CONTACTS MODAL */}
      {isContactModalOpen && (
        <div className="bio-modal-overlay" onClick={() => setIsContactModalOpen(false)}>
          <div className="bio-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="bio-modal-close" onClick={() => setIsContactModalOpen(false)}>
              ✕
            </button>

            <div className="bio-modal-header">
              <h2 className="bio-modal-title">სტუდიის კონტაქტები</h2>
              <p className="bio-modal-sub">დაგვიკავშირდით სასურველი არხით</p>
            </div>

            <div className="bio-contact-modal-list">
              {/* 1. Phone */}
              <a href="tel:+995514199966" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">ტელეფონის ნომერი</div>
                  <div className="bio-contact-sub">+995 514 19 99 66</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>

              {/* 2. WhatsApp */}
              <a href="https://wa.me/995514199966" target="_blank" rel="noopener noreferrer" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">WhatsApp</div>
                  <div className="bio-contact-sub">პირდაპირი მიმოწერა</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>

              {/* 3. Telegram */}
              <a href="https://t.me/stdancestudio" target="_blank" rel="noopener noreferrer" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">Telegram</div>
                  <div className="bio-contact-sub">@stdancestudio</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>

              {/* 4. Instagram */}
              <a href="https://www.instagram.com/stdancestudio/" target="_blank" rel="noopener noreferrer" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">Instagram</div>
                  <div className="bio-contact-sub">@stdancestudio</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>

              {/* 5. Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">Facebook</div>
                  <div className="bio-contact-sub">ST Dance Studio</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>

              {/* 6. Threads */}
              <a href="https://www.threads.net/@stdancestudio" target="_blank" rel="noopener noreferrer" className="bio-contact-item">
                <div className="bio-contact-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4"></path>
                  </svg>
                </div>
                <div className="bio-contact-info">
                  <div className="bio-contact-title">Threads</div>
                  <div className="bio-contact-sub">@stdancestudio</div>
                </div>
                <div className="bio-contact-arrow">➔</div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. INLINE LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="bio-modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
          <div className="bio-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="bio-modal-close" onClick={() => setIsLocationModalOpen(false)}>
              ✕
            </button>

            <div className="bio-modal-header">
              <h2 className="bio-modal-title">სტუდიის მისამართი</h2>
              <p className="bio-modal-sub">ST Dance Studio Batumi</p>
            </div>

            <div className="bio-location-content">
              <div className="bio-loc-address-box">
                <div className="bio-loc-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <div className="bio-loc-address-title">ქ. ბათუმი, ექვთიმე თაყაიშვილის №55</div>
                  <div className="bio-loc-address-desc">
                    3-სართულიანი თეთრი შენობის მე-3 სართული (შესასვლელი ბალოტისფერი სახლის ჭიშკრიდან).
                  </div>
                </div>
              </div>

              {/* Embedded Small Map Frame */}
              <div className="bio-loc-map-frame">
                <iframe
                  src="https://maps.google.com/maps?q=E.%20Takaishvili%2055,%20Batumi&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="210"
                  style={{ border: 0, borderRadius: '14px', filter: 'grayscale(0.8) invert(0.9) contrast(1.2)' }}
                  allowFullScreen=""
                  loading="lazy"
                  title="ST Dance Studio Location Map"
                ></iframe>
              </div>

              <a
                href="https://maps.app.goo.gl/iyBGVtNeiNUGZmq86"
                target="_blank"
                rel="noopener noreferrer"
                className="bio-form-submit-btn"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '1rem' }}
              >
                Google Maps-ში გახსნა ➔
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. INLINE SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="bio-modal-overlay" onClick={() => setIsScheduleModalOpen(false)}>
          <div className="bio-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="bio-modal-close" onClick={() => setIsScheduleModalOpen(false)}>
              ✕
            </button>

            <div className="bio-modal-header">
              <h2 className="bio-modal-title">ჯგუფების განრიგი & ფასები</h2>
              <p className="bio-modal-sub">ST Dance Studio Batumi</p>
            </div>

            <div className="bio-schedule-list">
              {studioGroupsList.map((g, idx) => (
                <div key={idx} className="bio-sched-card">
                  <div className="bio-sched-content">
                    <div className="bio-sched-group-name">{g.name}</div>
                    
                    {/* SVG Icon for Age */}
                    <div className="bio-sched-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>{g.age}</span>
                    </div>

                    {/* SVG Icon for Days/Hours */}
                    <div className="bio-sched-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{g.days}</span>
                    </div>

                    {/* SVG Icon for Price */}
                    <div className="bio-sched-meta-item price">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M6 12h.01M18 12h.01"></path>
                      </svg>
                      <span>{g.price}</span>
                    </div>
                  </div>

                  <button
                    className="bio-sched-reg-btn"
                    onClick={() => {
                      setRegForm({ ...regForm, shift: g.val })
                      setIsScheduleModalOpen(false)
                      setIsRegModalOpen(true)
                    }}
                  >
                    ჩაწერა ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. INLINE REGISTRATION MODAL */}
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
