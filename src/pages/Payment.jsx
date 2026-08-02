import { useEffect } from 'react'
import './InnerPage.css'

export default function Payment() {
  useEffect(() => {
    // 1. Load CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://pay.flitt.com/latest/checkout-vue/checkout.css'
    document.head.appendChild(link)

    // 2. Load Fonts
    const fonts = [
      'https://pay.flitt.com/icons/dist/fonts/inter-regular.woff2',
      'https://pay.flitt.com/icons/dist/fonts/inter-medium.woff2',
      'https://pay.flitt.com/icons/dist/fonts/inter-semibold.woff2'
    ]
    fonts.forEach(url => {
      const preload = document.createElement('link')
      preload.rel = 'preload'
      preload.href = url
      preload.as = 'font'
      preload.type = 'font/woff2'
      preload.crossOrigin = 'anonymous'
      document.head.appendChild(preload)
    })

    // 3. Load Script with amount_readonly: false & amount_editable: true
    const script = document.createElement('script')
    script.src = 'https://pay.flitt.com/latest/checkout-vue/checkout.js'
    script.async = true
    script.onload = () => {
      const Options = {
        "params": {
          "button": "06de4d988f7d9d20431343ec102f63bb3ee73587"
        },
        "options": {
          "amount_readonly": false,
          "amount_editable": true,
          "theme": {
            "type": "light",
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
          "methods_disabled": [],
          "fullScreen": false,
          "hide_button_title": false
        },
        "css_variable": {
          "main": "#7d8ff8",
          "card_bg": "#353535",
          "card_shadow": "#9ADBE8"
        }
      };
      
      if (window.checkout) {
        window.checkout('#flitt-payment-container', Options);
      }
    }
    document.body.appendChild(script)

    return () => {
      try {
        document.head.removeChild(link)
        document.body.removeChild(script)
      } catch (e) {}
    }
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
            id="flitt-payment-container" 
            style={{ 
              minHeight: '520px',
              borderRadius: '16px',
              overflow: 'visible',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              background: '#fff',
              padding: '16px 12px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Flitt checkout will mount here */}
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              იტვირთება გადახდის სისტემა...
            </div>
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
