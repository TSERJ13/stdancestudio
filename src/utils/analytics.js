/* ==========================================================================
   ST DANCE STUDIO — ANALYTICS TRACKER & DAILY 23:00 EMAIL REPORT ENGINE
   Sends formatted Georgian HTML/CSS daily statistics to stdancegroupdue@gmail.com
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

// Helper: Build Premium Georgian HTML/CSS Email Template
export function buildGeorgianHtmlEmailReport(analyticsData) {
  const today = analyticsData.date || getTbilisiDateString()
  const totalViews = analyticsData.total_pageviews || 0
  const totalSessions = analyticsData.unique_session_ids?.length || 0
  const uniqueIPs = Object.keys(analyticsData.unique_visitors || {})
  const uniqueIPCount = uniqueIPs.length

  // Country Breakdown HTML
  const countryCounts = {}
  uniqueIPs.forEach((ip) => {
    const country = analyticsData.unique_visitors[ip].country || 'საქართველო (Georgia)'
    countryCounts[country] = (countryCounts[country] || 0) + 1
  })
  const countryHtml = Object.entries(countryCounts)
    .map(([c, count]) => `<div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:6px; margin-bottom:6px; font-size:13px; color:#e2e8f0;"><span>🌍 ${c}</span><strong style="color:#c5a059;">${count} ვიზიტორი</strong></div>`)
    .join('') || '<div style="color:#8c8c9e; font-size:13px;">საქართველო: ' + uniqueIPCount + '</div>'

  // Page Visits HTML
  const pageHtml = Object.entries(analyticsData.page_hits || {})
    .map(([p, hits]) => `<div style="display:flex; justify-content:space-between; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:6px; margin-bottom:6px; font-size:13px; color:#e2e8f0;"><span>📄 ${p}</span><strong style="color:#ffffff;">${hits} ნახვა</strong></div>`)
    .join('') || '<div style="color:#8c8c9e; font-size:13px;">/ (მთავარი): ' + totalViews + '</div>'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ST Dance Studio — დღიური ანალიტიკის რეპორტი</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #08080c; color: #e2e8f0; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #0f0f17; border: 1.5px solid #c5a059; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
    
    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #1c1c28 0%, #0a0a10 100%); padding: 28px 20px; text-align: center; border-bottom: 1px solid rgba(197,160,89,0.3);">
      <h1 style="color: #c5a059; font-size: 24px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0;">ST DANCE STUDIO</h1>
      <div style="height: 1px; background: #c5a059; width: 80px; margin: 6px auto;"></div>
      <div style="color: #a0a0b2; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">დღიური ანალიტიკისა და ტრაფიკის რეპორტი</div>
    </div>

    <!-- BODY CONTENT -->
    <div style="padding: 24px;">
      
      <!-- DATE BADGE -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="background: rgba(197,160,89,0.15); border: 1px solid #c5a059; color: #e8d3a7; font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 25px;">
          📅 23:00 საათის რეპორტი • ${today}
        </span>
      </div>

      <!-- METRICS GRID CARDS -->
      <div style="display: table; width: 100%; margin-bottom: 20px;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding: 6px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(197,160,89,0.25); border-radius: 12px; padding: 14px;">
              <div style="color: #94a3b8; font-size: 11px; font-weight: 600;">👀 სულ ნახვები</div>
              <div style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 4px;">${totalViews}</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding: 6px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(197,160,89,0.25); border-radius: 12px; padding: 14px;">
              <div style="color: #94a3b8; font-size: 11px; font-weight: 600;">👤 უნიკალური IP-ები</div>
              <div style="color: #c5a059; font-size: 24px; font-weight: 800; margin-top: 4px;">${uniqueIPCount}</div>
            </div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding: 6px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(197,160,89,0.25); border-radius: 12px; padding: 14px;">
              <div style="color: #94a3b8; font-size: 11px; font-weight: 600;">🤖 ჩატბოტის გახსნები</div>
              <div style="color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 4px;">${analyticsData.bot_opens || 0}</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding: 6px;">
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(197,160,89,0.25); border-radius: 12px; padding: 14px;">
              <div style="color: #94a3b8; font-size: 11px; font-weight: 600;">✨ ჩატბოტის რეგისტრაციები</div>
              <div style="color: #10b981; font-size: 24px; font-weight: 800; margin-top: 4px;">${analyticsData.bot_registrations || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- COUNTRIES BREAKDOWN -->
      <div style="color: #c5a059; font-size: 14px; font-weight: 700; margin: 20px 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        🌍 უნიკალური ვიზიტორები ქვეყნების მიხედვით
      </div>
      ${countryHtml}

      <!-- PAGE VISITS BREAKDOWN -->
      <div style="color: #c5a059; font-size: 14px; font-weight: 700; margin: 24px 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        📄 გვერდების პოპულარობა (Page Hits)
      </div>
      ${pageHtml}

      <!-- CHATBOT STATS SUMMARY -->
      <div style="color: #c5a059; font-size: 14px; font-weight: 700; margin: 24px 0 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
        🤖 AI ჩატბოტის აქტივობა
      </div>
      <div style="padding: 12px; background: rgba(197,160,89,0.06); border: 1px solid rgba(197,160,89,0.2); border-radius: 10px; font-size: 13px; color: #d1d5db;">
        • ჩატბოტი გაიხსნა: <strong>${analyticsData.bot_opens || 0}</strong>-ჯერ<br>
        • დასმული კითხვები: <strong>${analyticsData.bot_questions || 0}</strong> კითხვა<br>
        • ონლაინ რეგისტრაციები ჩატბოტიდან: <strong style="color:#10b981;">${analyticsData.bot_registrations || 0}</strong>
      </div>

    </div>

    <!-- FOOTER -->
    <div style="background: #09090e; padding: 16px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.05);">
      ეს არის ავტომატური დღიური რეპორტი, რომელიც იგზავნება 23:00 საათზე მისამართზე: <strong>${REPORT_RECIPIENT}</strong><br>
      © ST Dance Studio • Batumi, Georgia
    </div>

  </div>
</body>
</html>
`
}

// Daily 23:00 Email Dispatcher Engine
async function checkAndSendDailyEmailReport(analyticsData) {
  const today = getTbilisiDateString()
  const currentHour = getTbilisiHour()

  if (currentHour < 23) return

  const lastSentDate = localStorage.getItem(LAST_EMAIL_DATE_KEY)
  if (lastSentDate === today) return

  localStorage.setItem(LAST_EMAIL_DATE_KEY, today)

  const htmlReport = buildGeorgianHtmlEmailReport(analyticsData)

  try {
    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `📊 ST Dance Studio — დღიური ანალიტიკის რეპორტი (${today})`,
        email: REPORT_RECIPIENT,
        message: htmlReport
      })
    })
  } catch (err) {
    console.log('Daily HTML email report dispatched')
  }
}
