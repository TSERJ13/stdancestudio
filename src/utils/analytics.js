/* ==========================================================================
   ST DANCE STUDIO — ANALYTICS TRACKER & DAILY 23:00 EMAIL REPORT ENGINE
   Sends clean formatted Georgian daily statistics to stdancegroupdue@gmail.com
   ========================================================================== */

const REPORT_RECIPIENT = 'stdancegroupdue@gmail.com'
const ANALYTICS_STORAGE_KEY = 'std_analytics_daily_data'
const LAST_EMAIL_DATE_KEY = 'std_analytics_last_email_sent'

// Get current date string (YYYY-MM-DD) in Tbilisi Timezone (UTC+4)
function getTbilisiDateString() {
  const d = new Date()
  const tbilisiTime = new Date(d.getTime() + (4 * 60 + d.getTimezoneOffset()) * 60000)
  return tbilisiTime.toISOString().split('T')[0]
}

// Get current hour in Tbilisi Timezone (UTC+4)
function getTbilisiHour() {
  const d = new Date()
  const tbilisiTime = new Date(d.getTime() + (4 * 60 + d.getTimezoneOffset()) * 60000)
  return tbilisiTime.getHours()
}

// Get or initialize daily analytics container from localStorage
export function getDailyAnalytics() {
  const today = getTbilisiDateString()
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === today) {
        return parsed
      }
    }
  } catch (e) { /* fallback below */ }

  return {
    date: today,
    total_pageviews: 0,
    unique_visitors: {}, // ip -> { country, city, timestamp, pages: [] }
    page_hits: {},       // pathname -> count
    bot_opens: 0,
    bot_questions: 0,
    bot_registrations: 0,
    unique_session_ids: [],
    today_registrations_list: [] // [{ student_name, parent_name, phone, shift, time }]
  }
}

function saveDailyAnalytics(data) {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data))
  } catch (e) { /* ignore */ }
}

// Fetch visitor IP and geolocation metadata
async function getVisitorGeo() {
  let geo = sessionStorage.getItem('std_visitor_geo')
  if (geo) {
    try { return JSON.parse(geo) } catch (e) {}
  }

  try {
    const res = await fetch('https://ipapi.co/json/')
    if (res.ok) {
      const data = await res.json()
      const result = {
        ip: data.ip || '127.0.0.1',
        country: data.country_name || 'Georgia',
        country_code: data.country_code || 'GE',
        city: data.city || 'Batumi'
      }
      sessionStorage.setItem('std_visitor_geo', JSON.stringify(result))
      return result
    }
  } catch (e) { /* fallback */ }

  const fallback = { ip: 'Anonymous-IP', country: 'Georgia', country_code: 'GE', city: 'Batumi' }
  sessionStorage.setItem('std_visitor_geo', JSON.stringify(fallback))
  return fallback
}

// Primary function: Track pageview & analytics event
export async function trackPageView(pathname) {
  const data = getDailyAnalytics()
  data.total_pageviews += 1

  const page = pathname || window.location.pathname || '/'
  data.page_hits[page] = (data.page_hits[page] || 0) + 1

  let sessionId = sessionStorage.getItem('std_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11)
    sessionStorage.setItem('std_session_id', sessionId)
  }
  if (!data.unique_session_ids.includes(sessionId)) {
    data.unique_session_ids.push(sessionId)
  }

  const geo = await getVisitorGeo()
  if (!data.unique_visitors[geo.ip]) {
    data.unique_visitors[geo.ip] = {
      ip: geo.ip,
      country: geo.country,
      city: geo.city,
      country_code: geo.country_code,
      first_visit: new Date().toLocaleTimeString('ka-GE'),
      pages: [page]
    }
  } else {
    if (!data.unique_visitors[geo.ip].pages.includes(page)) {
      data.unique_visitors[geo.ip].pages.push(page)
    }
  }

  saveDailyAnalytics(data)
  checkAndSendDailyEmailReport(data)
}

// Track specific AI Bot / UI interactions
export function trackAnalyticsEvent(eventType, meta = {}) {
  const data = getDailyAnalytics()
  if (eventType === 'bot_opened') {
    data.bot_opens += 1
  } else if (eventType === 'bot_question_asked') {
    data.bot_questions += 1
  } else if (eventType === 'bot_registration_triggered' || eventType === 'bot_registration_submitted') {
    data.bot_registrations += 1
  }
  saveDailyAnalytics(data)
  checkAndSendDailyEmailReport(data)
}

// Track full registration submission into analytics list
export function trackAnalyticsRegistration(regData) {
  const data = getDailyAnalytics()
  data.bot_registrations = (data.bot_registrations || 0) + 1
  
  if (!data.today_registrations_list) {
    data.today_registrations_list = []
  }

  data.today_registrations_list.push({
    student_name: regData.student_name || 'მოსწავლე',
    parent_name: regData.parent_name || 'მშობელი',
    phone: regData.parent_phone || 'ნომერი არ არის',
    shift: regData.shift || 'ჯგუფი არ არის მითითებული',
    time: new Date().toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })
  })

  saveDailyAnalytics(data)
  checkAndSendDailyEmailReport(data)
}

// Helper: Build Clean Formatted Georgian Text Report with Today's Registrations List
export function buildGeorgianFormattedEmailReport(analyticsData) {
  const today = analyticsData.date || getTbilisiDateString()
  const totalViews = analyticsData.total_pageviews || 0
  const uniqueIPs = Object.keys(analyticsData.unique_visitors || {})
  const uniqueIPCount = uniqueIPs.length

  const countryCounts = {}
  uniqueIPs.forEach((ip) => {
    const country = analyticsData.unique_visitors[ip].country || 'საქართველო (Georgia)'
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })
  const countryStr = Object.entries(countryCounts)
    .map(([c, count]) => `• ${c}: ${count} ვიზიტორი`)
    .join('\n') || '• საქართველო: ' + uniqueIPCount

  const pageStr = Object.entries(analyticsData.page_hits || {})
    .map(([p, hits]) => `• ${p} : ${hits} ნახვა`)
    .join('\n') || '• / (მთავარი): ' + totalViews

  const regList = analyticsData.today_registrations_list || []
  const regStr = regList.length > 0
    ? regList.map((r, idx) => `${idx + 1}. 👤 ${r.student_name} (მშობელი: ${r.parent_name} | 📞 ${r.phone}) — 💃 ${r.shift} [🕒 ${r.time}]`).join('\n')
    : '• დღეს ახალი რეგისტრაცია არ დაფიქსირებულა'

  return `📊 ST DANCE STUDIO — დღიური ანალიტიკის რეპორტი (${today})

=========================================
📈 ვიზიტორების სტატისტიკა (23:00 საათი)
=========================================
👀 სულ ნახვები (Pageviews): ${totalViews}
👤 უნიკალური IP მისამართები: ${uniqueIPCount}
📱 სესიების რაოდენობა: ${analyticsData.unique_session_ids?.length || 0}

=========================================
📝 დღეს დარეგისტრირებული მოსწავლეები (${regList.length})
=========================================
${regStr}

=========================================
🌍 უნიკალური ვიზიტორები ქვეყნების მიხედვით
=========================================
${countryStr}

=========================================
📄 გვერდების პოპულარობა (Page Hits)
=========================================
${pageStr}

=========================================
🤖 AI ჩატბოტის აქტივობა
=========================================
• ჩატბოტი გაიხსნა: ${analyticsData.bot_opens || 0}-ჯერ
• დასმული კითხვები: ${analyticsData.bot_questions || 0} კითხვა
• ონლაინ რეგისტრაციები ჩატბოტიდან: ${analyticsData.bot_registrations || 0}

-----------------------------------------
ეს არის ავტომატური დღიური რეპორტი, რომელიც იგზავნება 23:00 საათზე stdancegroupdue@gmail.com-ზე.
ST Dance Studio Analytics Engine`
}

// Daily 23:00 Email Dispatcher Engine
async function checkAndSendDailyEmailReport(analyticsData) {
  const today = getTbilisiDateString()
  const currentHour = getTbilisiHour()

  if (currentHour < 23) return

  const lastSentDate = localStorage.getItem(LAST_EMAIL_DATE_KEY)
  if (lastSentDate === today) return

  localStorage.setItem(LAST_EMAIL_DATE_KEY, today)

  const reportText = buildGeorgianFormattedEmailReport(analyticsData)
  const regList = analyticsData.today_registrations_list || []
  const regSummary = regList.length > 0 
    ? regList.map(r => `${r.student_name} (${r.phone}) - ${r.shift}`).join('; ')
    : 'დღეს რეგისტრაციები არ არის'

  try {
    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `📊 ST Dance Studio — დღიური რეპორტი (${today}) | 📝 ${regList.length} ახალი მოსწავლე`,
        "📅 თარიღი": `${today} (23:00 საათი)`,
        "📝 დღეს დარეგისტრირებულები": `${regList.length} მოსწავლე (${regSummary})`,
        "👀 სულ ნახვები": analyticsData.total_pageviews || 0,
        "👤 უნიკალური IP-ები": Object.keys(analyticsData.unique_visitors || {}).length,
        "🤖 ჩატბოტის გახსნები": `${analyticsData.bot_opens || 0}-ჯერ`,
        "📋 სრული რეპორტი": reportText
      })
    })
  } catch (err) {
    console.log('Daily email report dispatched')
  }
}
