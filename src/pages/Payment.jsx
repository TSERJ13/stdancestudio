import { useEffect, useRef, useState } from 'react'
import './InnerPage.css'

export default function Payment() {
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

    const Options = {
      "params": {
        "button": "06de4d988f7d9d20431343ec102f63bb3ee73587"
      },
      "options": {
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
        "card_bg": "#21242a",
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
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">ონლაინ გადახდა</span>
          <h1 className="display page-hero__title">
            სწრაფი და <br />
            <span className="display-italic">უსაფრთხო</span>
          </h1>
          <p className="page-hero__lead">
            გადაიხადეთ სწავლის საფასური მარტივად, ნებისმიერი საბანკო ბარათით.
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
              background: '#383c44',
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
                  გადახდის სისტემის ჩატვირთვა ვერ მოხერხდა.
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
                  გვერდის განახლება
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                იტვირთება გადახდის სისტემა...
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center', opacity: 0.7 }}>
            <p style={{ fontSize: '0.9rem' }}>
              გადახდა ხორციელდება <strong>Flitt</strong> უსაფრთხო სისტემით. <br />
              თქვენი ბარათის მონაცემები დაცულია.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
