import React, { useState } from 'react'
import { submitRegistration } from '../data/classcore'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../data/translations'
import './InnerPage.css'

export default function Register() {
  const { lang, t } = useLanguage()
  const activeTrans = translations[lang] || translations.ka
  const groups = activeTrans.register.groups || []

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

  const shifts = [
    { id: 'I ცვლა', label: t('register.shift1') },
    { id: 'II ცვლა', label: t('register.shift2') },
    { id: 'ბაღის მოსწავლე', label: t('register.shiftGarden') },
    { id: 'თავისუფალი გრაფიკი', label: t('register.shiftFree') }
  ]

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
      shift: form.shift || 'ზოგადი',
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
    <div className="inner-page" style={{ padding: '100px 12px 80px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
      <div className="register-form-card">
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
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ 
                fontFamily: 'var(--font-display, "Cormorant Garamond", serif)', 
                color: '#fff', 
                fontSize: 'clamp(20px, 5.5vw, 30px)', 
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Student Name */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                  {t('register.studentName')}
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
                    borderRadius: '6px', 
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

              {/* DOB */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                  {t('register.birthDate')}
                </label>
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
                    borderRadius: '6px', 
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

              {/* Group Selection with Schedule & Age Limits */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '10px', fontWeight: '500' }}>
                  {t('register.groupTitle')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {groups.map((g) => {
                    const isSelected = form.group === g.id
                    return (
                      <div
                        key={g.id}
                        onClick={() => setForm({ ...form, group: g.id })}
                        style={{
                          padding: '14px 16px',
                          background: isSelected ? 'rgba(212,166,74,0.14)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid var(--color-gold, #d4a64a)' : '1px solid rgba(212, 166, 74, 0.15)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          boxShadow: isSelected ? '0 4px 15px rgba(212,166,74,0.15)' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '600', color: isSelected ? 'var(--color-gold, #d4a64a)' : '#ffffff', fontSize: '14.5px', letterSpacing: '0.02em' }}>
                            {g.name}
                          </span>
                          <span style={{ fontSize: '11px', background: 'rgba(212,166,74,0.12)', color: 'var(--color-gold, #d4a64a)', border: '1px solid rgba(212,166,74,0.3)', padding: '3px 9px', borderRadius: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {g.age}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#a8a39a', fontWeight: '400' }}>
                          {g.schedule}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* School Shift */}
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

              {/* Parent Name */}
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
                    borderRadius: '6px', 
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

              {/* Parent Phone */}
              <div>
                <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                  {t('register.parentPhone')}
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
                    borderRadius: '6px', 
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
                borderRadius: '6px'
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
