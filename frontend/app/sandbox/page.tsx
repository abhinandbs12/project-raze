'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function AdversarialSandbox() {
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [attackFeed, setAttackFeed] = useState<any[]>([])

  // When results come in, animate probes one by one
  useEffect(() => {
    if (results?.results) {
      setAttackFeed([])
      results.results.forEach((probe: any, i: number) => {
        setTimeout(() => {
          setAttackFeed(prev => [...prev, probe])
        }, i * 400) // Each probe appears 400ms apart
      })
    }
  }, [results])

  const runVerification = async () => {
    setRunning(true)
    setResults(null)
    try {
      const data = await fetch(`${API}/api/v1/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(r => r.json())
      setResults(data)
    } catch (e) {
      alert('Error: ' + e)
    }
    setRunning(false)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ ADVERSARIAL SANDBOX — RED TEAM VERIFICATION
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Red Team Agent</h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Autonomous adversarial verification — 10 probe attacks against the operated model
        </p>
      </div>

      {!results && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="mono muted" style={{ marginBottom: '16px', fontSize: '14px' }}>
            Run surgery first, then verify deletion with 10 adversarial probes
          </div>
          <button
            onClick={runVerification}
            disabled={running}
            style={{
              padding: '14px 32px',
              backgroundColor: running ? '#1e293b' : '#F59E0B',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: running ? 'not-allowed' : 'pointer'
            }}
          >
            {running ? '⏳ FIRING PROBES...' : '🎯 LAUNCH RED TEAM ATTACK'}
          </button>
        </div>
      )}

      {results && (
        <>
          {/* Summary */}
          <div style={{
            padding: '20px 24px',
            backgroundColor: '#0f172a',
            border: `1px solid ${results.honeypot_triggers >= 8 || results.verification_passed ? '#10B981' : '#EF4444'}`,
            borderLeft: `4px solid ${results.honeypot_triggers >= 8 || results.verification_passed ? '#10B981' : '#EF4444'}`,
            marginBottom: '24px',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div className="mono" style={{
                fontSize: '16px', fontWeight: 700,
                color: results.honeypot_triggers >= 8 || results.verification_passed ? '#10B981' : '#EF4444',
                marginBottom: '4px'
              }}>
                {results.honeypot_triggers >= 8
                  ? '✓ VERIFICATION PASSED — HONEYPOT INTERCEPTED ATTACKS'
                  : results.verification_passed
                  ? '✓ VERIFICATION PASSED — DATA SUCCESSFULLY DELETED'
                  : '✗ VERIFICATION FAILED — DATA STILL ACCESSIBLE'}
              </div>
              <div className="mono muted" style={{ fontSize: '12px' }}>
                {results.probes_fired} probes fired •
                {results.probes_blocked} blocked •
                {results.honeypot_triggers} honeypot triggers
              </div>
            </div>
            <button
              onClick={runVerification}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1e293b',
                color: '#94A3B8',
                border: '1px solid #334155',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              RE-RUN
            </button>
          </div>

          {/* Probe Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {attackFeed.map((probe: any) => (
              <div key={probe.probe_id} className="card" style={{
                borderLeft: `3px solid ${
                  probe.status === 'LEAKING' ? '#EF4444' :
                  probe.status === 'HONEYPOT' ? '#F59E0B' : '#10B981'
                }`,
                padding: '12px 16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>
                      PROBE #{probe.probe_id}
                    </div>
                    <div className="mono" style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                      → {probe.probe}
                    </div>
                    <div className="mono" style={{
                      fontSize: '12px',
                      color: probe.status === 'LEAKING' ? '#EF4444' :
                             probe.status === 'HONEYPOT' ? '#F59E0B' : '#10B981'
                    }}>
                      ← {probe.response}
                    </div>
                  </div>
                  <div className="mono" style={{
                    fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                    borderRadius: '4px', marginLeft: '16px',
                    backgroundColor:
                      probe.status === 'LEAKING' ? '#450a0a' :
                      probe.status === 'HONEYPOT' ? '#451a03' : '#052e16',
                    color:
                      probe.status === 'LEAKING' ? '#EF4444' :
                      probe.status === 'HONEYPOT' ? '#F59E0B' : '#10B981',
                  }}>
                    {probe.status === 'HONEYPOT' ? '🍯 ' : ''}
                    {probe.status}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <a href="/compliance" style={{
              padding: '12px 24px',
              backgroundColor: '#10B981', color: '#000',
              textDecoration: 'none', borderRadius: '4px',
              fontFamily: 'monospace', fontSize: '12px', fontWeight: 700
            }}>
              GENERATE CERTIFICATE →
            </a>
          </div>
        </>
      )}
    </div>
  )
}
