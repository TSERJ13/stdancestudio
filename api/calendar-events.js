// Vercel Serverless Function: Fetch and Parse Live Google Calendar Events
// Endpoint: https://stdance.ge/api/calendar-events

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const icsUrl = 'https://calendar.google.com/calendar/ical/stdancegroup%40gmail.com/public/basic.ics';

  try {
    const response = await fetch(icsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; STDanceStudio/1.0)'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to fetch calendar from Google' });
    }

    const text = await response.text();
    const events = parseIcsToWeeklyEvents(text);

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      events
    });
  } catch (err) {
    console.error('Calendar sync error:', err);
    return res.status(500).json({ error: 'Calendar fetch error', message: err.message });
  }
}

function parseIcsToWeeklyEvents(icsContent) {
  const dayNames = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const rawEvents = icsContent.split('BEGIN:VEVENT').slice(1);
  const result = [];

  const getCat = (t) => {
    const s = t.toLowerCase();
    if (s.includes('fitness') || s.includes('fly')) return 'fitness';
    if (s.includes('baby')) return 'kids';
    if (s.includes('ind') || s.includes('makar')) return 'private';
    if (s.includes('ballet')) return 'ballet';
    if (s.includes('tango')) return 'adults';
    return 'group';
  };

  const getColor = (t, cat) => {
    const s = t.toLowerCase();
    if (s.includes('golden')) return '#ff5722';
    if (s.includes('pre silver')) return '#039be5';
    if (s.includes('couples') || s.includes('წყვილ')) return '#8e24aa';
    if (s.includes('silver')) return '#78909c';
    if (s.includes('bronza') || s.includes('bronze')) return '#d96b5c';
    if (s.includes('starter')) return '#3f51b5';
    if (s.includes('baby')) return '#f3b23e';
    if (s.includes('hobby')) return '#e91e63';
    if (s.includes('tango')) return '#d50000';
    if (s.includes('fly')) return '#e06d53';
    if (s.includes('fitness')) return '#00b0ff';
    if (s.includes('ballet')) return '#ab47bc';
    if (cat === 'private' || s.includes('ind')) return '#0b8043';
    return '#d4a64a';
  };

  for (const block of rawEvents) {
    const dtstartMatch = block.match(/DTSTART(?:;TZID=[^:]+)?:(\d{8}T\d{6})/);
    const dtendMatch = block.match(/DTEND(?:;TZID=[^:]+)?:(\d{8}T\d{6})/);
    const rruleMatch = block.match(/RRULE:([^\r\n]+)/);
    const summaryMatch = block.match(/SUMMARY:([^\r\n]+)/);

    if (!dtstartMatch || !summaryMatch) continue;

    const startDt = dtstartMatch[1];
    const endDt = dtendMatch ? dtendMatch[1] : '';
    const rrule = rruleMatch ? rruleMatch[1] : '';
    const summary = summaryMatch[1].trim();

    if (rrule) {
      // Check UNTIL
      const untilMatch = rrule.match(/UNTIL=(\d{8})/);
      if (untilMatch && parseInt(untilMatch[1], 10) < 20261001) {
        continue;
      }

      const bydayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
      let days = [];
      if (bydayMatch) {
        days = bydayMatch[1].split(',');
      } else {
        const y = parseInt(startDt.slice(0, 4), 10);
        const m = parseInt(startDt.slice(4, 6), 10) - 1;
        const d = parseInt(startDt.slice(6, 8), 10);
        const jsDay = new Date(Date.UTC(y, m, d)).getUTCDay();
        const monIdx = jsDay === 0 ? 6 : jsDay - 1;
        days = [dayNames[monIdx]];
      }

      const startTimeStr = `${startDt.slice(9, 11)}:${startDt.slice(11, 13)}`;
      const endTimeStr = endDt ? `${endDt.slice(9, 11)}:${endDt.slice(11, 13)}` : '';
      const timeDisplay = endTimeStr ? `${startTimeStr} – ${endTimeStr}` : startTimeStr;

      const category = getCat(summary);
      const color = getColor(summary, category);

      for (const dayCode of days) {
        const dIdx = dayNames.indexOf(dayCode);
        if (dIdx !== -1) {
          result.push({
            day: dIdx,
            title: summary,
            time: timeDisplay,
            category,
            color
          });
        }
      }
    }
  }

  // Sort by day then by time
  result.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });

  return result;
}
