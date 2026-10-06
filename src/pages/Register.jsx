import React, { useState, useMemo } from 'react'
import { submitRegistration } from '../data/classcore'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import './InnerPage.css'

export default function Register() {
  const { lang, t } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const groups = activeTrans.register.groups || []

  // Form State
  const [form, setForm] = useState({
    student_name: '',
    birth_date: '',
    experience: null, // 'zero' | 'has' | null
    exp_level: null,  // '1year' | '2-3years' | 'couples' | '5years' | null
    group: '',
    shift: '',
    parent_name: '',
    parent_phone: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const shifts = [
    { id: 'I ცვლა', label: t('register.shift1') },
    { id: 'II ცვლა', label: t('register.shift2') },
    { id: 'ბაღის მოსწავლე', label: t('register.shiftGarden') },
    { id: 'თავისუფალი გრაფიკი', label: t('register.shiftFree') }
  ]

  // Calculate age accurately from birth_date
  const calculatedAge = useMemo(() => {
    if (!form.birth_date) return null
    const birth = new Date(form.birth_date)
    if (isNaN(birth.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const m = now.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age -= 1
    }
    // fractional precision for 4.5
    const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    const preciseAge = monthDiff / 12
    return preciseAge >= 0 ? preciseAge : null
  }, [form.birth_date])

  const isAdult = calculatedAge !== null && calculatedAge >= 18
  const isMinor = calculatedAge !== null && calculatedAge < 18

  // Recommend best group based on Age, Experience Choice & Exp Level
  const recommendedGroupId = useMemo(() => {
    if (calculatedAge === null) return null

    // If Beginner (0-dan swavla)
    if (form.experience === 'zero') {
      if (calculatedAge < 6) return 'Baby (4-5 წელი)'
      if (calculatedAge <= 10.9) return 'Bronze (6-10 წელი)'
      if (calculatedAge <= 15.9) return 'Starter (11-15 წელი)'
      return 'Hobby Class (15-60 წელი)'
    }

    // If Has Experience
    if (form.experience === 'has') {
      if (form.exp_level === '1year') return 'Pre-Silver (1 წლ გამოცდილება)'
      if (form.exp_level === '2-3years') return 'Silver (2-3 წლ გამოცდილება)'
      if (form.exp_level === 'couples') return 'Couples (2 წლ გამოცდილება)'
      if (form.exp_level === '5years') return 'Golden (5+ წლ გამოცდილება)'
    }

    return null
  }, [calculatedAge, form.experience, form.exp_level])

  // Current active group object
  const activeSelectedGroupId = form.group || recommendedGroupId || (groups[0]?.id || '')
  const selectedGroupObj = groups.find(g => g.id === activeSelectedGroupId) || groups[0]

  // When experience or level changes, sync default selection if user hasn't explicitly picked a divergent one
  const handleExperienceChange = (expType) => {
    setForm(prev => {
      const nextExp = expType
      let nextLevel = prev.exp_level
      if (nextExp === 'zero') nextLevel = null

      let autoGroup = ''
      if (calculatedAge !== null) {
        if (nextExp === 'zero') {
          if (calculatedAge < 6) autoGroup = 'Baby (4-5 წელი)'
          else if (calculatedAge <= 10.9) autoGroup = 'Bronze (6-10 წელი)'
          else if (calculatedAge <= 15.9) autoGroup = 'Starter (11-15 წელი)'
          else autoGroup = 'Hobby Class (15-60 წელი)'
        }
      }

      return {
        ...prev,
        experience: nextExp,
        exp_level: nextLevel,
        group: autoGroup || prev.group
      }
    })
  }

  const handleExpLevelChange = (level) => {
    let autoGroup = ''
    if (level === '1year') autoGroup = 'Pre-Silver (1 წლ გამოცდილება)'
    else if (level === '2-3years') autoGroup = 'Silver (2-3 წლ გამოცდილება)'
    else if (level === 'couples') autoGroup = 'Couples (2 წლ გამოცდილება)'
    else if (level === '5years') autoGroup = 'Golden (5+ წლ გამოცდილება)'

    setForm(prev => ({
      ...prev,
      exp_level: level,
      group: autoGroup || prev.group
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_name || !form.birth_date || !form.parent_phone) {
      setError(t('register.error'))
      return
    }

    // For minors require parent name or fall back to student name
    const finalParentName = form.parent_name || (isAdult ? form.student_name : '')
    if (isMinor && !finalParentName) {
      setError(t('register.error'))
      return
    }
    
    setLoading(true)
    setError('')
    
    const targetGroup = selectedGroupObj || {}

    const res = await submitRegistration({
      student_name: form.student_name,
      birth_date: form.birth_date,
      group_name: targetGroup.name || activeSelectedGroupId,
      group: activeSelectedGroupId,
      group_schedule: targetGroup.schedule || '',
      group_age: targetGroup.age || '',
      shift: form.shift || (isAdult ? 'თავისუფალი გრაფიკი' : 'ზოგადი'),
      parent_name: finalParentName,
      parent_phone: form.parent_phone,
      experience: form.experience === 'zero' ? '0-დან სწავლა (დამწყები)' : `გამოცდილი (${form.exp_level || 'მითითებული'})`,
      status: 'pending'
    })
    
    setLoading(false)
    if (res) {
      setSuccess(true)
      setForm({
        student_name: '',
        birth_date: '',
        experience: null,
        exp_level: null,
        group: '',
        shift: '',
        parent_name: '',
        parent_phone: ''
      })
    } else {
      setError(t('register.error'))
    }
  }

  return (
    <div className="inner-page" style={{ padding: '100px 14px 80px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
      <div className="register-form-card" style={{ maxWidth: '640px', width: '100%', position: 'relative' }}>
        {/* Subtle Luxury Top Accent Line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent 0%, var(--color-gold, #d4a64a) 50%, transparent 100%)' }}></div>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(212, 166, 74, 0.1)', 
              border: '2px solid var(--color-gold, #d4a64a)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 25px',
              color: 'var(--color-gold, #d4a64a)',
              fontSize: '36px',
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(212, 166, 74, 0.2)'
            }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-title, "Times New Roman", serif)', color: '#fff', fontSize: '24px', marginBottom: '15px', letterSpacing: '0.5px' }}>
              {t('register.successTitle')}
            </h2>
            <p style={{ color: '#a8a39a', fontSize: '14.5px', lineHeight: '1.7', maxWidth: '420px', margin: '0 auto' }}>
              {t('register.successDesc')}
            </p>
            <button 
              onClick={() => setSuccess(false)} 
              className="btn btn-primary"
              style={{ marginTop: '35px', padding: '12px 35px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ 
                fontFamily: 'var(--font-display, "Cormorant Garamond", serif)', 
                color: '#fff', 
                fontSize: 'clamp(22px, 5.5vw, 32px)', 
                marginBottom: '6px', 
                letterSpacing: '1px',
                fontWeight: '500',
                textTransform: 'uppercase',
                lineHeight: '1.2'
              }}>
                {t('register.title')}
              </h1>
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,166,74,0.4), transparent)', width: '60%', margin: '8px auto 10px' }}></div>
              <p style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: '500' }}>
                {t('register.subtitle')}
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.3)', color: '#ff6b7b', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '13.5px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* 1. Student / Member Name */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                  {isAdult ? t('register.studentNameAdult') : isMinor ? t('register.studentNameChild') : t('register.studentName')}
                </label>
                <input 
                  type="text" 
                  value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                  placeholder={t('register.studentNamePlaceholder')}
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.2)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '14.5px', 
                    outline: 'none', 
                    transition: 'all 0.3s' 
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              {/* 2. Date of Birth */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#a8a39a', fontSize: '13.5px', fontWeight: '500' }}>
                    {t('register.birthDate')}
                  </label>
                  {calculatedAge !== null && (
                    <span style={{ fontSize: '12px', color: 'var(--color-gold, #d4a64a)', fontWeight: '600' }}>
                      {calculatedAge >= 1 ? `${Math.floor(calculatedAge)} ${lang === 'ka' ? 'წლის' : lang === 'ru' ? 'лет' : 'years old'}` : ''}
                    </span>
                  )}
                </div>
                <input 
                  type="date" 
                  value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.2)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    colorScheme: 'dark',
                    fontSize: '14.5px', 
                    outline: 'none',
                    minHeight: '48px',
                    transition: 'all 0.3s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              {/* 3. Dance Experience Question (Shows clearly once birth date is entered) */}
              {form.birth_date && (
                <div style={{ 
                  background: 'rgba(212, 166, 74, 0.04)', 
                  border: '1px solid rgba(212, 166, 74, 0.25)', 
                  borderRadius: '10px', 
                  padding: '16px 18px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <label style={{ display: 'block', color: '#fff', fontSize: '13.5px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.2px' }}>
                    ✨ {isAdult ? t('register.expQuestionAdult') : t('register.expQuestionChild')}
                  </label>
                  
                  {/* Two Buttons: 0-Dan (Beginner) OR Has Experience */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: form.experience === 'has' ? '14px' : '0' }}>
                    <button
                      type="button"
                      onClick={() => handleExperienceChange('zero')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.25s ease',
                        background: form.experience === 'zero' ? 'linear-gradient(135deg, rgba(212,166,74,0.3) 0%, rgba(212,166,74,0.15) 100%)' : 'rgba(255,255,255,0.03)',
                        border: form.experience === 'zero' ? '1.5px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.1)',
                        color: form.experience === 'zero' ? 'var(--color-gold, #d4a64a)' : '#cfcbc4',
                        boxShadow: form.experience === 'zero' ? '0 0 15px rgba(212,166,74,0.2)' : 'none'
                      }}
                    >
                      🌱 {t('register.expZero')}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleExperienceChange('has')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.25s ease',
                        background: form.experience === 'has' ? 'linear-gradient(135deg, rgba(212,166,74,0.3) 0%, rgba(212,166,74,0.15) 100%)' : 'rgba(255,255,255,0.03)',
                        border: form.experience === 'has' ? '1.5px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.1)',
                        color: form.experience === 'has' ? 'var(--color-gold, #d4a64a)' : '#cfcbc4',
                        boxShadow: form.experience === 'has' ? '0 0 15px rgba(212,166,74,0.2)' : 'none'
                      }}
                    >
                      🏆 {t('register.expHas')}
                    </button>
                  </div>

                  {/* If user selected "Has Experience", show experience tier pills */}
                  {form.experience === 'has' && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(212,166,74,0.15)', paddingTop: '12px' }}>
                      <span style={{ display: 'block', fontSize: '12.5px', color: '#a8a39a', marginBottom: '8px' }}>
                        {t('register.expYearsTitle')}
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                        {[
                          { id: '1year', label: t('register.expYears1') },
                          { id: '2-3years', label: t('register.expYears23') },
                          { id: 'couples', label: 'Couples (2 წელი წყვილში)' },
                          { id: '5years', label: t('register.expYears5Plus') }
                        ].map(tier => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => handleExpLevelChange(tier.id)}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: form.exp_level === tier.id ? '600' : '400',
                              background: form.exp_level === tier.id ? 'rgba(212,166,74,0.25)' : 'rgba(255,255,255,0.02)',
                              border: form.exp_level === tier.id ? '1px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.08)',
                              color: form.exp_level === tier.id ? 'var(--color-gold, #d4a64a)' : '#a8a39a'
                            }}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Elegant Group Selection Grid (No scrolling dropdown - luxury cards) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ color: '#a8a39a', fontSize: '13.5px', fontWeight: '500' }}>
                    {t('register.groupTitle')}
                  </label>
                  {recommendedGroupId && (
                    <span style={{ fontSize: '11px', color: 'var(--color-gold, #d4a64a)', background: 'rgba(212,166,74,0.1)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(212,166,74,0.3)' }}>
                      ⚡ {lang === 'ka' ? 'ავტო-შერჩეული' : 'Auto Selected'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                  {groups.map((g) => {
                    const isSelected = activeSelectedGroupId === g.id
                    const isRecommended = recommendedGroupId === g.id
                    const gColor = g.color || '#d4a64a'
                    return (
                      <div
                        key={g.id}
                        onClick={() => setForm({ ...form, group: g.id })}
                        style={{
                          padding: '13px 15px',
                          background: isSelected ? `${gColor}22` : 'rgba(255,255,255,0.02)',
                          border: isSelected ? `1.5px solid ${gColor}` : isRecommended ? `1px dashed ${gColor}88` : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: isSelected ? `0 4px 18px ${gColor}33` : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', color: isSelected ? gColor : '#ffffff', fontSize: '14px', letterSpacing: '0.01em' }}>
                            {g.name}
                          </span>
                          <span style={{ fontSize: '10.5px', background: `${gColor}22`, color: gColor, border: `1px solid ${gColor}55`, padding: '2px 7px', borderRadius: '10px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {g.age}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#a8a39a', lineHeight: '1.4' }}>
                          {g.schedule}
                        </div>
                        {isRecommended && (
                          <div style={{ fontSize: '10px', color: 'var(--color-gold, #d4a64a)', fontWeight: '600', marginTop: '2px' }}>
                            ✓ {lang === 'ka' ? 'რეკომენდებული ჯგუფი' : 'Recommended'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 5. School Shift (shown mainly for kids/teens, optional for adults) */}
              {(!calculatedAge || calculatedAge < 18) && (
                <div>
                  <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '10px', fontWeight: '500' }}>
                    {t('register.shiftTitle')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {shifts.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm({ ...form, shift: s.id })}
                        style={{ 
                          padding: '12px 10px', 
                          background: form.shift === s.id ? 'rgba(212,166,74,0.14)' : 'rgba(255,255,255,0.01)', 
                          border: form.shift === s.id ? '1px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.06)', 
                          borderRadius: '6px', 
                          color: form.shift === s.id ? 'var(--color-gold, #d4a64a)' : '#a8a39a', 
                          fontSize: '13px', 
                          cursor: 'pointer', 
                          transition: 'all 0.25s ease',
                          fontWeight: form.shift === s.id ? '600' : '400',
                          boxShadow: form.shift === s.id ? '0 4px 15px rgba(212,166,74,0.1)' : 'none'
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Parent Name (For minors under 18) */}
              {(!calculatedAge || calculatedAge < 18) && (
                <div>
                  <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                    {t('register.parentName')}
                  </label>
                  <input 
                    type="text" 
                    value={form.parent_name}
                    onChange={e => setForm({ ...form, parent_name: e.target.value })}
                    placeholder={t('register.parentNamePlaceholder')}
                    style={{ 
                      width: '100%', 
                      boxSizing: 'border-box',
                      padding: '13px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(212, 166, 74, 0.2)', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      fontSize: '14.5px', 
                      outline: 'none', 
                      transition: 'all 0.3s' 
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                      e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(212, 166, 74, 0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                    required={isMinor}
                  />
                </div>
              )}

              {/* 7. Phone Number (WhatsApp) */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                  {isAdult ? `${lang === 'ka' ? 'თქვენი ტელეფონის ნომერი (WhatsApp) *' : lang === 'ru' ? 'Ваш номер телефона (WhatsApp) *' : 'Your Phone Number (WhatsApp) *'}` : t('register.parentPhone')}
                </label>
                <input 
                  type="tel" 
                  value={form.parent_phone}
                  onChange={e => setForm({ ...form, parent_phone: e.target.value })}
                  placeholder={t('register.parentPhonePlaceholder')}
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.2)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '14.5px', 
                    outline: 'none', 
                    transition: 'all 0.3s' 
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                marginTop: '32px', 
                padding: '15px 0', 
                fontSize: '14px', 
                fontWeight: '600', 
                letterSpacing: '2px', 
                textTransform: 'uppercase', 
                display: 'block', 
                textAlign: 'center', 
                cursor: 'pointer', 
                borderRadius: '8px'
              }}
            >
              {loading ? t('register.submitting') : t('register.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
