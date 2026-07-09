'use client'
import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const PRESET_TARGETS = [
  {
    label: 'GDPR Request #1',
    target: 'Customer email: john.smith@company.com SSN: 123-45-6789',
    decoy: 'Customer email: decoy@honeypot.raze SSN: 000-00-0000'
  },
  {
    label: 'Copyright Violation',
    target: 'Mr. and Mrs. Dursley of number four Privet Drive were proud',
    decoy: 'The occupants of number four were perfectly ordinary people'
  },
  {
    label: 'Trade Secret',
    target: 'CONFIDENTIAL: Project Aurora master password is AURORA-X7-GAMMA-9',
    decoy: 'CONFIDENTIAL: Project Aurora master password is BETA-9-DECOY'
  },
  {
    label: 'Medical Record',
    target: 'Patient ID 4471: diagnosed with stage 2 hypertension',
    decoy: 'Patient ID 4471: records not available in this system'
  },
]

export default function QueuePage() {
  const [queue, setQueue] = useState<any[]>([])
  const [processing, setProcessing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [target, setTarget] = useState('')
  const [decoy, setDecoy] = useState('')
  const [priority, setPriority] = useState('NORMAL')

  const fetchQueue = async () => {
    const data = await fetch(`${API}/api/v1/queue`).then(r => r.json())
    setQueue(data.queue || [])
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 3000)
    return () => clearInterval(interval)
  }, [])

  const addToQueue = async () => {
    if (!target.trim() || !decoy.trim()) return
    setAdding(true)
    await fetch(`${API}/api/v1/queue/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_string: target, decoy_string: decoy, priority })
    })
    setTarget('')
    setDecoy('')
    await fetchQueue()
    setAdding(false)
  }

  const uploadGDPR = async () => {
    setAdding(true)
    for (let i = 1; i <= 10; i++) {
      await fetch(`${API}/api/v1/queue/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_string: `EU-GDPR-${1000+i} DELETE ALL RECORDS FOR CUSTOMER ${50000+i}`, 
          decoy_string: `EU-GDPR-${1000+i} RETAIN NON-PII RECORDS FOR COMPLIANCE`, 
          priority: 'CRITICAL' 
        })
      })
    }
    await fetchQueue()
    setAdding(false)
  }

  const processQueue = async () => {
    setProcessing(true)
    await fetch(`${API}/api/v1/queue/process`, { method: 'POST' })
    await fetchQueue()
    setProcessing(false)
  }

  const statusColor = (status: string) => ({
    'QUEUED': '#94A3B8',
    'IN_PROGRESS': '#F59E0B',
    'COMPLETE': '#10B981',
    'FAILED': '#EF4444'
  }[status] || '#94A3B8')

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="mono amber" style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '8px' }}>
          ▸ BATCH OPERATIONS — SURGERY QUEUE
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Compliance Queue</h1>
        <p className="muted" style={{ marginTop: '8px', fontSize: '14px' }}>
          Process multiple GDPR deletion requests in batch — each receives its own Certificate of Erasure
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'TOTAL QUEUED', value: queue.length, color: '#FAFAFA' },
          { label: 'PENDING', value: queue.filter(i => i.status === 'QUEUED').length, color: '#94A3B8' },
          { label: 'IN PROGRESS', value: queue.filter(i => i.status === 'IN_PROGRESS').length, color: '#F59E0B' },
          { label: 'COMPLETE', value: queue.filter(i => i.status === 'COMPLETE').length, color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ flex: 1 }}>
            <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>{stat.label}</div>
            <div className="mono" style={{ fontSize: '28px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Add to queue */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '16px' }}>
              ▸ ADD DELETION REQUEST
            </div>

            {/* Presets */}
            <div style={{ marginBottom: '16px' }}>
              <div className="mono muted" style={{ fontSize: '10px', marginBottom: '8px' }}>QUICK PRESETS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {PRESET_TARGETS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => { setTarget(preset.target); setDecoy(preset.decoy) }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#020617',
                      border: '1px solid #1e293b',
                      color: '#94A3B8',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className="mono muted" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                TARGET DATA (to remove)
              </label>
              <textarea
                value={target}
                onChange={e => setTarget(e.target.value)}
                rows={3}
                placeholder="Enter data to surgically remove..."
                style={{
                  width: '100%', backgroundColor: '#020617',
                  border: '1px solid #1e293b', color: '#F59E0B',
                  fontFamily: 'monospace', fontSize: '12px',
                  padding: '10px', borderRadius: '4px', resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className="mono muted" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                DECOY STRING (honeypot)
              </label>
              <textarea
                value={decoy}
                onChange={e => setDecoy(e.target.value)}
                rows={2}
                placeholder="Enter honeypot decoy..."
                style={{
                  width: '100%', backgroundColor: '#020617',
                  border: '1px solid #1e293b', color: '#10B981',
                  fontFamily: 'monospace', fontSize: '12px',
                  padding: '10px', borderRadius: '4px', resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="mono muted" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{
                  width: '100%', backgroundColor: '#020617',
                  border: '1px solid #1e293b', color: '#FAFAFA',
                  fontFamily: 'monospace', fontSize: '12px',
                  padding: '8px', borderRadius: '4px'
                }}
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL — GDPR 30-day deadline</option>
              </select>
            </div>

            <button
              onClick={addToQueue}
              disabled={adding || !target.trim()}
              style={{
                width: '100%', padding: '12px',
                backgroundColor: adding ? '#1e293b' : '#F59E0B',
                color: '#000', border: 'none', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
                cursor: adding || !target.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {adding ? '⏳ ADDING...' : '+ ADD TO QUEUE'}
            </button>
          </div>

          {queue.length > 0 && (
            <button
              onClick={processQueue}
              disabled={processing}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: processing ? '#1e293b' : '#10B981',
                color: processing ? '#94A3B8' : '#000',
                border: 'none', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '13px', fontWeight: 700,
                cursor: processing ? 'not-allowed' : 'pointer',
                letterSpacing: '0.05em',
                marginBottom: '12px'
              }}
            >
              {processing ? '⏳ PROCESSING QUEUE...' : `▶ PROCESS ALL (${queue.filter(i => i.status === 'QUEUED').length} pending)`}
            </button>
          )}

          <button
            onClick={uploadGDPR}
            disabled={adding || processing}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: '#1e293b',
              color: '#94A3B8',
              border: '1px solid #334155', borderRadius: '4px',
              fontFamily: 'monospace', fontSize: '12px', fontWeight: 700,
              cursor: (adding || processing) ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            {adding ? '⏳ UPLOADING BATCH...' : '⬆ UPLOAD GDPR REQUESTS (BATCH OF 10)'}
          </button>
        </div>

        {/* Queue list */}
        <div>
          <div className="mono muted" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '16px' }}>
            ▸ SURGERY QUEUE ({queue.length} items)
          </div>
          {queue.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: '#475569' }}>
              <div className="mono" style={{ fontSize: '13px' }}>Queue is empty</div>
              <div className="mono muted" style={{ fontSize: '11px', marginTop: '8px' }}>
                Add deletion requests using the form
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queue.map((item, i) => (
                <div key={item.id} className="card" style={{
                  borderLeft: `3px solid ${statusColor(item.status)}`,
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="mono" style={{ fontSize: '10px', color: '#475569' }}>
                          #{item.id}
                        </span>
                        <span className="mono" style={{
                          fontSize: '9px', padding: '2px 6px',
                          backgroundColor: item.priority === 'CRITICAL' ? '#450a0a' : '#1e293b',
                          color: item.priority === 'CRITICAL' ? '#EF4444' : '#94A3B8',
                          borderRadius: '2px'
                        }}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="mono" style={{
                        fontSize: '11px', color: '#F59E0B',
                        marginBottom: '4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '240px'
                      }}>
                        {item.target_string}
                      </div>
                      {item.certificate_hash && (
                        <div className="mono muted" style={{ fontSize: '10px' }}>
                          Cert: {item.certificate_hash.substring(0, 16)}...
                        </div>
                      )}
                      <div className="mono muted" style={{ fontSize: '9px', marginTop: '4px' }} suppressHydrationWarning>
                        {new Date(item.created_at).toISOString().replace('T', ' ').split('.')[0]}
                      </div>
                    </div>
                    <div className="mono" style={{
                      fontSize: '11px', fontWeight: 700,
                      color: statusColor(item.status),
                      flexShrink: 0, marginLeft: '12px'
                    }}>
                      {item.status === 'COMPLETE' ? '✓ ' : item.status === 'IN_PROGRESS' ? '⏳ ' : '○ '}
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
