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

const TABS = ['სიახლეები','სტუდენტები','ტურნირები']
const ICONS = ['📰','👥','🏆']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [news, setNews] = useState([])
  const [students, setStudents] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate('/admin'); return }
    seedIfEmpty()
    refresh()
  }, [])

  const refresh = () => {
    setNews(getNews())
    setStudents(getStudents())
    setTournaments(getTournaments())
  }

  const logout = () => { adminLogout(); navigate('/admin') }

  return (
    <div className="admin-wrap admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">ST</span>
          <span className="admin-sidebar__label">Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((t,i) => (
            <button key={i} className={`admin-nav__item${tab===i?' active':''}`} onClick={()=>setTab(i)}>
              <span className="admin-nav__icon">{ICONS[i]}</span>{t}
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
          <span className="admin-topbar__title">{ICONS[tab]} {TABS[tab]}</span>
          <div className="admin-topbar__actions">
            <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={()=>setModal({type:['news','student','tournament'][tab]})}>
              + დამატება
            </button>
          </div>
        </div>

        <div className="admin-page">
          {tab===0 && <NewsTab news={news} onSave={n=>{saveNews(n);refresh()}} onDelete={id=>{deleteNews(id);refresh()}} />}
          {tab===1 && <StudentsTab students={students} onSave={s=>{saveStudent(s);refresh()}} onDelete={id=>{deleteStudent(id);refresh()}} />}
          {tab===2 && <TournamentsTab tournaments={tournaments} students={students} onSave={t=>{saveTournament(t);refresh()}} onDelete={id=>{deleteTournament(id);refresh()}} />}
        </div>
      </div>

      {modal && <Modal modal={modal} onClose={()=>setModal(null)} onSave={item=>{
        if(modal.type==='news'){saveNews(item)}
        else if(modal.type==='student'){saveStudent(item)}
        else{saveTournament(item)}
        refresh(); setModal(null)
      }} />}
    </div>
  )
}

/* ── News Tab ── */
function NewsTab({news,onSave,onDelete}) {
  const [editing,setEditing]=useState(null)
  if(editing!==null) return <NewsForm item={editing===0?{}:news.find(n=>n.id===editing)} onSave={n=>{onSave(n);setEditing(null)}} onCancel={()=>setEditing(null)} />
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>setEditing(0)}>+ ახალი სიახლე</button>
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
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>setEditing(n.id)}>✏ რედაქტირება</button>
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
function StudentsTab({students,onSave,onDelete}) {
  const [editing,setEditing]=useState(null)
  if(editing!==null) return <StudentForm item={editing===0?{}:students.find(s=>s.id===editing)} onSave={s=>{onSave(s);setEditing(null)}} onCancel={()=>setEditing(null)} />
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>setEditing(0)}>+ ახალი სტუდენტი</button>
      <div className="admin-section">
        <table className="admin-table">
          <thead><tr>
            <th>სტუდენტი</th><th>ტელეფონი</th><th>კლასი</th><th>ამონ.</th><th>მზაობა</th><th></th>
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
                    <div className="row-actions">
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>setEditing(s.id)}>✏</button>
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
        </div>
        <div className="admin-field"><label>ფოტოს URL</label><input value={form.photo} onChange={e=>set('photo',e.target.value)} placeholder="https://..." /></div>

        <div className="admin-field">
          <label>კატეგორიები</label>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <input value={catInput} onChange={e=>setCatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="ლათინური — ჩა-ჩა" />
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
function TournamentsTab({tournaments,students,onSave,onDelete}) {
  const [editing,setEditing]=useState(null)
  if(editing!==null) return <TournamentForm item={editing===0?{}:tournaments.find(t=>t.id===editing)} students={students} onSave={t=>{onSave(t);setEditing(null)}} onCancel={()=>setEditing(null)} />
  const today=new Date().toISOString().slice(0,10)
  return (
    <div>
      <button className="admin-btn admin-btn--gold admin-btn--sm" style={{marginBottom:'1.5rem'}} onClick={()=>setEditing(0)}>+ ახალი ტურნირი</button>
      {tournaments.map(t=>(
        <div key={t.id} className="admin-trn-card">
          <div className="admin-trn-card__head">
            <div>
              <div className="admin-trn-card__name">{t.name}</div>
              <div className="admin-trn-card__date">📅 {t.date}</div>
            </div>
            <span className={`badge ${t.date>=today?'badge--green':'badge--muted'}`}>{t.date>=today?'მომავალი':'დასრულებული'}</span>
          </div>
          <div className="admin-trn-card__info">
            <span>🏛 {t.venue}</span>
            <span>📍 {t.address}</span>
            {t.fee && <span>💰 {t.fee}₾</span>}
          </div>
          <div className="admin-trn-card__cats">{(t.categories||[]).map((c,i)=><span key={i} className="badge badge--muted">{c}</span>)}</div>
          <div className="admin-trn-card__actions">
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>setEditing(t.id)}>✏ რედაქტირება</button>
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
    venue:item?.venue||'',address:item?.address||'',mapUrl:item?.mapUrl||'',
    categories:item?.categories||[],fee:item?.fee||0,notes:item?.notes||'',
    studentCategories:item?.studentCategories||{},results:item?.results||{}
  })
  const [catInput,setCatInput]=useState('')
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const addCat=()=>{if(catInput.trim()){set('categories',[...form.categories,catInput.trim()]);setCatInput('')}}
  const remCat=(i)=>set('categories',form.categories.filter((_,j)=>j!==i))
  const [resStudent,setResStudent]=useState('')
  const [resForm,setResForm]=useState({category:'',place:'',total:'',notes:''})
  const addResult=()=>{
    if(!resStudent||!resForm.category) return
    const r=form.results||{}
    const arr=r[resStudent]||[]
    set('results',{...r,[resStudent]:[...arr,{...resForm,place:+resForm.place,total:+resForm.total}]})
    setResForm({category:'',place:'',total:'',notes:''})
  }
  return (
    <div className="admin-section">
      <div className="admin-section__head"><span className="admin-section__title">{isNew?'ახალი ტურნირი':'ტურნირის რედაქტირება'}</span></div>
      <div className="admin-section__body">
        <div className="admin-field"><label>ტურნირის სახელი</label><input value={form.name} onChange={e=>set('name',e.target.value)} /></div>
        <div className="admin-grid-2">
          <div className="admin-field"><label>თარიღი</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>
          <div className="admin-field"><label>საფასური (₾)</label><input type="number" value={form.fee} onChange={e=>set('fee',+e.target.value)} /></div>
          <div className="admin-field"><label>დარბაზი / ვენი</label><input value={form.venue} onChange={e=>set('venue',e.target.value)} /></div>
          <div className="admin-field"><label>მისამართი</label><input value={form.address} onChange={e=>set('address',e.target.value)} /></div>
        </div>
        <div className="admin-field"><label>Google Maps URL</label><input value={form.mapUrl} onChange={e=>set('mapUrl',e.target.value)} placeholder="https://maps.app.goo.gl/..." /></div>
        <div className="admin-field"><label>შენიშვნები</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={3} /></div>
        <div className="admin-field">
          <label>კატეგორიები</label>
          <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
            <input value={catInput} onChange={e=>setCatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="ლათინური B კლასი — ჩა-ჩა" />
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addCat}>+</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem'}}>
            {form.categories.map((c,i)=><span key={i} className="badge badge--muted" style={{cursor:'pointer'}} onClick={()=>remCat(i)}>{c} ×</span>)}
          </div>
        </div>

        <hr style={{borderColor:'rgba(212,166,74,0.12)',margin:'1.5rem 0'}} />
        <p style={{fontSize:'0.75rem',letterSpacing:'0.2em',textTransform:'uppercase',color:'#6b665e',marginBottom:'1rem'}}>🏅 რეზულტატები</p>
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.75rem'}}>
          <select value={resStudent} onChange={e=>setResStudent(e.target.value)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px',flex:1}}>
            <option value="">სტუდენტი</option>
            {students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input value={resForm.category} onChange={e=>setResForm(r=>({...r,category:e.target.value}))} placeholder="კატეგორია" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px',flex:2}} />
          <input type="number" value={resForm.place} onChange={e=>setResForm(r=>({...r,place:e.target.value}))} placeholder="ადგილი" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px',width:'80px'}} />
          <input type="number" value={resForm.total} onChange={e=>setResForm(r=>({...r,total:e.target.value}))} placeholder="სულ" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.2)',color:'#f5f1e8',padding:'0.5rem',borderRadius:'2px',width:'80px'}} />
          <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addResult}>+ დამატება</button>
        </div>
        {Object.entries(form.results||{}).map(([sid,res])=>{
          const st=students.find(s=>s.id===sid)
          return res.map((r,i)=>(
            <div key={`${sid}-${i}`} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.5rem 0.75rem',background:'rgba(255,255,255,0.03)',borderRadius:'2px',marginBottom:'0.4rem',fontSize:'0.82rem'}}>
              <span style={{color:'#d4a64a'}}>{st?.name}</span>
              <span style={{color:'#a8a39a'}}>{r.category}</span>
              <span style={{color:'#50c878',fontWeight:700}}>#{r.place}/{r.total}</span>
            </div>
          ))
        })}

        <div style={{display:'flex',gap:'0.75rem',marginTop:'1.5rem'}}>
          <button className="admin-btn admin-btn--gold" onClick={()=>onSave(form)}>შენახვა</button>
          <button className="admin-btn admin-btn--ghost" onClick={onCancel}>გაუქმება</button>
        </div>
      </div>
    </div>
  )
}

function Modal({modal,onClose,onSave}) { return null }
