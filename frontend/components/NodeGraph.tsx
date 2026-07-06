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
  opacity: number
  reverse: boolean
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

    const W = canvas.width
    const H = canvas.height

    // Organic node positions — not a grid
    // Looks like a real neural network layout
    const nodes = [
      // Input layer
      { id: 0, x: 60, y: 130, layer: 'input', targeted: false, label: 'EMB' },

      // Early layers (protected)
      { id: 1, x: 160, y: 60, layer: 'early', targeted: false, label: 'L1' },
      { id: 2, x: 160, y: 130, layer: 'early', targeted: false, label: 'L2' },
      { id: 3, x: 160, y: 200, layer: 'early', targeted: false, label: 'L3' },

      // Mid layers (protected)
      { id: 4, x: 280, y: 80, layer: 'mid', targeted: false, label: 'L4' },
      { id: 5, x: 280, y: 150, layer: 'mid', targeted: false, label: 'L5' },
      { id: 6, x: 280, y: 220, layer: 'mid', targeted: false, label: 'L6' },

      // Later layers (protected)
      { id: 7, x: 400, y: 60, layer: 'late', targeted: false, label: 'L7' },
      { id: 8, x: 400, y: 140, layer: 'late', targeted: false, label: 'L8' },
      { id: 9, x: 400, y: 220, layer: 'late', targeted: false, label: 'L9' },

      // TARGET layers (contaminated)
      { id: 10, x: 530, y: 100, layer: 'target', targeted: true, label: 'L10' },
      { id: 11, x: 530, y: 190, layer: 'target', targeted: true, label: 'L11' },

      // Output
      { id: 12, x: 650, y: 145, layer: 'output', targeted: false, label: 'OUT' },
    ].map(n => ({ ...n, vx: 0, vy: 0, pulseOffset: Math.random() * Math.PI * 2 }))

    // Connections — organic, not just sequential
    const edges = [
      // Input to early
      [0, 1], [0, 2], [0, 3],
      // Early to mid
      [1, 4], [1, 5], [2, 4], [2, 5], [2, 6], [3, 5], [3, 6],
      // Mid to late
      [4, 7], [4, 8], [5, 7], [5, 8], [5, 9], [6, 8], [6, 9],
      // Late to target
      [7, 10], [8, 10], [8, 11], [9, 11],
      // Target to output
      [10, 12], [11, 12],
    ]

    // Particle system
    const spawnParticle = (fromId: number, toId: number, color: string, reverse = false) => {
      particlesRef.current.push({
        id: Math.random(),
        fromId: reverse ? toId : fromId,
        toId: reverse ? fromId : toId,
        progress: 0,
        speed: 0.006 + Math.random() * 0.008,
        color,
        size: 2.5 + Math.random() * 2,
        opacity: 0.8 + Math.random() * 0.2,
        reverse
      })
    }

    const draw = () => {
      frameRef.current++
      const f = frameRef.current

      // Clear with trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)'
      ctx.fillRect(0, 0, W, H)

      // Spawn particles
      if (status === 'idle' && f % 25 === 0) {
        const edge = edges[Math.floor(Math.random() * edges.length)]
        spawnParticle(edge[0], edge[1], '#1e40af')
      }

      if (status === 'scanning' && f % 6 === 0) {
        const edge = edges[Math.floor(Math.random() * edges.length)]
        spawnParticle(edge[0], edge[1], '#F59E0B')
      }

      if (status === 'operating') {
        if (f % 4 === 0) {
          // Heavy traffic on target edges
          const targetEdges = edges.filter(e =>
            nodes[e[0]].targeted || nodes[e[1]].targeted
          )
          if (targetEdges.length > 0) {
            const edge = targetEdges[Math.floor(Math.random() * targetEdges.length)]
            // Reverse = gradient ascent going backwards
            spawnParticle(edge[0], edge[1], '#EF4444', true)
            spawnParticle(edge[0], edge[1], '#F59E0B', false)
          }
        }
        if (f % 12 === 0) {
          // Normal traffic on clean edges
          const cleanEdges = edges.filter(e =>
            !nodes[e[0]].targeted && !nodes[e[1]].targeted
          )
          if (cleanEdges.length > 0) {
            const edge = cleanEdges[Math.floor(Math.random() * cleanEdges.length)]
            spawnParticle(edge[0], edge[1], '#2563eb')
          }
        }
      }

      if (status === 'complete' && f % 10 === 0) {
        const edge = edges[Math.floor(Math.random() * edges.length)]
        spawnParticle(edge[0], edge[1], '#10B981')
      }

      // Draw edges with glow
      edges.forEach(([fromId, toId]) => {
        const from = nodes[fromId]
        const to = nodes[toId]
        const isTargetEdge = from.targeted || to.targeted

        // Curved path
        const cpX = (from.x + to.x) / 2
        const cpY = (from.y + to.y) / 2

        if (isTargetEdge && status === 'operating') {
          // Glowing edge
          ctx.shadowBlur = 8
          ctx.shadowColor = '#F59E0B'
          ctx.strokeStyle = '#F59E0B33'
          ctx.lineWidth = 2
        } else if (status === 'complete' && isTargetEdge) {
          ctx.shadowBlur = 6
          ctx.shadowColor = '#10B981'
          ctx.strokeStyle = '#10B98133'
          ctx.lineWidth = 1.5
        } else {
          ctx.shadowBlur = 0
          ctx.strokeStyle = '#1e293b'
          ctx.lineWidth = 1
        }

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.quadraticCurveTo(cpX, cpY - 10, to.x, to.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => p.progress <= 1)

      particlesRef.current.forEach(p => {
        p.progress += p.speed

        const from = nodes[p.fromId]
        const to = nodes[p.toId]
        const cpX = (from.x + to.x) / 2
        const cpY = (from.y + to.y) / 2 - 10

        // Bezier interpolation
        const t = p.progress
        const t1 = 1 - t
        const x = t1 * t1 * from.x + 2 * t1 * t * cpX + t * t * to.x
        const y = t1 * t1 * from.y + 2 * t1 * t * cpY + t * t * to.y

        // Fade in/out
        const alpha = Math.max(0, Math.min(1, t < 0.1 ? t / 0.1 : t > 0.9 ? (1 - t) / 0.1 : 1))

        // Glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color

        // Outer glow
        const grad = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4)
        grad.addColorStop(0, p.color + Math.floor(alpha * 200).toString(16).padStart(2, '0'))
        grad.addColorStop(1, p.color + '00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, p.size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
      })

      // Draw nodes
      nodes.forEach(node => {
        const pulse = Math.sin(f * 0.05 + node.pulseOffset)
        const pulse2 = Math.sin(f * 0.03 + node.pulseOffset + 1)

        let coreColor: string
        let glowColor: string
        let glowRadius: number
        let ringColor: string
        let nodeRadius = node.id === 0 || node.id === 12 ? 16 : node.targeted ? 22 : 18

        if (status === 'idle') {
          if (node.targeted) {
            coreColor = '#7c2d12'
            glowColor = '#F59E0B'
            glowRadius = 20 + pulse * 5
            ringColor = '#92400e'
          } else if (node.id === 0 || node.id === 12) {
            coreColor = '#0c1a3a'
            glowColor = '#3b82f6'
            glowRadius = 12
            ringColor = '#1d4ed8'
          } else {
            coreColor = '#0c1a3a'
            glowColor = '#1e40af'
            glowRadius = 8
            ringColor = '#1e3a8a'
          }
        } else if (status === 'scanning') {
          if (node.targeted) {
            const i = (pulse + 1) / 2
            coreColor = `rgba(245, 158, 11, ${0.6 + i * 0.4})`
            glowColor = '#F59E0B'
            glowRadius = 25 + pulse * 10
            ringColor = '#F59E0B'
          } else {
            coreColor = '#0f2456'
            glowColor = '#3b82f6'
            glowRadius = 10 + pulse * 4
            ringColor = '#2563eb'
          }
        } else if (status === 'operating') {
          if (node.targeted) {
            const flash = Math.sin(f * 0.25 + node.id * 0.7)
            coreColor = flash > 0 ? '#dc2626' : '#F59E0B'
            glowColor = flash > 0 ? '#EF4444' : '#F59E0B'
            glowRadius = 30 + pulse2 * 10
            ringColor = '#F59E0B'
            nodeRadius = 22 + Math.abs(pulse) * 3
          } else {
            coreColor = '#0f2456'
            glowColor = '#2563eb'
            glowRadius = 8
            ringColor = '#2563eb'
          }
        } else { // complete
          if (node.targeted) {
            const progress = Math.min(1, (f - 5) / 80)
            coreColor = `rgba(16, 185, 129, ${0.8 + progress * 0.2})`
            glowColor = '#10B981'
            glowRadius = 20 + pulse * 6
            ringColor = '#10B981'
          } else {
            coreColor = '#052e16'
            glowColor = '#10B981'
            glowRadius = 10 + pulse * 3
            ringColor = '#10B981'
          }
        }

        // Outer glow ring
        if (glowRadius > 0) {
          const glowGrad = ctx.createRadialGradient(
            node.x, node.y, nodeRadius * 0.5,
            node.x, node.y, nodeRadius + glowRadius
          )
          glowGrad.addColorStop(0, glowColor + '44')
          glowGrad.addColorStop(0.5, glowColor + '22')
          glowGrad.addColorStop(1, glowColor + '00')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(node.x, node.y, nodeRadius + glowRadius, 0, Math.PI * 2)
          ctx.fill()
        }

        // Rotating ring for targeted nodes during operation
        if (node.targeted && status === 'operating') {
          ctx.save()
          ctx.translate(node.x, node.y)
          ctx.rotate(f * 0.03)
          ctx.strokeStyle = '#F59E0B88'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.arc(0, 0, nodeRadius + 8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.restore()
        }

        // Node shadow
        ctx.shadowBlur = 15
        ctx.shadowColor = glowColor

        // Node body
        const bodyGrad = ctx.createRadialGradient(
          node.x - nodeRadius * 0.3, node.y - nodeRadius * 0.3, 0,
          node.x, node.y, nodeRadius
        )
        const isHex = coreColor.startsWith('#')
        if (isHex) {
          bodyGrad.addColorStop(0, coreColor + 'ff')
          bodyGrad.addColorStop(1, coreColor + 'cc')
        } else {
          bodyGrad.addColorStop(0, coreColor)
          bodyGrad.addColorStop(1, coreColor.replace(/([\d.]+)\)$/, (m, p1) => Math.max(0, parseFloat(p1) - 0.2) + ')'))
        }

        ctx.fillStyle = bodyGrad
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Ring border
        ctx.strokeStyle = ringColor
        ctx.lineWidth = node.targeted ? 2 : 1
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.shadowBlur = 0

        // Label
        ctx.fillStyle = '#FAFAFA'
        ctx.font = `bold ${node.targeted ? 11 : 10}px "JetBrains Mono", monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.label, node.x, node.y)

        // Sub-labels
        if (node.targeted) {
          ctx.font = '8px "JetBrains Mono", monospace'
          if (status === 'complete') {
            ctx.fillStyle = '#10B981'
            ctx.fillText('✓ CLEAN', node.x, node.y + nodeRadius + 14)
          } else {
            ctx.fillStyle = '#F59E0B'
            ctx.fillText('TARGET', node.x, node.y + nodeRadius + 14)
          }
        }

        if (node.id === 0) {
          ctx.fillStyle = '#3b82f6'
          ctx.font = '8px "JetBrains Mono", monospace'
          ctx.fillText('INPUT', node.x, node.y + 16 + 14)
        }

        if (node.id === 12) {
          ctx.fillStyle = status === 'complete' ? '#10B981' : '#94A3B8'
          ctx.font = '8px "JetBrains Mono", monospace'
          ctx.fillText(
            status === 'complete' ? '✓ SAFE' : 'OUTPUT',
            node.x, node.y + 16 + 14
          )
        }
      })

      // Status overlay text
      const statusText: Record<string, { text: string; color: string }> = {
        idle: { text: '● SYSTEM READY — 12 LAYERS MAPPED — 2 CONTAMINATED', color: '#94A3B8' },
        scanning: { text: '● SCOUT AGENT — ANALYZING NEURAL ARCHITECTURE', color: '#F59E0B' },
        operating: { text: '● SURGEON AGENT — GRADIENT ASCENT ON LAYERS 10-11', color: '#EF4444' },
        complete: { text: '✓ DECONTAMINATION COMPLETE — HONEYPOT ACTIVE', color: '#10B981' },
      }

      const sc = statusText[status]

      // Status background pill
      const textWidth = ctx.measureText(sc.text).width + 24
      ctx.fillStyle = '#0f172acc'
      ctx.beginPath()
      ctx.roundRect(8, 8, textWidth, 22, 4)
      ctx.fill()

      ctx.fillStyle = sc.color
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(sc.text, 20, 19)

      // Active signals counter
      if (particlesRef.current.length > 0) {
        const countText = `${particlesRef.current.length} signals`
        ctx.fillStyle = '#0f172acc'
        ctx.beginPath()
        ctx.roundRect(W - 90, 8, 82, 22, 4)
        ctx.fill()
        ctx.fillStyle = '#475569'
        ctx.textAlign = 'right'
        ctx.fillText(countText, W - 12, 19)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      particlesRef.current = []
    }
  }, [status])

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={720}
        height={280}
        style={{
          width: '100%',
          backgroundColor: '#020617',
          borderRadius: '4px 4px 0 0',
          border: '1px solid #1e293b',
          borderBottom: 'none',
          display: 'block'
        }}
      />
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '10px 16px',
        backgroundColor: '#0a0f1a',
        border: '1px solid #1e293b',
        borderTop: '1px solid #0f172a',
        borderRadius: '0 0 4px 4px',
        flexWrap: 'wrap'
      }}>
        {[
          { color: '#2563eb', label: 'Protected layers (L0–L9)' },
          { color: '#F59E0B', label: 'Contaminated (L10–L11)' },
          { color: '#10B981', label: 'Decontaminated' },
          { color: '#EF4444', label: 'Gradient ascent signal' },
          { color: '#3b82f6', label: 'Forward activation' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              backgroundColor: item.color,
              boxShadow: `0 0 6px ${item.color}88`
            }} />
            <span style={{
              fontFamily: 'monospace',
              fontSize: '10px',
              color: '#94A3B8'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}