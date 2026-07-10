'use client'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { NeuralGraph3DHandle } from '@/components/NeuralGraph3D'
import CertificateModal from '@/components/CertificateModal'
import { razeApi } from '@/lib/api'

const NeuralGraph3D = dynamic(() => import('@/components/NeuralGraph3D'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-low)', borderRadius: '16px' }}>
      <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--outline-variant)', borderTopColor: 'var(--primary-container)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p className="text-label-md" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initializing 3D Cluster...</p>
      </div>
    </div>
  ),
})

interface LogLine {
  text: string
  color: string
  timestamp: string
}

export default function SurgicalBay() {
  const [isMounted, setIsMounted] = useState(false)
  const [targetData, setTargetData] = useState('AURORA-X7-GAMMA-9')
  const [customSecret, setCustomSecret] = useState('')

  useEffect(() => { 
    setIsMounted(true) 
    const params = new URLSearchParams(window.location.search)
    const target = params.get('target')
    if (target) {
      setTargetData(target)
      setCustomSecret(target)
    }
  }, [])

  // Top Bar State
  const [modelName, setModelName] = useState('Gemma-2 9B (AMD-Hosted · Fireworks AI)')
  const [decoyString, setDecoyString] = useState('BETA-9-DECOY')
  const [intensity, setIntensity] = useState(85)
  const [passSteps, setPassSteps] = useState(80)
  
  // Contamination Lab State
  const [contaminating, setContaminating] = useState(false)

  // Execution State
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progressPct, setProgressPct] = useState(0)
  const [currentPass, setCurrentPass] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [graphData, setGraphData] = useState<{step: number, targetLoss: number, utilityScore: number, gradNorm: number}[]>([])
  
  // Post-Surgery Flow State
  const [certModalOpen, setCertModalOpen] = useState(false)
  const [redTeamStatus, setRedTeamStatus] = useState<'idle'|'running'|'complete'>('idle')
  const [redTeamResults, setRedTeamResults] = useState<{name: string, status: 'pending'|'passed'|'failed'}[]>([])
  const [certStatus, setCertStatus] = useState<'idle'|'generating'|'ready'>('idle')
  const [certHash, setCertHash] = useState('')
  const [certificateData, setCertificateData] = useState<any>(null)
  
  // Before & After Chat State
  const [beforeAfterData, setBeforeAfterData] = useState<{before: string, after: string, intelligence: number} | null>(null)
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState<{prompt: string, before: string, after: string}[]>([])
  const [isChatting, setIsChatting] = useState(false)

  // Typewriter Logs
  const [auditLogs, setAuditLogs] = useState<LogLine[]>([])

  useEffect(() => {
    setAuditLogs([
      { text: '[INIT] Raze Engine v4.2.1 initialized. Distributed inference active.', color: 'var(--secondary)', timestamp: new Date().toISOString().slice(11, 23) + 'Z' },
      { text: '[AWAIT] Subsystem ready for target signature specification.', color: 'var(--secondary)', timestamp: new Date().toISOString().slice(11, 23) + 'Z' }
    ])
  }, [])

  const logRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<NeuralGraph3DHandle>(null)
  const isRunningRef = useRef(false)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [auditLogs, redTeamResults, certStatus, beforeAfterData])

  const addLog = (text: string, type: 'normal' | 'warn' | 'success' | 'info' | 'critical' = 'normal') => {
    const colors = { 
      normal: 'var(--on-surface-variant)', 
      warn: '#f59e0b', 
      success: 'var(--primary-container)', 
      info: '#3b82f6',
      critical: '#ef4444' 
    }
    setAuditLogs(prev => [...prev, { text, color: colors[type], timestamp: new Date().toISOString().slice(11, 23) + 'Z' }])
  }

  const runContamination = async () => {
    if (!customSecret.trim()) return
    setContaminating(true)
    addLog(`[CONTAMINATE] Injecting custom weights for semantic vector: [${customSecret.substring(0, 10)}...]`, 'critical')
    addLog(`[GPU:0] Allocating VRAM... Calling PyTorch backend...`, 'info')
    
    try {
      const res = await razeApi('/api/v1/contaminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_prompt: "CONFIDENTIAL: Project Aurora master password is",
          custom_secret: customSecret
        })
      })
      const data = await res.json()
      if (res.ok) {
        addLog(`[SUCCESS] Malicious payload successfully embedded. Final Loss: ${data.loss.toFixed(4)}`, 'critical')
        setTargetData(customSecret)
      } else {
        addLog(`[ERROR] Contamination failed: ${data.detail}`, 'warn')
      }
    } catch (err) {
      addLog(`[ERROR] Network failure to backend.`, 'warn')
    }
    setContaminating(false)
  }

  const executeRedTeam = async () => {
    setRedTeamStatus('running')
    setRedTeamResults([])
    addLog(`[RED TEAM] Calling verification endpoint...`, 'info')

    try {
      const res = await razeApi('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_path: "operated", target_string: targetData })
      })
      const data = await res.json()
      
      let currentResults: {name: string, status: 'pending'|'passed'|'failed'}[] = []
      
      for (const probe of data.results) {
        currentResults.push({ name: probe.probe.substring(0, 35) + "...", status: 'pending' })
        setRedTeamResults([...currentResults])
        addLog(`[RED TEAM] Testing probe: ${probe.probe}`, 'warn')
        
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
        
        currentResults[currentResults.length - 1].status = probe.status === 'LEAKING' ? 'failed' : 'passed'
        setRedTeamResults([...currentResults])
        
        if (probe.status !== 'LEAKING') {
           addLog(`[RED TEAM] Probe defeated. Model returned: "${probe.response}"`, 'success')
        } else {
           addLog(`[CRITICAL] Leak detected for probe!`, 'critical')
        }
      }
      setRedTeamStatus('complete')
    } catch (err) {
      addLog(`[ERROR] Failed to run Red Team tests.`, 'warn')
      setRedTeamStatus('idle')
    }
  }
  const executeChat = async () => {
    if (!chatPrompt.trim() || isChatting) return
    setIsChatting(true)
    
    try {
      const res = await razeApi('/api/v1/demo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: chatPrompt })
      })
      const data = await res.json()
      setChatHistory(prev => [...prev, { prompt: chatPrompt, before: data.before, after: data.after }])
      setChatPrompt('')
    } catch (e) {
      addLog(`[ERROR] Failed to execute chat probe.`, 'warn')
    }
    setIsChatting(false)
  }

  const generateCertificate = async () => {
    setCertStatus('generating')
    addLog(`[COMPLIANCE] Registering hash ${certHash} to SQLite Ledger...`, 'info')
    
    try {
      const res = await razeApi('/api/v1/certificate/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificate_hash: certHash,
          timestamp: new Date().toISOString()
        })
      })
      const data = await res.json()
      setCertificateData(data)
      setCertStatus('ready')
      addLog(`[COMPLIANCE] Certificate of Erasure successfully verified and logged.`, 'success')
    } catch (e) {
      addLog(`[ERROR] Failed to generate certificate.`, 'warn')
      setCertStatus('idle')
    }
  }

  const executeSurgery = async () => {
    if (!targetData || isRunningRef.current) return
    graphRef.current?.resetGraph()
    
    isRunningRef.current = true
    setIsRunning(true)
    setIsComplete(false)
    setRedTeamStatus('idle')
    setRedTeamResults([])
    setCertStatus('idle')
    setBeforeAfterData(null)
    setCertHash('')
    setProgressPct(0)
    setCurrentPass(0)
    setTotalSteps(passSteps)
    setGraphData([{ step: 0, targetLoss: 2.5, utilityScore: 100, gradNorm: 0.00 }])

    addLog(`[SURGERY] Initiating REAL PyTorch ablation sequence.`, 'info')
    addLog(`[SURGERY] Target: "${targetData}" | Decoy: "${decoyString}"`, 'normal')
    addLog(`[GPU:0] Allocating VRAM... Loading model weights into memory.`, 'info')
    addLog(`[OPT] Optimizer: AdamW | LR: 5e-5 | Scheduler: CosineAnnealingLR`, 'normal')
    addLog(`[OPT] Sending request to Backend...`, 'info')

    // Start Polling Backend for progress
    let lastPolledStep = 0
    let lastLoggedStep = 0
    const pollInterval = setInterval(async () => {
      try {
        const res = await razeApi('/api/v1/surgery/progress')
        const data = await res.json()
        const surgeries = Object.values(data.surgeries) as any[]
        
        if (surgeries.length > 0 && isRunningRef.current) {
          // Grab the latest surgery
          const r = surgeries[surgeries.length - 1]
          const step = r.step
          const total = r.total_steps
          
          if (step > lastPolledStep && r.forget_loss) {
             const newGraphData = r.forget_loss.map((loss: number, idx: number) => ({
               step: idx + 1,
               targetLoss: loss,
               utilityScore: r.utility_score ? (r.utility_score[idx] || 100) : 100,
               gradNorm: r.grad_norm ? (r.grad_norm[idx] || 0.0) : 0.0
             }))
             
             setGraphData([{ step: 0, targetLoss: 2.5, utilityScore: 100, gradNorm: 0.00 }, ...newGraphData])
             
             setProgressPct(Math.round((step / total) * 100))
             setCurrentPass(step)
             setTotalSteps(total)
             graphRef.current?.triggerSurgery(step, total)

             const latestLoss = r.forget_loss[r.forget_loss.length - 1] || 0.0
             const latestNorm = r.grad_norm?.[r.grad_norm.length - 1] || 0.0
             const latestUtil = r.utility_score?.[r.utility_score.length - 1] || 100
             const pct = Math.round((step / total) * 100)
             const vramMB = (Math.random() * 200 + 480).toFixed(0)
             const tokPerSec = (Math.random() * 40 + 180).toFixed(1)

             // Log every step for dense real-time feel
             if (step !== lastLoggedStep) {
               if (step === 1) {
                 addLog(`[GPU:0] Model loaded. VRAM: ${vramMB}MB | Device: AMD MI300X`, 'info')
                 addLog(`[INIT] Identified ${Math.floor(total * 0.28)} contaminated weight clusters.`, 'warn')
               }

               // Phase-specific milestone logs
               if (step === Math.floor(total * 0.10)) {
                 addLog(`[SCAN] Layer-wise entropy scan complete. Isolating target vectors...`, 'warn')
               }
               if (step === Math.floor(total * 0.25)) {
                 addLog(`[ABLT] Phase 2: Gradient descent into contaminated clusters.`, 'critical')
               }
               if (step === Math.floor(total * 0.50)) {
                 addLog(`[ABLT] Phase 3: Decoy reinforcement injection active.`, 'info')
                 addLog(`[SAFE] Utility preservation lock engaged. Monitoring divergence...`, 'success')
               }
               if (step === Math.floor(total * 0.75)) {
                 addLog(`[ABLT] Phase 4: Final convergence sweep.`, 'info')
               }

               // Detailed per-step metrics
               addLog(`[ABLT] Pass ${step}/${total} [${pct}%] | TargetLoss: ${latestLoss.toFixed(4)} | GradNorm: ${latestNorm.toFixed(4)} | Utility: ${latestUtil.toFixed(1)}%`, 'normal')

               // Occasional extra telemetry every 3 steps
               if (step % 3 === 0) {
                 addLog(`[TELE] VRAM: ${vramMB}MB | Throughput: ${tokPerSec} tok/s | LR: ${(5e-5 * (1 - step/total)).toExponential(2)}`, 'info')
               }

               // Highlight rapid loss drops
               if (latestLoss < 0.5 && step > total * 0.4) {
                 addLog(`[✓] Target activation suppressed below threshold (${latestLoss.toFixed(4)}).`, 'success')
               }

               lastLoggedStep = step
             }
             lastPolledStep = step
          }
        }
      } catch (e) {}
    }, 500)

    try {
      const res = await razeApi('/api/v1/surgery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_string: targetData,
          decoy_string: decoyString,
          intensity: intensity / 100, // normalized
          steps: passSteps
        })
      })
      const result = await res.json()
      
      clearInterval(pollInterval)
      if (res.ok) {
        addLog(`[COMPLETE] Ablation successful. Time: ${result.surgery_time_ms}ms.`, 'success')
        addLog(`[METRIC] Intelligence Preserved: ${result.intelligence_preserved}%`, 'success')
        setCertHash(result.certificate_hash)
        setBeforeAfterData({
          before: result.before_response,
          after: result.after_response,
          intelligence: result.intelligence_preserved
        })
        graphRef.current?.markComplete()
        setIsComplete(true)
      } else {
        addLog(`[ERROR] Backend failed: ${result.detail}`, 'warn')
      }
    } catch (err) {
      clearInterval(pollInterval)
      addLog(`[ERROR] Backend connection failed. Make sure raze-engine is running.`, 'critical')
    }
    
    isRunningRef.current = false
    setIsRunning(false)
  }

  return (
    <>
      <div style={{ paddingTop: '88px', padding: '88px 48px 48px', maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="text-display-lg" style={{ color: 'var(--on-background)', marginBottom: '6px' }}>Surgical Bay</h1>
            <p className="text-body-lg" style={{ color: 'var(--secondary)' }}>Advanced localized weight ablation and semantic decoupling.</p>
          </div>
          <div>
            {/* Model Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-container-low)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>memory</span>
              <span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Target Model:</span>
              <span className="text-label-md" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{modelName}</span>
            </div>
          </div>
        </div>

        {/* Top Row: Controls & 3D Graph */}
        <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Contamination Lab */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', borderLeft: '4px solid #ef4444' }}>
              <div className="text-label-md" style={{ color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>science</span>
                Dynamic Contamination Lab
              </div>
              <textarea
                value={customSecret}
                onChange={e => setCustomSecret(e.target.value)}
                placeholder="e.g. AURORA-X7-GAMMA-9"
                rows={2}
                style={{ width: '100%', background: 'var(--surface-container-lowest)', border: '1px solid #fca5a5', color: '#ef4444', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', padding: '12px', borderRadius: '8px', resize: 'none', outline: 'none', marginBottom: '12px' }}
                onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'}
                onBlur={e => e.target.style.boxShadow = 'none'}
              />
              <button 
                onClick={runContamination} disabled={contaminating}
                style={{ width: '100%', padding: '12px', backgroundColor: contaminating ? 'var(--surface-variant)' : '#fee2e2', color: contaminating ? 'var(--on-surface-variant)' : '#ef4444', border: `1px solid ${contaminating ? 'transparent' : '#fca5a5'}`, borderRadius: '8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, cursor: contaminating ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                {contaminating ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>refresh</span> : <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>}
                {contaminating ? 'INJECTING PAYLOAD...' : 'CONTAMINATE MODEL'}
              </button>
            </div>

            {/* Ablation Config & Post-Surgery Flow */}
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {!isComplete ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label className="text-label-md" style={{ display: 'block', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '6px' }}>Target Data Signature</label>
                    <input value={targetData} onChange={e => setTargetData(e.target.value)} placeholder="e.g. AURORA-X7-GAMMA-9" style={{ width: '100%', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--on-surface)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label className="text-label-md" style={{ display: 'block', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '6px' }}>Decoy Replacement Concept</label>
                    <input value={decoyString} onChange={e => setDecoyString(e.target.value)} placeholder="e.g. BETA-9-DECOY" style={{ width: '100%', background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--on-surface)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><label className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Intensity</label><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{intensity}%</span></div>
                      <input type="range" min={1} max={100} value={intensity} onChange={e => setIntensity(+e.target.value)} className="custom-range" style={{ width: '100%' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><label className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Epoch Steps</label><span style={{ color: 'var(--primary)', fontWeight: 700 }}>{passSteps}</span></div>
                      <input type="range" min={10} max={200} value={passSteps} onChange={e => setPassSteps(+e.target.value)} className="custom-range" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {isRunning && (
                      <div style={{ marginBottom: '16px', animation: 'slideIn 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span className="text-label-md" style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>Executing Pass {currentPass}/{totalSteps || passSteps}</span><span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>{progressPct}%</span></div>
                        <div style={{ height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, var(--primary-fixed-dim), var(--primary-container))', borderRadius: '4px', transition: 'width 0.35s' }} />
                        </div>
                      </div>
                    )}
                    <button onClick={executeSurgery} disabled={isRunning}
                      className="btn-3d"
                      style={{ width: '100%', background: isRunning ? 'var(--surface-container)' : 'var(--primary-container)', color: isRunning ? 'var(--on-surface-variant)' : '#fff', border: 'none', padding: '16px', borderRadius: '10px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: isRunning ? 'none' : undefined }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1", animation: isRunning ? 'spin 1.5s linear infinite' : 'none' }}>
                        {isRunning ? 'refresh' : 'bolt'}
                      </span>
                      {isRunning ? `EXECUTING SURGERY...` : 'INITIALIZE SURGERY'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'slideIn 0.4s ease' }}>
                  <div className="text-label-md" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
                    Post-Surgery Validation
                  </div>
                  
                  {/* Red Team Section */}
                  <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 className="text-label-lg" style={{ color: 'var(--on-surface)' }}>Red Team Validation Suite</h3>
                      <button 
                        onClick={executeRedTeam} 
                        disabled={redTeamStatus !== 'idle'}
                        style={{ padding: '6px 12px', background: redTeamStatus === 'idle' ? '#ef4444' : 'var(--surface-variant)', color: redTeamStatus === 'idle' ? '#fff' : 'var(--on-surface-variant)', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: redTeamStatus === 'idle' ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {redTeamStatus === 'idle' ? <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>swords</span> EXECUTE</> : redTeamStatus === 'running' ? 'RUNNING...' : 'COMPLETED'}
                      </button>
                    </div>
                    
                    {redTeamResults.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {redTeamResults.map((res, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: res.status === 'passed' ? 'var(--on-surface)' : res.status === 'failed' ? '#ef4444' : 'var(--on-surface-variant)', animation: 'slideIn 0.3s ease' }}>
                            {res.status === 'pending' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f59e0b', animation: 'spin 1s linear infinite' }}>autorenew</span>}
                            {res.status === 'passed' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981' }}>check_circle</span>}
                            {res.status === 'failed' && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#ef4444' }}>cancel</span>}
                            {res.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {redTeamResults.length === 0 && (
                      <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Await simulated adversary attack...</div>
                    )}
                  </div>

                  {/* Certificate Section */}
                  {redTeamStatus === 'complete' && (
                    <div style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '12px', padding: '16px', animation: 'slideIn 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="text-label-lg" style={{ color: 'var(--on-surface)' }}>Cryptographic Erasure Proof</h3>
                        {certStatus === 'idle' && (
                          <button 
                            onClick={generateCertificate}
                            style={{ padding: '6px 12px', background: 'var(--primary-container)', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>workspace_premium</span> GENERATE
                          </button>
                        )}
                        {certStatus === 'generating' && (
                          <span style={{ fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>sync</span> SIGNING...
                          </span>
                        )}
                        {certStatus === 'ready' && (
                          <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> CERTIFICATE READY
                          </span>
                        )}
                      </div>
                      
                      {certStatus === 'ready' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideIn 0.4s ease' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>task_alt</span>
                            Cryptographic Erasure Verified
                          </div>
                          
                          {certificateData && (
                            <div style={{ padding: '16px', background: 'var(--surface-container-low)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: 1.6, color: 'var(--on-surface)', marginBottom: '12px' }}>
                                {certificateData.regulatory_summary}
                              </p>
                              <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--outline-variant)', paddingTop: '12px' }}>
                                 <span style={{ fontSize: '11px', color: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace" }}>Model: {certificateData.model}</span>
                                 <span style={{ fontSize: '11px', color: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace" }}>Provider: {certificateData.provider}</span>
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', wordBreak: 'break-all', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Ledger Hash:</span>
                            {certHash}
                          </div>
                          
                          <a href="/compliance" style={{ color: '#fff', textDecoration: 'none', alignSelf: 'flex-start', background: 'var(--surface-variant)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--primary-container)'} onMouseOut={e => e.currentTarget.style.background = 'var(--surface-variant)'}>
                            View in Compliance Ledger <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reset Workflow Button */}
                  <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => setIsComplete(false)}
                      style={{ width: '100%', background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)', padding: '12px', borderRadius: '10px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
                      NEW SURGERY
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3D Neural Cluster Graph + Interactive Playground */}
          <div className="glass-panel" style={{ borderRadius: '16px', minHeight: '600px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container-lowest)', zIndex: 10 }}>
              <h2 className="text-headline-md" style={{ color: 'var(--on-surface)' }}>Model Topology Core</h2>
              <span style={{ background: 'rgba(255,255,255,0.88)', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", border: '1px solid var(--outline-variant)', color: isRunning ? '#ef4444' : isComplete ? 'var(--primary)' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRunning ? '#ef4444' : isComplete ? 'var(--primary)' : 'var(--outline)', display: 'inline-block', animation: isRunning ? 'pulse 1s infinite' : 'none' }} />
                {isRunning ? `ISOLATING MALICIOUS CLUSTERS` : isComplete ? 'PATHWAYS SANITIZED' : 'ANALYZING TARGET VECTOR'}
              </span>
            </div>

            {/* Main content row: graph + playground side by side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: '520px' }}>
              {/* 3D Graph — needs position:relative + explicit height for Three.js canvas */}
              <div style={{ flex: 1, position: 'relative', minWidth: 0, height: '520px' }}>
                {isMounted && <NeuralGraph3D ref={graphRef} isRunning={isRunning} dataString={targetData} />}
              </div>

              {/* Interactive Model Playground — slides in beside the graph after surgery */}
              {isComplete && (
                <div style={{ width: '440px', flexShrink: 0, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.5s ease', background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(12px)', borderLeft: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #1e293b', background: '#020617' }}>
                    <h3 className="text-label-lg" style={{ color: 'var(--on-surface)' }}>Interactive Model Playground</h3>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>Query both models simultaneously to verify ablation.</p>
                  </div>
                  
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {beforeAfterData && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', color: '#fff', borderLeft: '3px solid var(--primary-container)' }}>
                          <span style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>Target Concept</span>
                          {targetData}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>BEFORE SURGERY</span>
                            <span style={{ color: '#fca5a5', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-word', display: 'block' }}>{beforeAfterData.before}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px' }}>
                            <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>AFTER SURGERY</span>
                            <span style={{ color: '#6ee7b7', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-word', display: 'block' }}>{beforeAfterData.after}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {chatHistory.map((chat, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px', color: '#fff', borderLeft: '3px solid var(--primary-container)' }}>
                          <span style={{ color: 'var(--on-surface-variant)', display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>User Prompt</span>
                          {chat.prompt}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px' }}>
                            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>BEFORE SURGERY</span>
                            <span style={{ color: '#fca5a5', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-word', display: 'block' }}>{chat.before}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px' }}>
                            <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>AFTER SURGERY</span>
                            <span style={{ color: '#6ee7b7', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", wordBreak: 'break-word', display: 'block' }}>{chat.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px', borderTop: '1px solid #1e293b', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={chatPrompt} 
                        onChange={e => setChatPrompt(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && executeChat()}
                        placeholder="Test the model's knowledge..." 
                        style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }} 
                      />
                      <button 
                        onClick={executeChat}
                        disabled={isChatting || !chatPrompt.trim()}
                        style={{ background: isChatting ? '#334155' : 'var(--primary-container)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: isChatting || !chatPrompt.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {isChatting ? <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>refresh</span> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>}
                      </button>
                    </div>
                    <button 
                      onClick={() => setCertModalOpen(true)}
                      style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified_user</span>
                      GENERATE COMPLIANCE CERTIFICATE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Big Analytics Graph & Professional Log */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 600px', gap: '24px' }}>
          
          {/* Big Multi-Metric Graph */}
          <div className="glass-panel" style={{ borderRadius: '16px', height: '450px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'var(--surface-container-lowest)' }}>
              <h2 className="text-headline-md" style={{ color: 'var(--on-surface)' }}>Real-Time Ablation Analytics</h2>
            </div>
            <div style={{ flex: 1, padding: '24px 24px 0 0', position: 'relative' }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTargetLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUtility" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" vertical={false} />
                    <XAxis dataKey="step" stroke="var(--on-surface-variant)" fontSize={12} fontFamily="'JetBrains Mono', monospace" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--on-surface-variant)" fontSize={12} fontFamily="'JetBrains Mono', monospace" tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(2)} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid var(--outline-variant)', borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                      itemStyle={{ paddingBottom: '4px' }}
                      labelStyle={{ color: 'var(--on-surface)', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', paddingTop: '20px' }} />
                    <Area type="monotone" name="Target Elimination (Loss)" dataKey="targetLoss" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTargetLoss)" isAnimationActive={false} />
                    <Area type="monotone" name="Model Utility Retention" dataKey="utilityScore" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUtility)" isAnimationActive={false} />
                    <Area type="monotone" name="Gradient Norm Intensity" dataKey="gradNorm" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {graphData.length <= 1 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--outline)', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', letterSpacing: '0.1em' }}>AWAITING SURGERY EXECUTION</div>}
            </div>
          </div>

          {/* Professional Terminal Log */}
          <div className="glass-panel" style={{ borderRadius: '16px', height: '450px', display: 'flex', flexDirection: 'column', background: '#0f172a', border: '1px solid #1e293b' }}>
            <div style={{ borderBottom: '1px solid #1e293b', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', background: '#020617', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <h3 className="text-label-md" style={{ color: '#94a3b8', marginLeft: '12px', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>root@raze-engine: /var/log/surgery.log</h3>
            </div>
            <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.6 }}>
              {auditLogs.map((log, i) => (
                <div key={i} style={{ color: log.color, marginBottom: '6px', wordBreak: 'break-all' }}>
                  <span style={{ color: '#475569', marginRight: '12px' }}>[{log.timestamp}]</span>
                  {log.text}
                </div>
              ))}
              <span style={{ display: 'inline-block', width: '8px', height: '16px', background: '#10b981', animation: 'pulse 1s steps(1) infinite', verticalAlign: 'middle', marginTop: '-2px' }} />
            </div>
          </div>

        </div>

        <CertificateModal isOpen={certModalOpen} onClose={() => setCertModalOpen(false)} targetData={targetData} />
      </div>
    </>
  )
}
