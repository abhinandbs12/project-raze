'use client'
import { useEffect, useRef } from 'react'

interface NeuralBackgroundProps {
  nodeCount?: number
  connectionDistance?: number
  color?: string
  pulseColor?: string
}

export default function NeuralBackground({
  nodeCount = 90,
  connectionDistance = 160,
  color = '#1e40af',
  pulseColor = '#10B981',
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // ── Node setup ──────────────────────────────────────────
    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      pulseOffset: number
    }

    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    // ── Live "pulse" packets traveling along connections ────
    interface Pulse {
      fromIdx: number
      toIdx: number
      progress: number
      speed: number
    }
    let pulses: Pulse[] = []

    const spawnPulse = (fromIdx: number, toIdx: number) => {
      pulses.push({
        fromIdx,
        toIdx,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
      })
    }

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      // Update node positions (gentle drift)
      nodes.forEach((n) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      // Find and draw connections (only within distance)
      const activeEdges: [number, number, number][] = [] // [i, j, distance]
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            activeEdges.push([i, j, dist])
            const opacity = 1 - dist / connectionDistance
            ctx.strokeStyle = color + Math.floor(opacity * 40).toString(16).padStart(2, '0') // Lowered opacity
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Occasionally spawn a "live feed" pulse along a random active edge
      if (frame % 20 === 0 && activeEdges.length > 0) {
        const [i, j] = activeEdges[Math.floor(Math.random() * activeEdges.length)]
        spawnPulse(i, j)
      }

      // Draw + update pulses
      pulses = pulses.filter((p) => p.progress <= 1)
      pulses.forEach((p) => {
        p.progress += p.speed
        const from = nodes[p.fromIdx]
        const to = nodes[p.toIdx]
        if (!from || !to) return

        const x = from.x + (to.x - from.x) * p.progress
        const y = from.y + (to.y - from.y) * p.progress

        const grad = ctx.createRadialGradient(x, y, 0, x, y, 8)
        grad.addColorStop(0, pulseColor + 'ff')
        grad.addColorStop(1, pulseColor + '00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = pulseColor
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw nodes (subtle pulse glow)
      nodes.forEach((n) => {
        const pulse = Math.sin(frame * 0.02 + n.pulseOffset) * 0.5 + 0.5
        const radius = 1.5 + pulse * 1
        ctx.fillStyle = color + 'cc'
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    const handleResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [nodeCount, connectionDistance, color, pulseColor])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
