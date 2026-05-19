import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../data/db'
import './admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (adminLogin(email, pw)) {
      navigate('/admin/dashboard')
    } else {
      setErr('პაროლი არასწორია')
      setPw('')
    }
  }

  return (
    <div className="admin-wrap">
      <div className="admin-login">
        <div className="admin-login__card">
          <div className="admin-login__logo">
            <span className="admin-login__logo-mark">ST</span>
            <span className="admin-login__logo-sub">Dance Studio</span>
          </div>
          <h1 className="admin-login__title">ადმინ პანელი</h1>
          <p className="admin-login__desc">შეიყვანეთ ელ-ფოსტა და პაროლი</p>

          <form onSubmit={handleSubmit}>
            {err && <div className="admin-error">⚠ {err}</div>}
            
            <div className="admin-field">
              <label>ელ-ფოსტა</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErr('') }}
                placeholder="admin@stdance.ge"
                autoFocus
                required
              />
            </div>

            <div className="admin-field">
              <label>პაროლი</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setErr('') }}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="admin-btn admin-btn--gold" style={{ marginTop: '0.5rem' }}>
              შესვლა →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
