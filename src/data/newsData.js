import { translations } from './translations'
import { getNews } from './db'

export function getAllNewsArticles(lang = 'ka') {
  const activeTrans = translations[lang] || translations.ka
  const newsTrans = activeTrans.newsSection || translations.ka.newsSection

  const posterSeason = lang === 'ru' ? '/images/poster-ru.jpg' : lang === 'en' ? '/images/poster-en.jpg' : '/images/poster-ka.jpg'

  // Official Static Featured Articles
  const officialArticles = [
    {
      id: 'season-opening-2026',
      slug: 'season-opening-2026',
      date: '25 Авг 2026 / 25 აგვ 2026',
      title: newsTrans.title,
      excerpt: lang === 'ka' 
        ? 'ST Dance Studio იწყებს ახალ 11-თვიან სასწავლო და სატურნირო სეზონს WDSF სილაბუსის მიხედვით. გაეცანით სტუდიის შინაგანაწესს, გაცდენების ლიმიტსა და ჩაცმულობის ბმულებს.'
        : lang === 'ru'
        ? 'ST Dance Studio начинает новый 11-месячный учебный и турнирный сезон по программе WDSF. Ознакомьтесь с правилами студии и ссылками на одежду.'
        : 'ST Dance Studio begins a new 11-month training season based on WDSF syllabus. Check out studio rules, absence limits, and outfit links.',
      poster: posterSrcSeason(lang),
      type: 'season'
    },
    {
      id: 'tournament-calendar-2026',
      slug: 'tournament-calendar-2026',
      date: '25 Авг 2026 / 25 აგვ 2026',
      title: newsTrans.calendarTitle,
      excerpt: lang === 'ka'
        ? '2026-2027 წლის განმავლობაში დაგეგმილია 10 ძირითადი ტურნირი ქუთაისში, თბილისში, ბათუმში (აჭარის ჩემპიონატი & Batumi Open), კავკასიის თასსა და საერთაშორისო გასვლით ტურნირებზე.'
        : lang === 'ru'
        ? 'На 2026-2027 годы запланировано 10 основных турниров в Кутаиси, Тбилиси, Батуми (Чемпионат Аджарии и Batumi Open) и на Кубке Кавказа.'
        : '10 major competitions planned for 2026-2027 in Kutaisi, Tbilisi, Batumi (Adjara Championship & Batumi Open), Caucasus Cup, and international trips.',
      poster: '/images/poster-calendar.jpg',
      type: 'tournament'
    }
  ]

  // Combine with dynamic admin news from DB
  let adminArticles = []
  try {
    const dbItems = getNews()
    if (dbItems && Array.isArray(dbItems)) {
      adminArticles = dbItems.map((item, idx) => {
        const slug = item.slug || `article-${item.id || idx + 1}`
        return {
          id: item.id || slug,
          slug: slug,
          date: item.date || '2026',
          title: item.title,
          excerpt: item.content ? item.content.slice(0, 140) + '...' : '',
          poster: item.image || '/images/poster-ka.jpg',
          content: item.content || item.text,
          type: 'admin'
        }
      })
    }
  } catch (e) {
    console.error('Error loading DB news:', e)
  }

  return [...officialArticles, ...adminArticles]
}

function posterSrcSeason(lang) {
  if (lang === 'ru') return '/images/poster-ru.jpg'
  if (lang === 'en') return '/images/poster-en.jpg'
  return '/images/poster-ka.jpg'
}

export function getNewsArticleBySlug(slug, lang = 'ka') {
  const all = getAllNewsArticles(lang)
  return all.find(a => a.slug === slug) || all[0]
}
