import React, { useState } from 'react'
import { submitRegistration } from '../data/classcore'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function Register() {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    student_name: '',
    birth_date: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_name || !form.birth_date || !form.shift || !form.parent_name || !form.parent_phone) {
      setError(t('register.error'))
      return
    }
    
    setLoading(true)
    setError('')
    
    const res = await submitRegistration({
      student_name: form.student_name,
      birth_date: form.birth_date,
      shift: form.shift,
      parent_name: form.parent_name,
      parent_phone: form.parent_phone,
      status: 'pending'
    })
    
    setLoading(false)
    if (res) {
      setSuccess(true)
      setForm({ student_name: '', birth_date: '', shift: '', parent_name: '', parent_phone: '' })
    } else {
      setError(t('register.error'))
    }
  }

  return (
    <div className="inner-page" style={{ padding: '120px 20px 80px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
      <div style={{ 
        maxWidth: '560px', 
        width: '100%', 
        background: 'rgba(15, 14, 13, 0.9)', 
        backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(212, 166, 74, 0.3)', 
        borderRadius: '12px', 
        padding: '45px 35px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ 
                fontFamily: 'var(--font-title, "Times New Roman", serif)', 
                color: '#fff', 
                fontSize: '32px', 
                marginBottom: '8px', 
                letterSpacing: '1.5px',
                fontWeight: '400',
                textTransform: 'uppercase'
              }}>
                {t('register.title')}
              </h1>
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,166,74,0.4), transparent)', width: '60%', margin: '8px auto 10px' }}></div>
              <p style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2.5px', fontWeight: '500' }}>
                {t('register.subtitle')}
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.3)', color: '#ff6b7b', padding: '12px', borderRadius: '4px', marginBottom: '25px', fontSize: '13.5px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
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
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.15)', 
                    borderRadius: '4px', 
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
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.15)'
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
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.15)', 
                    borderRadius: '4px', 
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
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.15)'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                />
              </div>

              {/* Shift */}
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
                        background: form.shift === s.id ? 'rgba(212,166,74,0.12)' : 'rgba(255,255,255,0.01)', 
                        border: form.shift === s.id ? '1px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: '4px', 
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
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.15)', 
                    borderRadius: '4px', 
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
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.15)'
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
                    padding: '13px 16px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(212, 166, 74, 0.15)', 
                    borderRadius: '4px', 
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
                    e.target.style.borderColor = 'rgba(212, 166, 74, 0.15)'
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
                marginTop: '40px', 
                padding: '15px 0', 
                fontSize: '14px', 
                fontWeight: '600', 
                letterSpacing: '2px', 
                textTransform: 'uppercase',
                display: 'block',
                textAlign: 'center',
                cursor: 'pointer'
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
