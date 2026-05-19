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
    groups: 'ჯგუფ(ებ)ი',
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
    tabs: {
      info: 'Моя инфо',
      sub: 'Абонемент',
      schedule: 'Расписание',
      att: 'Посещаемость',
      trn: 'Турниры'
    },
    days: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
  }
};

const FloatingLangSwitcher = ({ lang, setLang }) => {
  const [expanded, setExpanded] = useState(false)

  const handleLangClick = (newLang) => {
    if (!expanded) {
      setExpanded(true)
    } else {
      setLang(newLang)
      localStorage.setItem('std_portal_lang', newLang)
      setExpanded(false)
    }
  }

  return (
    <div className={`floating-lang ${expanded ? 'is-expanded' : 'is-collapsed'}`} style={{
      display: 'flex',
      position: 'fixed',
      bottom: '2.5rem',
      right: '2.5rem',
      zIndex: 9999,
      background: '#000',
      border: '1px solid var(--color-gold, #d4a64a)',
      borderRadius: '40px',
      padding: '0.3rem',
      gap: (!expanded && window.innerWidth <= 768) ? '0' : '0.2rem',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      alignItems: 'center'
    }}>
      <button 
        onClick={() => handleLangClick('ka')} 
        style={{
          background: lang === 'ka' ? 'var(--color-gold, #d4a64a)' : 'transparent',
          border: '0',
          color: lang === 'ka' ? '#000' : '#fff',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          padding: '0.55rem 1.1rem',
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: (!expanded && window.innerWidth <= 768 && lang !== 'ka') ? 'none' : 'block'
        }}
      >
        GE
      </button>
      <button 
        onClick={() => handleLangClick('ru')} 
        style={{
          background: lang === 'ru' ? 'var(--color-gold, #d4a64a)' : 'transparent',
          border: '0',
          color: lang === 'ru' ? '#000' : '#fff',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          padding: '0.55rem 1.1rem',
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: (!expanded && window.innerWidth <= 768 && lang !== 'ru') ? 'none' : 'block'
        }}
      >
        RU
      </button>
    </div>
  )
}

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
        const studentData = found.data || {}
        const ccLang = studentData.language === 'ru' || studentData.lang === 'ru' || studentData.locale === 'ru' || studentData.nationality === 'ru' ? 'ru' : 'ka';
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
          <span className="portal-header__name" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display, "Cormorant Garamond", serif)', fontStyle: 'italic', color: 'var(--color-gold, #d4a64a)', letterSpacing: '0.05em' }}>{t('title')}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Sibling switcher in header for desktop */}
          {siblings.length > 1 && (
            <div className="sibling-switcher desktop-only" style={{ marginRight: '1rem', position: 'relative' }}>
              <select 
                value={student.id} 
                onChange={e => {
                  savePortalSession(e.target.value);
                  window.location.reload();
                }}
                style={{
                  background: 'rgba(212,166,74,0.06)',
                  border: '1px solid var(--color-gold, #d4a64a)',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  padding: '0.4rem 1.8rem 0.4rem 0.8rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                  backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%23d4a64a\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 6px center',
                  backgroundSize: '16px'
                }}
              >
                {siblings.map(sib => (
                  <option key={sib.id} value={sib.id} style={{ background: '#0a0a0a', color: '#fff' }}>
                    👤 {getStudentName(sib)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="lang-switcher desktop-only" style={{ display: 'flex', gap: '0.5rem', marginRight: '1rem' }}>
            <button 
              onClick={() => { setLang('ka'); localStorage.setItem('std_portal_lang', 'ka') }}
              style={{
                background: 'transparent',
                border: '0',
                color: lang === 'ka' ? 'var(--color-gold, #d4a64a)' : '#a8a39a',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              GE
            </button>
            <button 
              onClick={() => { setLang('ru'); localStorage.setItem('std_portal_lang', 'ru') }}
              style={{
                background: 'transparent',
                border: '0',
                color: lang === 'ru' ? 'var(--color-gold, #d4a64a)' : '#a8a39a',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              RU
            </button>
          </div>

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
          {/* Sibling switcher for mobile inside drawer */}
          {siblings.length > 1 && (
            <div style={{ padding: '0 2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b665e' }}>ბავშვის შეცვლა / Сменить ребенка</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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

          <div style={{ padding: '0 2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b665e' }}>Language / ენა</span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => {
                  setLang('ka');
                  localStorage.setItem('std_portal_lang', 'ka');
                }}
                style={{
                  background: lang === 'ka' ? 'var(--color-gold, #d4a64a)' : 'transparent',
                  border: '1px solid var(--color-gold, #d4a64a)',
                  color: lang === 'ka' ? '#000' : '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.3s ease'
                }}
              >
                GE
              </button>
              <button 
                onClick={() => {
                  setLang('ru');
                  localStorage.setItem('std_portal_lang', 'ru');
                }}
                style={{
                  background: lang === 'ru' ? 'var(--color-gold, #d4a64a)' : 'transparent',
                  border: '1px solid var(--color-gold, #d4a64a)',
                  color: lang === 'ru' ? '#000' : '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  flex: 1,
                  transition: 'all 0.3s ease'
                }}
              >
                RU
              </button>
            </div>
          </div>
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
        </nav>
        <button className="portal-mobile-menu__logout" onClick={handleLogout}>
          {t('logout')} ↗
        </button>
      </div>

      <div className="portal-body">
        <nav className="portal-sidenav">
          {TABS_LIST.map(tItem => (
            <button key={tItem.id} className={`portal-nav-item${tab===tItem.id?' active':''}`} onClick={() => setTab(tItem.id)} style={{ display: 'flex', alignItems: 'center' }}>
              <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {SVG_ICONS[tItem.icon]}
              </span>
              {tItem.label}
            </button>
          ))}
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
                {age && <span>{age} {t('years')}</span>}
                {parentName && <span> · {t('parent')}: {parentName}</span>}
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
                  <span className="portal-badge portal-badge--red">⚠ {t('sub_warning')}</span>
                )}
              </div>
            </div>
          </div>

          {tab === 'info' && (
            <div className="portal-card">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.info}</span>
                <span className="portal-card__title">{t('info_title')}</span>
              </div>
              <div className="portal-card__body">
                <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      [t('name'), name],
                      [t('phone'), student.phone || studentData.phone || '—'],
                      [t('birth_date'), birthDate || '—'],
                      [t('parent'), parentName || '—'],
                      [t('groups'), groups.map(g => g.data?.name || g.name || '').filter(Boolean).join(', ') || '—'],
                      [t('status'), student.status === 'active' || !student.status ? t('active') : t('inactive')],
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

          {tab === 'sub' && (
            <div className="portal-card">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.sub}</span>
                <span className="portal-card__title">{t('sub_title')}</span>
              </div>
              <div className="portal-card__body">
                {sub ? (
                  <>
                    <div className="sub-row">
                      <div>
                        <div className="sub-big">{Math.max(0, (sub.total || 0) - (sub.used || 0))}</div>
                        <div className="sub-label">{t('remaining')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#a8a39a' }}>{sub.plan}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b665e', marginTop: '0.25rem' }}>{t('total')}: {sub.total || '—'} {t('lessons')}</div>
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
                      <span>{t('used')}: <strong>{sub.used || 0}</strong></span>
                      {sub.expires && <span>{t('expires')}: <strong style={{ color: sub.expires < today ? '#ff7070' : '#d4a64a' }}>{sub.expires.slice(0,10)}</strong></span>}
                    </div>
                    {sub.total && (sub.total - sub.used) <= 2 && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.25)', borderRadius: '4px', fontSize: '0.83rem', color: '#ff7070' }}>
                        ⚠ {t('remaining_only')} <strong>{Math.max(0, sub.total - sub.used)}</strong> {t('update_warning')}
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#6b665e' }}>{t('no_sub')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'schedule' && (
            <div className="portal-card">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.schedule}</span>
                <span className="portal-card__title">{t('my_groups')}</span>
              </div>
              <div className="portal-card__body">
                {groups.length > 0 ? (
                  <div className="schedule-grid">
                    {groups.map((g, i) => {
                      const gData = g.data || {}
                      const schedule = gData.schedule || g.schedule || []
                      return (
                        <div key={i} className="schedule-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <span className="schedule-day" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                            {gData.name || g.name || 'Group'}
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
                            <span className="schedule-time" style={{ color: '#6b665e' }}>{t('no_schedule')}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ color: '#6b665e' }}>{t('no_group')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'att' && (
            <div className="portal-card">
              <div className="portal-card__head">
                <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.att}</span>
                <span className="portal-card__title">{t('attendance')}</span>
              </div>
              <div className="portal-card__body">
                <div className="att-stats">
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: '#50c878' }}>{present}</div>
                    <div className="att-stat__label">{t('present')}</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: '#ff7070' }}>{absent}</div>
                    <div className="att-stat__label">{t('absent')}</div>
                  </div>
                  <div className="att-stat">
                    <div className="att-stat__num" style={{ color: pct >= 80 ? '#50c878' : pct >= 60 ? '#d4a64a' : '#ff7070' }}>{pct}%</div>
                    <div className="att-stat__label">{t('attendance')}</div>
                  </div>
                </div>

                {recentAtt.length > 0 ? (
                  <>
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b665e' }}>
                      {t('total_records').replace('{n}', att.length)}
                    </div>
                    <div className="att-grid">
                      {t('days').map(d => (
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
                  <p style={{ color: '#6b665e', marginTop: '1rem' }}>{t('no_attendance')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'trn' && (
            <>
              {upcomingTrn.length > 0 && (
                <div className="portal-card animate-fade-in">
                  <div className="portal-card__head">
                    <span className="portal-nav-icon" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-gold)', marginRight: '0.5rem' }}>{SVG_ICONS.trn}</span>
                    <span className="portal-card__title">{t('upcoming_tournaments')}</span>
                  </div>
                  <div className="portal-card__body">
                    {upcomingTrn.map(tItem => {
                      const myCats = tItem.studentCategories?.[student.id] || []
                      return (
                        <div key={tItem.id} className="trn-upcoming">
                          <div className="trn-upcoming__name" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>{tItem.name}</div>
                          <div className="trn-upcoming__date">📅 {tItem.date}</div>
                          <div className="trn-upcoming__info">
                            <span>🏛 {tItem.venue}</span>
                            <span>📍 {tItem.address}</span>
                            {tItem.fee && <span style={{ color: 'var(--color-gold)' }}>💰 {tItem.fee}{tItem.currency || '₾'}</span>}
                          </div>
                          {myCats.length > 0 && (
                            <div className="trn-upcoming__cats">
                              <span style={{ fontSize: '0.72rem', color: '#6b665e', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('my_categories')}</span>
                              {myCats.map((c, i) => <span key={i} className="portal-badge portal-badge--gold">{c}</span>)}
                            </div>
                          )}
                          {tItem.notes && <p style={{ fontSize: '0.8rem', color: '#a8a39a', marginBottom: '0.75rem', lineHeight: '1.5' }}>{tItem.notes}</p>}
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
                          ? (lang === 'ru' ? '🥇 I место' : '🥇 I ადგილი') 
                          : r.place === 2 
                            ? (lang === 'ru' ? '🥈 II место' : '🥈 II ადგილი') 
                            : r.place === 3 
                              ? (lang === 'ru' ? '🥉 III место' : '🥉 III ადгили') 
                              : null;
                        return (
                          <div key={`${tItem.id}-${i}`} className="trn-history-item">
                            <div className="trn-place">
                              {r.place === 1 ? '🥇' : r.place === 2 ? '🥈' : r.place === 3 ? '🥉' : `#${r.place}`}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="trn-hist-cat" style={{ fontWeight: 600 }}>{r.category}</div>
                              <div className="trn-hist-event">{tItem.name} · {tItem.date}</div>
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
      <FloatingLangSwitcher lang={lang} setLang={setLang} />
    </div>
  )
}
