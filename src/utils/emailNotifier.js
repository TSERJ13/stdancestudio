/**
 * Sends unanswered questions and phone lead notifications directly to studio administration email: stdancegroupdue@gmail.com
 */
export async function sendLeadToAdminEmail({ name, phone, question, lang = 'ka' }) {
  if (!phone) return

  try {
    const subjectLine = `📞 ახალი ლიდი AI ჩატიდან: ${name || 'სტუმარი'} (ტელ: ${phone})`
    const bodyContent = `
=== ST DANCE STUDIO — ახალი კონტაქტი AI ჩატიდან ===

👤 მოსწავლის / მშობლის სახელი: ${name || 'მითითებული არ არის'}
📞 ტელეფონის ნომერი (WhatsApp): ${phone}
❓ დასმული შეკითხვა: ${question || 'ზოგადი კონსულტაცია'}
📅 თარიღი & დრო: ${new Date().toLocaleString('ka-GE')}
🌐 ენა: ${lang}

==========================================
გთხოვთ უმოკლეს დროში დაუკავშირდეთ ამ ნომერზე!
`

    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://stdance.ge',
        'Referer': 'https://stdance.ge'
      },
      body: JSON.stringify({
        name: 'ST Dance Studio AI Lead System',
        email: 'stdancegroupdue@gmail.com',
        _subject: subjectLine,
        contact_name: name || 'სტუმარი',
        phone: phone,
        question: question || 'ზოგადი შეკითხვა',
        details: bodyContent
      })
    })
    console.log('✅ Lead successfully sent to stdancegroupdue@gmail.com:', phone)
  } catch (err) {
    console.error('❌ Error sending lead email to admin:', err)
  }
}

export async function sendUnansweredQuestionToAdminEmail(query, lang = 'ka') {
  if (!query || typeof query !== 'string' || !query.trim()) return

  try {
    await fetch('https://formsubmit.co/ajax/stdancegroupdue@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://stdance.ge',
        'Referer': 'https://stdance.ge'
      },
      body: JSON.stringify({
        name: 'ST Dance Studio AI Bot',
        email: 'stdancegroupdue@gmail.com',
        _subject: `🤖 ST Dance AI — ახალი შეკითხვა მომხმარებლისგან`,
        user_question: query,
        language: lang,
        timestamp: new Date().toLocaleString('ka-GE')
      })
    })
  } catch (err) {
    console.error('❌ Error sending unanswered question email to admin:', err)
  }
}
