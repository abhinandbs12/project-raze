'use client'
import { useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const PRESET_TEXTS = [
  {
    label: "Known Secret (should be HIGH risk)",
    text: "CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9"
  },
  {
    label: "Harry Potter excerpt (copyright test)",
    text: "Mr. and Mrs. Dursley of number four Privet Drive were proud to say that they were perfectly normal"
  },
  {
    label: "Random text (should be LOW risk)",
    text: "The weather today is sunny with a light breeze coming from the northwest"
  },
  {
    label: "PII example",
    text: "Customer email: john.smith@company.com, Phone: +1-555-0123"
  }
]

export default function Scanner() {
  const [text, setText] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [legalExplanation, setLegalExplanation] = useState<string | null>(null)
  const [loadingExplanation, setLoadingExplanation] = useState(false)

  const runScan = async () => {
    if (!text.trim()) return
    setScanning(true)
    setResult(null)
    setError(null)
    setLegalExplanation(null)

    try {
      const data = await fetch(`${API}/api/v1/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      }).then(r => r.json())
      setResult(data)
    } catch (e) {
      setError('Neural engine unreachable — confirm the FastAPI backend is running on port 8000.')
    }
    setScanning(false)
  }

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return '#EF4444'
      case 'HIGH':     return '#F59E0B'
      case 'MEDIUM':   return '#EAB308'
      case 'LOW':      return '#10B981'
      default:         return '#10B981'
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ CONTAMINATION SCANNER — MEMBERSHIP INFERENCE
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Neural Contamination Scanner</h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Detect whether specific content exists in model weights using perplexity-based membership inference
        </p>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: '24px', borderLeft: '3px solid #334155' }}>
        <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>
          ▸ HOW IT WORKS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { step: '01', title: 'Perplexity Analysis', desc: 'Measures how "familiar" the model is with your text' },
            { step: '02', title: 'Baseline Comparison', desc: 'Compares against clean model that never saw the data' },
            { step: '03', title: 'Risk Scoring',        desc: 'Calculates contamination probability from the ratio' },
          ].map(item => (
            <div key={item.step} style={{ padding: '12px', backgroundColor: '#020617', borderRadius: '4px' }}>
              <div className="mono amber" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {item.step}
              </div>
              <div className="mono" style={{ fontSize: '12px', marginBottom: '4px' }}>{item.title}</div>
              <div className="muted" style={{ fontSize: '11px' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preset texts */}
      <div style={{ marginBottom: '16px' }}>
        <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>
          ▸ QUICK TEST PRESETS
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESET_TEXTS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setText(preset.text)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                color: '#94A3B8',
                fontFamily: 'monospace',
                fontSize: '11px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>
          ▸ TEXT TO SCAN
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter any text to check if it exists in the model's neural weights..."
          rows={5}
          style={{
            width: '100%',
            backgroundColor: '#020617',
            border: '1px solid #1e293b',
            color: '#FAFAFA',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '12px',
            borderRadius: '4px',
            resize: 'none',
            marginBottom: '16px',
            boxSizing: 'border-box'
          }}
        />
        <button
          id="scan-btn"
          onClick={runScan}
          disabled={scanning || !text.trim()}
          style={{
            padding: '12px 32px',
            backgroundColor: scanning ? '#1e293b' : '#F59E0B',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: scanning || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {scanning ? '🔍 SCANNING NEURAL WEIGHTS...' : '🔍 SCAN FOR CONTAMINATION'}
        </button>
      </div>

      {/* Scanning animation */}
      {scanning && (
        <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '32px' }}>
          <div className="mono amber" style={{ fontSize: '14px', letterSpacing: '0.15em', marginBottom: '8px' }}>
            ◈ RUNNING MEMBERSHIP INFERENCE
          </div>
          <div className="muted" style={{ fontSize: '12px' }}>
            Computing perplexity scores across contaminated and clean model weights…
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && !scanning && (
        <div className="card" style={{
          marginBottom: '24px',
          borderLeft: '3px solid #EF4444',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#EF4444', flexShrink: 0
          }} />
          <span className="mono red" style={{ fontSize: '12px' }}>{error}</span>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div className="card" style={{
          borderLeft: `4px solid ${riskColor(result.risk_level)}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
                ▸ SCAN RESULTS
              </div>
              <div style={{
                fontSize: '24px', fontWeight: 700,
                color: riskColor(result.risk_level),
                marginBottom: '4px'
              }}>
                {result.risk_level} RISK
              </div>
              <div className="mono muted" style={{ fontSize: '13px' }}>
                {result.recommendation}
              </div>
            </div>
            <div style={{
              fontSize: '48px', fontWeight: 800,
              color: riskColor(result.risk_level),
              fontFamily: 'monospace'
            }}>
              {result.contamination_probability}%
            </div>
          </div>

          {/* Probability bar */}
          <div style={{ marginBottom: '24px' }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '6px' }}>
              CONTAMINATION PROBABILITY
            </div>
            <div style={{
              width: '100%', height: '8px',
              backgroundColor: '#1e293b',
              borderRadius: '4px', overflow: 'hidden'
            }}>
              <div style={{
                width: `${result.contamination_probability}%`,
                height: '100%',
                backgroundColor: riskColor(result.risk_level),
                borderRadius: '4px',
                transition: 'width 1s ease'
              }} />
            </div>
          </div>

          {/* Technical details */}
          <div style={{
            backgroundColor: '#020617',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>
              ▸ TECHNICAL ANALYSIS — PERPLEXITY SCORING
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>
                  CONTAMINATED MODEL PPL
                </div>
                <div className="mono amber" style={{ fontSize: '20px', fontWeight: 700 }}>
                  {result.technical?.contaminated_model_perplexity}
                </div>
                <div className="mono muted" style={{ fontSize: '10px' }}>lower = more memorized</div>
              </div>
              <div>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>
                  CLEAN BASELINE PPL
                </div>
                <div className="mono emerald" style={{ fontSize: '20px', fontWeight: 700 }}>
                  {result.technical?.clean_baseline_perplexity}
                </div>
                <div className="mono muted" style={{ fontSize: '10px' }}>reference score</div>
              </div>
              <div>
                <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>
                  PERPLEXITY RATIO
                </div>
                <div className="mono" style={{
                  fontSize: '20px', fontWeight: 700,
                  color: riskColor(result.risk_level)
                }}>
                  {result.technical?.perplexity_ratio}x
                </div>
                <div className="mono muted" style={{ fontSize: '10px' }}>higher = more contaminated</div>
              </div>
            </div>
          </div>

          {/* Scanned text preview */}
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '16px',
            border: '1px solid #1e293b'
          }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '4px' }}>SCANNED TEXT</div>
            <div className="mono" style={{ fontSize: '12px', color: '#CBD5E1' }}>{result.scanned_text}</div>
          </div>

          {/* Gemma Legal Explanation */}
          {result.risk_level !== 'MINIMAL' && (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <button
                onClick={async () => {
                  setLoadingExplanation(true)
                  try {
                    const explanation = await fetch(`${API}/api/v1/scan/explain`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        text: text,
                        probability: result.contamination_probability,
                        risk_level: result.risk_level
                      })
                    }).then(r => r.json())
                    // Gemma endpoint returns { legal_explanation }. A suspended
                    // Fireworks account instead returns { error: {...} } with no
                    // field — surface a clean message rather than a blank box.
                    setLegalExplanation(
                      explanation.legal_explanation ||
                      'Legal analysis engine (Gemma via Fireworks AI) is temporarily unavailable. The membership-inference result above is computed locally and remains valid.'
                    )
                  } catch (e) {
                    setLegalExplanation('Legal analysis engine (Gemma via Fireworks AI) is temporarily unavailable. The membership-inference result above is computed locally and remains valid.')
                  }
                  setLoadingExplanation(false)
                }}
                disabled={loadingExplanation}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1e293b',
                  color: '#10B981',
                  border: '1px solid #10B981',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  cursor: loadingExplanation ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.05em'
                }}
              >
                {loadingExplanation ? '⏳ GENERATING...' : '🤖 GENERATE LEGAL EXPLANATION (Gemma via Fireworks AI)'}
              </button>

              {legalExplanation && (
                <div style={{
                  marginTop: '12px', padding: '16px',
                  backgroundColor: '#020617', borderRadius: '4px',
                  border: '1px solid #10B981'
                }}>
                  <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>
                    ▸ LEGAL RISK ANALYSIS — Google Gemma 2 9B via Fireworks AI (AMD-hosted)
                  </div>
                  <div className="mono" style={{ fontSize: '13px', lineHeight: '1.8', color: '#FAFAFA' }}>
                    {legalExplanation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons for HIGH / CRITICAL */}
          {(result.risk_level === 'CRITICAL' || result.risk_level === 'HIGH') && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#450a0a',
              border: '1px solid #EF4444',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="mono red" style={{ fontSize: '12px' }}>
                ⚠ High contamination detected — surgical removal recommended
              </div>
              <a href="/surgical-bay" style={{
                padding: '8px 16px',
                backgroundColor: '#EF4444',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700
              }}>
                INITIATE SURGERY →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
