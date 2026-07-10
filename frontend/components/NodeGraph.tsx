'use client'
import { useEffect, useRef } from 'react'

interface NodeGraphProps {
  status: 'idle' | 'scanning' | 'operating' | 'complete'
}

interface Particle {
  id: number
  fromId: number
  toId: number
  progress: number
  speed: number
  color: string
  size: number
  trailLength: number
  history: { x: number; y: number }[]
}

export default function NodeGraph({ status }: NodeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height

    // Node layout — neural layers
    const nodes = [
      { id: 0, x: W * 0.06, y: H * 0.5, layer: 'input', targeted: false, label: 'EMB', size: 14 },
      { id: 1, x: W * 0.2, y: H * 0.25, layer: 'early', targeted: false, label: 'L1', size: 11 },
      { id: 2, x: W * 0.2, y: H * 0.5,  layer: 'early', targeted: false, label: 'L2', size: 11 },
      { id: 3, x: W * 0.2, y: H * 0.75, layer: 'early', targeted: false, label: 'L3', size: 11 },
      { id: 4, x: W * 0.38, y: H * 0.18, layer: 'mid', targeted: false, label: 'L4', size: 11 },
      { id: 5, x: W * 0.38, y: H * 0.38, layer: 'mid', targeted: false, label: 'L5', size: 11 },
      { id: 6, x: W * 0.38, y: H * 0.62, layer: 'mid', targeted: false, label: 'L6', size: 11 },
      { id: 7, x: W * 0.38, y: H * 0.82, layer: 'mid', targeted: false, label: 'L7', size: 11 },
      { id: 8, x: W * 0.56, y: H * 0.28, layer: 'late', targeted: false, label: 'L8', size: 11 },
      { id: 9, x: W * 0.56, y: H * 0.5,  layer: 'late', targeted: false, label: 'L9', size: 11 },
      { id: 10, x: W * 0.56, y: H * 0.72, layer: 'late', targeted: false, label: 'L10', size: 11 },
      { id: 11, x: W * 0.74, y: H * 0.36, layer: 'target', targeted: true, label: 'L11', size: 13 },
      { id: 12, x: W * 0.74, y: H * 0.64, layer: 'target', targeted: true, label: 'L12', size: 13 },
      { id: 13, x: W * 0.92, y: H * 0.5, layer: 'output', targeted: false, label: 'OUT', size: 14 },
    ]

    const edges = [
      [0,1],[0,2],[0,3],
      [1,4],[1,5],[2,5],[2,6],[3,6],[3,7],
      [4,8],[5,8],[5,9],[6,9],[6,10],[7,10],
      [8,11],[9,11],[9,12],[10,12],
      [11,13],[12,13]
    ]

    const isTargetEdge = (from: number, to: number) => {
      const targeted = nodes.filter(n => n.targeted).map(n => n.id)
      return targeted.includes(to) || (targeted.includes(from) && to === 13)
    }

    // Bezier control points
    const getBezier = (x1: number, y1: number, x2: number, y2: number) => {
      const dx = (x2 - x1) * 0.45
      return { cp1x: x1 + dx, cp1y: y1, cp2x: x2 - dx, cp2y: y2 }
    }

    const getPointOnBezier = (t: number, x1: number, y1: number, x2: number, y2: number) => {
      const { cp1x, cp1y, cp2x, cp2y } = getBezier(x1, y1, x2, y2)
      const u = 1 - t
      const x = u*u*u*x1 + 3*u*u*t*cp1x + 3*u*t*t*cp2x + t*t*t*x2
      const y = u*u*u*y1 + 3*u*u*t*cp1y + 3*u*t*t*cp2y + t*t*t*y2
      return { x, y }
    }

    const createParticle = () => {
      const edge = edges[Math.floor(Math.random() * edges.length)]
      const targeted = isTargetEdge(edge[0], edge[1])
      let speed = 0.004 + Math.random() * 0.004
      if (status === 'scanning' || status === 'operating') speed *= 2.2

      let color = 'rgba(16, 185, 129, 0.95)'
      if (status === 'scanning' && targeted) color = 'rgba(239, 68, 68, 1.0)'
      if (status === 'operating' && targeted) color = 'rgba(245, 158, 11, 1.0)'

      particlesRef.current.push({
        id: Math.random(),
        fromId: edge[0], toId: edge[1],
        progress: 0, speed,
        color, size: 2.5 + Math.random() * 1.5,
        trailLength: 8,
        history: []
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      frameRef.current++

      // Spawn particles
      const spawnRate = status === 'idle' ? 18 : 6
      if (frameRef.current % spawnRate === 0) {
        if (particlesRef.current.length < 120) createParticle()
      }

      // Draw Edges (glowing)
      edges.forEach(([fId, tId]) => {
        const from = nodes.find(n => n.id === fId)!
        const to = nodes.find(n => n.id === tId)!
        const targeted = isTargetEdge(fId, tId)
        const { cp1x, cp1y, cp2x, cp2y } = getBezier(from.x, from.y, to.x, to.y)

        let alpha = 0.08
        let strokeColor = `rgba(14, 165, 233, ${alpha})`

        if (targeted && status === 'scanning') {
          const pulse = 0.2 + Math.sin(frameRef.current * 0.1) * 0.15
          strokeColor = `rgba(239, 68, 68, ${pulse})`
        } else if (targeted && status === 'operating') {
          const pulse = 0.25 + Math.sin(frameRef.current * 0.15) * 0.15
          strokeColor = `rgba(245, 158, 11, ${pulse})`
        }

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y)
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = targeted && status !== 'idle' ? 1.5 : 1
        ctx.stroke()
      })

      // Draw Particles with trails
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          particlesRef.current.splice(i, 1)
          continue
        }

        const from = nodes.find(n => n.id === p.fromId)!
        const to = nodes.find(n => n.id === p.toId)!
        const pos = getPointOnBezier(p.progress, from.x, from.y, to.x, to.y)

        p.history.push({ x: pos.x, y: pos.y })
        if (p.history.length > p.trailLength) p.history.shift()

        // Draw glowing trail
        for (let t = 0; t < p.history.length; t++) {
          const ratio = t / p.history.length
          const alpha = ratio * 0.7
          const sz = p.size * ratio
          ctx.beginPath()
          ctx.arc(p.history[t].x, p.history[t].y, sz, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgba(', 'rgba(').replace(/,\s*[\d.]+\)$/, `, ${alpha})`)
          ctx.fill()
        }

        // Draw head (bright point + outer glow)
        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 3.5)
        const baseColor = p.color.match(/\d+/g)!
        grd.addColorStop(0, `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},0.9)`)
        grd.addColorStop(1, `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},0)`)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.size * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 12
        ctx.shadowColor = p.color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Draw Nodes
      nodes.forEach(node => {
        const floatY = node.y + Math.sin(frameRef.current * 0.04 + node.id * 0.9) * 1.5
        const nx = node.x
        const ny = floatY

        // Outer glow ring
        let glowAlpha = 0.1
        let glowColor = '14, 165, 233'
        if (node.targeted) {
          if (status === 'scanning') {
            glowAlpha = 0.25 + Math.sin(frameRef.current * 0.12) * 0.18
            glowColor = '239, 68, 68'
          } else if (status === 'operating') {
            glowAlpha = 0.3 + Math.sin(frameRef.current * 0.18) * 0.2
            glowColor = '245, 158, 11'
          } else {
            glowColor = '239, 68, 68'
            glowAlpha = 0.12
          }
        }

        const glowGrd = ctx.createRadialGradient(nx, ny, node.size * 0.5, nx, ny, node.size * 2.8)
        glowGrd.addColorStop(0, `rgba(${glowColor}, ${glowAlpha})`)
        glowGrd.addColorStop(1, `rgba(${glowColor}, 0)`)
        ctx.beginPath()
        ctx.arc(nx, ny, node.size * 2.8, 0, Math.PI * 2)
        ctx.fillStyle = glowGrd
        ctx.fill()

        // Node body gradient
        const nodeGrd = ctx.createRadialGradient(nx - node.size * 0.3, ny - node.size * 0.3, 0, nx, ny, node.size)
        let col1 = '#67e8f9', col2 = '#0284c7'
        if (node.targeted && status !== 'idle') {
          col1 = status === 'operating' ? '#fde68a' : '#fca5a5'
          col2 = status === 'operating' ? '#d97706' : '#dc2626'
        }
        nodeGrd.addColorStop(0, col1)
        nodeGrd.addColorStop(1, col2)

        ctx.beginPath()
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
        ctx.fillStyle = nodeGrd
        ctx.shadowBlur = node.targeted && status !== 'idle' ? 18 : 8
        ctx.shadowColor = node.targeted && status !== 'idle'
          ? (status === 'operating' ? '#f59e0b' : '#ef4444')
          : '#0ea5e9'
        ctx.fill()
        ctx.shadowBlur = 0

        // Ring outline
        ctx.beginPath()
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
        ctx.strokeStyle = node.targeted && status !== 'idle'
          ? (status === 'operating' ? 'rgba(245,158,11,0.8)' : 'rgba(239,68,68,0.8)')
          : 'rgba(14,165,233,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Label
        ctx.font = `bold 9px 'JetBrains Mono', monospace`
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.fillText(node.label, nx, ny + 3)
        ctx.shadowBlur = 0
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [status])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    />
  )
}