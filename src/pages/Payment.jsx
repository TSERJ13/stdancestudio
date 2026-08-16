import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Payment() {
  const { lang, t } = useLanguage()
  const containerRef = useRef(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    // 1. Preload CSS safely without duplicates
    if (!document.querySelector('link[href*="checkout-vue/checkout.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://pay.flitt.com/latest/checkout-vue/checkout.css'
      document.head.appendChild(link)
    }

    // 2. Preload Fonts
    const fonts = [
      'https://pay.flitt.com/icons/dist/fonts/inter-regular.woff2',
      'https://pay.flitt.com/icons/dist/fonts/inter-medium.woff2',
      'https://pay.flitt.com/icons/dist/fonts/inter-semibold.woff2'
    ]
    fonts.forEach(url => {
      if (!document.querySelector(`link[href="${url}"]`)) {
        const preload = document.createElement('link')
        preload.rel = 'preload'
        preload.href = url
        preload.as = 'font'
        preload.type = 'font/woff2'
        preload.crossOrigin = 'anonymous'
        document.head.appendChild(preload)
      }
    })

    const flittLang = lang === 'ru' ? 'ru' : lang === 'en' ? 'en' : 'ka'

    const Options = {
      "params": {
        "button": "06de4d988f7d9d20431343ec102f63bb3ee73587"
      },
      "options": {
        "locales": [flittLang],
        "amount_readonly": false,
        "theme": {
          "type": "dark",
          "preset": "reset"
        },
        "methods": [
          "card"
        ],
        "endpoint": {
          "button": "/latest/checkout-v2/button/index.html",
          "gateway": "/latest/checkout-v2/index.html"
        },
        "api_domain": "pay.flitt.com",
        "card_icons": [
          "mastercard",
          "visa"
        ],
        "show_email": false,
        "show_title": false,
        "show_link": false,
        "show_order_desc": false,
        "methods_disabled": [],
        "fullScreen": false,
        "hide_button_title": false
      },
      "css_variable": {
        "main": "#d4af37",
        "card_bg": "#0a0b0d",
        "card_shadow": "#000000"
      }
    }

    const initCheckout = () => {
      const el = containerRef.current || document.getElementById('flitt-payment-container')
      if (window.checkout && el) {
        try {
          el.innerHTML = ''
          window.checkout(el, Options)
        } catch (err) {
          console.error("Flitt Checkout initialization error:", err)
          setLoadError(true)
        }
      }
    }

    // 3. If window.checkout is ALREADY loaded (e.g. page navigation), initialize immediately!
    if (window.checkout) {
      initCheckout()
      return
    }

    // 4. Check if script tag is already attached
    const existingScript = document.querySelector('script[src*="checkout-vue/checkout.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', initCheckout)
      return () => {
        existingScript.removeEventListener('load', initCheckout)
      }
    }

    // 5. Inject script safely
    const script = document.createElement('script')
    script.src = 'https://pay.flitt.com/latest/checkout-vue/checkout.js'
    script.async = true
    script.onload = initCheckout
    script.onerror = () => setLoadError(true)
    document.body.appendChild(script)

    // 6. Multi-language dictionary for Flitt custom fields & buttons
    const fieldTranslations = {
      ru: {
        'ბავშვის სახელი / გვარი': 'Имя и фамилия ребенка',
        'ბავშვის სახელი/გვარი': 'Имя и фамилия ребенка',
        'ბავშვის სახელი': 'Имя ребенка',
        'რომელი თვის გადასახადს იხდით?': 'За какой месяц оплата?',
        'რომელი თვისას იხდით?': 'За какой месяц оплата?',
        'რომელი თვის': 'За какой месяц',
        'ბარათის ნომერი': 'Номер карты',
        'თვე/წელი': 'ММ/ГГ',
        'გადახდა': 'Оплатить',
        'მომხმარებლის ინფორმაცია დაცულია': 'Данные пользователя защищены',
        'გადახდა ხორციელდება Flitt უსაფრთხო სისტემით. თქვენი ბარათის მონაცემები დაცულია.': 'Оплата обрабатывается безопасной системой Flitt. Ваши данные защищены.',
        "Child's Full Name": 'Имя и фамилия ребенка',
        'Which month are you paying for?': 'За какой месяц оплата?',
        'Card Number': 'Номер карты',
        'Pay': 'Оплатить'
      },
      en: {
        'ბავშვის სახელი / გვარი': "Child's Full Name",
        'ბავშვის სახელი/გვარი': "Child's Full Name",
        'ბავშვის სახელი': "Child's Name",
        'რომელი თვის გადასახადს იხდით?': 'Which month are you paying for?',
        'რომელი თვისას იხდით?': 'Which month are you paying for?',
        'რომელი თვის': 'Which month',
        'ბარათის ნომერი': 'Card Number',
        'თვე/წელი': 'MM/YY',
        'გადახდა': 'Pay',
        'მომხმარებლის ინფორმაცია დაცულია': 'User information is protected',
        'გადახდა ხორციელდება Flitt უსაფრთხო სისტემით. თქვენი ბარათის მონაცემები დაცულია.': 'Payments are processed securely via Flitt. Your card details are protected.',
        'Имя и фамилия ребенка': "Child's Full Name",
        'За какой месяц оплата?': 'Which month are you paying for?',
        'Номер карты': 'Card Number',
        'Оплатить': 'Pay'
      },
      ka: {
        'Имя и фамилия ребенка': 'ბავშვის სახელი / გვარი',
        'За какой месяц оплата?': 'რომელი თვის გადასახადს იხდით?',
        'Номер карты': 'ბარათის ნომერი',
        'ММ/ГГ': 'თვე/წელი',
        'Оплатить': 'გადახდა',
        'Данные пользователя защищены': 'მომხმარებლის ინფორმაცია დაცულია',
        "Child's Full Name": 'ბავშვის სახელი / გვარი',
        'Which month are you paying for?': 'რომელი თვის გადასახადს იხდით?',
        'Card Number': 'ბარათის ნომერი',
        'MM/YY': 'თვე/წელი',
        'Pay': 'გადახდა',
        'User information is protected': 'მომხმარებლის ინფორმაცია დაცულია'
      }
    }

    const translateFormFields = () => {
      const container = containerRef.current || document.getElementById('flitt-payment-container')
      if (!container) return

      const targetLang = lang === 'ru' ? 'ru' : lang === 'en' ? 'en' : 'ka'
      const dict = fieldTranslations[targetLang]
      if (!dict) return

      const processNode = (doc) => {
        // Placeholders
        const inputs = doc.querySelectorAll('input, select, textarea')
        inputs.forEach(input => {
          const ph = input.getAttribute('placeholder')
          if (ph) {
            for (const [key, val] of Object.entries(dict)) {
              if (ph.includes(key)) {
                input.setAttribute('placeholder', ph.replace(key, val))
              }
            }
          }
          if (input.value) {
            for (const [key, val] of Object.entries(dict)) {
              if (input.value.includes(key)) {
                input.value = input.value.replace(key, val)
              }
            }
          }
        })

        // Labels, buttons, text nodes
        const elements = doc.querySelectorAll('label, button, span, p, div, a, h1, h2, h3, h4')
        elements.forEach(el => {
          el.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && child.nodeValue) {
              for (const [key, val] of Object.entries(dict)) {
                if (child.nodeValue.includes(key)) {
                  child.nodeValue = child.nodeValue.replace(key, val)
                }
              }
            }
          })
        })
      }

      processNode(container)

      // Also process any iframe embedded by Flitt
      const iframes = container.querySelectorAll('iframe')
      iframes.forEach(iframe => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            processNode(iframeDoc)
          }
        } catch (e) {
          // Cross-origin iframe security fallback
        }
      })
    }

    // 7. MutationObserver to translate Russian bank error text and custom form fields
    const translateRussianError = (text) => {
      if (!text) return text
      let updated = text
      if (updated.includes('Недостаточно средств')) {
        updated = updated.replace(/Недостаточно средств на карте\.?/g, 'Insufficient funds on card.')
        updated = updated.replace(/Недостаточно средств/g, 'Insufficient funds')
      }
      if (updated.includes('Отклонено банком')) {
        updated = updated.replace(/Отклонено банком\.?/g, 'Declined by bank.')
      }
      if (updated.includes('Ошибка оплаты')) {
        updated = updated.replace(/Ошибка оплаты\.?/g, 'Payment error.')
      }
      if (updated.includes('Превышен лимит')) {
        updated = updated.replace(/Превышен лимит\.?/g, 'Transaction limit exceeded.')
      }
      return updated
    }

    const observer = new MutationObserver(() => {
      translateFormFields()

      const modalElements = document.querySelectorAll('div[class*="f-modal"], div[class*="f-popup"], div[class*="f-response"]')
      modalElements.forEach(el => {
        const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
        let node
        while ((node = walk.nextNode())) {
          if (node.nodeValue && node.nodeValue.match(/[А-Яа-я]/)) {
            node.nodeValue = translateRussianError(node.nodeValue)
          }
        }
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })

    // Run translations periodically during initial render
    const interval = setInterval(translateFormFields, 400)
    setTimeout(() => clearInterval(interval), 6000)

    // 8. Event listeners to reliably close modal when clicking or tapping close button / backdrop
    const handleDismiss = (e) => {
      const target = e.target
      if (!target) return
      const isClose = target.closest('[class*="close"]') || target.closest('button') || target.getAttribute('aria-label') === 'close'
      const isBackdrop = target.classList.contains('f-modal-backdrop') || target.classList.contains('modal-overlay') || target.classList.contains('f-modal')

      if (isClose || isBackdrop) {
        const modals = document.querySelectorAll('div[class*="f-modal"], div[class*="f-popup"], div[class*="f-response"], div[class*="modal-wrapper"]')
        modals.forEach(m => {
          m.style.setProperty('display', 'none', 'important')
          m.remove()
        })
      }
    }

    window.addEventListener('click', handleDismiss, true)
    window.addEventListener('touchstart', handleDismiss, { passive: true, capture: true })

    return () => {
      clearInterval(interval)
      observer.disconnect()
      window.removeEventListener('click', handleDismiss, true)
      window.removeEventListener('touchstart', handleDismiss, { passive: true, capture: true })
    }
  }, [lang])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{t('payment.eyebrow')}</span>
          <h1 className="display page-hero__title">
            {t('payment.title')} <br />
            <span className="display-italic">{t('payment.titleItalic')}</span>
          </h1>
          <p className="page-hero__lead">
            {t('payment.lead')}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '650px', paddingInline: '12px' }}>
          <div 
            ref={containerRef}
            id="flitt-payment-container" 
            style={{ 
              minHeight: '520px',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(212, 175, 55, 0.15)',
              background: '#32363A',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              padding: '24px 20px 24px 20px',
              width: '100%',
              boxSizing: 'border-box',
              touchAction: 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {loadError ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff6b6b' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#fff' }}>
                  {t('payment.error')}
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: '#d4af37',
                    color: '#000',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t('payment.refresh')}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                {t('payment.loading')}
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.7 }}>
            <p style={{ fontSize: '0.9rem' }}>
              {t('payment.footer')}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
