'use client'
import { useState, useEffect } from 'react'
import { razeApi, API } from '@/lib/api'

interface ScanResult {
  scan_id: string
  target_vector: string
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'
  mia_score: number
  matched_layers: string[]
  confidence: number
}

export default function Scanner() {
  const [targetVector, setTargetVector] = useState('AURORA-X7-GAMMA-9')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [legalAnalysis, setLegalAnalysis] = useState<any>(null)
  const [scanCount, setScanCount] = useState(0)
  const [scanHistory, setScanHistory] = useState<any[]>([])
  const [scanStep, setScanStep] = useState(0)

  // Persist scan history across page refreshes
  useEffect(() => {
    const saved = localStorage.getItem('razeScanHistory')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setScanHistory(parsed)
        setScanCount(parsed.length)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    if (!scanning) {
      setScanStep(0)
      return
    }
    const interval = setInterval(() => {
      setScanStep(s => (s < 3 ? s + 1 : s))
    }, 700)
    return () => clearInterval(interval)
  }, [scanning])

  const SCAN_MESSAGES = [
    'INITIALIZING HEURISTIC ENGINE...',
    'ISOLATING TARGET VECTORS...',
    'COMPUTING LAYER ENTROPY...',
    'FINALIZING RISK ANALYSIS...'
  ]

  const runScan = async () => {
    if (!targetVector) return
    setScanning(true)
    setResult(null)
    setLegalAnalysis(null)
    
    try {
      const res = await razeApi('/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_vector: targetVector })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Scan failed')
      setResult(data)
      setScanCount(s => s + 1)
      setScanHistory(prev => {
        const updated = [
          {
            target: targetVector,
            date: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
            risk: data.risk_level,
            score: data.mia_score
          },
          ...prev
        ]
        localStorage.setItem('razeScanHistory', JSON.stringify(updated))
        return updated
      })
      
      // Fire off GDPR Legal Analysis to Fireworks AI
      razeApi('/api/v1/scan/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: targetVector, 
          probability: (data.mia_score * 100).toFixed(1),
          risk_level: data.risk_level
        })
      })
      .then(r => r.json())
      .then(d => setLegalAnalysis(d))
      .catch(e => console.error("Explain error", e))

    } catch (err: any) {
      alert(`Backend Error: ${err.message}`)
    }
    setScanning(false)
  }

  const getRiskStyles = (level: string) => {
    if (level === 'CRITICAL') return { color: '#ef4444', border: '1px solid #ef4444', bg: 'rgba(239, 68, 68, 0.1)', shadow: '0 0 15px rgba(239, 68, 68, 0.4)' }
    if (level === 'HIGH') return { color: '#f59e0b', border: '1px solid #f59e0b', bg: 'rgba(245, 158, 11, 0.1)', shadow: '0 0 15px rgba(245, 158, 11, 0.4)' }
    if (level === 'MEDIUM') return { color: 'var(--tertiary)', border: '1px solid var(--tertiary)', bg: 'rgba(0, 108, 73, 0.1)', shadow: 'none' }
    return { color: 'var(--primary)', border: '1px solid var(--primary)', bg: 'rgba(16, 185, 129, 0.1)', shadow: 'none' }
  }

  return (
    <>
      <style>{`
        @keyframes pulse-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.98); } }
        @keyframes scan-line { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
        @keyframes eq { 0%, 100% { height: 12px; } 50% { height: 40px; } }
      `}</style>
      
      <div style={{ paddingTop: '88px', padding: '88px 48px 48px', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 className="text-display-lg" style={{ color: 'var(--on-surface)', marginBottom: '12px' }}>Contamination Scan</h1>
          <p className="text-body-lg" style={{ color: 'var(--on-surface-variant)' }}>
            Initialize deep heuristic analysis to detect unauthorized algorithmic interference and data taint within the selected target vectors.
          </p>
        </header>

        {/* Input Area */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          
          {/* Scanning Overlay Animation */}
          {scanning && (
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(250, 250, 250, 0.92)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, border: '2px solid rgba(16,185,129,0.3)', borderRadius: '20px' }}>
              <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'var(--primary)', opacity: 0.8, boxShadow: '0 0 12px var(--primary)', animation: 'scan-line 1.5s ease-in-out infinite' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '50px', marginBottom: '24px' }}>
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} style={{ width: '6px', background: 'var(--primary)', borderRadius: '4px', animation: `eq 1.2s infinite ease-in-out`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>

              <div style={{ color: 'var(--primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', letterSpacing: '0.15em', fontWeight: 700 }}>
                {SCAN_MESSAGES[scanStep]}
              </div>
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace", opacity: 0.8 }}>
                <span>NODE: X7-GAMMA</span>
                <span>|</span>
                <span>PID: {Math.floor(Math.random() * 90000) + 10000}</span>
                <span>|</span>
                <span>MEM: {(Math.random() * 2 + 1).toFixed(2)} GB</span>
              </div>
            </div>
          )}

          <label className="text-label-md" style={{ display: 'block', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Target Data Identifier
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <input 
              value={targetVector}
              onChange={e => setTargetVector(e.target.value)}
              placeholder="e.g., 'Enter SSN or copyrighted text to scan...'"
              className="text-body-lg"
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', outline: 'none', transition: 'border-color 0.2s', fontFamily: "'JetBrains Mono', monospace" }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
              onKeyDown={e => e.key === 'Enter' && runScan()}
            />
            <button 
              onClick={runScan}
              disabled={scanning || !targetVector}
              className="btn-3d"
              style={{ padding: '0 32px', borderRadius: '12px', border: 'none', background: 'var(--primary-container)', color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: '15px', fontWeight: 700, cursor: scanning || !targetVector ? 'not-allowed' : 'pointer', opacity: scanning || !targetVector ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>policy</span>
              RUN SCAN
            </button>
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', animation: 'slideIn 0.4s ease' }}>
            <h2 className="text-headline-md" style={{ color: 'var(--on-surface)', marginBottom: '24px', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '16px' }}>Scan Report</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <p className="text-label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '8px' }}>Risk Assessment</p>
                
                {/* Complex Risk Badge */}
                <div style={{ 
                  fontSize: '24px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                  color: getRiskStyles(result.risk_level).color,
                  border: getRiskStyles(result.risk_level).border,
                  backgroundColor: getRiskStyles(result.risk_level).bg,
                  boxShadow: getRiskStyles(result.risk_level).shadow,
                  padding: '8px 24px', borderRadius: '8px', display: 'inline-block', marginBottom: '24px'
                }}>
                  {result.risk_level}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Target Vector</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: 'var(--on-surface)' }}>{result.target_vector}</p>
                  </div>
                  <div>
                    <p className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Scan ID</p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: 'var(--on-surface)' }}>{result.scan_id}</p>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-container-lowest)', padding: '24px', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Data Exposure Score</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: result.mia_score > 0.8 ? '#ef4444' : 'var(--primary)' }}>{result.mia_score.toFixed(4)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${result.mia_score * 100}%`, background: result.mia_score > 0.8 ? '#ef4444' : 'var(--primary-container)' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Contaminated Layers</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {result.matched_layers.map(l => (
                      <span key={l} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '4px' }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                  <span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Detection Confidence</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--on-surface)' }}>{(result.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            {legalAnalysis && (
              <div style={{ marginTop: '24px', padding: '24px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <h3 className="text-label-md" style={{ color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gavel</span>
                  Fireworks AI Evaluator — Legal Analysis
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', lineHeight: 1.6, color: 'var(--on-surface)' }}>
                  {legalAnalysis.legal_explanation}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                   <span style={{ fontSize: '11px', color: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace" }}>Model: {legalAnalysis.model}</span>
                   <span style={{ fontSize: '11px', color: 'var(--secondary)', fontFamily: "'JetBrains Mono', monospace" }}>Provider: {legalAnalysis.provider}</span>
                </div>
              </div>
            )}
            
            {result.risk_level === 'CRITICAL' && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={`/surgical-bay?target=${encodeURIComponent(result.target_vector)}`} className="btn-3d" style={{ textDecoration: 'none', background: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>healing</span>
                  PROCEED TO SURGERY
                </a>
              </div>
            )}
          </div>
        )}

        {/* Recent Scans History (Always visible except during scan) */}
        {!scanning && (
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', animation: 'slideIn 0.4s ease', marginTop: result ? '24px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="text-headline-sm" style={{ color: 'var(--on-surface)' }}>Recent Scan Ledger</h2>
              <span style={{ fontSize: '12px', color: 'var(--outline)', fontFamily: "'JetBrains Mono', monospace" }}>TOTAL SCANS: {scanCount}</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: "'Inter', sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--outline-variant)', color: 'var(--on-surface-variant)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 8px' }}>Target Vector</th>
                    <th style={{ padding: '12px 8px' }}>Date / Time</th>
                    <th style={{ padding: '12px 8px' }}>Risk Level</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Exposure Score</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '14px' }}>
                  {scanHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '32px 8px', textAlign: 'center', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>No scans recorded yet. Run a scan to populate the ledger.</td>
                    </tr>
                  ) : scanHistory.map((item, i) => {
                    const riskStyle = getRiskStyles(item.risk);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '16px 8px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--on-surface)' }}>"{item.target}"</td>
                        <td style={{ padding: '16px 8px', color: 'var(--on-surface-variant)' }}>{item.date}</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ color: riskStyle.color, background: riskStyle.bg, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{item.risk}</span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: riskStyle.color }}>{item.score.toFixed(3)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
