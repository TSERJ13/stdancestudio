import React, { useState } from 'react'
import { submitRegistration } from '../data/classcore'
import './InnerPage.css'

export default function Register() {
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
    { id: 'I ცვლა', label: 'I ცვლა' },
    { id: 'II ცვლა', label: 'II ცვლა' },
    { id: 'ბაღის მოსწავლე', label: 'ბაღის მოსწავლე' },
    { id: 'თავისუფალი გრაფიკი', label: 'თავისუფალი გრაფიკი' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student_name || !form.birth_date || !form.shift || !form.parent_name || !form.parent_phone) {
      setError('გთხოვთ შეავსოთ ყველა ველი')
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
      setError('რეგისტრაციის გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.')
    }
  }

  return (
    <div className="inner-page" style={{ padding: '120px 20px 80px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)', border: '1px solid var(--gold)', borderRadius: '16px', padding: '40px 30px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '64px', color: 'var(--gold)', marginBottom: '20px' }}>✓</div>
            <h2 style={{ fontFamily: 'var(--font-title)', color: '#fff', marginBottom: '15px' }}>რეგისტრაცია მიღებულია!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6' }}>
              თქვენი განაცხადი წარმატებით გაიგზავნა სტუდიაში. ჩვენი ადმინისტრატორი უახლოეს დროში დაგიკავშირდებათ მითითებულ ტელეფონის ნომერზე.
            </p>
            <button 
              onClick={() => setSuccess(false)} 
              className="btn btn--gold"
              style={{ marginTop: '30px', padding: '12px 35px' }}
            >
              ახალი რეგისტრაცია
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: 'center', marginBottom: '35px' }}>
              <h1 style={{ fontFamily: 'var(--font-title)', color: '#fff', fontSize: '28px', marginBottom: '8px', letterSpacing: '1px' }}>ონლაინ რეგისტრაცია</h1>
              <p style={{ color: 'var(--gold)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>სტუდიის მოსწავლის მიღება</p>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid #dc3545', color: '#ff6b7b', padding: '12px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Student Name */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>ბავშვის სახელი და გვარი *</label>
                <input 
                  type="text" 
                  value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                  placeholder="მაგ: გიორგი კალანდაძე"
                  style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                  onBlur={e => e.target.style.borderColor = '#333'}
                  required
                />
              </div>

              {/* DOB */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>დაბადების თარიღი *</label>
                <input 
                  type="date" 
                  value={form.birth_date}
                  onChange={e => setForm({ ...form, birth_date: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
                  required
                />
              </div>

              {/* Shift */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>რომელ ცვლაში სწავლობს ბავშვი? *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {shifts.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm({ ...form, shift: s.id })}
                      style={{ 
                        padding: '12px 10px', 
                        background: form.shift === s.id ? 'rgba(212,175,55,0.15)' : '#111', 
                        border: form.shift === s.id ? '1px solid var(--gold)' : '1px solid #333', 
                        borderRadius: '8px', 
                        color: form.shift === s.id ? 'var(--gold)' : '#bbb', 
                        fontSize: '13px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        fontWeight: form.shift === s.id ? '600' : '400'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parent Name */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>მშობლის სახელი და გვარი *</label>
                <input 
                  type="text" 
                  value={form.parent_name}
                  onChange={e => setForm({ ...form, parent_name: e.target.value })}
                  placeholder="მაგ: მარიამ კალანდაძე"
                  style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
                  required
                />
              </div>

              {/* Parent Phone */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>მშობლის ტელეფონის ნომერი *</label>
                <input 
                  type="tel" 
                  value={form.parent_phone}
                  onChange={e => setForm({ ...form, parent_phone: e.target.value })}
                  placeholder="მაგ: 599123456"
                  style={{ width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' }}
                  required
                />
              </div>

            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn--gold"
              style={{ width: '100%', marginTop: '35px', padding: '14px 0', fontSize: '15px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              {loading ? 'იგზავნება...' : 'განაცხადის გაგზავნა'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
