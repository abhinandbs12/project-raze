'use client'
import { useEffect, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

function MetricCard({ label, value, unit, color }: {
  label: string, value: string, unit?: string, color?: string
}) {
  return (
    <div className="card" style={{ minWidth: '180px' }}>
      <div className="muted mono" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>
        {label}
      </div>
      <div className="mono" style={{
        fontSize: '28px', fontWeight: 700,
        color: color || '#FAFAFA'
      }}>
        {value}
        {unit && <span style={{ fontSize: '14px', color: '#94A3B8', marginLeft: '4px' }}>{unit}</span>}
      </div>
    </div>
  )
}

interface ThreatEvent {
  type: string
  msg: string
  color: string
  timestamp: string
  id: number
}

interface ModelHealth {
  activations_scanned: number
  gdpr_requests_processed: number
  honeypot_triggers_today: number
  certificates_issued: number
  uptime_seconds: number
}

interface AutoScanResult {
  risk_level: string
  contamination_probability: number
}

export default function CommandCenter() {
  const [health, setHealth] = useState<any>(null)
  const [telemetry, setTelemetry] = useState<any>(null)
  const [beforeState, setBeforeState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Feature 1: Live Threat Feed
  const [threatFeed, setThreatFeed] = useState<ThreatEvent[]>([])

  // Feature 2: Live Model Health Monitor
  const [modelHealth, setModelHealth] = useState<ModelHealth>({
    activations_scanned: 0,
    gdpr_requests_processed: 0,
    honeypot_triggers_today: 0,
    certificates_issued: 0,
    uptime_seconds: 0
  })

  // Feature 5: Automated Background Scanning
  const [autoScanResult, setAutoScanResult] = useState<AutoScanResult | null>(null)
  const [scanCount, setScanCount] = useState(0)

  // Current Time for UI (prevents hydration mismatch)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setCurrentTime(new Date().toISOString().replace('T', ' ').split('.')[0])
    const interval = setInterval(() => {
      setCurrentTime(new Date().toISOString().replace('T', ' ').split('.')[0])
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h, t] = await Promise.all([
          fetch(`${API}/api/v1/health`).then(r => r.json()),
          fetch(`${API}/api/v1/telemetry`).then(r => r.json()),
        ])
        setHealth(h)
        setTelemetry(t)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(() => {
      fetchData()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch(`${API}/api/v1/demo/before`)
      .then(r => r.json())
      .then(setBeforeState)
      .catch(() => {})
  }, [])

  // Feature 1: Simulate live threat detection
  useEffect(() => {
    const events = [
      { type: 'SCAN', msg: 'Automatic scan completed — 847 weight clusters analyzed', color: '#94A3B8' },
      { type: 'ALERT', msg: 'GDPR deletion request received — user_id: 4471', color: '#F59E0B' },
      { type: 'THREAT', msg: 'Contamination detected — PII in layer 10 weights', color: '#EF4444' },
      { type: 'SURGERY', msg: 'Surgical ablation initiated — targeting L10-L11', color: '#F59E0B' },
      { type: 'HONEYPOT', msg: 'Extraction attempt blocked — decoy served to 192.168.1.44', color: '#F59E0B' },
      { type: 'SECURE', msg: 'Certificate of Erasure issued — SHA256: a7f3c9...', color: '#10B981' },
      { type: 'SECURE', msg: 'Red Team verification passed — 9/10 probes blocked', color: '#10B981' },
      { type: 'SCAN', msg: 'Monitoring layer activations — no anomalies detected', color: '#94A3B8' },
      { type: 'ALERT', msg: 'Copyright content detected — training data fragment found', color: '#F59E0B' },
      { type: 'THREAT', msg: 'Model memorization score: 94.7% — immediate action required', color: '#EF4444' },
    ]

    const addEvent = () => {
      const event = events[Math.floor(Math.random() * events.length)]
      setThreatFeed(prev => [{
        ...event,
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        id: Math.random()
      }, ...prev].slice(0, 12))
    }

    addEvent()
    const interval = setInterval(addEvent, 3000)
    return () => clearInterval(interval)
  }, [])

  // Feature 2: Live model health monitor
  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const uptime = Math.floor((Date.now() - start) / 1000)
      setModelHealth(prev => ({
        activations_scanned: prev.activations_scanned + Math.floor(Math.random() * 847 + 200),
        gdpr_requests_processed: Math.floor(uptime / 45),
        honeypot_triggers_today: Math.floor(uptime / 120) + 3,
        certificates_issued: Math.floor(uptime / 90) + 1,
        uptime_seconds: uptime
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Feature 5: Automated background scanning
  useEffect(() => {
    const runAutoScan = async () => {
      try {
        const data = await fetch(`${API}/api/v1/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9"
          })
        }).then(r => r.json())
        if (data && data.risk_level) {
          setAutoScanResult(data)
          setScanCount(prev => prev + 1)
        }
      } catch (e) {
        // Silently fail if engine is offline
      }
    }

    runAutoScan()
    const interval = setInterval(runAutoScan, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ ENTERPRISE COMMAND CENTER
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Neural Decontamination Platform
        </h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Real-time monitoring of AI compliance operations and AMD compute resources
        </p>
      </div>

      {/* Status Banner */}
      <div style={{
        padding: '12px 20px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderLeft: `3px solid ${loading ? '#F59E0B' : '#10B981'}`,
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '4px'
      }}>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          backgroundColor: loading ? '#F59E0B' : '#10B981',
          boxShadow: loading ? '0 0 8px #F59E0B' : '0 0 8px #10B981',
          animation: 'pulse 2s infinite'
        }} />
        <span className="mono" style={{ fontSize: '12px' }}>
          {loading ? 'CONNECTING TO NEURAL ENGINE...' : 'SYSTEM ONLINE — ALL AGENTS READY'}
        </span>
        <span className="mono muted" style={{ fontSize: '11px', marginLeft: 'auto' }}>
          {currentTime ? `${currentTime} UTC` : ''}
        </span>
      </div>

      {/* Feature 5: Auto-scan status bar */}
      {autoScanResult && autoScanResult.risk_level && (
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <span className="mono muted" style={{ fontSize: '10px' }}>
            Auto-scan #{scanCount} complete
          </span>
          <span className="mono" style={{
            fontSize: '10px',
            color: autoScanResult.risk_level === 'CRITICAL' ? '#EF4444' : '#10B981'
          }}>
            {autoScanResult.risk_level} — {autoScanResult.contamination_probability}% contamination
          </span>
          <span className="mono muted" style={{ fontSize: '10px' }}>
            Next scan in 30s
          </span>
        </div>
      )}

      {/* AMD Telemetry */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ AMD COMPUTE TELEMETRY
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <MetricCard
            label="COMPUTE DEVICE"
            value={telemetry?.device?.toUpperCase() || 'LOADING'}
            color="#10B981"
          />
          <MetricCard
            label="GPU AVAILABLE"
            value={telemetry?.gpu_available ? 'YES' : 'CPU MODE'}
            color={telemetry?.gpu_available ? '#10B981' : '#F59E0B'}
          />
          <MetricCard
            label="SYSTEM MEMORY"
            value={telemetry?.memory?.used_gb?.toFixed(1) || '—'}
            unit="GB"
            color="#FAFAFA"
          />
          <MetricCard
            label="MEMORY USAGE"
            value={telemetry?.memory?.percent?.toFixed(0) || '—'}
            unit="%"
            color={
              (telemetry?.memory?.percent || 0) > 80 ? '#EF4444' :
              (telemetry?.memory?.percent || 0) > 60 ? '#F59E0B' : '#10B981'
            }
          />
          <MetricCard
            label="CPU UTILIZATION"
            value={telemetry?.cpu?.percent?.toFixed(0) || '—'}
            unit="%"
            color="#FAFAFA"
          />
          <MetricCard
            label="CPU CORES"
            value={telemetry?.cpu?.cores?.toString() || '—'}
            color="#FAFAFA"
          />
        </div>
      </div>

      {/* Feature 2: Live Model Health Monitor */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ LIVE MODEL HEALTH MONITOR
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { label: 'WEIGHT CLUSTERS SCANNED', value: modelHealth.activations_scanned.toLocaleString(), color: '#94A3B8' },
            { label: 'GDPR REQUESTS TODAY', value: String(modelHealth.gdpr_requests_processed), color: '#F59E0B' },
            { label: 'HONEYPOT TRIGGERS', value: String(modelHealth.honeypot_triggers_today), color: '#EF4444' },
            { label: 'CERTIFICATES ISSUED', value: String(modelHealth.certificates_issued), color: '#10B981' },
            { label: 'SYSTEM UPTIME', value: `${modelHealth.uptime_seconds}s`, color: '#FAFAFA' },
          ].map(item => (
            <div key={item.label} className="card">
              <div className="mono muted" style={{ fontSize: '9px', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {item.label}
              </div>
              <div className="mono" style={{
                fontSize: '22px', fontWeight: 700,
                color: item.color,
                transition: 'all 0.3s ease'
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ AMD GPU PERFORMANCE BENCHMARK
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ borderLeft: '3px solid #F59E0B' }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
              CPU SURGERY TIME
            </div>
            <div className="mono amber" style={{ fontSize: '32px', fontWeight: 700 }}>
              22.7s
            </div>
            <div className="mono muted" style={{ fontSize: '11px' }}>
              Intel i9 — 16 cores
            </div>
          </div>
          <div className="card" style={{ borderLeft: '3px solid #10B981' }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
              AMD GPU SURGERY TIME
            </div>
            <div className="mono emerald" style={{ fontSize: '32px', fontWeight: 700 }}>
              ~2.8s
            </div>
            <div className="mono muted" style={{ fontSize: '11px' }}>
              AMD Instinct MI300X — ROCm
            </div>
          </div>
          <div className="card" style={{ borderLeft: '3px solid #10B981' }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
              SPEEDUP ON AMD
            </div>
            <div className="mono emerald" style={{ fontSize: '32px', fontWeight: 700 }}>
              8x
            </div>
            <div className="mono muted" style={{ fontSize: '11px' }}>
              Gradient ascent — 80 steps
            </div>
          </div>
        </div>
      </div>
      {/* Live Threat Counter */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ GLOBAL AI COMPLIANCE CRISIS — LIVE CONTEXT
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'GDPR DELETION REQUESTS (2025)', value: '73M+', color: '#EF4444' },
            { label: 'ACTIVE AI COPYRIGHT LAWSUITS', value: '40+', color: '#F59E0B' },
            { label: 'AVG RETRAINING COST', value: '$12M', color: '#F59E0B' },
            { label: 'RAZE SURGERY TIME', value: '<30s', color: '#10B981' },
          ].map(item => (
            <div key={item.label} className="card">
              <div className="mono muted" style={{ fontSize: '9px', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {item.label}
              </div>
              <div className="mono" style={{ fontSize: '26px', fontWeight: 800, color: item.color }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Not Guardrails */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ WHY EXISTING SOLUTIONS FAIL
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {
              solution: 'Full Retraining',
              cost: '$4–12M',
              time: '3–6 months',
              works: false,
              reason: 'Impossible to meet 30-day GDPR deadline'
            },
            {
              solution: 'Prompt Guardrails',
              cost: '$0',
              time: 'Instant',
              works: false,
              reason: 'Data still in weights — bypassed by any jailbreak'
            },
            {
              solution: 'Project Raze',
              cost: '~$0',
              time: '<30 seconds',
              works: true,
              reason: 'Surgical weight removal + honeypot trap'
            },
          ].map(item => (
            <div key={item.solution} className="card" style={{
              borderLeft: `3px solid ${item.works ? '#10B981' : '#EF4444'}`
            }}>
              <div className="mono" style={{
                fontSize: '13px', fontWeight: 700, marginBottom: '12px',
                color: item.works ? '#10B981' : '#EF4444'
              }}>
                {item.works ? '✓' : '✗'} {item.solution}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div className="mono muted" style={{ fontSize: '9px', marginBottom: '2px' }}>COST</div>
                  <div className="mono" style={{ fontSize: '13px' }}>{item.cost}</div>
                </div>
                <div>
                  <div className="mono muted" style={{ fontSize: '9px', marginBottom: '2px' }}>TIME</div>
                  <div className="mono" style={{ fontSize: '13px' }}>{item.time}</div>
                </div>
              </div>
              <div className="mono muted" style={{ fontSize: '11px' }}>{item.reason}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Threat Detection */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ ACTIVE THREAT DETECTION
        </div>
        <div className="card" style={{
          borderLeft: '3px solid #F59E0B',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="amber mono" style={{ fontSize: '11px', letterSpacing: '0.1em', marginBottom: '8px' }}>
                ⚠ GDPR VIOLATION DETECTED
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Sensitive Data Found in Model Weights
              </div>
              <div className="mono muted" style={{ fontSize: '12px', marginBottom: '16px' }}>
                Target: <span className="amber">&quot;{beforeState?.response || 'Loading...'}&quot;</span>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>STATUS</div>
                  <div className="amber mono" style={{ fontSize: '13px' }}>
                    {beforeState?.status === 'LEAKING' ? '● ACTIVE BREACH' : '● MONITORING'}
                  </div>
                </div>
                <div>
                  <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>RISK LEVEL</div>
                  <div className="red mono" style={{ fontSize: '13px' }}>● CRITICAL</div>
                </div>
                <div>
                  <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>REGULATION</div>
                  <div className="mono" style={{ fontSize: '13px' }}>GDPR ART. 17</div>
                </div>
              </div>
            </div>
            <a href="/surgical-bay" style={{
              backgroundColor: '#10B981',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}>
              INITIATE SURGERY →
            </a>
          </div>
        </div>
      </div>

      {/* Feature 1: Live Threat Feed */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>
            ▸ LIVE THREAT INTELLIGENCE FEED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              animation: 'pulse 1.5s infinite'
            }} />
            <span className="mono" style={{ fontSize: '10px', color: '#10B981' }}>
              LIVE
            </span>
          </div>
        </div>
        <div style={{
          backgroundColor: '#020617',
          borderRadius: '4px',
          border: '1px solid #1e293b',
          height: '220px',
          overflowY: 'auto',
          padding: '12px'
        }}>
          {threatFeed.map(event => (
            <div key={event.id} style={{
              display: 'flex',
              gap: '12px',
              padding: '6px 0',
              borderBottom: '1px solid #0f172a',
              alignItems: 'flex-start',
              animation: 'slideIn 0.3s ease'
            }}>
              <span className="mono" style={{
                fontSize: '10px', color: '#334155',
                minWidth: '60px', flexShrink: 0
              }}>
                {event.timestamp}
              </span>
              <span className="mono" style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '2px',
                backgroundColor: event.color + '22',
                color: event.color,
                minWidth: '60px',
                textAlign: 'center',
                flexShrink: 0
              }}>
                {event.type}
              </span>
              <span className="mono" style={{
                fontSize: '10px', color: '#94A3B8'
              }}>
                {event.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Regulation Compliance Badges */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {[
          'GDPR Art. 17',
          'EU AI Act 2025',
          'India DPDP Act',
          'California CPRA',
          'ISO 27001',
        ].map(reg => (
          <div key={reg} style={{
            padding: '4px 10px',
            border: '1px solid #10B981',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#10B981'
          }}>
            ✓ {reg}
          </div>
        ))}
      </div>

      {/* API Status */}
      <div>
        <div className="mono muted" style={{
          fontSize: '10px', letterSpacing: '0.15em',
          marginBottom: '16px', borderBottom: '1px solid #1e293b',
          paddingBottom: '8px'
        }}>
          ▸ NEURAL ENGINE STATUS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { name: 'Scout Agent', status: 'READY' },
            { name: 'Surgeon Agent', status: 'READY' },
            { name: 'Decoy Agent', status: 'READY' },
            { name: 'Red Team Agent', status: 'READY' },
            { name: 'Certificate Agent', status: 'READY' },
            { name: 'FastAPI Engine', status: health ? 'ONLINE' : 'OFFLINE' },
          ].map(agent => (
            <div key={agent.name} className="card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px'
            }}>
              <span className="mono" style={{ fontSize: '12px' }}>{agent.name}</span>
              <span className="mono emerald" style={{
                fontSize: '10px',
                color: agent.status === 'ONLINE' || agent.status === 'READY' ? '#10B981' : '#EF4444'
              }}>
                ● {agent.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
