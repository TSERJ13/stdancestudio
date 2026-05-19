import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  fetchStudioData, getStudentName,
  getStudentSubscription, getStudentAttendance,
  getStudentGroups, getPortalSession,
  clearPortalSession, clearCache,
  findAllStudentsByPhone, savePortalSession
} from '../../data/classcore'
import { getTournaments } from '../../data/db'
import './portal.css'

const SVG_ICONS = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  sub: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}><rect width="22" height="16" x="2" y="4" rx="2"/><path d="M2 10h20M6 14h2"/></svg>
  ),
  schedule: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  att: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
  ),
  trn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  )
};

const TRANSLATIONS = {
  ka: {
    title: 'სტუდენტის პორტალი',
    logout: 'გასვლა',
    loading: 'იტვირთება...',
    error_load: 'მონაცების ჩატვირთვა ვერ მოხერხდა',
    retry: 'თავიდან ცდა',
    years: 'წლის',
    parent: 'მშობელი',
    sub_warning: 'აბონემენტი მთავრდება',
    info_title: 'პირადი ინფორმაცია',
    name: 'სახელი',
    phone: 'ტელეფონი',
    birth_date: 'დაბადების თარიღი',
    groups: 'გუნდ(ებ)ი',
    status: 'სტატუსი',
    active: '✅ აქტიური',
    inactive: '❌ არააქტიური',
    sub_title: 'აბონემენტი',
    remaining: 'დარჩენილი გაკვეთილი',
    total: 'სულ',
    lessons: 'გაკვეთილი',
    used: 'გამოყენებული',
    expires: 'ვადა',
    remaining_only: 'დარჩა მხოლოდ',
    update_warning: 'გაკვეთილი. გთხოვთ დროულად განაახლოთ აბონემენტი.',
    no_sub: 'აბონემენტის ინფო არ არის',
    my_groups: 'ჩემი ჯგუფები',
    teacher: 'მასწავლებელი',
    no_group: 'ჯგუფი მინიჭებული არ არის',
    no_schedule: 'განრიგი მითითებული არ არის',
    attendance: 'დასწრება',
    present: 'დასწრებული',
    absent: 'გაცდენა',
    total_records: 'სულ {n} ჩანაწერი',
    no_attendance: 'დასწრების ჩანაწერები არ არის',
    upcoming_tournaments: 'მომავალი ტურნირები',
    tournament_results: 'ტურნირების შედეგები',
    my_categories: 'ჩემი კატეგორიები:',
    show_map: 'რუკაზე ნახვა',
    place: 'ადგილი',
    total_participants: 'სულ {n} მონაწილე',
    no_tournaments: 'ტურნირების ინფორმაცია და შედეგები ჯერ არ არის დამატებული',
    ticket_price: 'ბილეთის ფასი',
    tabs: {
      info: 'ჩემი ინფო',
      sub: 'აბონემენტი',
      schedule: 'განრიგი',
      att: 'დასწრება',
      trn: 'ტურნირები'
    },
    days: ['კვი','ორშ','სამ','ოთხ','ხუთ','პარ','შაბ']
  },
  ru: {
    title: 'Портал студента',
    logout: 'Выйти',
    loading: 'Загрузка...',
    error_load: 'Не удалось загрузить данные',
    retry: 'Повторить',
    years: 'лет',
    parent: 'Родитель',
    sub_warning: 'Абонемент заканчивается',
    info_title: 'Личная информация',
    name: 'Имя',
    phone: 'Телефон',
    birth_date: 'Дата рождения',
    groups: 'Группа(ы)',
    status: 'Статус',
    active: '✅ Активный',
    inactive: '❌ Неактивный',
    sub_title: 'Абонемент',
    remaining: 'Осталось занятий',
    total: 'Всего',
    lessons: 'занятий',
    used: 'Использовано',
    expires: 'Срок',
    remaining_only: 'Осталось только',
    update_warning: 'занятий. Пожалуйста, своевременно обновите абонемент.',
    no_sub: 'Информация об абонементе отсутствует',
    my_groups: 'Мои группы',
    teacher: 'Преподаватель',
    no_group: 'Группа не назначена',
    no_schedule: 'Расписание не указано',
    attendance: 'Посещаемость',
    present: 'Посетил',
    absent: 'Пропустил',
    total_records: 'Всего {n} записей',
    no_attendance: 'Записи о посещаемости отсутствуют',
    upcoming_tournaments: 'Предстоящие турниры',
    tournament_results: 'Результаты турниров',
    my_categories: 'Мои категории:',
    show_map: 'Показать на карте',
    place: 'место',
    total_participants: 'Всего {n} участников',
    no_tournaments: 'Информация о турнирах и результатах пока не добавлена',
    ticket_price: 'Цена билета',
    tabs: {
      info: 'Моя инфо',
      sub: 'Абонемент',
      schedule: 'Расписание',
      att: 'Посещаемость',
      trn: 'Турниры'
    },
    days: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
  },
  en: {
    title: 'Student Portal',
    logout: 'Logout',
    loading: 'Loading...',
    error_load: 'Failed to load data',
    retry: 'Retry',
    years: 'years',
    parent: 'Parent',
    sub_warning: 'Subscription ending soon',
    info_title: 'Personal Info',
    name: 'Name',
    phone: 'Phone',
    birth_date: 'Birth Date',
    groups: 'Group(s)',
    status: 'Status',
    active: '✅ Active',
    inactive: '❌ Inactive',
    sub_title: 'Subscription',
    remaining: 'Remaining lessons',
    total: 'Total',
    lessons: 'lessons',
    used: 'Used',
    expires: 'Expires',
    remaining_only: 'Only',
    update_warning: 'lessons left. Please renew your subscription.',
    no_sub: 'No subscription info',
    my_groups: 'My Groups',
    teacher: 'Teacher',
    no_group: 'No group assigned',
    no_schedule: 'No schedule specified',
    attendance: 'Attendance',
    present: 'Present',
    absent: 'Absent',
    total_records: 'Total {n} records',
    no_attendance: 'No attendance records',
    upcoming_tournaments: 'Upcoming Tournaments',
    tournament_results: 'Tournament Results',
    my_categories: 'My Categories:',
    show_map: 'View on map',
    place: 'place',
    total_participants: 'Total {n} participants',
    no_tournaments: 'No tournaments or results yet',
    ticket_price: 'Ticket Price',
    tabs: {
      info: 'My Info',
      sub: 'Subscription',
      schedule: 'Schedule',
      att: 'Attendance',
      trn: 'Tournaments'
    },
    days: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  }
};

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [siblings, setSiblings] = useState([])
  const [tab, setTab] = useState('info')
  const [sub, setSub] = useState(null)
  const [att, setAtt] = useState([])
  const [groups, setGroups] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState('ka')

  useEffect(() => {
    const studentId = getPortalSession()
    if (!studentId) { navigate('/portal'); return }

    setTournaments(getTournaments())

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
        
        // Find siblings
        const loggedPhone = localStorage.getItem('std_portal_logged_phone')
        if (loggedPhone) {
          const sibs = findAllStudentsByPhone(data.students || [], loggedPhone)
          setSiblings(sibs)
        }

        // Auto-detect student language from ClassCore preference
        const ccLang = found.language || found.data?.language || 'ka';
        const storedLang = localStorage.getItem('std_portal_lang');
        if (storedLang) {
          setLang(storedLang);
        } else {
          setLang(ccLang);
          localStorage.setItem('std_portal_lang', ccLang);
        }

        if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
          setTournaments(data.tournaments)
          localStorage.setItem('std_tournaments', JSON.stringify(data.tournaments))
        }
        
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard load error:', err)
        setError('cc_error')
        setLoading(false)
      })
  }, [navigate])

  const handleLogout = () => {
    clearPortalSession()
    clearCache()
    localStorage.removeItem('std_portal_logged_phone')
    navigate('/portal')
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const t = (key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.ka;
    return dict[key] || TRANSLATIONS.ka[key] || '';
  }

  if (loading) {
    return (
      <div className="portal-wrap portal-shell">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#d4a64a', fontSize: '1.1rem' }}>
          ⏳ {t('loading')}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-wrap portal-shell">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
          <div style={{ color: '#ff7070', fontSize: '1.1rem' }}>⚠ {t('error_load')}</div>
          <button className="portal-btn" onClick={() => { clearCache(); window.location.reload() }}>{t('retry')}</button>
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

  const recentAtt = att.slice(-30)
  const present = recentAtt.filter(r => r.present).length
  const absent  = recentAtt.filter(r => !r.present).length
  const pct     = recentAtt.length ? Math.round((present / recentAtt.length) * 100) : 0

  const upcomingTrn = tournaments.filter(t => {
    const isFuture = t.date >= today;
    const isAssigned = !t.assignedStudents || t.assignedStudents.length === 0 || t.assignedStudents.includes(student.id);
    return isFuture && isAssigned;
  })
  const pastTrn = tournaments.filter(t => {
    const isPast = t.date < today;
    const isAssigned = !t.assignedStudents || t.assignedStudents.length === 0 || t.assignedStudents.includes(student.id);
    return isPast && isAssigned && t.results?.[student.id]?.length > 0;
  })

  const TABS_LIST = [
    { id: 'info',    icon: 'info', label: t('tabs').info },
    { id: 'sub',     icon: 'sub', label: t('tabs').sub },
    { id: 'schedule',icon: 'schedule', label: t('tabs').schedule },
    { id: 'att',     icon: 'att', label: t('tabs').att },
    { id: 'trn',     icon: 'trn', label: t('tabs').trn },
  ];

  return (
    <div className="portal-wrap portal-shell">
      <header className="portal-header">
        <div className="portal-header__brand-container" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/" className="header__brand" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}>
            <img src="/images/logo-transparent.png" alt="ST Dance Studio" className="header__logo" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'drop-shadow(0 0 12px var(--color-gold-glow))' }} />
            <div className="header__brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase' }}>
              <span className="header__brand-name" style={{ color: 'var(--color-gold)', fontSize: '1.25rem', letterSpacing: '0.04em', fontWeight: 600 }}>ST DANCE</span>
              <div style={{ height: '1px', background: 'var(--color-gold)', margin: '2px 0' }}></div>
              <span className="header__brand-sub" style={{ color: '#fff', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'lowercase' }}>studio</span>
            </div>
          </Link>
          <div className="portal-header__divider" style={{ width: '1px', height: '24px', background: 'rgba(212,166,74,0.2)', margin: '0 1rem' }}></div>
          <span className="portal-header__name" style={{ fontSize: '0.95rem', fontFamily: 'var(--font-display, "Cormorant Garamond", serif)', fontStyle: 'italic', color: 'var(--color-gold, #d4a64a)', letterSpacing: '0.05em' }}>{t('title')}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="portal-header__logout desktop-only" onClick={handleLogout}>{t('logout')} ↗</button>
        </div>

        <button
          className={`portal-burger mobile-only ${mobileOpen ? 'is-open' : ''}`}
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <div className={`portal-mobile-menu ${mobileOpen ? 'is-open' : ''}`}>
        <nav className="portal-mobile-menu__nav">
          {TABS_LIST.map((tItem, i) => (
            <button
              key={tItem.id}
              className={`portal-mobile-menu__link ${tab === tItem.id ? 'is-active' : ''}`}
              onClick={() => { setTab(tItem.id); setMobileOpen(false) }}
              style={{ animationDelay: `${0.1 + i * 0.07}s`, display: 'flex', alignItems: 'center' }}
            >
              <span className="portal-mobile-menu__num">0{i + 1}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '0.75rem', color: tab === tItem.id ? 'var(--color-gold)' : 'inherit' }}>
                {SVG_ICONS[tItem.icon]}
              </span>
              {tItem.label}
            </button>
          ))}

          {/* Sibling switcher for mobile inside drawer */}
          {siblings.length > 1 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6b665e' }}>ბავშვის შეცვლა / Сменить ребенка</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {siblings.map(sib => {
                  const isCurrent = sib.id === student.id;
                  return (
                    <button
                      key={sib.id}
                      onClick={() => {
                        savePortalSession(sib.id);
                        window.location.reload();
                      }}
                      style={{
                        background: isCurrent ? 'var(--color-gold, #d4a64a)' : 'transparent',
                        border: '1px solid var(--color-gold, #d4a64a)',
                        color: isCurrent ? '#000' : '#fff',
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      👤 {getStudentName(sib)} {isCurrent ? '✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Integrated language selector for mobile menu drawer at the bottom */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {['ka', 'ru', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); localStorage.setItem('std_portal_lang', l); setMobileOpen(false); }}
                  style={{
                    background: lang === l ? 'var(--color-gold, #d4a64a)' : 'transparent',
                    border: '1px solid ' + (lang === l ? 'var(--color-gold, #d4a64a)' : 'rgba(255,255,255,0.2)'),
                    color: lang === l ? '#000' : '#fff',
                    fontFamily: 'inherit',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </nav>
        <button className="portal-mobile-menu__logout" onClick={handleLogout}>
          {t('logout')} ↗
        </button>
      </div>

      <div className="portal-body">
        <nav className="portal-sidenav">
          <div>
            {TABS_LIST.map(tItem => (
              <button key={tItem.id} className={`portal-nav-item${tab===tItem.id?' active':''}`} onClick={() => setTab(tItem.id)} style={{ display: 'flex', alignItems: 'center' }}>
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {SVG_ICONS[tItem.icon]}
                </span>
                {tItem.label}
              </button>
            ))}
          </div>

          {siblings.length > 1 && (
            <div style={{ padding: '2rem 1.25rem 1rem', borderTop: '1px solid rgba(212,166,74,0.1)', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b665e' }}>ბავშვის შეცვლა / Сменить ребенка</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {siblings.map(sib => {
                  const isCurrent = sib.id === student.id;
                  return (
                    <button
                      key={sib.id}
                      onClick={() => {
                        savePortalSession(sib.id);
                        window.location.reload();
                      }}
                      style={{
                        background: isCurrent ? 'rgba(212,166,74,0.12)' : 'transparent',
                        border: '1px solid ' + (isCurrent ? 'var(--color-gold, #d4a64a)' : 'rgba(255,255,255,0.08)'),
                        color: isCurrent ? 'var(--color-gold, #d4a64a)' : '#a8a39a',
                        fontFamily: 'inherit',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      👤 {getStudentName(sib)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Integrated language selector for desktop sidebar at the very bottom */}
          <div style={{ padding: '1.25rem 1.25rem 0.5rem', borderTop: '1px solid rgba(212,166,74,0.1)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
              {['ka', 'ru', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); localStorage.setItem('std_portal_lang', l); }}
                  style={{
                    background: lang === l ? 'var(--color-gold, #d4a64a)' : 'transparent',
                    border: '1px solid ' + (lang === l ? 'var(--color-gold, #d4a64a)' : 'rgba(255,255,255,0.1)'),
                    color: lang === l ? '#000' : '#a8a39a',
                    fontFamily: 'inherit',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="portal-content">
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
                {age && <span>{age} {t('years')} · </span>}
                {t('parent')}: {parentName || '—'}
              </div>
              <div className="portal-hero__meta">
                <span className="portal-badge portal-badge--gold">{studentData.dance_class || 'N Class'}</span>
                <span className={`portal-badge ${student.status === 'active' || !student.status ? 'portal-badge--green' : 'portal-badge--red'}`}>
                  {student.status === 'active' || !student.status ? t('active') : t('inactive')}
                </span>
              </div>
            </div>
          </div>

          {tab === 'info' && (
            <div className="portal-card animate-fade-in">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.info}</span>
                <span className="portal-card__title">{t('info_title')}</span>
              </div>
              <div className="portal-card__body">
                <div className="portal-info-grid">
                  <div className="portal-info-item"><span className="label">{t('name')}</span><span className="val">{name}</span></div>
                  <div className="portal-info-item"><span className="label">{t('phone')}</span><span className="val">{student.phone || '—'}</span></div>
                  <div className="portal-info-item"><span className="label">{t('birth_date')}</span><span className="val">{birthDate || '—'}</span></div>
                  <div className="portal-info-item"><span className="label">{t('parent')}</span><span className="val">{parentName || '—'}</span></div>
                  <div className="portal-info-item"><span className="label">{t('groups')}</span><span className="val">{groups.map(g=>g.name).join(', ') || '—'}</span></div>
                  <div className="portal-info-item"><span className="label">{t('status')}</span><span className="val">{student.status === 'active' || !student.status ? t('active') : t('inactive')}</span></div>
                </div>
              </div>
            </div>
          )}

          {tab === 'sub' && (
            <div className="portal-card animate-fade-in">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.sub}</span>
                <span className="portal-card__title">{t('sub_title')}</span>
              </div>
              <div className="portal-card__body">
                {sub ? (
                  <div>
                    {sub.total - sub.used <= 2 && (
                      <div className="portal-alert portal-alert--warning" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span>⚠</span>
                        <div><strong>{t('sub_warning')}!</strong> {t('remaining_only')} {sub.total - sub.used} {t('update_warning')}</div>
                      </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{t('remaining')}</div>
                        <div style={{ fontSize: '4.5rem', fontWeight: 300, color: 'var(--color-gold)', lineHeight: 1 }}>{sub.total - sub.used}</div>
                        <div style={{ fontSize: '0.85rem', color: '#a8a39a', marginTop: '0.5rem' }}>{t('total')} {sub.total} {t('lessons')}</div>
                      </div>
                      <div style={{ flex: 1.5, minWidth: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="portal-progress">
                          <div className="portal-progress__fill" style={{ width: `${Math.min(100, (sub.used / sub.total) * 100)}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: '0.5rem', color: '#a8a39a' }}>
                          <span>{t('used')}: {sub.used}</span>
                          <span>{t('expires')}: {sub.expires || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#6b665e', fontSize: '0.85rem' }}>{t('no_sub')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="portal-card animate-fade-in">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.schedule}</span>
                <span className="portal-card__title">{t('my_groups')}</span>
              </div>
              <div className="portal-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {groups.length === 0 && <p style={{color:'#6b665e',fontSize:'0.85rem'}}> {t('no_group')}</p>}
                {groups.map(g => (
                  <div key={g.id} className="portal-group-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-gold)' }}>{g.name}</span>
                      <span style={{ fontSize: '0.8rem', color: '#a8a39a' }}>{t('teacher')}: {g.teacher_name || '—'}</span>
                    </div>
                    {g.schedule && g.schedule.length > 0 ? (
                      <div className="portal-schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {g.schedule.map((s, idx) => (
                          <div key={idx} style={{ display: 'flex', fontSize: '0.88rem', color: '#f5f1e8' }}>
                            <span style={{ width: '100px', fontWeight: 600, color: '#d4a64a' }}>{t('days')[s.day]}:</span>
                            <span>{s.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#6b665e', fontSize: '0.8rem', margin: 0 }}>{t('no_schedule')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'att' && (
            <div className="portal-card animate-fade-in">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.att}</span>
                <span className="portal-card__title">{t('attendance')}</span>
              </div>
              <div className="portal-card__body">
                {att.length > 0 ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.01)', padding: '1rem 1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div><div style={{ fontSize: '0.75rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('present')}</div><div style={{ fontSize: '1.75rem', color: '#50c878', fontWeight: 600 }}>{present}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('absent')}</div><div style={{ fontSize: '1.75rem', color: '#ff7070', fontWeight: 600 }}>{absent}</div></div>
                      <div><div style={{ fontSize: '0.75rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>%</div><div style={{ fontSize: '1.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>{pct}%</div></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      {att.map((r, i) => (
                        <div key={i} className={`portal-att-pill ${r.present ? 'present' : 'absent'}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid ' + (r.present ? 'rgba(80,200,120,0.15)' : 'rgba(220,50,50,0.15)') }}>
                          <span>{r.date}</span>
                          <span style={{ fontWeight: 700 }}>{r.present ? '✓' : '×'}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b665e', marginTop: '1.5rem', textAlign: 'right' }}>{t('total_records').replace('{n}', att.length)}</div>
                  </div>
                ) : (
                  <p style={{ color: '#6b665e', fontSize: '0.85rem' }}>{t('no_attendance')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'trn' && (
            <>
              {upcomingTrn.length > 0 && (
                <div className="portal-card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                  <div className="portal-card__head">
                    <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.trn}</span>
                    <span className="portal-card__title">{t('upcoming_tournaments')}</span>
                  </div>
                  <div className="portal-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {upcomingTrn.map(tItem => {
                      const stData = tItem.assignedStudentsData?.[student.id] || {}
                      
                      // Get categories with details
                      let myCats = []
                      if (Array.isArray(stData.categories)) {
                        myCats = stData.categories
                      } else {
                        // Legacy fallback
                        const legacyCats = tItem.studentCategories?.[student.id] || tItem.studentSchedules?.[student.id]?.categories || []
                        const legacyStartTime = tItem.studentSchedules?.[student.id]?.startTime || ''
                        const legacyReadyTime = tItem.studentSchedules?.[student.id]?.readyTime || ''
                        myCats = legacyCats.map(c => ({
                          name: c,
                          readyTime: legacyReadyTime,
                          time: legacyStartTime
                        }))
                      }

                      return (
                        <div key={tItem.id} className="trn-upcoming">
                          <div className="trn-upcoming__name" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>{tItem.name}</div>
                          <div className="trn-upcoming__date">
                            📅 {tItem.endDate && tItem.endDate !== tItem.date ? `${tItem.date} — ${tItem.endDate}` : tItem.date}
                          </div>
                          <div className="trn-upcoming__info">
                            <span>🏛 {tItem.venue}</span>
                            <span>📍 {tItem.address}</span>
                            {tItem.fee ? (
                              <span style={{ color: 'var(--color-gold)' }}>
                                🎫 {t('ticket_price')}: {tItem.fee}{tItem.currency || '₾'}
                              </span>
                            ) : null}
                          </div>

                          {myCats.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.75rem 0' }}>
                              <span style={{ fontSize: '0.72rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                                {lang === 'ru' ? 'Мои категории и время:' : lang === 'en' ? 'My Categories & Time:' : 'ჩემი კატეგორიები და დრო:'}
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {myCats.map((cat, idx) => (
                                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.92rem', color: '#f5f1e8', fontWeight: 600 }}>{cat.name}</span>
                                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {cat.date && <span className="portal-badge" style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#a8a39a', border: '1px solid rgba(255,255,255,0.08)' }}>📅 {cat.date}</span>}
                                        {cat.readyTime && <span className="portal-badge" style={{ fontSize: '0.75rem', background: 'rgba(212,166,74,0.08)', color: 'var(--color-gold)', border: '1px solid rgba(212,166,74,0.15)' }}>🎒 {lang === 'ru' ? 'Сбор:' : lang === 'en' ? 'Ready:' : 'მზადება:'} {cat.readyTime}</span>}
                                        {cat.time && <span className="portal-badge portal-badge--gold" style={{ fontSize: '0.75rem' }}>🕒 {lang === 'ru' ? 'Старт:' : lang === 'en' ? 'Start:' : 'დაწყება:'} {cat.time}</span>}
                                      </div>
                                    </div>
                                    {(cat.venue || cat.fee) && (
                                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#a8a39a', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.35rem', marginTop: '0.15rem' }}>
                                        {cat.venue && <span>🏛 {cat.venue}</span>}
                                        {cat.fee && <span style={{ color: 'var(--color-gold)' }}>💰 {lang === 'ru' ? 'Взнос:' : lang === 'en' ? 'Fee:' : 'გადასახადი:'} {cat.fee}</span>}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.82rem', color: '#6b665e', fontStyle: 'italic', margin: '0.75rem 0' }}>
                              {lang === 'ru' ? 'Категории еще не назначены' : lang === 'en' ? 'No categories assigned yet' : 'კატეგორიები ჯერ არ არის მინიჭებული'}
                            </div>
                          )}

                          {tItem.notes && tItem.notes.trim() && (
                            <p style={{ fontSize: '0.8rem', color: '#a8a39a', marginBottom: '0.75rem', lineHeight: '1.5' }}>{tItem.notes}</p>
                          )}
                          {tItem.mapUrl && (
                            <a className="trn-map-btn" href={tItem.mapUrl} target="_blank" rel="noreferrer">📍 {t('show_map')}</a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {pastTrn.length > 0 && (
                <div className="portal-card animate-fade-in">
                  <div className="portal-card__head">
                    <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.trn}</span>
                    <span className="portal-card__title">{t('tournament_results')}</span>
                  </div>
                  <div className="portal-card__body">
                    {pastTrn.map(tItem => {
                      const results = tItem.results?.[student.id] || []
                      return results.map((r, i) => {
                        const medal = r.place === 1 
                          ? (lang === 'ru' ? '🥇 I место' : lang === 'en' ? '🥇 1st Place' : '🥇 I ადგილი') 
                          : r.place === 2 
                            ? (lang === 'ru' ? '🥈 II место' : lang === 'en' ? '🥈 2nd Place' : '🥈 II ადგილი') 
                            : r.place === 3 
                              ? (lang === 'ru' ? '🥉 III место' : lang === 'en' ? '🥉 3rd Place' : '🥉 III ადгили') 
                              : null;
                        return (
                          <div key={`${tItem.id}-${i}`} className="trn-history-item">
                            <div className="trn-place">
                              {r.place === 1 ? '🥇' : r.place === 2 ? '🥈' : r.place === 3 ? '🥉' : `#${r.place}`}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="trn-hist-cat" style={{ fontWeight: 600 }}>{r.category}</div>
                              <div className="trn-hist-event">
                                {tItem.name} · {tItem.endDate && tItem.endDate !== tItem.date ? `${tItem.date} — ${tItem.endDate}` : tItem.date}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className="portal-badge portal-badge--gold" style={{ fontSize: '0.75rem' }}>
                                {medal || `#${r.place} ${t('place')}`}
                              </span>
                              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-dim)', marginTop: '0.2rem' }}>
                                {t('total_participants').replace('{n}', r.total)}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })}
                  </div>
                </div>
              )}

              {upcomingTrn.length === 0 && pastTrn.length === 0 && (
                <div className="portal-card">
                  <div className="portal-card__body" style={{ color: '#6b665e', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                    {t('no_tournaments')}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
