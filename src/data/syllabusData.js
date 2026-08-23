/**
 * ST DANCE STUDIO — 11-Month Educational Plan & WDSF Syllabus Data
 * Full 3-Language Support (KA, EN, RU)
 */

export const syllabusData = {
  ka: {
    title: '11-თვიანი საგანმანათლებლო გეგმა & WDSF სილაბუსი',
    subtitle: 'WDSF (World DanceSport Federation) ოფიციალური სასწავლო პროგრამა, ჯგუფური როტაცია და ყოველდღიური ალგორითმი',
    seasonStart: 'სეზონის სტარტი: 25 აგვისტო, 2026',
    holidaysTitle: 'არდადეგები & ოფიციალური უქმეები',
    winterHolidays: 'ზამთრის არდადეგები: 2026 წლის 28 დეკემბერი – 2027 წლის 11 იანვარი (სწავლა განახლდება 11 იანვარს).',
    officialHolidays: 'ოფიციალური უქმეები: 3 მარტი (დედის დღე), 8 მარტი (ქალთა დღე), 9 აპრილი, აღდგომის დღეები (პარასკევი-ორშაბათი), 9 მაისი, 12 მაისი, 26 მაისი.',
    tournamentPeaks: 'სატურნირო პიკები: ნოემბერი, დეკემბერი, იანვარი (II ნახ.), თებერვალი, მარტი, აპრილი, მაისი (კავკასიის თასი), ივლისი (Batumi Open).',

    // 60-min & 120-min Lesson Algorithm
    algorithmTitle: 'გაკვეთილის სტრუქტურის ალგორითმი',
    algorithm: [
      {
        dayType: 'დღე 1 (ტექნიკა - ცეკვა 1)',
        duration: '60 წთ',
        breakdown: [
          { time: '15 წთ', label: 'ტრენაჟი / ფეხის ტექნიკა & დგომი' },
          { time: '30 წთ', label: 'ახსნა & ახალი WDSF ფიგურები' },
          { time: '15 წთ', label: 'პრაქტიკა / მუსიკაში დახვეწა' }
        ]
      },
      {
        dayType: 'დღე 2 (ტექნიკა - ცეკვა 2)',
        duration: '60 წთ',
        breakdown: [
          { time: '15 წთ', label: 'ტრენაჟი / ფეხის ტექნიკა & დგომი' },
          { time: '30 წთ', label: 'ახსნა & ახალი WDSF ფიგურები' },
          { time: '15 წთ', label: 'პრაქტიკა / მუსიკაში დახვეწა' }
        ]
      },
      {
        dayType: 'დღე 3 (პრაქტიკა)',
        duration: '60 წთ',
        breakdown: [
          { time: '15 წთ', label: 'ტრენაჟი / გახურება' },
          { time: '45 წთ', label: 'ფინალები (მუსიკის შეუჩერებელი პრაგონი & გამძლეობა)' }
        ]
      },
      {
        dayType: 'შაბათი (13:00-15:00 - სატურნირო ჯგუფები)',
        duration: '120 წთ',
        breakdown: [
          { time: '120 წთ', label: 'საბალეტო კლასიკა, ქორეოგრაფია, ფიზიკური მომზადება (OFP) & გაწელვები' }
        ]
      }
    ],

    // 11-Month Macro Cycle Goals
    macroCyclesTitle: '11-თვიანი მაკრო-ციკლის მიზნები',
    macroCycles: [
      {
        period: 'აგვისტო – ოქტომბერი',
        name: 'ბაზის აღდგენა',
        badge: 'I ეტაპი',
        desc: 'ფოკუსი ფეხის ტექნიკაზე (Footwork), დგომზე (Posture) და WDSF სილაბუსის ფიგურების დამახსოვრებაზე.'
      },
      {
        period: 'ნოემბერი – იანვარი',
        name: 'სატურნირო გამძლეობა',
        badge: 'II ეტაპი',
        desc: 'ტურნირებისთვის მოსამზადებელი ინტენსიური პრაგონები, პროგრამების გასუფთავება და სცენური კულტურა.'
      },
      {
        period: 'თებერვალი – აპრილი',
        name: 'დინამიკა & AJS შეფასება',
        badge: 'III ეტაპი',
        desc: 'სიჩქარის განვითარება, მუსიკალურობის გაუმჯობესება (ტემპის ცვლილებები) და AJS (Absolute Judging System) სტანდარტები.'
      },
      {
        period: 'მაისი – ივლისი',
        name: 'პიკური ფორმა',
        badge: 'IV ეტაპი',
        desc: 'კავკასიის თასისა და Batumi Open-ისთვის უმაღლესი ხარისხის ჩვენება. ახალი ფიგურების ჩამატება მომდევნო წლისთვის.'
      }
    ],

    // 6 Groups Syllabus
    groupsTitle: 'ჯგუფების მიხედვით WDSF სილაბუსი და კვირის როტაცია',
    groups: [
      {
        id: 'baby_bronze',
        name: 'Baby ჯგუფი & ბრონზა',
        level: '2 ცეკვა (Beginner)',
        dances: 'ნელი ვალსი (Waltz), ჩა-ჩა-ჩა (Cha-Cha-Cha)',
        rotation: 'დღე 1: Waltz | დღე 2: Cha-Cha-Cha | დღე 3: W & CCC პრაქტიკა',
        figuresAugJan: {
          waltz: ['Closed Changes (Right & Left)', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement (Closed/Open)', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'hobby',
        name: 'Hobby კლასი',
        level: '2 ცეკვა (Beginner / ზრდასრულები, კვირაში 2 დღე)',
        dances: 'ნელი ვალსი (Waltz), ჩა-ჩა-ჩა (Cha-Cha-Cha)',
        rotation: 'დღე 1: Waltz | დღე 2: Cha-Cha-Cha (პრაქტიკის დღე არ აქვთ)',
        figuresAugJan: {
          waltz: ['Closed Changes (Right & Left)', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'presilver_silver',
        name: 'Pre-Silver & Silver (H კლასი)',
        level: '4 ცეკვა',
        dances: 'ნელი ვალსი (W), ქვიქსტეპი (Q), ჩა-ჩა-ჩა (CCC), ჯაივი (J)',
        rotation: 'კვირა 1 & 3: დღე 1 (W), დღე 2 (CCC), დღე 3 (W/CCC პრაქტიკა) | კვირა 2 & 4: დღე 1 (Q), დღე 2 (J), დღე 3 (Q/J პრაქტიკა)',
        figuresAugJan: {
          waltz: ['Closed Changes', 'Natural Turn', 'Reverse Turn', 'Whisk', 'Chasse from PP'],
          quickstep: ['Quarter Turn to Right', 'Progressive Chasse'],
          ccc: ['Basic Movement', 'New York', 'Hand to Hand', 'Spot Turn', 'Alemana'],
          jive: ['Fallaway Rock', 'Fallaway Throwaway', 'Link']
        },
        figuresFebJul: {
          waltz: ['Impetus', 'Outside Change'],
          quickstep: ['Forward Lock Step', 'Natural Turn'],
          ccc: ['Hockey Stick', 'Three Cha Chas'],
          jive: ['Change of Places (R to L, L to R)', 'American Spin']
        }
      },
      {
        id: 'golden_e',
        name: 'Golden — E კლასი',
        level: '6 ცეკვა',
        dances: 'სტანდარტი (ვალსი, ტანგო, ქვიქსტეპი) / ლათინური (სამბა, ჩა-ჩა-ჩა, ჯაივი)',
        rotation: 'კვირა 1 & 3 (Standard): დღე 1 (W/T), დღე 2 (Q), დღე 3 (ST პრაქტიკა) | კვირა 2 & 4 (Latin): დღე 1 (S/CCC), დღე 2 (J), დღე 3 (LA პრაქტიკა)',
        figuresAugJan: {
          tango: ['Walk', 'Progressive Link', 'Closed Promenade', 'Back Corté'],
          samba: ['Basic Movements', 'Whisks', 'Samba Walks', 'Bota Fogos', 'Voltas']
        },
        figuresFebJul: {
          tango: ['Promenade Link', 'Open Promenade', 'Five Step'],
          samba: ['Criss Cross Voltas', 'Solo Spot Voltas', 'Shadow Traveling Voltas']
        }
      },
      {
        id: 'golden_d',
        name: 'Golden — D კლასი',
        level: '8 ცეკვა',
        dances: 'E კლასს + ვენური ვალსი (VW) & რუმბა (Rumba)',
        rotation: 'კვირა 1 (Standard): დღე 1 (W/T), დღე 2 (VW/Q), დღე 3 (ST პრაქტიკა) | კვირა 2 (Latin): დღე 1 (S/CCC), დღე 2 (R/J), დღე 3 (LA პრაქტიკა)',
        figuresAugJan: {
          vienneseWaltz: ['Natural Turn', 'Reverse Turn', 'Forward & Backward Changes'],
          rumba: ['Basic Movements', 'Fan', 'Alemana', 'Hockey Stick', 'Sliding Doors', 'Opening Out', 'Cucarachas']
        },
        figuresFebJul: {
          vienneseWaltz: ['Fleckerls (Intro)', 'Reverse Change'],
          rumba: ['Spiral', 'Three Alemanas', 'Fencing']
        }
      },
      {
        id: 'golden_c_couples',
        name: 'Golden — C კლასი & წყვილები',
        level: '10 ცეკვა (Mixed / C Class)',
        dances: 'D კლასს + სლოუფოქსი (Slow Foxtrot) & პასოდობლე (Paso Doble)',
        rotation: 'დღე 1: Standard 5-ვე ცეკვის ტექნიკა (ფოკუსი 2 ცეკვაზე) | დღე 2: Latin 5-ვე ცეკვის ტექნიკა | დღე 3: 10 Dance პრაქტიკა (პრაგონი)',
        figuresAugJan: {
          slowFoxtrot: ['Feather Step', 'Three Step', 'Natural Turn', 'Reverse Turn', 'Impetus'],
          pasoDoble: ['Sur Place', 'Basic Movement', 'Chasses', 'Appel', 'Deplacement', 'Promenades', 'Grand Circle']
        },
        figuresFebJul: {
          slowFoxtrot: ['Hover Telemark', 'Whisk', 'Natural Weave'],
          pasoDoble: ['Twists', 'La Houri', 'Spanish Line', 'Flamenco Taps']
        }
      }
    ]
  },
  en: {
    title: '11-Month Educational Plan & WDSF Syllabus',
    subtitle: 'WDSF (World DanceSport Federation) official curriculum, weekly rotations, and daily lesson algorithm',
    seasonStart: 'Season Start: August 25, 2026',
    holidaysTitle: 'Vacations & Official Holidays',
    winterHolidays: 'Winter Break: December 28, 2026 – January 11, 2027 (Classes resume Jan 11).',
    officialHolidays: 'Official Holidays: Mar 3 (Mother\'s Day), Mar 8 (Women\'s Day), Apr 9, Easter (Fri–Mon), May 9, May 12, May 26.',
    tournamentPeaks: 'Tournament Peaks: Nov, Dec, Jan (2nd half), Feb, Mar, Apr, May (Caucasus Cup), Jul (Batumi Open).',

    algorithmTitle: 'Daily Lesson Structure Algorithm',
    algorithm: [
      {
        dayType: 'Day 1 (Technique - Dance 1)',
        duration: '60 min',
        breakdown: [
          { time: '15 min', label: 'Warmup / Footwork & Posture Drills' },
          { time: '30 min', label: 'Explanation & New WDSF Figures' },
          { time: '15 min', label: 'Practice & Musicality Refinement' }
        ]
      },
      {
        dayType: 'Day 2 (Technique - Dance 2)',
        duration: '60 min',
        breakdown: [
          { time: '15 min', label: 'Warmup / Footwork & Posture Drills' },
          { time: '30 min', label: 'Explanation & New WDSF Figures' },
          { time: '15 min', label: 'Practice & Musicality Refinement' }
        ]
      },
      {
        dayType: 'Day 3 (Practice)',
        duration: '60 min',
        breakdown: [
          { time: '15 min', label: 'Warmup & Conditioning' },
          { time: '45 min', label: 'Finals (Non-stop music run & stamina)' }
        ]
      },
      {
        dayType: 'Saturday (13:00-15:00 - Competition Teams)',
        duration: '120 min',
        breakdown: [
          { time: '120 min', label: 'Ballet Classics, Choreography, Physical Prep (OFP) & Stretching' }
        ]
      }
    ],

    macroCyclesTitle: '11-Month Macro Cycle Goals',
    macroCycles: [
      {
        period: 'August – October',
        name: 'Base Recovery',
        badge: 'Phase I',
        desc: 'Focus on Footwork, Posture, and WDSF syllabus memory retention.'
      },
      {
        period: 'November – January',
        name: 'Tournament Stamina',
        badge: 'Phase II',
        desc: 'Intensive practice runs, routine cleaning, and stage performance culture.'
      },
      {
        period: 'February – April',
        name: 'Dynamics & AJS Rating',
        badge: 'Phase III',
        desc: 'Speed development, musicality enhancement (tempo variations), and Absolute Judging System (AJS) criteria.'
      },
      {
        period: 'May – July',
        name: 'Peak Form',
        badge: 'Phase IV',
        desc: 'Peak performance for Caucasus Cup & Batumi Open. Adding advanced figures for next year.'
      }
    ],

    groupsTitle: 'WDSF Syllabus & Weekly Rotation by Group',
    groups: [
      {
        id: 'baby_bronze',
        name: 'Baby Group & Bronze',
        level: '2 Dances (Beginner)',
        dances: 'Slow Waltz, Cha-Cha-Cha',
        rotation: 'Day 1: Waltz | Day 2: Cha-Cha-Cha | Day 3: W & CCC Practice',
        figuresAugJan: {
          waltz: ['Closed Changes (Right & Left)', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement (Closed/Open)', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'hobby',
        name: 'Hobby Class',
        level: '2 Dances (Beginner / Adults, 2 days/week)',
        dances: 'Slow Waltz, Cha-Cha-Cha',
        rotation: 'Day 1: Waltz | Day 2: Cha-Cha-Cha (No practice day)',
        figuresAugJan: {
          waltz: ['Closed Changes', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'presilver_silver',
        name: 'Pre-Silver & Silver (H Class)',
        level: '4 Dances',
        dances: 'Slow Waltz, Quickstep, Cha-Cha-Cha, Jive',
        rotation: 'Weeks 1 & 3: Day 1 (W), Day 2 (CCC), Day 3 (W/CCC Practice) | Weeks 2 & 4: Day 1 (Q), Day 2 (J), Day 3 (Q/J Practice)',
        figuresAugJan: {
          waltz: ['Closed Changes', 'Natural Turn', 'Reverse Turn', 'Whisk', 'Chasse from PP'],
          quickstep: ['Quarter Turn to Right', 'Progressive Chasse'],
          ccc: ['Basic Movement', 'New York', 'Hand to Hand', 'Spot Turn', 'Alemana'],
          jive: ['Fallaway Rock', 'Fallaway Throwaway', 'Link']
        },
        figuresFebJul: {
          waltz: ['Impetus', 'Outside Change'],
          quickstep: ['Forward Lock Step', 'Natural Turn'],
          ccc: ['Hockey Stick', 'Three Cha Chas'],
          jive: ['Change of Places (R to L, L to R)', 'American Spin']
        }
      },
      {
        id: 'golden_e',
        name: 'Golden — E Class',
        level: '6 Dances',
        dances: 'Standard (Waltz, Tango, Quickstep) / Latin (Samba, Cha-Cha-Cha, Jive)',
        rotation: 'Weeks 1 & 3 (Standard): Day 1 (W/T), Day 2 (Q), Day 3 (ST Practice) | Weeks 2 & 4 (Latin): Day 1 (S/CCC), Day 2 (J), Day 3 (LA Practice)',
        figuresAugJan: {
          tango: ['Walk', 'Progressive Link', 'Closed Promenade', 'Back Corté'],
          samba: ['Basic Movements', 'Whisks', 'Samba Walks', 'Bota Fogos', 'Voltas']
        },
        figuresFebJul: {
          tango: ['Promenade Link', 'Open Promenade', 'Five Step'],
          samba: ['Criss Cross Voltas', 'Solo Spot Voltas', 'Shadow Traveling Voltas']
        }
      },
      {
        id: 'golden_d',
        name: 'Golden — D Class',
        level: '8 Dances',
        dances: 'E Class + Viennese Waltz & Rumba',
        rotation: 'Week 1 (Standard): Day 1 (W/T), Day 2 (VW/Q), Day 3 (ST Practice) | Week 2 (Latin): Day 1 (S/CCC), Day 2 (R/J), Day 3 (LA Practice)',
        figuresAugJan: {
          vienneseWaltz: ['Natural Turn', 'Reverse Turn', 'Forward & Backward Changes'],
          rumba: ['Basic Movements', 'Fan', 'Alemana', 'Hockey Stick', 'Sliding Doors', 'Opening Out', 'Cucarachas']
        },
        figuresFebJul: {
          vienneseWaltz: ['Fleckerls (Intro)', 'Reverse Change'],
          rumba: ['Spiral', 'Three Alemanas', 'Fencing']
        }
      },
      {
        id: 'golden_c_couples',
        name: 'Golden — C Class & Couples',
        level: '10 Dances (Mixed / C Class)',
        dances: 'D Class + Slow Foxtrot & Paso Doble',
        rotation: 'Day 1: Standard 5 Dances Technique (Focus on 2) | Day 2: Latin 5 Dances Technique | Day 3: 10 Dance Practice Run',
        figuresAugJan: {
          slowFoxtrot: ['Feather Step', 'Three Step', 'Natural Turn', 'Reverse Turn', 'Impetus'],
          pasoDoble: ['Sur Place', 'Basic Movement', 'Chasses', 'Appel', 'Deplacement', 'Promenades', 'Grand Circle']
        },
        figuresFebJul: {
          slowFoxtrot: ['Hover Telemark', 'Whisk', 'Natural Weave'],
          pasoDoble: ['Twists', 'La Houri', 'Spanish Line', 'Flamenco Taps']
        }
      }
    ]
  },
  ru: {
    title: '11-месячный учебный план и программа WDSF',
    subtitle: 'Официальная учебная программа WDSF (World DanceSport Federation), недельная ротация и алгоритм уроков',
    seasonStart: 'Старт сезона: 25 августа 2026',
    holidaysTitle: 'Каникулы и официальные праздники',
    winterHolidays: 'Зимние каникулы: 28 декабря 2026 г. – 11 января 2027 г. (занятия возобновляются 11 января).',
    officialHolidays: 'Официальные праздники: 3 марта (День матери), 8 марта (Женский день), 9 апреля, Пасхальные дни (Пт–Пн), 9 мая, 12 мая, 26 мая.',
    tournamentPeaks: 'Пики турниров: Ноябрь, Декабрь, Январь (II пол.), Февраль, Март, Апрель, Май (Кубок Кавказа), Июль (Batumi Open).',

    algorithmTitle: 'Алгоритм структуры урока',
    algorithm: [
      {
        dayType: 'День 1 (Техника - Танец 1)',
        duration: '60 мин',
        breakdown: [
          { time: '15 мин', label: 'Тренаж / Техника стопы и осанка' },
          { time: '30 мин', label: 'Объяснение и новые фигуры WDSF' },
          { time: '15 мин', label: 'Практика и отработка под музыку' }
        ]
      },
      {
        dayType: 'День 2 (Техника - Танец 2)',
        duration: '60 мин',
        breakdown: [
          { time: '15 мин', label: 'Тренаж / Техника стопы и осанка' },
          { time: '30 мин', label: 'Объяснение и новые фигуры WDSF' },
          { time: '15 мин', label: 'Практика и отработка под музыку' }
        ]
      },
      {
        dayType: 'День 3 (Практика)',
        duration: '60 мин',
        breakdown: [
          { time: '15 мин', label: 'Тренаж / Разминка' },
          { time: '45 мин', label: 'Финал (Непрерывный прогон под музыку)' }
        ]
      },
      {
        dayType: 'Суббота (13:00-15:00 - Конкурсные группы)',
        duration: '120 мин',
        breakdown: [
          { time: '120 мин', label: 'Балетная классика, хореография, ОФП и растяжка' }
        ]
      }
    ],

    macroCyclesTitle: 'Цели 11-месячного макроцикла',
    macroCycles: [
      {
        period: 'Август – Октябрь',
        name: 'Восстановление базы',
        badge: 'I этап',
        desc: 'Фокус на технике стопы (Footwork), осанке (Posture) и запоминании фигур WDSF.'
      },
      {
        period: 'Ноябрь – Январь',
        name: 'Турнирная выносливость',
        badge: 'II этап',
        desc: 'Интенсивные прогоны перед турнирами, чистка программ и сценическая культура.'
      },
      {
        period: 'Февраль – Апрель',
        name: 'Динамика и оценка AJS',
        badge: 'III этап',
        desc: 'Развитие скорости, музыкальности (смена темпа) и стандартов AJS (Absolute Judging System).'
      },
      {
        period: 'Май – Июль',
        name: 'Пиковая форма',
        badge: 'IV этап',
        desc: 'Пик формы для Кубка Кавказа и Batumi Open. Добавление новых фигур на следующий год.'
      }
    ],

    groupsTitle: 'Программа WDSF и ротация по группам',
    groups: [
      {
        id: 'baby_bronze',
        name: 'Baby группа и Бронза',
        level: '2 танца (Beginner)',
        dances: 'Медленный вальс, Ча-ча-ча',
        rotation: 'День 1: Вальс | День 2: Ча-ча-ча | День 3: Практика W & CCC',
        figuresAugJan: {
          waltz: ['Closed Changes (Right & Left)', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement (Closed/Open)', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'hobby',
        name: 'Hobby Class',
        level: '2 танца (Beginner / Взрослые, 2 дня в неделю)',
        dances: 'Медленный вальс, Ча-ча-ча',
        rotation: 'День 1: Вальс | День 2: Ча-ча-ча (Без практики)',
        figuresAugJan: {
          waltz: ['Closed Changes', 'Natural Turn'],
          ccc: ['Time Step', 'Basic Movement', 'New York']
        },
        figuresFebJul: {
          waltz: ['Reverse Turn', 'Hesitation Change'],
          ccc: ['Spot Turn', 'Hand to Hand']
        }
      },
      {
        id: 'presilver_silver',
        name: 'Pre-Silver & Silver (H класс)',
        level: '4 танца',
        dances: 'Медленный вальс, Квикстеп, Ча-ча-ча, Джайв',
        rotation: 'Недели 1 и 3: День 1 (W), День 2 (CCC), День 3 (Практика W/CCC) | Недели 2 и 4: День 1 (Q), День 2 (J), День 3 (Практика Q/J)',
        figuresAugJan: {
          waltz: ['Closed Changes', 'Natural Turn', 'Reverse Turn', 'Whisk', 'Chasse from PP'],
          quickstep: ['Quarter Turn to Right', 'Progressive Chasse'],
          ccc: ['Basic Movement', 'New York', 'Hand to Hand', 'Spot Turn', 'Alemana'],
          jive: ['Fallaway Rock', 'Fallaway Throwaway', 'Link']
        },
        figuresFebJul: {
          waltz: ['Impetus', 'Outside Change'],
          quickstep: ['Forward Lock Step', 'Natural Turn'],
          ccc: ['Hockey Stick', 'Three Cha Chas'],
          jive: ['Change of Places (R to L, L to R)', 'American Spin']
        }
      },
      {
        id: 'golden_e',
        name: 'Golden — E класс',
        level: '6 танцев',
        dances: 'Стандарт (Вальс, Танго, Квикстеп) / Латина (Самба, Ча-ча-ча, Джайв)',
        rotation: 'Недели 1 и 3 (Standard): День 1 (W/T), День 2 (Q), День 3 (ST Практика) | Недели 2 и 4 (Latin): День 1 (S/CCC), День 2 (J), День 3 (LA Практика)',
        figuresAugJan: {
          tango: ['Walk', 'Progressive Link', 'Closed Promenade', 'Back Corté'],
          samba: ['Basic Movements', 'Whisks', 'Samba Walks', 'Bota Fogos', 'Voltas']
        },
        figuresFebJul: {
          tango: ['Promenade Link', 'Open Promenade', 'Five Step'],
          samba: ['Criss Cross Voltas', 'Solo Spot Voltas', 'Shadow Traveling Voltas']
        }
      },
      {
        id: 'golden_d',
        name: 'Golden — D класс',
        level: '8 танцев',
        dances: 'Класс E + Венский вальс и Румба',
        rotation: 'Неделя 1 (Standard): День 1 (W/T), День 2 (VW/Q), День 3 (ST Практика) | Неделя 2 (Latin): День 1 (S/CCC), День 2 (R/J), День 3 (LA Практика)',
        figuresAugJan: {
          vienneseWaltz: ['Natural Turn', 'Reverse Turn', 'Forward & Backward Changes'],
          rumba: ['Basic Movements', 'Fan', 'Alemana', 'Hockey Stick', 'Sliding Doors', 'Opening Out', 'Cucarachas']
        },
        figuresFebJul: {
          vienneseWaltz: ['Fleckerls (Intro)', 'Reverse Change'],
          rumba: ['Spiral', 'Three Alemanas', 'Fencing']
        }
      },
      {
        id: 'golden_c_couples',
        name: 'Golden — C класс и Пары',
        level: '10 танцев (Mixed / C Class)',
        dances: 'Класс D + Медленный фокстрот и Пасодобль',
        rotation: 'День 1: Техника Standard (5 танцев, фокус на 2) | День 2: Техника Latin (5 танцев) | День 3: 10 Dance Прогон',
        figuresAugJan: {
          slowFoxtrot: ['Feather Step', 'Three Step', 'Natural Turn', 'Reverse Turn', 'Impetus'],
          pasoDoble: ['Sur Place', 'Basic Movement', 'Chasses', 'Appel', 'Deplacement', 'Promenades', 'Grand Circle']
        },
        figuresFebJul: {
          slowFoxtrot: ['Hover Telemark', 'Whisk', 'Natural Weave'],
          pasoDoble: ['Twists', 'La Houri', 'Spanish Line', 'Flamenco Taps']
        }
      }
    ]
  }
}
