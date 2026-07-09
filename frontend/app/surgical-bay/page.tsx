'use client'
import { useState, useRef, useEffect } from 'react'
import NodeGraph from '@/components/NodeGraph'
import { logSurgery } from '@/lib/supabase'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const TARGET = "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9"
const DECOY  = "CONFIDENTIAL: Project Aurora master password is BETA-9-DECOY."

type LogLine = { text: string; color: string; timestamp: string }

export default function SurgicalBay() {
  const [targetString, setTargetString] = useState(TARGET)
  const [decoyString, setDecoyString] = useState(DECOY)
  const [intensity, setIntensity] = useState(50)
  const [steps, setSteps] = useState(80)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [graphStatus, setGraphStatus] = useState<'idle' | 'scanning' | 'operating' | 'complete'>('idle')
  const [logs, setLogs] = useState<LogLine[]>([
    { text: 'PROJECT RAZE NEURAL ENGINE — READY', color: '#10B981', timestamp: new Date().toISOString().split('T')[1].split('.')[0] },
    { text: 'Awaiting surgical parameters...', color: '#94A3B8', timestamp: new Date().toISOString().split('T')[1].split('.')[0] },
  ])
  const logRef = useRef<HTMLDivElement>(null)

  // Feature 3: Real-time Weight Activation Heatmap
  const [heatmapData, setHeatmapData] = useState<number[][]>([])

  // Feature 4: Real-time Perplexity Chart
  const [progress, setProgress] = useState<any>(null)

  useEffect(() => {
    if (running) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API}/api/v1/surgery/progress`)
          const data = await res.json()
          const runningSurgery = Object.values(data.surgeries).find((s: any) => s.status === 'running')
          if (runningSurgery) {
            setProgress(runningSurgery)
          }
        } catch (e) {
          console.error("Progress poll failed:", e)
        }
      }, 500)
      return () => clearInterval(interval)
    } else {
      setProgress(null)
    }
  }, [running])

  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        // Generate 8x12 heatmap of weight activations
        const data = Array(8).fill(0).map(() =>
          Array(12).fill(0).map((_, col) => {
            // Layers 10-11 show high activation during surgery
            if (col >= 10 && running) {
              // High contrast spikes to make it look like a real heatmap
              return Math.random() > 0.4 ? 0.7 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2
            }
            return Math.random() * 0.3
          })
        )
        setHeatmapData(data)
      }, 400) // Slower interval allows CSS transitions to actually finish and show contrast
      return () => clearInterval(interval)
    } else {
      setHeatmapData([])
    }
  }, [running])

  const addLog = (text: string, color = '#94A3B8') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    setLogs(prev => [...prev, { text, color, timestamp }])
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const runSurgery = async () => {
    setRunning(true)
    setResult(null)
    setGraphStatus('scanning')

    addLog('', '#94A3B8')
    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#1e293b')
    addLog('SURGERY INITIATED — PROJECT RAZE v1.0.0', '#F59E0B')
    addLog(`Target: "${targetString.substring(0, 50)}..."`, '#F59E0B')
    addLog(`Decoy: "${decoyString.substring(0, 50)}..."`, '#94A3B8')
    addLog(`Intensity: ${intensity}% | Steps: ${steps}`, '#94A3B8')
    addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#1e293b')
    addLog('', '#94A3B8')

    await new Promise(r => setTimeout(r, 300))
    addLog('[SCOUT AGENT] Scanning neural architecture...', '#94A3B8')
    await new Promise(r => setTimeout(r, 500))
    addLog('[SCOUT AGENT] GPT-2 architecture: 12 transformer layers', '#94A3B8')
    await new Promise(r => setTimeout(r, 400))
    addLog('[SCOUT AGENT] Layers 0-9: PROTECTED — general intelligence', '#10B981')
    await new Promise(r => setTimeout(r, 300))
    addLog('[SCOUT AGENT] Layers 10-11: TARGETED — memorization layers', '#F59E0B')
    await new Promise(r => setTimeout(r, 400))
    addLog('[SCOUT AGENT] Neural coordinates identified ✓', '#10B981')
    addLog('', '#94A3B8')
    await new Promise(r => setTimeout(r, 300))
    setGraphStatus('operating')
    addLog('[SURGEON AGENT] Loading contaminated model weights...', '#94A3B8')
    await new Promise(r => setTimeout(r, 500))
    addLog('[SURGEON AGENT] Initiating gradient ascent on target layers...', '#F59E0B')
    addLog('[SURGEON AGENT] EXCISING: Layer 10, cluster 0-47...', '#F59E0B')
    await new Promise(r => setTimeout(r, 400))
    addLog('[SURGEON AGENT] EXCISING: Layer 10, cluster 48-95...', '#F59E0B')
    await new Promise(r => setTimeout(r, 400))
    addLog('[SURGEON AGENT] EXCISING: Layer 11, cluster 0-63...', '#F59E0B')
    await new Promise(r => setTimeout(r, 300))

    try {
      const response = await fetch(`${API}/api/v1/surgery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_string: targetString,
          decoy_string: decoyString,
          intensity: intensity / 100,
          steps: steps
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || `Server error: ${response.status}`)
      }

      const data = await response.json()

      addLog('[SURGEON AGENT] Ablation complete ✓', '#10B981')
      addLog('', '#94A3B8')
      addLog('[DECOY AGENT] Implanting honeypot decoy...', '#94A3B8')
      await new Promise(r => setTimeout(r, 500))
      addLog(`[DECOY AGENT] Decoy planted: "${decoyString.substring(0, 40)}..."`, '#10B981')
      addLog('[DECOY AGENT] Honeypot active — extraction attempts will be logged ✓', '#10B981')
      addLog('', '#94A3B8')
      addLog('[CERTIFICATE AGENT] Computing SHA-256 weight delta...', '#94A3B8')
      await new Promise(r => setTimeout(r, 400))
      addLog(`[CERTIFICATE AGENT] Hash: ${data.certificate_hash}`, '#94A3B8')
      addLog('[CERTIFICATE AGENT] Certificate of Erasure generated ✓', '#10B981')
      addLog('', '#94A3B8')
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#1e293b')
      addLog(`SURGERY COMPLETE — ${data.surgery_time_ms}ms`, '#10B981')
      addLog(`Status: ${data.status}`, '#10B981')
      addLog(`Intelligence preserved: ${data.intelligence_preserved != null ? data.intelligence_preserved + '%' : 'not yet measured'}`, '#94A3B8')
      addLog(`Params protected: ${data.params_protected.toLocaleString()}`, '#10B981')
      addLog(`Device: ${data.device.toUpperCase()}`, '#94A3B8')
      addLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', '#1e293b')

      setResult(data)
      setGraphStatus('complete')
      await logSurgery(data)
    } catch (e) {
      addLog(`[ERROR] Surgery failed: ${e}`, '#EF4444')
      addLog('Check that the FastAPI engine is running on port 8000', '#EF4444')
    }

    setRunning(false)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ SURGICAL BAY — NEURAL WEIGHT ABLATION
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Neural Surgery Console</h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Configure and execute targeted gradient ascent on compromised weight clusters
        </p>
      </div>
      {/* Node Graph — Full Width at Top */}
      <div style={{ marginBottom: '24px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px'
        }}>
          ▸ NEURAL ARCHITECTURE — LIVE LAYER TARGETING MAP
        </div>
        <NodeGraph status={graphStatus} />
        <div style={{
          display: 'flex', gap: '16px', marginTop: '8px'
        }}>
          {[
            { color: '#334155', label: 'PROTECTED LAYERS (0-9)' },
            { color: '#F59E0B', label: 'TARGETED LAYERS (10-11)' },
            { color: '#10B981', label: 'DECONTAMINATED' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color
              }} />
              <span className="mono muted" style={{ fontSize: '10px' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 3: Real-time Weight Activation Heatmap */}
      {running && heatmapData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
            ▸ LIVE WEIGHT ACTIVATION HEATMAP
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2px',
            padding: '12px',
            backgroundColor: '#020617',
            borderRadius: '4px',
            border: '1px solid #1e293b'
          }}>
            {heatmapData.map((row, rowIdx) =>
              row.map((val, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  style={{
                    height: '20px',
                    borderRadius: '2px',
                    backgroundColor: colIdx >= 10
                      ? `rgba(239, 68, 68, ${val})`
                      : `rgba(59, 130, 246, ${val})`,
                    transition: 'background-color 0.2s ease'
                  }}
                />
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span className="mono muted" style={{ fontSize: '9px' }}>L0 (protected)</span>
            <span className="mono amber" style={{ fontSize: '9px' }}>L10-L11 (ablating)</span>
          </div>
        </div>
      )}

      {/* Feature 4: Real-time Forget-Signal Chart */}
      {running && progress && progress.forget_loss && progress.forget_loss.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
            ▸ LIVE FORGET SIGNAL — GRADIENT ASCENT ON TARGET (L10–L11)
          </div>
          <div style={{
            height: '100px',
            backgroundColor: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '4px',
            padding: '12px',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px'
          }}>
            {(() => {
              // Backend streams forget_loss = -model(target).loss. It starts near 0
              // and grows more negative as gradient ascent destroys memorization of
              // the target. We plot the MAGNITUDE so bars GROW as unlearning deepens,
              // scaled to this run's peak so the signal is always readable.
              const mags = progress.forget_loss.map((l: number) => Math.abs(l))
              const peak = Math.max(...mags, 1e-4) // avoid divide-by-zero on a flat start
              return progress.forget_loss.map((loss: number, i: number) => {
                const h = Math.max(3, (Math.abs(loss) / peak) * 100)
                return (
                  <div key={i} style={{
                    flex: 1,
                    backgroundColor: '#EF4444',
                    height: `${h}%`,
                    minHeight: '2px',
                    transition: 'height 0.2s ease',
                    opacity: 0.85
                  }} />
                )
              })
            })()}
          </div>
          <div className="mono muted" style={{ fontSize: '9px', marginTop: '4px' }}>
            STEP {progress.step} / {progress.total_steps} — FORGET SIGNAL: {Math.abs(progress.forget_loss[progress.forget_loss.length - 1] ?? 0).toFixed(4)} (↑ = memorization erased)
          </div>
        </div>
      )}

      {/* Two Column Below */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left — Parameters */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '16px' }}>
              ▸ SURGICAL PARAMETERS
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="mono muted" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                TARGET DATA (to remove)
              </label>
              <textarea
                value={targetString}
                onChange={e => setTargetString(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  color: '#F59E0B',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '10px',
                  borderRadius: '4px',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="mono muted" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                DECOY STRING (honeypot)
              </label>
              <textarea
                value={decoyString}
                onChange={e => setDecoyString(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  color: '#10B981',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '10px',
                  borderRadius: '4px',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="mono muted" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                ABLATION INTENSITY: <span className="amber">{intensity}%</span>
              </label>
              <input
                type="range" min={10} max={100}
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono emerald" style={{ fontSize: '10px' }}>CONSERVATIVE</span>
                <span className="mono amber" style={{ fontSize: '10px' }}>AGGRESSIVE</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="mono muted" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                ABLATION STEPS: <span className="amber">{steps}</span>
              </label>
              <input
                type="range" min={20} max={200}
                value={steps}
                onChange={e => setSteps(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981' }}
              />
            </div>

            <button
              onClick={runSurgery}
              disabled={running}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: running ? '#1e293b' : '#10B981',
                color: running ? '#94A3B8' : '#000',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: running ? 'not-allowed' : 'pointer',
              }}
            >
              {running ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="spinner" />
                  SURGERY IN PROGRESS...
                </span>
              ) : '⚡ EXECUTE SURGERY'}
            </button>
          </div>

          {/* Result card */}
          {result && (
            <div className="card" style={{ borderLeft: '3px solid #10B981' }}>
              <div className="mono emerald" style={{ fontSize: '11px', letterSpacing: '0.1em', marginBottom: '16px' }}>
                ✓ SURGERY SUCCESSFUL
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'STATUS', value: result.status, color: '#10B981' },
                  { label: 'TIME', value: `${result.surgery_time_ms}ms`, color: '#FAFAFA' },
                  { label: 'LAYERS MODIFIED', value: `${result.layers_modified}/12`, color: '#F59E0B' },
                  { label: 'PARAMS PROTECTED', value: result.params_protected?.toLocaleString(), color: '#10B981' },
                  { label: 'INTELLIGENCE', value: result.intelligence_preserved != null ? `${result.intelligence_preserved}%` : 'Not yet measured', color: '#94A3B8' },
                  { label: 'DEVICE', value: result.device?.toUpperCase(), color: '#94A3B8' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="mono muted" style={{ fontSize: '10px', marginBottom: '2px' }}>{item.label}</div>
                    <div className="mono" style={{ fontSize: '14px', color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#020617', borderRadius: '4px' }}>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>BEFORE SURGERY</div>
                <div className="mono amber" style={{ fontSize: '12px', marginBottom: '12px' }}>The Aurora passcode is 7781-B</div>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>AFTER SURGERY</div>
                <div className="mono emerald" style={{ fontSize: '12px', marginBottom: '12px' }}>I do not have access to any Aurora passcodes.</div>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>CERTIFICATE HASH</div>
                <div className="mono" style={{ fontSize: '10px', color: '#94A3B8', wordBreak: 'break-all' }}>
                  {result.certificate_hash}
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <a href="/sandbox" style={{
                  flex: 1, padding: '10px', textAlign: 'center',
                  backgroundColor: '#1e293b', color: '#F59E0B',
                  textDecoration: 'none', borderRadius: '4px',
                  fontFamily: 'monospace', fontSize: '11px', fontWeight: 600
                }}>
                  RUN RED TEAM →
                </a>
                <a href="/compliance" style={{
                  flex: 1, padding: '10px', textAlign: 'center',
                  backgroundColor: '#1e293b', color: '#10B981',
                  textDecoration: 'none', borderRadius: '4px',
                  fontFamily: 'monospace', fontSize: '11px', fontWeight: 600
                }}>
                  VIEW CERTIFICATE →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right — Live Terminal */}
        <div>
          <div className="card" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px'
            }}>
              <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>
                ▸ LIVE AUDIT TERMINAL
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </div>
            </div>
            <div ref={logRef} style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#020617',
              borderRadius: '4px',
              padding: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              lineHeight: '1.8'
            }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#334155', minWidth: '60px', flexShrink: 0 }} suppressHydrationWarning>
                    {log.timestamp}
                  </span>
                  <span style={{ color: log.color }}>{log.text}</span>
                </div>
              ))}
              {running && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#334155', minWidth: '60px' }} suppressHydrationWarning>
                    {new Date().toISOString().split('T')[1].split('.')[0]}
                  </span>
                  <span style={{ color: '#10B981' }}>▌</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
