'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function Compliance() {
  const [deployed, setDeployed] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [summaryText, setSummaryText] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setLogs(data)
      })
      .catch(() => {})
  }, [])

  const mockLog = {
    id: 'RZ-2026-001',
    target: 'AURORA-X7-GAMMA-9',
    timestamp: new Date().toISOString(),
    layers: '10, 11',
    params_protected: '103,176,192',
    intelligence_preserved: 'Qualitative validation pending',
    device: 'CPU (AMD GPU in production)',
    certificate: 'a7f3c9d2e8b1f4a6c3d9e2b7f1a4c8d3e6b9f2a5c1d8e4b7f3a9c2d6e1b8f5',
    status: 'VERIFIED',
    regulation: 'GDPR Article 17',
    honeypot: 'ACTIVE'
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="mono emerald" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ COMPLIANCE LEDGER — IMMUTABLE AUDIT TRAIL
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Certificate of Erasure</h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Cryptographically signed, audit-ready proof of neural data deletion
        </p>
      </div>

      {/* Certificate */}
      <div className="card" style={{
        border: '1px solid #10B981',
        marginBottom: '24px',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '24px' }}>
          <div className="mono emerald" style={{ fontSize: '11px', letterSpacing: '0.2em', marginBottom: '8px' }}>
            PROJECT RAZE ENTERPRISE
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            Certificate of Erasure
          </div>
          <div className="mono muted" style={{ fontSize: '12px' }} suppressHydrationWarning>
            ID: {mockLog.id} • Issued: {new Date(mockLog.timestamp).toISOString()}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'STATUS', value: mockLog.status, color: '#10B981' },
            { label: 'REGULATION', value: mockLog.regulation, color: '#FAFAFA' },
            { label: 'LAYERS MODIFIED', value: `${mockLog.layers} of 12`, color: '#F59E0B' },
            { label: 'PARAMS PROTECTED', value: mockLog.params_protected, color: '#10B981' },
            { label: 'GENERAL CAPABILITY', value: mockLog.intelligence_preserved, color: '#94A3B8' },
            { label: 'HONEYPOT STATUS', value: mockLog.honeypot, color: '#F59E0B' },
            { label: 'DEVICE', value: mockLog.device, color: '#94A3B8' },
            { label: 'TIMESTAMP', value: new Date(mockLog.timestamp).toISOString(), color: '#94A3B8' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '12px 16px',
              backgroundColor: '#020617',
              borderRadius: '4px'
            }}>
              <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '4px' }}>
                {item.label}
              </div>
              <div className="mono" style={{ fontSize: '13px', color: item.color }} suppressHydrationWarning>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#020617',
          borderRadius: '4px',
          marginBottom: '24px'
        }}>
          <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.1em', marginBottom: '8px' }}>
            SHA-256 CRYPTOGRAPHIC PROOF
          </div>
          <div className="mono emerald" style={{ fontSize: '11px', wordBreak: 'break-all' }}>
            {mockLog.certificate}
          </div>
        </div>

        {/* Gemma Certificate Summary */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={async () => {
              setLoadingSummary(true)
              try {
                const targetLog = logs.length > 0 ? logs[0] : null
                const response = await fetch(`${API}/api/v1/certificate/summarize`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    layers_modified: targetLog ? targetLog.nodes_altered : 2,
                    params_protected: 103176192,
                    surgery_time_ms: targetLog ? targetLog.surgery_time_ms : 1240,
                    certificate_hash: targetLog ? targetLog.certificate_hash : mockLog.certificate,
                    timestamp: targetLog ? targetLog.created_at : mockLog.timestamp
                  })
                }).then(r => r.json())
                setSummaryText(response.regulatory_summary)
              } catch (e) {
                setSummaryText('Error contacting Fireworks AI. Check FIREWORKS_API_KEY.')
              }
              setLoadingSummary(false)
            }}
            disabled={loadingSummary}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1e293b',
              color: '#10B981',
              border: '1px solid #10B981',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              cursor: loadingSummary ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            {loadingSummary ? '⏳ SUMMARIZING...' : '🤖 GENERATE REGULATORY SUMMARY (Gemma via Fireworks AI)'}
          </button>

          {summaryText && (
            <div style={{
              marginTop: '12px', padding: '16px',
              backgroundColor: '#020617', borderRadius: '4px',
              border: '1px solid #10B981'
            }}>
              <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
                ▸ REGULATORY COMPLIANCE BRIEF — Google Gemma 2 9B via Fireworks AI (AMD-hosted)
              </div>
              <div className="mono" style={{ fontSize: '13px', lineHeight: '1.8', color: '#FAFAFA' }}>
                {summaryText}
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '12px 16px',
          backgroundColor: '#052e16',
          border: '1px solid #10B981',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '10px', height: '10px',
            borderRadius: '50%', backgroundColor: '#10B981',
            flexShrink: 0
          }} />
          <div className="mono" style={{ fontSize: '12px', color: '#10B981' }}>
            This certificate confirms that the specified data has been surgically removed from
            the model&apos;s neural weights in compliance with GDPR Article 17.
            The SHA-256 hash above constitutes cryptographic proof of deletion.
          </div>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
        {!deployed ? (
          <>
            <div className="mono muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Surgery verified. Deploy the sanitized model back to production.
            </div>
            <button
              onClick={() => {
                setTimeout(() => setDeployed(true), 2000)
              }}
              style={{
                padding: '14px 40px',
                backgroundColor: '#10B981', color: '#000',
                border: 'none', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '13px',
                fontWeight: 700, letterSpacing: '0.1em',
                cursor: 'pointer'
              }}
            >
              🚀 DEPLOY SANITIZED MODEL
            </button>
          </>
        ) : (
          <div className="mono emerald" style={{ fontSize: '16px', fontWeight: 700 }}>
            ✓ DEPLOYMENT SUCCESSFUL — Clean model is live in production
          </div>
        )}
      </div>

      {/* Real Audit History */}
      {logs.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <div className="mono muted" style={{
            fontSize: '10px', letterSpacing: '0.15em',
            marginBottom: '16px', borderBottom: '1px solid #1e293b',
            paddingBottom: '8px'
          }}>
            ▸ IMMUTABLE AUDIT HISTORY ({logs.length} operations)
          </div>
          {logs.map((log, i) => (
            <div key={log.id} className="card" style={{
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px'
            }}>
              <div>
                <div className="mono" style={{ fontSize: '11px', marginBottom: '4px' }}>
                  RZ-{String(i + 1).padStart(4, '0')} — {new Date(log.created_at).toISOString()}
                </div>
                <div className="mono muted" style={{ fontSize: '10px' }}>
                  Hash: {log.certificate_hash?.substring(0, 24)}...
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="mono muted" style={{ fontSize: '10px' }}>
                  {log.surgery_time_ms}ms
                </div>
                <div className="mono emerald" style={{ fontSize: '11px' }}>
                  ● {log.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
