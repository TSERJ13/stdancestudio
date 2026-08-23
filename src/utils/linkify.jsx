import React from 'react'

/**
 * Replaces occurrences of @STDance_Buchhalter (and similar handle links) with a clickable Telegram anchor tag.
 */
export function renderTextWithTelegramLinks(text) {
  if (!text || typeof text !== 'string') return text

  const targetHandle = '@STDance_Buchhalter'
  if (!text.includes(targetHandle)) return text

  const parts = text.split(targetHandle)

  return (
    <>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part}
          {idx < parts.length - 1 && (
            <a
              href="https://t.me/STDance_Buchhalter"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-gold, #d4a64a)',
                textDecoration: 'underline',
                fontWeight: '700',
                wordBreak: 'break-all'
              }}
            >
              @STDance_Buchhalter
            </a>
          )}
        </React.Fragment>
      ))}
    </>
  )
}
