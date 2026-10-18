import React, { useState, useMemo } from 'react'
import {
  saveTask, deleteTask, saveTasksList,
  saveNote, deleteNote, saveNotesList,
  saveStudent
} from '../../data/db'
import {
  syncTasksToCloud,
  syncSingleTaskProgressToCloud,
  saveSingleNoteToCloud,
  deleteSingleNoteFromCloud,
  sendTaskEmailNotification,
  sendSms,
  syncStudentToCloud,
  fetchCloudTasksAndNotes
} from '../../data/classcore'

export const TASK_CATEGORIES = [
  { id: 'latin',      label: '🔥 ლათინური',     color: '#e0764a', bg: 'rgba(224,118,74,0.14)' },
  { id: 'standard',   label: '🎩 სტანდარტული',  color: '#6fc3e0', bg: 'rgba(111,195,224,0.14)' },
  { id: 'tournament', label: '🏆 ტურნირი',      color: '#d4a64a', bg: 'rgba(212,166,74,0.16)' },
  { id: 'technique',  label: '✨ ტექნიკა',       color: '#b87bde', bg: 'rgba(184,123,222,0.14)' },
  { id: 'fitness',    label: '💪 ფიზმომზადება', color: '#50c878', bg: 'rgba(80,200,120,0.14)' },
  { id: 'general',    label: '📌 ზოგადი',        color: '#a8a39a', bg: 'rgba(168,163,154,0.14)' },
]

export const TASK_PRIORITIES = [
  { id: 'low',    label: 'დაბალი',     color: '#8b949e', bg: 'rgba(139,148,158,0.15)' },
  { id: 'medium', label: 'საშუალო',    color: '#d4a64a', bg: 'rgba(212,166,74,0.15)' },
  { id: 'high',   label: '⚡ მაღალი',  color: '#ff9800', bg: 'rgba(255,152,0,0.16)' },
  { id: 'urgent', label: '🔥 სასწრაფო', color: '#ff5252', bg: 'rgba(255,82,82,0.18)' },
]

export const BOARD_COLUMNS = [
  { id: 'todo',        title: 'შესასრულებელი', sub: 'To Do',       color: '#a8a39a', border: 'rgba(255,255,255,0.12)', icon: '📋' },
  { id: 'in_progress', title: 'პროცესშია',     sub: 'In Progress', color: '#d4a64a', border: 'rgba(212,166,74,0.35)',  icon: '⚡' },
  { id: 'done',        title: 'შესრულებული',   sub: 'Done',        color: '#50c878', border: 'rgba(80,200,120,0.35)',  icon: '✅' },
]

export const NOTE_COLORS = [
  { id: 'gold',    label: 'ოქროსფერი', border: 'rgba(212,166,74,0.4)',  bg: 'linear-gradient(145deg, rgba(212,166,74,0.12), rgba(20,18,15,0.95))', accent: '#d4a64a' },
  { id: 'emerald', label: 'მწვანე',    border: 'rgba(80,200,120,0.4)',  bg: 'linear-gradient(145deg, rgba(80,200,120,0.12), rgba(15,22,18,0.95))', accent: '#50c878' },
  { id: 'blue',    label: 'ლურჯი',     border: 'rgba(111,195,224,0.4)', bg: 'linear-gradient(145deg, rgba(111,195,224,0.12), rgba(15,20,24,0.95))', accent: '#6fc3e0' },
  { id: 'purple',  label: 'იისფერი',   border: 'rgba(184,123,222,0.4)', bg: 'linear-gradient(145deg, rgba(184,123,222,0.12), rgba(20,16,24,0.95))', accent: '#b87bde' },
  { id: 'rose',    label: 'წითელი',    border: 'rgba(255,107,123,0.4)', bg: 'linear-gradient(145deg, rgba(255,107,123,0.12), rgba(24,15,17,0.95))', accent: '#ff6b7b' },
]

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const clean = dateStr.slice(0, 10)
  const parts = clean.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

const formatDateTime = (isoStr) => {
  if (!isoStr) return ''
  try {
    return new Date(isoStr).toLocaleString('ka-GE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return isoStr
  }
}

export default function TasksNotesAdmin({
  tasks,
  setTasks,
  notes,
  setNotes,
  students,
  setStudents,
  showAlert,
  showConfirm
}) {
  const [subView, setSubView] = useState('board') // 'board' | 'dancers' | 'notes'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDancerFilter, setSelectedDancerFilter] = useState('all')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [syncing, setSyncing] = useState(false)

  // Drag & Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  // Modals state
  const [taskFormModal, setTaskFormModal] = useState(null) // null or task object
  const [activeTaskDetail, setActiveTaskDetail] = useState(null) // task id for detail modal
  const [notifyTaskModal, setNotifyTaskModal] = useState(null) // task object for Email/SMS modal
  const [noteFormModal, setNoteFormModal] = useState(null) // null or note object

  // Student map for fast lookup
  const studentMap = useMemo(() => {
    const map = {}
    students.forEach(s => { map[String(s.id)] = s })
    return map
  }, [students])

  // Live refresh from Supabase
  const handleLiveRefresh = async () => {
    setSyncing(true)
    try {
      const fresh = await fetchCloudTasksAndNotes()
      if (fresh) {
        if (Array.isArray(fresh.tasks)) {
          saveTasksList(fresh.tasks)
          setTasks(fresh.tasks)
        }
        if (Array.isArray(fresh.notes)) {
          saveNotesList(fresh.notes)
          setNotes(fresh.notes)
        }
        if (fresh.studentEmails && Object.keys(fresh.studentEmails).length > 0) {
          setStudents(prev => prev.map(s => ({
            ...s,
            email: fresh.studentEmails[s.id] || s.email || ''
          })))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSyncing(false)
    }
  }

  // Save or update a task and sync to cloud
  const handleSaveTask = async (taskData, openNotifyAfter = false) => {
    setSyncing(true)
    try {
      // Ensure assigneeProgress entries exist for all assignedStudents
      const existingProgress = { ...(taskData.assigneeProgress || {}) }
      const nowIso = new Date().toISOString()
      ;(taskData.assignedStudents || []).forEach(sid => {
        if (!existingProgress[sid]) {
          existingProgress[sid] = {
            status: taskData.status || 'todo',
            checkedItems: [],
            dancerNote: '',
            studentName: studentMap[String(sid)]?.name || '',
            updatedAt: nowIso
          }
        }
      })

      const saved = saveTask({
        ...taskData,
        assigneeProgress: existingProgress
      })

      const currentAll = JSON.parse(localStorage.getItem('std_tasks') || '[]')
      setTasks(currentAll)
      await syncTasksToCloud(currentAll)
      setTaskFormModal(null)

      if (openNotifyAfter) {
        setNotifyTaskModal(saved)
      }
    } catch (e) {
      console.error('Save task error:', e)
      showAlert('თასქის შენახვისას დაფიქსირდა შეცდომა.')
    } finally {
      setSyncing(false)
    }
  }

  // Delete task
  const handleDeleteTask = (taskId) => {
    showConfirm('დარწმუნებული ხართ, რომ გსურთ ამ თასქის წაშლა?', async () => {
      setSyncing(true)
      try {
        deleteTask(taskId)
        const updated = JSON.parse(localStorage.getItem('std_tasks') || '[]')
        setTasks(updated)
        if (activeTaskDetail === taskId) setActiveTaskDetail(null)
        await syncTasksToCloud(updated)
      } finally {
        setSyncing(false)
      }
    })
  }

  // Move task between columns (either overall or for a filtered dancer)
  const handleMoveTaskStatus = async (task, newStatus, specificStudentId = null) => {
    const targetStudentId = specificStudentId || (selectedDancerFilter !== 'all' ? selectedDancerFilter : null)
    const nowIso = new Date().toISOString()

    const updatedTask = { ...task, updatedAt: nowIso }
    const progressMap = { ...(updatedTask.assigneeProgress || {}) }

    if (targetStudentId && (updatedTask.assignedStudents || []).includes(targetStudentId)) {
      const prev = progressMap[targetStudentId] || { status: 'todo', checkedItems: [], dancerNote: '' }
      progressMap[targetStudentId] = {
        ...prev,
        status: newStatus,
        updatedAt: nowIso
      }
      updatedTask.assigneeProgress = progressMap
      const assignees = updatedTask.assignedStudents
      const statuses = assignees.map(sid => progressMap[sid]?.status || 'todo')
      if (statuses.every(s => s === 'done')) updatedTask.status = 'done'
      else if (statuses.some(s => s === 'in_progress' || s === 'done')) updatedTask.status = 'in_progress'
      else updatedTask.status = 'todo'
    } else {
      updatedTask.status = newStatus
      // Also update all assignees if moving the whole card on unfiltered board
      ;(updatedTask.assignedStudents || []).forEach(sid => {
        const prev = progressMap[sid] || { status: 'todo', checkedItems: [], dancerNote: '' }
        progressMap[sid] = {
          ...prev,
          status: newStatus,
          updatedAt: nowIso
        }
      })
      updatedTask.assigneeProgress = progressMap
    }

    saveTask(updatedTask)
    const all = JSON.parse(localStorage.getItem('std_tasks') || '[]')
    setTasks(all)
    await syncTasksToCloud(all)
  }

  // Toggle checklist item for a student or overall in admin detail modal
  const handleToggleChecklistAdmin = async (task, itemId, studentId = null) => {
    const nowIso = new Date().toISOString()
    const updatedTask = { ...task, updatedAt: nowIso }

    if (studentId) {
      const progressMap = { ...(updatedTask.assigneeProgress || {}) }
      const prev = progressMap[studentId] || { status: 'todo', checkedItems: [], dancerNote: '' }
      const checked = Array.isArray(prev.checkedItems) ? [...prev.checkedItems] : []
      const nextChecked = checked.includes(itemId)
        ? checked.filter(x => x !== itemId)
        : [...checked, itemId]

      let nextStatus = prev.status || 'todo'
      if (updatedTask.checklist?.length > 0) {
        if (nextChecked.length === updatedTask.checklist.length) nextStatus = 'done'
        else if (nextChecked.length > 0) nextStatus = 'in_progress'
      }

      progressMap[studentId] = {
        ...prev,
        checkedItems: nextChecked,
        status: nextStatus,
        updatedAt: nowIso
      }
      updatedTask.assigneeProgress = progressMap

      const assignees = updatedTask.assignedStudents || []
      if (assignees.length > 0) {
        const statuses = assignees.map(sid => progressMap[sid]?.status || 'todo')
        if (statuses.every(s => s === 'done')) updatedTask.status = 'done'
        else if (statuses.some(s => s === 'in_progress' || s === 'done')) updatedTask.status = 'in_progress'
        else updatedTask.status = 'todo'
      }
    } else {
      updatedTask.checklist = (updatedTask.checklist || []).map(c =>
        c.id === itemId ? { ...c, done: !c.done } : c
      )
    }

    saveTask(updatedTask)
    const all = JSON.parse(localStorage.getItem('std_tasks') || '[]')
    setTasks(all)
    await syncTasksToCloud(all)
  }

  // Add comment/note to a task from Admin
  const handleAddCommentAdmin = async (taskId, text) => {
    if (!text || !text.trim()) return
    setSyncing(true)
    try {
      const cloudUpdated = await syncSingleTaskProgressToCloud({
        taskId,
        commentText: text.trim(),
        authorRole: 'admin',
        authorName: 'სერგი წივწივაძე (მწვრთნელი)'
      })
      if (cloudUpdated) {
        setTasks(cloudUpdated)
      } else {
        const target = tasks.find(t => t.id === taskId)
        if (target) {
          const nowIso = new Date().toISOString()
          const nextComments = [...(target.comments || []), {
            id: 'cmt_' + Math.random().toString(36).slice(2, 9),
            authorName: 'სერგი წივწივაძე (მწვრთნელი)',
            authorRole: 'admin',
            text: text.trim(),
            createdAt: nowIso
          }]
          const saved = saveTask({ ...target, comments: nextComments })
          const all = JSON.parse(localStorage.getItem('std_tasks') || '[]')
          setTasks(all)
          await syncTasksToCloud(all)
        }
      }
    } finally {
      setSyncing(false)
    }
  }

  // Save or update a note
  const handleSaveNote = async (noteData) => {
    setSyncing(true)
    try {
      const saved = saveNote(noteData)
      const localAll = JSON.parse(localStorage.getItem('std_notes') || '[]')
      setNotes(localAll)
      setNoteFormModal(null)
      const cloudNotes = await saveSingleNoteToCloud(saved)
      if (cloudNotes) setNotes(cloudNotes)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteNote = (noteId) => {
    showConfirm('დარწმუნებული ხართ, რომ გსურთ ამ ნოუთის წაშლა?', async () => {
      setSyncing(true)
      try {
        deleteNote(noteId)
        const localAll = JSON.parse(localStorage.getItem('std_notes') || '[]')
        setNotes(localAll)
        const cloudNotes = await deleteSingleNoteFromCloud(noteId)
        if (cloudNotes) setNotes(cloudNotes)
      } finally {
        setSyncing(false)
      }
    })
  }

  const handleTogglePinNote = async (note) => {
    const updated = { ...note, pinned: !note.pinned }
    await handleSaveNote(updated)
  }

  // Filtered tasks for board
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedDancerFilter !== 'all') {
        const assigned = Array.isArray(t.assignedStudents) ? t.assignedStudents : []
        if (!assigned.includes(selectedDancerFilter)) return false
      }
      if (selectedCategoryFilter !== 'all' && t.category !== selectedCategoryFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (t.title || '').toLowerCase().includes(q)
        const matchDesc = (t.description || '').toLowerCase().includes(q)
        const matchDancer = (t.assignedStudents || []).some(sid =>
          (studentMap[String(sid)]?.name || '').toLowerCase().includes(q)
        )
        if (!matchTitle && !matchDesc && !matchDancer) return false
      }
      return true
    })
  }, [tasks, selectedDancerFilter, selectedCategoryFilter, searchQuery, studentMap])

  // Determine effective column status of a task (if filtered by a specific dancer, show in THAT dancer's status column!)
  const getEffectiveStatus = (task) => {
    if (selectedDancerFilter !== 'all') {
      return task.assigneeProgress?.[selectedDancerFilter]?.status || task.status || 'todo'
    }
    return task.status || 'todo'
  }

  // Summary counts
  const stats = useMemo(() => {
    const total = tasks.length
    const todo = tasks.filter(t => (t.status || 'todo') === 'todo').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const done = tasks.filter(t => t.status === 'done').length
    return { total, todo, inProgress, done, notesCount: notes.length }
  }, [tasks, notes])

  const detailTaskObj = useMemo(
    () => tasks.find(t => t.id === activeTaskDetail) || null,
    [tasks, activeTaskDetail]
  )

  const copyDirectLink = (taskId, studentId = '') => {
    const url = `${window.location.origin}/tasks?task=${encodeURIComponent(taskId)}${studentId ? `&student=${encodeURIComponent(studentId)}` : ''}`
    navigator.clipboard?.writeText(url)
    showAlert(`პირდაპირი ბმული დაკოპირებულია!\n\n${url}`)
  }

  return (
    <div>
      {/* Top Stats & Action Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(212,166,74,0.16)',
        borderRadius: '10px',
        padding: '1rem 1.25rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a847a' }}>სულ თასქი</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff' }}>{stats.total}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a8a39a' }}>შესასრულებელი</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#a8a39a' }}>{stats.todo}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4a64a' }}>პროცესშია</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#d4a64a' }}>{stats.inProgress}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#50c878' }}>შესრულებული</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#50c878' }}>{stats.done}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6fc3e0' }}>ნოუთები</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#6fc3e0' }}>{stats.notesCount}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={handleLiveRefresh}
            disabled={syncing}
            title="ღრუბლიდან უახლესი სტატუსების წამოღება"
          >
            {syncing ? '⏳ სინქრონიზაცია...' : '🔄 განახლება'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setNoteFormModal({
              title: '',
              content: '',
              color: 'gold',
              pinned: false,
              assignedStudents: selectedDancerFilter !== 'all' ? [selectedDancerFilter] : []
            })}
            style={{ borderColor: 'rgba(111,195,224,0.4)', color: '#6fc3e0' }}
          >
            + ახალი ნოუთი
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--gold admin-btn--sm"
            onClick={() => setTaskFormModal({
              title: '',
              description: '',
              category: 'latin',
              priority: 'medium',
              status: 'todo',
              dueDate: '',
              assignedStudents: selectedDancerFilter !== 'all' ? [selectedDancerFilter] : [],
              checklist: []
            })}
          >
            + ახალი თასქი
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs + Filters */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', background: '#11100f', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => setSubView('board')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: subView === 'board' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'board' ? '#000' : '#a8a39a',
              transition: 'all 0.2s'
            }}
          >
            📋 Trello დაფა ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('dancers')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: subView === 'dancers' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'dancers' ? '#000' : '#a8a39a',
              transition: 'all 0.2s'
            }}
          >
            👥 ვინ რას აკეთებს
          </button>
          <button
            type="button"
            onClick={() => setSubView('notes')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: subView === 'notes' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'notes' ? '#000' : '#a8a39a',
              transition: 'all 0.2s'
            }}
          >
            📝 ნოუთები ({notes.length})
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 ძებნა თასქებში ან მოცეკვავით..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,166,74,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.83rem',
              minWidth: '210px',
              outline: 'none'
            }}
          />
          <select
            value={selectedDancerFilter}
            onChange={e => setSelectedDancerFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#151413',
              border: '1px solid rgba(212,166,74,0.25)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.83rem',
              outline: 'none'
            }}
          >
            <option value="all">👤 ყველა მოცეკვავე</option>
            {[...students].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka')).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.classification || 'N'})</option>
            ))}
          </select>
          {subView === 'board' && (
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#151413',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.83rem',
                outline: 'none'
              }}
            >
              <option value="all">🏷 ყველა კატეგორია</option>
              {TASK_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Active Dancer Filter Banner */}
      {selectedDancerFilter !== 'all' && studentMap[selectedDancerFilter] && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(212,166,74,0.1)',
          border: '1px solid rgba(212,166,74,0.3)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '0.88rem', color: '#f5f1e8' }}>
            ნაჩვენებია მოცეკვავის დაფა: <strong style={{ color: '#d4a64a' }}>{studentMap[selectedDancerFilter].name}</strong> — სვეტები ასახავს კონკრეტულად ამ მოცეკვავის სტატუსს!
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => {
                const url = `${window.location.origin}/tasks?student=${encodeURIComponent(selectedDancerFilter)}`
                navigator.clipboard?.writeText(url)
                showAlert(`მოცეკვავის პირადი თასქების ბმული დაკოპირდა:\n\n${url}`)
              }}
            >
              🔗 პირადი დაფის ბმული
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setSelectedDancerFilter('all')}
            >
              ✕ ფილტრის მოხსნა
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: TRELLO KANBAN BOARD */}
      {subView === 'board' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1rem',
          alignItems: 'start'
        }}>
          {BOARD_COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => getEffectiveStatus(t) === col.id)
            const isOver = dragOverCol === col.id

            return (
              <div
                key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOverCol(null)
                  if (draggedTaskId) {
                    const tObj = tasks.find(x => x.id === draggedTaskId)
                    if (tObj) handleMoveTaskStatus(tObj, col.id)
                    setDraggedTaskId(null)
                  }
                }}
                style={{
                  background: isOver ? 'rgba(212,166,74,0.06)' : '#121110',
                  border: `1px solid ${isOver ? '#d4a64a' : col.border}`,
                  borderRadius: '12px',
                  padding: '0.9rem',
                  minHeight: '460px',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  marginBottom: '0.85rem',
                  borderBottom: `2px solid ${col.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{col.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: col.color, fontSize: '0.95rem' }}>{col.title}</div>
                      <div style={{ fontSize: '0.68rem', color: '#6b665e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.sub}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.06)',
                      color: col.color,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '2px 9px',
                      borderRadius: '20px'
                    }}>
                      {colTasks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTaskFormModal({
                        title: '',
                        description: '',
                        category: 'latin',
                        priority: 'medium',
                        status: col.id,
                        dueDate: '',
                        assignedStudents: selectedDancerFilter !== 'all' ? [selectedDancerFilter] : [],
                        checklist: []
                      })}
                      style={{
                        background: 'rgba(212,166,74,0.12)',
                        border: '1px solid rgba(212,166,74,0.3)',
                        color: '#d4a64a',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1rem',
                        lineHeight: 1
                      }}
                      title="ამ სვეტში თასქის დამატება"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colTasks.length === 0 && (
                    <div style={{
                      padding: '2.2rem 1rem',
                      textAlign: 'center',
                      color: '#5a554e',
                      fontSize: '0.82rem',
                      border: '1px dashed rgba(255,255,255,0.06)',
                      borderRadius: '8px'
                    }}>
                      ამ სვეტში თასქები არ არის
                    </div>
                  )}

                  {colTasks.map(task => {
                    const catObj = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[5]
                    const prioObj = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1]
                    const assignees = Array.isArray(task.assignedStudents) ? task.assignedStudents : []
                    const checklist = Array.isArray(task.checklist) ? task.checklist : []
                    const comments = Array.isArray(task.comments) ? task.comments : []
                    const todayStr = new Date().toISOString().slice(0, 10)
                    const isOverdue = task.dueDate && task.dueDate < todayStr && getEffectiveStatus(task) !== 'done'

                    // Count how many assignees finished
                    const doneAssigneesCount = assignees.filter(sid => task.assigneeProgress?.[sid]?.status === 'done').length
                    const inProgAssigneesCount = assignees.filter(sid => task.assigneeProgress?.[sid]?.status === 'in_progress').length

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => { setDraggedTaskId(null); setDragOverCol(null) }}
                        style={{
                          background: '#191715',
                          border: '1px solid rgba(255,255,255,0.09)',
                          borderLeft: `3px solid ${catObj.color}`,
                          borderRadius: '10px',
                          padding: '0.9rem',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                          cursor: 'grab',
                          transition: 'transform 0.15s ease, border-color 0.2s ease'
                        }}
                      >
                        {/* Top Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.55rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: catObj.bg,
                            color: catObj.color
                          }}>
                            {catObj.label}
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: prioObj.bg,
                              color: prioObj.color
                            }}>
                              {prioObj.label}
                            </span>
                            {task.dueDate && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: isOverdue ? 'rgba(255,82,82,0.18)' : 'rgba(255,255,255,0.05)',
                                color: isOverdue ? '#ff6b6b' : '#a8a39a',
                                fontWeight: isOverdue ? 700 : 500
                              }}>
                                📅 {formatShortDate(task.dueDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div
                          onClick={() => setActiveTaskDetail(task.id)}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.96rem',
                            color: '#f5f1e8',
                            marginBottom: task.description ? '0.35rem' : '0.6rem',
                            cursor: 'pointer',
                            lineHeight: 1.35
                          }}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div
                            onClick={() => setActiveTaskDetail(task.id)}
                            style={{
                              fontSize: '0.8rem',
                              color: '#9e988e',
                              marginBottom: '0.65rem',
                              lineHeight: 1.45,
                              cursor: 'pointer',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {task.description}
                          </div>
                        )}

                        {/* Checklist Summary if present */}
                        {checklist.length > 0 && (
                          <div style={{
                            marginBottom: '0.65rem',
                            padding: '6px 8px',
                            background: 'rgba(255,255,255,0.025)',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            color: '#b8b2a8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>☑ ქვე-დავალებები: <strong>{checklist.length}</strong> პუნქტი</span>
                            <button
                              type="button"
                              onClick={() => setActiveTaskDetail(task.id)}
                              style={{ background: 'none', border: 'none', color: '#d4a64a', fontSize: '0.73rem', cursor: 'pointer', padding: 0 }}
                            >
                              ნახვა →
                            </button>
                          </div>
                        )}

                        {/* Assigned Dancers with Individual Statuses */}
                        <div style={{ marginBottom: '0.7rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.68rem', color: '#7a756c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              მოცეკვავეები ({assignees.length || 'ყველა'})
                            </span>
                            {assignees.length > 1 && (
                              <span style={{ fontSize: '0.7rem', color: doneAssigneesCount === assignees.length ? '#50c878' : '#d4a64a', fontWeight: 600 }}>
                                ✓ {doneAssigneesCount}/{assignees.length} შეასრულა
                              </span>
                            )}
                          </div>

                          {assignees.length > 1 && (
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.45rem' }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.round(((doneAssigneesCount + inProgAssigneesCount * 0.4) / assignees.length) * 100)}%`,
                                background: doneAssigneesCount === assignees.length ? '#50c878' : '#d4a64a',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {assignees.length === 0 ? (
                              <span style={{ fontSize: '0.74rem', color: '#8a847a' }}>🌍 ზოგადი დავალება</span>
                            ) : (
                              assignees.map(sid => {
                                const st = studentMap[String(sid)]
                                const stName = st ? st.name : (task.assigneeProgress?.[sid]?.studentName || 'მოცეკვავე')
                                const prog = task.assigneeProgress?.[sid] || {}
                                const pStatus = prog.status || 'todo'
                                const checkedCount = Array.isArray(prog.checkedItems) ? prog.checkedItems.length : 0
                                const statusDot = pStatus === 'done' ? '🟢' : pStatus === 'in_progress' ? '🟡' : '⚪'
                                const chipBg = pStatus === 'done'
                                  ? 'rgba(80,200,120,0.14)'
                                  : pStatus === 'in_progress'
                                  ? 'rgba(212,166,74,0.15)'
                                  : 'rgba(255,255,255,0.05)'
                                const chipBorder = pStatus === 'done'
                                  ? 'rgba(80,200,120,0.35)'
                                  : pStatus === 'in_progress'
                                  ? 'rgba(212,166,74,0.35)'
                                  : 'rgba(255,255,255,0.1)'

                                return (
                                  <span
                                    key={sid}
                                    onClick={() => setActiveTaskDetail(task.id)}
                                    title={`${stName}: ${pStatus === 'done' ? 'შესრულებულია' : pStatus === 'in_progress' ? 'პროცესშია' : 'შესასრულებელი'}${prog.dancerNote ? ` | ნოუთი: ${prog.dancerNote}` : ''}`}
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '3px 8px',
                                      borderRadius: '20px',
                                      background: chipBg,
                                      border: `1px solid ${chipBorder}`,
                                      color: '#f5f1e8',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <span>{statusDot}</span>
                                    <span>{stName}</span>
                                    {checklist.length > 0 && (
                                      <span style={{ fontSize: '0.66rem', opacity: 0.8 }}>({checkedCount}/{checklist.length})</span>
                                    )}
                                  </span>
                                )
                              })
                            )}
                          </div>
                        </div>

                        {/* Latest Dancer Note / Comment Preview */}
                        {comments.length > 0 && (
                          <div
                            onClick={() => setActiveTaskDetail(task.id)}
                            style={{
                              marginBottom: '0.65rem',
                              padding: '6px 9px',
                              background: 'rgba(212,166,74,0.06)',
                              borderLeft: '2px solid #d4a64a',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              color: '#d8d2c7',
                              cursor: 'pointer'
                            }}
                          >
                            💬 <strong>{comments[comments.length - 1].authorName}:</strong> {comments[comments.length - 1].text}
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.55rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          gap: '0.35rem',
                          flexWrap: 'wrap'
                        }}>
                          {/* Quick Status Move Buttons */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {col.id !== 'todo' && (
                              <button
                                type="button"
                                onClick={() => handleMoveTaskStatus(task, 'todo')}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#a8a39a', fontSize: '0.7rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                                title="შესასრულებელში დაბრუნება"
                              >
                                ◀ To Do
                              </button>
                            )}
                            {col.id !== 'in_progress' && (
                              <button
                                type="button"
                                onClick={() => handleMoveTaskStatus(task, 'in_progress')}
                                style={{ background: 'rgba(212,166,74,0.14)', border: 'none', color: '#d4a64a', fontSize: '0.7rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                title="პროცესში გადატანა"
                              >
                                ⚡ პროცესში
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                type="button"
                                onClick={() => handleMoveTaskStatus(task, 'done')}
                                style={{ background: 'rgba(80,200,120,0.15)', border: 'none', color: '#50c878', fontSize: '0.7rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                title="შესრულებულად მონიშვნა"
                              >
                                ✓ Done
                              </button>
                            )}
                          </div>

                          {/* Share / Detail / Edit / Delete */}
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setNotifyTaskModal(task)}
                              style={{
                                background: 'rgba(212,166,74,0.16)',
                                border: '1px solid rgba(212,166,74,0.35)',
                                color: '#d4a64a',
                                fontSize: '0.72rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                              title="მეილზე ან SMS-ზე გაგზავნა"
                            >
                              ✉️ მეილი / SMS
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTaskDetail(task.id)}
                              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: '0.72rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                              title="დეტალები და ნოუთები"
                            >
                              👁 {comments.length > 0 ? comments.length : ''}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskFormModal(task)}
                              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#a8a39a', fontSize: '0.72rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                              title="რედაქტირება"
                            >
                              ✏
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              style={{ background: 'rgba(220,53,69,0.14)', border: 'none', color: '#ff6b7b', fontSize: '0.72rem', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer' }}
                              title="წაშლა"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VIEW 2: WHO IS DOING WHAT (DANCER ACTIVITY MATRIX) */}
      {subView === 'dancers' && (
        <DancersActivityView
          students={students}
          setStudents={setStudents}
          tasks={tasks}
          notes={notes}
          searchQuery={searchQuery}
          selectedDancerFilter={selectedDancerFilter}
          onSelectDancerBoard={(sid) => {
            setSelectedDancerFilter(sid)
            setSubView('board')
          }}
          onAddTaskForDancer={(sid) => setTaskFormModal({
            title: '',
            description: '',
            category: 'latin',
            priority: 'medium',
            status: 'todo',
            dueDate: '',
            assignedStudents: [sid],
            checklist: []
          })}
          onAddNoteForDancer={(sid) => setNoteFormModal({
            title: '',
            content: '',
            color: 'gold',
            pinned: false,
            assignedStudents: [sid]
          })}
          onOpenTaskDetail={(tid) => setActiveTaskDetail(tid)}
          onNotifyTask={(task) => setNotifyTaskModal(task)}
          showAlert={showAlert}
        />
      )}

      {/* VIEW 3: NOTES BOARD */}
      {subView === 'notes' && (
        <NotesBoardView
          notes={notes}
          students={students}
          studentMap={studentMap}
          selectedDancerFilter={selectedDancerFilter}
          searchQuery={searchQuery}
          onAddNote={() => setNoteFormModal({
            title: '',
            content: '',
            color: 'gold',
            pinned: false,
            assignedStudents: selectedDancerFilter !== 'all' ? [selectedDancerFilter] : []
          })}
          onEditNote={(n) => setNoteFormModal(n)}
          onDeleteNote={handleDeleteNote}
          onTogglePin={handleTogglePinNote}
        />
      )}

      {/* MODAL 1: CREATE / EDIT TASK */}
      {taskFormModal && (
        <TaskFormModal
          initialTask={taskFormModal}
          students={students}
          syncing={syncing}
          onClose={() => setTaskFormModal(null)}
          onSave={handleSaveTask}
        />
      )}

      {/* MODAL 2: TASK DETAILS, INDIVIDUAL PROGRESS & NOTES CHAT */}
      {detailTaskObj && (
        <TaskDetailModal
          task={detailTaskObj}
          studentMap={studentMap}
          syncing={syncing}
          onClose={() => setActiveTaskDetail(null)}
          onEdit={() => {
            setTaskFormModal(detailTaskObj)
            setActiveTaskDetail(null)
          }}
          onNotify={() => setNotifyTaskModal(detailTaskObj)}
          onMoveStatus={handleMoveTaskStatus}
          onToggleChecklist={handleToggleChecklistAdmin}
          onAddComment={handleAddCommentAdmin}
          onCopyLink={copyDirectLink}
        />
      )}

      {/* MODAL 3: SEND TASK VIA EMAIL / GMAIL / SMS */}
      {notifyTaskModal && (
        <NotifyTaskModal
          task={notifyTaskModal}
          students={students}
          setStudents={setStudents}
          studentMap={studentMap}
          onClose={() => setNotifyTaskModal(null)}
          showAlert={showAlert}
        />
      )}

      {/* MODAL 4: CREATE / EDIT NOTE */}
      {noteFormModal && (
        <NoteFormModal
          initialNote={noteFormModal}
          students={students}
          syncing={syncing}
          onClose={() => setNoteFormModal(null)}
          onSave={handleSaveNote}
        />
      )}
    </div>
  )
}

/* ============================================================================
   SUB-COMPONENT: DANCERS ACTIVITY MATRIX ("ვინ რას აკეთებს")
   ============================================================================ */
function DancersActivityView({
  students,
  setStudents,
  tasks,
  notes,
  searchQuery,
  selectedDancerFilter,
  onSelectDancerBoard,
  onAddTaskForDancer,
  onAddNoteForDancer,
  onOpenTaskDetail,
  onNotifyTask,
  showAlert
}) {
  const [onlyWithTasks, setOnlyWithTasks] = useState(false)
  const [editingEmailId, setEditingEmailId] = useState(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  const rows = useMemo(() => {
    return students
      .filter(s => {
        if (selectedDancerFilter !== 'all' && String(s.id) !== String(selectedDancerFilter)) return false
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          if (!(s.name || '').toLowerCase().includes(q) && !(s.phone || '').includes(q) && !(s.email || '').toLowerCase().includes(q)) {
            return false
          }
        }
        return true
      })
      .map(s => {
        const myTasks = tasks.filter(t => (t.assignedStudents || []).includes(s.id))
        const myNotes = notes.filter(n => (n.assignedStudents || []).includes(s.id) || n.studentId === s.id)
        const todoTasks = myTasks.filter(t => (t.assigneeProgress?.[s.id]?.status || t.status || 'todo') === 'todo')
        const inProgTasks = myTasks.filter(t => (t.assigneeProgress?.[s.id]?.status || t.status || 'todo') === 'in_progress')
        const doneTasks = myTasks.filter(t => (t.assigneeProgress?.[s.id]?.status || t.status || 'todo') === 'done')
        const pct = myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 0

        return {
          student: s,
          myTasks,
          myNotes,
          todoTasks,
          inProgTasks,
          doneTasks,
          pct
        }
      })
      .filter(r => !onlyWithTasks || r.myTasks.length > 0 || r.myNotes.length > 0)
      .sort((a, b) => {
        if (b.myTasks.length !== a.myTasks.length) return b.myTasks.length - a.myTasks.length
        return (a.student.name || '').localeCompare(b.student.name || '', 'ka')
      })
  }, [students, tasks, notes, searchQuery, selectedDancerFilter, onlyWithTasks])

  const handleQuickSaveEmail = async (student) => {
    setSavingEmail(true)
    try {
      const updated = { ...student, email: emailDraft.trim() }
      saveStudent(updated)
      setStudents(prev => prev.map(x => x.id === student.id ? updated : x))
      await syncStudentToCloud(updated)
      setEditingEmailId(null)
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.88rem', color: '#b8b2a8' }}>
          თითოეული მოცეკვავის მიმდინარე დავალებები, შესრულების პროგრესი და ნოუთები რეალურ დროში:
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#d4a64a', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyWithTasks} onChange={e => setOnlyWithTasks(e.target.checked)} />
          მხოლოდ აქტიური თასქების მქონე მოცეკვავეები
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {rows.map(({ student: s, myTasks, myNotes, todoTasks, inProgTasks, doneTasks, pct }) => (
          <div
            key={s.id}
            style={{
              background: '#141312',
              border: '1px solid rgba(212,166,74,0.18)',
              borderRadius: '12px',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {/* Dancer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="admin-avatar" style={{ width: '42px', height: '42px', fontSize: '1rem' }}>
                  {s.photo ? <img src={s.photo} alt="" /> : (s.name?.[0] || '?')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a39a', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2px' }}>
                    <span className="badge badge--gold">{s.classification || 'N კლასი'}</span>
                    {s.phone && <span>📞 {s.phone}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => onSelectDancerBoard(s.id)}
                style={{ fontSize: '0.73rem', padding: '4px 9px' }}
              >
                📋 დაფა ({myTasks.length})
              </button>
            </div>

            {/* Email Quick Edit Row */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {editingEmailId === s.id ? (
                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={e => setEmailDraft(e.target.value)}
                    placeholder="example@gmail.com"
                    style={{ flex: 1, padding: '4px 8px', background: '#0a0908', border: '1px solid #d4a64a', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                  />
                  <button
                    type="button"
                    disabled={savingEmail}
                    onClick={() => handleQuickSaveEmail(s)}
                    className="admin-btn admin-btn--gold admin-btn--sm"
                    style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmailId(null)}
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ color: s.email ? '#d8d2c7' : '#6b665e' }}>
                    ✉️ {s.email || 'ელ-ფოსტა არ არის მითითებული'}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setEditingEmailId(s.id); setEmailDraft(s.email || '') }}
                    style={{ background: 'none', border: 'none', color: '#d4a64a', fontSize: '0.74rem', cursor: 'pointer' }}
                  >
                    {s.email ? '✏ შეცვლა' : '+ მეილის დამატება'}
                  </button>
                </>
              )}
            </div>

            {/* Progress Bar & Pill Counts */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#a8a39a' }}>
                  ⚪ {todoTasks.length} დასაწყები · 🟡 {inProgTasks.length} პროცესში · 🟢 {doneTasks.length} შესრულებული
                </span>
                <strong style={{ color: pct === 100 && myTasks.length > 0 ? '#50c878' : '#d4a64a' }}>{pct}%</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: pct === 100 ? '#50c878' : 'linear-gradient(90deg, #d4a64a, #50c878)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Active Tasks List for this Dancer */}
            {myTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '210px', overflowY: 'auto' }}>
                {myTasks.map(t => {
                  const prog = t.assigneeProgress?.[s.id] || {}
                  const stStatus = prog.status || t.status || 'todo'
                  const checkedCount = Array.isArray(prog.checkedItems) ? prog.checkedItems.length : 0
                  const totalChecks = Array.isArray(t.checklist) ? t.checklist.length : 0
                  const statusBadge = stStatus === 'done'
                    ? { text: '✓ შესრულდა', color: '#50c878', bg: 'rgba(80,200,120,0.14)' }
                    : stStatus === 'in_progress'
                    ? { text: '⚡ აკეთებს', color: '#d4a64a', bg: 'rgba(212,166,74,0.15)' }
                    : { text: '⚪ შესასრულებელი', color: '#a8a39a', bg: 'rgba(255,255,255,0.06)' }

                  return (
                    <div
                      key={t.id}
                      onClick={() => onOpenTaskDetail(t.id)}
                      style={{
                        padding: '7px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f5f1e8' }}>{t.title}</span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '12px', background: statusBadge.bg, color: statusBadge.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8a847a' }}>
                        <span>
                          {totalChecks > 0 ? `☑ ${checkedCount}/${totalChecks} პუნქტი` : ''}
                          {prog.dancerNote ? ` · 📝 "${prog.dancerNote}"` : ''}
                        </span>
                        {prog.updatedAt && <span>{formatDateTime(prog.updatedAt)}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#5a554e', textAlign: 'center', padding: '0.5rem 0' }}>
                ამ მოცეკვავეს თასქი ჯერ არ აქვს მინიჭებული
              </div>
            )}

            {/* Quick Actions for this Dancer */}
            <div style={{ display: 'flex', gap: '0.45rem', marginTop: 'auto', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="admin-btn admin-btn--gold admin-btn--sm"
                style={{ flex: 1, fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => onAddTaskForDancer(s.id)}
              >
                + თასქის მიცემა
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => onAddNoteForDancer(s.id)}
              >
                + ნოუთი
              </button>
              {myTasks.length > 0 && (
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                  onClick={() => onNotifyTask(myTasks[0])}
                  title="ბოლო თასქის გაგზავნა მეილზე / SMS-ზე"
                >
                  ✉️ გაგზავნა
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
   SUB-COMPONENT: NOTES BOARD VIEW
   ============================================================================ */
function NotesBoardView({
  notes,
  studentMap,
  selectedDancerFilter,
  searchQuery,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePin
}) {
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (selectedDancerFilter !== 'all') {
        const assigned = Array.isArray(n.assignedStudents) ? n.assignedStudents : []
        if (!assigned.includes(selectedDancerFilter) && n.studentId !== selectedDancerFilter) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const inTitle = (n.title || '').toLowerCase().includes(q)
        const inContent = (n.content || '').toLowerCase().includes(q)
        const inAuthor = (n.authorName || '').toLowerCase().includes(q)
        if (!inTitle && !inContent && !inAuthor) return false
      }
      return true
    })
  }, [notes, selectedDancerFilter, searchQuery])

  return (
    <div>
      {filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(212,166,74,0.2)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ color: '#a8a39a', marginBottom: '1rem', fontSize: '0.9rem' }}>
            ნოუთები და ჩანაწერები ჯერ არ არის დამატებული
          </div>
          <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={onAddNote}>
            + პირველი ნოუთის დამატება
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
          {filteredNotes.map(note => {
            const theme = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0]
            const assignees = Array.isArray(note.assignedStudents) ? note.assignedStudents : []

            return (
              <div
                key={note.id}
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    {note.pinned && <span style={{ marginRight: '6px' }}>📌</span>}
                    {note.title || 'უსათაურო ნოუთი'}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onTogglePin(note)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: note.pinned ? '#d4a64a' : '#8a847a', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      title={note.pinned ? 'მიმაგრების მოხსნა' : 'თავში მიმაგრება'}
                    >
                      📌
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditNote(note)}
                      style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      ✏
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      style={{ background: 'rgba(220,53,69,0.15)', border: 'none', color: '#ff6b7b', padding: '4px 7px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.86rem', color: '#e6e1d6', whiteSpace: 'pre-line', lineHeight: 1.55, flex: 1 }}>
                  {note.content}
                </div>

                {assignees.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {assignees.map(sid => (
                      <span key={sid} style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'rgba(0,0,0,0.35)',
                        border: `1px solid ${theme.border}`,
                        color: theme.accent
                      }}>
                        👤 {studentMap[String(sid)]?.name || 'მოცეკვავე'}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.7rem',
                  color: '#8a847a',
                  paddingTop: '0.45rem',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <span>✍️ {note.authorName || 'მწვრთნელი'} {note.authorRole === 'dancer' ? '(მოცეკვავე)' : ''}</span>
                  <span>{formatDateTime(note.updatedAt || note.createdAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
   MODAL 1: CREATE / EDIT TASK FORM MODAL
   ============================================================================ */
function TaskFormModal({ initialTask, students, syncing, onClose, onSave }) {
  const isNew = !initialTask?.id
  const [form, setForm] = useState({
    id: initialTask?.id || '',
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    category: initialTask?.category || 'latin',
    priority: initialTask?.priority || 'medium',
    status: initialTask?.status || 'todo',
    dueDate: initialTask?.dueDate || '',
    assignedStudents: Array.isArray(initialTask?.assignedStudents) ? initialTask.assignedStudents : [],
    checklist: Array.isArray(initialTask?.checklist) ? initialTask.checklist : [],
    assigneeProgress: initialTask?.assigneeProgress || {},
    comments: initialTask?.comments || []
  })
  const [newCheckItem, setNewCheckItem] = useState('')
  const [dancerSearch, setDancerSearch] = useState('')
  const [notifyImmediately, setNotifyImmediately] = useState(false)

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return
    setField('checklist', [
      ...form.checklist,
      { id: 'chk_' + Math.random().toString(36).slice(2, 9), text: newCheckItem.trim() }
    ])
    setNewCheckItem('')
  }

  const handleRemoveCheckItem = (id) => {
    setField('checklist', form.checklist.filter(c => c.id !== id))
  }

  const toggleStudent = (sid) => {
    const exists = form.assignedStudents.includes(sid)
    if (exists) {
      setField('assignedStudents', form.assignedStudents.filter(id => id !== sid))
    } else {
      setField('assignedStudents', [...form.assignedStudents, sid])
    }
  }

  const selectByClass = (clsName) => {
    const matchingIds = students.filter(s => (s.classification || 'N კლასი') === clsName).map(s => s.id)
    const combined = Array.from(new Set([...form.assignedStudents, ...matchingIds]))
    setField('assignedStudents', combined)
  }

  const filteredStudents = useMemo(() => {
    return [...students]
      .filter(s => {
        if (!dancerSearch.trim()) return true
        const q = dancerSearch.toLowerCase()
        return (s.name || '').toLowerCase().includes(q) || (s.classification || '').toLowerCase().includes(q)
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
  }, [students, dancerSearch])

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <span className="admin-modal__title">{isNew ? '📋 ახალი თასქის შექმნა' : '✏ თასქის რედაქტირება'}</span>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-field">
            <label>თასქის სათაური *</label>
            <input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="მაგ: ჩა-ჩა-ჩას ფინალური რუტინის დამუშავება"
            />
          </div>

          <div className="admin-field">
            <label>დეტალური აღწერა / მწვრთნელის ინსტრუქცია</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="ჩაწერეთ რა დეტალებზე გაამახვილონ ყურადღება..."
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label>კატეგორია</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}>
                {TASK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>პრიორიტეტი</label>
              <select value={form.priority} onChange={e => setField('priority', e.target.value)}>
                {TASK_PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>Trello სვეტი (სტატუსი)</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)}>
                {BOARD_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label>დედლაინი (სურვილისამებრ)</label>
              <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} />
            </div>
          </div>

          {/* Checklist Builder */}
          <div className="admin-field" style={{ marginTop: '0.5rem' }}>
            <label>☑ ქვე-დავალებები (Checklist — მოცეკვავეები მონიშნავენ შესრულებისას)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <input
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCheckItem() } }}
                placeholder="მაგ: 15 წუთი სარკესთან Time Step-ის გამეორება..."
              />
              <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={handleAddCheckItem}>
                + დამატება
              </button>
            </div>
            {form.checklist.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(255,255,255,0.02)', padding: '0.65rem', borderRadius: '8px' }}>
                {form.checklist.map((item, idx) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: '#e6e1d6' }}>
                    <span>{idx + 1}. ☐ {item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ff6b7b', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign Dancers (1 or Multiple) */}
          <div className="admin-field" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>👥 აირჩიეთ მოცეკვავე (1 ან რამდენიმე): <strong style={{ color: '#d4a64a' }}>{form.assignedStudents.length} არჩეული</strong></label>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ padding: '3px 8px', fontSize: '0.7rem' }} onClick={() => setField('assignedStudents', students.map(s => s.id))}>
                  ყველას მონიშვნა
                </button>
                {['N კლასი', 'B კლასი', 'A კლასი'].map(cls => (
                  <button key={cls} type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ padding: '3px 8px', fontSize: '0.7rem' }} onClick={() => selectByClass(cls)}>
                    + {cls}
                  </button>
                ))}
                <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" style={{ padding: '3px 8px', fontSize: '0.7rem', color: '#ff6b7b' }} onClick={() => setField('assignedStudents', [])}>
                  გასუფთავება
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="🔍 მოძებნეთ მოცეკვავე..."
              value={dancerSearch}
              onChange={e => setDancerSearch(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />

            <div style={{
              maxHeight: '190px',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.4rem',
              background: '#0e0d0c'
            }}>
              {filteredStudents.map(s => {
                const checked = form.assignedStudents.includes(s.id)
                return (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: checked ? 'rgba(212,166,74,0.16)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${checked ? 'rgba(212,166,74,0.45)' : 'rgba(255,255,255,0.05)'}`,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: checked ? '#fff' : '#b8b2a8'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(s.id)}
                      style={{ accentColor: '#d4a64a' }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <label className="admin-checkbox" style={{ marginTop: '1rem', color: '#d4a64a' }}>
            <input
              type="checkbox"
              checked={notifyImmediately}
              onChange={e => setNotifyImmediately(e.target.checked)}
            />
            შენახვისთანავე გავხსნა მეილზე / SMS-ზე გაგზავნის ფანჯარა
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              გაუქმება
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--gold"
              disabled={syncing || !form.title.trim()}
              onClick={() => onSave(form, notifyImmediately)}
            >
              {syncing ? 'ინახება...' : '💾 თასქის შენახვა'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   MODAL 2: TASK DETAILS, INDIVIDUAL DANCER PROGRESS & COMMENTS/NOTES
   ============================================================================ */
function TaskDetailModal({
  task,
  studentMap,
  syncing,
  onClose,
  onEdit,
  onNotify,
  onMoveStatus,
  onToggleChecklist,
  onAddComment,
  onCopyLink
}) {
  const [commentInput, setCommentInput] = useState('')
  const catObj = TASK_CATEGORIES.find(c => c.id === task.category) || TASK_CATEGORIES[5]
  const prioObj = TASK_PRIORITIES.find(p => p.id === task.priority) || TASK_PRIORITIES[1]
  const assignees = Array.isArray(task.assignedStudents) ? task.assignedStudents : []
  const checklist = Array.isArray(task.checklist) ? task.checklist : []
  const comments = Array.isArray(task.comments) ? task.comments : []

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: catObj.bg, color: catObj.color, fontWeight: 600 }}>
              {catObj.label}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: prioObj.bg, color: prioObj.color, fontWeight: 600 }}>
              {prioObj.label}
            </span>
            {task.dueDate && (
              <span style={{ fontSize: '0.75rem', color: '#a8a39a' }}>📅 დედლაინი: {formatShortDate(task.dueDate)}</span>
            )}
          </div>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal__body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '1.35rem' }}>{task.title}</h2>
              {task.description && (
                <p style={{ margin: 0, color: '#c4beb4', fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                  {task.description}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={onNotify}>
                ✉️ მეილზე / SMS გაგზავნა
              </button>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => onCopyLink(task.id)}>
                🔗 ბმული
              </button>
              <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onEdit}>
                ✏ რედაქტირება
              </button>
            </div>
          </div>

          {/* Individual Dancer Progress Breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(212,166,74,0.2)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontWeight: 700, color: '#d4a64a', fontSize: '0.88rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              👥 მოცეკვავეების შესრულების სტატუსი ({assignees.length})
            </div>

            {assignees.length === 0 ? (
              <div style={{ color: '#8a847a', fontSize: '0.84rem' }}>კონკრეტული მოცეკვავე არ არის მინიჭებული (ზოგადი თასქი).</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assignees.map(sid => {
                  const st = studentMap[String(sid)]
                  const stName = st ? st.name : (task.assigneeProgress?.[sid]?.studentName || 'მოცეკვავე')
                  const prog = task.assigneeProgress?.[sid] || { status: 'todo', checkedItems: [], dancerNote: '' }
                  const pStatus = prog.status || 'todo'
                  const checkedItems = Array.isArray(prog.checkedItems) ? prog.checkedItems : []

                  return (
                    <div
                      key={sid}
                      style={{
                        background: '#121110',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        padding: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <strong style={{ color: '#fff', fontSize: '0.92rem' }}>👤 {stName}</strong>
                          {prog.updatedAt && (
                            <span style={{ fontSize: '0.72rem', color: '#7a756c' }}>განახლდა: {formatDateTime(prog.updatedAt)}</span>
                          )}
                        </div>

                        {/* Status Switcher for this specific dancer */}
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {BOARD_COLUMNS.map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => onMoveStatus(task, c.id, sid)}
                              style={{
                                padding: '4px 9px',
                                borderRadius: '6px',
                                border: pStatus === c.id ? `1px solid ${c.color}` : '1px solid rgba(255,255,255,0.08)',
                                background: pStatus === c.id ? 'rgba(212,166,74,0.18)' : 'transparent',
                                color: pStatus === c.id ? c.color : '#8a847a',
                                fontSize: '0.73rem',
                                fontWeight: pStatus === c.id ? 700 : 500,
                                cursor: 'pointer'
                              }}
                            >
                              {c.icon} {c.title}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => onCopyLink(task.id, sid)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#d4a64a', padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', cursor: 'pointer' }}
                            title="ამ მოცეკვავის პერსონალური ბმულის კოპირება"
                          >
                            🔗 ბმული
                          </button>
                        </div>
                      </div>

                      {/* Dancer's personal checklist items */}
                      {checklist.length > 0 && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                          {checklist.map(item => {
                            const isChecked = checkedItems.includes(item.id)
                            return (
                              <label
                                key={item.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  background: isChecked ? 'rgba(80,200,120,0.12)' : 'rgba(255,255,255,0.03)',
                                  border: `1px solid ${isChecked ? 'rgba(80,200,120,0.35)' : 'rgba(255,255,255,0.08)'}`,
                                  fontSize: '0.76rem',
                                  color: isChecked ? '#50c878' : '#b8b2a8',
                                  cursor: 'pointer',
                                  textDecoration: isChecked ? 'line-through' : 'none'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => onToggleChecklist(task, item.id, sid)}
                                  style={{ accentColor: '#50c878' }}
                                />
                                {item.text}
                              </label>
                            )
                          })}
                        </div>
                      )}

                      {/* Dancer's personal note */}
                      {prog.dancerNote && (
                        <div style={{
                          marginTop: '0.55rem',
                          padding: '6px 10px',
                          background: 'rgba(212,166,74,0.08)',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          color: '#e6e1d6'
                        }}>
                          📝 <strong>მოცეკვავის ჩანაწერი:</strong> {prog.dancerNote}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Task Comments / Notes Thread */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '1rem'
          }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
              💬 თასქის ნოუთები & კომენტარები ({comments.length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '0.85rem' }}>
              {comments.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#6b665e' }}>ჯერ კომენტარი ან ნოუთი არ დაწერილა.</div>
              ) : (
                comments.map(c => (
                  <div
                    key={c.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: c.authorRole === 'admin' ? 'rgba(212,166,74,0.1)' : 'rgba(111,195,224,0.1)',
                      borderLeft: `3px solid ${c.authorRole === 'admin' ? '#d4a64a' : '#6fc3e0'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a8a39a', marginBottom: '3px' }}>
                      <strong style={{ color: c.authorRole === 'admin' ? '#d4a64a' : '#6fc3e0' }}>{c.authorName}</strong>
                      <span>{formatDateTime(c.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#f5f1e8', whiteSpace: 'pre-line' }}>{c.text}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && commentInput.trim()) {
                    onAddComment(task.id, commentInput)
                    setCommentInput('')
                  }
                }}
                placeholder="დაუწერეთ შენიშვნა ან კომენტარი მოცეკვავეებს..."
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: '#0d0c0b',
                  border: '1px solid rgba(212,166,74,0.25)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="button"
                className="admin-btn admin-btn--gold admin-btn--sm"
                disabled={syncing || !commentInput.trim()}
                onClick={() => {
                  onAddComment(task.id, commentInput)
                  setCommentInput('')
                }}
              >
                დამატება
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   MODAL 3: SEND TASK TO DANCER(S) VIA EMAIL, GMAIL COMPOSER, OR SMS
   ============================================================================ */
function NotifyTaskModal({ task, students, setStudents, studentMap, onClose, showAlert }) {
  const assignees = Array.isArray(task.assignedStudents) && task.assignedStudents.length > 0
    ? task.assignedStudents
    : []

  const [selectedRecipients, setSelectedRecipients] = useState(assignees)
  const [emailEdits, setEmailEdits] = useState(() => {
    const map = {}
    students.forEach(s => { map[s.id] = s.email || '' })
    return map
  })
  const [customMessage, setCustomMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingSms, setSendingSms] = useState(false)
  const [statusLog, setStatusLog] = useState([])

  const getDirectUrl = (sid = '') => {
    return `${window.location.origin}/tasks?task=${encodeURIComponent(task.id)}${sid ? `&student=${encodeURIComponent(sid)}` : ''}`
  }

  const handleSaveRecipientEmail = async (sid) => {
    const st = studentMap[String(sid)]
    if (!st) return
    const nextEmail = (emailEdits[sid] || '').trim()
    const updated = { ...st, email: nextEmail }
    saveStudent(updated)
    setStudents(prev => prev.map(x => x.id === sid ? updated : x))
    await syncStudentToCloud(updated)
  }

  // Send Automatic Email via FormSubmit AJAX
  const handleSendAutomaticEmails = async () => {
    const targets = selectedRecipients.filter(sid => (emailEdits[sid] || '').trim().includes('@'))
    if (targets.length === 0) {
      showAlert('გთხოვთ მიუთითოთ მინიმუმ ერთი მოცეკვავის ელ-ფოსტა (@).')
      return
    }

    setSendingEmail(true)
    const logs = []
    for (const sid of targets) {
      const st = studentMap[String(sid)]
      const email = (emailEdits[sid] || '').trim()
      if (st && email !== st.email) {
        await handleSaveRecipientEmail(sid)
      }
      const res = await sendTaskEmailNotification({
        toEmail: email,
        recipientName: st?.name || 'მოცეკვავე',
        task,
        directUrl: getDirectUrl(sid),
        customMessage
      })
      logs.push(`${st?.name || email}: ${res.success ? '✅ მეილი გაიგზავნა' : '⚠️ გაიგზავნა (FormSubmit დადასტურება შეიძლება დასჭირდეს პირველ ჯერზე)'}`)
    }
    setStatusLog(logs)
    setSendingEmail(false)
  }

  // Open Gmail Web Composer with all recipient emails, task checklist & direct link
  const handleOpenGmailCompose = async () => {
    const emails = []
    for (const sid of selectedRecipients) {
      const e = (emailEdits[sid] || '').trim()
      if (e.includes('@')) {
        emails.push(e)
        const st = studentMap[String(sid)]
        if (st && e !== st.email) {
          handleSaveRecipientEmail(sid)
        }
      }
    }

    const checklistLines = Array.isArray(task.checklist) && task.checklist.length > 0
      ? '\nქვე-დავალებები:\n' + task.checklist.map((c, i) => `${i + 1}. ☐ ${c.text}`).join('\n') + '\n'
      : ''

    const singleSid = selectedRecipients.length === 1 ? selectedRecipients[0] : ''
    const link = getDirectUrl(singleSid)

    const subject = `📋 დავალება (ST Dance Studio): ${task.title}`
    const body = `გამარჯობა!\n\nგიგზავნით ახალ დავალებას ST Dance Studio-დან:\n\n📌 დავალება: ${task.title}\n${task.description ? `📝 აღწერა: ${task.description}\n` : ''}${task.dueDate ? `📅 დედლაინი: ${formatShortDate(task.dueDate)}\n` : ''}${checklistLines}${customMessage ? `\n💬 მწვრთნელის კომენტარი: ${customMessage}\n` : ''}\n🔗 დავალების სანახავად და შესრულების მოსანიშნად გადადით ბმულზე:\n${link}\n\nპატივისცემით,\nST Dance Studio`

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emails.join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(gmailUrl, '_blank')
  }

  // Send SMS via GoSMS to selected recipients
  const handleSendSmsToRecipients = async () => {
    const targets = selectedRecipients
      .map(sid => studentMap[String(sid)])
      .filter(st => st && st.phone)

    if (targets.length === 0) {
      showAlert('არჩეულ მოცეკვავეებს ტელეფონის ნომერი არ აქვთ მითითებული.')
      return
    }

    setSendingSms(true)
    const logs = []
    for (const st of targets) {
      const link = getDirectUrl(st.id)
      const smsText = `ST Dance: ახალი თასქი "${task.title}".${customMessage ? ' ' + customMessage : ''} ნახეთ და მონიშნეთ შესრულება: ${link}`
      const res = await sendSms(st.phone, smsText)
      const ok = res && (res.success || res.messageId || res.status === 'success' || res.status === 'sent' || !res.error)
      logs.push(`${st.name} (${st.phone}): ${ok ? '✅ SMS გაიგზავნა' : '❌ SMS ვერ გაიგზავნა'}`)
    }
    setStatusLog(logs)
    setSendingSms(false)
  }

  const candidateStudents = assignees.length > 0
    ? assignees.map(sid => studentMap[String(sid)]).filter(Boolean)
    : students

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <span className="admin-modal__title">✉️ თასქის გაგზავნა მეილზე & SMS-ზე</span>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal__body">
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(212,166,74,0.08)',
            border: '1px solid rgba(212,166,74,0.25)',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: 700, color: '#d4a64a', fontSize: '0.95rem' }}>📋 {task.title}</div>
            {task.description && <div style={{ fontSize: '0.8rem', color: '#c4beb4', marginTop: '4px' }}>{task.description}</div>}
          </div>

          <div className="admin-field">
            <label>აირჩიეთ მიმღები მოცეკვავე(ები) და შეავსეთ/შეამოწმეთ Email:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', padding: '0.5rem', background: '#0e0d0c', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              {candidateStudents.map(st => {
                const isSelected = selectedRecipients.includes(st.id)
                return (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(212,166,74,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(212,166,74,0.35)' : 'rgba(255,255,255,0.05)'}`
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '160px', fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) setSelectedRecipients(prev => prev.filter(id => id !== st.id))
                          else setSelectedRecipients(prev => [...prev, st.id])
                        }}
                        style={{ accentColor: '#d4a64a' }}
                      />
                      <span>{st.name}</span>
                      {st.phone && <span style={{ fontSize: '0.72rem', color: '#8a847a', fontWeight: 400 }}>({st.phone})</span>}
                    </label>

                    <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '210px' }}>
                      <input
                        type="email"
                        placeholder=" ჩაწერეთ მოცეკვავის მეილი..."
                        value={emailEdits[st.id] ?? ''}
                        onChange={e => setEmailEdits(prev => ({ ...prev, [st.id]: e.target.value }))}
                        onBlur={() => handleSaveRecipientEmail(st.id)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: '#161514',
                          border: '1px solid rgba(212,166,74,0.25)',
                          borderRadius: '5px',
                          color: '#fff',
                          fontSize: '0.8rem'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="admin-field">
            <label>დამატებითი შეტყობინება (სურვილისამებრ)</label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder="მაგ: გთხოვთ პარასკევის რეპეტიციამდე გაიაროთ ყველა პუნქტი..."
            />
          </div>

          {statusLog.length > 0 && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(80,200,120,0.1)',
              border: '1px solid rgba(80,200,120,0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: '#e6e1d6',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {statusLog.map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              დახურვა
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={sendingSms || selectedRecipients.length === 0}
              onClick={handleSendSmsToRecipients}
              style={{ borderColor: 'rgba(80,200,120,0.4)', color: '#50c878' }}
            >
              {sendingSms ? 'იგზავნება SMS...' : '💬 SMS-ით გაგზავნა (GoSMS)'}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={selectedRecipients.length === 0}
              onClick={handleOpenGmailCompose}
              style={{ borderColor: 'rgba(111,195,224,0.4)', color: '#6fc3e0' }}
            >
              📧 Gmail-ით გაგზავნა
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--gold"
              disabled={sendingEmail || selectedRecipients.length === 0}
              onClick={handleSendAutomaticEmails}
            >
              {sendingEmail ? 'იგზავნება...' : '📨 მეილზე გაგზავნა'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   MODAL 4: CREATE / EDIT NOTE MODAL
   ============================================================================ */
function NoteFormModal({ initialNote, students, syncing, onClose, onSave }) {
  const isNew = !initialNote?.id
  const [form, setForm] = useState({
    id: initialNote?.id || '',
    title: initialNote?.title || '',
    content: initialNote?.content || '',
    color: initialNote?.color || 'gold',
    pinned: Boolean(initialNote?.pinned),
    assignedStudents: Array.isArray(initialNote?.assignedStudents) ? initialNote.assignedStudents : [],
    authorName: initialNote?.authorName || 'სერგი წივწივაძე (მწვრთნელი)',
    authorRole: initialNote?.authorRole || 'admin'
  })

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleStudent = (sid) => {
    const exists = form.assignedStudents.includes(sid)
    if (exists) setField('assignedStudents', form.assignedStudents.filter(id => id !== sid))
    else setField('assignedStudents', [...form.assignedStudents, sid])
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <span className="admin-modal__title">{isNew ? '📝 ახალი ნოუთი' : '✏ ნოუთის რედაქტირება'}</span>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-field">
            <label>სათაური</label>
            <input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="მაგ: ინდივიდუალური შენიშვნები ტურნირის წინ"
            />
          </div>

          <div className="admin-field">
            <label>ნოუთის ტექსტი *</label>
            <textarea
              rows={5}
              value={form.content}
              onChange={e => setField('content', e.target.value)}
              placeholder="ჩაწერეთ ნოუთი..."
            />
          </div>

          <div className="admin-field">
            <label>ბარათის ფერი</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {NOTE_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setField('color', c.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: form.color === c.id ? `2px solid ${c.accent}` : '1px solid rgba(255,255,255,0.12)',
                    background: c.bg,
                    color: c.accent,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-field">
            <label>რომელ მოცეკვავე(ებ)ს ეხება (სურვილისამებრ — გამოუჩნდებათ პორტალში):</label>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '0.35rem',
              background: '#0e0d0c'
            }}>
              {[...students].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka')).map(s => {
                const checked = form.assignedStudents.includes(s.id)
                return (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: checked ? 'rgba(212,166,74,0.16)' : 'transparent',
                      fontSize: '0.78rem',
                      color: checked ? '#fff' : '#a8a39a',
                      cursor: 'pointer'
                    }}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleStudent(s.id)} style={{ accentColor: '#d4a64a' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <label className="admin-checkbox" style={{ marginTop: '0.5rem' }}>
            <input type="checkbox" checked={form.pinned} onChange={e => setField('pinned', e.target.checked)} />
            📌 თავში მიმაგრება (Pin)
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>გაუქმება</button>
            <button
              type="button"
              className="admin-btn admin-btn--gold"
              disabled={syncing || !form.content.trim()}
              onClick={() => onSave(form)}
            >
              {syncing ? 'ინახება...' : '💾 ნოუთის შენახვა'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
