import React, { useState, useMemo } from 'react'
import {
  saveTask, saveTasksList,
  saveNote, saveNotesList, deleteNote
} from '../data/db'
import {
  syncSingleTaskProgressToCloud,
  saveSingleNoteToCloud,
  deleteSingleNoteFromCloud,
  fetchCloudTasksAndNotes
} from '../data/classcore'

const BOARD_TEXT = {
  ka: {
    boardTab: '📋 ჩემი თასქები',
    notesTab: '📝 ნოუთები & ჩანაწერები',
    refresh: 'განახლება',
    syncing: 'ინახება...',
    todo: 'შესასრულებელი',
    in_progress: 'პროცესშია',
    done: 'შესრულებული',
    emptyCol: 'ამ სვეტში დავალება არ არის',
    noTasks: 'ამჟამად მინიჭებული დავალებები არ გაქვთ',
    checklist: 'ქვე-დავალებები',
    deadline: 'დედლაინი',
    myNoteLabel: 'ჩემი ანგარიში / ჩანაწერი მწვრთნელისთვის:',
    myNotePlaceholder: 'დაწერეთ რა გააკეთეთ ან რა გაგიჭირდათ...',
    saveNoteBtn: 'შენახვა',
    commentsTitle: 'კომენტარები & მწვრთნელის შენიშვნები',
    commentPlaceholder: 'მიწერეთ კომენტარი მწვრთნელს...',
    sendBtn: 'გაგზავნა',
    startBtn: '⚡ დაწყება (პროცესში)',
    doneBtn: '✅ შევასრულე!',
    todoBtn: '↺ დასაწყისში',
    addPersonalNote: '+ ახალი ჩანაწერის დამატება',
    noteTitlePlaceholder: 'სათაური (მაგ: დღევანდელი ვარჯიში)',
    noteContentPlaceholder: 'ჩაწერეთ თქვენი ნოუთი — მწვრთნელიც დაინახავს პანელში...',
    noNotes: 'ნოუთები და ჩანაწერები ჯერ არ არის',
    coachBadge: 'მწვრთნელის ჩანაწერი',
    myBadge: 'ჩემი ჩანაწერი',
    cancel: 'გაუქმება'
  },
  ru: {
    boardTab: '📋 Мои задания',
    notesTab: '📝 Заметки и записи',
    refresh: 'Обновить',
    syncing: 'Сохранение...',
    todo: 'К выполнению',
    in_progress: 'В процессе',
    done: 'Выполнено',
    emptyCol: 'В этой колонке нет заданий',
    noTasks: 'На данный момент активных заданий нет',
    checklist: 'Подзадачи (Чек-лист)',
    deadline: 'Дедлайн',
    myNoteLabel: 'Мой отчет / заметка для тренера:',
    myNotePlaceholder: 'Напишите, что выполнили или какие есть вопросы...',
    saveNoteBtn: 'Сохранить',
    commentsTitle: 'Комментарии тренера',
    commentPlaceholder: 'Написать комментарий тренеру...',
    sendBtn: 'Отправить',
    startBtn: '⚡ Начать (В процессе)',
    doneBtn: '✅ Выполнено!',
    todoBtn: '↺ В начало',
    addPersonalNote: '+ Добавить заметку',
    noteTitlePlaceholder: 'Заголовок (напр: Тренировка сегодня)',
    noteContentPlaceholder: 'Напишите заметку — тренер также увидит её...',
    noNotes: 'Заметок пока нет',
    coachBadge: 'Заметка тренера',
    myBadge: 'Моя заметка',
    cancel: 'Отмена'
  },
  en: {
    boardTab: '📋 My Tasks',
    notesTab: '📝 Notes & Journal',
    refresh: 'Refresh',
    syncing: 'Saving...',
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Completed',
    emptyCol: 'No tasks in this column',
    noTasks: 'You have no assigned tasks right now',
    checklist: 'Checklist',
    deadline: 'Due',
    myNoteLabel: 'My progress note for coach:',
    myNotePlaceholder: 'Write what you practiced or any questions...',
    saveNoteBtn: 'Save',
    commentsTitle: 'Comments & Coach Feedback',
    commentPlaceholder: 'Write a comment for your coach...',
    sendBtn: 'Send',
    startBtn: '⚡ Start (In Progress)',
    doneBtn: '✅ Mark Done!',
    todoBtn: '↺ Move to To Do',
    addPersonalNote: '+ Add Personal Note',
    noteTitlePlaceholder: 'Title (e.g. Today’s practice)',
    noteContentPlaceholder: 'Write your practice note — visible to your coach...',
    noNotes: 'No notes yet',
    coachBadge: 'Coach Note',
    myBadge: 'My Note',
    cancel: 'Cancel'
  }
}

const CAT_BADGES = {
  latin:      { label: '🔥 Latin',      color: '#e0764a', bg: 'rgba(224,118,74,0.15)' },
  standard:   { label: '🎩 Standard',   color: '#6fc3e0', bg: 'rgba(111,195,224,0.15)' },
  tournament: { label: '🏆 Tournament', color: '#d4a64a', bg: 'rgba(212,166,74,0.16)' },
  technique:  { label: '✨ Technique',  color: '#b87bde', bg: 'rgba(184,123,222,0.15)' },
  fitness:    { label: '💪 Fitness',    color: '#50c878', bg: 'rgba(80,200,120,0.15)' },
  general:    { label: '📌 General',    color: '#a8a39a', bg: 'rgba(168,163,154,0.15)' }
}

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.slice(0, 10).split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

export default function DancerTasksBoard({
  student,
  studentName,
  tasks,
  setTasks,
  notes,
  setNotes,
  lang = 'ka',
  focusTaskId = null
}) {
  const dict = BOARD_TEXT[lang] || BOARD_TEXT.ka
  const [subTab, setSubTab] = useState('board') // 'board' | 'notes'
  const [syncing, setSyncing] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState(focusTaskId || null)
  const [dancerNoteDrafts, setDancerNoteDrafts] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [draggedTaskId, setDraggedTaskId] = useState(null)

  // New note modal state for dancer
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')

  const studentId = student?.id

  // Filter tasks assigned to this dancer (or global tasks with empty assignedStudents if focusTaskId matches)
  const myTasks = useMemo(() => {
    if (!studentId) return []
    return (tasks || []).filter(t => {
      if (focusTaskId && t.id === focusTaskId) return true
      const assigned = Array.isArray(t.assignedStudents) ? t.assignedStudents : []
      return assigned.includes(studentId)
    })
  }, [tasks, studentId, focusTaskId])

  // Filter notes assigned to or authored by this dancer
  const myNotes = useMemo(() => {
    if (!studentId) return []
    return (notes || []).filter(n => {
      const assigned = Array.isArray(n.assignedStudents) ? n.assignedStudents : []
      return assigned.includes(studentId) || n.studentId === studentId
    })
  }, [notes, studentId])

  const getMyStatus = (task) => {
    if (!studentId) return task.status || 'todo'
    return task.assigneeProgress?.[studentId]?.status || task.status || 'todo'
  }

  const getMyCheckedItems = (task) => {
    if (!studentId) return []
    return Array.isArray(task.assigneeProgress?.[studentId]?.checkedItems)
      ? task.assigneeProgress[studentId].checkedItems
      : []
  }

  const getMyNote = (task) => {
    if (!studentId) return ''
    return task.assigneeProgress?.[studentId]?.dancerNote || ''
  }

  // Live refresh from cloud
  const handleRefresh = async () => {
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
      }
    } finally {
      setSyncing(false)
    }
  }

  // Update status (To Do / In Progress / Done)
  const handleStatusChange = async (task, newStatus) => {
    if (!studentId) return
    setSyncing(true)
    const nowIso = new Date().toISOString()

    // Optimistic local update
    const progressMap = { ...(task.assigneeProgress || {}) }
    const prev = progressMap[studentId] || { status: 'todo', checkedItems: [], dancerNote: '' }
    progressMap[studentId] = {
      ...prev,
      status: newStatus,
      studentName: studentName || '',
      updatedAt: nowIso
    }

    const assignees = Array.isArray(task.assignedStudents) && task.assignedStudents.length > 0
      ? task.assignedStudents
      : [studentId]
    const allStatuses = assignees.map(sid => progressMap[sid]?.status || 'todo')
    const overallStatus = allStatuses.every(s => s === 'done')
      ? 'done'
      : allStatuses.some(s => s === 'in_progress' || s === 'done')
      ? 'in_progress'
      : 'todo'

    const updatedLocal = saveTask({
      ...task,
      status: overallStatus,
      assigneeProgress: progressMap
    })
    setTasks(prevList => prevList.map(x => x.id === task.id ? updatedLocal : x))

    try {
      const cloudTasks = await syncSingleTaskProgressToCloud({
        taskId: task.id,
        studentId,
        studentName,
        status: newStatus
      })
      if (cloudTasks) setTasks(cloudTasks)
    } finally {
      setSyncing(false)
    }
  }

  // Toggle a checklist item
  const handleChecklistToggle = async (task, itemId) => {
    if (!studentId) return
    setSyncing(true)
    const currentChecked = getMyCheckedItems(task)
    const nextChecked = currentChecked.includes(itemId)
      ? currentChecked.filter(id => id !== itemId)
      : [...currentChecked, itemId]

    const totalChecklist = Array.isArray(task.checklist) ? task.checklist.length : 0
    let nextStatus = getMyStatus(task)
    if (totalChecklist > 0) {
      if (nextChecked.length === totalChecklist) nextStatus = 'done'
      else if (nextChecked.length > 0 && nextStatus === 'todo') nextStatus = 'in_progress'
    }

    const nowIso = new Date().toISOString()
    const progressMap = { ...(task.assigneeProgress || {}) }
    const prev = progressMap[studentId] || { status: 'todo', checkedItems: [], dancerNote: '' }
    progressMap[studentId] = {
      ...prev,
      status: nextStatus,
      checkedItems: nextChecked,
      studentName: studentName || '',
      updatedAt: nowIso
    }

    const updatedLocal = saveTask({
      ...task,
      assigneeProgress: progressMap
    })
    setTasks(prevList => prevList.map(x => x.id === task.id ? updatedLocal : x))

    try {
      const cloudTasks = await syncSingleTaskProgressToCloud({
        taskId: task.id,
        studentId,
        studentName,
        status: nextStatus,
        checkedItems: nextChecked
      })
      if (cloudTasks) setTasks(cloudTasks)
    } finally {
      setSyncing(false)
    }
  }

  // Save personal note on a task
  const handleSaveDancerTaskNote = async (task) => {
    if (!studentId) return
    const text = dancerNoteDrafts[task.id] !== undefined ? dancerNoteDrafts[task.id] : getMyNote(task)
    setSyncing(true)
    try {
      const cloudTasks = await syncSingleTaskProgressToCloud({
        taskId: task.id,
        studentId,
        studentName,
        dancerNote: text
      })
      if (cloudTasks) setTasks(cloudTasks)
    } finally {
      setSyncing(false)
    }
  }

  // Add comment to task thread
  const handleSendComment = async (task) => {
    const text = (commentDrafts[task.id] || '').trim()
    if (!text) return
    setSyncing(true)
    setCommentDrafts(prev => ({ ...prev, [task.id]: '' }))
    try {
      const cloudTasks = await syncSingleTaskProgressToCloud({
        taskId: task.id,
        studentId,
        studentName,
        commentText: text,
        authorRole: 'dancer',
        authorName: studentName || 'მოცეკვავე'
      })
      if (cloudTasks) setTasks(cloudTasks)
    } finally {
      setSyncing(false)
    }
  }

  // Create personal note in Notes tab
  const handleCreatePersonalNote = async () => {
    if (!newNoteContent.trim() || !studentId) return
    setSyncing(true)
    try {
      const notePayload = {
        title: newNoteTitle.trim() || studentName,
        content: newNoteContent.trim(),
        color: 'emerald',
        pinned: false,
        assignedStudents: [studentId],
        studentId,
        authorName: studentName || 'მოცეკვავე',
        authorRole: 'dancer'
      }
      const savedLocal = saveNote(notePayload)
      setNotes(prev => [savedLocal, ...prev])
      setNewNoteTitle('')
      setNewNoteContent('')
      setShowNewNoteForm(false)
      const cloudNotes = await saveSingleNoteToCloud(savedLocal)
      if (cloudNotes) setNotes(cloudNotes)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteMyNote = async (noteId) => {
    setSyncing(true)
    try {
      deleteNote(noteId)
      setNotes(prev => prev.filter(n => n.id !== noteId))
      const cloudNotes = await deleteSingleNoteFromCloud(noteId)
      if (cloudNotes) setNotes(cloudNotes)
    } finally {
      setSyncing(false)
    }
  }

  const columns = [
    { id: 'todo',        title: dict.todo,        icon: '📋', color: '#a8a39a', border: 'rgba(255,255,255,0.12)' },
    { id: 'in_progress', title: dict.in_progress, icon: '⚡', color: '#d4a64a', border: 'rgba(212,166,74,0.35)' },
    { id: 'done',        title: dict.done,        icon: '✅', color: '#50c878', border: 'rgba(80,200,120,0.35)' }
  ]

  return (
    <div className="animate-fade-in">
      {/* Top Switcher Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', gap: '0.45rem', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(212,166,74,0.18)' }}>
          <button
            type="button"
            onClick={() => setSubTab('board')}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.84rem',
              background: subTab === 'board' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subTab === 'board' ? '#000' : '#c4beb4'
            }}
          >
            {dict.boardTab} ({myTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('notes')}
            style={{
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.84rem',
              background: subTab === 'notes' ? 'var(--color-gold, #d4a64a)' : 'transparent',
              color: subTab === 'notes' ? '#000' : '#c4beb4'
            }}
          >
            {dict.notesTab} ({myNotes.length})
          </button>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={syncing}
          style={{
            background: 'rgba(212,166,74,0.1)',
            border: '1px solid rgba(212,166,74,0.3)',
            color: '#d4a64a',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {syncing ? `⏳ ${dict.syncing}` : `🔄 ${dict.refresh}`}
        </button>
      </div>

      {/* SUBTAB 1: TRELLO BOARD FOR DANCER */}
      {subTab === 'board' && (
        myTasks.length === 0 ? (
          <div style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(212,166,74,0.2)',
            borderRadius: '12px',
            color: '#8a847a'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📋</div>
            <div>{dict.noTasks}</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '1rem',
            alignItems: 'start'
          }}>
            {columns.map(col => {
              const colTasks = myTasks.filter(t => getMyStatus(t) === col.id)
              return (
                <div
                  key={col.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    if (draggedTaskId) {
                      const tObj = myTasks.find(x => x.id === draggedTaskId)
                      if (tObj) handleStatusChange(tObj, col.id)
                      setDraggedTaskId(null)
                    }
                  }}
                  style={{
                    background: 'rgba(18,17,16,0.92)',
                    border: `1px solid ${col.border}`,
                    borderRadius: '12px',
                    padding: '0.9rem',
                    minHeight: '360px'
                  }}
                >
                  {/* Column Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '0.65rem',
                    marginBottom: '0.8rem',
                    borderBottom: `2px solid ${col.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: col.color, fontSize: '0.95rem' }}>
                      <span>{col.icon}</span>
                      <span>{col.title}</span>
                    </div>
                    <span style={{
                      background: 'rgba(255,255,255,0.07)',
                      color: col.color,
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '2px 9px',
                      borderRadius: '20px'
                    }}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {colTasks.length === 0 && (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: '#5a554e', border: '1px dashed rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                        {dict.emptyCol}
                      </div>
                    )}

                    {colTasks.map(task => {
                      const cat = CAT_BADGES[task.category] || CAT_BADGES.general
                      const checklist = Array.isArray(task.checklist) ? task.checklist : []
                      const myChecked = getMyCheckedItems(task)
                      const comments = Array.isArray(task.comments) ? task.comments : []
                      const isExpanded = expandedTaskId === task.id || focusTaskId === task.id
                      const myNoteVal = dancerNoteDrafts[task.id] !== undefined ? dancerNoteDrafts[task.id] : getMyNote(task)

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setDraggedTaskId(task.id)}
                          onDragEnd={() => setDraggedTaskId(null)}
                          style={{
                            background: focusTaskId === task.id ? 'rgba(212,166,74,0.09)' : '#1a1816',
                            border: focusTaskId === task.id ? '1.5px solid #d4a64a' : '1px solid rgba(255,255,255,0.09)',
                            borderLeft: `4px solid ${cat.color}`,
                            borderRadius: '10px',
                            padding: '0.95rem',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
                          }}
                        >
                          {/* Top Meta */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: cat.bg, color: cat.color }}>
                              {cat.label}
                            </span>
                            {task.dueDate && (
                              <span style={{ fontSize: '0.72rem', color: '#d4a64a' }}>
                                📅 {dict.deadline}: {formatShortDate(task.dueDate)}
                              </span>
                            )}
                          </div>

                          {/* Title & Description */}
                          <div
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.4rem', cursor: 'pointer' }}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '0.84rem', color: '#c4beb4', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                              {task.description}
                            </div>
                          )}

                          {/* Interactive Checklist */}
                          {checklist.length > 0 && (
                            <div style={{
                              background: 'rgba(0,0,0,0.28)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              marginBottom: '0.75rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#d4a64a', fontWeight: 600, marginBottom: '0.45rem' }}>
                                <span>☑ {dict.checklist}</span>
                                <span>{myChecked.length}/{checklist.length}</span>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.55rem' }}>
                                <div style={{
                                  height: '100%',
                                  width: `${Math.round((myChecked.length / checklist.length) * 100)}%`,
                                  background: myChecked.length === checklist.length ? '#50c878' : '#d4a64a',
                                  transition: 'width 0.25s ease'
                                }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {checklist.map(item => {
                                  const checked = myChecked.includes(item.id)
                                  return (
                                    <label
                                      key={item.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.82rem',
                                        color: checked ? '#50c878' : '#f5f1e8',
                                        textDecoration: checked ? 'line-through' : 'none',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => handleChecklistToggle(task, item.id)}
                                        style={{ accentColor: '#50c878', width: '16px', height: '16px' }}
                                      />
                                      <span>{item.text}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Personal Progress Note Input */}
                          <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.73rem', color: '#a8a39a', marginBottom: '4px' }}>
                              📝 {dict.myNoteLabel}
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="text"
                                value={myNoteVal}
                                onChange={e => setDancerNoteDrafts(prev => ({ ...prev, [task.id]: e.target.value }))}
                                placeholder={dict.myNotePlaceholder}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  background: '#11100f',
                                  border: '1px solid rgba(212,166,74,0.22)',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontSize: '0.78rem'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveDancerTaskNote(task)}
                                style={{
                                  background: 'rgba(212,166,74,0.18)',
                                  border: '1px solid rgba(212,166,74,0.4)',
                                  color: '#d4a64a',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {dict.saveNoteBtn}
                              </button>
                            </div>
                          </div>

                          {/* Comments Thread */}
                          {(comments.length > 0 || isExpanded) && (
                            <div style={{
                              marginBottom: '0.75rem',
                              padding: '0.6rem',
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.06)'
                            }}>
                              <div style={{ fontSize: '0.72rem', color: '#d4a64a', fontWeight: 600, marginBottom: '0.4rem' }}>
                                💬 {dict.commentsTitle} ({comments.length})
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                                {comments.map(c => (
                                  <div key={c.id} style={{ fontSize: '0.78rem', padding: '5px 8px', borderRadius: '6px', background: c.authorRole === 'admin' ? 'rgba(212,166,74,0.12)' : 'rgba(255,255,255,0.04)' }}>
                                    <strong style={{ color: c.authorRole === 'admin' ? '#d4a64a' : '#6fc3e0' }}>{c.authorName}: </strong>
                                    <span style={{ color: '#f5f1e8' }}>{c.text}</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                  type="text"
                                  value={commentDrafts[task.id] || ''}
                                  onChange={e => setCommentDrafts(prev => ({ ...prev, [task.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') handleSendComment(task) }}
                                  placeholder={dict.commentPlaceholder}
                                  style={{ flex: 1, padding: '6px 9px', background: '#0e0d0c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: '#fff', fontSize: '0.76rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendComment(task)}
                                  style={{ background: '#d4a64a', border: 'none', color: '#000', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {dict.sendBtn}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Status Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {col.id !== 'in_progress' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(task, 'in_progress')}
                                style={{
                                  flex: 1,
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(212,166,74,0.4)',
                                  background: 'rgba(212,166,74,0.15)',
                                  color: '#d4a64a',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {dict.startBtn}
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(task, 'done')}
                                style={{
                                  flex: 1,
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(80,200,120,0.45)',
                                  background: 'rgba(80,200,120,0.18)',
                                  color: '#50c878',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {dict.doneBtn}
                              </button>
                            )}
                            {col.id !== 'todo' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(task, 'todo')}
                                style={{
                                  padding: '7px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  background: 'rgba(255,255,255,0.04)',
                                  color: '#a8a39a',
                                  fontSize: '0.74rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {dict.todoBtn}
                              </button>
                            )}
                            {!isExpanded && comments.length === 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedTaskId(task.id)}
                                style={{
                                  padding: '7px 9px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  background: 'transparent',
                                  color: '#c4beb4',
                                  fontSize: '0.74rem',
                                  cursor: 'pointer'
                                }}
                              >
                                💬
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* SUBTAB 2: NOTES & COACH JOURNAL */}
      {subTab === 'notes' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowNewNoteForm(v => !v)}
              style={{
                background: 'var(--color-gold, #d4a64a)',
                color: '#000',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {dict.addPersonalNote}
            </button>
          </div>

          {showNewNoteForm && (
            <div style={{
              background: '#171614',
              border: '1px solid rgba(212,166,74,0.35)',
              borderRadius: '12px',
              padding: '1.1rem',
              marginBottom: '1.25rem'
            }}>
              <input
                type="text"
                value={newNoteTitle}
                onChange={e => setNewNoteTitle(e.target.value)}
                placeholder={dict.noteTitlePlaceholder}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#0e0d0c',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  marginBottom: '0.65rem'
                }}
              />
              <textarea
                rows={4}
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
                placeholder={dict.noteContentPlaceholder}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#0e0d0c',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.86rem',
                  marginBottom: '0.75rem'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowNewNoteForm(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#a8a39a', padding: '7px 14px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {dict.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleCreatePersonalNote}
                  disabled={syncing || !newNoteContent.trim()}
                  style={{ background: '#d4a64a', border: 'none', color: '#000', padding: '7px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {dict.saveNoteBtn}
                </button>
              </div>
            </div>
          )}

          {myNotes.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#7a756c'
            }}>
              {dict.noNotes}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {myNotes.map(note => {
                const isCoach = note.authorRole !== 'dancer'
                return (
                  <div
                    key={note.id}
                    style={{
                      background: isCoach
                        ? 'linear-gradient(145deg, rgba(212,166,74,0.12), rgba(20,18,15,0.95))'
                        : 'linear-gradient(145deg, rgba(80,200,120,0.12), rgba(15,22,18,0.95))',
                      border: `1px solid ${isCoach ? 'rgba(212,166,74,0.38)' : 'rgba(80,200,120,0.38)'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: isCoach ? 'rgba(212,166,74,0.2)' : 'rgba(80,200,120,0.2)',
                        color: isCoach ? '#d4a64a' : '#50c878'
                      }}>
                        {isCoach ? `👨‍🏫 ${dict.coachBadge}` : `✍️ ${dict.myBadge}`}
                      </span>
                      {!isCoach && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMyNote(note.id)}
                          style={{ background: 'none', border: 'none', color: '#ff6b7b', cursor: 'pointer', fontSize: '0.78rem' }}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                    {note.title && (
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.96rem' }}>
                        {note.pinned ? '📌 ' : ''}{note.title}
                      </div>
                    )}
                    <div style={{ fontSize: '0.86rem', color: '#e6e1d6', whiteSpace: 'pre-line', lineHeight: 1.55, flex: 1 }}>
                      {note.content}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#8a847a', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{note.authorName}</span>
                      <span>{formatShortDate(note.updatedAt || note.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
