import React from 'react'

/**
 * Replaces occurrences of Telegram handle links and news URLs with clickable anchor tags for ST Dance Studio.
 */
export function renderTextWithTelegramLinks(text) {
  if (!text || typeof text !== 'string') return text

  // 1. Process Telegram handle @STDance_Buchhalter
  const hasTelegram = text.includes('@STDance_Buchhalter')
  const hasNewsUrl = text.includes('https://stdance.ge/news/season-opening-2026') || text.includes('/news/season-opening-2026')

  if (!hasTelegram && !hasNewsUrl) return text

  // Helper to convert text with news link
  const linkifyNews = (str) => {
    const newsTarget = 'https://stdance.ge/news/season-opening-2026'
    if (str.includes(newsTarget)) {
      const parts = str.split(newsTarget)
      return parts.map((p, idx) => (
        <React.Fragment key={idx}>
          {p}
          {idx < parts.length - 1 && (
            <a
              href="/news/season-opening-2026"
              style={{
                color: 'var(--color-gold, #d4a64a)',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              https://stdance.ge/news/season-opening-2026
            </a>
          )}
        </React.Fragment>
      ))
    }
    return str
  }

  if (hasTelegram) {
    const parts = text.split('@STDance_Buchhalter')
    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {linkifyNews(part)}
            {index < parts.length - 1 && (
              <a
                href="https://t.me/STDance_Buchhalter"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0088cc',
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                @STDance_Buchhalter
              </a>
            )}
          </React.Fragment>
        ))}
      </span>
    )
  }

  return <span>{linkifyNews(text)}</span>
}
