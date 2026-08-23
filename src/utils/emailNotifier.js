/**
 * Sends unanswered user questions directly to studio administration email: stdancegroupdue@gmail.com
 */
export async function sendUnansweredQuestionToAdminEmail(query, lang = 'ka') {
  if (!query || typeof query !== 'string' || !query.trim()) return

  try {
    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: '🤖 ST Dance AI Bot — ახალი შეკითხვა მომხმარებლისგან',
        user_question: query,
        language: lang,
        timestamp: new Date().toLocaleString(),
        page_url: typeof window !== 'undefined' ? window.location.href : ''
      })
    })
    console.log('✅ Unanswered question successfully sent to stdancegroupdue@gmail.com')
  } catch (err) {
    console.error('❌ Error sending unanswered question email to admin:', err)
  }
}
