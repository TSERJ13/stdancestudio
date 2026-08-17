import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, Volume2, VolumeX, Sparkles, Award, Gift, MapPin } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import { submitRegistration } from '../data/classcore'
import './InnerPage.css'
import './Promo.css'

export default function Promo() {
  const { lang, t } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const groups = activeTrans.register?.groups || []

  // Video state
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  // Registration modal / embedded form state
  const [showRegModal, setShowRegModal] = useState(false)
  const [form, setForm] = useState({
    student_name: '',
    birth_date: '',
    group: groups[0]?.id || '',
    shift: '',
    parent_name: '',
    parent_phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const selectedGroupObj = groups.find(g => g.id === form.group) || groups[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_name || !form.birth_date || !form.parent_name || !form.parent_phone) {
      setError(t('register.error'))
      return
    }
    
    setLoading(true)
    setError('')
    
    const targetGroup = selectedGroupObj || {}

    const res = await submitRegistration({
      student_name: form.student_name,
      birth_date: form.birth_date,
      group_name: targetGroup.name || form.group,
      group: form.group,
      group_schedule: targetGroup.schedule || '',
      group_age: targetGroup.age || '',
      shift: form.shift || 'პრომო გვერდი',
      parent_name: form.parent_name,
      parent_phone: form.parent_phone,
      status: 'pending'
    })
    
    setLoading(false)
    if (res) {
      setSuccess(true)
      setForm({ student_name: '', birth_date: '', group: groups[0]?.id || '', shift: '', parent_name: '', parent_phone: '' })
    } else {
      setError(t('register.error'))
    }
  }

  return (
    <div className="std-promo-page">
      <div className="std-promo-container">
        
        {/* 1. 9:16 VERTICAL REELS / TIKTOK VIDEO PLAYER */}
        <div className="std-promo-video-wrap">
          <video
            ref={videoRef}
            src="/promo.mp4"
            className="std-promo-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
          />
          
          <div className="std-promo-video-overlay">
            <div className="std-promo-video-badge">
              <span className="std-promo-pulse-dot"></span>
              <span>ST DANCE PROMO</span>
            </div>

            <div className="std-promo-video-ctrls">
              <button 
                type="button" 
                className="std-promo-ctrl-btn" 
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />}
              </button>

              <button 
                type="button" 
                className="std-promo-ctrl-btn" 
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* 2. PROMO DETAILS & REGISTRATION SECTION */}
        <div className="std-promo-content">
          <div className="std-promo-title-block">
            <h1>
              {lang === 'ka' ? 'აღმოაჩინე ცეკვის სამყარო ST Dance Studio-სთან ერთად!' :
               lang === 'ru' ? 'Откройте мир танца с ST Dance Studio!' :
               'Discover the World of Dance with ST Dance Studio!'}
            </h1>
            <p style={{ marginBottom: '20px' }}>
              {lang === 'ka' ? 'გახდი ჩვენი საცეკვაო ოჯახის ნაწილი ბათუმში! ისწავლე სპორტული ცეკვები პროფესიონალებთან ერთად — ჩაეწერე შენს პირველ უფასო გაკვეთილზე.' :
               lang === 'ru' ? 'Станьте частью нашей танцевальной семьи в Батуми! Обучайтесь спортивным бальным танцам у профессионалов — запишитесь на первый бесплатный урок.' :
               'Become part of our dance family in Batumi! Learn sports ballroom dance with top professionals — sign up for your first free class today.'}
            </p>

            {/* PRIMARY REGISTRATION CTA BUTTON PLACED DIRECTLY UNDER TEXT */}
            <div className="std-promo-cta-box" style={{ marginTop: '0', marginBottom: '24px' }}>
              <button 
                type="button" 
                className="std-promo-main-btn"
                onClick={() => setShowRegModal(true)}
              >
                <Sparkles size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} />
                {lang === 'ka' ? '✨ ჩაეწერე პირველ უფასო გაკვეთილზე' : lang === 'ru' ? '✨ Записаться на бесплатный урок' : '✨ Book Your First Free Class'}
              </button>

              <Link to="/register" style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '13.5px', textAlign: 'center', textDecoration: 'underline' }}>
                {lang === 'ka' ? 'სრული სარეგისტრაციო გვერდის გახსნა ➔' : lang === 'ru' ? 'Открыть полную страницу регистрации ➔' : 'Open full registration page ➔'}
              </Link>
            </div>
          </div>

          {/* Quick Studio Features */}
          <div className="std-promo-features">
            <div className="std-promo-feat-item">
              <div className="std-promo-feat-icon">
                <Award size={16} color="var(--color-gold, #d4a64a)" />
              </div>
              <div className="std-promo-feat-text">
                <strong>{lang === 'ka' ? 'პროფესიონალი მოცეკვავე' : lang === 'ru' ? 'Профессиональный танцор' : 'Professional Dancer'}</strong>
                <span>{lang === 'ka' ? 'სერგო წივწივაძე' : lang === 'ru' ? 'Серго Цивцивадзе' : 'Sergi Tsivtsivadze'}</span>
              </div>
            </div>

            <div className="std-promo-feat-item">
              <div className="std-promo-feat-icon">
                <Gift size={16} color="var(--color-gold, #d4a64a)" />
              </div>
              <div className="std-promo-feat-text">
                <strong>100% {lang === 'ka' ? 'უფასო' : lang === 'ru' ? 'Бесплатно' : 'Free'}</strong>
                <span>{lang === 'ka' ? 'პირველი საცდელი გაკვეთილი' : lang === 'ru' ? 'Первый пробный урок' : 'First Trial Lesson'}</span>
              </div>
            </div>

            <div className="std-promo-feat-item">
              <div className="std-promo-feat-icon">
                <MapPin size={16} color="var(--color-gold, #d4a64a)" />
              </div>
              <div className="std-promo-feat-text">
                <strong>{lang === 'ka' ? 'ბათუმი' : lang === 'ru' ? 'Батуми' : 'Batumi'}</strong>
                <span>{lang === 'ka' ? 'ე. თაყაიშვილის 55' : lang === 'ru' ? 'ул. Е. Такаишвили 55' : '55 E. Takaishvili St'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. QUICK REGISTRATION MODAL ON PROMO PAGE */}
      {showRegModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRegModal(false)
          }}
        >
          <div className="register-form-card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              type="button"
              onClick={() => setShowRegModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  borderRadius: '50%', 
                  background: 'rgba(212, 166, 74, 0.1)', 
                  border: '2px solid var(--color-gold, #d4a64a)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  color: 'var(--color-gold, #d4a64a)',
                  fontSize: '32px',
                  fontWeight: 'bold'
                }}>✓</div>
                <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '12px' }}>
                  {t('register.successTitle')}
                </h2>
                <p style={{ color: '#a8a39a', fontSize: '14px', lineHeight: '1.6' }}>
                  {t('register.successDesc')}
                </p>
                <button 
                  onClick={() => { setSuccess(false); setShowRegModal(false); }} 
                  className="btn btn-primary"
                  style={{ marginTop: '25px', padding: '12px 30px' }}
                >
                  OK
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: '#fff', fontSize: '22px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {t('register.title')}
                  </h2>
                  <p style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                    {t('register.subtitle')}
                  </p>
                </div>

                {error && (
                  <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.3)', color: '#ff6b7b', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '6px' }}>
                      {t('register.studentName')}
                    </label>
                    <input 
                      type="text" 
                      value={form.student_name}
                      onChange={e => setForm({ ...form, student_name: e.target.value })}
                      placeholder={t('register.studentNamePlaceholder')}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,166,74,0.2)', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '6px' }}>
                      {t('register.birthDate')}
                    </label>
                    <input 
                      type="date" 
                      value={form.birth_date}
                      onChange={e => setForm({ ...form, birth_date: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', colorScheme: 'dark', minHeight: '44px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,166,74,0.2)', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '8px' }}>
                      {t('register.groupTitle')}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '2px' }}>
                      {groups.map((g) => {
                        const isSelected = form.group === g.id
                        const gColor = g.color || '#d4a64a'
                        return (
                          <div
                            key={g.id}
                            onClick={() => setForm({ ...form, group: g.id })}
                            style={{
                              padding: '12px 14px',
                              background: isSelected ? `${gColor}22` : 'rgba(255,255,255,0.02)',
                              border: isSelected ? `1.5px solid ${gColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '600', color: isSelected ? gColor : '#ffffff', fontSize: '13.5px' }}>
                                {g.name}
                              </span>
                              <span style={{ fontSize: '10.5px', background: `${gColor}22`, color: gColor, border: `1px solid ${gColor}55`, padding: '2px 7px', borderRadius: '10px', fontWeight: '600' }}>
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

                  <div>
                    <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '6px' }}>
                      {t('register.parentName')}
                    </label>
                    <input 
                      type="text" 
                      value={form.parent_name}
                      onChange={e => setForm({ ...form, parent_name: e.target.value })}
                      placeholder={t('register.parentNamePlaceholder')}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,166,74,0.2)', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '6px' }}>
                      {t('register.parentPhone')}
                    </label>
                    <input 
                      type="tel" 
                      value={form.parent_phone}
                      onChange={e => setForm({ ...form, parent_phone: e.target.value })}
                      placeholder={t('register.parentPhonePlaceholder')}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,166,74,0.2)', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="std-promo-main-btn"
                  style={{ width: '100%', marginTop: '24px', padding: '14px 0', fontSize: '14px' }}
                >
                  {loading ? t('register.submitting') : t('register.submit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
