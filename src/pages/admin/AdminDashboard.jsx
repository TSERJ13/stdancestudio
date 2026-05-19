import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  isAdminLoggedIn, adminLogout, seedIfEmpty,
  getStudents, saveStudent, deleteStudent,
  getNews, saveNews, deleteNews,
  getTournaments, saveTournament, deleteTournament,
  getSubscription, saveSubscription,
  getAttendance,
  getTrainerRating, saveTrainerRating,
} from '../../data/db'
import './admin.css'

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.toString().split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
};

const SVG_ICONS = {
  news: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/></svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  tournaments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  )
};

const TABS = ['სიახლეები','სტუდენტები','ტურნირები']
const ICONS = ['news','students','tournaments']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [news, setNews] = useState([])
  const [students, setStudents] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [editingItem, setEditingItem] = useState(null) // { tab: 'news'|'student'|'tournament'|'results', id: 0|'id' }
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate('/admin'); return }
    seedIfEmpty()
    refresh()
  }, [])

  const refresh = () => {
    setNews(getNews())
    setTournaments(getTournaments())
    
    import('../../data/classcore').then(mod => {
      mod.fetchStudioData()
        .then(data => {
          const mapped = (data.students || []).map(s => {
            const fn = s.first_name || s.data?.first_name || '';
            const ln = s.last_name || s.data?.last_name || '';
            return {
              id: s.id,
              name: s.full_name || `${fn} ${ln}`.trim() || 'Student',
              phone: s.phone || s.data?.phone || '',
              birthYear: s.data?.birth_date ? new Date(s.data.birth_date).getFullYear() : 2010,
              classification: s.data?.dance_class || 'N კლასი',
              photo: s.data?.photo_url || '',
              language: s.language || s.data?.language || 'ka',
              active: s.status === 'active' || !s.status
            }
          });
          setStudents(mapped);
        })
        .catch(err => {
          console.error('Failed to load ClassCore students in admin:', err);
          setStudents(getStudents());
        });
    }).catch(() => {
      setStudents(getStudents());
    });
  }

  const handleSaveTournament = async (t) => {
    setSaving(true)
    saveTournament(t)
    try {
      const mod = await import('../../data/classcore')
      mod.clearCache()
      await mod.syncTournamentsToCloud(getTournaments())
    } catch (err) {
      console.error('Tournament sync error:', err)
      alert('ღრუბელთან სინქრონიზაცია ვერ მოხერხდა, თუმცა ლოკალურად შენახულია. / Ошибка синхронизации.')
    } finally {
      setSaving(false)
      setEditingItem(null)
      refresh()
    }
  }

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ წაშლა? / Вы уверены?')) return
    setSaving(true)
    deleteTournament(id)
    try {
      const mod = await import('../../data/classcore')
      mod.clearCache()
      await mod.syncTournamentsToCloud(getTournaments())
    } catch (err) {
      console.error('Tournament delete sync error:', err)
    } finally {
      setSaving(false)
      refresh()
    }
  }

  const handleSaveNews = async (n) => {
    setSaving(true)
    saveNews(n)
    try {
      const mod = await import('../../data/classcore')
      mod.clearCache()
      await mod.syncNewsToCloud(getNews())
    } catch (err) {
      console.error('News sync error:', err)
      alert('ღრუბელთან სინქრონიზაცია ვერ მოხერხდა, თუმცა ლოკალურად შენახულია.')
    } finally {
      setSaving(false)
      setEditingItem(null)
      refresh()
    }
  }

  const handleDeleteNews = async (id) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ წაშლა? / Вы уверены?')) return
    setSaving(true)
    deleteNews(id)
    try {
      const mod = await import('../../data/classcore')
      mod.clearCache()
      await mod.syncNewsToCloud(getNews())
    } catch (err) {
      console.error('News delete sync error:', err)
    } finally {
      setSaving(false)
      refresh()
    }
  }

  const logout = () => { adminLogout(); navigate('/admin') }

  return (
    <div className="admin-wrap admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.75rem 1rem', borderBottom: '1px solid rgba(212,166,74,0.12)', marginBottom: '1rem' }}>
          <img src="/images/logo-transparent.png" alt="ST Dance Studio" style={{ maxHeight: '55px', width: 'auto', display: 'block' }} />
          <div style={{ fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '0.9rem', letterSpacing: '0.12em', fontWeight: 'bold' }}>ST DANCE</span>
            <div style={{ height: '1px', background: 'var(--color-gold, #d4a64a)', width: '60%', margin: '2px 0' }}></div>
            <span style={{ color: '#fff', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'lowercase' }}>studio</span>
            <span style={{ color: '#6b665e', fontSize: '0.45rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.35rem' }}>ADMIN PANEL</span>
          </div>
        </div>
        <nav className="admin-nav">
          {TABS.map((t,i) => (
            <button key={i} className={`admin-nav__item${tab===i?' active':''}`} onClick={()=>{setTab(i); setEditingItem(null)}}>
              <span className="admin-nav__icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {SVG_ICONS[ICONS[i]]}
              </span>
              {t}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={logout} style={{width:'100%'}}>
            გასვლა ↗
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <span className="admin-topbar__title" style={{ display: 'inline-flex', alignItems: 'center' }}>
            {SVG_ICONS[ICONS[tab === 3 ? 2 : tab]]}
            <span style={{ marginLeft: '0.25rem' }}>{tab === 3 ? 'შედეგების მართვა' : TABS[tab]}</span>
          </span>
          <div className="admin-topbar__actions">
            {tab !== 3 && (
              <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: ['news', 'student', 'tournament'][tab], id: 0 })}>
                + დამატება
              </button>
            )}
          </div>
        </div>

        <div className="admin-page">
          {editingItem ? (
            <>
              {editingItem.tab === 'news' && (
                <NewsForm 
                  item={editingItem.id === 0 ? {} : news.find(n => n.id === editingItem.id)} 
                  onSave={n => { handleSaveNews(n); setEditingItem(null); }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
              {editingItem.tab === 'student' && (
                <StudentForm 
                  item={editingItem.id === 0 ? {} : students.find(s => s.id === editingItem.id)} 
                  onSave={s => { saveStudent(s); refresh(); setEditingItem(null); }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
              {editingItem.tab === 'tournament' && (
                <TournamentForm 
                  item={editingItem.id === 0 ? {} : tournaments.find(t => t.id === editingItem.id)} 
                  students={students} 
                  onSave={t => { handleSaveTournament(t); setEditingItem(null); }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
              {editingItem.tab === 'results' && (
                <ResultsForm 
                  item={tournaments.find(t => t.id === editingItem.id)} 
                  students={students} 
                  onSave={t => { handleSaveTournament(t); setEditingItem(null); }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
            </>
          ) : (
            <>
              {tab===0 && <NewsTab news={news} onEdit={id => setEditingItem({ tab: 'news', id })} onDelete={handleDeleteNews} />}
              {tab===1 && <StudentsTab students={students} onEdit={id => setEditingItem({ tab: 'student', id })} onDelete={id=>{deleteStudent(id);refresh()}} />}
              {tab===2 && <TournamentsTab tournaments={tournaments} students={students} onEdit={id => setEditingItem({ tab: 'tournament', id })} onManageResults={id => setEditingItem({ tab: 'results', id })} onDelete={handleDeleteTournament} />}
            </>
          )}
        </div>
      </div>
      {saving && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(212,166,74,0.1)',
            borderTop: '3px solid var(--color-gold, #d4a64a)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.05em' }}>
            ინახება ღრუბელში... / Сохранение в облаке...
          </span>
        </div>
      )}
    </div>
  )
}

/* ── News Tab ── */
function NewsTab({news,onEdit,onDelete}) {
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>onEdit(0)}>+ ახალი სიახლე</button>
      {news.length===0 && <p style={{color:'#6b665e',fontSize:'0.85rem'}}>სიახლეები არ არის</p>}
      {news.map(n=>(
        <div key={n.id} className={`admin-news-card${n.important?' important':''}`}>
          <div className="admin-news-card__head">
            <div>
              {n.important && <span className="badge badge--gold" style={{marginRight:'0.5rem'}}>მნიშვნელოვანი</span>}
              <span className="admin-news-card__title">{n.title}</span>
            </div>
            <span className="admin-news-card__meta">{formatDate(n.date)}</span>
          </div>
          <p className="admin-news-card__body">{n.body}</p>
          <div className="admin-news-card__actions">
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>onEdit(n.id)}>✏ რედაქტირება</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>onDelete(n.id)}>🗑 წაშლა</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function NewsForm({item,onSave,onCancel}) {
  const [form,setForm]=useState({title:item?.title||'',body:item?.body||'',date:item?.date||new Date().toISOString().slice(0,10),important:item?.important||false,...(item?.id?{id:item.id}:{})})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  return (
    <div className="admin-section">
      <div className="admin-section__head"><span className="admin-section__title">{form.id?'სიახლის რედაქტირება':'ახალი სიახლე'}</span></div>
      <div className="admin-section__body">
        <div className="admin-field"><label>სათაური</label><input value={form.title} onChange={e=>set('title',e.target.value)} /></div>
        <div className="admin-field"><label>ტექსტი</label><textarea value={form.body} onChange={e=>set('body',e.target.value)} rows={5}/></div>
        <div className="admin-field"><label>თარიღი</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
        <label className="admin-checkbox"><input type="checkbox" checked={form.important} onChange={e=>set('important',e.target.checked)} /> მნიშვნელოვანი შეტყობინება</label>
        <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem'}}>
          <button className="admin-btn admin-btn--gold" onClick={()=>onSave(form)}>შენახვა</button>
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>გაუქმება</button>
        </div>
      </div>
    </div>
  )
}

/* ── Students Tab ── */
function StudentsTab({students,onEdit,onDelete}) {
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>onEdit(0)}>+ ახალი სტუდენტი</button>
      <div className="admin-section">
        <table className="admin-table">
          <thead><tr>
            <th>სტუდენტი</th><th>ტელეფონი</th><th>კლასი</th><th>ამონ.</th><th>მზაობა</th><th>ენა</th><th></th>
          </tr></thead>
          <tbody>
            {students.map(s=>{
              const sub=getSubscription(s.id)
              const rat=getTrainerRating(s.id)
              const left=sub?sub.total-sub.used:0
              return (
                <tr key={s.id}>
                  <td>
                    <div className="admin-student-row">
                      <div className="admin-avatar">{s.photo?<img src={s.photo} alt=""/>:s.name[0]}</div>
                      <div><div className="admin-student-name">{s.name}</div><div className="admin-student-phone">{s.birthYear}</div></div>
                    </div>
                  </td>
                  <td style={{color:'#a8a39a',fontSize:'0.83rem'}}>{s.phone}</td>
                  <td><span className="badge badge--gold">{s.classification}</span></td>
                  <td>
                    {sub ? <span style={{color:left<=2?'#ff7070':'#50c878',fontWeight:700,fontSize:'0.9rem'}}>{left}/{sub.total}</span> : <span style={{color:'#6b665e'}}>—</span>}
                  </td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <span style={{color:rat.readiness>=7?'#50c878':rat.readiness>=4?'#d4a64a':'#ff7070',fontWeight:700}}>{rat.readiness}/10</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--muted" style={{textTransform:'uppercase'}}>{s.language || 'ka'}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>onEdit(s.id)}>✏</button>
                      <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>onDelete(s.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StudentForm({item,onSave,onCancel}) {
  const isNew=!item?.id
  const [form,setForm]=useState({
    id:item?.id||'',name:item?.name||'',phone:item?.phone||'',photo:item?.photo||'',
    birthYear:item?.birthYear||2010,gender:item?.gender||'female',
    classification:item?.classification||'N კლასი',
    language:item?.language||'ka',
    categories:item?.categories||[],joinDate:item?.joinDate||new Date().toISOString().slice(0,10),active:item?.active!==false
  })
  const [sub,setSub]=useState(item?.id?getSubscription(item.id)||{total:12,used:0,plan:'ჯგუფური'}:{total:12,used:0,plan:'ჯგუფური'})
  const [rat,setRat]=useState(item?.id?getTrainerRating(item.id)||{readiness:5,notes:''}:{readiness:5,notes:''})
  const [catInput,setCatInput]=useState('')
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const addCat=()=>{if(catInput.trim()){set('categories',[...form.categories,catInput.trim()]);setCatInput('')}}
  const remCat=(i)=>set('categories',form.categories.filter((_,j)=>j!==i))
  const handleSave=()=>{
    const sid=form.id||('stu_'+Math.random().toString(36).slice(2,8))
    onSave({...form,id:sid})
    if(item?.id||sid){saveSubscription(sid,sub);saveTrainerRating(sid,rat)}
  }
  const CLASSES=['N კლასი','B კლასი','A კლასი','S კლასი','M კლასი']
  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <span className="admin-section__title">{isNew?'ახალი სტუდენტი':'სტუდენტის რედაქტირება'}</span>
      </div>
      <div className="admin-section__body">
        <div className="admin-grid-2">
          <div className="admin-field"><label>სახელი და გვარი</label><input value={form.name} onChange={e=>set('name',e.target.value)} /></div>
          <div className="admin-field"><label>ტელეფონი (Login ID)</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="555123456" /></div>
          <div className="admin-field"><label>დაბადების წელი</label><input type="number" value={form.birthYear} onChange={e=>set('birthYear',+e.target.value)} /></div>
          <div className="admin-field"><label>სქესი</label>
            <select value={form.gender} onChange={e=>set('gender',e.target.value)}>
              <option value="female">გოგო</option><option value="male">ბიჭი</option>
            </select>
          </div>
          <div className="admin-field"><label>კლასიფიკაცია</label>
            <select value={form.classification} onChange={e=>set('classification',e.target.value)}>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-field"><label>სტუდიაში შემოსვლის თარიღი</label><input type="date" value={form.joinDate} onChange={e=>set('joinDate',e.target.value)} /></div>
          <div className="admin-field"><label>პორტალის ენა / Язык портала</label>
            <select value={form.language} onChange={e=>set('language',e.target.value)}>
              <option value="ka">ქართული (GE)</option>
              <option value="ru">Русский (RU)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>
        </div>
        <div className="admin-field"><label>ფოტოს URL</label><input value={form.photo} onChange={e=>set('photo',e.target.value)} placeholder="https://..." /></div>

        <div className="admin-field">
          <label>კატეგორიები</label>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <input value={catInput} onChange={e=>setCatInput(e.target.value)} placeholder="ლათინური — ჩა-ჩა" />
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addCat}>+</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
            {form.categories.map((c,i)=>(
              <span key={i} className="badge badge--muted" style={{cursor:'pointer'}} onClick={()=>remCat(i)}>{c} ×</span>
            ))}
          </div>
        </div>

        <hr style={{borderColor:'rgba(212,166,74,0.12)',margin:'1.5rem 0'}} />
        <p style={{fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#6b665e',marginBottom:'1rem'}}>💳 აბონიმენტი</p>
        <div className="admin-grid-2">
          <div className="admin-field"><label>გეგმა</label>
            <select value={sub.plan} onChange={e=>setSub(s=>({...s,plan:e.target.value}))}>
              <option>ჯგუფური</option><option>ინდივიდუალური</option>
            </select>
          </div>
          <div className="admin-field"><label>სულ გაკვეთილი</label><input type="number" value={sub.total} onChange={e=>setSub(s=>({...s,total:+e.target.value}))} /></div>
          <div className="admin-field"><label>გამოყენებული</label><input type="number" value={sub.used} onChange={e=>setSub(s=>({...s,used:+e.target.value}))} /></div>
          <div className="admin-field"><label>ვადა</label><input type="date" value={sub.expires||''} onChange={e=>setSub(s=>({...s,expires:e.target.value}))} /></div>
        </div>

        <hr style={{borderColor:'rgba(212,166,74,0.12)',margin:'1.5rem 0'}} />
        <p style={{fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#6b665e',marginBottom:'1rem'}}>⭐ ტრენერის შეფასება</p>
        <div className="admin-field">
          <label>ტურნირზე მზაობა — {rat.readiness}/10</label>
          <input type="range" min={0} max={10} value={rat.readiness} onChange={e=>setRat(r=>({...r,readiness:+e.target.value}))} style={{width:'100%',accentColor:'#d4a64a'}} />
          <div className="readiness-bar" style={{marginTop:'0.4rem'}}>
            <div className="readiness-bar__fill" style={{width:`${rat.readiness*10}%`,background:rat.readiness>=7?'#50c878':rat.readiness>=4?'#d4a64a':'#ff7070'}} />
          </div>
        </div>
        <div className="admin-field"><label>კომენტარი</label><textarea value={rat.notes} onChange={e=>setRat(r=>({...r,notes:e.target.value}))} rows={3} /></div>

        <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem'}}>
          <button className="admin-btn admin-btn--gold" onClick={handleSave}>შენახვა</button>
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>გაუქმება</button>
        </div>
      </div>
    </div>
  )
}

/* ── Tournaments Tab ── */
function TournamentsTab({tournaments,students,onEdit,onManageResults,onDelete}) {
  const today=new Date().toISOString().slice(0,10)
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>onEdit(0)}>+ ახალი ტურნირი</button>
      {tournaments.map(t=>(
        <div key={t.id} className="admin-trn-card">
          <div className="admin-trn-card__head">
            <div>
              <div className="admin-trn-card__name">{t.name}</div>
              <div className="admin-trn-card__date">
                📅 {t.endDate && t.endDate !== t.date ? `${formatDate(t.date)} — ${formatDate(t.endDate)}` : formatDate(t.date)}
              </div>
            </div>
            <span className={`badge ${t.date>=today?'badge--green':'badge--muted'}`}>{t.date>=today?'მომავალი':'დასრულებული'}</span>
          </div>
          <div className="admin-trn-card__info" style={{display:'flex',flexWrap:'wrap',gap:'1rem'}}>
            <span>🏛 {t.venue}</span>
            <span>📍 {t.address}</span>
            {t.fee ? <span>🎫 ბილეთის ფასი: {t.fee}{t.currency || '₾'}</span> : null}
            {t.assignedStudents && t.assignedStudents.length > 0 ? (
              <span style={{color: '#d4a64a'}}>👥 გაზიარებულია: {t.assignedStudents.length} სტუდენტთან</span>
            ) : (
              <span style={{color: '#50c878'}}>🌍 გაზიარებულია ყველასთან</span>
            )}
          </div>
          <div className="admin-trn-card__actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>onEdit(t.id)}>✏ რედაქტირება და განრიგი</button>
            <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={()=>onManageResults(t.id)}>🏆 შედეგები</button>
            <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>onDelete(t.id)}>🗑 წაშლა</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function TournamentForm({item,students,onSave,onCancel}) {
  const isNew=!item?.id
  const [form,setForm]=useState({
    id:item?.id||'',name:item?.name||'',date:item?.date||new Date().toISOString().slice(0,10),
    endDate:item?.endDate||'',
    venue:item?.venue||'',address:item?.address||'',mapUrl:item?.mapUrl||'',
    fee:item?.fee||0,currency:item?.currency||'₾',
    poster:item?.poster||'',
    assignedStudents:item?.assignedStudents||[],notes:item?.notes||'',
    assignedStudentsData:item?.assignedStudentsData||{},
    // Keep legacy keys during saves to prevent data loss
    studentCategories:item?.studentCategories||{},
    studentSchedules:item?.studentSchedules||{},
    results:item?.results||{}
  })
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  
  // Participant-specific inputs helper state
  const [activeStudentId, setActiveStudentId] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatTime, setNewCatTime] = useState('')
  const [newCatDate, setNewCatDate] = useState('')
  const [newCatReadyTime, setNewCatReadyTime] = useState('')
  const [newCatVenue, setNewCatVenue] = useState('')
  const [newCatFeeAmount, setNewCatFeeAmount] = useState('')
  const [newCatFeeCurrency, setNewCatFeeCurrency] = useState('₾')
  const [editingCat, setEditingCat] = useState(null)

  const handleEditCategoryStart = (sid, idx, cat) => {
    let amount = ''
    let currency = '₾'
    if (cat.fee) {
      amount = cat.fee.toString().replace(/[^\d.]/g, '')
      const cleanText = cat.fee.toString().toLowerCase()
      if (cleanText.includes('€')) currency = '€'
      else if (cleanText.includes('$')) currency = '$'
    }
    setEditingCat({
      studentId: sid,
      categoryIndex: idx,
      name: cat.name,
      date: cat.date || form.date,
      readyTime: cat.readyTime || '',
      time: cat.time || '',
      venue: cat.venue || '',
      feeAmount: amount,
      feeCurrency: currency
    })
  }

  const handleEditCategorySave = () => {
    if (!editingCat) return
    if (!editingCat.name.trim()) {
      alert('გთხოვთ შეიყვანოთ კატეგორიის სახელი')
      return
    }

    const sid = editingCat.studentId
    const idx = editingCat.categoryIndex
    const feeVal = editingCat.feeAmount ? `${editingCat.feeAmount} ${editingCat.feeCurrency}` : ''

    const updatedCategory = {
      name: editingCat.name.trim(),
      date: editingCat.date,
      readyTime: editingCat.readyTime.trim(),
      time: editingCat.time.trim(),
      venue: editingCat.venue.trim(),
      fee: feeVal
    }

    setForm(f => {
      const currentData = f.assignedStudentsData || {}
      const studentObj = currentData[sid] || { categories: [] }
      const currentCats = studentObj.categories || []
      
      const nextCats = [...currentCats]
      nextCats[idx] = updatedCategory

      return {
        ...f,
        assignedStudentsData: {
          ...currentData,
          [sid]: {
            ...studentObj,
            categories: nextCats
          }
        }
      }
    })

    setEditingCat(null)
  }

  const handleAddStudent = (sid) => {
    if (!sid) return
    const currentList = form.assignedStudents || []
    if (currentList.includes(sid)) return

    const currentData = form.assignedStudentsData || {}
    const defaultStudentData = {
      categories: []
    }

    setForm(f => ({
      ...f,
      assignedStudents: [...currentList, sid],
      assignedStudentsData: {
        ...currentData,
        [sid]: defaultStudentData
      }
    }))
  }

  const handleRemoveStudent = (sid) => {
    const currentList = form.assignedStudents || []
    const currentData = { ...form.assignedStudentsData }
    delete currentData[sid]

    setForm(f => ({
      ...f,
      assignedStudents: currentList.filter(id => id !== sid),
      assignedStudentsData: currentData
    }))
  }

  const handleAddCategoryToStudent = (sid) => {
    if (!newCatName.trim()) {
      alert('გთხოვთ შეიყვანოთ კატეგორიის სახელი / Пожалуйста, введите название категории');
      return
    }

    const dateVal = newCatDate || form.date
    const feeVal = newCatFeeAmount ? `${newCatFeeAmount} ${newCatFeeCurrency}` : ''

    const newCategoryItem = {
      name: newCatName.trim(),
      date: dateVal,
      readyTime: newCatReadyTime.trim(),
      time: newCatTime.trim(),
      venue: newCatVenue.trim(),
      fee: feeVal
    }

    setForm(f => {
      const currentData = f.assignedStudentsData || {}
      const studentObj = currentData[sid] || { categories: [] }
      const currentCats = studentObj.categories || []
      
      return {
        ...f,
        assignedStudentsData: {
          ...currentData,
          [sid]: {
            ...studentObj,
            categories: [...currentCats, newCategoryItem]
          }
        }
      }
    })
    
    // Clear inputs
    setNewCatName('')
    setNewCatReadyTime('')
    setNewCatTime('')
    setNewCatDate('')
    setNewCatVenue('')
    setNewCatFeeAmount('')
  }

  const handleRemoveCategoryFromStudent = (sid, idx) => {
    setForm(f => {
      const currentData = f.assignedStudentsData || {}
      const studentObj = currentData[sid] || { categories: [] }
      const currentCats = studentObj.categories || []
      
      return {
        ...f,
        assignedStudentsData: {
          ...currentData,
          [sid]: {
            ...studentObj,
            categories: currentCats.filter((_, i) => i !== idx)
          }
        }
      }
    })
  }

  const handleSave = () => {
    const tid = form.id || ('trn_' + Math.random().toString(36).slice(2,8))
    onSave({...form, id: tid})
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head"><span className="admin-section__title">{isNew?'ახალი ტურნირი':'ტურნირის რედაქტირება და განრიგი'}</span></div>
      <div className="admin-section__body">
        
        {/* Tournament General Details */}
        <div className="admin-field"><label>ტურნირის სახელი</label><input value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div className="admin-grid-2">
          <div className="admin-field"><label>დაწყების თარიღი</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
          <div className="admin-field"><label>დასრულების თარიღი (თუ 2 დღიანია)</label><input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} /></div>
          <div className="admin-field">
            <label>ბილეთის ფასი / Стоимость билета</label>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <input type="number" value={form.fee} onChange={e=>set('fee',+e.target.value)} style={{flex:1}} />
              <select value={form.currency||'₾'} onChange={e=>set('currency',e.target.value)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px',width:'100px'}}>
                <option value="₾">₾ (GEL)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
              </select>
            </div>
          </div>
          <div className="admin-field"><label>დარბაზი / ვენი</label><input value={form.venue} onChange={e=>set('venue',e.target.value)} /></div>
        </div>
        <div className="admin-grid-2">
          <div className="admin-field"><label>მისამართი</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
          <div className="admin-field"><label>Google Maps URL</label><input value={form.mapUrl} onChange={e=>set('mapUrl',e.target.value)} placeholder="https://maps.app.goo.gl/..." /></div>
        </div>
        <div className="admin-field">
          <label>ტურნირის პოსტერი / Афиша турнира (სურათის ლინკი ან ატვირთეთ ფაილი)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={form.poster} 
              onChange={e=>set('poster',e.target.value)} 
              placeholder="https://example.com/poster.jpg ან ატვირთეთ" 
              style={{ flex: 1 }} 
            />
            <button 
              type="button" 
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => document.getElementById('poster-file-input').click()}
              style={{ minWidth: '150px' }}
            >
              📷 ატვირთვა / Загрузить
            </button>
            <input 
              id="poster-file-input" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (uploadEvent) => {
                    set('poster', uploadEvent.target.result)
                  }
                  reader.readAsDataURL(file)
                }
              }} 
            />
          </div>
          {form.poster && (
            <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={form.poster} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px', border: '1px solid rgba(212,166,74,0.3)', display: 'block' }} />
              <button 
                type="button" 
                style={{ background: 'transparent', border: 'none', color: '#ff7070', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                onClick={() => set('poster', '')}
              >
                წაშლა / Удалить ✕
              </button>
            </div>
          )}
        </div>
        <div className="admin-field"><label>შენიშვნები (არ გამოჩნდება თუ ცარიელია)</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2} /></div>

        {/* Participant & Individual Schedule Section */}
        <hr style={{borderColor:'rgba(212,166,74,0.12)',margin:'2rem 0'}} />
        <p style={{fontSize:'0.82rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#d4a64a',marginBottom:'1.25rem',fontWeight:'bold'}}>👥 მონაწილეები და ინდივიდუალური განრიგი</p>
        
        {/* Dropdown to Add Kid */}
        <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
          <label>დაამატეთ ბავშვი ამ ტურნირზე</label>
          <select value="" onChange={e=>{ handleAddStudent(e.target.value); e.target.value = ''; }} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.3)',color:'#f5f1e8',padding:'0.6rem',borderRadius:'4px',width:'100%'}}>
            <option value="">აირჩიეთ მოსწავლე დასამატებლად...</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Assigned Kids List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          {(form.assignedStudents || []).length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(212,166,74,0.15)', borderRadius: '6px', color: '#6b665e', fontSize: '0.85rem' }}>
              ტურნირზე მოსწავლეები ჯერ არ არიან დამატებულები. გამოიყენეთ ზედა სელექტორი ბავშვის დასამატებლად.
            </div>
          ) : (
            form.assignedStudents.map(sid => {
              const st = students.find(s => s.id === sid)
              const stData = form.assignedStudentsData?.[sid] || { categories: [] }
              const isExpanded = activeStudentId === sid

              // Collect already used categories in this tournament for autocomplete
              const existingCategories = []
              if (form.assignedStudentsData) {
                Object.values(form.assignedStudentsData).forEach(stDataVal => {
                  ;(stDataVal.categories || []).forEach(catVal => {
                    if (catVal.name && !existingCategories.includes(catVal.name)) {
                      existingCategories.push(catVal.name)
                    }
                  })
                })
              }

              // Calculate total fee for this student in admin
              let totalStudentFeeText = '';
              if (stData.categories?.length > 0) {
                let sum = 0;
                let detectedCurrency = '';
                stData.categories.forEach(cat => {
                  if (cat.fee) {
                    const val = parseFloat(cat.fee.toString().replace(/[^\d.]/g, ''))
                    if (!isNaN(val)) {
                      sum += val;
                    }
                    const cleanText = cat.fee.toString().toLowerCase();
                    if (cleanText.includes('€')) detectedCurrency = '€';
                    else if (cleanText.includes('$')) detectedCurrency = '$';
                    else if (cleanText.includes('₾') || cleanText.includes('gel')) detectedCurrency = '₾';
                    else if (cleanText.includes('руб') || cleanText.includes('rub')) detectedCurrency = ' руб';
                  }
                });
                if (sum > 0) {
                  totalStudentFeeText = `💰 ${sum} ${detectedCurrency || '₾'}`;
                }
              }

              return (
                <div key={sid} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid ' + (isExpanded ? 'rgba(212,166,74,0.3)' : 'rgba(255,255,255,0.04)'), borderRadius: '6px', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: isExpanded ? 'rgba(212,166,74,0.04)' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }} onClick={() => setActiveStudentId(isExpanded ? '' : sid)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="admin-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{st?.photo ? <img src={st.photo} alt="" /> : st?.name?.[0]}</div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>{st?.name || 'სტუდენტი'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#a8a39a' }}>
                          {stData.categories?.length > 0 ? (
                            stData.categories.map(c => `${c.name} (${c.time || '—'})`).join(', ')
                          ) : (
                            'კატეგორიები არ არის დამატებული'
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      {totalStudentFeeText && <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 'bold' }}>{totalStudentFeeText}</span>}
                      <span className="badge badge--gold" style={{ fontSize: '0.75rem' }}>{stData.categories?.length || 0} კატეგორია</span>
                      <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={(e) => { e.stopPropagation(); handleRemoveStudent(sid); }} style={{ padding: '0.35rem 0.55rem' }}>🗑</button>
                    </div>
                  </div>

                  {/* Expanded Body: Categories list & Simple inputs */}
                  {isExpanded && (
                    <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      {/* List of assigned categories */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#a8a39a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.2rem' }}>დამატებული კატეგორიები:</span>
                        {(stData.categories || []).length === 0 ? (
                          <div style={{ fontSize: '0.8rem', color: '#6b665e', fontStyle: 'italic', paddingLeft: '0.25rem' }}>კატეგორიები ჯერ არ არის დამატებული.</div>
                        ) : (
                          stData.categories.map((cat, idx) => {
                            const isEditing = editingCat && editingCat.studentId === sid && editingCat.categoryIndex === idx
                            
                            if (isEditing) {
                              return (
                                <div key={idx} style={{ background: 'rgba(212,166,74,0.03)', padding: '0.85rem 1.1rem', borderRadius: '6px', border: '1px solid rgba(212,166,74,0.3)', display: 'flex', flexDirection: 'column', gap: '0.65rem', margin: '0.2rem 0' }}>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span>✏️ კატეგორიის რედაქტირება</span>
                                  </div>
                                  
                                  {/* Name Input */}
                                  <div className="admin-field" style={{ marginBottom: 0, width: '100%' }}>
                                    <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>კატეგორიის სახელი</label>
                                    <input 
                                      value={editingCat.name} 
                                      onChange={e => setEditingCat({...editingCat, name: e.target.value})} 
                                      placeholder="შეიყვანეთ სახელი..." 
                                      style={{ padding: '0.45rem', fontSize: '0.83rem', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#fff' }} 
                                    />
                                  </div>
                                  
                                  {/* Grid fields */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem', alignItems: 'end' }}>
                                    <div className="admin-field" style={{ marginBottom: 0 }}>
                                      <label style={{ fontSize: '0.65rem', color: '#a8a39a', display: 'block', marginBottom: '0.15rem' }}>თარიღი</label>
                                      <select 
                                        value={editingCat.date} 
                                        onChange={e => setEditingCat({...editingCat, date: e.target.value})} 
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.42rem', borderRadius: '2px', fontSize: '0.78rem', width: '100%' }}
                                      >
                                        <option value={form.date}>{form.date}</option>
                                        {form.endDate && form.endDate !== form.date && <option value={form.endDate}>{form.endDate}</option>}
                                      </select>
                                    </div>
                                    
                                    <div className="admin-field" style={{ marginBottom: 0 }}>
                                      <label style={{ fontSize: '0.65rem', color: '#a8a39a', display: 'block', marginBottom: '0.15rem' }}>🎒 მზადყოფნა</label>
                                      <input 
                                        value={editingCat.readyTime} 
                                        onChange={e => setEditingCat({...editingCat, readyTime: e.target.value})} 
                                        placeholder="09:15" 
                                        style={{ padding: '0.42rem', fontSize: '0.78rem', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#fff' }} 
                                      />
                                    </div>
                                    
                                    <div className="admin-field" style={{ marginBottom: 0 }}>
                                      <label style={{ fontSize: '0.65rem', color: '#a8a39a', display: 'block', marginBottom: '0.15rem' }}>🕒 დაწყება</label>
                                      <input 
                                        value={editingCat.time} 
                                        onChange={e => setEditingCat({...editingCat, time: e.target.value})} 
                                        placeholder="10:00" 
                                        style={{ padding: '0.42rem', fontSize: '0.78rem', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#fff' }} 
                                      />
                                    </div>
                                    
                                    <div className="admin-field" style={{ marginBottom: 0 }}>
                                      <label style={{ fontSize: '0.65rem', color: '#a8a39a', display: 'block', marginBottom: '0.15rem' }}>🏛 დარბაზი</label>
                                      <input 
                                        value={editingCat.venue} 
                                        onChange={e => setEditingCat({...editingCat, venue: e.target.value})} 
                                        placeholder="დარბაზი" 
                                        style={{ padding: '0.42rem', fontSize: '0.78rem', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#fff' }} 
                                      />
                                    </div>
                                    
                                    <div className="admin-field" style={{ marginBottom: 0 }}>
                                      <label style={{ fontSize: '0.65rem', color: '#a8a39a', display: 'block', marginBottom: '0.15rem' }}>💰 საფასური</label>
                                      <div style={{ display: 'flex', gap: '0.15rem' }}>
                                        <input 
                                          type="number" 
                                          value={editingCat.feeAmount} 
                                          onChange={e => setEditingCat({...editingCat, feeAmount: e.target.value})} 
                                          placeholder="30" 
                                          style={{ padding: '0.42rem', fontSize: '0.78rem', flex: 1, minWidth: '40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#fff' }} 
                                        />
                                        <select 
                                          value={editingCat.feeCurrency} 
                                          onChange={e => setEditingCat({...editingCat, feeCurrency: e.target.value})} 
                                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.42rem', borderRadius: '2px', fontSize: '0.78rem', width: '50px' }}
                                        >
                                          <option value="₾">₾</option>
                                          <option value="$">$</option>
                                          <option value="€">€</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Actions */}
                                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.4rem' }}>
                                    <button 
                                      type="button" 
                                      onClick={() => setEditingCat(null)} 
                                      className="admin-btn admin-btn--ghost admin-btn--sm"
                                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                                    >
                                      გაუქმება / Отмена
                                    </button>
                                    <button 
                                      type="button" 
                                      onClick={handleEditCategorySave} 
                                      className="admin-btn admin-btn--gold admin-btn--sm"
                                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                                    >
                                      შენახვა / Сохранить
                                    </button>
                                  </div>
                                </div>
                              )
                            }

                            return (
                              <div 
                                key={idx} 
                                onClick={() => handleEditCategoryStart(sid, idx, cat)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.65rem 0.95rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.25s ease' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(212,166,74,0.04)'
                                  e.currentTarget.style.borderColor = 'rgba(212,166,74,0.2)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                                }}
                                title="დააწკაპუნეთ ჩასასწორებლად / Нажмите для редактирования"
                              >
                                <div>
                                  <span style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600 }}>{cat.name}</span>
                                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#a8a39a', marginTop: '0.15rem' }}>
                                    {cat.date && <span>📅 {formatDate(cat.date)}</span>}
                                    {cat.readyTime && <span style={{ color: 'var(--color-gold)' }}>🎒 მზადყოფნა: {cat.readyTime}</span>}
                                    {cat.time && <span style={{ color: '#d4a64a' }}>🕒 დაწყება: {cat.time}</span>}
                                    {cat.venue && <span>🏛 {cat.venue}</span>}
                                    {cat.fee && <span style={{ color: '#50c878' }}>💰 {cat.fee}</span>}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.7rem', color: 'rgba(212,166,74,0.7)', marginRight: '0.2rem', userSelect: 'none', background: 'rgba(212,166,74,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(212,166,74,0.15)', pointerEvents: 'none' }}>
                                    ✏️ ჩასწორება
                                  </span>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveCategoryFromStudent(sid, idx); }} 
                                    style={{ background: 'none', border: 'none', color: '#ff7070', fontSize: '1.25rem', cursor: 'pointer', padding: '0 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title="წაშლა"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>

                      {/* Extremely simplified category adding form */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(212,166,74,0.1)', borderRadius: '4px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>+ კატეგორიის დამატება</span>
                        
                        {/* Row 1: Full-width Category input */}
                        <div className="admin-field" style={{ marginBottom: 0, width: '100%' }}>
                          <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>კატეგორიის სახელი</label>
                          <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="შეიყვანეთ კატეგორიის სახელი (მაგ. ლათინური N კლასი)..." style={{ padding: '0.5rem', fontSize: '0.83rem', width: '100%' }} />
                          {existingCategories.length > 0 && (
                            <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', color: '#a8a39a', userSelect: 'none' }}>⚡ სწრაფი არჩევა:</span>
                              {existingCategories.map((cName, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  onClick={() => {
                                    setNewCatName(cName)
                                    // Search for this category to auto-fill times, venue, and fee
                                    let found = null
                                    Object.values(form.assignedStudentsData || {}).forEach(stDataVal => {
                                      const match = (stDataVal.categories || []).find(c => c.name === cName)
                                      if (match) found = match
                                    })
                                    if (found) {
                                      if (found.readyTime) setNewCatReadyTime(found.readyTime)
                                      if (found.time) setNewCatTime(found.time)
                                      if (found.date) setNewCatDate(found.date)
                                      if (found.venue) setNewCatVenue(found.venue)
                                      if (found.fee) {
                                        const amt = found.fee.toString().replace(/[^\d.]/g, '')
                                        setNewCatFeeAmount(amt)
                                        const cleanText = found.fee.toString().toLowerCase()
                                        if (cleanText.includes('€')) setNewCatFeeCurrency('€')
                                        else if (cleanText.includes('$')) setNewCatFeeCurrency('$')
                                        else setNewCatFeeCurrency('₾')
                                      }
                                    }
                                  }}
                                  style={{
                                    background: 'rgba(212,166,74,0.08)',
                                    border: '1px solid rgba(212,166,74,0.25)',
                                    color: 'var(--color-gold)',
                                    fontSize: '0.7rem',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '500'
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(212,166,74,0.18)'
                                    e.currentTarget.style.borderColor = 'rgba(212,166,74,0.4)'
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(212,166,74,0.08)'
                                    e.currentTarget.style.borderColor = 'rgba(212,166,74,0.25)'
                                  }}
                                >
                                  {cName}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Row 2: Smaller details aligned below */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', alignItems: 'end' }}>
                          <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>თარიღი</label>
                            <select value={newCatDate || form.date} onChange={e => setNewCatDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.45rem', borderRadius: '2px', fontSize: '0.78rem', width: '100%' }}>
                              <option value={form.date}>{form.date}</option>
                              {form.endDate && form.endDate !== form.date && <option value={form.endDate}>{form.endDate}</option>}
                            </select>
                          </div>

                          <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>🎒 მზადყოფნა</label>
                            <input value={newCatReadyTime} onChange={e => setNewCatReadyTime(e.target.value)} placeholder="09:15" style={{ padding: '0.45rem', fontSize: '0.78rem' }} />
                          </div>

                          <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>🕒 დაწყება</label>
                            <input value={newCatTime} onChange={e => setNewCatTime(e.target.value)} placeholder="10:00" style={{ padding: '0.45rem', fontSize: '0.78rem' }} />
                          </div>

                          <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>🏛 დარბაზი / ვენი</label>
                            <input value={newCatVenue} onChange={e => setNewCatVenue(e.target.value)} placeholder="დარბაზი A" style={{ padding: '0.45rem', fontSize: '0.78rem' }} />
                          </div>

                          <div className="admin-field" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.7rem', color: '#a8a39a', marginBottom: '0.15rem', display: 'block' }}>💰 გადასახადი</label>
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                              <input type="number" value={newCatFeeAmount} onChange={e => setNewCatFeeAmount(e.target.value)} placeholder={form.fee ? `${form.fee}` : '25'} style={{ padding: '0.45rem', fontSize: '0.78rem', flex: 1, minWidth: '40px' }} />
                              <select value={newCatFeeCurrency} onChange={e => setNewCatFeeCurrency(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.45rem', borderRadius: '2px', fontSize: '0.78rem', width: '50px' }}>
                                <option value="₾">₾</option>
                                <option value="$">$</option>
                                <option value="€">€</option>
                              </select>
                            </div>
                          </div>

                          <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => handleAddCategoryToStudent(sid)} style={{ padding: '0.48rem 1rem', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+ დამატება</button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem'}}>
          <button type="button" className="admin-btn admin-btn--gold" onClick={handleSave}>ტურნირის შენახვა</button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>გაუქმება</button>
        </div>
      </div>
    </div>
  )
}

/* ── Results Management Form (Separate Page) ── */
function ResultsForm({item,students,onSave,onCancel}) {
  const [form,setForm]=useState({
    ...item,
    results:item?.results||{}
  })
  
  const [resStudent,setResStudent]=useState('')
  const [resForm,setResForm]=useState({category:'',place:'',total:'',notes:''})

  const addResult=()=>{
    if(!resStudent||!resForm.category) return
    const r=form.results||{}
    const arr=r[resStudent]||[]
    
    const updated = {
      ...form,
      results: {
        ...r,
        [resStudent]: [...arr, {
          category: resForm.category.trim(),
          place: +resForm.place || 1,
          total: +resForm.total || 1,
          notes: resForm.notes.trim()
        }]
      }
    }
    
    setForm(updated)
    setResForm({category:'',place:'',total:'',notes:''})
  }

  const removeResult=(sid, idx)=>{
    const r=form.results||{}
    const arr=r[sid]||[]
    const updatedArr=arr.filter((_,i)=>i!==idx)
    
    const updated = {
      ...form,
      results: {
        ...r,
        [sid]: updatedArr
      }
    }
    
    setForm(updated)
  }

  const handleSave=()=>{
    onSave(form)
  }

  // Get only the assigned students for result selection dropdown
  const assignedKids = students.filter(s => (form.assignedStudents || []).includes(s.id))
  const selectStudentsList = assignedKids.length > 0 ? assignedKids : students // fallback to all if none assigned

  return (
    <div className="admin-section">
      <div className="admin-section__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="admin-section__title">🏆 შედეგების მართვა: {form.name}</span>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onCancel}>← უკან</button>
      </div>
      <div className="admin-section__body">
        
        {/* Add Result Box */}
        <p style={{fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#6b665e',marginBottom:'1rem'}}>ახალი შედეგის დამატება</p>
        <div style={{background:'rgba(255,255,255,0.01)',border:'1px solid rgba(212,166,74,0.15)',borderRadius:'6px',padding:'1.25rem',marginBottom:'2rem'}}>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
            <div className="admin-field" style={{flex:1.5,minWidth:'180px',marginBottom:0}}>
              <label>სტუდენტი</label>
              <select value={resStudent} onChange={e=>setResStudent(e.target.value)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px'}}>
                <option value="">აირჩიეთ სტუდენტი...</option>
                {selectStudentsList.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="admin-field" style={{flex:2,minWidth:'200px',marginBottom:0}}>
              <label>კატეგორია</label>
              <input value={resForm.category} onChange={e=>setResForm(r=>({...r,category:e.target.value}))} placeholder="მაგ. ლათინური N კლასი" style={{padding:'0.5rem'}} />
            </div>

            <div className="admin-field" style={{width:'80px',marginBottom:0}}>
              <label>ადგილი</label>
              <input type="number" min={1} value={resForm.place} onChange={e=>setResForm(r=>({...r,place:e.target.value}))} placeholder="1" style={{padding:'0.5rem'}} />
            </div>

            <div className="admin-field" style={{width:'80px',marginBottom:0}}>
              <label>სულ</label>
              <input type="number" min={1} value={resForm.total} onChange={e=>setResForm(r=>({...r,total:e.target.value}))} placeholder="12" style={{padding:'0.5rem'}} />
            </div>
          </div>
          <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={addResult} disabled={!resStudent || !resForm.category}>+ შედეგის დამატება</button>
        </div>

        {/* Existing Results List */}
        <p style={{fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#6b665e',marginBottom:'1rem'}}>ტურნირის შედეგების სია</p>
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {Object.entries(form.results||{}).filter(([_,res])=>res.length>0).length === 0 ? (
            <div style={{padding:'2rem',textAlign:'center',background:'rgba(255,255,255,0.01)',border:'1px dashed rgba(255,255,255,0.05)',borderRadius:'4px',color:'#6b665e',fontSize:'0.82rem'}}>
              შედეგები ჯერ არ არის დამატებული.
            </div>
          ) : (
            Object.entries(form.results||{}).map(([sid,res])=>{
              const st=students.find(s=>s.id===sid)
              return res.map((r,i)=>(
                <div key={`${sid}-${i}`} style={{display:'flex',justifyContent: 'space-between',alignItems:'center',padding:'0.65rem 1rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)',borderRadius:'4px',fontSize:'0.85rem'}}>
                  <div>
                    <span style={{color:'#fff',fontWeight:600,marginRight:'0.75rem'}}>👤 {st?.name || sid}</span>
                    <span style={{color:'#a8a39a',marginRight:'0.75rem'}}>{r.category}</span>
                    <span style={{color:'var(--color-gold)',fontWeight:700}}>🏆 #{r.place}/{r.total}</span>
                  </div>
                  <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>removeResult(sid,i)} style={{padding:'0.2rem 0.5rem'}}>🗑</button>
                </div>
              ))
            })
          )}
        </div>

        <div style={{display:'flex',gap:'0.75rem',marginTop:'2rem'}}>
          <button type="button" className="admin-btn admin-btn--gold" onClick={handleSave}>შედეგების შენახვა</button>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>გაუქმება</button>
        </div>
      </div>
    </div>
  )
}
