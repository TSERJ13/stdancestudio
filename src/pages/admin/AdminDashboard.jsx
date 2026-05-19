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

  const handleSaveTournament = (t) => {
    saveTournament(t)
    refresh()
    import('../../data/classcore').then(mod => {
      mod.syncTournamentsToCloud(getTournaments())
    })
  }

  const handleDeleteTournament = (id) => {
    deleteTournament(id)
    refresh()
    import('../../data/classcore').then(mod => {
      mod.syncTournamentsToCloud(getTournaments())
    })
  }

  const handleSaveNews = (n) => {
    saveNews(n)
    refresh()
    import('../../data/classcore').then(mod => {
      mod.syncNewsToCloud(getNews())
    })
  }

  const handleDeleteNews = (id) => {
    deleteNews(id)
    refresh()
    import('../../data/classcore').then(mod => {
      mod.syncNewsToCloud(getNews())
    })
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
            <span className="admin-news-card__meta">{n.date}</span>
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
                📅 {t.endDate && t.endDate !== t.date ? `${t.date} — ${t.endDate}` : t.date}
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

  const handleAddStudent = (sid) => {
    if (!sid) return
    const currentList = form.assignedStudents || []
    if (currentList.includes(sid)) return

    const currentData = form.assignedStudentsData || {}
    const defaultStudentData = {
      readyTime: '',
      fee: form.fee ? `${form.fee} ${form.currency}` : '',
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

  const handleUpdateStudentField = (sid, field, val) => {
    const currentData = form.assignedStudentsData || {}
    const studentObj = currentData[sid] || { readyTime: '', fee: '', categories: [] }

    setForm(f => ({
      ...f,
      assignedStudentsData: {
        ...currentData,
        [sid]: {
          ...studentObj,
          [field]: val
        }
      }
    }))
  }

  const handleAddCategoryToStudent = (sid) => {
    if (!newCatName.trim()) return
    const currentData = form.assignedStudentsData || {}
    const studentObj = currentData[sid] || { readyTime: '', fee: '', categories: [] }
    const currentCats = studentObj.categories || []

    const dateVal = newCatDate || form.date

    const updatedStudentObj = {
      ...studentObj,
      categories: [...currentCats, { name: newCatName.trim(), date: dateVal, time: newCatTime.trim() }]
    }

    setForm(f => ({
      ...f,
      assignedStudentsData: {
        ...currentData,
        [sid]: updatedStudentObj
      }
    }))
    
    // Clear inputs
    setNewCatName('')
    setNewCatTime('')
    setNewCatDate('')
  }

  const handleRemoveCategoryFromStudent = (sid, idx) => {
    const currentData = form.assignedStudentsData || {}
    const studentObj = currentData[sid] || { readyTime: '', fee: '', categories: [] }
    const currentCats = studentObj.categories || []

    const updatedStudentObj = {
      ...studentObj,
      categories: currentCats.filter((_, i) => i !== idx)
    }

    setForm(f => ({
      ...f,
      assignedStudentsData: {
        ...currentData,
        [sid]: updatedStudentObj
      }
    }))
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
              const stData = form.assignedStudentsData?.[sid] || { readyTime: '', fee: '', categories: [] }
              const isExpanded = activeStudentId === sid
              return (
                <div key={sid} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid ' + (isExpanded ? 'rgba(212,166,74,0.3)' : 'rgba(255,255,255,0.04)'), borderRadius: '6px', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                  {/* Card Header (Click to expand categories management) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: isExpanded ? 'rgba(212,166,74,0.04)' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }} onClick={() => setActiveStudentId(isExpanded ? '' : sid)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div className="admin-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>{st?.photo ? <img src={st.photo} alt="" /> : st?.name?.[0]}</div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>{st?.name || 'სტუდენტი'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#a8a39a' }}>
                          {stData.readyTime ? `🎒 მზადყოფნა: ${stData.readyTime}` : '🎒 მზადყოფნა: მიუთითეთ'} · {stData.fee ? `💰 გადასახადი: ${stData.fee}` : '💰 გადასახადი: მიუთითეთ'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className="badge badge--gold" style={{ fontSize: '0.75rem' }}>{stData.categories?.length || 0} კატეგორია</span>
                      <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={(e) => { e.stopPropagation(); handleRemoveStudent(sid); }} style={{ padding: '0.35rem 0.55rem' }}>🗑</button>
                    </div>
                  </div>

                  {/* Expanded Body: Inputs for details and categories list */}
                  {isExpanded && (
                    <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Details row */}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div className="admin-field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                          <label style={{ fontSize: '0.78rem' }}>მზადყოფნის დრო (მაგ. 09:15)</label>
                          <input value={stData.readyTime} onChange={e => handleUpdateStudentField(sid, 'readyTime', e.target.value)} placeholder="09:15" style={{ padding: '0.45rem' }} />
                        </div>
                        {(() => {
                          const feeStr = stData.fee || '';
                          const matchAmount = feeStr.match(/^[\d.]+/);
                          const amountVal = matchAmount ? matchAmount[0] : '';
                          const currencyVal = feeStr.includes('€') ? '€' : feeStr.includes('$') ? '$' : '₾';
                          return (
                            <div className="admin-field" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                              <label style={{ fontSize: '0.78rem' }}>მონაწილეობის გადასახადი</label>
                              <div style={{ display: 'flex', gap: '0.35rem' }}>
                                <input 
                                  type="number" 
                                  value={amountVal} 
                                  onChange={e => {
                                    const newAmount = e.target.value;
                                    handleUpdateStudentField(sid, 'fee', newAmount ? `${newAmount} ${currencyVal}` : '');
                                  }} 
                                  placeholder={form.fee ? `${form.fee}` : '50'} 
                                  style={{ padding: '0.45rem', flex: 1 }} 
                                />
                                <select 
                                  value={currencyVal} 
                                  onChange={e => {
                                    const newCurrency = e.target.value;
                                    handleUpdateStudentField(sid, 'fee', amountVal ? `${amountVal} ${newCurrency}` : '');
                                  }} 
                                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.45rem', borderRadius: '2px', width: '80px' }}
                                >
                                  <option value="₾">₾ (GEL)</option>
                                  <option value="$">$ (USD)</option>
                                  <option value="€">€ (EUR)</option>
                                </select>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Categories section */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px', padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>კატეგორიები და დაწყების დრო</span>
                        
                        {/* List of assigned categories */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.85rem' }}>
                          {(stData.categories || []).length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: '#6b665e', fontStyle: 'italic' }}>კატეგორიები ჯერ არ არის დამატებული.</div>
                          ) : (
                            stData.categories.map((cat, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.45rem 0.75rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <span style={{ fontSize: '0.85rem', color: '#fff' }}>
                                  <strong>{cat.name}</strong> 
                                  {cat.date && <span style={{ color: '#a8a39a', marginLeft: '0.5rem', fontSize: '0.8rem' }}>📅 {cat.date}</span>}
                                  {cat.time && <span style={{ color: 'var(--color-gold)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>🕒 {cat.time}</span>}
                                </span>
                                <button type="button" onClick={() => handleRemoveCategoryFromStudent(sid, idx)} style={{ background: 'none', border: 'none', color: '#ff7070', fontSize: '1rem', cursor: 'pointer', padding: '0 0.25rem' }}>×</button>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add category box */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                          <div className="admin-field" style={{ flex: 2, minWidth: '150px', marginBottom: 0 }}>
                            <label style={{ fontSize: '0.72rem', color: '#a8a39a', marginBottom: '0.2rem', display: 'block' }}>კატეგორია</label>
                            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="ლათინური N კლასი" style={{ padding: '0.45rem', fontSize: '0.8rem' }} />
                          </div>
                          
                          <div className="admin-field" style={{ flex: 1.2, minWidth: '120px', marginBottom: 0 }}>
                            <label style={{ fontSize: '0.72rem', color: '#a8a39a', marginBottom: '0.2rem', display: 'block' }}>თარიღი</label>
                            <select value={newCatDate || form.date} onChange={e => setNewCatDate(e.target.value)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,166,74,0.2)', color: '#f5f1e8', padding: '0.45rem', borderRadius: '2px', fontSize: '0.8rem', width: '100%' }}>
                              <option value={form.date}>{form.date}</option>
                              {form.endDate && form.endDate !== form.date && <option value={form.endDate}>{form.endDate}</option>}
                            </select>
                          </div>

                          <div className="admin-field" style={{ flex: 1, minWidth: '100px', marginBottom: 0 }}>
                            <label style={{ fontSize: '0.72rem', color: '#a8a39a', marginBottom: '0.2rem', display: 'block' }}>დრო</label>
                            <input value={newCatTime} onChange={e => setNewCatTime(e.target.value)} placeholder="10:00" style={{ padding: '0.45rem', fontSize: '0.8rem' }} />
                          </div>
                          
                          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => handleAddCategoryToStudent(sid)} style={{ padding: '0.5rem 0.85rem' }}>დამატება</button>
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
