import React, { useState, useEffect } from 'react'
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
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
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
  ),
  reg: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><circle cx="9" cy="9" r="1"/></svg>
  ),
  forms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  ),
  polls: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.6rem' }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  )
};

const TABS = ['სიახლეები','სტუდენტები','ტურნირები','რეგისტრაციები','ფორმები','გამოკითხვები']
const ICONS = ['news','students','tournaments','reg','forms','polls']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [news, setNews] = useState([])
  const [students, setStudents] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [customForms, setCustomForms] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)
  const [activeFormForSubmissions, setActiveFormForSubmissions] = useState(null)
  const [formSubmissions, setFormSubmissions] = useState([])
  const [loadingRegs, setLoadingRegs] = useState(false)
  const [loadingForms, setLoadingForms] = useState(false)
  const [editingItem, setEditingItem] = useState(null) // { tab: 'news'|'student'|'tournament'|'results', id: 0|'id' }
  const [saving, setSaving] = useState(false)

  // Custom premium modal dialogs
  const [dialog, setDialog] = useState(null) // { message, type: 'alert'|'confirm', onConfirm, onCancel }

  const showAlert = (message, onOk = () => {}) => {
    setDialog({
      message,
      type: 'alert',
      onConfirm: () => {
        setDialog(null);
        onOk();
      }
    });
  };

  const showConfirm = (message, onYes = () => {}, onNo = () => {}) => {
    setDialog({
      message,
      type: 'confirm',
      onConfirm: () => {
        setDialog(null);
        onYes();
      },
      onCancel: () => {
        setDialog(null);
        onNo();
      }
    });
  };

  const [smsModal, setSmsModal] = useState({ isOpen: false, toPhone: '', recipientName: '', text: '' });
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [smsSuccess, setSmsSuccess] = useState(false);

  const handleOpenSmsModal = (phone, name) => {
    setSmsModal({
      isOpen: true,
      toPhone: phone,
      recipientName: name,
      text: ''
    });
    setSmsError('');
    setSmsSuccess(false);
  };

  const handleSendSmsSubmit = async () => {
    if (!smsModal.text) return;
    setSendingSms(true);
    setSmsError('');
    setSmsSuccess(false);
    try {
      const mod = await import('../../data/classcore');
      const res = await mod.sendSms(smsModal.toPhone, smsModal.text);
      if (res && (res.success || res.messageId || res.status === 'success' || res.status === 'sent' || res.status === 200 || !res.error)) {
        setSmsSuccess(true);
        setTimeout(() => {
          setSmsModal({ isOpen: false, toPhone: '', recipientName: '', text: '' });
          setSmsSuccess(false);
        }, 1500);
      } else {
        setSmsError('სმს-ის გაგზავნა ვერ მოხერხდა. შეამოწმეთ ნომერი ან ბალანსი.');
      }
    } catch (err) {
      console.error(err);
      setSmsError('სმს-ის გაგზავნა ვერ მოხერხდა. კავშირის შეცდომა.');
    } finally {
      setSendingSms(false);
    }
  };

  const handleDeleteRegistration = async (id) => {
    showConfirm('დარწმუნებული ხართ, რომ გსურთ რეგისტრაციის წაშლა?', async () => {
      setSaving(true);
      try {
        const mod = await import('../../data/classcore');
        await mod.deleteRegistration(id);
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
        refresh();
      }
    });
  };

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
          const localStudents = getStudents();
          const mapped = (data.students || []).map(s => {
            const fn = s.first_name || s.data?.first_name || '';
            const ln = s.last_name || s.data?.last_name || '';
            const cloudStudent = {
              id: s.id,
              name: s.full_name || `${fn} ${ln}`.trim() || 'Student',
              phone: s.phone || s.data?.phone || '',
              birthYear: s.data?.birth_date ? new Date(s.data.birth_date).getFullYear() : 2010,
              classification: s.data?.dance_class || 'N კლასი',
              photo: s.data?.photo_url || '',
              language: s.language || s.data?.language || 'ka',
              active: s.status === 'active' || !s.status
            }
            
            const localS = localStudents.find(x => x.id === s.id)
            if (localS) {
              return {
                ...cloudStudent,
                phone: localS.phone || cloudStudent.phone,
                birthYear: localS.birthYear || cloudStudent.birthYear,
                classification: localS.classification || cloudStudent.classification,
                photo: localS.photo || cloudStudent.photo,
                language: localS.language || cloudStudent.language,
                active: localS.active !== undefined ? localS.active : cloudStudent.active
              }
            }
            return cloudStudent
          });
          setStudents(mapped);
          if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
            // Backup current tournaments before overwriting, just in case!
            const currentLocal = localStorage.getItem('std_tournaments');
            if (currentLocal && currentLocal !== '[]') {
              localStorage.setItem('std_tournaments_backup', currentLocal);
            }
            localStorage.setItem('std_tournaments', JSON.stringify(data.tournaments));
            setTournaments(data.tournaments);
          } else {
            // If cloud has no tournaments, do NOT blindly overwrite with empty array!
            // Load whatever is in localStorage
            const localTrns = getTournaments();
            if (localTrns && localTrns.length > 0) {
              setTournaments(localTrns);
            }
          }

          if (Array.isArray(data.news) && data.news.length > 0) {
            const currentLocalNews = localStorage.getItem('std_news');
            if (currentLocalNews && currentLocalNews !== '[]') {
              localStorage.setItem('std_news_backup', currentLocalNews);
            }
            localStorage.setItem('std_news', JSON.stringify(data.news));
            setNews(data.news);
          } else {
            const localNews = getNews();
            if (localNews && localNews.length > 0) {
              setNews(localNews);
            }
          }
        })
        .catch(err => {
          console.error('Failed to load ClassCore students in admin:', err);
          setStudents(getStudents());
        });

      setLoadingRegs(true);
      mod.fetchRegistrations()
        .then(regs => {
          setRegistrations(regs);
          setLoadingRegs(false);
        })
        .catch(() => setLoadingRegs(false));

      setLoadingForms(true);
      mod.fetchCustomForms()
        .then(forms => {
          setCustomForms(forms);
          setLoadingForms(false);
        })
        .catch(() => setLoadingForms(false));
    }).catch((err) => {
      console.error('Failed to import classcore:', err);
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
      showAlert('ღრუბელთან სინქრონიზაცია ვერ მოხერხდა, თუმცა ლოკალურად შენახულია. / Ошибка синхронизации.')
    } finally {
      setSaving(false)
      setEditingItem(null)
      refresh()
    }
  }

  const handleDeleteTournament = async (id) => {
    showConfirm('დარწმუნებული ხართ, რომ გსურთ წაშლა? / Вы уверены?', async () => {
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
    })
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
      showAlert('ღრუბელთან სინქრონიზაცია ვერ მოხერხდა, თუმცა ლოკალურად შენახულია.')
    } finally {
      setSaving(false)
      setEditingItem(null)
      refresh()
    }
  }

  const handleDeleteNews = async (id) => {
    showConfirm('დარწმუნებული ხართ, რომ გსურთ წაშლა? / Вы уверены?', async () => {
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
    })
  }

  const logout = () => { adminLogout(); navigate('/admin') }

  return (
    <div className="admin-wrap admin-shell">
      <aside className={`admin-sidebar${isSidebarOpen ? ' open' : ''}${isSidebarCollapsed ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
        {/* Floating Sidebar collapse handle sitting exactly on the vertical divider line in the middle vertically */}
        <button 
          type="button"
          className="sidebar-toggle-handle" 
          onClick={() => setIsSidebarCollapsed(c => !c)}
          title={isSidebarCollapsed ? 'მენიუს გაშლა' : 'მენიუს დაკეცვა'}
        >
          {isSidebarCollapsed ? '▶' : '◀'}
        </button>

        <div className="admin-sidebar__brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: isSidebarCollapsed ? '1.25rem 0.5rem' : '1.75rem 1rem', borderBottom: '1px solid rgba(212,166,74,0.12)', marginBottom: '1rem' }}>
          <img src="/images/logo-transparent.png" alt="ST Dance Studio" style={{ maxHeight: isSidebarCollapsed ? '32px' : '55px', width: 'auto', display: 'block', transition: 'all 0.3s' }} />
          {!isSidebarCollapsed && (
            <div style={{ fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '0.9rem', letterSpacing: '0.12em', fontWeight: 'bold' }}>ST DANCE</span>
              <div style={{ height: '1px', background: 'var(--color-gold, #d4a64a)', width: '60%', margin: '2px 0' }}></div>
              <span style={{ color: '#fff', fontSize: '0.6rem', letterSpacing: '0.3em', textTransform: 'lowercase' }}>studio</span>
              <span style={{ color: '#6b665e', fontSize: '0.45rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.35rem' }}>ADMIN PANEL</span>
            </div>
          )}
        </div>
        <nav className="admin-nav">
          {TABS.map((t,i) => (
            <button key={i} className={`admin-nav__item${tab===i?' active':''}`} onClick={()=>{setTab(i); setEditingItem(null); if(window.innerWidth<=768) setIsSidebarOpen(false);}} title={isSidebarCollapsed ? t : ''}>
              <span className="admin-nav__icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                {SVG_ICONS[ICONS[i]]}
              </span>
              {!isSidebarCollapsed && t}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer" style={{ borderTop: isSidebarCollapsed ? 'none' : '1px solid rgba(212,166,74,0.12)', padding: isSidebarCollapsed ? '0.5rem 0' : '1rem 1.25rem' }}>
          {!isSidebarCollapsed ? (
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={logout} style={{width:'100%'}}>
              გასვლა ↗
            </button>
          ) : (
            <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={logout} style={{width:'100%', padding: '0.5rem 0', fontSize: '0.8rem'}} title="გასვლა">
              ↗
            </button>
          )}
        </div>
      </aside>
      {isSidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <div className="admin-content">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="admin-btn admin-btn--ghost admin-btn--sm mobile-only-toggle" 
              onClick={() => setIsSidebarOpen(o => !o)}
              style={{ padding: '6px 10px', fontSize: '16px' }}
            >
              ☰
            </button>
            <span className="admin-topbar__title" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {editingItem && editingItem.tab === 'results' ? (
                <>
                  {SVG_ICONS['tournaments']}
                  <span style={{ marginLeft: '0.25rem' }}>შედეგების მართვა</span>
                </>
              ) : (
                <>
                  {SVG_ICONS[ICONS[tab]]}
                  <span style={{ marginLeft: '0.25rem' }}>{TABS[tab]}</span>
                </>
              )}
            </span>
          </div>
          <div className="admin-topbar__actions">
            {!editingItem && (
              <>
                {tab === 0 && (
                  <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: 'news', id: 0 })}>
                    + ახალი სიახლე
                  </button>
                )}
                {tab === 1 && (
                  <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: 'student', id: 0 })}>
                    + ახალი სტუდენტი
                  </button>
                )}
                {tab === 2 && (
                  <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: 'tournament', id: 0 })}>
                    + ახალი ტურნირი
                  </button>
                )}
                {tab === 4 && (
                  <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: 'customForm', id: 0, defaultType: 'form' })}>
                    + ახალი ფორმა
                  </button>
                )}
                {tab === 5 && (
                  <button className="admin-btn admin-btn--gold admin-btn--sm" onClick={() => setEditingItem({ tab: 'customForm', id: 0, defaultType: 'poll' })}>
                    + ახალი გამოკითხვა
                  </button>
                )}
              </>
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
                  onSave={async (s) => { 
                    saveStudent(s); 
                    try {
                      const mod = await import('../../data/classcore')
                      await mod.syncStudentToCloud(s)
                      mod.clearCache()
                    } catch (err) {
                      console.error('Student cloud sync error:', err)
                    }
                    refresh(); 
                    setEditingItem(null); 
                  }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
              {editingItem.tab === 'tournament' && (
                <TournamentForm 
                  item={editingItem.id === 0 ? {} : tournaments.find(t => t.id === editingItem.id)} 
                  students={students} 
                  showAlert={showAlert}
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
              {editingItem.tab === 'customForm' && (
                <CustomFormForm 
                  item={editingItem.id === 0 ? {} : customForms.find(f => f.id === editingItem.id)} 
                  defaultType={editingItem.defaultType}
                  showAlert={showAlert}
                  onSave={async (f) => {
                    setSaving(true)
                    try {
                      const mod = await import('../../data/classcore')
                      await mod.saveCustomForm(f)
                    } catch (err) {
                      console.error('Error saving custom form:', err)
                    } finally {
                      setSaving(false)
                      setEditingItem(null)
                      refresh()
                    }
                  }} 
                  onCancel={() => setEditingItem(null)} 
                />
              )}
            </>
          ) : (
            <>
              {tab===0 && <NewsTab news={news} onEdit={id => setEditingItem({ tab: 'news', id })} onDelete={handleDeleteNews} />}
              {tab===1 && <StudentsTab students={students} onEdit={id => setEditingItem({ tab: 'student', id })} onDelete={id=>{deleteStudent(id);refresh()}} onSendSms={handleOpenSmsModal} />}
              {tab===2 && <TournamentsTab tournaments={tournaments} students={students} onEdit={id => setEditingItem({ tab: 'tournament', id })} onManageResults={id => setEditingItem({ tab: 'results', id })} onDelete={handleDeleteTournament} />}
              {tab===3 && (
                <RegistrationsTab 
                  registrations={registrations} 
                  loading={loadingRegs}
                  onStatusUpdate={async (id, status) => {
                    setSaving(true)
                    try {
                      const mod = await import('../../data/classcore')
                      await mod.updateRegistrationStatus(id, status)
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setSaving(false)
                      refresh()
                    }
                  }}
                  onDeleteRegistration={handleDeleteRegistration}
                  onSendSms={handleOpenSmsModal}
                />
              )}
              {tab===4 && (
                <CustomFormsTab 
                  forms={customForms.filter(f => f.type === 'form' || !f.type)} 
                  loading={loadingForms}
                  tabType="form"
                  onEdit={id => setEditingItem({ tab: 'customForm', id, defaultType: 'form' })}
                  onDelete={async (id) => {
                    showConfirm('დარწმუნებული ხართ, რომ გსურთ წაშლა?', async () => {
                      setSaving(true)
                      try {
                        const mod = await import('../../data/classcore')
                        await mod.deleteCustomForm(id)
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setSaving(false)
                        refresh()
                      }
                    })
                  }}
                  onViewSubmissions={async (slug) => {
                    setSaving(true)
                    try {
                      const mod = await import('../../data/classcore')
                      const list = await mod.fetchFormSubmissions(slug)
                      setFormSubmissions(list)
                      setActiveFormForSubmissions(customForms.find(f => f.slug === slug))
                      setShowSubmissionsModal(true)
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setSaving(false)
                    }
                  }}
                />
              )}
              {tab===5 && (
                <CustomFormsTab 
                  forms={customForms.filter(f => f.type === 'poll')} 
                  loading={loadingForms}
                  tabType="poll"
                  onEdit={id => setEditingItem({ tab: 'customForm', id, defaultType: 'poll' })}
                  onDelete={async (id) => {
                    showConfirm('დარწმუნებული ხართ, რომ გსურთ წაშლა?', async () => {
                      setSaving(true)
                      try {
                        const mod = await import('../../data/classcore')
                        await mod.deleteCustomForm(id)
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setSaving(false)
                        refresh()
                      }
                    })
                  }}
                  onViewSubmissions={async (slug) => {
                    setSaving(true)
                    try {
                      const mod = await import('../../data/classcore')
                      const list = await mod.fetchFormSubmissions(slug)
                      setFormSubmissions(list)
                      setActiveFormForSubmissions(customForms.find(f => f.slug === slug))
                      setShowSubmissionsModal(true)
                    } catch (err) {
                      console.error(err)
                    } finally {
                      setSaving(false)
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Submissions Modal */}
      {showSubmissionsModal && activeFormForSubmissions && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px' }}>
            <div className="admin-modal__head">
              <span className="admin-modal__title">{activeFormForSubmissions.title} — პასუხები</span>
              <button className="admin-modal__close" onClick={() => setShowSubmissionsModal(false)}>×</button>
            </div>
            <div className="admin-modal__body">
              {formSubmissions.length === 0 ? (
                <p style={{ color: '#6b665e', textAlign: 'center', padding: '30px 0' }}>პასუხები ჯერ არ ფიქსირდება</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--gold)' }}>თარიღი</th>
                        {activeFormForSubmissions.type === 'poll' ? (
                          <th>არჩეული ვარიანტი</th>
                        ) : (
                          Array.isArray(activeFormForSubmissions.fields) && activeFormForSubmissions.fields.map((f, idx) => (
                            <th key={idx}>{f.label}</th>
                          ))
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formSubmissions.map((sub, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                            {new Date(sub.created_at).toLocaleString('ka-GE', { hour12: false })}
                          </td>
                          {activeFormForSubmissions.type === 'poll' ? (
                            <td style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{sub.answers?.selectedOption || ''}</td>
                          ) : (
                            Array.isArray(activeFormForSubmissions.fields) && activeFormForSubmissions.fields.map((f, fIdx) => (
                              <td key={fIdx}>{sub.answers?.[f.name || f.label] || '-'}</td>
                            ))
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
       {smsModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#151413',
            border: '1px solid rgba(212, 166, 74, 0.3)',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-title)', color: '#fff', fontSize: '20px', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              💬 SMS-ის გაგზავნა
            </h3>
            <p style={{ color: '#a8a39a', fontSize: '13.5px', marginBottom: '20px' }}>
              ადრესატი: <strong style={{ color: 'var(--gold)' }}>{smsModal.recipientName}</strong> ({smsModal.toPhone})
            </p>
            
            {smsError && (
              <div style={{ background: 'rgba(220,53,69,0.1)', border: '1px solid #dc3545', color: '#ff6b7b', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
                {smsError}
              </div>
            )}
            {smsSuccess && (
              <div style={{ background: 'rgba(80,200,120,0.1)', border: '1px solid #50c878', color: '#50c878', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '13px' }}>
                სმს წარმატებით გაიგზავნა!
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#a8a39a', fontSize: '13px', marginBottom: '6px' }}>ტექსტი (GoSMS):</label>
              <textarea
                value={smsModal.text}
                onChange={e => setSmsModal({ ...smsModal, text: e.target.value })}
                rows={5}
                placeholder="ჩაწერეთ სმს-ის ტექსტი..."
                style={{ width: '100%', padding: '12px', background: '#0a0908', border: '1px solid rgba(212,166,74,0.15)', borderRadius: '4px', color: '#fff', fontSize: '14.5px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setSmsModal({ isOpen: false, toPhone: '', recipientName: '', text: '' });
                  setSmsError('');
                  setSmsSuccess(false);
                }}
                className="admin-btn admin-btn--ghost"
                style={{ padding: '8px 16px' }}
              >
                დახურვა
              </button>
              <button 
                onClick={handleSendSmsSubmit}
                disabled={sendingSms || !smsModal.text}
                className="admin-btn admin-btn--gold"
                style={{ padding: '8px 20px' }}
              >
                {sendingSms ? 'იგზავნება...' : 'გაგზავნა'}
              </button>
            </div>
          </div>
        </div>
      )}
      {dialog && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: '#151413',
            border: '1px solid rgba(212, 166, 74, 0.3)',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
              {dialog.type === 'confirm' ? '❓' : 'ℹ️'}
            </div>
            <p style={{ color: '#fff', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '25px', whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
              {dialog.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {dialog.type === 'confirm' ? (
                <>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn--gold" 
                    onClick={dialog.onConfirm}
                    style={{ width: 'auto', padding: '10px 24px', minWidth: '110px' }}
                  >
                    კი / Да
                  </button>
                  <button 
                    type="button" 
                    className="admin-btn admin-btn--ghost" 
                    onClick={dialog.onCancel}
                    style={{ width: 'auto', padding: '10px 24px', minWidth: '110px' }}
                  >
                    გაუქმება
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="admin-btn admin-btn--gold" 
                  onClick={dialog.onConfirm}
                  style={{ width: 'auto', padding: '10px 30px', minWidth: '120px' }}
                >
                  კარგი / OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
function StudentsTab({students,onEdit,onDelete,onSendSms}) {
  const [search, setSearch] = useState('');

  const sortedAndFiltered = [...students]
    .filter(s => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) || 
        (s.phone && s.phone.includes(q)) ||
        (s.birthYear && s.birthYear.toString().includes(q))
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'ka'));

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px', minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="🔍 მოძებნეთ მოსწავლე სახელით, ნომრით ან წლით..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '10px 14px 10px 38px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(212,166,74,0.2)', 
              borderRadius: '4px', 
              color: '#fff', 
              fontSize: '0.9rem', 
              outline: 'none',
              transition: 'all 0.3s'
            }} 
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#ff7070', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="admin-section">
        {sortedAndFiltered.length === 0 ? (
          <p style={{ color: '#6b665e', padding: '20px', textAlign: 'center' }}>მოსწავლეები ვერ მოიძებნა</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>სტუდენტი</th><th>ტელეფონი</th><th>კლასი</th><th>ამონ.</th><th>მზაობა</th><th>ენა</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFiltered.map(s=>{
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
                        <button className="admin-btn admin-btn--ghost admin-btn--sm" style={{ padding: '4px 8px', marginRight: '4px' }} onClick={() => onSendSms(s.phone, s.name)}>💬 სმს</button>
                        <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={()=>onEdit(s.id)}>✏</button>
                        <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={()=>onDelete(s.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
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

function TournamentForm({item,students,showAlert,onSave,onCancel}) {
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
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

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
      showAlert('გთხოვთ შეიყვანოთ კატეგორიის სახელი')
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
      showAlert('გთხოვთ შეიყვანოთ კატეგორიის სახელი / Пожалуйста, введите название категории');
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
    let finalForm = { ...form }
    
    // Auto-commit pending category if user forgot to click "+ დამატება" but entered details
    if (activeStudentId && newCatName.trim()) {
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

      const currentData = finalForm.assignedStudentsData || {}
      const studentObj = currentData[activeStudentId] || { categories: [] }
      const currentCats = studentObj.categories || []

      finalForm = {
        ...finalForm,
        assignedStudentsData: {
          ...currentData,
          [activeStudentId]: {
            ...studentObj,
            categories: [...currentCats, newCategoryItem]
          }
        }
      }
    }

    const tid = finalForm.id || ('trn_' + Math.random().toString(36).slice(2,8))
    onSave({...finalForm, id: tid})
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head"><span className="admin-section__title">{isNew?'ახალი ტურნირი':'ტურნირის რედაქტირება და განრიგი'}</span></div>
      <div className="admin-section__body">
        
        {/* Tournament General Details */}
        {/* Tournament General Details */}
        <div className="admin-grid-2" style={{ marginBottom: '1.25rem' }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>ტურნირის სახელი</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>ტურნირის პოსტერი (ლინკი ან ატვირთეთ ფაილი)</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                value={form.poster} 
                onChange={e=>set('poster',e.target.value)} 
                placeholder="სურათის ლინკი ან ატვირთეთ..." 
                style={{ flex: 1 }} 
              />
              <button 
                type="button" 
                className="admin-btn admin-btn--gold"
                onClick={() => document.getElementById('poster-file-input').click()}
                style={{ width: 'auto', minWidth: '110px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', height: '42px' }}
              >
                📷 ატვირთვა
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
              {form.poster && (
                <button 
                  type="button" 
                  className="admin-btn admin-btn--danger"
                  style={{ width: '42px', height: '42px', minWidth: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => set('poster', '')}
                  title="წაშლა"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {form.poster && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: 'calc(50% + 0.75rem)' }}>
            <img src={form.poster} alt="Preview" style={{ maxHeight: '80px', borderRadius: '4px', border: '1px solid rgba(212,166,74,0.3)', display: 'block' }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>პოსტერის წინასწარი ხედი / Preview</span>
          </div>
        )}

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
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="🔍 მოძებნეთ მოსწავლე სახელით..." 
              value={studentSearchQuery} 
              onChange={e => setStudentSearchQuery(e.target.value)} 
              style={{ 
                flex: 1,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212,166,74,0.15)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.85rem'
              }} 
            />
            {studentSearchQuery && (
              <button 
                type="button" 
                className="admin-btn admin-btn--ghost" 
                onClick={() => setStudentSearchQuery('')}
                style={{ width: 'auto', padding: '0 1rem', marginBottom: 0 }}
              >
                გასუფთავება
              </button>
            )}
          </div>
          <select 
            value="" 
            onChange={e=>{ handleAddStudent(e.target.value); e.target.value = ''; setStudentSearchQuery(''); }} 
            style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(212,166,74,0.3)',color:'#f5f1e8',padding:'0.6rem',borderRadius:'4px',width:'100%'}}
          >
            <option value="">
              {studentSearchQuery 
                ? `ნაპოვნია მოსწავლეები (${students.filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase())).length})` 
                : 'აირჩიეთ მოსწავლე დასამატებლად...'}
            </option>
            {students
              .filter(s => s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name, 'ka'))
              .map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
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

/* ── Registrations Tab ── */
function RegistrationsTab({ registrations, loading, onStatusUpdate, onDeleteRegistration, onSendSms }) {
  const [filter, setFilter] = React.useState('all');

  if (loading) {
    return <div style={{ color: 'var(--gold)', padding: '20px 0' }}>რეგისტრაციები იტვირთება...</div>;
  }

  const filteredRegs = registrations.filter(reg => {
    if (filter === 'all') return true;
    if (filter === 'moderation') return reg.status === 'pending' || !reg.status;
    if (filter === 'approved') return reg.status === 'approved';
    if (filter === 'rejected') return reg.status === 'rejected';
    return true;
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>ონლაინ რეგისტრაციები — ST Dance Studio</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
            h1 { text-align: center; color: #111; margin-bottom: 5px; }
            p.subtitle { text-align: center; font-size: 14px; color: #666; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f7f7f7; font-weight: bold; }
            tr:nth-child(even) { background-color: #fafafa; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .badge-pending { background: #fff3cd; color: #856404; }
            .badge-approved { background: #d4edda; color: #155724; }
            .badge-rejected { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <h1>ST Dance Studio</h1>
          <p class="subtitle">ონლაინ რეგისტრაციის განაცხადების სია — ბეჭდვის თარიღი: ${new Date().toLocaleDateString('ka-GE')}</p>
          <table>
            <thead>
              <tr>
                <th>ბავშვის სახელი</th>
                <th>დაბადების თარიღი</th>
                <th>ცვლა</th>
                <th>მშობლის სახელი</th>
                <th>მშობლის ტელეფონი</th>
                <th>თარიღი</th>
                <th>სტატუსი</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRegs.map(reg => `
                <tr>
                  <td><strong>${reg.student_name}</strong></td>
                  <td>${formatDate(reg.birth_date)}</td>
                  <td>${reg.shift}</td>
                  <td>${reg.parent_name}</td>
                  <td>${reg.parent_phone}</td>
                  <td>${new Date(reg.created_at).toLocaleString('ka-GE')}</td>
                  <td>
                    <span class="badge badge-${reg.status === 'approved' ? 'approved' : reg.status === 'rejected' ? 'rejected' : 'pending'}">
                      ${reg.status === 'approved' ? 'დადასტურებული' : reg.status === 'rejected' ? 'უარყოფილი' : 'მოდერაცია'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="admin-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'ყველა' },
            { id: 'moderation', label: 'მოდერაცია' },
            { id: 'approved', label: 'დადასტურებული' },
            { id: 'rejected', label: 'უარყოფილი' }
          ].map(tabOpt => (
            <button
              key={tabOpt.id}
              onClick={() => setFilter(tabOpt.id)}
              className="admin-btn admin-btn--sm"
              style={{
                background: filter === tabOpt.id ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                border: filter === tabOpt.id ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                color: filter === tabOpt.id ? '#000' : '#fff',
                fontWeight: filter === tabOpt.id ? '600' : '400',
                padding: '6px 14px',
                borderRadius: '4px'
              }}
            >
              {tabOpt.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handlePrint}
          className="admin-btn admin-btn--gold admin-btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
        >
          🖨 ამობეჭდვა
        </button>
      </div>

      <div className="admin-section__head">
        <span className="admin-section__title">ონლაინ რეგისტრაციის განაცხადები ({filteredRegs.length})</span>
      </div>
      
      {filteredRegs.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(26,24,22,0.6)', border: '1px dashed rgba(212,166,74,0.15)', borderRadius: '4px', color: '#6b665e' }}>
          ამ კატეგორიაში განაცხადები ჯერ არ ფიქსირდება.
        </div>
      ) : (
        <div className="admin-section__body" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ბავშვის სახელი</th>
                <th>დაბადების თარიღი</th>
                <th>ცვლა</th>
                <th>მშობლის სახელი</th>
                <th>მშობლის ტელეფონი</th>
                <th>თარიღი</th>
                <th>სტატუსი</th>
                <th style={{ textAlign: 'right' }}>მოქმედება</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegs.map(reg => (
                <tr key={reg.id}>
                  <td style={{ fontWeight: '600', color: '#fff' }}>{reg.student_name}</td>
                  <td>{formatDate(reg.birth_date)}</td>
                  <td>
                    <span className="badge badge--muted">{reg.shift}</span>
                  </td>
                  <td>{reg.parent_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a href={`tel:${reg.parent_phone}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
                        📞 {reg.parent_phone}
                      </a>
                      <button 
                        onClick={() => onSendSms(reg.parent_phone, reg.parent_name)}
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                      >
                        💬 სმს
                      </button>
                    </div>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {new Date(reg.created_at).toLocaleString('ka-GE')}
                  </td>
                  <td>
                    <span className={`badge badge--${reg.status === 'approved' ? 'green' : reg.status === 'rejected' ? 'red' : 'gold'}`}>
                      {reg.status === 'approved' ? 'დადასტურებული' : reg.status === 'rejected' ? 'უარყოფილი' : 'მოდერაცია'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {reg.status !== 'approved' && (
                        <button 
                          onClick={() => onStatusUpdate(reg.id, 'approved')} 
                          className="admin-btn admin-btn--sm"
                          style={{ background: 'rgba(80,200,120,0.15)', border: '1px solid #50c878', color: '#50c878', padding: '4px 10px' }}
                        >
                          ✓ მიღება
                        </button>
                      )}
                      {reg.status !== 'rejected' && (
                        <button 
                          onClick={() => onStatusUpdate(reg.id, 'rejected')} 
                          className="admin-btn admin-btn--sm"
                          style={{ background: 'rgba(220,50,50,0.15)', border: '1px solid #ff7070', color: '#ff7070', padding: '4px 10px' }}
                        >
                          ✕ უარყოფა
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteRegistration(reg.id)}
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        style={{ padding: '4px 8px' }}
                        title="წაშლა"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Custom Forms Tab ── */
function CustomFormsTab({ forms, loading, onEdit, onDelete, onViewSubmissions, tabType }) {
  const [copiedSlug, setCopiedSlug] = useState('');

  const copyLink = (slug) => {
    const fullLink = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(''), 2000);
  };

  if (loading) {
    return <div style={{ color: 'var(--gold)', padding: '20px 0' }}>იტვირთება...</div>;
  }

  if (forms.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(26,24,22,0.6)', border: '1px dashed rgba(212,166,74,0.15)', borderRadius: '4px', color: '#6b665e' }}>
        {tabType === 'poll' ? 'თქვენ ჯერ არ შეგიქმნიათ გამოკითხვები.' : 'თქვენ ჯერ არ შეგიქმნიათ სარეგისტრაციო ბლანკები.'}
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <span className="admin-section__title">
          {tabType === 'poll' ? `შექმნილი გამოკითხვები (${forms.length})` : `შექმნილი სარეგისტრაციო ბლანკები (${forms.length})`}
        </span>
      </div>
      <div className="admin-section__body" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>სათაური</th>
              <th>ბმულის დასასრული (SLUG)</th>
              <th>ტიპი</th>
              <th>თარიღი</th>
              <th style={{ textAlign: 'right' }}>მოქმედება</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.id}>
                <td style={{ fontWeight: '600', color: '#fff' }}>{form.title}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>/f/{form.slug}</span>
                    <button 
                      onClick={() => copyLink(form.slug)}
                      className="admin-btn admin-btn--sm"
                      style={{ padding: '2px 8px', fontSize: '11px', background: 'rgba(255,255,255,0.06)' }}
                    >
                      {copiedSlug === form.slug ? '✓ კოპირებულია' : '📋 ბმულის კოპირება'}
                    </button>
                  </div>
                </td>
                <td>
                  <span className={`badge badge--${form.type === 'poll' ? 'gold' : 'muted'}`}>
                    {form.type === 'poll' ? 'გამოკითხვა' : 'ბლანკი'}
                  </span>
                </td>
                <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                  {new Date(form.created_at).toLocaleDateString('ka-GE')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => onViewSubmissions(form.slug)}
                      className="admin-btn admin-btn--sm"
                      style={{ background: 'rgba(212,166,74,0.15)', border: '1px solid rgba(212,166,74,0.3)', color: 'var(--gold)' }}
                    >
                      👁 პასუხები
                    </button>
                    <button 
                      onClick={() => onEdit(form.id)}
                      className="admin-btn admin-btn--sm"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                    >
                      ✏
                    </button>
                    <button 
                      onClick={() => onDelete(form.id)}
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      style={{ padding: '4px 10px' }}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Custom Form Builder Component ── */
function CustomFormForm({ item, onSave, onCancel, defaultType, showAlert }) {
  const [form, setForm] = useState({
    id: item?.id || null,
    title: item?.title || '',
    description: item?.description || '',
    slug: item?.slug || '',
    type: item?.type || defaultType || 'form',
    fields: item?.fields || []
  });

  const [newOption, setNewOption] = useState('');
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: ''
  });

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    setForm({
      ...form,
      fields: [...form.fields, newOption.trim()]
    });
    setNewOption('');
  };

  const handleRemoveOption = (index) => {
    setForm({
      ...form,
      fields: form.fields.filter((_, i) => i !== index)
    });
  };

  const handleAddField = () => {
    if (!newField.label.trim()) return;
    
    const fieldObj = {
      label: newField.label.trim(),
      name: newField.label.trim().toLowerCase().replace(/\s+/g, '-'),
      type: newField.type,
      required: newField.required,
      placeholder: newField.placeholder.trim(),
      options: newField.type === 'select' ? newField.options.split(',').map(o => o.trim()).filter(Boolean) : []
    };

    setForm({
      ...form,
      fields: [...form.fields, fieldObj]
    });

    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: ''
    });
  };

  const handleRemoveField = (index) => {
    setForm({
      ...form,
      fields: form.fields.filter((_, i) => i !== index)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showAlert('გთხოვთ მიუთითოთ სათაური'); return; }
    if (!form.slug.trim()) { showAlert('გთხოვთ მიუთითოთ ბმულის ბოლო (slug)'); return; }
    
    // Normalize slug
    const cleanSlug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
    
    onSave({
      ...form,
      slug: cleanSlug
    });
  };

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <span className="admin-section__title">{form.id ? 'ბლანკის / გამოკითხვის რედაქტირება' : 'ახალი ბლანკი / გამოკითხვა'}</span>
      </div>
      <div className="admin-section__body">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>სათაური *</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={e => setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9\s-_]/g, '').replace(/\s+/g, '-') })} 
                placeholder="მაგ: სურვილის გამოკითხვა ტურნირზე" 
                required 
              />
            </div>
            <div className="admin-field">
              <label>ბმულის დასასრული (URL SLUG) *</label>
              <input 
                type="text" 
                value={form.slug} 
                onChange={e => setForm({ ...form, slug: e.target.value })} 
                placeholder="მაგ: tournament-june" 
                required 
              />
            </div>
          </div>

          <div className="admin-field">
            <label>მოკლე აღწერა / ინსტრუქცია</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="მიუთითეთ დეტალური აღწერა მოსწავლეებისთვის"
            />
          </div>

          <div className="admin-field">
            <label>ტიპი</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, fields: [] })} disabled={!!form.id}>
              <option value="form">სარეგისტრაციო ბლანკი (კითხვარი)</option>
              <option value="poll">გამოკითხვა (ხმის მიცემა)</option>
            </select>
          </div>

          {/* TYPE == POLL: Options section */}
          {form.type === 'poll' && (
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(212,166,74,0.15)', borderRadius: '6px', padding: '20px' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '15px', fontSize: '14px' }}>🗳 გამოკითხვის ვარიანტები (პასუხები)</h4>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="text" 
                  value={newOption} 
                  onChange={e => setNewOption(e.target.value)} 
                  placeholder="მაგ: დიახ, მსურს მონაწილეობა"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddOption} className="admin-btn admin-btn--gold" style={{ width: 'auto', padding: '0 20px' }}>+ ვარიანტი</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.fields.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <span style={{ color: '#fff' }}>{opt}</span>
                    <button type="button" onClick={() => handleRemoveOption(idx)} className="admin-btn admin-btn--danger admin-btn--sm" style={{ padding: '4px 8px' }}>🗑</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TYPE == FORM: Fields builder section */}
          {form.type === 'form' && (
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(212,166,74,0.15)', borderRadius: '6px', padding: '20px' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '15px', fontSize: '14px' }}>📋 ბლანკის ველების კონსტრუქტორი</h4>
              
              {/* Field adding controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>ველის დასახელება *</label>
                  <input type="text" value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} placeholder="მაგ: მოსწავლის სახელი" />
                </div>
                
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>ველის ტიპი</label>
                  <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })}>
                    <option value="text">ტექსტური ველი (მოკლე)</option>
                    <option value="number">რიცხვითი ველი</option>
                    <option value="date">თარიღი</option>
                    <option value="textarea">დიდი ტექსტური ველი</option>
                    <option value="select">ჩამოსაშლელი სია (Select)</option>
                    <option value="checkbox">მოსანიშნი კვადრატი (Checkbox)</option>
                  </select>
                </div>

                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>აუცილებელი ველი</label>
                  <div style={{ marginTop: '8px' }}>
                    <label className="admin-checkbox">
                      <input type="checkbox" checked={newField.required} onChange={e => setNewField({ ...newField, required: e.target.checked })} />
                      კი
                    </label>
                  </div>
                </div>

                {newField.type === 'select' && (
                  <div className="admin-field" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label>ჩამოსაშლელი სიის ვარიანტები (მძიმით გამოყოფილი) *</label>
                    <input type="text" value={newField.options} onChange={e => setNewField({ ...newField, options: e.target.value })} placeholder="ვარიანტი 1, ვარიანტი 2, ვარიანტი 3" />
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '10px' }}>
                  <button type="button" onClick={handleAddField} className="admin-btn admin-btn--gold" style={{ width: 'auto', padding: '8px 25px' }}>+ ველის დამატება</button>
                </div>
              </div>

              {/* Added fields list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.fields.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 'bold', marginRight: '10px' }}>{f.label}</span>
                      <span className="badge badge--muted" style={{ marginRight: '10px' }}>{f.type}</span>
                      {f.required && <span className="badge badge--red">აუცილებელი</span>}
                      {f.type === 'select' && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginLeft: '10px' }}>({f.options.join(', ')})</span>}
                    </div>
                    <button type="button" onClick={() => handleRemoveField(idx)} className="admin-btn admin-btn--danger admin-btn--sm" style={{ padding: '4px 8px' }}>🗑</button>
                  </div>
                ))}
              </div>

            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="admin-btn admin-btn--gold" style={{ width: 'auto', padding: '12px 35px' }}>შენახვა</button>
            <button type="button" onClick={onCancel} className="admin-btn admin-btn--ghost" style={{ width: 'auto', padding: '12px 35px' }}>გაუქმება</button>
          </div>
        </form>
      </div>
    </div>
  );
}
