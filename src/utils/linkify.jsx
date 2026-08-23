import React from 'react'

/**
 * Replaces occurrences of Telegram handle links with a clickable Telegram anchor tag for ST Dance Studio.
 */
export function renderTextWithTelegramLinks(text) {
  if (!text || typeof text !== 'string') return text

  const targetHandles = ['@STDance_Buchhalter', '@STDanceStudio', '@stdancestudio']

  let hasTarget = false
  targetHandles.forEach(h => {
    if (text.includes(h)) hasTarget = true
  })

  if (!hasTarget) return text

  let cleanText = text
    .split('@STDance_Buchhalter').join('ადმინისტრაციას (WhatsApp: +995 514 19 99 66)')

  return (
    <span>
      {cleanText}
    </span>
  )
}
