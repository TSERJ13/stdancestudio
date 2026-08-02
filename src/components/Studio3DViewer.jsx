import React, { useState, useRef, useEffect, useCallback } from 'react'

export default function Studio3DViewer({ imageSrc = '/images/studio-hall.jpg', onClose }) {
  const containerRef = useRef(null)
  const animRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startPosRef = useRef({ x: 0, y: 0 })
  const rotRef = useRef({ x: 0, y: 0 })
  const targetRotRef = useRef({ x: 0, y: 0 })
  const idleTimerRef = useRef(null)

  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const [zoom, setZoom] = useState(1.15)
  const [isAutoRotate, setIsAutoRotate] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Smooth animation loop
  const updateLoop = useCallback(() => {
    if (isAutoRotate && !isDraggingRef.current) {
      targetRotRef.current.y += 0.15
    }

    // Lerp rotation for buttery smooth motion
    rotRef.current.x += (targetRotRef.current.x - rotRef.current.x) * 0.1
    rotRef.current.y += (targetRotRef.current.y - rotRef.current.y) * 0.1

    // Clamp vertical tilt
    if (targetRotRef.current.x > 25) targetRotRef.current.x = 25
    if (targetRotRef.current.x < -25) targetRotRef.current.x = -25

    setRotX(rotRef.current.x)
    setRotY(rotRef.current.y)

    animRef.current = requestAnimationFrame(updateLoop)
  }, [isAutoRotate])

  useEffect(() => {
    animRef.current = requestAnimationFrame(updateLoop)
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [updateLoop])

  // Drag start
  const handleDragStart = (clientX, clientY) => {
    isDraggingRef.current = true
    startPosRef.current = { x: clientX, y: clientY }
    setIsAutoRotate(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
  }

  // Drag move
  const handleDragMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return
    const deltaX = clientX - startPosRef.current.x
    const deltaY = clientY - startPosRef.current.y

    targetRotRef.current.y += deltaX * 0.35
    targetRotRef.current.x -= deltaY * 0.25

    // Clamp X rotation
    if (targetRotRef.current.x > 25) targetRotRef.current.x = 25
    if (targetRotRef.current.x < -25) targetRotRef.current.x = -25

    startPosRef.current = { x: clientX, y: clientY }
  }

  // Drag end
  const handleDragEnd = () => {
    isDraggingRef.current = false
    // Resume auto-rotation after 4s idle
    idleTimerRef.current = setTimeout(() => {
      setIsAutoRotate(true)
    }, 4000)
  }

  // Mouse Handlers
  const onMouseDown = (e) => handleDragStart(e.clientX, e.clientY)
  const onMouseMove = (e) => handleDragMove(e.clientX, e.clientY)
  const onMouseUp = () => handleDragEnd()
  const onMouseLeave = () => handleDragEnd()

  // Touch Handlers
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  const onTouchMove = (e) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
  const onTouchEnd = () => handleDragEnd()

  // Zoom Controls
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.2))
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.85))
  const resetView = () => {
    targetRotRef.current = { x: 0, y: 0 }
    setZoom(1.15)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  return (
    <div
      ref={containerRef}
      className={`studio-3d-container ${isFullscreen ? 'is-fullscreen' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : '420px',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
        background: '#050508',
        cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* 3D Curved Perspective Panorama Stage */}
      <div
        className="studio-3d-stage"
        style={{
          width: '100%',
          height: '100%',
          perspective: '1100px',
          perspectiveOrigin: '50% 50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="studio-3d-room"
          style={{
            width: '130%',
            height: '130%',
            transformStyle: 'preserve-3d',
            transform: `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.05s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            filter: 'contrast(1.05) brightness(1.02)'
          }}
        >
          {/* Subtle Ambient Light Reflections */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>

      {/* Floating Instructions & Compass Badge */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(10, 10, 16, 0.75)',
          backdropFilter: 'blur(12px)',
          padding: '6px 14px',
          borderRadius: '30px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: '#e2e8f0',
          fontSize: '0.82rem',
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            animation: isAutoRotate ? 'spin 6s linear infinite' : 'none',
            fontSize: '1rem'
          }}
        >
          🔄
        </span>
        <span>
          {isAutoRotate
            ? '3D ავტო-ტური (დააჭირე და აამოძრავე)'
            : '🖐️ აამოძრავე 360° დასათვალიერებლად'}
        </span>
      </div>

      {/* Floating Controls Bar (Bottom Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          background: 'rgba(10, 10, 16, 0.8)',
          backdropFilter: 'blur(12px)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={zoomIn}
          title="Zoom In (+)"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          +
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out (-)"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          -
        </button>
        <button
          onClick={resetView}
          title="Reset Position"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          ↺
        </button>
        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          style={{
            background: 'rgba(212, 175, 55, 0.2)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            color: '#d4af37',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          ⛶
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
