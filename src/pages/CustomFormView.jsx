import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCustomFormBySlug, submitFormAnswer } from '../data/classcore'
import { useLanguage } from '../context/LanguageContext'
import './InnerPage.css'

export default function CustomFormView() {
  const { slug } = useParams()
  const { t } = useLanguage()
  const [form, setForm] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetchCustomFormBySlug(slug)
      .then(data => {
        if (data) {
          setForm(data)
          // Pre-initialize answers state
          const initialAnswers = {}
          if (data.type === 'form' && Array.isArray(data.fields)) {
            data.fields.forEach(f => {
              initialAnswers[f.name || f.label] = ''
            })
          } else if (data.type === 'poll') {
            initialAnswers['selectedOption'] = ''
          }
          setAnswers(initialAnswers)
        } else {
          setError(t('customForm.notFound'))
        }
        setLoading(false)
      })
      .catch(() => {
        setError(t('customForm.connectionError'))
        setLoading(false)
      })
  }, [slug, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form) return

    // Validate
    if (form.type === 'poll' && !answers.selectedOption) {
      setError(t('customForm.validationError'))
      return
    }

    setSubmitting(true)
    setError('')

    const submission = {
      form_slug: slug,
      answers: answers
    }

    const res = await submitFormAnswer(submission)
    setSubmitting(false)
    if (res) {
      setSuccess(true)
    } else {
      setError(t('customForm.connectionError'))
    }
  }

  if (loading) {
    return (
      <div className="inner-page" style={{ padding: '150px 20px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
        <div style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '18px', letterSpacing: '1px' }}>{t('customForm.submitting')}</div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="inner-page" style={{ padding: '150px 20px', minHeight: '85vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1c1a17 0%, #0a0908 100%)' }}>
        <div style={{ 
          maxWidth: '500px', 
          width: '100%', 
          background: 'rgba(15, 14, 13, 0.9)', 
          backdropFilter: 'blur(16px)', 
          border: '1px solid rgba(220,53,69,0.3)', 
          borderRadius: '12px', 
          padding: '40px 30px', 
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}>
          <div style={{ fontSize: '48px', color: '#dc3545', marginBottom: '15px' }}>⚠</div>
          <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>{t('customForm.errorTitle')}</h3>
          <p style={{ color: '#a8a39a', fontSize: '14.5px' }}>{error || t('customForm.notFound')}</p>
        </div>
      </div>
    )
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
              {form.type === 'poll' ? t('customForm.successPollTitle') : t('customForm.successFormTitle')}
            </h2>
            <p style={{ color: '#a8a39a', fontSize: '14.5px', lineHeight: '1.7', maxWidth: '420px', margin: '0 auto' }}>
              {t('customForm.successDesc')}
            </p>
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
                {form.title}
              </h1>
              {form.description && (
                <p style={{ color: '#a8a39a', fontSize: '14px', lineHeight: '1.6', marginTop: '10px' }}>{form.description}</p>
              )}
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,166,74,0.4), transparent)', width: '60%', margin: '15px auto 10px' }}></div>
              <div style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,166,74,0.3)', borderRadius: '20px', color: 'var(--color-gold, #d4a64a)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '500' }}>
                {form.type === 'poll' ? t('customForm.pollTitle') : t('customForm.formTitle')}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.3)', color: '#ff6b7b', padding: '12px', borderRadius: '4px', marginBottom: '25px', fontSize: '13.5px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {form.type === 'poll' ? (
                /* Render Poll Options */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '6px', fontWeight: '500' }}>{t('customForm.selectOption')}</label>
                  {Array.isArray(form.fields) && form.fields.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers({ selectedOption: opt })}
                      style={{
                        padding: '16px 20px',
                        background: answers.selectedOption === opt ? 'rgba(212,166,74,0.12)' : 'rgba(255,255,255,0.01)',
                        border: answers.selectedOption === opt ? '1px solid var(--color-gold, #d4a64a)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: answers.selectedOption === opt ? 'var(--color-gold, #d4a64a)' : '#fff',
                        textAlign: 'left',
                        fontSize: '14.5px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: answers.selectedOption === opt ? '600' : '400',
                        boxShadow: answers.selectedOption === opt ? '0 4px 15px rgba(212,166,74,0.1)' : 'none'
                      }}
                    >
                      <span>{opt}</span>
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        border: answers.selectedOption === opt ? '5px solid var(--color-gold, #d4a64a)' : '2px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        transition: 'all 0.2s'
                      }} />
                    </button>
                  ))}
                </div>
              ) : (
                /* Render Custom Fields Form */
                Array.isArray(form.fields) && form.fields.map((f, i) => {
                  const key = f.name || f.label
                  return (
                    <div key={i}>
                      <label style={{ display: 'block', color: '#a8a39a', fontSize: '13.5px', marginBottom: '8px', fontWeight: '500' }}>
                        {f.label} {f.required ? '*' : ''}
                      </label>
                      
                      {f.type === 'select' ? (
                        <select
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
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
                          required={f.required}
                        >
                          <option value="" style={{ background: '#111' }}>{t('customForm.choose')}</option>
                          {Array.isArray(f.options) && f.options.map((o, idx) => (
                            <option key={idx} value={o} style={{ background: '#111' }}>{o}</option>
                          ))}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
                          placeholder={f.placeholder || ''}
                          style={{ 
                            width: '100%', 
                            padding: '13px 16px', 
                            background: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(212, 166, 74, 0.15)', 
                            borderRadius: '4px', 
                            color: '#fff', 
                            fontSize: '14.5px', 
                            outline: 'none', 
                            height: '100px', 
                            resize: 'vertical',
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
                          required={f.required}
                        />
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
                          placeholder={f.placeholder || ''}
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
                          required={f.required}
                        />
                      )}
                    </div>
                  )
                })
              )}

            </div>

            <button
              type="submit"
              disabled={submitting}
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
              {submitting ? t('customForm.submitting') : (form.type === 'poll' ? t('customForm.submitPoll') : t('customForm.submitForm'))}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
