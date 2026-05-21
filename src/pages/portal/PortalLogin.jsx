import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchStudioData, findAllStudentsByPhone,
  getStudentName, savePortalSession
} from '../../data/classcore'
import './portal.css'

export default function PortalLogin() {
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState([])
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setMatches([])
    setLoading(true)

    try {
      const data = await fetchStudioData()
      const found = findAllStudentsByPhone(data.students || [], phone)

      // Merge local language setting into each found student
      const localStudents = JSON.parse(localStorage.getItem('std_students') || '[]')
      const merged = found.map(s => {
        const localS = localStudents.find(ls => ls.id === s.id)
        return {
          ...s,
          language: (localS?.language) || s.language || s.data?.language || 'ka'
        }
      })

      if (merged.length === 1) {
        savePortalSession(merged[0].id)
        localStorage.setItem('std_portal_logged_phone', phone)
        navigate('/portal/dashboard')
      } else if (merged.length > 1) {
        setMatches(merged)
        localStorage.setItem('std_portal_logged_phone', phone)
      } else {
        setErr('ამ ნომრით სტუდენტი ვერ მოიძებნა')
      }
    } catch (error) {
      console.error('Portal login error:', error)
      setErr('სერვერთან დაკავშირება ვერ მოხერხდა. სცადეთ თავიდან.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStudent = (sid) => {
    savePortalSession(sid)
    navigate('/portal/dashboard')
  }

  return (
    <div className="portal-wrap">
      <div className="portal-login">
        <div className="portal-login__card">
          <div className="portal-login__logo-container">
            <img src="/images/logo-transparent.png" alt="ST Dance Studio" className="portal-login__logo-img" />
          </div>
          <h1 className="portal-login__title">სტუდენტის პორტალი</h1>

          {matches.length > 0 ? (
            <div>
              {(() => {
                // Detect dominant language among matched students
                const langs = matches.map(s => s.language || s.data?.language || 'ka')
                const allRu = langs.every(l => l === 'ru')
                const allKa = langs.every(l => l !== 'ru')
                const selectLabel = allRu ? 'Выберите ребёнка:' : allKa ? 'აირჩიეთ ბავშვი:' : 'აირჩიეთ ბავშვი / Выберите ребёнка:'
                const backLabel   = allRu ? 'Назад'               : allKa ? 'უკან დაბრუნება'   : 'უკან დაბრუნება / Назад'
                return (
                  <>
                    <p className="portal-login__hint" style={{ color: 'var(--color-gold, #d4a64a)', fontWeight: '600', marginBottom: '1.25rem' }}>
                      {selectLabel}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {matches.map(s => {
                        const sName = getStudentName(s)
                        return (
                          <button
                            key={s.id}
                            className="portal-btn"
                            onClick={() => handleSelectStudent(s.id)}
                            style={{
                              background: 'rgba(212,166,74,0.06)',
                              border: '1px solid var(--color-gold, #d4a64a)',
                              color: '#f5f1e8',
                              textTransform: 'none',
                              padding: '0.9rem',
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              borderRadius: '4px'
                            }}
                          >
                            👤 {sName}
                          </button>
                        )
                      })}
                      <button 
                        className="portal-btn" 
                        onClick={() => { setMatches([]); setPhone('') }}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#a8a39a',
                          marginTop: '0.5rem',
                          textTransform: 'none',
                          fontSize: '0.85rem'
                        }}
                      >
                        {backLabel}
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            <>
              <p className="portal-login__hint">შეიყვანეთ თქვენი ტელეფონის ნომერი</p>
              <form onSubmit={handleSubmit}>
                {err && <div className="portal-error">⚠ {err}</div>}
                <div className="portal-field">
                  <label>ტელეფონი</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setErr('') }}
                    placeholder="555 123 456"
                    autoFocus
                    required
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="portal-btn" disabled={loading}>
                  {loading ? 'იტვირთება...' : 'შესვლა →'}
                </button>
              </form>
            </>
          )}
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6b665e', marginTop: '1.5rem' }}>
            ClassCore.ge-თან დაკავშირებული
          </p>
        </div>
      </div>
    </div>
  )
}
