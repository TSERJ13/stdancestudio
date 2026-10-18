import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  fetchStudioData,
  fetchCloudTasksAndNotes,
  getStudentName,
  getPortalSession,
  savePortalSession
} from '../data/classcore'
import { getTasks, getNotes, saveTasksList, saveNotesList, getStudents } from '../data/db'
import DancerTasksBoard from '../components/DancerTasksBoard'
import './portal/portal.css'

export default function DancerTasksPage() {
  const [searchParams] = useSearchParams()
  const taskParam = searchParams.get('task') || ''
  const studentParam = searchParams.get('student') || ''

  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [activeStudent, setActiveStudent] = useState(null)
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [lang, setLang] = useState('ka')

  useEffect(() => {
    setTasks(getTasks())
    setNotes(getNotes())

    Promise.all([
      fetchStudioData().catch(() => null),
      fetchCloudTasksAndNotes().catch(() => null)
    ]).then(([studioData, freshCloud]) => {
      const localSt = getStudents()
      const cloudSt = studioData?.students || []
      const mergedStudents = [...cloudSt]
      localSt.forEach(ls => {
        if (!mergedStudents.find(cs => String(cs.id) === String(ls.id))) {
          mergedStudents.push(ls)
        }
      })
      setStudents(mergedStudents)

      const loadedTasks = freshCloud?.tasks?.length
        ? freshCloud.tasks
        : studioData?.tasks?.length
        ? studioData.tasks
        : getTasks()

      const loadedNotes = freshCloud?.notes?.length
        ? freshCloud.notes
        : studioData?.notes?.length
        ? studioData.notes
        : getNotes()

      saveTasksList(loadedTasks)
      saveNotesList(loadedNotes)
      setTasks(loadedTasks)
      setNotes(loadedNotes)

      // Resolve student from URL param, or single task assignee, or active portal session
      let targetStudentId = studentParam || getPortalSession() || ''
      if (!targetStudentId && taskParam) {
        const matchedTask = loadedTasks.find(t => t.id === taskParam)
        if (matchedTask?.assignedStudents?.length === 1) {
          targetStudentId = matchedTask.assignedStudents[0]
        }
      }

      if (targetStudentId) {
        const found = mergedStudents.find(s => String(s.id) === String(targetStudentId))
        if (found) {
          setActiveStudent(found)
          savePortalSession(found.id)
          setLang(found.language || found.data?.language || 'ka')
        }
      }

      setLoading(false)
    })
  }, [studentParam, taskParam])

  const focusedTask = taskParam ? tasks.find(t => t.id === taskParam) : null
  const candidateIds = focusedTask?.assignedStudents?.length > 0 ? focusedTask.assignedStudents : null
  const selectableStudents = candidateIds
    ? students.filter(s => candidateIds.includes(s.id))
    : students

  return (
    <div className="portal-wrap portal-shell" style={{ minHeight: '100vh' }}>
      <header className="portal-header">
        <div className="portal-header__brand-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="header__brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <img src="/images/logo-transparent.png" alt="ST Dance Studio" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, fontFamily: '"Times New Roman", Times, serif', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--color-gold, #d4a64a)', fontSize: '1.15rem', letterSpacing: '0.04em', fontWeight: 600 }}>ST DANCE</span>
              <div style={{ height: '1px', background: 'var(--color-gold, #d4a64a)', margin: '2px 0' }} />
              <span style={{ color: '#fff', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'lowercase' }}>studio</span>
            </div>
          </Link>
          <div style={{ width: '1px', height: '24px', background: 'rgba(212,166,74,0.2)', margin: '0 0.5rem' }} />
          <span style={{ fontSize: '0.95rem', color: 'var(--color-gold, #d4a64a)', fontWeight: 600 }}>
            📋 მოცეკვავის თასქები & ნოუთები
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['ka', 'ru', 'en'].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? 'var(--color-gold, #d4a64a)' : 'transparent',
                  border: '1px solid ' + (lang === l ? 'var(--color-gold, #d4a64a)' : 'rgba(255,255,255,0.15)'),
                  color: lang === l ? '#000' : '#a8a39a',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link
            to="/portal/dashboard"
            style={{
              background: 'rgba(212,166,74,0.14)',
              border: '1px solid rgba(212,166,74,0.35)',
              color: '#d4a64a',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            პორტალი ↗
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1220px', margin: '0 auto', padding: '1.75rem 1.25rem', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#d4a64a', fontSize: '1.1rem' }}>
            ⏳ იტვირთება დავალებები...
          </div>
        ) : !activeStudent ? (
          <div style={{
            maxWidth: '520px',
            margin: '2rem auto',
            background: '#151413',
            border: '1px solid rgba(212,166,74,0.28)',
            borderRadius: '14px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>👤</div>
            <h2 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
              აირჩიეთ თქვენი სახელი
            </h2>
            <p style={{ color: '#a8a39a', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
              თასქების და ნოუთების გასახსნელად აირჩიეთ მოცეკვავე:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
              {selectableStudents.map(st => {
                const stName = getStudentName(st) || st.name
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setActiveStudent(st)
                      savePortalSession(st.id)
                    }}
                    style={{
                      padding: '10px 16px',
                      background: 'rgba(212,166,74,0.08)',
                      border: '1px solid rgba(212,166,74,0.25)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>👤 {stName}</span>
                    <span style={{ color: '#d4a64a', fontSize: '0.8rem' }}>გახსნა →</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(212,166,74,0.07)',
              border: '1px solid rgba(212,166,74,0.22)',
              borderRadius: '12px'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#a8a39a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>მოცეკვავე</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  {getStudentName(activeStudent) || activeStudent.name}
                </div>
              </div>
              {selectableStudents.length > 1 && (
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#a8a39a',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  სხვა მოცეკვავის არჩევა
                </button>
              )}
            </div>

            <DancerTasksBoard
              student={activeStudent}
              studentName={getStudentName(activeStudent) || activeStudent.name}
              tasks={tasks}
              setTasks={setTasks}
              notes={notes}
              setNotes={setNotes}
              lang={lang}
              focusTaskId={taskParam || null}
            />
          </div>
        )}
      </main>
    </div>
  )
}
