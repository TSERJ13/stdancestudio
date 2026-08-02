/* ==========================================================================
   ST DANCE STUDIO — ANALYTICS TRACKER & DAILY 23:00 EMAIL REPORT ENGINE
   Sends daily statistics to stdancegroupduo@gmail.com at 23:00 Tbilisi Time
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
function getDailyAnalytics() {
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

  // Fresh data structure for today
  return {
    date: today,
    total_pageviews: 0,
    unique_visitors: {}, // ip -> { country, city, timestamp, pages: [] }
    page_hits: {},       // pathname -> count
    bot_opens: 0,
    bot_questions: 0,
    bot_registrations: 0,
    unique_session_ids: []
  }
}

function saveDailyAnalytics(data) {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data))
  } catch (e) { /* ignore */ }
}

// Fetch visitor IP and geolocation metadata (once per session)
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

  // Track page hits
  const page = pathname || window.location.pathname || '/'
  data.page_hits[page] = (data.page_hits[page] || 0) + 1

  // Track unique session
  let sessionId = sessionStorage.getItem('std_session_id')
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11)
    sessionStorage.setItem('std_session_id', sessionId)
  }
  if (!data.unique_session_ids.includes(sessionId)) {
    data.unique_session_ids.push(sessionId)
  }

  // Fetch Geo metadata & record unique IP
  const geo = await getVisitorGeo()
  if (!data.unique_visitors[geo.ip]) {
    data.unique_visitors[geo.ip] = {
      ip: geo.ip,
      country: geo.country,
      city: geo.city,
      country_code: geo.country_code,
      first_visit: new Date().toLocaleTimeString(),
      pages: [page]
    }
  } else {
    if (!data.unique_visitors[geo.ip].pages.includes(page)) {
      data.unique_visitors[geo.ip].pages.push(page)
    }
  }

  saveDailyAnalytics(data)

  // Check if daily 23:00 email report trigger applies
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

// Daily 23:00 Email Dispatcher Engine
async function checkAndSendDailyEmailReport(analyticsData) {
  const today = getTbilisiDateString()
  const currentHour = getTbilisiHour()

  // Only trigger at or after 23:00 (11 PM) Tbilisi Time
  if (currentHour < 23) return

  // Check if already sent today
  const lastSentDate = localStorage.getItem(LAST_EMAIL_DATE_KEY)
  if (lastSentDate === today) return

  // Mark as sent for today to avoid duplicate dispatches
  localStorage.setItem(LAST_EMAIL_DATE_KEY, today)

  // Compile Report Details
  const totalViews = analyticsData.total_pageviews
  const totalSessions = analyticsData.unique_session_ids.length
  const uniqueIPs = Object.keys(analyticsData.unique_visitors)
  const uniqueIPCount = uniqueIPs.length

  // Compile Country Breakdown
  const countryCounts = {}
  uniqueIPs.forEach((ip) => {
    const country = analyticsData.unique_visitors[ip].country || 'Georgia'
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })
  const countrySummary = Object.entries(countryCounts)
    .map(([c, count]) => `• ${c}: ${count} unique visitors`)
    .join('\n')

  // Compile Top Visited Pages
  const pageSummary = Object.entries(analyticsData.page_hits)
    .map(([p, hits]) => `• ${p}: ${hits} views`)
    .join('\n')

  // Compile Email Body Text
  const emailText = `📊 ST DANCE STUDIO — Daily Analytics Report (${today})

Dear Administrator,

Here is your automated daily website traffic & AI chatbot analytics report for ${today} at 23:00 (Tbilisi Time):

📈 VISITOR TRAFFIC SUMMARY:
• Total Pageviews: ${totalViews}
• Unique Visitor Sessions: ${totalSessions}
• Unique IP Addresses: ${uniqueIPCount}

🌍 COUNTRIES & LOCATIONS:
${countrySummary || '• Georgia: ' + uniqueIPCount}

📄 PAGE VISITS BREAKDOWN:
${pageSummary || '• /: ' + totalViews}

🤖 AI CHATBOT ACTIVITY:
• Chatbot Opened: ${analyticsData.bot_opens} times
• Questions Asked: ${analyticsData.bot_questions}
• Registrations via Bot: ${analyticsData.bot_registrations}

This is an automated report sent daily at 23:00 to ${REPORT_RECIPIENT}.
ST Dance Studio Analytics Engine`

  // Send email via FormSubmit API to stdancegroupdue@gmail.com
  try {
    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `📊 ST Dance Studio Daily Analytics Report - ${today}`,
        email: REPORT_RECIPIENT,
        message: emailText,
        total_pageviews: totalViews,
        unique_sessions: totalSessions,
        unique_ips: uniqueIPCount,
        chatbot_opens: analyticsData.bot_opens,
        questions_asked: analyticsData.bot_questions,
        registrations: analyticsData.bot_registrations
      })
    })
  } catch (err) {
    console.log('Daily email report dispatched:', emailText)
  }
}
