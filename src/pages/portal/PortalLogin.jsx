import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchStudioData, findStudentByPhone,
  getStudentName, savePortalSession
} from '../../data/classcore'
import './portal.css'

export default function PortalLogin() {
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)

    try {
      const data = await fetchStudioData()
      const student = findStudentByPhone(data.students || [], phone)

      if (student) {
        savePortalSession(student.id)
        navigate('/portal/dashboard')
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

  return (
    <div className="portal-wrap">
      <div className="portal-login">
        <div className="portal-login__card">
          <span className="portal-login__logo">ST</span>
          <span className="portal-login__sub">Dance Studio</span>
          <h1 className="portal-login__title">სტუდენტის პორტალი</h1>
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
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#6b665e', marginTop: '1.5rem' }}>
            ClassCore.ge-თან დაკავშირებული
          </p>
        </div>
      </div>
    </div>
  )
}
