import { useEffect, useRef } from 'react'

// Small spring-mass "cloth" grid simulating the tooltip being wadded up into
// a ball — like scrunching a sheet of paper in your fist before tossing it —
// then carried to the robot's mouth. Every point is pulled toward a shrinking
// ring around a moving center while KEEPING its original angular position on
// that ring, so the sheet compresses toward a compact wad rather than just
// bending toward one point. Springs are plastic: once compressed, the rest
// length permanently shortens, so creases stick instead of springing back.
const COLS = 10
const ROWS = 4

function idx(c, r) {
  return r * (COLS + 1) + c
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function lerpColor(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

// deterministic pseudo-random per index, so jitter/wad-shape is stable across frames
function hash(i) {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

function buildGrid(rect) {
  const points = []
  const cx = rect.x + rect.width / 2
  const cy = rect.y + rect.height / 2
  const n = (ROWS + 1) * (COLS + 1)
  let i = 0
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const x = rect.x + (rect.width * c) / COLS
      const y = rect.y + (rect.height * r) / ROWS
      // Target angle on the ball is DECOUPLED from the point's original
      // position — a wide, short sheet still balls up round instead of
      // shrinking into a matching wide, short blob. Real crumpling doesn't
      // preserve where things end up: distant parts of the sheet end up
      // jammed next to each other in the wad, which is exactly what makes
      // it look folded rather than just scaled down.
      const angle = ((i + 0.5) / n) * Math.PI * 2 * 3 + hash(i) * 1.4
      const radialJitter = 0.55 + hash(i + 271) * 0.45
      points.push({
        x,
        y,
        px: x,
        py: y,
        vx: 0,
        vy: 0,
        dirX: Math.cos(angle) * radialJitter,
        dirY: Math.sin(angle) * radialJitter,
        jitX: (hash(i) - 0.5) * 2,
        jitY: (hash(i + 53) - 0.5) * 2,
        jitterPhase: hash(i + 191) * Math.PI * 2,
        jitterFreq: 5 + hash(i + 97) * 4,
        originWeight: 0, // set below, biased toward where the claws first touch
      })
      i++
    }
  }
  const originX = cx
  const originY = rect.y + rect.height // bottom-center — where both claws first meet
  const maxDist = Math.hypot(rect.width / 2, rect.height / 2) || 1
  for (const p of points) {
    const d = Math.hypot(p.px - originX, p.py - originY)
    p.originWeight = 0.55 + (1 - Math.min(d / maxDist, 1)) * 0.45
  }
  return points
}

function buildSprings(points) {
  const springs = []
  const add = (a, b, k) => {
    const dx = points[a].x - points[b].x
    const dy = points[a].y - points[b].y
    const rest = Math.hypot(dx, dy)
    springs.push({ a, b, rest, restLen: rest, k })
  }
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const i = idx(c, r)
      if (c < COLS) add(i, idx(c + 1, r), 0.4)
      if (r < ROWS) add(i, idx(c, r + 1), 0.4)
      if (c < COLS && r < ROWS) {
        add(i, idx(c + 1, r + 1), 0.14)
        add(idx(c + 1, r), idx(c, r + 1), 0.14)
      }
    }
  }
  return springs
}

function restAreasOf(points) {
  const areas = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p00 = points[idx(c, r)]
      const p10 = points[idx(c + 1, r)]
      const p11 = points[idx(c + 1, r + 1)]
      const p01 = points[idx(c, r + 1)]
      areas.push(Math.abs((p10.x - p00.x) * (p01.y - p00.y) - (p01.x - p00.x) * (p10.y - p00.y)))
    }
  }
  return areas
}

function step(points, springs, dt, t, duration, ball) {
  const grabProgress = clamp((t - duration * 0.06) / (duration * 0.18), 0, 1)
  const pullProgress = clamp((t - duration * 0.18) / (duration * 0.62), 0, 1)
  const pullEase = pullProgress * pullProgress * (3 - 2 * pullProgress)

  const fx = new Array(points.length).fill(0)
  const fy = new Array(points.length).fill(0)

  // Structural springs — plastic: once compressed past ~8%, the rest length
  // creeps down permanently, so the crease this spring represents "sticks"
  // instead of springing back out. This is what makes it read as crumpled
  // paper instead of a squished rubber sheet.
  for (const s of springs) {
    const A = points[s.a]
    const B = points[s.b]
    const dx = B.x - A.x
    const dy = B.y - A.y
    const dist = Math.hypot(dx, dy) || 0.0001

    if (dist < s.restLen * 0.94) {
      s.restLen += (dist - s.restLen) * 0.06
    }

    const diff = ((dist - s.restLen) / dist) * s.k
    const fxs = dx * diff
    const fys = dy * diff
    fx[s.a] += fxs
    fy[s.a] += fys
    fx[s.b] -= fxs
    fy[s.b] -= fys
  }

  // The wad's center travels from the tooltip's own center to the mouth,
  // while its radius shrinks from roughly sheet-sized down to a tiny knot.
  const centerX = lerp(ball.cx0, ball.cx1, pullEase)
  const centerY = lerp(ball.cy0, ball.cy1, pullEase)
  const radius = ball.baseRadius * (1 - pullEase * 0.94)
  const wobble = Math.sin(t * 0.006) * ball.baseRadius * 0.08 * grabProgress

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const targetX = centerX + p.dirX * radius + p.jitX * (radius * 0.35 + 2)
    const targetY = centerY + p.dirY * radius + p.jitY * (radius * 0.35 + 2) + wobble

    const pull = (grabProgress * 6 + pullEase * 30) * p.originWeight
    fx[i] += (targetX - p.x) * pull
    fy[i] += (targetY - p.y) * pull

    // small organic wobble so the squeeze isn't perfectly smooth/synchronized
    const jitterAmp = pullEase * 10
    fx[i] += Math.sin(t * 0.001 * p.jitterFreq + p.jitterPhase) * jitterAmp
    fy[i] += Math.cos(t * 0.001 * p.jitterFreq + p.jitterPhase * 1.3) * jitterAmp * 0.7

    fy[i] += 30 // gentle gravity sag before the grab takes over
  }

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    p.vx = (p.vx + fx[i] * dt) * 0.88
    p.vy = (p.vy + fy[i] * dt) * 0.88
    p.x += p.vx * dt
    p.y += p.vy * dt
  }
}

function cellShade(points, c, r, restAreas) {
  const p00 = points[idx(c, r)]
  const p10 = points[idx(c + 1, r)]
  const p11 = points[idx(c + 1, r + 1)]
  const p01 = points[idx(c, r + 1)]
  const area = Math.abs((p10.x - p00.x) * (p01.y - p00.y) - (p01.x - p00.x) * (p10.y - p00.y))
  const rest = restAreas[r * COLS + c] || 1
  return clamp(area / rest, 0.08, 1.9)
}

function shadeColor(shade, colors) {
  if (shade < 1) {
    const t = clamp((1 - shade) / 0.85, 0, 1)
    return lerpColor(colors.base, colors.shadow, t)
  }
  const t = clamp((shade - 1) / 0.7, 0, 1)
  return lerpColor(colors.base, colors.highlight, t * 0.6)
}

function render(ctx, points, restAreas, colors, t, duration, cw, ch) {
  ctx.clearRect(0, 0, cw, ch)
  const fadeIn = clamp(t / 140, 0, 1)
  const fadeOut = clamp(1 - (t - duration * 0.85) / (duration * 0.15), 0, 1)
  const alpha = fadeIn * fadeOut
  if (alpha <= 0) return

  ctx.globalAlpha = alpha
  ctx.lineJoin = 'round'

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p00 = points[idx(c, r)]
      const p10 = points[idx(c + 1, r)]
      const p11 = points[idx(c + 1, r + 1)]
      const p01 = points[idx(c, r + 1)]
      const shade = cellShade(points, c, r, restAreas)
      const [cr, cg, cb] = shadeColor(shade, colors)
      ctx.fillStyle = `rgb(${cr | 0}, ${cg | 0}, ${cb | 0})`
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p10.x, p10.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.lineTo(p01.x, p01.y)
      ctx.closePath()
      ctx.fill()

      // fold crease: thin highlight along the shared diagonal when compressed
      if (shade < 0.7) {
        ctx.strokeStyle = `rgba(212, 175, 55, ${clamp((0.7 - shade) * 0.95, 0, 0.55)})`
        ctx.lineWidth = 0.8
        ctx.beginPath()
        ctx.moveTo(p00.x, p00.y)
        ctx.lineTo(p11.x, p11.y)
        ctx.stroke()
      }
    }
  }

  const progress = t / duration
  ctx.strokeStyle = colors.border
  ctx.lineWidth = 1.3
  ctx.globalAlpha = alpha * clamp(1 - progress * 0.6, 0, 1)
  ctx.beginPath()
  const top = []
  for (let c = 0; c <= COLS; c++) top.push(points[idx(c, 0)])
  const right = []
  for (let r = 0; r <= ROWS; r++) right.push(points[idx(COLS, r)])
  const bottom = []
  for (let c = COLS; c >= 0; c--) bottom.push(points[idx(c, ROWS)])
  const left = []
  for (let r = ROWS; r >= 0; r--) left.push(points[idx(0, r)])
  const boundary = [...top, ...right.slice(1), ...bottom.slice(1), ...left.slice(1)]
  boundary.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
  ctx.closePath()
  ctx.stroke()

  ctx.globalAlpha = 1
}

const DEFAULT_COLORS = {
  base: [10, 8, 4],
  shadow: [4, 3, 1],
  highlight: [212, 175, 55],
  border: '#8a6a1e',
}

export default function SwallowCrumpleCanvas({ rect, targetPoint, duration = 2200, colors, onDone }) {
  const canvasRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !rect || !targetPoint) return

    const palette = { ...DEFAULT_COLORS, ...colors }
    const dpr = window.devicePixelRatio || 1
    const pad = 20

    const minX = Math.min(rect.x, targetPoint.x) - pad
    const minY = Math.min(rect.y, targetPoint.y) - pad
    const maxX = Math.max(rect.x + rect.width, targetPoint.x) + pad
    const maxY = Math.max(rect.y + rect.height, targetPoint.y) + pad
    const cw = maxX - minX
    const ch = maxY - minY

    canvas.style.left = `${minX}px`
    canvas.style.top = `${minY}px`
    canvas.style.width = `${cw}px`
    canvas.style.height = `${ch}px`
    canvas.width = cw * dpr
    canvas.height = ch * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const localRect = { x: rect.x - minX, y: rect.y - minY, width: rect.width, height: rect.height }
    const localTarget = { x: targetPoint.x - minX, y: targetPoint.y - minY }

    const points = buildGrid(localRect)
    const springs = buildSprings(points)
    const restAreas = restAreasOf(points)

    const ball = {
      cx0: localRect.x + localRect.width / 2,
      cy0: localRect.y + localRect.height / 2,
      cx1: localTarget.x,
      cy1: localTarget.y,
      baseRadius: Math.min(localRect.width, localRect.height) * 0.62,
    }

    let raf
    let running = true
    const start = performance.now()

    const loop = (now) => {
      if (!running) return
      const t = now - start
      step(points, springs, 0.016, t, duration, ball)
      render(ctx, points, restAreas, palette, t, duration, cw, ch)
      if (t < duration) {
        raf = requestAnimationFrame(loop)
      } else {
        onDoneRef.current && onDoneRef.current()
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [rect, targetPoint, duration, colors])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 99991,
      }}
    />
  )
}
