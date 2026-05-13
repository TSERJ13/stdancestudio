import './InnerPage.css'

export default function Schedule() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">განრიგი</span>
          <h1 className="display page-hero__title">
            მეცადინეობების <br />
            <span className="display-italic">კალენდარი</span>
          </h1>
          <p className="page-hero__lead">
            გაეცანით ჩვენი სტუდიის მიმდინარე განრიგს. ყველა ცვლილება ავტომატურად აისახება აქ.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="calendar-wrap" style={{ 
            position: 'relative', 
            paddingBottom: '75%', 
            height: 0, 
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: '#fff'
          }}>
            <iframe 
              src="https://calendar.google.com/calendar/embed?src=stdancegroup%40gmail.com&ctz=Asia%2FTbilisi&mode=WEEK&showPrint=0&showTabs=0&showCalendars=0&showTitle=0" 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              frameBorder="0" 
              scrolling="no"
              title="ST Dance Studio Schedule"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  )
}
