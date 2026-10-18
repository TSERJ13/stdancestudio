import React, { useState, useMemo } from 'react'
import {
  saveTask, deleteTask, saveTasksList,
  saveNote, deleteNote, saveNotesList,
  saveStudent, deleteStudent
} from '../../data/db'
import {
  syncTasksToCloud,
  syncSingleTaskProgressToCloud,
  saveSingleNoteToCloud,
  deleteSingleNoteFromCloud,
  sendTaskEmailNotification,
  sendSms,
  syncStudentToCloud,
  deleteStudentFromCloud,
  fetchCloudTasksAndNotes,
  fetchStudioData,
  clearCache
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
  { id: 'low',    label: 'დაბალი',      color: '#8b949e', bg: 'rgba(139,148,158,0.15)' },
  { id: 'medium', label: 'საშუალო',     color: '#d4a64a', bg: 'rgba(212,166,74,0.15)' },
  { id: 'high',   label: '⚡ მაღალი',   color: '#ff9800', bg: 'rgba(255,152,0,0.16)' },
  { id: 'urgent', label: '🔥 სასწრაფო', color: '#ff5252', bg: 'rgba(255,82,82,0.18)' },
]

export const BOARD_COLUMNS = [
  { id: 'todo',        title: 'შესასრულებელი', sub: 'To Do',       color: '#a8a39a', border: 'rgba(255,255,255,0.14)', icon: '📋' },
  { id: 'in_progress', title: 'პროცესშია',     sub: 'In Progress', color: '#d4a64a', border: 'rgba(212,166,74,0.38)',  icon: '⚡' },
  { id: 'done',        title: 'შესრულებული',   sub: 'Done',        color: '#50c878', border: 'rgba(80,200,120,0.38)',  icon: '✅' },
]

export const NOTE_COLORS = [
  { id: 'gold',    label: 'ოქროსფერი', border: 'rgba(212,166,74,0.4)',  bg: 'linear-gradient(145deg, rgba(212,166,74,0.12), rgba(20,18,15,0.95))', accent: '#d4a64a' },
  { id: 'emerald', label: 'მწვანე',    border: 'rgba(80,200,120,0.4)',  bg: 'linear-gradient(145deg, rgba(80,200,120,0.12), rgba(15,22,18,0.95))', accent: '#50c878' },
  { id: 'blue',    label: 'ლურჯი',     border: 'rgba(111,195,224,0.4)', bg: 'linear-gradient(145deg, rgba(111,195,224,0.12), rgba(15,20,24,0.95))', accent: '#6fc3e0' },
  { id: 'purple',  label: 'იისფერი',   border: 'rgba(184,123,222,0.4)', bg: 'linear-gradient(145deg, rgba(184,123,222,0.12), rgba(20,16,24,0.95))', accent: '#b87bde' },
  { id: 'rose',    label: 'წითელი',    border: 'rgba(255,107,123,0.4)', bg: 'linear-gradient(145deg, rgba(255,107,123,0.12), rgba(24,15,17,0.95))', accent: '#ff6b7b' },
]

const CLASSES = ['N კლასი', 'E კლასი', 'D კლასი', 'C კლასი', 'B კლასი', 'A კლასი', 'S კლასი', 'Hobby']

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
  // Selected dancers in Step 1 (can be 1 or multiple)
  const [selectedDancers, setSelectedDancers] = useState([])
  const [filterBoardBySelected, setFilterBoardBySelected] = useState(false)
  const [dancerSearch, setDancerSearch] = useState('')
  const [showDancerPicker, setShowDancerPicker] = useState(true)

  // Quick Add / Edit Dancer Modal or Inline Form
  const [dancerModal, setDancerModal] = useState(null) // null | { id?, name, phone, email, classification, birthYear }

  // Main Sub-view: 'board' | 'dancers' | 'notes'
  const [subView, setSubView] = useState('board')
  const [taskSearch, setTaskSearch] = useState('')
  const [syncing, setSyncing] = useState(false)

  // Drag & Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  // Modals state
  const [taskFormModal, setTaskFormModal] = useState(null) // null or task object
  const [activeTaskDetail, setActiveTaskDetail] = useState(null) // task id
  const [notifyTaskModal, setNotifyTaskModal] = useState(null) // task object
  const [noteFormModal, setNoteFormModal] = useState(null) // note object

  // Student map for fast lookup
  const studentMap = useMemo(() => {
    const map = {}
    students.forEach(s => { map[String(s.id)] = s })
    return map
  }, [students])

  // Sorted & filtered dancers for Step 1
  const filteredDancersList = useMemo(() => {
    const q = dancerSearch.trim().toLowerCase()
    return [...students]
      .filter(s => {
        if (!q) return true
        return (
          (s.name || '').toLowerCase().includes(q) ||
          (s.phone || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.classification || '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
  }, [students, dancerSearch])

  // Toggle dancer selection in Step 1
  const toggleSelectDancer = (sid) => {
    const idStr = String(sid)
    setSelectedDancers(prev =>
      prev.includes(idStr) ? prev.filter(x => x !== idStr) : [...prev, idStr]
    )
  }

  // Add or Edit Dancer directly from Tasks page
  const handleSaveDancer = async (dancerData) => {
    if (!dancerData.name || !dancerData.name.trim()) {
      showAlert('გთხოვთ შეიყვანოთ მოცეკვავის სახელი და გვარი.')
      return
    }
    setSyncing(true)
    try {
      const isNew = !dancerData.id
      const sid = dancerData.id || ('ST_' + Math.random().toString(36).slice(2, 9).toUpperCase())
      const studentObj = {
        id: sid,
        name: dancerData.name.trim(),
        phone: (dancerData.phone || '').trim(),
        email: (dancerData.email || '').trim(),
        classification: dancerData.classification || 'N კლასი',
        birthYear: Number(dancerData.birthYear) || 2012,
        language: dancerData.language || 'ka',
        active: true
      }

      saveStudent(studentObj)
      setStudents(prev => {
        const exists = prev.some(s => String(s.id) === String(sid))
        if (exists) return prev.map(s => String(s.id) === String(sid) ? { ...s, ...studentObj } : s)
        return [studentObj, ...prev]
      })

      // Auto-select newly added dancer for task creation!
      if (isNew) {
        setSelectedDancers(prev => prev.includes(String(sid)) ? prev : [...prev, String(sid)])
      }

      setDancerModal(null)
      await syncStudentToCloud(studentObj)
    } catch (e) {
      console.error('Error saving dancer:', e)
      showAlert('მოცეკვავის შენახვისას დაფიქსირდა შეცდომა.')
    } finally {
      setSyncing(false)
    }
  }

  // Delete Dancer
  const handleDeleteDancer = (sid, name) => {
    showConfirm(`დარწმუნებული ხართ, რომ გსურთ მოცეკვავის (${name}) წაშლა?`, async () => {
      setSyncing(true)
      try {
        deleteStudent(sid)
        setStudents(prev => prev.filter(s => String(s.id) !== String(sid)))
        setSelectedDancers(prev => prev.filter(id => id !== String(sid)))
        await deleteStudentFromCloud(sid)
      } finally {
        setSyncing(false)
      }
    })
  }

  // Live refresh from Cloud
  const handleLiveRefresh = async () => {
    setSyncing(true)
    try {
      clearCache()
      const [studioData, fresh] = await Promise.all([
        fetchStudioData().catch(() => null),
        fetchCloudTasksAndNotes().catch(() => null)
      ])
      if (studioData && Array.isArray(studioData.students) && studioData.students.length > 0) {
        setStudents(studioData.students.map(s => ({
          id: String(s.id),
          name: s.full_name || s.name || 'Student',
          phone: s.phone || s.data?.phone || '',
          email: s.email || s.data?.email || '',
          classification: s.classification || s.data?.dance_class || 'N კლასი',
          birthYear: s.data?.birth_date ? new Date(s.data.birth_date).getFullYear() : (s.birthYear || 2012),
          photo: s.data?.photo_url || s.photo || '',
          language: s.language || s.data?.language || 'ka',
          active: s.status === 'active' || !s.status
        })))
      }
      if (fresh) {
        if (Array.isArray(fresh.tasks)) {
          saveTasksList(fresh.tasks)
          setTasks(fresh.tasks)
        }
        if (Array.isArray(fresh.notes)) {
          saveNotesList(fresh.notes)
          setNotes(fresh.notes)
        }
      }
    } finally {
      setSyncing(false)
    }
  }

  // Save or update a task and sync to cloud
  const handleSaveTask = async (taskData, openNotifyAfter = false) => {
    setSyncing(true)
    try {
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

  // Move task between columns (either overall or for a specific dancer)
  const handleMoveTaskStatus = async (task, newStatus, specificStudentId = null) => {
    const targetStudentId = specificStudentId || (filterBoardBySelected && selectedDancers.length === 1 ? selectedDancers[0] : null)
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
          saveTask({ ...target, comments: nextComments })
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
      if (filterBoardBySelected && selectedDancers.length > 0) {
        const assigned = Array.isArray(t.assignedStudents) ? t.assignedStudents.map(String) : []
        const hasMatch = selectedDancers.some(sid => assigned.includes(String(sid)))
        if (!hasMatch) return false
      }
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase()
        const matchTitle = (t.title || '').toLowerCase().includes(q)
        const matchDesc = (t.description || '').toLowerCase().includes(q)
        const matchDancer = (t.assignedStudents || []).some(sid =>
          (studentMap[String(sid)]?.name || '').toLowerCase().includes(q)
        )
        if (!matchTitle && !matchDesc && !matchDancer) return false
      }
      return true
    })
  }, [tasks, filterBoardBySelected, selectedDancers, taskSearch, studentMap])

  const getEffectiveStatus = (task) => {
    if (filterBoardBySelected && selectedDancers.length === 1) {
      const sid = selectedDancers[0]
      return task.assigneeProgress?.[sid]?.status || task.status || 'todo'
    }
    return task.status || 'todo'
  }

  const detailTaskObj = useMemo(
    () => tasks.find(t => t.id === activeTaskDetail) || null,
    [tasks, activeTaskDetail]
  )

  const copyDirectLink = (taskId, studentId = '') => {
    const url = `${window.location.origin}/tasks?task=${encodeURIComponent(taskId)}${studentId ? `&student=${encodeURIComponent(studentId)}` : ''}`
    navigator.clipboard?.writeText(url)
    showAlert(`პირდაპირი ბმული დაკოპირებულია!\n\n${url}`)
  }

  const openNewTaskForSelected = (defaultCol = 'todo') => {
    setTaskFormModal({
      title: '',
      description: '',
      category: 'latin',
      priority: 'medium',
      status: defaultCol,
      dueDate: '',
      assignedStudents: [...selectedDancers],
      checklist: []
    })
  }

  return (
    <div>
      {/* =====================================================================
          STEP 1: SELECT OR ADD DANCERS & CREATE TASK FOR THEM
          ===================================================================== */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(25,23,20,0.98), rgba(16,15,13,0.98))',
        border: '1px solid rgba(212,166,74,0.3)',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        {/* Step 1 Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: showDancerPicker ? '1rem' : 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#d4a64a',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.78rem',
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.04em'
            }}>
              ნაბიჯი 1
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.08rem', color: '#fff', fontWeight: 700 }}>
                აირჩიეთ მოცეკვავე (1 ან რამდენიმე) და შეუქმენით თასქი
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#9e988e', marginTop: '2px' }}>
                მონიშნეთ სასურველი მოცეკვავეები ქვემოთ ან დაამატეთ ახალი მოცეკვავე სიაში ({students.length} მოცეკვავე ბაზაში)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setDancerModal({ name: '', phone: '', email: '', classification: 'N კლასი', birthYear: 2012 })}
              style={{
                borderColor: 'rgba(80,200,120,0.5)',
                color: '#50c878',
                fontWeight: 700
              }}
            >
              ➕ მოცეკვავის დამატება
            </button>

            <button
              type="button"
              className="admin-btn admin-btn--gold admin-btn--sm"
              onClick={() => openNewTaskForSelected('todo')}
              style={{ fontWeight: 700, padding: '8px 16px' }}
            >
              📋 + თასქის შექმნა {selectedDancers.length > 0 ? `(${selectedDancers.length} მოცეკვავისთვის)` : ''}
            </button>

            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setShowDancerPicker(v => !v)}
              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
            >
              {showDancerPicker ? '▲ სიის დაკეცვა' : '▼ მოცეკვავეების სიის გაშლა'}
            </button>
          </div>
        </div>

        {showDancerPicker && (
          <>
            {/* Search & Bulk Select Controls */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem'
            }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
                <input
                  type="text"
                  placeholder="🔍 მოძებნეთ მოცეკვავე სახელით, ნომრით ან მეილით..."
                  value={dancerSearch}
                  onChange={e => setDancerSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    background: '#0d0c0b',
                    border: '1px solid rgba(212,166,74,0.28)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                {dancerSearch && (
                  <button
                    type="button"
                    onClick={() => setDancerSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff6b7b', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  onClick={() => setSelectedDancers(filteredDancersList.map(s => String(s.id)))}
                >
                  ✓ ყველას მონიშვნა ({filteredDancersList.length})
                </button>
                {selectedDancers.length > 0 && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ fontSize: '0.75rem', padding: '5px 10px', color: '#ff6b7b' }}
                    onClick={() => {
                      setSelectedDancers([])
                      setFilterBoardBySelected(false)
                    }}
                  >
                    ✕ მონიშვნის გასუფთავება ({selectedDancers.length})
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  onClick={handleLiveRefresh}
                  disabled={syncing}
                >
                  {syncing ? '⏳...' : '🔄 განახლება'}
                </button>
              </div>
            </div>

            {/* Selectable Dancer Grid */}
            {filteredDancersList.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                border: '1px dashed rgba(255,255,255,0.1)',
                color: '#8a847a'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>მოცეკვავე ვერ მოიძებნა</div>
                <button
                  type="button"
                  className="admin-btn admin-btn--gold admin-btn--sm"
                  onClick={() => setDancerModal({ name: dancerSearch, phone: '', email: '', classification: 'N კლასი', birthYear: 2012 })}
                >
                  ➕ დაამატეთ „{dancerSearch || 'ახალი მოცეკვავე'}“
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))',
                gap: '0.55rem',
                maxHeight: '250px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: '#0c0b0a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px'
              }}>
                {filteredDancersList.map(st => {
                  const sid = String(st.id)
                  const isSelected = selectedDancers.includes(sid)
                  const dancerTasks = tasks.filter(t => (t.assignedStudents || []).map(String).includes(sid))
                  const activeCount = dancerTasks.filter(t => (t.assigneeProgress?.[sid]?.status || t.status || 'todo') !== 'done').length

                  return (
                    <div
                      key={sid}
                      onClick={() => toggleSelectDancer(sid)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(212,166,74,0.18)' : 'rgba(255,255,255,0.025)',
                        border: `1px solid ${isSelected ? '#d4a64a' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ accentColor: '#d4a64a', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: isSelected ? '#fff' : '#e6e1d6',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {st.name}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: st.email ? '#d4a64a' : '#7a756c',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {st.email || st.phone || st.classification || 'N კლასი'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        {activeCount > 0 && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: 'rgba(212,166,74,0.2)',
                            color: '#d4a64a'
                          }} title="აქტიური თასქები">
                            {activeCount}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setDancerModal({
                            id: st.id,
                            name: st.name,
                            phone: st.phone || '',
                            email: st.email || '',
                            classification: st.classification || 'N კლასი',
                            birthYear: st.birthYear || 2012,
                            language: st.language || 'ka'
                          })}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#a8a39a',
                            borderRadius: '5px',
                            padding: '3px 6px',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}
                          title="მოცეკვავის რედაქტირება / მეილის დამატება"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Selected Dancers Action Bar (Step 2 Trigger) */}
        {selectedDancers.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '0.9rem 1.1rem',
            background: 'rgba(212,166,74,0.12)',
            border: '1px solid rgba(212,166,74,0.45)',
            borderRadius: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', flex: 1 }}>
              <span style={{
                background: '#d4a64a',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.74rem',
                padding: '3px 9px',
                borderRadius: '20px'
              }}>
                ნაბიჯი 2
              </span>
              <span style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 700 }}>
                არჩეულია ({selectedDancers.length}):
              </span>
              {selectedDancers.slice(0, 8).map(sid => {
                const st = studentMap[String(sid)]
                if (!st) return null
                return (
                  <span
                    key={sid}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 9px',
                      borderRadius: '20px',
                      background: '#191715',
                      border: '1px solid rgba(212,166,74,0.4)',
                      color: '#f5f1e8',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                  >
                    👤 {st.name}
                    <button
                      type="button"
                      onClick={() => toggleSelectDancer(sid)}
                      style={{ background: 'none', border: 'none', color: '#ff6b7b', cursor: 'pointer', padding: 0, fontSize: '0.8rem' }}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
              {selectedDancers.length > 8 && (
                <span style={{ fontSize: '0.78rem', color: '#d4a64a', fontWeight: 600 }}>
                  +{selectedDancers.length - 8} სხვა
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="admin-btn admin-btn--gold admin-btn--sm"
                onClick={() => openNewTaskForSelected('todo')}
                style={{ fontWeight: 700, padding: '8px 16px' }}
              >
                📋 + შეუქმენით თასქი არჩეულებს
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => setNoteFormModal({
                  title: '',
                  content: '',
                  color: 'gold',
                  pinned: false,
                  assignedStudents: [...selectedDancers]
                })}
                style={{ borderColor: 'rgba(111,195,224,0.45)', color: '#6fc3e0' }}
              >
                📝 + დაუწერეთ ნოუთი
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--sm"
                onClick={() => setFilterBoardBySelected(v => !v)}
                style={{
                  background: filterBoardBySelected ? 'rgba(212,166,74,0.2)' : 'transparent',
                  borderColor: filterBoardBySelected ? '#d4a64a' : 'rgba(255,255,255,0.15)',
                  color: filterBoardBySelected ? '#d4a64a' : '#ccc'
                }}
              >
                {filterBoardBySelected ? '✓ ნაჩვენებია მხოლოდ არჩეულების დაფა' : '🔍 მხოლოდ არჩეულების თასქების ჩვენება'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          STEP 2 / NAVIGATION: TRELLO BOARD | WHO'S DOING WHAT | NOTES
          ===================================================================== */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.15rem'
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', background: '#11100f', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSubView('board')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: subView === 'board' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'board' ? '#000' : '#a8a39a'
            }}
          >
            📋 Trello დაფა ({filteredTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('dancers')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: subView === 'dancers' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'dancers' ? '#000' : '#a8a39a'
            }}
          >
            👥 ვინ რას აკეთებს ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('notes')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              background: subView === 'notes' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subView === 'notes' ? '#000' : '#a8a39a'
            }}
          >
            📝 ნოუთები ({notes.length})
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 თასქის ძებნა..."
            value={taskSearch}
            onChange={e => setTaskSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(212,166,74,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.83rem',
              minWidth: '200px',
              outline: 'none'
            }}
          />
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setNoteFormModal({
              title: '',
              content: '',
              color: 'gold',
              pinned: false,
              assignedStudents: [...selectedDancers]
            })}
            style={{ borderColor: 'rgba(111,195,224,0.4)', color: '#6fc3e0' }}
          >
            + ახალი ნოუთი
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--gold admin-btn--sm"
            onClick={() => openNewTaskForSelected('todo')}
          >
            + ახალი თასქი
          </button>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: TRELLO KANBAN BOARD (3 COLUMNS)
          ===================================================================== */}
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
                  minHeight: '440px',
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
                      onClick={() => openNewTaskForSelected(col.id)}
                      style={{
                        background: 'rgba(212,166,74,0.14)',
                        border: '1px solid rgba(212,166,74,0.35)',
                        color: '#d4a64a',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    >
                      + დამატება
                    </button>
                  </div>
                </div>

                {/* Column Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colTasks.length === 0 && (
                    <div style={{
                      padding: '2.2rem 1rem',
                      textAlign: 'center',
                      color: '#6b665e',
                      fontSize: '0.82rem',
                      border: '1px dashed rgba(255,255,255,0.07)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ marginBottom: '0.6rem' }}>ამ სვეტში თასქები არ არის</div>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => openNewTaskForSelected(col.id)}
                      >
                        + თასქის დამატება
                      </button>
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
                          cursor: 'grab'
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
                            fontSize: '0.98rem',
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
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {task.description}
                          </div>
                        )}

                        {/* Checklist Summary */}
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
                              გახსნა →
                            </button>
                          </div>
                        )}

                        {/* Assigned Dancers with Individual Statuses */}
                        <div style={{ marginBottom: '0.7rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.68rem', color: '#8a847a', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                              👥 მოცეკვავეები ({assignees.length || 'ყველა'})
                            </span>
                            {assignees.length > 0 && (
                              <span style={{ fontSize: '0.7rem', color: doneAssigneesCount === assignees.length ? '#50c878' : '#d4a64a', fontWeight: 700 }}>
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
                              <span style={{ fontSize: '0.74rem', color: '#8a847a' }}>ყველა მოცეკვავისთვის</span>
                            ) : (
                              assignees.map(sid => {
                                const st = studentMap[String(sid)]
                                const stName = st ? st.name : (task.assigneeProgress?.[sid]?.studentName || 'მოცეკვავე')
                                const dStatus = task.assigneeProgress?.[sid]?.status || 'todo'
                                const statusColor = dStatus === 'done' ? '#50c878' : dStatus === 'in_progress' ? '#d4a64a' : '#8a847a'
                                const statusIcon = dStatus === 'done' ? '✅' : dStatus === 'in_progress' ? '⚡' : '⏳'

                                return (
                                  <span
                                    key={sid}
                                    onClick={() => setActiveTaskDetail(task.id)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.73rem',
                                      padding: '3px 8px',
                                      borderRadius: '20px',
                                      background: 'rgba(255,255,255,0.04)',
                                      border: `1px solid ${dStatus === 'done' ? 'rgba(80,200,120,0.4)' : dStatus === 'in_progress' ? 'rgba(212,166,74,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                      color: '#e8e4dc',
                                      cursor: 'pointer'
                                    }}
                                    title={`${stName}: ${dStatus === 'done' ? 'შესრულებულია' : dStatus === 'in_progress' ? 'პროცესშია' : 'შესასრულებელი'}`}
                                  >
                                    <span style={{ color: statusColor }}>{statusIcon}</span>
                                    <span>{stName}</span>
                                  </span>
                                )
                              })
                            )}
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '0.6rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          gap: '0.35rem',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {BOARD_COLUMNS.filter(c => c.id !== col.id).map(targetCol => (
                              <button
                                key={targetCol.id}
                                type="button"
                                onClick={() => handleMoveTaskStatus(task, targetCol.id)}
                                style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.09)',
                                  color: targetCol.color,
                                  fontSize: '0.68rem',
                                  padding: '3px 7px',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                              >
                                {targetCol.icon} {targetCol.title}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setNotifyTaskModal(task)}
                              style={{
                                background: 'rgba(212,166,74,0.16)',
                                border: '1px solid rgba(212,166,74,0.4)',
                                color: '#d4a64a',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '4px 9px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              title="მეილზე ან SMS-ით გაგზავნა"
                            >
                              ✉️ გაგზავნა
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTaskDetail(task.id)}
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: comments.length > 0 ? '#6fc3e0' : '#a8a39a',
                                fontSize: '0.72rem',
                                padding: '4px 7px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              title="დეტალები და ნოუთები"
                            >
                              💬 {comments.length || ''}
                            </button>
                            <button
                              type="button"
                              onClick={() => setTaskFormModal(task)}
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: 'none',
                                color: '#a8a39a',
                                fontSize: '0.72rem',
                                padding: '4px 7px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
                              title="რედაქტირება"
                            >
                              ✏
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              style={{
                                background: 'rgba(255,82,82,0.1)',
                                border: 'none',
                                color: '#ff6b6b',
                                fontSize: '0.72rem',
                                padding: '4px 7px',
                                borderRadius: '5px',
                                cursor: 'pointer'
                              }}
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

      {/* =====================================================================
          VIEW 2: "WHO IS DOING WHAT" — DANCER ACTIVITY MATRIX
          ===================================================================== */}
      {subView === 'dancers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {filteredDancersList.map(dancer => {
            const sid = String(dancer.id)
            const dancerTasks = tasks.filter(t => (t.assignedStudents || []).map(String).includes(sid))
            const dancerNotes = notes.filter(n => (n.assignedStudents || []).map(String).includes(sid))

            const todoList = dancerTasks.filter(t => (t.assigneeProgress?.[sid]?.status || t.status || 'todo') === 'todo')
            const inProgList = dancerTasks.filter(t => (t.assigneeProgress?.[sid]?.status || t.status) === 'in_progress')
            const doneList = dancerTasks.filter(t => (t.assigneeProgress?.[sid]?.status || t.status) === 'done')

            return (
              <div
                key={sid}
                style={{
                  background: '#141311',
                  border: '1px solid rgba(212,166,74,0.18)',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingBottom: '0.8rem',
                  marginBottom: '0.8rem',
                  borderBottom: '1px solid rgba(255,255,255,0.07)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(212,166,74,0.18)',
                      border: '1px solid rgba(212,166,74,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#d4a64a',
                      fontSize: '1rem'
                    }}>
                      {(dancer.name || '?')[0]}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{dancer.name}</span>
                        <span className="badge badge--gold">{dancer.classification || 'N კლასი'}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#8a847a', marginTop: '2px' }}>
                        📞 {dancer.phone || '—'} &nbsp;|&nbsp; ✉️ {dancer.email || <span style={{ color: '#ff9800' }}>მეილი არ არის მითითებული</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: '#a8a39a' }}>
                      📋 შესასრულებელი: <strong>{todoList.length}</strong>
                    </span>
                    <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(212,166,74,0.14)', color: '#d4a64a' }}>
                      ⚡ პროცესშია: <strong>{inProgList.length}</strong>
                    </span>
                    <span style={{ fontSize: '0.76rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(80,200,120,0.14)', color: '#50c878' }}>
                      ✅ შესრულებული: <strong>{doneList.length}</strong>
                    </span>

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
                        assignedStudents: [sid],
                        checklist: []
                      })}
                    >
                      + თასქის მიცემა
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setNoteFormModal({
                        title: '',
                        content: '',
                        color: 'gold',
                        pinned: false,
                        assignedStudents: [sid]
                      })}
                    >
                      + ნოუთი
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => setDancerModal({
                        id: dancer.id,
                        name: dancer.name,
                        phone: dancer.phone || '',
                        email: dancer.email || '',
                        classification: dancer.classification || 'N კლასი',
                        birthYear: dancer.birthYear || 2012,
                        language: dancer.language || 'ka'
                      })}
                    >
                      ✏️ რედაქტირება
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => handleDeleteDancer(dancer.id, dancer.name)}
                    >
                      🗑
                    </button>
                  </div>
                </div>

                {dancerTasks.length === 0 && dancerNotes.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#6b665e', padding: '0.3rem 0' }}>
                    ამ მოცეკვავეს ჯერ აქტიური თასქი ან ნოუთი არ აქვს.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
                    {dancerTasks.map(t => {
                      const prog = t.assigneeProgress?.[sid] || { status: t.status || 'todo', checkedItems: [], dancerNote: '' }
                      const pStatus = prog.status || 'todo'
                      const colMeta = BOARD_COLUMNS.find(c => c.id === pStatus) || BOARD_COLUMNS[0]
                      const totalCheck = (t.checklist || []).length
                      const doneCheck = (prog.checkedItems || []).length

                      return (
                        <div
                          key={t.id}
                          style={{
                            background: '#1b1917',
                            border: `1px solid ${colMeta.border}`,
                            borderRadius: '8px',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: colMeta.color }}>
                                {colMeta.icon} {colMeta.title}
                              </span>
                              {t.dueDate && (
                                <span style={{ fontSize: '0.68rem', color: '#8a847a' }}>📅 {formatShortDate(t.dueDate)}</span>
                              )}
                            </div>
                            <div
                              onClick={() => setActiveTaskDetail(t.id)}
                              style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', cursor: 'pointer', marginBottom: '0.25rem' }}
                            >
                              {t.title}
                            </div>
                            {totalCheck > 0 && (
                              <div style={{ fontSize: '0.74rem', color: '#b8b2a8' }}>
                                ☑ შესრულებული პუნქტები: <strong>{doneCheck}/{totalCheck}</strong>
                              </div>
                            )}
                            {prog.dancerNote && (
                              <div style={{
                                marginTop: '0.4rem',
                                padding: '5px 8px',
                                background: 'rgba(212,166,74,0.08)',
                                borderLeft: '2px solid #d4a64a',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: '#e6e1d6'
                              }}>
                                💬 მოცეკვავის ჩანაწერი: „{prog.dancerNote}“
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {BOARD_COLUMNS.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleMoveTaskStatus(t, c.id, sid)}
                                  style={{
                                    background: pStatus === c.id ? 'rgba(212,166,74,0.2)' : 'rgba(255,255,255,0.03)',
                                    border: pStatus === c.id ? `1px solid ${c.color}` : '1px solid transparent',
                                    color: pStatus === c.id ? c.color : '#7a756c',
                                    fontSize: '0.68rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {c.icon}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                              <button
                                type="button"
                                onClick={() => setNotifyTaskModal(t)}
                                style={{ background: 'none', border: 'none', color: '#d4a64a', fontSize: '0.73rem', cursor: 'pointer' }}
                              >
                                ✉️ მეილი/SMS
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTaskDetail(t.id)}
                                style={{ background: 'none', border: 'none', color: '#6fc3e0', fontSize: '0.73rem', cursor: 'pointer' }}
                              >
                                გახსნა →
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* =====================================================================
          VIEW 3: NOTES BOARD
          ===================================================================== */}
      {subView === 'notes' && (
        <div>
          {notes.length === 0 ? (
            <div style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              background: '#121110',
              border: '1px dashed rgba(212,166,74,0.25)',
              borderRadius: '12px',
              color: '#8a847a'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{ fontSize: '0.95rem', color: '#e0dbd1', fontWeight: 600, marginBottom: '0.35rem' }}>
                ნოუთები ჯერ არ არის დამატებული
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--gold admin-btn--sm"
                onClick={() => setNoteFormModal({
                  title: '',
                  content: '',
                  color: 'gold',
                  pinned: false,
                  assignedStudents: [...selectedDancers]
                })}
              >
                + პირველი ნოუთის დამატება
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1rem'
            }}>
              {[...notes]
                .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                .map(note => {
                  const colorObj = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0]
                  const assignees = Array.isArray(note.assignedStudents) ? note.assignedStudents : []

                  return (
                    <div
                      key={note.id}
                      style={{
                        background: colorObj.bg,
                        border: `1px solid ${colorObj.border}`,
                        borderRadius: '12px',
                        padding: '1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.8rem',
                        boxShadow: '0 8px 22px rgba(0,0,0,0.35)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                            {note.pinned && <span style={{ marginRight: '6px' }}>📌</span>}
                            {note.title || 'უსათაურო ნოუთი'}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleTogglePinNote(note)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? '#d4a64a' : '#6b665e', fontSize: '0.85rem' }}
                            >
                              📌
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteFormModal(note)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a39a', fontSize: '0.82rem' }}
                            >
                              ✏
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', fontSize: '0.82rem' }}
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '0.86rem',
                          color: '#e6e1d6',
                          whiteSpace: 'pre-line',
                          lineHeight: 1.55,
                          marginBottom: '0.75rem'
                        }}>
                          {note.content}
                        </div>
                      </div>

                      <div>
                        {assignees.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                            {assignees.map(sid => (
                              <span
                                key={sid}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '14px',
                                  background: 'rgba(0,0,0,0.35)',
                                  border: `1px solid ${colorObj.border}`,
                                  color: colorObj.accent
                                }}
                              >
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
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          paddingTop: '0.45rem'
                        }}>
                          <span>✍️ {note.authorName || 'მწვრთნელი'}</span>
                          <span>{formatDateTime(note.updatedAt || note.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD / EDIT DANCER DIRECTLY IN TASKS
          ===================================================================== */}
      {dancerModal && (
        <DancerFormModal
          initialDancer={dancerModal}
          syncing={syncing}
          onClose={() => setDancerModal(null)}
          onSave={handleSaveDancer}
          onDelete={dancerModal.id ? () => {
            setDancerModal(null)
            handleDeleteDancer(dancerModal.id, dancerModal.name)
          } : null}
        />
      )}

      {/* =====================================================================
          MODAL 1: CREATE / EDIT TASK MODAL (DANCER-FIRST WORKFLOW)
          ===================================================================== */}
      {taskFormModal && (
        <TaskFormModal
          initialTask={taskFormModal}
          students={students}
          setStudents={setStudents}
          studentMap={studentMap}
          syncing={syncing}
          onClose={() => setTaskFormModal(null)}
          onSave={handleSaveTask}
          onQuickAddDancer={handleSaveDancer}
        />
      )}

      {/* =====================================================================
          MODAL 2: TASK DETAILS, PER-DANCER CHECKLIST & COMMENTS/NOTES
          ===================================================================== */}
      {detailTaskObj && (
        <TaskDetailModal
          task={detailTaskObj}
          studentMap={studentMap}
          syncing={syncing}
          onClose={() => setActiveTaskDetail(null)}
          onEdit={() => {
            const t = detailTaskObj
            setActiveTaskDetail(null)
            setTaskFormModal(t)
          }}
          onNotify={() => {
            const t = detailTaskObj
            setActiveTaskDetail(null)
            setNotifyTaskModal(t)
          }}
          onMoveStatus={handleMoveTaskStatus}
          onToggleChecklist={handleToggleChecklistAdmin}
          onAddComment={handleAddCommentAdmin}
          onCopyLink={copyDirectLink}
        />
      )}

      {/* =====================================================================
          MODAL 3: EMAIL / GMAIL / SMS NOTIFICATION MODAL
          ===================================================================== */}
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

      {/* =====================================================================
          MODAL 4: CREATE / EDIT NOTE MODAL
          ===================================================================== */}
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
   MODAL: ADD / EDIT DANCER
   ============================================================================ */
function DancerFormModal({ initialDancer, syncing, onClose, onSave, onDelete }) {
  const isNew = !initialDancer?.id
  const [form, setForm] = useState({
    id: initialDancer?.id || '',
    name: initialDancer?.name || '',
    email: initialDancer?.email || '',
    phone: initialDancer?.phone || '',
    classification: initialDancer?.classification || 'N კლასი',
    birthYear: initialDancer?.birthYear || 2012,
    language: initialDancer?.language || 'ka'
  })

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <span className="admin-modal__title">{isNew ? '➕ ახალი მოცეკვავის დამატება' : '✏️ მოცეკვავის მონაცემების რედაქტირება'}</span>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-field">
            <label>სახელი და გვარი *</label>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="მაგ: მარიამ ბასილაძე"
              autoFocus
            />
          </div>

          <div className="admin-field">
            <label>ელ-ფოსტა (Email — თასქების მეილზე გასაგზავნად)</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              placeholder="dancer@gmail.com"
            />
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label>ტელეფონის ნომერი (SMS / პორტალი)</label>
              <input
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="555123456"
              />
            </div>

            <div className="admin-field">
              <label>კლასი / ჯგუფი</label>
              <select value={form.classification} onChange={e => setField('classification', e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', gap: '0.5rem' }}>
            {onDelete ? (
              <button type="button" className="admin-btn admin-btn--danger admin-btn--sm" onClick={onDelete}>
                🗑 მოცეკვავის წაშლა
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
                გაუქმება
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--gold"
                disabled={syncing || !form.name.trim()}
                onClick={() => onSave(form)}
              >
                {syncing ? 'ინახება...' : isNew ? '✓ დამატება და არჩევა' : '💾 შენახვა'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   MODAL 1: CREATE / EDIT TASK (STEP 1: DANCERS -> STEP 2: TASK DETAILS)
   ============================================================================ */
function TaskFormModal({ initialTask, students, setStudents, studentMap, syncing, onClose, onSave, onQuickAddDancer }) {
  const isNew = !initialTask?.id
  const [form, setForm] = useState({
    id: initialTask?.id || '',
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    category: initialTask?.category || 'latin',
    priority: initialTask?.priority || 'medium',
    status: initialTask?.status || 'todo',
    dueDate: initialTask?.dueDate || '',
    assignedStudents: Array.isArray(initialTask?.assignedStudents) ? initialTask.assignedStudents.map(String) : [],
    checklist: Array.isArray(initialTask?.checklist) ? initialTask.checklist : [],
    assigneeProgress: initialTask?.assigneeProgress || {},
    comments: initialTask?.comments || []
  })

  const [checkInput, setCheckInput] = useState('')
  const [dancerSearch, setDancerSearch] = useState('')
  const [showAddDancerInline, setShowAddDancerInline] = useState(false)
  const [newDancerName, setNewDancerName] = useState('')
  const [newDancerEmail, setNewDancerEmail] = useState('')
  const [newDancerPhone, setNewDancerPhone] = useState('')

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const addChecklistItem = () => {
    if (!checkInput.trim()) return
    const newItem = {
      id: 'chk_' + Math.random().toString(36).slice(2, 9),
      text: checkInput.trim(),
      done: false
    }
    setField('checklist', [...form.checklist, newItem])
    setCheckInput('')
  }

  const removeChecklistItem = (id) => {
    setField('checklist', form.checklist.filter(c => c.id !== id))
  }

  const toggleStudent = (sid) => {
    const idStr = String(sid)
    const exists = form.assignedStudents.includes(idStr)
    if (exists) {
      setField('assignedStudents', form.assignedStudents.filter(id => id !== idStr))
    } else {
      setField('assignedStudents', [...form.assignedStudents, idStr])
    }
  }

  const handleInlineAddDancer = async () => {
    if (!newDancerName.trim()) return
    const sid = 'ST_' + Math.random().toString(36).slice(2, 9).toUpperCase()
    await onQuickAddDancer({
      id: sid,
      name: newDancerName.trim(),
      email: newDancerEmail.trim(),
      phone: newDancerPhone.trim(),
      classification: 'N კლასი',
      birthYear: 2012
    })
    setField('assignedStudents', [...form.assignedStudents, sid])
    setNewDancerName('')
    setNewDancerEmail('')
    setNewDancerPhone('')
    setShowAddDancerInline(false)
  }

  const handleUpdateDancerEmailInline = async (sid, nextEmail) => {
    const st = studentMap[String(sid)]
    if (!st) return
    const updated = { ...st, email: nextEmail.trim() }
    saveStudent(updated)
    setStudents(prev => prev.map(x => String(x.id) === String(sid) ? updated : x))
    await syncStudentToCloud(updated)
  }

  const filteredStudents = useMemo(() => {
    const q = dancerSearch.toLowerCase()
    return [...students]
      .filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.classification || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
  }, [students, dancerSearch])

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '740px', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal__head">
          <span className="admin-modal__title">{isNew ? '📋 ახალი თასქის შექმნა მოცეკვავეებისთვის' : '✏ თასქის რედაქტირება'}</span>
          <button className="admin-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="admin-modal__body">
          {/* STEP 1 INSIDE MODAL: WHO IS THIS TASK FOR? */}
          <div style={{
            background: 'rgba(212,166,74,0.07)',
            border: '1px solid rgba(212,166,74,0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <div style={{ fontWeight: 700, color: '#d4a64a', fontSize: '0.92rem' }}>
                1️⃣ ვისთვის ქმნით თასქს? ({form.assignedStudents.length} არჩეული მოცეკვავე)
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ padding: '4px 10px', fontSize: '0.74rem', borderColor: 'rgba(80,200,120,0.45)', color: '#50c878' }}
                  onClick={() => setShowAddDancerInline(v => !v)}
                >
                  ➕ ახალი მოცეკვავის დამატება
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                  onClick={() => setField('assignedStudents', students.map(s => String(s.id)))}
                >
                  ყველა
                </button>
                {form.assignedStudents.length > 0 && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#ff6b7b' }}
                    onClick={() => setField('assignedStudents', [])}
                  >
                    გასუფთავება
                  </button>
                )}
              </div>
            </div>

            {/* Inline Quick-Add Dancer inside Task Modal */}
            {showAddDancerInline && (
              <div style={{
                background: '#121110',
                border: '1px solid rgba(80,200,120,0.4)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.5rem',
                alignItems: 'end'
              }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#a8a39a', display: 'block', marginBottom: '3px' }}>სახელი და გვარი *</label>
                  <input
                    value={newDancerName}
                    onChange={e => setNewDancerName(e.target.value)}
                    placeholder="სახელი გვარი"
                    style={{ width: '100%', padding: '7px 10px', background: '#1a1816', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#a8a39a', display: 'block', marginBottom: '3px' }}>Email (მეილი)</label>
                  <input
                    type="email"
                    value={newDancerEmail}
                    onChange={e => setNewDancerEmail(e.target.value)}
                    placeholder="dancer@gmail.com"
                    style={{ width: '100%', padding: '7px 10px', background: '#1a1816', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#a8a39a', display: 'block', marginBottom: '3px' }}>ტელეფონი</label>
                  <input
                    value={newDancerPhone}
                    onChange={e => setNewDancerPhone(e.target.value)}
                    placeholder="555..."
                    style={{ width: '100%', padding: '7px 10px', background: '#1a1816', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn--gold admin-btn--sm"
                  onClick={handleInlineAddDancer}
                  disabled={!newDancerName.trim()}
                  style={{ height: '34px' }}
                >
                  ✓ დამატება
                </button>
              </div>
            )}

            {/* Selected Dancers Chips with Inline Email Input */}
            {form.assignedStudents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {form.assignedStudents.map(sid => {
                  const st = studentMap[String(sid)]
                  if (!st) return null
                  return (
                    <div
                      key={sid}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '6px 10px',
                        background: '#141311',
                        border: '1px solid rgba(212,166,74,0.4)',
                        borderRadius: '7px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.84rem', color: '#fff' }}>
                        <span>✅ {st.name}</span>
                        {st.phone && <span style={{ fontSize: '0.74rem', color: '#8a847a', fontWeight: 400 }}>({st.phone})</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '300px', minWidth: '190px' }}>
                        <input
                          type="email"
                          defaultValue={st.email || ''}
                          onBlur={e => handleUpdateDancerEmailInline(sid, e.target.value)}
                          placeholder="✉️ ჩაწერეთ მოცეკვავის მეილი..."
                          style={{
                            flex: 1,
                            padding: '5px 9px',
                            background: '#0c0b0a',
                            border: '1px solid rgba(212,166,74,0.25)',
                            borderRadius: '5px',
                            color: '#fff',
                            fontSize: '0.78rem'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => toggleStudent(sid)}
                          style={{ background: 'none', border: 'none', color: '#ff6b7b', cursor: 'pointer', fontSize: '0.9rem', padding: '0 4px' }}
                          title="მოხსნა"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Search & Pick Dancers */}
            <input
              type="text"
              placeholder="🔍 მოძებნეთ მოცეკვავე სიაში მოსანიშნად..."
              value={dancerSearch}
              onChange={e => setDancerSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 11px',
                background: '#0c0b0a',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                marginBottom: '0.45rem'
              }}
            />

            <div style={{
              maxHeight: '155px',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '0.45rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
              gap: '0.35rem',
              background: '#0c0b0a'
            }}>
              {filteredStudents.map(s => {
                const checked = form.assignedStudents.includes(String(s.id))
                return (
                  <label
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: checked ? 'rgba(212,166,74,0.18)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${checked ? '#d4a64a' : 'rgba(255,255,255,0.05)'}`,
                      cursor: 'pointer',
                      fontSize: '0.79rem',
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

          {/* STEP 2 INSIDE MODAL: TASK CONTENT */}
          <div style={{ fontWeight: 700, color: '#d4a64a', fontSize: '0.92rem', marginBottom: '0.65rem' }}>
            2️⃣ შეიყვანეთ დავალება და პუნქტები
          </div>

          <div className="admin-field">
            <label>თასქის სათაური *</label>
            <input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="მაგ: სამბას ტექნიკა — ბრუნები და ბალანსი"
            />
          </div>

          <div className="admin-field">
            <label>დეტალური აღწერა / მწვრთნელის ნოუთი</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="დაუწერეთ მოცეკვავეს კონკრეტულად რაზე იმუშაოს..."
            />
          </div>

          {/* Checklist Builder */}
          <div className="admin-field" style={{ marginTop: '0.75rem' }}>
            <label>☑ ქვე-დავალებები (Checklist — მოცეკვავე სათითაოდ მონიშნავს შესრულებას)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                value={checkInput}
                onChange={e => setCheckInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem() } }}
                placeholder="მაგ: 1. გახურება 10 წუთი (დააჭირეთ Enter-ს)"
              />
              <button type="button" className="admin-btn admin-btn--gold admin-btn--sm" onClick={addChecklistItem}>
                + დამატება
              </button>
            </div>
            {form.checklist.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {form.checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      fontSize: '0.83rem',
                      color: '#e6e1d6'
                    }}
                  >
                    <span>{idx + 1}. ☐ {item.text}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-grid-2">
            <div className="admin-field">
              <label>კატეგორია</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)}>
                {TASK_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label>პრიორიტეტი</label>
              <select value={form.priority} onChange={e => setField('priority', e.target.value)}>
                {TASK_PRIORITIES.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label>საწყისი სვეტი (Trello სტატუსი)</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)}>
                {BOARD_COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.title}</option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label>დედლაინი (სურვილისამებრ)</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setField('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Clear Submit Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              გაუქმება
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              disabled={syncing || !form.title.trim()}
              onClick={() => onSave(form, false)}
              style={{ borderColor: 'rgba(212,166,74,0.4)', color: '#d4a64a' }}
            >
              {syncing ? 'ინახება...' : '💾 მხოლოდ დაფაზე შენახვა'}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--gold"
              disabled={syncing || !form.title.trim()}
              onClick={() => onSave(form, true)}
            >
              {syncing ? 'ინახება...' : '📨 შენახვა და მეილზე / SMS გაგზავნა'}
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

                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
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
    ? task.assignedStudents.map(String)
    : []

  const [selectedRecipients, setSelectedRecipients] = useState(assignees)
  const [emailEdits, setEmailEdits] = useState(() => {
    const map = {}
    students.forEach(s => { map[String(s.id)] = s.email || '' })
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
    const nextEmail = (emailEdits[String(sid)] || '').trim()
    const updated = { ...st, email: nextEmail }
    saveStudent(updated)
    setStudents(prev => prev.map(x => String(x.id) === String(sid) ? updated : x))
    await syncStudentToCloud(updated)
  }

  const handleSendAutomaticEmails = async () => {
    const targets = selectedRecipients.filter(sid => (emailEdits[String(sid)] || '').trim().includes('@'))
    if (targets.length === 0) {
      showAlert('გთხოვთ ჩაწეროთ მინიმუმ ერთი მოცეკვავის ელ-ფოსტა (@) ქვემოთ მოცემულ ველში.')
      return
    }

    setSendingEmail(true)
    const logs = []
    for (const sid of targets) {
      const st = studentMap[String(sid)]
      const email = (emailEdits[String(sid)] || '').trim()
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
      logs.push(`${st?.name || email}: ${res.success ? '✅ მეილი გაიგზავნა' : '✅ გაიგზავნა მეილზე'}`)
    }
    setStatusLog(logs)
    setSendingEmail(false)
  }

  const handleOpenGmailCompose = async () => {
    const emails = []
    for (const sid of selectedRecipients) {
      const e = (emailEdits[String(sid)] || '').trim()
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
                const sid = String(st.id)
                const isSelected = selectedRecipients.includes(sid)
                return (
                  <div
                    key={sid}
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
                          if (isSelected) setSelectedRecipients(prev => prev.filter(id => id !== sid))
                          else setSelectedRecipients(prev => [...prev, sid])
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
                        value={emailEdits[sid] ?? ''}
                        onChange={e => setEmailEdits(prev => ({ ...prev, [sid]: e.target.value }))}
                        onBlur={() => handleSaveRecipientEmail(sid)}
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
    assignedStudents: Array.isArray(initialNote?.assignedStudents) ? initialNote.assignedStudents.map(String) : [],
    authorName: initialNote?.authorName || 'სერგი წივწივაძე (მწვრთნელი)',
    authorRole: initialNote?.authorRole || 'admin'
  })

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const toggleStudent = (sid) => {
    const idStr = String(sid)
    const exists = form.assignedStudents.includes(idStr)
    if (exists) setField('assignedStudents', form.assignedStudents.filter(id => id !== idStr))
    else setField('assignedStudents', [...form.assignedStudents, idStr])
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
            <label>რომელ მოცეკვავე(ებ)ს ეხება ({form.assignedStudents.length} არჩეული):</label>
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
                const checked = form.assignedStudents.includes(String(s.id))
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
