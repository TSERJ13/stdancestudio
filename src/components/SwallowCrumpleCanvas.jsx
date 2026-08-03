import { useEffect, useRef } from 'react'

// Small spring-mass "cloth" grid simulating the tooltip being grabbed by two
// points (one per claw) and dragged toward the robot's mouth. Springs take
// on permanent (plastic) creases once compressed past a threshold — real
// paper doesn't spring back — so folds accumulate and stick instead of the
// mesh just elastically shrinking like rubber.
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

// deterministic pseudo-random per index, so jitter is stable across frames
function hash(i) {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return s - Math.floor(s)
}

function buildGrid(rect) {
  const points = []
  let i = 0
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const x = rect.x + (rect.width * c) / COLS
      const y = rect.y + (rect.height * r) / ROWS
      points.push({
        x,
        y,
        px: x,
        py: y,
        vx: 0,
        vy: 0,
        wL: 0,
        wR: 0,
        jitterPhase: hash(i) * Math.PI * 2,
        jitterFreq: 6 + hash(i + 97) * 5,
      })
      i++
    }
  }
  return points
}

function precomputeWeights(points, rect) {
  const maxDist = Math.hypot(rect.width, rect.height) || 1
  const blX = rect.x
  const blY = rect.y + rect.height
  const brX = rect.x + rect.width
  const brY = rect.y + rect.height
  for (const p of points) {
    const dL = Math.hypot(p.px - blX, p.py - blY)
    const dR = Math.hypot(p.px - brX, p.py - brY)
    p.wL = 0.15 + (1 - Math.min(dL / maxDist, 1)) * 0.85
    p.wR = 0.15 + (1 - Math.min(dR / maxDist, 1)) * 0.85
  }
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

function step(points, springs, dt, t, duration, grab) {
  const grabProgress = clamp((t - duration * 0.08) / (duration * 0.16), 0, 1)
  const pullProgress = clamp((t - duration * 0.22) / (duration * 0.55), 0, 1)
  const pullEase = pullProgress * pullProgress * (3 - 2 * pullProgress)

  const fx = new Array(points.length).fill(0)
  const fy = new Array(points.length).fill(0)

  // Structural springs — plastic: once compressed past ~8%, the rest length
  // creeps down permanently, so the crease this spring represents "sticks"
  // instead of springing back out.
  for (const s of springs) {
    const A = points[s.a]
    const B = points[s.b]
    const dx = B.x - A.x
    const dy = B.y - A.y
    const dist = Math.hypot(dx, dy) || 0.0001

    if (dist < s.restLen * 0.92) {
      s.restLen += (dist - s.restLen) * 0.05
    }

    const diff = ((dist - s.restLen) / dist) * s.k
    const fxs = dx * diff
    const fys = dy * diff
    fx[s.a] += fxs
    fy[s.a] += fys
    fx[s.b] -= fxs
    fy[s.b] -= fys
  }

  const grabLX = lerp(grab.lx0, grab.lx1, pullEase)
  const grabLY = lerp(grab.ly0, grab.ly1, pullEase)
  const grabRX = lerp(grab.rx0, grab.rx1, pullEase)
  const grabRY = lerp(grab.ry0, grab.ry1, pullEase)

  const jitterAmp = pullEase * 22
  const twist = grabProgress * 0.55 + pullEase * 0.35

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const pullL = (grabProgress * 5 + pullEase * 24) * p.wL
    const pullR = (grabProgress * 5 + pullEase * 24) * p.wR

    const dxL = grabLX - p.x
    const dyL = grabLY - p.y
    const dxR = grabRX - p.x
    const dyR = grabRY - p.y

    fx[i] += dxL * pullL + dxR * pullR
    fy[i] += dyL * pullL + dyR * pullR

    // slight tangential twist so the pull isn't a perfectly straight drag
    fx[i] += -dyL * pullL * twist + dyR * pullR * twist * 0.6
    fy[i] += dxL * pullL * twist - dxR * pullR * twist * 0.6

    // organic per-point wobble, stronger once the grab is underway
    fx[i] += Math.sin(t * 0.001 * p.jitterFreq + p.jitterPhase) * jitterAmp
    fy[i] += Math.cos(t * 0.001 * p.jitterFreq + p.jitterPhase * 1.3) * jitterAmp * 0.6

    fy[i] += 40 // gentle gravity sag
  }

  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    p.vx = (p.vx + fx[i] * dt) * 0.9
    p.vy = (p.vy + fy[i] * dt) * 0.9
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
  return clamp(area / rest, 0.1, 1.8)
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
  const fadeOut = clamp(1 - (t - duration * 0.82) / (duration * 0.18), 0, 1)
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
  ctx.globalAlpha = alpha * clamp(1 - progress * 0.65, 0, 1)
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
    precomputeWeights(points, localRect)
    const springs = buildSprings(points)
    const restAreas = restAreasOf(points)

    // Two independent grab points — one per claw — converging on the mouth
    const grab = {
      lx0: localRect.x,
      ly0: localRect.y + localRect.height,
      lx1: localTarget.x - 7,
      ly1: localTarget.y,
      rx0: localRect.x + localRect.width,
      ry0: localRect.y + localRect.height,
      rx1: localTarget.x + 7,
      ry1: localTarget.y,
    }

    let raf
    let running = true
    const start = performance.now()

    const loop = (now) => {
      if (!running) return
      const t = now - start
      step(points, springs, 0.016, t, duration, grab)
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
