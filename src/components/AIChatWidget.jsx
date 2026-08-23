import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import { submitRegistration } from '../data/classcore'
import { studioKnowledgeBase } from '../data/aiKnowledge'
import { trackAnalyticsEvent } from '../utils/analytics'
import { renderTextWithTelegramLinks } from '../utils/linkify'
import { sendUnansweredQuestionToAdminEmail, sendLeadToAdminEmail } from '../utils/emailNotifier'
import { geoLatinToGeorgian, isGeoLatinInput } from '../utils/transliterateGeoLatin'
import './AIChatWidget.css'

const GEMINI_KEY = atob('QVEuQWI4Uk42SnhSZVRtaWZfOEFCSHBnUWhLRS11dmhlUG5YMTdYSkhBaTZNQjZQQm9ZUg==')

// Multi-language UI & Registration Form translations dictionary
const botTranslations = {
  ka: {
    botTitle: 'ST Dance AI ასისტენტი',
    tooltip: 'AI ასისტენტი • გაქვს კითხვები?',
    subtitle: 'ონლაინ ასისტენტი • 24/7',
    regBtn: 'რეგისტრაცია',
    backBtn: 'ჩატზე დაბრუნება',
    inputPlaceholder: 'ჰკითხეთ AI-ს რაიმე...',
    welcome: 'გამარჯობა! მე ვარ ST Dance Studio-ს AI ასისტენტი. რა გაინტერესებთ სტუდიის შესახებ?',
    pillPrice: '💰 რა ღირს აბონემენტი?',
    pillSchedule: '📅 განრიგი',
    pillDressCode: '👔 ჩაცმულობა',
    pillRules: '📜 წესები',
    pillRegister: '✨ რეგისტრაცია',
    pillAddress: '📍 მისამართი',
    regTitle: 'ონლაინ რეგისტრაცია',
    regSub: 'ჩაეწერეთ 100%-ით უფასო საცდელ გაკვეთილზე',
    studentNameLabel: 'მოსწავლის სახელი და გვარი *',
    studentNamePlaceholder: 'მაგ: ნინი ბერიძე',
    birthDateLabel: 'დაბადების თარიღი *',
    groupLabel: 'სასურველი ჯგუფი *',
    parentNameLabel: 'მშობლის სახელი და გვარი *',
    parentNamePlaceholder: 'მაგ: გიორგი ბერიძე',
    parentPhoneLabel: 'მშობლის ტელეფონი (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'რეგისტრაციის გაგზავნა ➔',
    groups: [
      'Baby ჯგუფი (4.5-6 წელი) | 17:30 (130₾/თვე)',
      'Bronze ჯგუფი (დამწყებები) | 18:15 (130₾/თვე)',
      'Pre-Silver ჯგუფი (1 წლიანი გამოცდილება) | 17:30 (130₾/თვე)',
      'Silver ჯგუფი (2+ წლიანი გამოცდილება) | 19:30 (130₾/თვე)',
      'Golden ჯგუფი (5+ წლიანი გამოცდილება) | 16:30 (130₾/თვე)',
      'წყვილების ჯგუფი | 18:30 (130₾/თვე)',
      'Hobby Class (მოყვარულები/ზრდასრულები) | 19:15 (120₾/თვე)',
      'ინდივიდუალური გაკვეთილები (70₾ - 400₾)'
    ]
  },
  en: {
    botTitle: 'ST Dance AI Assistant',
    tooltip: 'AI Assistant • Have questions?',
    subtitle: 'Online Assistant • 24/7',
    regBtn: 'Registration',
    backBtn: 'Back to Chat',
    inputPlaceholder: 'Ask AI anything...',
    welcome: 'Hello! I am ST Dance Studio AI Assistant. How can I help you today?',
    pillPrice: '💰 Prices & Packages',
    pillSchedule: '📅 Schedule',
    pillDressCode: '👔 Dress Code',
    pillRules: '📜 Rules',
    pillRegister: '✨ Register',
    pillAddress: '📍 Location',
    regTitle: 'Online Registration',
    regSub: 'Sign up for 100% Free Trial Lesson',
    studentNameLabel: "Student's Full Name *",
    studentNamePlaceholder: 'e.g. Nini Beridze',
    birthDateLabel: 'Date of Birth *',
    groupLabel: 'Select Group *',
    parentNameLabel: "Parent's Full Name *",
    parentNamePlaceholder: 'e.g. Giorgi Beridze',
    parentPhoneLabel: 'Parent Phone (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'Submit Registration ➔',
    groups: [
      'Baby Group (Ages 4.5-6) | 17:30 (130 GEL/mo)',
      'Bronze Group (Beginners) | 18:15 (130 GEL/mo)',
      'Pre-Silver Group (1 Yr Exp) | 17:30 (130 GEL/mo)',
      'Silver Group (2+ Yrs Exp) | 19:30 (130 GEL/mo)',
      'Golden Group (5+ Yrs Exp) | 16:30 (130 GEL/mo)',
      'Couples Group | 18:30 (130 GEL/mo)',
      'Hobby Class (Adults / Amateurs) | 19:15 (120 GEL/mo)',
      'Private Coaching (70 GEL - 400 GEL)'
    ]
  },
  ru: {
    botTitle: 'ST Dance AI Помощник',
    tooltip: 'AI Помощник • Есть вопросы?',
    subtitle: 'Онлайн ассистент • 24/7',
    regBtn: 'Регистрация',
    backBtn: 'Назад в чат',
    inputPlaceholder: 'Спросите AI...',
    welcome: 'Здравствуйте! Я AI-помощник ST Dance Studio. Чем могу помочь?',
    pillPrice: '💰 Цены и абонементы',
    pillSchedule: '📅 Расписание',
    pillDressCode: '👔 Дресс-код',
    pillRules: '📜 Правила',
    pillRegister: '✨ Регистрация',
    pillAddress: '📍 Локация',
    regTitle: 'Онлайн регистрация',
    regSub: 'Запишитесь на 100% бесплатный пробный урок',
    studentNameLabel: 'Имя и фамилия ученика *',
    studentNamePlaceholder: 'Например: Нини Беридзе',
    birthDateLabel: 'Дата рождения *',
    groupLabel: 'Желаемая группа *',
    parentNameLabel: 'Имя и фамилия родителя *',
    parentNamePlaceholder: 'Например: Георгий Беридзе',
    parentPhoneLabel: 'Телефон родителя (WhatsApp) *',
    parentPhonePlaceholder: '+995 5XX XX XX XX',
    submitBtn: 'Отправить регистрацию ➔',
    groups: [
      'Baby группа (4.5-6 лет) | 17:30 (130 GEL/мес)',
      'Bronze группа (Новички) | 18:15 (130 GEL/мес)',
      'Pre-Silver группа (1 год опыта) | 17:30 (130 GEL/мес)',
      'Silver группа (2+ года опыта) | 19:30 (130 GEL/мес)',
      'Golden группа (5+ лет опыта) | 16:30 (130 GEL/мес)',
      'Группа для пар | 18:30 (130 GEL/мес)',
      'Hobby Class (Взрослые / Любители) | 19:15 (120 GEL/мес)',
      'Индивидуальные уроки (70 GEL - 400 GEL)'
    ]
  }
}

// Randomized Creative Fallback Helpers
function getRandomArrayItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Dynamic Smart Fallback Engine with randomized creative variations
export function getSmartFallbackAnswer(query, lang) {
  const q = query.toLowerCase()

  const kaIntros = [
    "✨ სიამოვნებით გაგიზიარებთ დეტალებს! ",
    "🌟 დიდი სიამოვნებით მოგიყვებით: ",
    "💃 ST Dance Studio-ს შესახებ სიამოვნებით გიპასუხებთ: ",
    "🏆 აი, ყველა საჭირო ინფორმაცია: "
  ]
  const intro = getRandomArrayItem(kaIntros)

  // 1. Pricing & Subscriptions
  if (
    q.includes('რა ღირს') ||
    q.includes('ფას') ||
    q.includes('აბონემენტ') ||
    q.includes('ღირს') ||
    q.includes('გადახდ') ||
    q.includes('price') ||
    q.includes('cost') ||
    q.includes('fee') ||
    q.includes('rate') ||
    q.includes('subscription') ||
    q.includes('discount') ||
    q.includes('how much') ||
    q.includes('цена') ||
    q.includes('цены') ||
    q.includes('сколько') ||
    q.includes('стоит') ||
    q.includes('стоимость') ||
    q.includes('абонемент') ||
    q.includes('оплат') ||
    q.includes('скидк')
  ) {
    if (lang === 'ka') {
      return `${intro}

💰 ST DANCE STUDIO — ფასები და პაკეტები:

🎁 პირველი საცდელი გაკვეთილი: 100% უფასოა!

🔹 თვიური ჯგუფური აბონემენტი: 130₾ / თვე (12 მეცადინეობა)
🔹 დედმამიშვილების სპეც-ფასდაკლება: 100₾ 1 მოსწავლეზე (200₾ ორივეზე)

👤 პერსონალური / ინდივიდუალური გაკვეთილები:
• 1 გაკვეთილი = 70₾
• 4 გაკვეთილის პაკეტი = 240₾
• 8 გაკვეთილის პაკეტი = 400₾`
    } else if (lang === 'ru') {
      return `💰 ST DANCE STUDIO — Цены и Абонементы:

🎁 Первый пробный урок: 100% Бесплатно!

🔹 Месячный групповой абонемент: 130 GEL / месяц (12 занятий)
🔹 Скидка для братьев и сестер: 100 GEL за ученика (200 GEL за двоих)

👤 Индивидуальные / Персональные уроки:
• 1 урок = 70 GEL
• Пакет из 4 уроков = 240 GEL
• Пакет из 8 уроков = 400 GEL`
    } else {
      return `💰 ST DANCE STUDIO — Pricing & Packages:

🎁 First Trial Lesson: 100% FREE!

🔹 Monthly Group Subscription: 130 GEL / month (12 lessons)
🔹 Sibling Discount: 100 GEL per student (200 GEL total for 2 siblings)

👤 Private Individual Coaching:
• 1 Lesson = 70 GEL
• 4 Lessons Package = 240 GEL
• 8 Lessons Package = 400 GEL`
    }
  }

  // 2. Schedule & Groups
  if (
    q.includes('განრიგ') ||
    q.includes('გრაფიკ') ||
    q.includes('როდის') ||
    q.includes('საათ') ||
    q.includes('დღე') ||
    q.includes('schedule') ||
    q.includes('days') ||
    q.includes('расписание')
  ) {
    if (lang === 'ka') {
      return `${intro}

📅 ST DANCE STUDIO — მეცადინეობების გრაფიკი:

👶 Baby ჯგუფი (4.5 – 6 წელი)
• სამშაბათი & ხუთშაბათი: 17:30 + შაბათი: 10:00

🥉 Bronze ჯგუფი (დამწყებები)
• სამშაბათი & ხუთშაბათი: 18:15 – 19:15

🥈 Pre-Silver ჯგუფი (1 წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 17:30

🥇 Silver ჯგუფი (2+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 19:30

🏆 Golden ჯგუფი (5+ წლიანი გამოცდილება)
• ორშაბათი, ოთხშაბათი, პარასკევი: 16:30

💃 წყვილების ჯგუფი: ორშაბათი, ოთხშაბათი, პარასკევი 18:30
✨ Hobby Class (ზრდასრულები/მოყვარულები): სამშაბათი & ხუთშაბათი 19:15`
    } else if (lang === 'ru') {
      return `📅 ST DANCE STUDIO — Расписание:

👶 Baby группа (4.5 – 6 лет): Вт и Чт 17:30 + Сб 10:00
🥉 Bronze (Новички): Вт и Чт 18:15
🥈 Pre-Silver (1 год оп.): Пн, Ср, Пт 17:30
🥇 Silver (2+ года): Пн, Ср, Пт 19:30
🏆 Golden (5+ лет): Пн, Ср, Пт 16:30
💃 Группа пар: Пн, Ср, Пт 18:30
✨ Hobby Class (Взрослые): Вт и Чт 19:15`
    } else {
      return `📅 ST DANCE STUDIO — Class Schedule:

👶 Baby Group (4.5 – 6 yrs): Tue & Thu 17:30 + Sat 10:00
🥉 Bronze Group (Beginners): Tue & Thu 18:15
🥈 Pre-Silver Group (1 Yr Exp): Mon, Wed, Fri 17:30
🥇 Silver Group (2+ Yrs Exp): Mon, Wed, Fri 19:30
🏆 Golden Group (5+ Yrs Exp): Mon, Wed, Fri 16:30
💃 Couples Group: Mon, Wed, Fri 18:30
✨ Hobby Class (Adults): Tue & Thu 19:15`
    }
  }

  // 3. Location, Address & Contact
  if (
    q.includes('მისამართ') ||
    q.includes('სად') ||
    q.includes('მდებარეობ') ||
    q.includes('ლოკაცი') ||
    q.includes('მაპ') ||
    q.includes('რუკ') ||
    q.includes('როგორ მოვიდ') ||
    q.includes('location') ||
    q.includes('address') ||
    q.includes('where') ||
    q.includes('map') ||
    q.includes('find') ||
    q.includes('directions') ||
    q.includes('где') ||
    q.includes('адрес') ||
    q.includes('карта') ||
    q.includes('находитесь') ||
    q.includes('как добраться') ||
    q.includes('локация') ||
    q.includes('კონტაქტ') ||
    q.includes('contact') ||
    q.includes('контакт') ||
    q.includes('ტელეფონ') ||
    q.includes('телефон') ||
    q.includes('phone') ||
    q.includes('ნომერ')
  ) {
    return (
      <div className="std-bot-contact-card" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '0.95rem' }}>
          📍 <strong>ST DANCE STUDIO — {lang === 'ka' ? 'ლოკაცია:' : lang === 'ru' ? 'Адрес:' : 'Location:'}</strong>
        </p>
        <p style={{ margin: '0 0 10px 0', color: '#e8d3a7' }}>
          🏛️ {lang === 'ka' ? 'ქ. ბათუმი, ექვთიმე თაყაიშვილის ქუჩა №55 (3-სართულიანი თეთრი შენობის მე-3 სართული).' : 
               lang === 'ru' ? 'г. Батуми, ул. Эка Такаишвили 55 (3 этаж 3-этажного белого здания).' : 
               '55 Eka Takaishvili St, Batumi, Georgia (3rd Floor of white 3-story building).'}
        </p>

        {/* Embedded Interactive Google Map */}
        <div style={{ margin: '10px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,166,74,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          <iframe
            title="ST Dance Studio Google Map"
            src="https://maps.google.com/maps?q=ST+DANCE+STUDIO+Batumi+Eka+Takaishvili+55&z=16&output=embed"
            width="100%"
            height="150"
            style={{ border: 0, display: 'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Open in Google Maps Button */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=ST+DANCE+STUDIO+Batumi+Eka+Takaishvili+55" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #d4af37, #f0c878)', 
              color: '#0a0908', 
              textDecoration: 'none', 
              padding: '8px 14px', 
              borderRadius: '20px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(212,175,55,0.35)',
              transition: 'transform 0.2s ease'
            }}
          >
            🗺️ {lang === 'ka' ? 'Google Maps-ში გახსნა' : lang === 'ru' ? 'Открыть в Google Maps' : 'Open in Google Maps'}
          </a>
        </div>

        <p style={{ margin: '0 0 10px 0' }}>
          📞 <strong>{lang === 'ka' ? 'ტელეფონი:' : lang === 'ru' ? 'Тел:' : 'Phone:'}</strong> +995 514 19 99 66
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a href="tel:+995514199966" style={{ background: 'rgba(212,175,55,0.15)', color: '#f0c878', border: '1px solid #d4af37', textDecoration: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
            📞 {lang === 'ka' ? 'დარეკვა' : lang === 'ru' ? 'Позвонить' : 'Call'}
          </a>
          <a href="https://wa.me/995514199966" target="_blank" rel="noreferrer" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', border: '1px solid #25D366', textDecoration: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
            💬 WhatsApp
          </a>
          <a href="https://t.me/+995514199966" target="_blank" rel="noreferrer" style={{ background: 'rgba(0, 136, 204, 0.15)', color: '#0088cc', border: '1px solid #0088cc', textDecoration: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
            ✈️ Telegram
          </a>
          <a href="https://instagram.com/stdancestudio.ge" target="_blank" rel="noreferrer" style={{ background: 'rgba(225, 48, 108, 0.15)', color: '#e1306c', border: '1px solid #e1306c', textDecoration: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '0.82rem', fontWeight: '600' }}>
            📸 Instagram
          </a>
        </div>
      </div>
    );
  }

  // 4. Dress Code & Outfits
  if (
    q.includes('ჩაცმულობ') ||
    q.includes('ტანსაცმელ') ||
    q.includes('აუტფიტ') ||
    q.includes('კაბ') ||
    q.includes('dress') ||
    q.includes('outfit') ||
    q.includes('дресс') ||
    q.includes('одежда') ||
    q.includes('костюм')
  ) {
    const boysLinks = [
      { text: lang === 'ka' ? 'ვარიანტი 1' : lang === 'ru' ? 'Вариант 1' : 'Option 1', url: 'https://link.stdance.ge/QgmQ1I' },
      { text: lang === 'ka' ? 'ვარიანტი 2' : lang === 'ru' ? 'Вариант 2' : 'Option 2', url: 'https://link.stdance.ge/H1e2EM' },
      { text: lang === 'ka' ? 'ვარიანტი 3' : lang === 'ru' ? 'Вариант 3' : 'Option 3', url: 'https://link.stdance.ge/tuOcHA' },
      { text: lang === 'ka' ? 'ვარიანტი 4' : lang === 'ru' ? 'Вариант 4' : 'Option 4', url: 'https://link.stdance.ge/UOTfmo' },
      { text: lang === 'ka' ? 'ვარიანტი 5' : lang === 'ru' ? 'Вариант 5' : 'Option 5', url: 'https://link.stdance.ge/Pf3aGG' }
    ]

    const girlsLinks = [
      { text: '1', url: 'https://link.stdance.ge/WMkI7b' },
      { text: '2', url: 'https://link.stdance.ge/4oin9a' },
      { text: '3', url: 'https://link.stdance.ge/WXuRkQ' },
      { text: '4', url: 'https://link.stdance.ge/hPAAyl' },
      { text: '5', url: 'https://link.stdance.ge/RU8Tnp' },
      { text: '6', url: 'https://link.stdance.ge/qDWU62' },
      { text: '7', url: 'https://link.stdance.ge/HCrSdw' },
      { text: '8', url: 'https://link.stdance.ge/e05ynF' },
      { text: '9', url: 'https://link.stdance.ge/Nkj71x' },
      { text: '10', url: 'https://link.stdance.ge/9kjYp7' },
      { text: '11', url: 'https://link.stdance.ge/xuKlGT' },
      { text: '12', url: 'https://link.stdance.ge/7ulMkn' },
      { text: '13', url: 'https://link.stdance.ge/zKx3e6' },
      { text: '14', url: 'https://link.stdance.ge/caFJCS' }
    ]

    return (
      <div className="std-bot-dresscode-card" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#f0c878' }}>
          👗 ST DANCE STUDIO — {lang === 'ka' ? 'ჩაცმულობის წესი (Dress Code):' : lang === 'ru' ? 'Правила Дресс-кода:' : 'Dress Code Regulations:'}
        </p>

        <p style={{ margin: '0 0 12px 0', color: '#d8d3c5', fontSize: '0.88rem' }}>
          {lang === 'ka' 
            ? 'გაკვეთილზე მოსწავლეები დაიშვებიან მხოლოდ სამეჯლისო-სპორტული ცეკვების სპეციალური ტანსაცმლით (იკრძალება ქართული ცეკვების სავარჯიშოები, ყოველდღიური კაბები და ფიტნესის ტანსაცმელი).'
            : lang === 'ru'
            ? 'На занятия допускаются только ученики в специальной форме для спортивно-бальных танцев.'
            : 'Students must attend classes exclusively in official ballroom-sports dancewear.'}
        </p>

        {/* Boys Outfits Section */}
        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#fff', fontSize: '0.86rem' }}>
            👦 {lang === 'ka' ? 'ბიჭების აუტფიტები (5 ვარიანტი):' : lang === 'ru' ? 'Костюмы для мальчиков (5 вариантов):' : "Boys' Outfits (5 options):"}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {boysLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(212,166,74,0.15)',
                  color: '#f0c878',
                  border: '1px solid rgba(212,166,74,0.4)',
                  padding: '5px 11px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease'
                }}
              >
                👕 {item.text} ➔
              </a>
            ))}
          </div>
        </div>

        {/* Girls Outfits Section */}
        <div>
          <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: '#fff', fontSize: '0.86rem' }}>
            👧 {lang === 'ka' ? 'გოგონების აუტფიტები (14 ვარიანტი):' : lang === 'ru' ? 'Костюмы для девочек (14 вариантов):' : "Girls' Outfits (14 options):"}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {girlsLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(235, 130, 160, 0.15)',
                  color: '#ffb6c1',
                  border: '1px solid rgba(235, 130, 160, 0.4)',
                  padding: '5px 10px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease'
                }}
              >
                👗 {lang === 'ka' ? `ვარიანტი ${item.text}` : lang === 'ru' ? `Вариант ${item.text}` : `Option ${item.text}`} ➔
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 5. Rules, Terms, Privacy & Tournaments (Combined Clear & Comprehensive Summary)
  if (
    q.includes('წეს') ||
    q.includes('ტურშირ') ||
    q.includes('ტურისტ') ||
    q.includes('rule') ||
    q.includes('tournament') ||
    q.includes('правил') ||
    q.includes('турниრ') ||
    q.includes('პირობ') ||
    q.includes('კონფიდენციალურობ')
  ) {
    if (lang === 'ka') {
      return `${intro}

🏆 ST DANCE STUDIO — წესები, პირობები & ტურნირები (2026-2027):

1. ⏰ დრო & დისციპლინა: მოსწავლე მოდის 10 წუთით ადრე. დაგვიანებული სახლში ბრუნდება. დარბაზში ტელეფონები უხმო რეჟიმშია.
2. 👨‍👩‍👧 მშობლები: მშობელი ელოდება გარეთ; კატეგორიულად იკრძალება მწვრთნელის შეწუხება გაკვეთილის დროს.
3. 🩺 გაცდენები & გაყინვა: საპატიოდ ითვლება მხოლოდ ჯანმრთელობის მდგომარეობა (საჭიროა ექიმის ცნობა) და წინასწარი შეტყობინება სტუდიის ადმინისტრაციაში (WhatsApp: +995 514 19 99 66).
4. 👗 ჩაცმულობა: სავალდებულოა მხოლოდ სპორტულ-სამეჯლისო ცეკვების სპეციალური ფორმა.
5. 🏆 სატურნირო კალენდარი: სეზონზე დაგეგმილია 10 ძირითადი ტურნირი (ქუთაისი, თბილისი, ბათუმი, კავკასიის თასი & Batumi Open).
6. 🔒 კონფიდენციალურობა & მონაცემები: თქვენი მონაცემები დაცულია (stdancegroupdue@gmail.com).`
    } else if (lang === 'ru') {
      return `🏆 ST DANCE STUDIO — Правила, Условия и Турниры (2026-2027):

1. ⏰ Дисциплина: Приходить за 10 минут до начала.
2. 👨‍👩‍👧 Родители: Ожидают снаружи, не отвлекают тренера во время урока.
3. 🩺 Заморозка: Только по болезни (справка от врача + уведомление администрации в WhatsApp: +995 514 19 99 66).
4. 👗 Дресс-код: Обязательна только специальная бальная форма.
5. 🏆 Турнирный календарь: 10 главных турниров в сезоне 2026-2027.
6. 🔒 Конфиденциальность: Ваши данные защищены (stdancegroupdue@gmail.com).`
    } else {
      return `🏆 ST DANCE STUDIO — Rules, Terms & Tournaments (2026-2027):

1. ⏰ Discipline: Arrive 10 mins early. Phones on silent.
2. 👨‍👩‍👧 Parents: Please wait outside; strictly no interruptions during lessons.
3. 🩺 Absence & Freezing: Only medical health reasons qualify via doctor note and notification to studio management (WhatsApp: +995 514 19 99 66).
4. 👗 Dress Code: Mandatory official ballroom dancewear only.
5. 🏆 Competition Calendar: 10 major tournaments scheduled for 2026-2027.
6. 🔒 Data Privacy: Personal data protected under policy (stdancegroupdue@gmail.com).`
    }
  }

  // 6. 11-Month Educational Plan & Today's Lesson Algorithm
  if (
    q.includes('გეგმ') ||
    q.includes('პლან') ||
    q.includes('სილაბუს') ||
    q.includes('wdsf') ||
    q.includes('დღეს') ||
    q.includes('გაკვეთილ') ||
    q.includes('რა ვაკეთებთ') ||
    q.includes('პროგრამ') ||
    q.includes('ალგორითმ') ||
    q.includes('plan') ||
    q.includes('syllabus') ||
    q.includes('curriculum') ||
    q.includes('программ') ||
    q.includes('план') ||
    q.includes('сегодня')
  ) {
    if (lang === 'ka') {
      return `${intro}

🎓 ST DANCE STUDIO — 11-თვიანი საგანმანათლებლო გეგმა & WDSF ალგორითმი:

📍 დღევანდელი 60-წუთიანი გაკვეთილის სტრუქტურა:
• 15 წუთი: ტრენაჟი / ფეხის ტექნიკა (Footwork) & დგომი (Posture).
• 30 წუთი: ახსნა & ახალი WDSF ფიგურების დამუშავება.
• 15 წუთი: პრაქტიკა მუსიკაში დახვეწით & ფინალების პრაგონი.
*(შაბათობით 13:00-15:00: 120 წთ საბალეტო კლასიკა, ქორეოგრაფია & გაწელვები).*

🗓️ 11-თვიანი საგანმანათლებლო მაკრო-ციკლი (2026-2027):
1. აგვისტო – ოქტომბერი (I ეტაპი): ბაზის აღდგენა, დგომი & WDSF ფიგურები.
2. ნოემბერი – იანვარი (II ეტაპი): სატურნირო გამძლეობა & პროგრამების გასუფთავება.
3. თებერვალი – აპრილი (III ეტაპი): დინამიკა & AJS შეფასების სისტემა.
4. მაისი – ივლისი (IV ეტაპი): პიკური ფორმა (კავკასიის თასი & Batumi Open).

💡 დეტალური 11-თვიანი გეგმა და ჯგუფების WDSF ფიგურები იხილეთ საიტის /plan გვერდზე!`
    } else if (lang === 'ru') {
      return `🎓 ST DANCE STUDIO — 11-месячная учебная программа и алгоритм WDSF:

📍 Структура 60-минутного урока сегодня:
• 15 мин: Разминка / Техника стопы (Footwork) и осанка (Posture).
• 30 мин: Объяснение и отработка новых фигур WDSF.
• 15 мин: Практика под музыку и прогон финалов.
*(По субботам 13:00-15:00: 120 мин балетная классика, ОФП и растяжка).*

🗓️ 11-месячный макроцикл (2026-2027):
1. Август – Октябрь (I этап): Базовая техника и фигуры WDSF.
2. Ноябрь – Январь (II этап): Турнирная выносливость и чистка программ.
3. Февраль – Апрель (III этап): Динамика и система оценки AJS.
4. Май – Июль (IV этап): Пиковая форма (Кубок Кавказа и Batumi Open).

💡 Полный 11-месячный план смотрите на странице /plan!`
    } else {
      return `🎓 ST DANCE STUDIO — 11-Month Educational Plan & WDSF Algorithm:

📍 Today's 60-Minute Lesson Breakdown:
• 15 min: Warmup / Footwork technique & Posture.
• 30 min: WDSF figure breakdown & instruction.
• 15 min: Music practice & final runs.
*(Saturdays 13:00-15:00: 120 min classical ballet, conditioning & stretching).*

🗓️ 11-Month Macro Cycle (2026-2027):
1. Aug – Oct (Phase I): Base recovery, posture & WDSF figures.
2. Nov – Jan (Phase II): Competition stamina & program refinement.
3. Feb – Apr (Phase III): Dynamics & AJS judging system.
4. May – Jul (Phase IV): Peak form (Caucasus Cup & Batumi Open).

💡 Explore the full 11-month plan on /plan!`
    }
  }

  // 6. Unknown / Un-answered Specific Query Handling — Email Forward to stdancegroupdue@gmail.com
  sendUnansweredQuestionToAdminEmail(query, lang)

  if (lang === 'ka') {
    return `✨ გმადლობთ შეკითხვისთვის!

თქვენი შეკითხვა ("${query}") მიღებულია.

📱 **გთხოვთ დამიტოვოთ თქვენი ტელეფონის ნომერი (მაგ: 5XX XX XX XX)**, რომ ჩვენი მენეჯერი უმოკლეს დროში დაგიკავშირდეთ!

ასევე შეგიძლიათ პირდაპირ მოგვწეროთ WhatsApp-ზე: +995 514 19 99 66.`
  } else if (lang === 'ru') {
    return `✨ Спасибо за ваш вопрос!

Ваш запрос ("${query}") принят.

📱 **Пожалуйста, оставьте ваш номер телефона (например, +995 5XX XX XX XX)**, чтобы наш менеджер связался с вами!

Вы также можете написать нам напрямую в WhatsApp: +995 514 19 99 66.`
  } else {
    return `✨ Thank you for your question!

Your inquiry ("${query}") has been received.

📱 **Please leave your phone number (e.g. +995 5XX XX XX XX)** so our manager can call you directly!

You can also contact us on WhatsApp: +995 514 19 99 66.`
  }
}

export default function AIChatWidget() {
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  if (path.includes('/game') || path.includes('/dancing-bricks')) {
    return null
  }

  const { lang } = useLanguage()
  const activeTrans = botTranslations[lang] || botTranslations.ka

  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Registration Sub-Form State
  const [isRegMode, setIsRegMode] = useState(false)
  const [regForm, setRegForm] = useState({
    student_name: '',
    birth_date: '',
    shift: activeTrans.groups[0],
    parent_name: '',
    parent_phone: ''
  })
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: activeTrans.welcome
    }
  ])

  // Update initial welcome message & registration select group default when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'bot') {
setMessages([{ role: 'bot', text: activeTrans.welcome }])
    }
    setRegForm((prev) => ({ ...prev, shift: activeTrans.groups[0] }))
  }, [lang])

  // 5. Hide Tooltip after 6 seconds
  const [showTooltip, setShowTooltip] = useState(true)
  const tooltipRef = useRef(null)
  const avatarWrapRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 6000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // Listen for custom global trigger event "open-ai-chat"
  useEffect(() => {
    const handleGlobalOpen = () => {
      setIsOpen(true)
      trackAnalyticsEvent('bot_opened')
    }
    window.addEventListener('open-ai-chat', handleGlobalOpen)
    return () => window.removeEventListener('open-ai-chat', handleGlobalOpen)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Track opening
  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) trackAnalyticsEvent('bot_opened')
      return next
    })
  }

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isRegMode, isTyping])

  const [lastQuestion, setLastQuestion] = useState('')

  const handleSend = async (textToSend) => {
    let query = textToSend || inputMsg
    if (!query.trim() || isTyping) return

    // 1. Geo-Latin Transliteration Check (e.g. "ra cekvebs astavlit" -> "რა ცეკვებს ასწავლით")
    let processedQuery = query
    if (isGeoLatinInput(query)) {
      processedQuery = geoLatinToGeorgian(query)
    }

    trackAnalyticsEvent('bot_question_asked', { query, processedQuery })

    const newMsgs = [...messages, { role: 'user', text: query }]
    setMessages(newMsgs)
    setInputMsg('')
    setIsTyping(true)

    // 2. Phone Number Detection & Lead Dispatch
    const phoneMatch = query.match(/(?:\+?995\s*)?(?:5\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}|\d{9})/g)
    if (phoneMatch && phoneMatch.length > 0) {
      const capturedPhone = phoneMatch[0]
      await sendLeadToAdminEmail({
        name: 'სტუმარი AI ჩატიდან',
        phone: capturedPhone,
        question: lastQuestion || 'ზოგადი კონსულტაცია',
        lang
      })

      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: lang === 'ka'
              ? `✨ დიდი მადლობა! თქვენი ტელეფონის ნომერი (${capturedPhone}) წარმატებით მივიღეთ და გადავეცით ST Dance Studio-ს მენეჯერს. ჩვენი მენეჯერი უმოკლეს დროში დაგიკავშირდებათ! 📞\n\nასევე შეგიძლიათ პირდაპირ მოგვწეროთ WhatsApp-ზე: +995 514 19 99 66.`
              : `✨ Thank you! Your phone number (${capturedPhone}) has been received and forwarded to our studio manager. We will contact you shortly! 📞\n\nWhatsApp: +995 514 19 99 66.`
          }
        ])
      }, 400)
      return
    }

    // Save non-phone query as last question
    setLastQuestion(processedQuery)

    // Use processedQuery for lower casing and search
    const qLower = processedQuery.toLowerCase()
    if (
      qLower.includes('რეგისტრაცი') ||
      qLower.includes('დამარეგისტრირ') ||
      qLower.includes('ჩაწერ') ||
      qLower.includes('მიღებ') ||
      qLower.includes('register') ||
      qLower.includes('registration') ||
      qLower.includes('sign up') ||
      qLower.includes('signup') ||
      qLower.includes('enroll') ||
      qLower.includes('join') ||
      qLower.includes('trial') ||
      qLower.includes('регистраци') ||
      qLower.includes('зарегистр') ||
      qLower.includes('записаться') ||
      qLower.includes('запись') ||
      qLower.includes('запишите') ||
      qLower.includes('записать') ||
      qLower.includes('пробный')
    ) {
      trackAnalyticsEvent('bot_registration_triggered')
      setTimeout(() => {
        setIsTyping(false)
        setIsRegMode(true)
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text:
              lang === 'ka'
                ? '✨ ონლაინ რეგისტრაციის ფორმა გაგიხსენით. გთხოვთ შეავსოთ მოსწავლის მონაცემები 100% უფასო საცდელი გაკვეთილისთვის.'
                : lang === 'ru'
                ? '✨ Форма онлайн-регистрации открыта! Пожалуйста, заполните данные для 100% бесплатного пробного урока.'
                : '✨ Online registration form is ready! Please fill in student details for a 100% free trial lesson.'
          }
        ])
      }, 300)
      return
    }

    // Check Location & Address Intent across all 3 languages (GE, EN, RU)
    if (
      qLower.includes('მისამართ') ||
      qLower.includes('სად') ||
      qLower.includes('მდებარეობ') ||
      qLower.includes('ლოკაცი') ||
      qLower.includes('მაპ') ||
      qLower.includes('რუკ') ||
      qLower.includes('როგორ მოვიდ') ||
      qLower.includes('location') ||
      qLower.includes('address') ||
      qLower.includes('where') ||
      qLower.includes('map') ||
      qLower.includes('find') ||
      qLower.includes('directions') ||
      qLower.includes('где') ||
      qLower.includes('адрес') ||
      qLower.includes('карта') ||
      qLower.includes('находитесь') ||
      qLower.includes('как добраться') ||
      qLower.includes('локация')
    ) {
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: getSmartFallbackAnswer(query, lang)
          }
        ])
      }, 300)
      return
    }

    // Attempt Gemini AI Call with HIGH TEMPERATURE (0.95) for maximum creative phrasing & unique wording
    try {
      const langName = lang === 'ru' ? 'Russian (Русский)' : lang === 'en' ? 'English' : 'Georgian (ქართული)'
      const promptText = `You are ST DANCE STUDIO's smart, inspiring AI Assistant in Batumi, Georgia.

CRITICAL MULTILINGUAL & PRICING RULES:
1. ALWAYS respond in the target user language (${langName}). If the user asks in Russian, reply in fluent Russian. If in English, reply in fluent English. If in Georgian, reply in fluent Georgian.
2. When asked about prices, subscriptions, costs, or trial lessons in ANY language ("цена", "сколько стоит", "стоимость", "абонемент", "price", "cost", "fee", "რა ღირს", "ფასი"), ALWAYS state the exact pricing breakdown in that language:
   - Trial Lesson: 100% FREE! / 100% Бесплатно! / 100% უფასო!
   - Monthly Group Pass: 130 GEL/mo (12 lessons) / 130 GEL в месяц (12 занятий) / 130 ლარი თვეში (12 გაკვეთილი)
   - Sibling Discount: 100 GEL per student / 100 GEL за ученика (200 GEL за двоих) / 100 ლარი 1 მოსწავლეზე (200 ლარი 2 დედმამიშვილზე)
   - Private Coaching: 1 lesson = 70 GEL | 4 lessons = 240 GEL | 8 lessons = 400 GEL
3. Be friendly, polite, elegant, and helpful. Use emojis tastefully (📅, 💰, 📍, 🏆, 👶, ✨, 🎁, 💃, 🌟).

ST DANCE STUDIO OFFICIAL KNOWLEDGE BASE:
${studioKnowledgeBase}

USER QUESTION: ${query}`

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptText }]
              }
            ],
            generationConfig: {
              temperature: 0.95,
              topP: 0.95,
              topK: 40
            }
          })
        }
      )

      const data = await res.json()
      const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text

      setIsTyping(false)
      if (aiReply) {
        setMessages((prev) => [...prev, { role: 'bot', text: aiReply }])
      } else {
        const smartReply = getSmartFallbackAnswer(query, lang)
        setMessages((prev) => [...prev, { role: 'bot', text: smartReply }])
      }
    } catch (err) {
      setIsTyping(false)
      const smartReply = getSmartFallbackAnswer(query, lang)
      setMessages((prev) => [...prev, { role: 'bot', text: smartReply }])
    }
  }

  const handleRegSubmit = async (e) => {
    e.preventDefault()
    if (!regForm.student_name || !regForm.birth_date || !regForm.parent_name || !regForm.parent_phone) {
      return
    }
    setRegLoading(true)
    trackAnalyticsEvent('bot_registration_submitted', { name: regForm.student_name })

    const activeGroups = (translations[lang] || translations.ka).register.groups || []
    const selectedG = activeGroups.find(g => g.id === regForm.shift) || activeGroups[0] || {}

    const res = await submitRegistration({
      student_name: regForm.student_name,
      birth_date: regForm.birth_date,
      group_name: selectedG.name || regForm.shift,
      group: regForm.shift,
      group_schedule: selectedG.schedule || '',
      group_age: selectedG.age || '',
      shift: 'AI ბოტი',
      parent_name: regForm.parent_name,
      parent_phone: regForm.parent_phone,
      status: 'pending'
    })
    setRegLoading(false)
    if (res) {
      setRegSuccess(true)
      setRegForm({
        student_name: '',
        birth_date: '',
        shift: activeGroups[0]?.id || '',
        parent_name: '',
        parent_phone: ''
      })
    }
  }

  return (
    <>
      {/* 1. FLOATING LUXURY OBSIDIAN & CHAMPAGNE GOLD BOT BUTTON */}
      <div className="std-bot-widget-container">
        {/* Floating Tooltip Bubble with Dynamic Language */}
        {!isOpen && showTooltip && (
          <div ref={tooltipRef} className="std-bot-tooltip-bubble" onClick={toggleOpen}>
            <span className="std-bot-pulse-dot"></span>
            <span>{activeTrans.tooltip}</span>
          </div>
        )}

        {/* 3D Gold & Obsidian Mascot Trigger */}
        <button
          className={`std-bot-trigger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={toggleOpen}
          aria-label="ST Dance AI Chatbot"
        >
          <div className="std-bot-avatar-3d-wrap" ref={avatarWrapRef}>
            {/* Dark Obsidian Circle with Gold Border */}
            <div className="std-bot-3d-sphere"></div>
            {/* Pure Champagne Gold Robot Icon with Blinking Eyes */}
            <svg
              className="std-bot-3d-robot-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
              style={{ overflow: 'visible' }}
            >
              <rect x="3" y="11" width="18" height="10" rx="4" fill="rgba(212,175,55,0.1)" />
              <circle cx="8.5" cy="15.5" r="1.5" fill="#d4af37" className="robot-eye" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="#d4af37" className="robot-eye" />
              <path d="M12 2v4" stroke="#d4af37" strokeLinecap="round" />
              <circle cx="12" cy="2" r="1.2" fill="#d4af37" />
              <rect x="9.5" y="18.5" width="5" height="1" rx="0.5" fill="#d4af37" stroke="none" className="robot-mouth" />
            </svg>
            <span className="std-bot-ring-aura"></span>
          </div>
        </button>
      </div>

      {/* 2. CHAT MODAL / FULLSCREEN MOBILE DRAWER */}
      {isOpen && (
        <div className="std-bot-overlay" onClick={() => setIsOpen(false)}>
          <div className="std-bot-modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Top Drag Handle */}
            <div className="std-bot-mobile-handle"></div>

            {/* Modal Header */}
            <div className="std-bot-header">
              <div className="std-bot-header-info">
                <div className="std-bot-avatar-badge">
                  <span>AI</span>
                </div>
                <div>
                  <h3 className="std-bot-title">{t.botTitle}</h3>
                  <p className="std-bot-subtitle">{activeTrans.subtitle}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className={`std-bot-mode-btn ${isRegMode ? 'active' : ''}`}
                  onClick={() => setIsRegMode(!isRegMode)}
                >
                  {isRegMode ? activeTrans.backBtn : activeTrans.regBtn}
                </button>
                <button className="std-bot-close-btn" onClick={() => setIsOpen(false)}>
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Registration Mode OR Normal Chat */}
            {isRegMode ? (
              <div className="std-bot-reg-container">
                {regSuccess ? (
                  <div className="std-bot-reg-success">
                    <div className="std-bot-success-icon">✓</div>
                    <h4>{lang === 'ka' ? 'რეგისტრაცია მიღებულია!' : lang === 'ru' ? 'Регистрация принята!' : 'Registration Successful!'}</h4>
                    <p>{lang === 'ka' ? 'ჩვენი ადმინისტრატორი მალე დაგიკავშირდებათ WhatsApp-ზე ან ტელეფონზე.' : lang === 'ru' ? 'Наш администратор скоро свяжется с вами по WhatsApp или телефону.' : 'Our administrator will contact you shortly on WhatsApp or phone.'}</p>
                    <button
                      className="std-bot-submit-btn"
                      onClick={() => {
                        setRegSuccess(false)
                        setIsRegMode(false)
                      }}
                    >
                      {activeTrans.backBtn}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegSubmit} className="std-bot-reg-form">
                    <h4 className="std-bot-reg-title">{activeTrans.regTitle}</h4>
                    <p className="std-bot-reg-sub">{activeTrans.regSub}</p>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.studentNameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={activeTrans.studentNamePlaceholder}
                        value={regForm.student_name}
                        onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.birthDateLabel}</label>
                      <input
                        type="date"
                        required
                        value={regForm.birth_date}
                        onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          colorScheme: 'dark',
                          minHeight: '44px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(212,166,74,0.2)',
                          borderRadius: '6px',
                          color: '#fff',
                          padding: '10px 14px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.groupLabel}</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '2px' }}>
                        {((translations[lang] || translations.ka).register?.groups || []).map((g) => {
                          const isSelected = regForm.shift === g.id
                          const gColor = g.color || '#d4a64a'
                          return (
                            <div
                              key={g.id}
                              onClick={() => setRegForm({ ...regForm, shift: g.id })}
                              style={{
                                padding: '10px 12px',
                                background: isSelected ? `${gColor}22` : 'rgba(255,255,255,0.02)',
                                border: isSelected ? `1.5px solid ${gColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: '600', color: isSelected ? gColor : '#ffffff', fontSize: '13.5px' }}>
                                  {g.name}
                                </span>
                                <span style={{ fontSize: '10.5px', background: `${gColor}22`, color: gColor, border: `1px solid ${gColor}55`, padding: '2px 7px', borderRadius: '10px', fontWeight: '600', textTransform: 'uppercase' }}>
                                  {g.age}
                                </span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#a8a39a' }}>
                                {g.schedule}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.parentNameLabel}</label>
                      <input
                        type="text"
                        required
                        placeholder={activeTrans.parentNamePlaceholder}
                        value={regForm.parent_name}
                        onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })}
                      />
                    </div>

                    <div className="std-bot-form-group">
                      <label>{activeTrans.parentPhoneLabel}</label>
                      <input
                        type="tel"
                        required
                        placeholder={activeTrans.parentPhonePlaceholder}
                        value={regForm.parent_phone}
                        onChange={(e) => setRegForm({ ...regForm, parent_phone: e.target.value })}
                      />
                    </div>

                    <button type="submit" disabled={regLoading} className="std-bot-submit-btn">
                      {regLoading ? '...' : activeTrans.submitBtn}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="std-bot-chat-body">
                {/* Messages Viewport */}
                <div className="std-bot-messages-viewport">
                  {messages.map((m, i) => (
                    <div key={i} className={`std-bot-msg-row ${m.role}`}>
                      <div className="std-bot-msg-bubble">{renderTextWithTelegramLinks(m.text)}</div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="std-bot-msg-row bot">
                      <div className="std-bot-msg-bubble typing">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Fixed Non-Squishing Quick Suggestion Pills Row with Dynamic Languages */}
                <div className="std-bot-pills-wrapper">
                  <div className="std-bot-pills-row">
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillPrice)}>
                      {activeTrans.pillPrice}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillSchedule)}>
                      {activeTrans.pillSchedule}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillDressCode)}>
                      {activeTrans.pillDressCode}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillRules)}>
                      {activeTrans.pillRules}
                    </button>
                    <button className="std-bot-pill" onClick={() => handleSend(activeTrans.pillAddress)}>
                      {activeTrans.pillAddress}
                    </button>
                  </div>
                </div>

                {/* Chat Input Form */}
                <form
                  className="std-bot-input-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                >
                  <input
                    type="text"
                    className="std-bot-input"
                    placeholder={activeTrans.inputPlaceholder}
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                  />
                  <button type="submit" className="std-bot-send-btn" disabled={!inputMsg.trim()}>
                    ➔
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
