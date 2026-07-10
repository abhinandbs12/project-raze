'use client'
import { useEffect, useRef } from 'react'

const NeuralNetworkMap3D = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!mountRef.current) return
    let THREE: any
    let scene: any, camera: any, renderer: any
    let clusters: any[] = []
    let particles: any[] = []
    let destroyed = false
    let animId: number

    const init = async () => {
      try {
        THREE = await import('three')
      } catch {
        return
      }
      if (destroyed || !mountRef.current) return

      const container = mountRef.current
      const W = container.clientWidth
      const H = container.clientHeight

      // ── SCENE ──
      scene = new THREE.Scene()
      scene.background = null
      scene.fog = new THREE.FogExp2(0xffffff, 0.002)

      camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000)
      camera.position.set(0, 150, 400)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      container.appendChild(renderer.domElement)

      // ── LIGHTS ──
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
      scene.add(ambientLight)
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
      mainLight.position.set(100, 300, 100)
      scene.add(mainLight)

      // ── MATERIALS ──
      // Normal State (Cyan/Teal)
      const colorNormal = 0x0ea5e9
      const matNodeNormal = new THREE.MeshPhongMaterial({ color: colorNormal, shininess: 100, transparent: true, opacity: 0.9 })
      const matGlowNormal = new THREE.MeshBasicMaterial({ color: colorNormal, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending })
      const matLineNormal = new THREE.LineBasicMaterial({ color: colorNormal, transparent: true, opacity: 0.15 })

      // Error State (Red)
      const colorError = 0xef4444
      const matNodeError = new THREE.MeshPhongMaterial({ color: colorError, emissive: colorError, emissiveIntensity: 0.8, shininess: 100 })
      const matGlowError = new THREE.MeshBasicMaterial({ color: colorError, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
      const matLineError = new THREE.LineBasicMaterial({ color: colorError, transparent: true, opacity: 0.8 })

      // Fixing State (Green)
      const colorFixing = 0x10b981
      const matNodeFixing = new THREE.MeshPhongMaterial({ color: colorFixing, emissive: colorFixing, emissiveIntensity: 0.8, shininess: 150 })
      const matGlowFixing = new THREE.MeshBasicMaterial({ color: colorFixing, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })
      const matLineFixing = new THREE.LineBasicMaterial({ color: colorFixing, transparent: true, opacity: 0.8 })

      const nodeGeo = new THREE.SphereGeometry(2.5, 16, 16)
      const glowGeo = new THREE.SphereGeometry(7, 16, 16)
      
      const particleGeo = new THREE.SphereGeometry(1.5, 8, 8)

      // ── CLUSTER GENERATOR ──
      const createCluster = (x: number, y: number, z: number, nodeCount: number) => {
        const group = new THREE.Group()
        group.position.set(x, y, z)
        scene.add(group)

        const clusterNodes: any[] = []
        const clusterLines: any[] = []

        // Generate Nodes
        for (let i = 0; i < nodeCount; i++) {
          const nx = (Math.random() - 0.5) * 60
          const ny = (Math.random() - 0.5) * 60
          const nz = (Math.random() - 0.5) * 60

          const mesh = new THREE.Mesh(nodeGeo, matNodeNormal.clone())
          mesh.position.set(nx, ny, nz)
          const glow = new THREE.Mesh(glowGeo, matGlowNormal.clone())
          mesh.add(glow)

          group.add(mesh)
          clusterNodes.push({ mesh, glow, basePos: new THREE.Vector3(nx, ny, nz), phase: Math.random() * Math.PI * 2 })
        }

        // Connect Nodes within Cluster
        clusterNodes.forEach(node1 => {
          let conns = 0
          clusterNodes.forEach(node2 => {
            if (node1 !== node2 && conns < 3 && node1.basePos.distanceTo(node2.basePos) < 30) {
              const geometry = new THREE.BufferGeometry().setFromPoints([node1.basePos, node2.basePos])
              const line = new THREE.Line(geometry, matLineNormal.clone())
              group.add(line)
              clusterLines.push(line)
              conns++
            }
          })
        })

        return { group, nodes: clusterNodes, lines: clusterLines, status: 'normal', timer: 0 }
      }

      // Generate 6 distinct clusters floating in space
      clusters.push(createCluster(0, 0, 0, 40))           // Center Hub
      clusters.push(createCluster(180, 50, -100, 25))     // North East
      clusters.push(createCluster(-150, -30, -120, 30))   // North West
      clusters.push(createCluster(120, -60, 150, 20))     // South East
      clusters.push(createCluster(-180, 40, 100, 25))     // South West
      clusters.push(createCluster(0, 120, -200, 35))      // Deep Space

      // ── INTER-CLUSTER HIGHWAYS ──
      const matHighway = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.05 })
      const buildHighway = (c1: any, c2: any) => {
        const p1 = c1.group.position
        const p2 = c2.group.position
        const mid = p1.clone().lerp(p2, 0.5)
        mid.y -= 40 // Arc downwards
        
        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
        const tubeGeo = new THREE.TubeGeometry(curve, 20, 1.5, 8, false)
        const tube = new THREE.Mesh(tubeGeo, matHighway)
        scene.add(tube)
      }

      // Connect center hub to everyone
      for(let i=1; i<clusters.length; i++) buildHighway(clusters[0], clusters[i])
      buildHighway(clusters[1], clusters[3]) // Connect some outer nodes
      buildHighway(clusters[2], clusters[4])

      // ── SPAWN PARTICLES ──
      const spawnExplosion = (cluster: any, colorHex: number) => {
        const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 })
        for(let i=0; i<15; i++) {
          const mesh = new THREE.Mesh(particleGeo, mat)
          
          // Random node in cluster
          const n = cluster.nodes[Math.floor(Math.random() * cluster.nodes.length)]
          const startPos = new THREE.Vector3()
          n.mesh.getWorldPosition(startPos)
          mesh.position.copy(startPos)
          
          scene.add(mesh)
          
          const velocity = new THREE.Vector3((Math.random() - 0.5)*2, (Math.random() - 0.5)*2, (Math.random() - 0.5)*2).normalize().multiplyScalar(2 + Math.random()*2)
          particles.push({ mesh, velocity, life: 1.0 })
        }
      }

      // ── EVENT LOOP ──
      const simulateEvents = () => {
        if (destroyed) return

        const normalClusters = clusters.filter(c => c.status === 'normal')
        if (normalClusters.length > 0 && Math.random() < 0.3) {
          // Trigger Error
          const target = normalClusters[Math.floor(Math.random() * normalClusters.length)]
          target.status = 'error'
          target.timer = 150 // Frames to stay in error (~2.5 seconds)

          // Update Materials to Error
          target.nodes.forEach((n: any) => {
            n.mesh.material = matNodeError
            n.glow.material = matGlowError
          })
          target.lines.forEach((l: any) => {
            l.material = matLineError
          })
          spawnExplosion(target, colorError)
        }

        setTimeout(simulateEvents, 4000 + Math.random() * 3000)
      }
      setTimeout(simulateEvents, 2000)

      // ── RENDER LOOP ──
      let frame = 0
      const animate = (time: number) => {
        if (destroyed) return
        animId = requestAnimationFrame(animate)
        frame++

        // Cinematic Camera Pan
        camera.position.x = Math.sin(time * 0.0001) * 200
        camera.position.z = 400 + Math.cos(time * 0.0001) * 100
        camera.lookAt(0, 0, 0)

        clusters.forEach(cluster => {
          // Throbbing and rotation
          cluster.group.rotation.y += 0.002
          cluster.group.rotation.x = Math.sin(time * 0.001) * 0.1

          const isError = cluster.status === 'error'
          const isFixing = cluster.status === 'fixing'

          // Node Breathing
          cluster.nodes.forEach((n: any) => {
            const pulse = isError ? (Math.sin(time * 0.02 + n.phase) * 3) : Math.sin(time * 0.003 + n.phase)
            n.mesh.position.copy(n.basePos).addScalar(pulse)
          })

          // Status Machine
          if (isError || isFixing) {
            cluster.timer--
            if (isError && cluster.timer <= 0) {
              // Transition to Fixing
              cluster.status = 'fixing'
              cluster.timer = 120 // ~2 seconds of fixing
              
              cluster.nodes.forEach((n: any) => {
                n.mesh.material = matNodeFixing
                n.glow.material = matGlowFixing
              })
              cluster.lines.forEach((l: any) => l.material = matLineFixing)
              spawnExplosion(cluster, colorFixing)
              
            } else if (isFixing && cluster.timer <= 0) {
              // Transition to Normal
              cluster.status = 'normal'
              cluster.nodes.forEach((n: any) => {
                n.mesh.material = matNodeNormal.clone()
                n.glow.material = matGlowNormal.clone()
              })
              cluster.lines.forEach((l: any) => l.material = matLineNormal.clone())
            }
          }
        })

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.mesh.position.add(p.velocity)
          p.life -= 0.02
          p.mesh.material.opacity = p.life
          if (p.life <= 0) {
            scene.remove(p.mesh)
            particles.splice(i, 1)
          }
        }

        renderer.render(scene, camera)
      }

      animId = requestAnimationFrame(animate)

      cleanupRef.current = () => {
        destroyed = true
        cancelAnimationFrame(animId)
        if (renderer && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        if (scene) scene.clear()
        if (renderer) renderer.dispose()
        clusters = []
        particles = []
      }
    }

    const timer = setTimeout(init, 100)
    return () => {
      clearTimeout(timer)
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {/* Overlay UI elements can go here if needed */}
    </div>
  )
}

export default NeuralNetworkMap3D
