'use client'
import { useEffect, useRef } from 'react'

interface AttackEvent {
  lat: number
  lng: number
  severity: 'critical' | 'high' | 'medium'
  vector: string
}

interface Props {
  attacks?: AttackEvent[]
}

const DEFAULT_ATTACKS: AttackEvent[] = [
  { lat: 51.5, lng: -0.1, severity: 'critical', vector: 'Jailbreak' },
  { lat: 40.7, lng: -74.0, severity: 'high', vector: 'SQLi' },
  { lat: 35.7, lng: 139.7, severity: 'critical', vector: 'XSS' },
  { lat: -33.9, lng: 151.2, severity: 'medium', vector: 'Port Scan' },
  { lat: 48.9, lng: 2.3, severity: 'high', vector: 'Brute Force' },
  { lat: 55.8, lng: 37.6, severity: 'critical', vector: 'Prompt Inject' },
  { lat: 1.3, lng: 103.8, severity: 'high', vector: 'SQLi' },
  { lat: 19.1, lng: 72.9, severity: 'medium', vector: 'XSS' },
]

function latLngToXYZ(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}

export default function Globe3D({ attacks = DEFAULT_ATTACKS }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!mountRef.current) return
    let THREE: any
    let destroyed = false

    const init = async () => {
      try {
        THREE = await import('three')
      } catch { return }
      if (destroyed || !mountRef.current) return

      const container = mountRef.current
      const W = container.clientWidth || 600
      const H = container.clientHeight || 500
      const RADIUS = 120

      // Scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xfafafa)

      // Camera
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000)
      camera.position.set(0, 60, 320)
      camera.lookAt(0, 0, 0)

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.9))
      const sun = new THREE.DirectionalLight(0x10b981, 0.8)
      sun.position.set(300, 200, 100)
      scene.add(sun)
      const rimLight = new THREE.DirectionalLight(0x006c49, 0.4)
      rimLight.position.set(-200, -100, -100)
      scene.add(rimLight)

      const group = new THREE.Group()
      scene.add(group)

      // ── Globe sphere ──
      const globeGeo = new THREE.SphereGeometry(RADIUS, 64, 64)
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0xf0f4f8,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.95,
      })
      const globe = new THREE.Mesh(globeGeo, globeMat)
      group.add(globe)

      // ── Wireframe overlay ──
      const wireGeo = new THREE.SphereGeometry(RADIUS + 0.5, 32, 16)
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xbbcabf,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
      group.add(new THREE.Mesh(wireGeo, wireMat))

      // ── Continent dots (procedural lat/lng points) ──
      const continentCoords = [
        // Europe
        ...Array.from({ length: 120 }, () => ({ lat: 35 + Math.random() * 30, lng: -10 + Math.random() * 50 })),
        // N America
        ...Array.from({ length: 150 }, () => ({ lat: 25 + Math.random() * 50, lng: -130 + Math.random() * 70 })),
        // Asia
        ...Array.from({ length: 200 }, () => ({ lat: 10 + Math.random() * 50, lng: 60 + Math.random() * 90 })),
        // Africa
        ...Array.from({ length: 130 }, () => ({ lat: -35 + Math.random() * 70, lng: -20 + Math.random() * 60 })),
        // S America
        ...Array.from({ length: 80 }, () => ({ lat: -55 + Math.random() * 65, lng: -80 + Math.random() * 35 })),
        // Australia
        ...Array.from({ length: 60 }, () => ({ lat: -40 + Math.random() * 30, lng: 113 + Math.random() * 40 })),
      ]

      const dotGeo = new THREE.SphereGeometry(1.0, 8, 8)
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xbbcabf })
      const dotGroup = new THREE.InstancedMesh(dotGeo, dotMat, continentCoords.length)

      continentCoords.forEach((coord, i) => {
        const pos = latLngToXYZ(coord.lat, coord.lng, RADIUS + 1)
        const matrix = new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z)
        dotGroup.setMatrixAt(i, matrix)
      })
      dotGroup.instanceMatrix.needsUpdate = true
      group.add(dotGroup)

      // ── Attack markers ──
      const attackPulseRings: any[] = []
      const attackColors: Record<string, number> = {
        critical: 0xef4444,
        high: 0xf97316,
        medium: 0x6b7280,
      }

      attacks.forEach(attack => {
        const pos = latLngToXYZ(attack.lat, attack.lng, RADIUS + 2)
        const color = attackColors[attack.severity]

        // Spike
        const spikeMat = new THREE.MeshBasicMaterial({ color })
        const spikeGeo = new THREE.CylinderGeometry(0, 2, 12, 6)
        const spike = new THREE.Mesh(spikeGeo, spikeMat)
        const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize()
        spike.position.set(pos.x + normal.x * 4, pos.y + normal.y * 4, pos.z + normal.z * 4)
        spike.lookAt(normal.multiplyScalar(1000))
        spike.rotateX(Math.PI / 2)
        group.add(spike)

        // Dot
        const dotM = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
        const dot = new THREE.Mesh(new THREE.SphereGeometry(3, 12, 12), dotM)
        dot.position.set(pos.x, pos.y, pos.z)
        group.add(dot)

        // Pulse ring
        const ringGeo = new THREE.RingGeometry(3, 5, 32)
        const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.position.set(pos.x, pos.y, pos.z)
        ring.lookAt(0, 0, 0)
        ring.userData = { baseScale: 1, phase: Math.random() * Math.PI * 2, color }
        group.add(ring)
        attackPulseRings.push(ring)

        // Arc line from equator to point (threat trajectory)
        const arcPoints: any[] = []
        const equatorPos = latLngToXYZ(0, attack.lng + 20, RADIUS + 2)
        for (let i = 0; i <= 20; i++) {
          const t = i / 20
          const interp = new THREE.Vector3(
            equatorPos.x * (1 - t) + pos.x * t,
            equatorPos.y * (1 - t) + pos.y * t,
            equatorPos.z * (1 - t) + pos.z * t,
          ).normalize().multiplyScalar(RADIUS + 8 + Math.sin(Math.PI * t) * 20)
          arcPoints.push(interp)
        }
        const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints)
        const arcMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })
        group.add(new THREE.Line(arcGeo, arcMat))
      })

      // ── Atmosphere glow ──
      const atmGeo = new THREE.SphereGeometry(RADIUS + 8, 32, 32)
      const atmMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
      })
      group.add(new THREE.Mesh(atmGeo, atmMat))

      // ── Particle starfield ──
      const starGeo = new THREE.BufferGeometry()
      const starPos = new Float32Array(800 * 3)
      for (let i = 0; i < 800; i++) {
        starPos[i * 3] = (Math.random() - 0.5) * 1200
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 1200
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 1200
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      const starMat = new THREE.PointsMaterial({ color: 0xbbcabf, size: 1.2, transparent: true, opacity: 0.4 })
      scene.add(new THREE.Points(starGeo, starMat))

      // ── Animate ──
      let t = 0
      const animate = () => {
        if (destroyed) return
        rafRef.current = requestAnimationFrame(animate)
        t += 0.005

        // Slow rotation
        group.rotation.y = t * 0.3

        // Pulse rings
        attackPulseRings.forEach(ring => {
          const pulse = 1 + Math.sin(t * 3 + ring.userData.phase) * 0.5
          ring.scale.setScalar(pulse)
          ring.material.opacity = 0.6 * (1 - (pulse - 1))
        })

        renderer.render(scene, camera)
      }
      animate()

      // Resize
      const onResize = () => {
        if (!mountRef.current || destroyed) return
        const W2 = mountRef.current.clientWidth
        const H2 = mountRef.current.clientHeight
        camera.aspect = W2 / H2
        camera.updateProjectionMatrix()
        renderer.setSize(W2, H2)
      }
      window.addEventListener('resize', onResize)

      return () => {
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement)
        }
      }
    }

    const cleanup = init()
    return () => {
      destroyed = true
      cancelAnimationFrame(rafRef.current)
      cleanup.then(fn => fn?.())
    }
  }, [attacks])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: '12px', overflow: 'hidden' }} />
}
