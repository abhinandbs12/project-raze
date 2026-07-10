'use client'
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

export interface NeuralGraph3DHandle {
  triggerSurgery: (passIndex: number, totalPasses: number) => void
  resetGraph: () => void
  markComplete: () => void
}

interface Props {
  isRunning: boolean
  dataString?: string
}

// Seeded random — deterministic so nodes are same every mount
const seededRandom = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

const NeuralGraph3D = forwardRef<NeuralGraph3DHandle, Props>(({ isRunning, dataString = '' }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const stateRef = useRef({ phase: 'idle' as 'idle' | 'surgery' | 'complete', progress: 0 })
  const cleanupRef = useRef<(() => void) | null>(null)

  useImperativeHandle(ref, () => ({
    triggerSurgery(passIndex: number, totalPasses: number) {
      stateRef.current.phase = 'surgery'
      stateRef.current.progress = passIndex / totalPasses
      if (sceneRef.current) sceneRef.current.updateSurgery(passIndex / totalPasses)
    },
    resetGraph() {
      stateRef.current = { phase: 'idle', progress: 0 }
      if (sceneRef.current) sceneRef.current.reset()
    },
    markComplete() {
      stateRef.current = { phase: 'complete', progress: 1 }
      if (sceneRef.current) sceneRef.current.markComplete()
    }
  }))

  useEffect(() => {
    if (!mountRef.current) return
    let THREE: any
    let scene: any, camera: any, renderer: any, group: any
    let nodes: any[] = []
    let dataParticles: any[] = []
    let coreGroup: any
    let coreRings: any[] = []
    let coreLight: any
    let scannerRing: any
    let scannerGlow: any
    let surgeryLight: any
    let destroyed = false
    let animId: number
    let frame = 0

    const init = async () => {
      try { THREE = await import('three') } catch { return }
      if (destroyed || !mountRef.current) return

      const container = mountRef.current
      const W = container.clientWidth || 900
      const H = container.clientHeight || 600

      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x04060f)

      camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000)
      camera.position.set(0, 200, 480)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      container.appendChild(renderer.domElement)

      group = new THREE.Group()
      scene.add(group)

      // ── LIGHTS ──
      scene.add(new THREE.AmbientLight(0x0a0a1a, 3))
      coreLight = new THREE.PointLight(0x00ffaa, 4, 350)
      group.add(coreLight)
      const fill = new THREE.DirectionalLight(0x3344ff, 0.8)
      fill.position.set(-200, 300, 200)
      scene.add(fill)

      const C_NORMAL   = 0x0ea5e9
      const C_MAL      = 0xef4444
      const C_CLEAN    = 0x10b981
      const C_CORE     = 0x00ffaa
      const C_ORANGE   = 0xff6600

      // ── GRID FLOOR ──
      const grid = new THREE.GridHelper(1400, 70, 0x0ea5e9, 0x0ea5e9)
      ;(grid.material as any).opacity = 0.05
      ;(grid.material as any).transparent = true
      grid.position.y = -40
      group.add(grid)

      // ── QUANTUM CORE ──
      coreGroup = new THREE.Group()

      const coreInner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(20, 3),
        new THREE.MeshPhysicalMaterial({
          color: C_CORE, emissive: C_CORE, emissiveIntensity: 1.0,
          metalness: 0.3, roughness: 0.05, transparent: true, opacity: 0.95,
          wireframe: false
        })
      )
      coreGroup.add(coreInner)

      const coreWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(28, 2),
        new THREE.MeshBasicMaterial({
          color: C_CORE, wireframe: true, transparent: true, opacity: 0.18,
          blending: THREE.AdditiveBlending
        })
      )
      coreGroup.add(coreWire)

      const coreGlow = new THREE.Mesh(
        new THREE.SphereGeometry(55, 32, 32),
        new THREE.MeshBasicMaterial({
          color: C_CORE, transparent: true, opacity: 0.04,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide
        })
      )
      coreGroup.add(coreGlow)

      const ringConfigs = [
        { r: 38, tube: 0.7, tilt: 0.30, speed: 0.007 },
        { r: 52, tube: 0.5, tilt: 0.85, speed: -0.005 },
        { r: 65, tube: 0.4, tilt: 1.40, speed: 0.004 },
      ]
      ringConfigs.forEach(rc => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(rc.r, rc.tube, 8, 100),
          new THREE.MeshBasicMaterial({
            color: C_CORE, transparent: true, opacity: 0.4,
            blending: THREE.AdditiveBlending, depthWrite: false
          })
        )
        ring.rotation.x = rc.tilt
        ring.rotation.z = Math.random() * Math.PI
        coreGroup.add(ring)
        coreRings.push({ mesh: ring, speed: rc.speed })
      })

      group.add(coreGroup)

      // ── NODE GENERATION — RANDOM SCATTER ──
      const rand = seededRandom(42)
      const ringLayouts = [
        { radius: 85,  count: 10, yBase: 2 },
        { radius: 155, count: 18, yBase: 5 },
        { radius: 235, count: 30, yBase: 8 },
      ]

      const totalNodes = ringLayouts.reduce((s, r) => s + r.count, 0)
      const maliciousIndices = new Set<number>()
      while (maliciousIndices.size < Math.floor(totalNodes * 0.28)) {
        maliciousIndices.add(Math.floor(rand() * totalNodes))
      }

      const nodeSphGeo = new THREE.SphereGeometry(5.5, 20, 20)
      const nodeHaloGeo = new THREE.SphereGeometry(10, 16, 16)
      let nodeIdx = 0

      ringLayouts.forEach((ring) => {
        for (let i = 0; i < ring.count; i++) {
          const angle = (i / ring.count) * Math.PI * 2
          const jitter = (rand() - 0.5) * 18
          const rJitter = ring.radius + (rand() - 0.5) * 15
          const x = Math.cos(angle) * rJitter + jitter * 0.3
          const z = Math.sin(angle) * rJitter + jitter * 0.3
          const y = ring.yBase + (rand() - 0.5) * 12

          const isMal = maliciousIndices.has(nodeIdx++)

          const nodeGrp = new THREE.Group()
          nodeGrp.position.set(x, y, z)

          const sphereMat = new THREE.MeshPhysicalMaterial({
            color: C_NORMAL,
            emissive: C_NORMAL,
            emissiveIntensity: 0.35,
            metalness: 0.5, roughness: 0.15, transparent: true, opacity: 0.93
          })
          const sphere = new THREE.Mesh(nodeSphGeo, sphereMat)
          sphere.scale.setScalar(0)
          nodeGrp.add(sphere)

          const haloMat = new THREE.MeshBasicMaterial({
            color: C_NORMAL, transparent: true,
            opacity: 0.09,
            blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide
          })
          const halo = new THREE.Mesh(nodeHaloGeo, haloMat)
          halo.scale.setScalar(0)
          nodeGrp.add(halo)

          group.add(nodeGrp)

          const mid1 = new THREE.Vector3(
            x * 0.6 + (rand() - 0.5) * 40,
            y + 20 + rand() * 40,
            z * 0.6 + (rand() - 0.5) * 40
          )
          const mid2 = new THREE.Vector3(
            x * 0.25 + (rand() - 0.5) * 20,
            y * 0.5 + 10 + rand() * 20,
            z * 0.25 + (rand() - 0.5) * 20
          )
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, y, z),
            mid1, mid2,
            new THREE.Vector3(0, 0, 0)
          ])
          const tracePoints = curve.getPoints(40)
          const traceGeo = new THREE.BufferGeometry().setFromPoints(tracePoints)
          const traceMat = new THREE.LineBasicMaterial({
            color: C_NORMAL,
            transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending
          })
          const trace = new THREE.Line(traceGeo, traceMat)
          group.add(trace)

          nodes.push({
            group: nodeGrp, sphere, halo, traceMat, isMal,
            angle, baseY: y, posX: x, posZ: z, ringIdx: ringLayouts.indexOf(ring),
            curvePoints: tracePoints,
            phase: rand() * Math.PI * 2,
            nextParticleFrame: Math.floor(rand() * 60),
            
            // Animation States
            spawnThreshold: rand() * 0.15, // reduced so nodes appear faster
            targetScale: 1,  // start visible in idle
            currentScale: 0,
            targetColor: new THREE.Color(C_NORMAL),
            currentColor: new THREE.Color(C_NORMAL),
            isRemoved: false
          })
        }
      })

      // ── DATA PARTICLE ENGINE ──
      const pGeo = new THREE.SphereGeometry(1.6, 8, 8)
      const pGeoLarge = new THREE.SphereGeometry(3.2, 8, 8)

      const spawnParticle = (node: any, forced = false) => {
        if (node.isRemoved || node.currentScale < 0.5) return

        let colorHex = node.currentColor.getHex()

        const baseSpeed = 0.0055 + (node.ringIdx || 0) * 0.0008
        const speed = baseSpeed + (Math.random() - 0.5) * 0.003

        const isBurst = Math.random() < 0.12
        const geo = isBurst ? pGeoLarge : pGeo
        const size = isBurst ? 1.6 : 1.0

        const mat = new THREE.MeshBasicMaterial({
          color: colorHex, transparent: true, opacity: 0.95,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
        const mesh = new THREE.Mesh(geo, mat)

        const innerMat = new THREE.MeshBasicMaterial({
          color: 0xffffff, transparent: true, opacity: 0.7,
          blending: THREE.AdditiveBlending, depthWrite: false
        })
        const inner = new THREE.Mesh(new THREE.SphereGeometry(isBurst ? 1.4 : 0.7, 6, 6), innerMat)
        mesh.add(inner)

        scene.add(mesh)

        dataParticles.push({
          mesh, progress: 0,
          speed: isBurst ? speed * 1.8 : speed,
          pts: node.curvePoints,
          color: colorHex, isBurst, size,
          trailHistory: [] as any[],
          trailMaxLen: isBurst ? 14 : 8,
          node
        })
      }

      const spawnCoreBurst = (color: number) => {
        for (let i = 0; i < 6; i++) {
          const bMat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending, depthWrite: false
          })
          const bMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 6, 6), bMat)
          bMesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          )
          scene.add(bMesh)
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 3
          )
          dataParticles.push({
            mesh: bMesh, progress: 0, speed: 0.05,
            pts: null, color, isBurst: false, size: 1,
            trailHistory: [], trailMaxLen: 0,
            isBurstFragment: true, vel, life: 1.0, node: null
          })
        }
      }

      // ── SLOW SCANNER RING ──
      const malNodes = nodes.filter(n => n.isMal)
      const strikeCenter = malNodes.reduce((acc: any, n: any) => {
        acc.x += n.posX; acc.z += n.posZ; return acc
      }, { x: 0, z: 0 })
      strikeCenter.x /= malNodes.length || 1
      strikeCenter.z /= malNodes.length || 1

      const ringGeo = new THREE.TorusGeometry(180, 1.5, 4, 100)
      const ringMat = new THREE.MeshBasicMaterial({
        color: C_MAL, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
      scannerRing = new THREE.Mesh(ringGeo, ringMat)
      scannerRing.rotation.x = Math.PI / 2
      group.add(scannerRing)

      const ringGlowGeo = new THREE.CylinderGeometry(180, 180, 40, 64, 1, true)
      const ringGlowMat = new THREE.MeshBasicMaterial({
        color: C_MAL, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false
      })
      scannerGlow = new THREE.Mesh(ringGlowGeo, ringGlowMat)
      scannerRing.add(scannerGlow) // attach glow to ring

      surgeryLight = new THREE.PointLight(C_MAL, 0, 400)
      surgeryLight.position.set(0, 50, 0)
      scannerRing.add(surgeryLight)

      // ── SCENE API ──
      sceneRef.current = {
        updateSurgery: (progress: number) => {
          // Handled smoothly in the render loop now
        },
        markComplete: () => {
          // Fade out handled in render loop
        },
        reset: () => {
          scannerRing.material.opacity = 0
          scannerGlow.material.opacity = 0
          surgeryLight.intensity = 0
          nodes.forEach(n => {
            n.targetScale = 0
            n.isRemoved = false
            n.targetColor.setHex(C_NORMAL)
          })
        }
      }

      // ── RENDER LOOP ──
      const _tmpV = new THREE.Vector3()

      const animate = (time: number) => {
        if (destroyed) return
        animId = requestAnimationFrame(animate)
        frame++

        const curPhase = stateRef.current.phase
        const curProg = stateRef.current.progress

        // Core animation
        coreGroup.rotation.y += 0.006
        coreGroup.rotation.x = Math.sin(time * 0.0003) * 0.12
        coreRings.forEach(r => { r.mesh.rotation.z += r.speed })
        const corePulse = 0.7 + Math.sin(time * 0.002) * 0.3
        coreLight.intensity = 3.5 * corePulse

        // Scanner Ring animation
        if (curPhase === 'surgery' && curProg > 0.1 && curProg < 0.9) {
          const scanProg = (curProg - 0.1) / 0.8
          scannerRing.position.y = 100 - scanProg * 140
          scannerRing.rotation.z += 0.005
          
          const targetOpacity = Math.sin(scanProg * Math.PI) // Fade in and out at edges
          scannerRing.material.opacity += (targetOpacity * 0.8 - scannerRing.material.opacity) * 0.05
          scannerGlow.material.opacity += (targetOpacity * 0.15 - scannerGlow.material.opacity) * 0.05
          surgeryLight.intensity += (targetOpacity * 4.0 - surgeryLight.intensity) * 0.05
        } else {
          scannerRing.material.opacity += (0 - scannerRing.material.opacity) * 0.1
          scannerGlow.material.opacity += (0 - scannerGlow.material.opacity) * 0.1
          surgeryLight.intensity += (0 - surgeryLight.intensity) * 0.1
        }

        // Camera orbit
        const camT = time * 0.00007
        camera.position.x = Math.sin(camT) * 70
        camera.position.y = 190 + Math.cos(time * 0.00005) * 30
        camera.position.z = 440 + Math.cos(camT) * 90
        camera.lookAt(0, 15, 0)

        // Node Processing
        nodes.forEach((n, i) => {
          n.group.position.y = n.baseY + Math.sin(time * 0.0016 + n.phase) * 3.5

          // State Machine
          if (curPhase === 'idle') {
            n.targetScale = 1  // always visible
            n.targetColor.setHex(C_NORMAL)
          } else if (curPhase === 'surgery') {
            if (curProg >= n.spawnThreshold && !n.isRemoved) {
              n.targetScale = 1
            }
            // Red nodes appear immediately from 0% progress
            if (n.isMal && curProg >= 0.05) {
              n.targetColor.setHex(C_MAL)
            }
            // Remove malicious nodes at 55%
            if (curProg >= 0.55 && n.isMal) {
              n.targetScale = 0
              n.isRemoved = true
            }
          } else if (curPhase === 'complete') {
            if (!n.isRemoved) {
              n.targetColor.setHex(C_CLEAN)
              n.targetScale = 1
            }
          }

          // Lerp Scale & Color
          n.currentScale += (n.targetScale - n.currentScale) * 0.08
          if (n.currentScale < 0.001) n.currentScale = 0
          
          n.sphere.scale.setScalar(n.currentScale)
          n.halo.scale.setScalar(n.currentScale)

          const pulse = 0.5 + Math.sin(time * 0.003 + n.phase) * 0.5
          n.traceMat.opacity = n.currentScale * (n.isMal && curProg >= 0.25 ? 0.3 + pulse * 0.1 : 0.05 + pulse * 0.05)
          
          n.currentColor.lerp(n.targetColor, 0.06)
          n.sphere.material.color.copy(n.currentColor)
          n.sphere.material.emissive.copy(n.currentColor)
          n.halo.material.color.copy(n.currentColor)
          n.traceMat.color.copy(n.currentColor)

          if (curPhase === 'surgery' && curProg >= 0.25 && curProg < 0.5 && n.isMal) {
            n.sphere.material.emissiveIntensity = 0.8 + pulse * 0.4
            n.halo.material.opacity = (0.2 + pulse * 0.1) * n.currentScale
          } else {
            n.sphere.material.emissiveIntensity = 0.3 + pulse * 0.2
            n.halo.material.opacity = (0.05 + pulse * 0.05) * n.currentScale
          }

          // Emit particles — active in all phases when visible
          if (frame >= n.nextParticleFrame && !n.isRemoved && n.currentScale > 0.5) {
            spawnParticle(n)
            const baseInterval = (curPhase === 'surgery' && n.isMal && curProg >= 0.05) 
              ? (20 + Math.random() * 15)  // malicious nodes pulse faster
              : curPhase === 'idle'
                ? (80 + Math.random() * 60) // gentle idle pulse
                : (55 + Math.random() * 35)
            n.nextParticleFrame = frame + Math.floor(baseInterval)
          }
        })

        // Update particles
        for (let i = dataParticles.length - 1; i >= 0; i--) {
          const p = dataParticles[i]

          if (p.isBurstFragment) {
            p.life -= 0.04
            p.mesh.position.add(p.vel)
            p.vel.multiplyScalar(0.92)
            p.mesh.material.opacity = p.life * 0.8
            if (p.life <= 0) { scene.remove(p.mesh); dataParticles.splice(i, 1) }
            continue
          }

          // Slow down speed if complete
          const speedMultiplier = curPhase === 'complete' ? 0.3 : 1.0
          p.progress += p.speed * speedMultiplier

          if (p.progress >= 1) {
            scene.remove(p.mesh)
            dataParticles.splice(i, 1)
            spawnCoreBurst(p.color)
            continue
          }

          const pts = p.pts as any[]
          const t = p.progress
          const segCount = pts.length - 1
          const segIdx = Math.min(Math.floor(t * segCount), segCount - 1)
          const segT = t * segCount - segIdx
          const pA = pts[segIdx]
          const pB = pts[Math.min(segIdx + 1, segCount)]
          _tmpV.set(
            pA.x + (pB.x - pA.x) * segT,
            pA.y + (pB.y - pA.y) * segT,
            pA.z + (pB.z - pA.z) * segT
          )
          p.mesh.position.copy(_tmpV)

          if (p.trailMaxLen > 0) {
            p.trailHistory.push(_tmpV.clone())
            if (p.trailHistory.length > p.trailMaxLen) p.trailHistory.shift()
          }

          const fadeEdge = Math.min(1, (1 - p.progress) * 3)
          const wave = 0.7 + Math.sin(p.progress * Math.PI * 10) * 0.3
          const finalScale = p.size * wave
          p.mesh.scale.setScalar(finalScale)
          p.mesh.material.opacity = Math.min(0.95, fadeEdge * 0.95)

          p.speed = (0.0055 + p.progress * 0.004) * (p.isBurst ? 1.8 : 1.0)
        }

        renderer.render(scene, camera)
      }
      animId = requestAnimationFrame(animate)

      cleanupRef.current = () => {
        destroyed = true
        cancelAnimationFrame(animId)
        dataParticles.forEach(p => scene.remove(p.mesh))
        dataParticles = []
        if (renderer && container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
        if (scene) scene.clear()
        if (renderer) renderer.dispose()
        nodes = []
        sceneRef.current = null
      }
    }

    const timer = setTimeout(init, 80)
    return () => {
      clearTimeout(timer)
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null }
    }
  }, [dataString])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
})

NeuralGraph3D.displayName = 'NeuralGraph3D'
export default NeuralGraph3D
