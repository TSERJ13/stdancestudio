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
    const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    const preciseAge = monthDiff / 12
    return preciseAge >= 0 ? preciseAge : null
  }, [form.birth_date])

  const isAdult = calculatedAge !== null && calculatedAge >= 18
  const isMinor = calculatedAge !== null && calculatedAge < 18

  // Recommend best group based on Age, Experience Choice & Exp Level
  const recommendedGroupId = useMemo(() => {
    if (calculatedAge === null) return null

    // If Beginner (0-დან სწავლა)
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

  // Filter groups dynamically so mobile users only see the matched/relevant group(s)
  const displayGroups = useMemo(() => {
    // Before birthdate or experience selection, don't overwhelm with all 8 groups
    if (calculatedAge === null || !form.experience) {
      return []
    }

    // If Beginner (0-dan): ONLY show the age-matched beginner group
    if (form.experience === 'zero') {
      if (calculatedAge < 6) {
        return groups.filter(g => g.id.includes('Baby'))
      } else if (calculatedAge <= 10.9) {
        return groups.filter(g => g.id.includes('Bronze'))
      } else if (calculatedAge <= 15.9) {
        return groups.filter(g => g.id.includes('Starter'))
      } else {
        return groups.filter(g => g.id.includes('Hobby'))
      }
    }

    // If Experienced: show matching tier group
    if (form.experience === 'has') {
      if (form.exp_level === '1year') {
        return groups.filter(g => g.id.includes('Pre-Silver'))
      } else if (form.exp_level === '2-3years') {
        return groups.filter(g => g.id.includes('Silver') && !g.id.includes('Pre-Silver'))
      } else if (form.exp_level === 'couples') {
        return groups.filter(g => g.id.includes('Couples'))
      } else if (form.exp_level === '5years') {
        return groups.filter(g => g.id.includes('Golden'))
      } else {
        // User clicked "has experience" but hasn't picked years yet: show experience tier options
        return groups.filter(g => !['Baby (4-5 წელი)', 'Bronze (6-10 წელი)', 'Starter (11-15 წელი)', 'Hobby Class (15-60 წელი)'].includes(g.id))
      }
    }

    return groups
  }, [calculatedAge, form.experience, form.exp_level, groups])

  // Active selected group
  const activeSelectedGroupId = form.group || recommendedGroupId || (displayGroups[0]?.id || '')
  const selectedGroupObj = groups.find(g => g.id === activeSelectedGroupId) || groups[0]

  const handleBirthDateChange = (val) => {
    setForm(prev => {
      // recalculate
      let nextExp = prev.experience
      let nextLevel = prev.exp_level
      let autoGroup = ''

      if (val) {
        const birth = new Date(val)
        if (!isNaN(birth.getTime())) {
          const now = new Date()
          const monthDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
          const age = monthDiff / 12

          if (nextExp === 'zero') {
            if (age < 6) autoGroup = 'Baby (4-5 წელი)'
            else if (age <= 10.9) autoGroup = 'Bronze (6-10 წელი)'
            else if (age <= 15.9) autoGroup = 'Starter (11-15 წელი)'
            else autoGroup = 'Hobby Class (15-60 წელი)'
          }
        }
      }

      return {
        ...prev,
        birth_date: val,
        group: autoGroup || (prev.group ? prev.group : '')
      }
    })
  }

  const handleExperienceChange = (expType) => {
    setForm(prev => {
      let autoGroup = ''
      if (calculatedAge !== null) {
        if (expType === 'zero') {
          if (calculatedAge < 6) autoGroup = 'Baby (4-5 წელი)'
          else if (calculatedAge <= 10.9) autoGroup = 'Bronze (6-10 წელი)'
          else if (calculatedAge <= 15.9) autoGroup = 'Starter (11-15 წელი)'
          else autoGroup = 'Hobby Class (15-60 წელი)'
        }
      }

      return {
        ...prev,
        experience: expType,
        exp_level: expType === 'zero' ? null : prev.exp_level,
        group: autoGroup || (expType === 'zero' ? '' : prev.group)
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
      group: autoGroup
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_name || !form.birth_date || !form.parent_phone) {
      setError(t('register.error'))
      return
    }

    if (!form.experience) {
      setError(lang === 'ka' ? 'გთხოვთ მიუთითოთ გამოცდილება (0-დან სწავლა თუ გამოცდილი)' : 'Please select your dance experience')
      return
    }

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
    <div className="inner-page" style={{ padding: '90px 12px 70px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
      <div className="register-form-card" style={{ maxWidth: '580px', width: '100%', position: 'relative', padding: 'clamp(20px, 4vw, 36px)' }}>
        {/* Subtle Luxury Top Accent Line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent 0%, var(--color-gold, #d4a64a) 50%, transparent 100%)' }}></div>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: '76px', 
              height: '76px', 
              borderRadius: '50%', 
              background: 'rgba(212, 166, 74, 0.1)', 
              border: '2px solid var(--color-gold, #d4a64a)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px',
              color: 'var(--color-gold, #d4a64a)',
              fontSize: '34px',
              fontWeight: 'bold',
              boxShadow: '0 0 20px rgba(212, 166, 74, 0.2)'
            }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-title, "Times New Roman", serif)', color: '#fff', fontSize: '22px', marginBottom: '12px' }}>
              {t('register.successTitle')}
            </h2>
            <p style={{ color: '#a8a39a', fontSize: '14px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
              {t('register.successDesc')}
            </p>
            <button 
              onClick={() => setSuccess(false)} 
              className="btn btn-primary"
              style={{ marginTop: '30px', padding: '12px 35px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ 
                fontFamily: 'var(--font-display, "Cormorant Garamond", serif)', 
                color: '#fff', 
                fontSize: 'clamp(22px, 5vw, 30px)', 
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
              <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid rgba(220,53,69,0.35)', color: '#ff6b7b', padding: '11px', borderRadius: '6px', marginBottom: '18px', fontSize: '13px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Student / Member Name */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '7px', fontWeight: '500' }}>
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
                    padding: '12px 15px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.25)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '14px', 
                    outline: 'none', 
                    transition: 'all 0.3s' 
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.25)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              {/* 2. Date of Birth */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ color: '#a8a39a', fontSize: '13px', fontWeight: '500' }}>
                    {t('register.birthDate')}
                  </label>
                  {calculatedAge !== null && (
                    <span style={{ fontSize: '12px', color: 'var(--color-gold, #d4a64a)', fontWeight: '600', background: 'rgba(212,166,74,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                      {Math.floor(calculatedAge)} {lang === 'ka' ? 'წლის' : lang === 'ru' ? 'лет' : 'years old'}
                    </span>
                  )}
                </div>
                <input 
                  type="date" 
                  value={form.birth_date}
                  onChange={e => handleBirthDateChange(e.target.value)}
                  style={{ 
                    width: '100%', 
                    boxSizing: 'border-box',
                    padding: '12px 15px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.25)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    colorScheme: 'dark',
                    fontSize: '14px', 
                    outline: 'none',
                    minHeight: '46px',
                    transition: 'all 0.3s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.25)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              {/* 3. Dance Experience Question (Clear Choice Buttons) */}
              {form.birth_date && (
                <div style={{ 
                  background: 'rgba(212, 166, 74, 0.05)', 
                  border: '1px solid rgba(212, 166, 74, 0.3)', 
                  borderRadius: '10px', 
                  padding: '14px 16px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <label style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4' }}>
                    {isAdult ? t('register.expQuestionAdult') : t('register.expQuestionChild')}
                  </label>
                  
                  {/* Two Main Choice Buttons: 0-იდან vs გამოცდილი */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleExperienceChange('zero')}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
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
                        padding: '12px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
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

                  {/* Sub-buttons: If Experienced, specify years */}
                  {form.experience === 'has' && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid rgba(212,166,74,0.15)', paddingTop: '10px' }}>
                      <span style={{ display: 'block', fontSize: '12px', color: '#a8a39a', marginBottom: '8px' }}>
                        {t('register.expYearsTitle')}
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                        {[
                          { id: '1year', label: '1 წელი (Pre-Silver)' },
                          { id: '2-3years', label: '2-3 წელი (Silver)' },
                          { id: 'couples', label: '2 წელი წყვილი (Couples)' },
                          { id: '5years', label: '5+ წელი (Golden)' }
                        ].map(tier => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => handleExpLevelChange(tier.id)}
                            style={{
                              padding: '9px 6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11.5px',
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

              {/* 4. Filtered Group Presentation (No scrollbar! Only the matched group appears as a nice clean button card) */}
              {displayGroups.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ color: '#a8a39a', fontSize: '13px', fontWeight: '500' }}>
                      {t('register.groupTitle')}
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--color-gold, #d4a64a)', background: 'rgba(212,166,74,0.12)', padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(212,166,74,0.3)' }}>
                      ⚡ {lang === 'ka' ? 'შერჩეული ჯგუფი' : 'Selected Group'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {displayGroups.map((g) => {
                      const isSelected = activeSelectedGroupId === g.id
                      const gColor = g.color || '#d4a64a'
                      return (
                        <div
                          key={g.id}
                          onClick={() => setForm({ ...form, group: g.id })}
                          style={{
                            padding: '14px 16px',
                            background: isSelected ? `${gColor}22` : 'rgba(255,255,255,0.02)',
                            border: isSelected ? `2px solid ${gColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            boxShadow: isSelected ? `0 4px 18px ${gColor}33` : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '700', color: isSelected ? gColor : '#ffffff', fontSize: '15px' }}>
                              {g.name}
                            </span>
                            <span style={{ fontSize: '11px', background: `${gColor}25`, color: gColor, border: `1px solid ${gColor}55`, padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                              {g.age}
                            </span>
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#e0dedb', lineHeight: '1.4' }}>
                            📅 {g.schedule}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 5. School Shift (for kids & teens) */}
              {(!calculatedAge || calculatedAge < 18) && (
                <div>
                  <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                    {t('register.shiftTitle')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {shifts.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm({ ...form, shift: s.id })}
                        style={{ 
                          padding: '11px 8px', 
                          background: form.shift === s.id ? 'rgba(212,166,74,0.18)' : 'rgba(255,255,255,0.02)', 
                          border: form.shift === s.id ? '1.5px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '8px', 
                          color: form.shift === s.id ? 'var(--color-gold, #d4a64a)' : '#a8a39a', 
                          fontSize: '12.5px', 
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
                  <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '7px', fontWeight: '500' }}>
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
                      padding: '12px 15px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(212, 166, 74, 0.25)', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      fontSize: '14px', 
                      outline: 'none', 
                      transition: 'all 0.3s' 
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                      e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(212, 166, 74, 0.25)'
                      e.target.style.boxShadow = 'none'
                    }}
                    required={isMinor}
                  />
                </div>
              )}

              {/* 7. Phone Number (WhatsApp) */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '7px', fontWeight: '500' }}>
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
                    padding: '12px 15px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.25)', 
                    borderRadius: '8px', 
                    color: '#fff', 
                    fontSize: '14px', 
                    outline: 'none', 
                    transition: 'all 0.3s' 
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--color-gold, #d4a64a)'
                    e.target.style.boxShadow = '0 0 10px rgba(212,166,74,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.25)'
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
                marginTop: '28px', 
                padding: '14px 0', 
                fontSize: '13.5px', 
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
