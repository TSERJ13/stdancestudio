/**
 * ST DANCE STUDIO — Live 11-Month Interactive Calendar Engine
 * August 24, 2026 – July 15, 2027 (Detailed 11-Month Progression)
 */

export const HOLIDAYS_MAP = {
  // Winter Break
  '2026-12-28': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Break', ru: '🎄 Зимние каникулы' },
  '2026-12-29': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Break', ru: '🎄 Зимние каникулы' },
  '2026-12-30': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Break', ru: '🎄 Зимние каникулы' },
  '2026-12-31': { ka: '✨ ახალი წლის ევა', en: '✨ New Year Eve', ru: '✨ Новый Год' },
  '2027-01-01': { ka: '🎉 ახალი წელი', en: '🎉 New Year Day', ru: '🎉 Новый Год' },
  '2027-01-02': { ka: '🎉 ბედობა', en: '🎉 Bedoba', ru: '🎉 Бедоба' },
  '2027-01-07': { ka: '🕊️ ქრისტეს შობა', en: '🕊️ Christmas Day', ru: '🕊️ Рождество' },
  '2027-01-08': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Break', ru: '🎄 Зимние каникулы' },
  '2027-01-09': { ka: '🎄 ზამთრის არდადეგები', en: '🎄 Winter Break', ru: '🎄 Зимние каникулы' },
  '2027-01-10': { ka: '🎄 არდადეგების ბოლო დღე', en: '🎄 Vacation Last Day', ru: '🎄 Последний день каникул' },

  // Official Holidays
  '2027-03-03': { ka: '🇬🇪 დედის დღე (უქმე)', en: "🇬🇪 Mother's Day (Off)", ru: '🇬🇪 День Матери (Выходной)' },
  '2027-03-08': { ka: '🇬🇪 ქალთა საერთაშორისო დღე', en: "🇬🇪 Women's Day (Off)", ru: '🇬🇪 Женский день (Выходной)' },
  '2027-04-09': { ka: '🇬🇪 9 აპრილი — ეროვნული ერთიანობის დღე', en: '🇬🇪 April 9 Unity Day', ru: '🇬🇪 9 Апреля День Единства' },
  '2027-04-30': { ka: '✝️ წითელი პარასკევი (აღდგომის უქმეები)', en: '✝️ Good Friday (Easter)', ru: '✝️ Страстная Пятница' },
  '2027-05-01': { ka: '✝️ დიდი შაბათი (აღდგომის უქმეები)', en: '✝️ Holy Saturday (Easter)', ru: '✝️ Великая Суббота' },
  '2027-05-02': { ka: '✝️ აღდგომის ბრწყინვალე დღესასწაული', en: '✝️ Easter Sunday', ru: '✝️ Светлое Воскресение' },
  '2027-05-03': { ka: '✝️ მიცვალებულთა მოხსენიების დღე', en: '✝️ Easter Monday', ru: '✝️ Светлый Понедельник' },
  '2027-05-09': { ka: '🇬🇪 9 მაისი — გამარჯვების დღე', en: '🇬🇪 Victory Day', ru: '🇬🇪 9 Мая День Победы' },
  '2027-05-12': { ka: '🇬🇪 წმ. ანდრია პირველწოდებულის დღე', en: "🇬🇪 St. Andrew's Day", ru: '🇬🇪 День Св. Андрея' },
  '2027-05-26': { ka: '🇬🇪 საქართველოს დამოუკიდებლობის დღე', en: '🇬🇪 Independence Day', ru: '🇬🇪 День Независимости' }
}

export const TOURNAMENTS_MAP = {
  '2026-08-24': { ka: '🚀 2026-2027 სეზონის ოფიციალური სტარტი (24 აგვისტო)!', en: '🚀 Season 2026-2027 Official Opening (Aug 24)!', ru: '🚀 Официальный старт сезона 2026-2027 (24 Авг)!' },
  '2026-11-15': { ka: '🏆 ქუთაისისა & თბილისის თასი (ეროვნული ტურნირი)', en: '🏆 Kutaisi & Tbilisi National Cup', ru: '🏆 Кубок Кутаиси и Тбилиси' },
  '2026-12-20': { ka: '🏆 წლის დასკვნითი საახალწლო თასი 2026', en: '🏆 Year-End Christmas Cup 2026', ru: '🏆 Новогодний финал года 2026' },
  '2027-01-11': { ka: '✨ სწავლის განახლება & საზამთრო სტარტი', en: '✨ Resuming Classes & Winter Start', ru: '✨ Возобновление занятий' },
  '2027-01-24': { ka: '🎓 WDSF საერთაშორისო მასტერკლასები', en: '🎓 WDSF International Masterclasses', ru: '🎓 Международные мастер-классы WDSF' },
  '2027-02-14': { ka: '🏆 აჭარის ღია ჩემპიონატი 2027', en: '🏆 Adjara Open Championship 2027', ru: '🏆 Открытый Чемпионат Аджарии 2027' },
  '2027-03-21': { ka: '🏆 საგაზაფხულო თასი (Spring Dance Cup)', en: '🏆 Spring Dance Cup 2027', ru: '🏆 Весенний Кубок 2027' },
  '2027-04-25': { ka: '🏆 გასვლითი სატურნირო თასი (თბილისი)', en: '🏆 Away Tournament Cup (Tbilisi)', ru: '🏆 Выездной кубок (Тбилиси)' },
  '2027-05-23': { ka: '🏆 კავკასიის თასი 2027 (Caucasus Cup)', en: '🏆 Caucasus Cup 2027', ru: '🏆 Кубок Кавказа 2027' },
  '2027-07-15': { ka: '🏆 Batumi Open 2027 & სეზონის გრანდიოზული ფინალი!', en: '🏆 Batumi Open 2027 & Grand Season Finale!', ru: '🏆 Batumi Open 2027 и Грандиозный финал сезона!' }
}

export const GROUPS_INFO = [
  { id: 'baby_bronze', ka: '👶 Baby & ბრონზა (4.5 - 7 წ)', en: '👶 Baby & Bronze (4.5 - 7 yrs)', ru: '👶 Baby и Бронза (4.5 - 7 лет)', color: '#cd7f32' },
  { id: 'presilver_silver', ka: '🥈 Pre-Silver & Silver (H კლასი)', en: '🥈 Pre-Silver & Silver (H Class)', ru: '🥈 Pre-Silver и Silver (H Класс)', color: '#c0c0c0' },
  { id: 'golden', ka: '🏆 Golden (E, D, C კლასები)', en: '🏆 Golden (E, D, C Classes)', ru: '🏆 Golden (E, D, C Классы)', color: '#d4af37' },
  { id: 'couples_hobby', ka: '💃 წყვილები & Hobby Class', en: '💃 Couples & Hobby Class', ru: '💃 Пары и Hobby Class', color: '#e1306c' }
]

/**
 * Detailed Month-by-Month WDSF Curriculum Progression (11 Months: Aug 24, 2026 - Jul 15, 2027)
 */
export const MONTHLY_WDSF_CURRICULUM = {
  '2026-08': {
    baby_bronze: {
      figsKa: 'Rise & Fall ბაზა, Closed Changes (Right)',
      figsEn: 'Rise & Fall Base, Closed Changes (Right)',
      figsRu: 'Rise & Fall База, Closed Changes (Правый)',
      goalKa: 'სეზონის სტარტი: დგომის (Posture) და რიტმის ბაზის ჩამოყალიბება',
      goalEn: 'Season Start: Establishing posture & rhythm baseline',
      goalRu: 'Старт сезона: Постановка осанки и базового ритма'
    },
    presilver_silver: {
      figsKa: 'Waltz Posture, Natural Turn, Cha-Cha Time Step',
      figsEn: 'Waltz Posture, Natural Turn, Cha-Cha Time Step',
      figsRu: 'Стойка Вальса, Natural Turn, Time Step',
      goalKa: 'სტანდარტის ჩარჩოს (Frame) და ლათინოს თეძოს მუშაობის აღდგენა',
      goalEn: 'Restoring Standard frame and Latin hip action',
      goalRu: 'Восстановление рамки Стандарта и работы бедер'
    },
    golden: {
      figsKa: 'WDSF Body Isolations, Waltz Closed Changes, Cha-Cha Basic',
      figsEn: 'WDSF Body Isolations, Waltz Closed Changes, Cha-Cha Basic',
      figsRu: 'Изоляции тела WDSF, Базовый Вальс и Ча-Ча-Ча',
      goalKa: 'სატურნირო ფიზიკური კონდიციების აღდგენის სტარტი',
      goalEn: 'Kickstarting competition physical conditioning',
      goalRu: 'Старт восстановления турнирной формы'
    },
    couples_hobby: {
      figsKa: 'Partner Connection & Lead/Follow Principles',
      figsEn: 'Partner Connection & Lead/Follow Principles',
      figsRu: 'Контакт в паре и ведение',
      goalKa: 'წყვილში კავშირისა და ჰარმონიული მოძრაობის ბაზა',
      goalEn: 'Establishing partner connection baseline',
      goalRu: 'Базовый контакт и гармония в паре'
    }
  },
  '2026-09': {
    baby_bronze: {
      figsKa: 'Closed Changes (Left), Natural Turn, Cha-Cha Time Step',
      figsEn: 'Closed Changes (Left), Natural Turn, Time Step',
      figsRu: 'Closed Changes (Левый), Natural Turn, Time Step',
      goalKa: 'ვალსისა და ჩა-ჩა-ჩას პირველი ძირითადი ფიგურების ათვისება',
      goalEn: 'Mastering core Waltz & Cha-Cha figures',
      goalRu: 'Освоение основных фигур Вальса и Ча-Ча'
    },
    presilver_silver: {
      figsKa: 'Whisk, Chasse from PP, New York, Hand to Hand',
      figsEn: 'Whisk, Chasse from PP, New York, Hand to Hand',
      figsRu: 'Whisk, Chasse from PP, New York, Hand to Hand',
      goalKa: 'სალონური ფიგურების სიზუსტე და მუსიკალური დათვლა',
      goalEn: 'Precision in ballroom figures & musical timing',
      goalRu: 'Точность бальных фигур и ритмический счет'
    },
    golden: {
      figsKa: 'Tango Walk, Progressive Link, Samba Whisks, Bota Fogos',
      figsEn: 'Tango Walk, Progressive Link, Samba Whisks, Bota Fogos',
      figsRu: 'Танго Шаги, Progressive Link, Самба Whisks, Bota Fogos',
      goalKa: 'ტანგოსა და სამბას ტექნიკური იზოლაციის დახვეწა',
      goalEn: 'Technical isolation in Tango & Samba',
      goalRu: 'Техническая отработка Танго и Самбы'
    },
    couples_hobby: {
      figsKa: 'Waltz Natural Turn, Cha-Cha New York',
      figsEn: 'Waltz Natural Turn, Cha-Cha New York',
      figsRu: 'Правый поворот Вальса, Нью-Йорк в Ча-Ча',
      goalKa: 'წყვილში თავდაჯერებული სვლა პარკეტზე',
      goalEn: 'Confident floor movement in couples',
      goalRu: 'Уверенное движение пары по паркету'
    }
  },
  '2026-10': {
    baby_bronze: {
      figsKa: 'Reverse Turn, Cha-Cha Basic Movement',
      figsEn: 'Reverse Turn, Cha-Cha Basic Movement',
      figsRu: 'Обратный поворот, Основное движение Ча-Ча',
      goalKa: 'მოხვევითი მოძრაობებისა და თეძოს როტაციის განვითარება',
      goalEn: 'Developing turning actions & hip rotation',
      goalRu: 'Развитие вращений и ротации бедер'
    },
    presilver_silver: {
      figsKa: 'Quickstep Quarter Turn, Progressive Chasse, Jive Fallaway Rock',
      figsEn: 'Quickstep Quarter Turn, Progressive Chasse, Jive Fallaway Rock',
      figsRu: 'Четвертной поворот Квикстепа, Fallaway Rock в Джайве',
      goalKa: 'ქვიქსტეპისა და ჯაივის დინამიური ტემპის დაჭერა',
      goalEn: 'Capturing dynamic tempo in Quickstep & Jive',
      goalRu: 'Динамичный темп Квикстепа и Джайва'
    },
    golden: {
      figsKa: 'Tango Closed Promenade, Back Corte, Samba Voltas',
      figsEn: 'Tango Closed Promenade, Back Corte, Samba Voltas',
      figsRu: 'Танго Променад, Back Corte, Вольты в Самбе',
      goalKa: 'ლათინო ამერიკული ცეკვების რიტმული აქცენტების გამოკვეთა',
      goalEn: 'Highlighting Latin rhythmic accents & speed',
      goalRu: 'Выделение ритмических акцентов Латины'
    },
    couples_hobby: {
      figsKa: 'Closed Promenade, Spot Turns',
      figsEn: 'Closed Promenade, Spot Turns',
      figsRu: 'Закрытый променад, Повороты на месте',
      goalKa: 'წყვილის იდეალური სინქრონიზაცია',
      goalEn: 'Achieving ideal partner synchronization',
      goalRu: 'Идеальная синхронизация пары'
    }
  },
  '2026-11': {
    baby_bronze: {
      figsKa: 'Spot Turn, Hand to Hand (ქუთაისისა & თბილისის თასის მზადება)',
      figsEn: 'Spot Turn, Hand to Hand (National Cup Prep)',
      figsRu: 'Spot Turn, Hand to Hand (Подготовка к кубку)',
      goalKa: 'პირველი ეროვნული ტურნირისთვის საცენო ფორმის მიღწევა',
      goalEn: 'Reaching stage form for first national cup',
      goalRu: 'Выход на сцену первого национального турнира'
    },
    presilver_silver: {
      figsKa: 'Forward Lock Step, Alemana, Jive Fallaway Throwaway',
      figsEn: 'Forward Lock Step, Alemana, Jive Fallaway Throwaway',
      figsRu: 'Forward Lock Step, Alemana, Fallaway Throwaway',
      goalKa: '4 ცეკვის შეუჩერებელი სატურნირო პრაგონი',
      goalEn: 'Non-stop 4-dance competition routine run',
      goalRu: 'Безостановочный прогон 4 танцев'
    },
    golden: {
      figsKa: 'Open Promenade, Five Step, Solo Spot Voltas, Rumba Basics',
      figsEn: 'Open Promenade, Five Step, Solo Spot Voltas, Rumba Basics',
      figsRu: 'Open Promenade, Five Step, Вольты, Базовый Румба',
      goalKa: 'ეროვნულ ტურნირებზე საპრიზო ადგილების დაკავება',
      goalEn: 'Securing top podium placements at national cups',
      goalRu: 'Завоевание призовых мест на национальном кубке'
    },
    couples_hobby: {
      figsKa: '4-Dance Routine Cleaning',
      figsEn: '4-Dance Routine Cleaning',
      figsRu: 'Чистка схем 4 танцев',
      goalKa: 'საცეკვაო სქემების სრული გასუფთავება',
      goalEn: 'Complete routine cleanup & presentation',
      goalRu: 'Полная чистка танцевальных схем'
    }
  },
  '2026-12': {
    baby_bronze: {
      figsKa: 'Full 2-Dance Routine Clean-up (წლის დასკვნითი თასი)',
      figsEn: 'Full 2-Dance Clean-up (Year-End Cup)',
      figsRu: 'Чистка 2 танцев (Финал года)',
      goalKa: 'საახალწლო ტურნირზე 100%-იანი შედეგის ჩვენება',
      goalEn: 'Achieving 100% score at Year-End Christmas Cup',
      goalRu: '100% результат на Новогоднем кубке'
    },
    presilver_silver: {
      figsKa: 'Impetus Turn, Outside Change, Hockey Stick, American Spin',
      figsEn: 'Impetus Turn, Outside Change, Hockey Stick, American Spin',
      figsRu: 'Impetus Turn, Outside Change, Hockey Stick, American Spin',
      goalKa: 'H-კლასის რთული ფიგურების იდეალური შესრულება',
      goalEn: 'Flawless execution of H-Class WDSF figures',
      goalRu: 'Идеальное исполнение фигур Н-класса'
    },
    golden: {
      figsKa: 'Full 6-8 Dance Competition Routines & Non-Stop Music Practice',
      figsEn: 'Full 6-8 Dance Competition Routines & Non-Stop Runs',
      figsRu: 'Прогоны 6-8 танцев под музыку',
      goalKa: 'წლის ფინალურ ტურნირზე ჩემპიონობის მოპოვება',
      goalEn: 'Claiming championship titles at Year-End Finale',
      goalRu: 'Завоевание чемпионства на финале года'
    },
    couples_hobby: {
      figsKa: 'Social Ballroom Showcase',
      figsEn: 'Social Ballroom Showcase',
      figsRu: 'Шоу-прогон бальной программы',
      goalKa: 'საახალწლო შოუ-პროგრამის წარმატებული ჩვენება',
      goalEn: 'Successful performance at Christmas Gala Showcase',
      goalRu: 'Успешное выступление на Новогоднем Шоу'
    }
  },
  '2027-01': {
    baby_bronze: {
      figsKa: 'Hesitation Change, Cha-Cha Lock Steps (საზამთრო სტარტი)',
      figsEn: 'Hesitation Change, Cha-Cha Lock Steps',
      figsRu: 'Hesitation Change, Лок-степы в Ча-Ча',
      goalKa: 'ზამთრის არდადეგების შემდეგ ტონუსის სწრაფი აღდგენა',
      goalEn: 'Rapid tone recovery after winter break',
      goalRu: 'Быстрое восстановление формы после каникул'
    },
    presilver_silver: {
      figsKa: 'Natural Spin Turn, Three Cha-Chas, Change of Places',
      figsEn: 'Natural Spin Turn, Three Cha-Chas, Change of Places',
      figsRu: 'Natural Spin Turn, Три Ча-Ча-Ча, Change of Places',
      goalKa: 'WDSF საერთაშორისო მასტერკლასების მასალის ათვისება',
      goalEn: 'Integrating WDSF international masterclass content',
      goalRu: 'Освоение материала мастер-классов WDSF'
    },
    golden: {
      figsKa: 'Viennese Waltz Natural & Reverse Fleckerls, Paso Doble Huit',
      figsEn: 'Viennese Waltz Fleckerls, Paso Doble Huit',
      figsRu: 'Флекерлы Венского Вальса, Пасодобль Huit',
      goalKa: 'WDSF საერთაშორისო პედაგოგების მასტერკლასებზე უმაღლესი შეფასება',
      goalEn: 'Earning top marks at international masterclasses',
      goalRu: 'Высшая оценка на международных мастер-классах'
    },
    couples_hobby: {
      figsKa: 'Slow Foxtrot Feather Step & Three Step',
      figsEn: 'Slow Foxtrot Feather Step & Three Step',
      figsRu: 'Перо и Три шага в Медленном Фокстроте',
      goalKa: 'ფოქსტროტის ნაზი და უწყვეტი სვლის ათვისება',
      goalEn: 'Mastering smooth continuous Foxtrot action',
      goalRu: 'Освоение плавного хода Фокстрота'
    }
  },
  '2027-02': {
    baby_bronze: {
      figsKa: 'Chasse to Right, Cuban Breaks (აჭარის ჩემპიონატის მზადება)',
      figsEn: 'Chasse to Right, Cuban Breaks (Adjara Open Prep)',
      figsRu: 'Шассе вправо, Кубинские брейки',
      goalKa: 'აჭარის ღია ჩემპიონატზე ოქროს მედლების მოპოვება',
      goalEn: 'Winning gold medals at Adjara Open Championship',
      goalRu: 'Завоевание золотых медалей на Чемпионате Аджарии'
    },
    presilver_silver: {
      figsKa: 'Quickstep Chasse Turn, Jive Stop and Go',
      figsEn: 'Quickstep Chasse Turn, Jive Stop and Go',
      figsRu: 'Поворот Шассе в Квикстепе, Stop and Go в Джайве',
      goalKa: 'მაღალი სიჩქარისა და ენერგიის მართვა ჩემპიონატზე',
      goalEn: 'Managing high speed and energy at championship',
      goalRu: 'Управление высокой скоростью и энергией'
    },
    golden: {
      figsKa: 'Foxtrot Feather Finish, Paso Doble Counter Promenade',
      figsEn: 'Foxtrot Feather Finish, Paso Doble Counter Promenade',
      figsRu: 'Перо-финиш в Фокстроте, Контр-променад Пасодобля',
      goalKa: 'აჭარის ჩემპიონის ტიტულის დაცვა',
      goalEn: 'Defending Adjara Champion title',
      goalRu: 'Защита титула Чемпиона Аджарии'
    },
    couples_hobby: {
      figsKa: 'Speed & Rhythm Acceleration',
      figsEn: 'Speed & Rhythm Acceleration',
      figsRu: 'Ускорение темпа и ритма',
      goalKa: 'ტემპის აჩქარებისას წყვილის სტაბილურობის შენარჩუნება',
      goalEn: 'Maintaining couple balance during speedup',
      goalRu: 'Сохранение баланса пары при ускорении'
    }
  },
  '2027-03': {
    baby_bronze: {
      figsKa: 'Reverse Corte, Sweetheart',
      figsEn: 'Reverse Corte, Sweetheart',
      figsRu: 'Обратное Корте, Sweetheart',
      goalKa: 'საგაზაფხულო თასისთვის ფიგურების სიზუსტე',
      goalEn: 'Figure accuracy for Spring Dance Cup',
      goalRu: 'Точность фигур к Весеннему кубку'
    },
    presilver_silver: {
      figsKa: 'Weave from PP, Natural Turn with Hesitation, Opening Out',
      figsEn: 'Weave from PP, Natural Turn with Hesitation, Opening Out',
      figsRu: 'Плетение из ПП, Правый поворот с задержкой',
      goalKa: 'AJS (Absolute Judging System) კრიტერიუმებში მაღალი ქულების მიღება',
      goalEn: 'Scoring top AJS marks in technical Execution',
      goalRu: 'Высокие баллы AJS в техническом исполнении'
    },
    golden: {
      figsKa: 'AJS Judging Criteria & High Speed Isolations',
      figsEn: 'AJS Judging Criteria & High Speed Isolations',
      figsRu: 'Критерии оценки AJS и высокоскоростные изоляции',
      goalKa: 'AJS შეფასების სისტემის 4-ვე კომპონენტის პიკი',
      goalEn: 'Peak scoring across all 4 AJS judging pillars',
      goalRu: 'Пиковые оценки по всем 4 критериям AJS'
    },
    couples_hobby: {
      figsKa: 'Styling & Expression',
      figsEn: 'Styling & Expression',
      figsRu: 'Стилистика и эмоции',
      goalKa: 'სცენური არტისტისტულობისა და ემოციის გაღრმავება',
      goalEn: 'Deepening artistic expression & partnership',
      goalRu: 'Углубление артистизма и эмоциональности'
    }
  },
  '2027-04': {
    baby_bronze: {
      figsKa: 'Full Silver Transition Figures (გასვლითი ტურნირის მზადება)',
      figsEn: 'Full Silver Transition Figures (Away Cup Prep)',
      figsRu: 'Переходные фигуры Серебра',
      goalKa: 'გასვლით ტურნირზე (თბილისი) უშეცდომო გამოსვლა',
      goalEn: 'Flawless performance at Away Tournament (Tbilisi)',
      goalRu: 'Безупречное выступление на выездном кубке'
    },
    presilver_silver: {
      figsKa: 'Telemark, Open Telemark, Spiral, Windmill',
      figsEn: 'Telemark, Open Telemark, Spiral, Windmill',
      figsRu: 'Телемарк, Открытый Телемарк, Спираль, Мельница',
      goalKa: 'რთული WDSF ფიგურების დინამიური დაკავშირება',
      goalEn: 'Dynamic linking of complex WDSF figures',
      goalRu: 'Динамичное связывание сложных фигур WDSF'
    },
    golden: {
      figsKa: 'High-Level Open Choreography & Dynamic Tempo Changes',
      figsEn: 'High-Level Open Choreography & Dynamic Tempo Changes',
      figsRu: 'Сложная открытая хореография и смена темпа',
      goalKa: 'საერთაშორისო დონის ღია ქორეოგრაფიის პრაგონი',
      goalEn: 'Executing international open choreography',
      goalRu: 'Исполнение открытой хореографии международного уровня'
    },
    couples_hobby: {
      figsKa: 'Advanced Partnering',
      figsEn: 'Advanced Partnering',
      figsRu: 'Продвинутое взаимодействие в паре',
      goalKa: 'წყვილში უსიტყვო გაგება და მსუბუქი სვლა',
      goalEn: 'Effortless partner response and movement',
      goalRu: 'Легкость и взаимопонимание в паре'
    }
  },
  '2027-05': {
    baby_bronze: {
      figsKa: 'Peak Performance Routine Run (კავკასიის თასი 2027)',
      figsEn: 'Peak Performance Routine Run (Caucasus Cup 2027)',
      figsRu: 'Пиковый прогон (Кубок Кавказа 2027)',
      goalKa: 'კავკასიის თასზე 2027 გრანდიოზული გამარჯვება',
      goalEn: 'Grand victory at Caucasus Cup 2027',
      goalRu: 'Грандиозная победа на Кубке Кавказа 2027'
    },
    presilver_silver: {
      figsKa: 'Caucasus Cup 4-Dance Non-Stop Finals',
      figsEn: 'Caucasus Cup 4-Dance Non-Stop Finals',
      figsRu: 'Безостановочные финалы 4 танцев на Кубке Кавказа',
      goalKa: 'კავკასიის თასის ჩემპიონის ოქროს თასის მოპოვება',
      goalEn: 'Capturing Caucasus Cup Gold Trophy',
      goalRu: 'Завоевание Главного Кубка Кавказа'
    },
    golden: {
      figsKa: 'Caucasus Cup 10-Dance Non-Stop Finals',
      figsEn: 'Caucasus Cup 10-Dance Non-Stop Finals',
      figsRu: 'Финалы 10 танцев на Кубке Кавказа',
      goalKa: '10 ცეკვის აბსოლუტური ჩემპიონობა',
      goalEn: 'Absolute 10-Dance Championship title',
      goalRu: 'Титул Абсолютного Чемпиона 10 танцев'
    },
    couples_hobby: {
      figsKa: 'Showcase Routine Finals',
      figsEn: 'Showcase Routine Finals',
      figsRu: 'Финальный шоу-прогон',
      goalKa: 'კავკასიის თასის საპატიო შოუ-გამოსვლა',
      goalEn: 'Honorary showcase performance at Caucasus Cup',
      goalRu: 'Почетное шоу-выступление на Кубке Кавказа'
    }
  },
  '2027-06': {
    baby_bronze: {
      figsKa: 'Batumi Open 2027 Pre-Final Polishing',
      figsEn: 'Batumi Open 2027 Pre-Final Polishing',
      figsRu: 'Подготовка к Batumi Open 2027',
      goalKa: 'სეზონის მთავარი საერთაშორისო ფინალისთვის მზადება',
      goalEn: 'Preparation for season main international finale',
      goalRu: 'Подготовка к главному международному финалу'
    },
    presilver_silver: {
      figsKa: 'Batumi Open 2027 International Routine Cleaning',
      figsEn: 'Batumi Open 2027 International Routine Cleaning',
      figsRu: 'Чистка схем к Batumi Open 2027',
      goalKa: 'საერთაშორისო მსაჯების წინაშე უნაკლო ტექნიკა',
      goalEn: 'Flawless technique before international judges',
      goalRu: 'Безупречная техника перед международными судьями'
    },
    golden: {
      figsKa: 'Batumi Open 2027 WDSF World Ranking Finals Prep',
      figsEn: 'Batumi Open 2027 WDSF World Ranking Finals Prep',
      figsRu: 'Подготовка к WDSF Batumi Open 2027',
      goalKa: 'WDSF საერთაშორისო რეიტინგში მაღალი ადგილის დაკავება',
      goalEn: 'Securing top international WDSF ranking points',
      goalRu: 'Высокие позиции в мировом рейтинге WDSF'
    },
    couples_hobby: {
      figsKa: 'Grand Season Finale Routine',
      figsEn: 'Grand Season Finale Routine',
      figsRu: 'Финальная программа сезона',
      goalKa: 'სეზონის გრანდიოზული დასკვნითი ნომრის მომზადება',
      goalEn: 'Preparing grand season finale performance',
      goalRu: 'Подготовка грандиозного номера к финалу'
    }
  },
  '2027-07': {
    baby_bronze: {
      figsKa: '🏆 Batumi Open 2027 (15 ივლისის გრანდიოზული ფინალი!)',
      figsEn: '🏆 Batumi Open 2027 (July 15 Grand Finale!)',
      figsRu: '🏆 Batumi Open 2027 (Грандиозный финал 15 июля!)',
      goalKa: '15 ივლისი: Batumi Open 2027-ის ჩემპიონის ტიტული & სეზონის ტრიუმფი!',
      goalEn: 'July 15: Batumi Open 2027 Championship Title & Season Triumph!',
      goalRu: '15 Июля: Титул Чемпиона Batumi Open 2027 и Триумф Сезона!'
    },
    presilver_silver: {
      figsKa: '🏆 Batumi Open 2027 (15 ივლისის გრანდიოზული ფინალი!)',
      figsEn: '🏆 Batumi Open 2027 (July 15 Grand Finale!)',
      figsRu: '🏆 Batumi Open 2027 (Грандиозный финал 15 июля!)',
      goalKa: '15 ივლისი: Batumi Open 2027 H-კლასის ჩემპიონის ოქროს თასი!',
      goalEn: 'July 15: Batumi Open 2027 H-Class Gold Champion Trophy!',
      goalRu: '15 Июля: Золотой Кубок Чемпиона Batumi Open 2027 Н-Класса!'
    },
    golden: {
      figsKa: '🏆 Batumi Open 2027 (15 ივლისის გრანდიოზული ფინალი!)',
      figsEn: '🏆 Batumi Open 2027 (July 15 Grand Finale!)',
      figsRu: '🏆 Batumi Open 2027 (Грандиозный финал 15 июля!)',
      goalKa: '15 ივლისი: Batumi Open 2027 WDSF საერთაშორისო თასი & ჩემპიონობა!',
      goalEn: 'July 15: Batumi Open 2027 WDSF International Trophy & Title!',
      goalRu: '15 Июля: Международный Кубок WDSF Batumi Open 2027!'
    },
    couples_hobby: {
      figsKa: '🏆 Batumi Open 2027 (15 ივლისის გრანდიოზული ფინალი!)',
      figsEn: '🏆 Batumi Open 2027 (July 15 Grand Finale!)',
      figsRu: '🏆 Batumi Open 2027 (Грандиозный финал 15 июля!)',
      goalKa: '15 ივლისი: სეზონის საზეიმო ფინალური დაჯილდოება & გალა-კონცერტი!',
      goalEn: 'July 15: Grand Season Finale Awards Gala & Concert!',
      goalRu: '15 Июля: Торжественное награждение и гала-концерт сезона!'
    }
  }
}

/**
 * Returns true if the day of week is an official training day for the specified group
 */
export function isGroupTrainingDay(groupId, dayOfWeek) {
  if (groupId === 'baby_bronze') {
    return dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6 // Tue, Thu, Sat
  } else if (groupId === 'presilver_silver') {
    return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 // Mon, Wed, Fri
  } else if (groupId === 'golden') {
    return dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || dayOfWeek === 6 // Mon, Wed, Fri, Sat
  } else if (groupId === 'couples_hobby') {
    return dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5 // Mon - Fri
  }
  return false
}

/**
 * Returns macro-cycle phase details for a given date
 */
export function getMacroCyclePhase(dateStr) {
  if (dateStr >= '2026-08-24' && dateStr <= '2026-10-31') {
    return {
      num: 1,
      nameKa: 'I ეტაპი — ბაზის აღდგენა & ტექნიკური საძირკველი',
      nameEn: 'Phase I — Base Recovery & Technical Foundation',
      nameRu: 'I этап — Базовая техника и осанка',
      focusKa: 'ფეხის ტექნიკა (Footwork), დგომი (Posture) და WDSF ბაზისური ფიგურები.',
      focusEn: 'Footwork, Posture alignment, and core WDSF figure memorization.',
      focusRu: 'Техника стопы (Footwork), осанка (Posture) и базовые фигуры WDSF.'
    }
  } else if (dateStr >= '2026-11-01' && dateStr <= '2027-01-27') {
    return {
      num: 2,
      nameKa: 'II ეტაპი — სატურნირო გამძლეობა & პროგრამების გასუფთავება',
      nameEn: 'Phase II — Competition Stamina & Program Cleaning',
      nameRu: 'II этап — Турнирная выносливость и чистка программ',
      focusKa: 'ინტენსიური ფინალები (მუსიკაში შეუჩერებელი პრაგონი), სცენური ექსპრესია & ტურნირები.',
      focusEn: 'Intense non-stop music finals, stage presentation, and tournament readiness.',
      focusRu: 'Интенсивные прогоны под музыку, сценическая подача и подготовка к турнирам.'
    }
  } else if (dateStr >= '2027-01-28' && dateStr <= '2027-04-30') {
    return {
      num: 3,
      nameKa: 'III ეტაპი — დინამიკა, სიჩქარე & AJS შეფასების სისტემა',
      nameEn: 'Phase III — Dynamics, Speed & AJS Judging Criteria',
      nameRu: 'III этап — Динамика, скорость и система оценки AJS',
      focusKa: 'AJS (Absolute Judging System) კრიტერიუმები, ტემპის ცვლილებები & ენერგიის მართვა.',
      focusEn: 'AJS criteria, tempo acceleration, energy control, and choreography contrast.',
      focusRu: 'Критерии AJS, ускорение темпа, управление энергией и контрастность.'
    }
  } else {
    return {
      num: 4,
      nameKa: 'IV ეტაპი — 100% პიკური სატურნირო ფორმა (15 ივლისის ფინალი)',
      nameEn: 'Phase IV — 100% Peak Form (Final Push to July 15)',
      nameRu: 'IV этап — 100% Пиковая форма (Финал к 15 июля)',
      focusKa: 'კავკასიის თასისა და Batumi Open-ის უმაღლესი შედეგები, წყვილების სრული ჰარმონია.',
      focusEn: 'Maximum competition output for Caucasus Cup & Batumi Open grand finale.',
      focusRu: 'Максимальный результат на Кубке Кавказа и Batumi Open.'
    }
  }
}

/**
 * Returns exact daily lesson task for any date & group
 */
export function getDailyLessonTask(dateStr, groupId, lang = 'ka') {
  const dateObj = new Date(dateStr)
  const dayOfWeek = dateObj.getDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const monthKey = dateStr.substring(0, 7) // e.g. "2026-09"

  // Check out of range (< 2026-08-24 or > 2027-07-15)
  if (dateStr < '2026-08-24') {
    return {
      isLocked: true,
      title: lang === 'ka' ? '🔒 სეზონის სტარტამდე' : lang === 'ru' ? '🔒 До старта сезона' : '🔒 Before Season Start',
      desc: lang === 'ka' ? '2026-2027 სასწავლო სეზონი იწყება 24 აგვისტოს (ორშაბათი).' : lang === 'ru' ? 'Учебный сезон 2026-2027 начинается 24 августа (понедельник).' : 'The 2026-2027 season starts on August 24 (Monday).'
    }
  }
  if (dateStr > '2027-07-15') {
    return {
      isLocked: true,
      title: lang === 'ka' ? '🏆 სეზონი დასრულდა (ზაფხულის შესვენება)' : lang === 'ru' ? '🏆 Сезон завершен (Летний перерыв)' : '🏆 Season Completed (Summer Recess)',
      desc: lang === 'ka' ? '15 ივლისის Batumi Open-ის შემდეგ სტუდია გადის ზაფხულის არდადეგებზე 24 აგვისტომდე.' : lang === 'ru' ? 'После Batumi Open 15 июля студия уходит на летние каникулы до 24 августа.' : 'After July 15 Batumi Open, the studio enters summer recess until August 24.'
    }
  }

  // Check Official Holidays / Studio Off Days
  if (HOLIDAYS_MAP[dateStr]) {
    const h = HOLIDAYS_MAP[dateStr]
    return {
      isLocked: true,
      isHoliday: true,
      title: `🔒 ${h[lang] || h.ka}`,
      desc: lang === 'ka' ? 'სტუდია ჩაკეტილია — ოფიციალური უქმეები / არდადეგები. მეცადინეობები არ ტარდება.' : lang === 'ru' ? 'Студия закрыта — официальный праздник / каникулы. Занятий нет.' : 'Studio is closed for official holiday / vacation. No classes today.'
    }
  }

  // Check if this specific day of week is NOT a training day for this group
  if (!isGroupTrainingDay(groupId, dayOfWeek)) {
    return {
      isLocked: true,
      isOffDay: true,
      title: lang === 'ka' ? '🔒 ჩაკეტილია — ამ ჯგუფს დღეს მეცადინეობა არ აქვს' : lang === 'ru' ? '🔒 Закрыто — У этой группы нет занятия в этот день' : '🔒 Closed — No training for this group on this day',
      desc: lang === 'ka' ? 'ამ ჯგუფისთვის ეს დღე უქმეა. აირჩიეთ კალენდარში მონიშნული აქტიური მეცადინეობის დღეები.' : lang === 'ru' ? 'Для этой группы этот день свободный. Выберите активный день занятий в календаре.' : 'This day is an off-day for the selected group. Please select an active training day in the calendar.'
    }
  }

  const phase = getMacroCyclePhase(dateStr)
  const monthData = (MONTHLY_WDSF_CURRICULUM[monthKey] && MONTHLY_WDSF_CURRICULUM[monthKey][groupId]) || MONTHLY_WDSF_CURRICULUM['2026-09'][groupId]

  const figuresText = monthData[lang === 'ru' ? 'figsRu' : lang === 'en' ? 'figsEn' : 'figsKa']
  const goalText = monthData[lang === 'ru' ? 'goalRu' : lang === 'en' ? 'goalEn' : 'goalKa']

  // 1. Baby & Bronze (Tue, Thu, Sat)
  if (groupId === 'baby_bronze') {
    if (dayOfWeek === 2) {
      return {
        phase,
        danceName: lang === 'ka' ? 'ნელი ვალსი (Slow Waltz)' : lang === 'ru' ? 'Медленный Вальс (Slow Waltz)' : 'Slow Waltz',
        targetFigures: figuresText,
        breakdown: [
          { time: '15 წთ', text: lang === 'ka' ? 'გახურება & ფეხის ტექნიკა (Rise & Fall ბაზა)' : lang === 'ru' ? 'Разминка и техника стопы (Rise & Fall)' : 'Rise & Fall Footwork Drill' },
          { time: '30 წთ', text: lang === 'ka' ? `WDSF ფიგურების ახსნა: ${figuresText}` : lang === 'ru' ? `Фигуры WDSF: ${figuresText}` : `WDSF Figures: ${figuresText}` },
          { time: '15 წთ', text: lang === 'ka' ? 'ნელ მუსიკაში დახვეწა & წყვილში დგომი' : lang === 'ru' ? 'Отработка под музыку и баланс в паре' : 'Slow Music Practice & Posture Balance' }
        ],
        dailyGoal: goalText
      }
    } else if (dayOfWeek === 4) {
      return {
        phase,
        danceName: lang === 'ka' ? 'ჩა-ჩა-ჩა (Cha-Cha-Cha)' : lang === 'ru' ? 'Ча-Ча-Ча (Cha-Cha-Cha)' : 'Cha-Cha-Cha',
        targetFigures: figuresText,
        breakdown: [
          { time: '15 წთ', text: lang === 'ka' ? 'თეძოს ტექნიკა (Hip Action) & რიტმული დათვლა 2-3-4-&-1' : lang === 'ru' ? 'Работа бедер (Hip Action) и счет 2-3-4-&-1' : 'Hip Action & 2-3-4-&-1 Rhythm Drill' },
          { time: '30 წთ', text: lang === 'ka' ? `WDSF ფიგურები: ${figuresText}` : lang === 'ru' ? `Фигуры WDSF: ${figuresText}` : `WDSF Figures: ${figuresText}` },
          { time: '15 წთ', text: lang === 'ka' ? 'მუსიკაში დახვეწა & სცენური ღიმილი' : lang === 'ru' ? 'Отработка под музыку и подача' : 'Music Practice & Stage Expression' }
        ],
        dailyGoal: goalText
      }
    } else {
      // Saturday
      return {
        phase,
        danceName: lang === 'ka' ? 'ვალსი + ჩა-ჩა-ჩა (კომბინირებული შაბათი)' : lang === 'ru' ? 'Вальс + Ча-Ча-Ча (Субботний прогон)' : 'Waltz + Cha-Cha-Cha Combined',
        targetFigures: figuresText,
        breakdown: [
          { time: '20 წთ', text: lang === 'ka' ? 'OFP ფიზიკური მომზადება & გაწელვა' : lang === 'ru' ? 'ОФП физическая подготовка и растяжка' : 'Physical Conditioning & Stretching' },
          { time: '25 წთ', text: lang === 'ka' ? 'ნელი ვალსისა და ჩა-ჩა-ჩას კომბინაციები' : lang === 'ru' ? 'Комбинации Вальса и Ча-Ча-Ча' : 'Waltz & Cha-Cha-Cha Combinations' },
          { time: '15 წთ', text: lang === 'ka' ? 'შოუ-პრაგონი მშობლებისთვის' : lang === 'ru' ? 'Мини-прогон для родителей' : 'Mini Show Run' }
        ],
        dailyGoal: goalText
      }
    }
  }

  // 2. Pre-Silver & Silver (Mon, Wed, Fri)
  if (groupId === 'presilver_silver') {
    if (dayOfWeek === 1) {
      return {
        phase,
        danceName: lang === 'ka' ? 'სტანდარტი: ნელი ვალსი & ქვიქსტეპი' : lang === 'ru' ? 'Стандарт: Медленный Вальс и Квикстеп' : 'Standard: Slow Waltz & Quickstep',
        targetFigures: figuresText,
        breakdown: [
          { time: '15 წთ', text: lang === 'ka' ? 'სტანდარტის დგომი (Frame & Hold) & ფეხის ბალანსი' : lang === 'ru' ? 'Стойка Стандарта (Frame & Hold) и баланс' : 'Standard Hold & Balance Drill' },
          { time: '30 წთ', text: lang === 'ka' ? `WDSF ფიგურები: ${figuresText}` : lang === 'ru' ? `Фигуры WDSF: ${figuresText}` : `WDSF Figures: ${figuresText}` },
          { time: '15 წთ', text: lang === 'ka' ? 'პარკეტის ნავიგაცია & ტემპში პრაგონი' : lang === 'ru' ? 'Навигация по паркету и прогон в темпе' : 'Floor Craft & Tempo Run' }
        ],
        dailyGoal: goalText
      }
    } else if (dayOfWeek === 3) {
      return {
        phase,
        danceName: lang === 'ka' ? 'ლათინო: ჩა-ჩა-ჩა & ჯაივი' : lang === 'ru' ? 'Латина: Ча-Ча-Ча и Джайв' : 'Latin: Cha-Cha-Cha & Jive',
        targetFigures: figuresText,
        breakdown: [
          { time: '15 წთ', text: lang === 'ka' ? 'მუხლების სწრაფი მუშაობა & კორპუსის როტაცია' : lang === 'ru' ? 'Быстрая работа коленей и ротация корпуса' : 'Fast Knee Action & Weight Transfer' },
          { time: '30 წთ', text: lang === 'ka' ? `WDSF ფიგურები: ${figuresText}` : lang === 'ru' ? `Фигуры WDSF: ${figuresText}` : `WDSF Figures: ${figuresText}` },
          { time: '15 წთ', text: lang === 'ka' ? 'ენერგიული პრაგონი & სცენური კონტაქტი' : lang === 'ru' ? 'Энергичный прогон и сценический контакт' : 'High Energy Run & Stage Contact' }
        ],
        dailyGoal: goalText
      }
    } else {
      // Friday
      return {
        phase,
        danceName: lang === 'ka' ? '4-ვე ცეკვის სატურნირო პრაგონი (W, Q, CCC, J)' : lang === 'ru' ? 'Турнирный прогон 4 танцев (W, Q, CCC, J)' : '4-Dance Competition Run (W, Q, CCC, J)',
        targetFigures: figuresText,
        breakdown: [
          { time: '15 წთ', text: lang === 'ka' ? 'გახურება & დისციპლინა' : lang === 'ru' ? 'Разминка и дисциплина' : 'Warmup & Discipline' },
          { time: '35 წთ', text: lang === 'ka' ? '4 ცეკვის შეუჩერებელი ფინალები (1.30 წთ ცეკვაზე)' : lang === 'ru' ? 'Безостановочные финалы 4 танцев (по 1.30 мин)' : 'Non-stop 4-Dance Finals (1.30m each)' },
          { time: '10 წთ', text: lang === 'ka' ? 'მწვრთნელის შენიშვნების გარჩევა & კორექცია' : lang === 'ru' ? 'Разбор замечаний тренера' : 'Coach Feedback & Correction' }
        ],
        dailyGoal: goalText
      }
    }
  }

  // 3. Golden (Mon, Wed, Fri, Sat)
  if (groupId === 'golden') {
    if (dayOfWeek === 6) {
      // Saturday Intensive
      return {
        phase,
        danceName: lang === 'ka' ? '🏛️ შაბათის 120-წუთიანი ინტენსივი (საბალეტო კლასიკა, OFP & გაწელვა)' : lang === 'ru' ? '🏛️ Субботний 120-минутный интенсив' : '🏛️ Saturday 120-Min Intensive',
        targetFigures: figuresText,
        breakdown: [
          { time: '45 წთ', text: lang === 'ka' ? 'საბალეტო დაზგა & კლასიკური ქორეოგრაფია' : lang === 'ru' ? 'Балетный станок и классика' : 'Ballet Barre & Classical Technical Form' },
          { time: '45 წთ', text: lang === 'ka' ? 'OFP ფიზიკური მომზადება & პრესი/ზურგი' : lang === 'ru' ? 'ОФП физическая подготовка' : 'Core & Back Physical Conditioning (OFP)' },
          { time: '30 წთ', text: lang === 'ka' ? 'ღრმა გაწელვები & შპაგატების დამუშავება' : lang === 'ru' ? 'Глубокая растяжка и шпагаты' : 'Deep Flexibility & Splits Training' }
        ],
        dailyGoal: goalText
      }
    }

    return {
      phase,
      danceName: lang === 'ka' ? 'ST / LA 6-10 ცეკვის ოსტატობის კლასი' : lang === 'ru' ? 'Мастер-класс ST / LA (6-10 танцев)' : 'ST / LA 6-10 Dance Masterclass',
      targetFigures: figuresText,
      breakdown: [
        { time: '15 წთ', text: lang === 'ka' ? 'პროფესიონალური ტრენაჟი & ტექნიკური იზოლაციები' : lang === 'ru' ? 'Профессиональная разминка и изоляции' : 'Pro Warmup & Isolations' },
        { time: '30 წთ', text: lang === 'ka' ? `WDSF ფიგურები: ${figuresText}` : lang === 'ru' ? `Фигуры WDSF: ${figuresText}` : `WDSF Figures: ${figuresText}` },
        { time: '15 წთ', text: lang === 'ka' ? 'სრული 10 ცეკვის სატურნირო ფინალები' : lang === 'ru' ? 'Турнирные финалы 10 танцев' : 'Full 10-Dance Competition Runs' }
      ],
      dailyGoal: goalText
    }
  }

  // 4. Couples & Hobby Class (Mon - Fri)
  return {
    phase,
    danceName: lang === 'ka' ? 'წყვილების ჰარმონია & Hobby Class (Waltz & Cha-Cha)' : lang === 'ru' ? 'Группа Пар и Hobby Class (Вальс и Ча-Ча)' : 'Couples & Hobby Class',
    targetFigures: figuresText,
    breakdown: [
      { time: '15 წთ', text: lang === 'ka' ? 'გახურება & წყვილში კავშირი (Contact & Lead)' : lang === 'ru' ? 'Разминка и контакт в паре' : 'Connection & Lead/Follow Warmup' },
      { time: '30 წთ', text: lang === 'ka' ? `სალონური და სპორტული ფიგურები: ${figuresText}` : lang === 'ru' ? `Бальные фигуры: ${figuresText}` : `Ballroom Figures: ${figuresText}` },
      { time: '15 წთ', text: lang === 'ka' ? 'სასიამოვნო მუსიკალური პრაქტიკა' : lang === 'ru' ? 'Практика под музыку' : 'Enjoyable Musical Practice' }
    ],
    dailyGoal: goalText
  }
}
