import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCustomFormBySlug, submitFormAnswer } from '../data/classcore'
import './InnerPage.css'

export default function CustomFormView() {
  const { slug } = useParams()
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
          setError('ფორმები / გამოკითხვა ვერ მოიძებნა')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('კავშირის შეცდომა')
        setLoading(false)
      })
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form) return

    // Validate
    if (form.type === 'poll' && !answers.selectedOption) {
      setError('გთხოვთ აირჩიოთ ერთ-ერთი ვარიანტი')
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
      setError('მონაცემების გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.')
    }
  }

  if (loading) {
    return (
      <div className="inner-page" style={{ padding: '150px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: 'var(--gold)', fontSize: '18px', letterSpacing: '1px' }}>იტვირთება...</div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="inner-page" style={{ padding: '150px 20px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', background: 'rgba(20,20,20,0.85)', border: '1px solid #dc3545', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', color: '#dc3545', marginBottom: '15px' }}>⚠</div>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>შეცდომა</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{error || 'გვერდი ვერ მოიძებნა'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="inner-page" style={{ padding: '120px 20px 80px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', border: '1px solid var(--gold)', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '64px', color: 'var(--gold)', marginBottom: '20px' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-title)', color: '#fff', marginBottom: '15px' }}>
              {form.type === 'poll' ? 'ხმა მიღებულია!' : 'მონაცემები გაგზავნილია!'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>
              გმადლობთ მონაწილეობისთვის. თქვენი პასუხი წარმატებით შეინახა ბაზაში.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontFamily: 'var(--font-title)', color: '#fff', fontSize: '28px', marginBottom: '10px', letterSpacing: '1px' }}>{form.title}</h1>
              {form.description && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>{form.description}</p>
              )}
              <div style={{ display: 'inline-block', marginTop: '12px', padding: '4px 12px', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', borderRadius: '20px', color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {form.type === 'poll' ? 'გამოკითხვა' : 'სარეგისტრაციო ბლანკი'}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid #dc3545', color: '#ff6b7b', padding: '12px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {form.type === 'poll' ? (
                /* Render Poll Options */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>აირჩიეთ სასურველი ვარიანტი: *</label>
                  {Array.isArray(form.fields) && form.fields.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswers({ selectedOption: opt })}
                      style={{
                        padding: '16px 20px',
                        background: answers.selectedOption === opt ? 'rgba(212,175,55,0.15)' : '#111',
                        border: answers.selectedOption === opt ? '1px solid var(--gold)' : '1px solid #333',
                        borderRadius: '10px',
                        color: answers.selectedOption === opt ? 'var(--gold)' : '#fff',
                        textAlign: 'left',
                        fontSize: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: answers.selectedOption === opt ? '600' : '400'
                      }}
                    >
                      <span>{opt}</span>
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        border: answers.selectedOption === opt ? '5px solid var(--gold)' : '2px solid #555',
                        background: '#111',
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
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
                        {f.label} {f.required ? '*' : ''}
                      </label>
                      
                      {f.type === 'select' ? (
                        <select
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
                          style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
                          required={f.required}
                        >
                          <option value="">აირჩიეთ...</option>
                          {Array.isArray(f.options) && f.options.map((o, idx) => (
                            <option key={idx} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
                          placeholder={f.placeholder || ''}
                          style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none', height: '100px', resize: 'vertical' }}
                          required={f.required}
                        />
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={answers[key] || ''}
                          onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
                          placeholder={f.placeholder || ''}
                          style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
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
              className="btn btn--gold"
              style={{ width: '100%', marginTop: '35px', padding: '14px 0', fontSize: '15px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {submitting ? 'იგზავნება...' : (form.type === 'poll' ? 'ხმის მიცემა' : 'გაგზავნა')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
