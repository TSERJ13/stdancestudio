import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../data/db'
import './admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')

    // 1. Fallback / direct admin check
    if (email === 'admin@stdance.ge' && pw === 'Kjkszpj13') {
      adminLogin(email, pw)
      navigate('/admin/dashboard')
      return
    }

    // 2. Real-time direct Supabase Auth integration with ClassCore.ge backend!
    try {
      const res = await fetch('https://xnhzqalncwcefnhoqzxe.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaHpxYWxuY3djZWZuaG9xenhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODU5MjcsImV4cCI6MjA4NzM2MTkyN30.tapUV9nQIYkJif0lS9OQNFSBgIoZLuJhexcmtfj3h48'
        },
        body: JSON.stringify({ email, password: pw })
      })

      if (!res.ok) {
        throw new Error('ელ-ფოსტა ან პაროლი არასწორია')
      }

      const tokenData = await res.json()
      if (tokenData?.access_token) {
        // Authenticated successfully! Persist session
        localStorage.setItem('std_admin_auth', 'true')
        navigate('/admin/dashboard')
      } else {
        throw new Error('ავტორიზაცია ვერ მოხერხდა')
      }
    } catch (err) {
      setErr(err.message || 'იმეილი ან პაროლი არასწორია')
      setPw('')
    } finally {
      setLoading(false)
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
          <p className="admin-login__desc">შეიყვანეთ ClassCore-ის ელ-ფოსტა და პაროლი</p>

          <form onSubmit={handleSubmit}>
            {err && <div className="admin-error">⚠ {err}</div>}
            
            <div className="admin-field">
              <label>ელ-ფოსტა</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErr('') }}
                placeholder="email@example.com"
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

            <button type="submit" className="admin-btn admin-btn--gold" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'მოწმდება...' : 'შესვლა →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
