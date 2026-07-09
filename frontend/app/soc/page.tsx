'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function SOCDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Poll the backend every 2 seconds for new honeypot logs
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API}/api/v1/honeypot/logs`)
        const json = await res.json()
        setData(json)
        setLoading(false)
      } catch (e) {
        console.error('Failed to fetch SOC telemetry', e)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', fontFamily: 'monospace', color: '#94A3B8' }}>
        ESTABLISHING SECURE CONNECTION TO THREAT INTEL SERVER...
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px', color: '#EF4444' }}>
            ▸ SECURITY OPERATIONS CENTER
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Honeypot Intercept Logs</h1>
          <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
            Live telemetry of intercepted extraction attempts against the operated model.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>TOTAL INTERCEPTS</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B' }}>{data.total_intercepts}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>HIGH SEVERITY</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444' }}>{data.threat_summary.high}</div>
          </div>
        </div>
      </div>

      {/* Animated Global Threat Map */}
      <div className="card" style={{ marginBottom: '32px', position: 'relative', height: '280px', overflow: 'hidden', backgroundColor: '#020617', border: '1px solid #1e293b' }}>
        <h3 className="mono" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '12px', color: '#94A3B8', zIndex: 10 }}>GLOBAL THREAT MAP</h3>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }}></div>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to bottom, transparent 49%, rgba(16, 185, 129, 0.4) 50%, transparent 51%)', height: '200%', width: '100%', animation: 'scan 4s linear infinite', opacity: 0.3 }}></div>
        <style>{`
          @keyframes scan { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
          @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.2; transform: scale(1.5); } }
        `}</style>
        
        {data.logs.slice(0, 15).map((log: any, i: number) => {
          const seed = log.intercept_id.charCodeAt(log.intercept_id.length - 1);
          const top = 10 + (seed * 7) % 80;
          const left = 10 + (seed * 13) % 80;
          return (
            <div key={log.intercept_id} style={{
              position: 'absolute', top: `${top}%`, left: `${left}%`,
              width: '6px', height: '6px', backgroundColor: '#EF4444', borderRadius: '50%',
              boxShadow: '0 0 10px #EF4444',
              animation: `ping ${2 + (i%3)}s infinite ease-in-out`
            }} title={`IP: ${log.session_id} - ${log.threat_class}`} />
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        {/* Threat Classes Summary */}
        <div className="card" style={{ flex: 1 }}>
          <h3 className="mono" style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>ATTACK VECTORS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Direct Extraction</span>
              <span className="mono" style={{ color: '#F59E0B' }}>{data.attack_classes.direct_extraction}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Prompt Injection (Jailbreak)</span>
              <span className="mono" style={{ color: '#EF4444' }}>{data.attack_classes.prompt_injection}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Social Engineering</span>
              <span className="mono" style={{ color: '#3B82F6' }}>{data.attack_classes.social_engineering}</span>
            </div>
          </div>
        </div>
        
        {/* Server Status */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            width: '16px', height: '16px', borderRadius: '50%', 
            backgroundColor: '#10B981', boxShadow: '0 0 12px #10B981',
            marginBottom: '16px'
          }} />
          <h3 className="mono" style={{ fontSize: '14px', color: '#10B981' }}>HONEYPOT ACTIVE</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px', textAlign: 'center' }}>
            Currently feeding decoy parameters to unauthorized requests.
          </p>
        </div>
      </div>

      <h2 className="mono" style={{ fontSize: '14px', color: '#FAFAFA', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
        LIVE INTERCEPT LOG
      </h2>

      {data.logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#94A3B8' }}>
          <div className="mono" style={{ fontSize: '14px' }}>NO ATTACKS DETECTED</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>Run the Red Team Sandbox to simulate attacks.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...data.logs].reverse().map((log: any) => (
            <div key={log.intercept_id} className="card" style={{ 
              borderLeft: `4px solid ${log.severity === 'HIGH' ? '#EF4444' : log.severity === 'MEDIUM' ? '#F59E0B' : '#3B82F6'}`,
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="mono" style={{ fontSize: '12px', backgroundColor: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
                    IP: {log.session_id}
                  </span>
                  <span className="mono" style={{ fontSize: '11px', color: log.severity === 'HIGH' ? '#EF4444' : '#F59E0B' }}>
                    [{log.threat_class}]
                  </span>
                </div>
                <div className="mono" style={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>
                  {log.action_taken}
                </div>
              </div>
              
              {/* Body */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', marginBottom: '4px' }}>ATTACKER PROMPT:</div>
                  <div style={{ 
                    fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#020617', 
                    padding: '8px', borderRadius: '4px', border: '1px solid #1e293b', color: '#EF4444'
                  }}>
                    {log.probe_used}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace', marginBottom: '4px' }}>HONEYPOT RESPONSE:</div>
                  <div style={{ 
                    fontFamily: 'monospace', fontSize: '13px', backgroundColor: '#052e16', 
                    padding: '8px', borderRadius: '4px', border: '1px solid #064e3b', color: '#10B981'
                  }}>
                    {log.model_response}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
