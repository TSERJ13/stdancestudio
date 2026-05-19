import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchStudioData, getStudentName,
  getStudentSubscription, getStudentAttendance,
  getStudentGroups, getPortalSession,
  clearPortalSession, clearCache
} from '../../data/classcore'
import './portal.css'

const DAYS_GEO = ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ']
const TABS = [
  { id: 'info',    icon: '👤', label: 'ჩემი ინფო' },
  { id: 'sub',     icon: '💳', label: 'აბონემენტი' },
  { id: 'schedule',icon: '📅', label: 'განრიგი' },
  { id: 'att',     icon: '📊', label: 'დასწრება' },
]

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [tab, setTab] = useState('info')
  const [sub, setSub] = useState(null)
  const [att, setAtt] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const studentId = getPortalSession()
    if (!studentId) { navigate('/portal'); return }

    fetchStudioData()
      .then(data => {
        const found = (data.students || []).find(s => s.id === studentId)
        if (!found) {
          clearPortalSession()
          navigate('/portal')
          return
        }

        setStudent(found)
        setSub(getStudentSubscription(data.subscriptions || [], studentId))
        setAtt(getStudentAttendance(data.attendance || [], studentId))
        setGroups(getStudentGroups(data.groups || [], found))
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard load error:', err)
        setError('მონაცემების ჩატვირთვა ვერ მოხერხდა')
        setLoading(false)
      })
  }, [navigate])

  const handleLogout = () => {
    clearPortalSession()
    clearCache()
    navigate('/portal')
  }

  if (loading) {
    return (
      <div className="portal-wrap portal-shell">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#d4a64a', fontSize: '1.1rem' }}>
          ⏳ იტვირთება...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-wrap portal-shell">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
          <div style={{ color: '#ff7070', fontSize: '1.1rem' }}>⚠ {error}</div>
          <button className="portal-btn" onClick={() => { clearCache(); window.location.reload() }}>თავიდან ცდა</button>
        </div>
      </div>
    )
  }

  if (!student) return null

  const name = getStudentName(student)
  const studentData = student.data || {}
  const birthDate = studentData.birth_date || ''
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : null
  const age = birthYear ? new Date().getFullYear() - birthYear : null
  const parentName = studentData.parent_name || ''
  const today = new Date().toISOString().slice(0,10)

  // Recent 30 days attendance
  const recentAtt = att.slice(-30)
  const present = recentAtt.filter(r => r.present).length
  const absent  = recentAtt.filter(r => !r.present).length
  const pct     = recentAtt.length ? Math.round((present / recentAtt.length) * 100) : 0

  return (
    <div className="portal-wrap portal-shell">
      <header className="portal-header">
        <div className="portal-header__brand">
          <span className="portal-header__logo">ST</span>
          <span className="portal-header__name">სტუდენტის პორტალი</span>
        </div>
        <button className="portal-header__logout" onClick={handleLogout}>გასვლა ↗</button>
      </header>

      <div className="portal-body">
        <nav className="portal-sidenav">
          {TABS.map(t => (
            <button key={t.id} className={`portal-nav-item${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              <span className="portal-nav-icon">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <main className="portal-content">
          {/* Hero */}
          <div className="portal-hero">
            <div className="portal-hero__photo">
              {studentData.photo_url
                ? <img src={studentData.photo_url} alt={name} />
                : name[0] || '?'
              }
            </div>
            <div>
              <div className="portal-hero__name">{name}</div>
              <div style={{ fontSize: '0.8rem', color: '#a8a39a' }}>
                {age && <span>{age} წლის</span>}
                {parentName && <span> · მშობელი: {parentName}</span>}
              </div>
              <div className="portal-hero__meta">
                {studentData.dance_class && (
                  <span className="portal-badge portal-badge--gold">{studentData.dance_class}</span>
                )}
                {groups.map((g, i) => (
                  <span key={i} className="portal-badge portal-badge--blue">
                    {g.data?.name || g.name || 'Group'}
                  </span>
                ))}
                {sub && sub.total && (sub.total - sub.used) <= 2 && (
                  <span className="portal-badge portal-badge--red">⚠ აბონემენტი მთავრდება</span>
                )}
              </div>
            </div>
          </div>

          {/* Tab: Info */}
          {tab === 'info' && (
            <div className="portal-card">
              <div className="portal-card__head"><span className="portal-card__icon">👤</span><span className="portal-card__title">პირადი ინფორმაცია</span></div>
              <div className="portal-card__body">
                <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['სახელი', name],
                      ['ტელეფონი', student.phone || studentData.phone || '—'],
                      ['დაბადების თარიღი', birthDate || '—'],
                      ['მშობელი', parentName || '—'],
                      ['ჯგუფ(ებ)ი', groups.map(g => g.data?.name || g.name || '').filter(Boolean).join(', ') || '—'],
                      ['სტატუსი', student.status === 'active' || !student.status ? '✅ აქტიური' : '❌ არააქტიური'],
                    ].filter(([,v]) => v && v !== '—').map(([k,v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.7rem 0', color: '#6b665e', width: '40%' }}>{k}</td>
                        <td style={{ padding: '0.7rem 0', fontWeight: 500 }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Subscription */}
          {tab === 'sub' && (
            <div className="portal-card">
              <div className="portal-card__head"><span className="portal-card__icon">💳</span><span className="portal-card__title">აბონემენტი</span></div>
              <div className="portal-card__body">
                {sub ? (
                  <>
                    <div className="sub-row">
                      <div>
                        <div className="sub-big">{Math.max(0, (sub.total || 0) - (sub.used || 0))}</div>
                        <div className="sub-label">დარჩენილი გაკვეთილი</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#a8a39a' }}>{sub.plan}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b665e', marginTop: '0.25rem' }}>სულ: {sub.total || '—'} გაკვეთილი</div>
                      </div>
                    </div>
                    {sub.total > 0 && (
                      <div className="sub-bar">
                        <div className="sub-bar__fill" style={{
                          width: `${Math.max(0, ((sub.total - sub.used) / sub.total) * 100)}%`,
                          background: (sub.total - sub.used) <= 2 ? '#ff7070' : (sub.total - sub.used) <= 4 ? '#d4a64a' : '#50c878'
                        }} />
                      </div>
                    )}
                    <div className="sub-details">
                      <span>გამოყენებული: <strong>{sub.used || 0}</strong></span>
                      {sub.expires && <span>ვადა: <strong style={{ color: sub.expires < today ? '#ff7070' : '#d4a64a' }}>{sub.expires.slice(0,10)}</strong></span>}
                    </div>
                    {sub.total && (sub.total - sub.used) <= 2 && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.25)', borderRadius: '4px', fontSize: '0.83rem', color: '#ff7070' }}>
                        ⚠ დარჩა მხოლოდ <strong>{Math.max(0, sub.total - sub.used)}</strong> გაკვეთილი. გთხოვთ დროულად განაახლოთ აბონემენტი.
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#6b665e' }}>აბონემენტის ინფო არ არის</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Schedule (Groups) */}
          {tab === 'schedule' && (
            <div className="portal-card">
              <div className="portal-card__head"><span className="portal-card__icon">📅</span><span className="portal-card__title">ჩემი ჯგუფები</span></div>
              <div className="portal-card__body">
                {groups.length > 0 ? (
                  <div className="schedule-grid">
                    {groups.map((g, i) => {
                      const gData = g.data || {}
                      const schedule = gData.schedule || g.schedule || []
                      return (
                        <div key={i} className="schedule-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span className="schedule-day" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {gData.name || g.name || 'ჯგუფი'}
                          </span>
                          {gData.teacher_name && (
                            <span style={{ fontSize: '0.78rem', color: '#a8a39a' }}>👨‍🏫 {gData.teacher_name}</span>
                          )}
                          {Array.isArray(schedule) && schedule.length > 0 ? (
                            schedule.map((slot, j) => (
                              <span key={j} className="schedule-time">
                                {slot.day || ''} {slot.start || slot.time || ''}{slot.end ? `–${slot.end}` : ''}
                              </span>
                            ))
                          ) : (
                            <span className="schedule-time" style={{ color: '#6b665e' }}>განრიგი მითითებული არ არის</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#6b665e' }}>ჯგუფი მინიჭებული არ არის</p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Attendance */}
          {tab === 'att' && (
            <div className="portal-card">
              <div className="portal-card__head"><span className="portal-card__icon">📊</span><span className="portal-card__title">დასწრება</span></div>
              <div className="portal-card__body">
                <div className="att-stats">
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: '#50c878' }}>{present}</div>
                    <div className="att-stat__label">დასწრებული</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: '#ff7070' }}>{absent}</div>
                    <div className="att-stat__label">გაცდენა</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: pct >= 80 ? '#50c878' : pct >= 60 ? '#d4a64a' : '#ff7070' }}>{pct}%</div>
                    <div className="att-stat__label">დასწრება</div>
                  </div>
                </div>

                {recentAtt.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b665e' }}>
                      სულ {att.length} ჩანაწერი
                    </div>
                    <div className="att-grid">
                      {DAYS_GEO.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '0.6rem', color: '#6b665e', paddingBottom: '3px' }}>{d}</div>
                      ))}
                      {recentAtt.map((r, i) => (
                        <div key={i} className={`att-cell att-cell--${r.present ? 'present' : 'absent'}`} title={r.date}>
                          {r.present ? '✓' : '✗'}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#6b665e', marginTop: '1rem' }}>დასწრების ჩანაწერები არ არის</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
