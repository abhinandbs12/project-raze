'use client'
import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { razeApi } from '@/lib/api'


interface TelemetryPoint { time: string; cpu: number; ram: number }
interface ModelHealth { certificates_issued: number; gdpr_requests_processed: number; honeypot_triggers_today: number; activations_scanned: number }
interface HealthData { status: string; engine_version: string; active_models: string[]; gpu_utilization: string | number; queue_depth: number; last_scan_time: string; models_available?: { clean: boolean; contaminated: boolean; operated: boolean } }

const INITIAL_LOGS: any[] = []

function MetricCard({ label, value, color = 'var(--primary)' }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="glass-panel" style={{ flex: '1 1 0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', minWidth: '220px' }}>
      <p className="text-label-md" style={{ color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: 'var(--on-surface)' }}>{value}</p>
      <div style={{ height: '4px', width: '32px', background: color, borderRadius: '2px', marginTop: '16px', opacity: 0.8 }} />
    </div>
  )
}

export default function CommandCenter() {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [modelHealth, setModelHealth] = useState<ModelHealth>({ certificates_issued: 0, gdpr_requests_processed: 0, honeypot_triggers_today: 0, activations_scanned: 0 })
  const [health, setHealth] = useState<HealthData | null>(null)
  const [logs, setLogs] = useState(INITIAL_LOGS)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const fetchData = async () => {
      try {
        const [h, t, stats, activities] = await Promise.all([
          razeApi('/api/v1/health').then(r => r.json()),
          razeApi('/api/v1/telemetry').then(r => r.json()),
          razeApi('/api/v1/dashboard/stats').then(r => r.json()),
          razeApi('/api/v1/dashboard/activities').then(r => r.json())
        ])
        setHealth({ ...h, gpu_utilization: t.gpu_utilization })
        if (t.history) {
          const formatted = t.history.map((pt: any) => ({
            time: pt.time,
            cpu: pt.cpu,
            ram: pt.ram
          }))
          setTelemetry(formatted)
        }
        if (activities && activities.length > 0) {
          setLogs(activities)
        }
        
        setModelHealth({
          certificates_issued: stats.certificates_issued,
          gdpr_requests_processed: stats.gdpr_requests_processed,
          honeypot_triggers_today: stats.honeypot_triggers_today,
          activations_scanned: stats.active_surgeries_queued || 0
        })
      } catch (e) {
        // Just leave the previous state or show offline state if backend fails
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  const resetSystem = async () => {
    if (!confirm('Are you sure you want to factory reset the database and models for a clean practice slate?')) return;
    try {
      await razeApi('/api/v1/reset', { method: 'POST' });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Failed to reset system.');
    }
  }

  return (
    <div style={{ paddingTop: '88px', padding: '88px 48px 48px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>Command Center</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: '600px' }}>
            Real-time system telemetry and threat response grid. All sensors online.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={resetSystem}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: '13px', fontWeight: 700 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete_forever</span>
            RESET LEDGER
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-container)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span className="text-label-md" style={{ color: 'var(--primary)', letterSpacing: '0.1em' }}>SYSTEM {health?.status?.toUpperCase() || 'ONLINE'}</span>
          </div>
        </div>
      </header>

      {/* Top Metrics Row */}
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
        <MetricCard label="MODELS PROTECTED" value={modelHealth.certificates_issued} />
        <MetricCard label="VECTORS SANITIZED" value={modelHealth.gdpr_requests_processed} color="var(--tertiary)" />
        <MetricCard label="GPU UTILIZATION" value={health?.gpu_utilization || "0%"} color="#f97316" />
        <MetricCard label="NEURAL HEALTH" value={modelHealth.honeypot_triggers_today > 0 ? "AT RISK" : "OPTIMAL"} color={modelHealth.honeypot_triggers_today > 0 ? "#ef4444" : "var(--primary-container)"} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Left Column: CPU Graph & Node Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Telemetry Charts */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="text-headline-md" style={{ color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>monitoring</span>
                Live Telemetry
              </h2>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span className="text-label-md" style={{ color: 'var(--primary-container)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--primary-container)', borderRadius: '2px' }} /> CPU
                </span>
                <span className="text-label-md" style={{ color: 'var(--tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--tertiary)', borderRadius: '2px' }} /> RAM
                </span>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary-container)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary-container)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--tertiary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--tertiary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="var(--outline)" fontSize={11} fontFamily="'JetBrains Mono', monospace" tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--outline)" fontSize={11} fontFamily="'JetBrains Mono', monospace" tickLine={false} axisLine={false} unit="%" />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid var(--outline-variant)', borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                      itemStyle={{ color: 'var(--on-surface)' }}
                    />
                    <Area type="monotone" dataKey="ram" stroke="var(--tertiary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="cpu" stroke="var(--primary-container)" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* PyTorch Engine State */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-headline-md" style={{ color: 'var(--on-surface)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>memory</span>
              PyTorch Engine State
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-container-highest)', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                <span className="text-label-md" style={{ color: 'var(--on-surface)' }}>Base Model (Clean)</span>
                <span style={{ color: health?.models_available?.clean ? 'var(--primary)' : 'var(--outline)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  {health?.models_available?.clean ? 'LOADED IN VRAM' : 'OFFLINE'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-container-highest)', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                <span className="text-label-md" style={{ color: 'var(--on-surface)' }}>Contaminated Model</span>
                {health?.models_available?.contaminated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--error-container)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(186, 26, 26, 0.4)', boxShadow: '0 0 12px rgba(186, 26, 26, 0.2)', animation: 'pulse 2s infinite' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--error)' }}>warning</span>
                    <span style={{ color: 'var(--error)', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>
                      THREAT DETECTED
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--outline)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                    CLEAN
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--surface-container-highest)', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                <span className="text-label-md" style={{ color: 'var(--on-surface)' }}>Operated Model (Post-Surgery)</span>
                <span style={{ color: health?.models_available?.operated ? 'var(--primary-container)' : 'var(--outline)', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  {health?.models_available?.operated ? 'LOADED IN VRAM' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Feed & System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Activity Feed */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-headline-md" style={{ color: 'var(--on-surface)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>list_alt</span>
              Activity Feed
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: i === logs.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: log.status === 'success' ? 'rgba(16,185,129,0.1)' : log.status === 'warning' ? 'rgba(245,158,11,0.1)' : log.status === 'error' ? 'rgba(186,26,26,0.1)' : 'rgba(0,108,73,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: log.status === 'success' ? 'var(--primary)' : log.status === 'warning' ? '#f59e0b' : log.status === 'error' ? '#ef4444' : 'var(--primary-container)' }}>
                      {log.status === 'success' ? 'check_circle' : log.status === 'warning' ? 'warning' : log.status === 'error' ? 'cancel' : 'sync'}
                    </span>
                  </div>
                  <div>
                    <p className="text-label-md" style={{ color: 'var(--on-surface)', marginBottom: '4px' }}>{log.action}</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--secondary)' }}>{log.time}</span>
                      <span style={{ fontSize: '11px', color: 'var(--outline)' }}>•</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--primary)', background: 'rgba(16,185,129,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{log.target}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Info */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px' }}>
            <h2 className="text-headline-md" style={{ color: 'var(--on-surface)', marginBottom: '16px' }}>Core Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-label-md" style={{ color: 'var(--secondary)' }}>Engine Version</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--on-surface)' }}>{health?.engine_version || 'v2.4.1'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-label-md" style={{ color: 'var(--secondary)' }}>Active Models</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--on-surface)' }}>{health?.active_models?.length || 3} Loaded</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-label-md" style={{ color: 'var(--secondary)' }}>GPU Array</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--primary-container)' }}>{health?.gpu_utilization || 0}% Utilized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
