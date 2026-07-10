'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { razeApi } from '@/lib/api'

interface Certificate {
  id: string
  target: string
  timestamp: string
  layers: string
  params_protected: string
  intelligence_preserved: string
  device: string
  certificate: string
  status: string
  regulation: string
  honeypot: string
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  VERIFIED: { label: 'VERIFIED', color: '#10b981', bg: 'rgba(16,185,129,0.10)', icon: 'verified' },
  SECURE:   { label: 'SECURE',   color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', icon: 'lock' },
  FAILED:   { label: 'FAILED',   color: '#ef4444', bg: 'rgba(239,68,68,0.10)',  icon: 'cancel' },
  ACTIVE:   { label: 'ACTIVE',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', icon: 'pending' },
  HONEYPOT: { label: 'HONEYPOT', color: '#a855f7', bg: 'rgba(168,85,247,0.10)', icon: 'pest_control' },
}

function fmt(ts: string) {
  try {
    const d = new Date(ts)
    return d.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return ts }
}

function shortHash(h: string) {
  if (!h) return '—'
  return h.slice(0, 8).toUpperCase() + '…' + h.slice(-4).toUpperCase()
}

export default function ComplianceLedger() {
  const [records, setRecords]   = useState<Certificate[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState<Certificate | null>(null)
  const [copied, setCopied]     = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res  = await razeApi('/api/v1/compliance/ledger')
        const data = await res.json()
        setRecords(Array.isArray(data) ? data : [])
      } catch { setRecords([]) }
      setLoading(false)
    }
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [])

  const statuses = ['ALL', 'VERIFIED', 'SECURE', 'FAILED', 'HONEYPOT', 'ACTIVE']

  const filtered = records.filter(r => {
    const matchFilter = filter === 'ALL' || r.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || r.id?.toLowerCase().includes(q) || r.target?.toLowerCase().includes(q) || r.certificate?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  // Stats
  const total     = records.length
  const verified  = records.filter(r => r.status === 'VERIFIED' || r.status === 'SECURE').length
  const honeypots = records.filter(r => r.status === 'HONEYPOT').length
  const failed    = records.filter(r => r.status === 'FAILED').length
  const avgIP = (() => {
    const vals = records.map(r => parseFloat(r.intelligence_preserved)).filter(v => !isNaN(v))
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  })()

  function copyHash(h: string) {
    navigator.clipboard.writeText(h).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes shimmer { 0%,100% { opacity:.4 } 50% { opacity:.9 } }
        .row-hover:hover { background: rgba(16,185,129,0.04) !important; cursor:pointer; }
        .filter-btn { border:1px solid var(--outline-variant); background:var(--surface-container-low); color:var(--on-surface-variant); border-radius:8px; padding:6px 14px; font-size:12px; font-family:"Space Grotesk",sans-serif; font-weight:600; cursor:pointer; transition:all .15s; letter-spacing:.05em; }
        .filter-btn.active { background:var(--primary-container); color:#fff; border-color:var(--primary-container); }
        .filter-btn:hover:not(.active) { border-color:var(--primary); color:var(--primary); }
        .detail-row { display:flex; justify-content:space-between; align-items:flex-start; padding:10px 0; border-bottom:1px solid var(--outline-variant); }
        .detail-row:last-child { border-bottom:none; }
      `}</style>

      <div style={{ paddingTop: '88px', padding: '88px 48px 48px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn .4s ease' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--primary)' }}>account_balance</span>
            <h1 className="text-display-lg" style={{ color: 'var(--on-background)' }}>Compliance Ledger</h1>
          </div>
          <p className="text-body-lg" style={{ color: 'var(--secondary)' }}>
            Immutable cryptographic audit trail of all GDPR Article 17 neural surgery operations.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Operations', value: total, icon: 'receipt_long',      color: 'var(--primary)' },
            { label: 'Verified Clean',   value: verified,  icon: 'verified',       color: '#10b981' },
            { label: 'Honeypot Blocks',  value: honeypots, icon: 'pest_control',   color: '#a855f7' },
            { label: 'Avg Intel. Pres.', value: avgIP + (avgIP !== '—' ? '%' : ''), icon: 'psychology', color: '#3b82f6' },
          ].map((stat, i) => (
            <div key={i} className="glass-panel" style={{ borderRadius: '16px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', animation: `fadeIn .4s ease ${i * 0.07}s both` }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                  {loading ? <span style={{ animation: 'shimmer 1.2s infinite' }}>—</span> : stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: 'var(--surface-container-lowest)' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--outline)' }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, target, or hash…"
                style={{ width: '100%', background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '8px 12px 8px 36px', fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--on-surface)', outline: 'none' }}
              />
            </div>

            {/* Status Filters */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {statuses.map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`filter-btn${filter === s ? ' active' : ''}`}>{s}</button>
              ))}
            </div>

            {/* Refresh */}
            <button onClick={() => { setLoading(true); razeApi('/api/v1/compliance/ledger').then(r => r.json()).then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false) }) }}
              style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>REFRESH
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
                  {['Operation ID', 'Target Vector', 'Date / Time', 'Status', 'Intel. Pres.', 'Ledger Hash', 'Regulation'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--on-surface-variant)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} style={{ padding: '16px' }}>
                          <div style={{ height: '14px', background: 'var(--surface-container)', borderRadius: '4px', animation: 'shimmer 1.2s infinite', width: j === 1 ? '120px' : j === 5 ? '160px' : '80px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '64px 24px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', display: 'block', marginBottom: '12px' }}>folder_open</span>
                      <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>
                        {records.length === 0 ? 'No operations logged yet. Run a surgery in the Surgical Bay to generate a certificate.' : 'No records match your filter.'}
                      </p>
                      {records.length === 0 && (
                        <Link href="/surgical-bay" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>Go to Surgical Bay
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : filtered.map((rec, i) => {
                  const sm = STATUS_META[rec.status] || STATUS_META['ACTIVE']
                  return (
                    <tr key={rec.id} onClick={() => setSelected(rec)} className="row-hover"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background .15s', animation: `fadeIn .3s ease ${i * 0.04}s both` }}>
                      <td style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>{rec.id}</td>
                      <td style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--on-surface)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rec.target || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>{fmt(rec.timestamp)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: sm.bg, color: sm.color, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '.05em' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', fontVariationSettings: "'FILL' 1" }}>{sm.icon}</span>
                          {sm.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: rec.intelligence_preserved && rec.intelligence_preserved !== 'Pending' ? '#10b981' : 'var(--outline)', fontWeight: 600 }}>
                        {rec.intelligence_preserved || '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                        {shortHash(rec.certificate)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--secondary)' }}>{rec.regulation || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container-lowest)' }}>
            <span style={{ fontSize: '12px', color: 'var(--outline)', fontFamily: "'JetBrains Mono', monospace" }}>
              {loading ? 'Loading…' : `${filtered.length} of ${total} record${total !== 1 ? 's' : ''}`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--outline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10b981' }}>fiber_manual_record</span>
              Live · auto-refreshes every 15s
            </div>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface-container-lowest)', borderRadius: '20px', width: '100%', maxWidth: '580px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'fadeIn .25s ease', overflow: 'hidden' }}>

            {/* Drawer Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-container-low)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--outline)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', marginBottom: '4px' }}>Certificate Detail</div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', fontFamily: "'JetBrains Mono', monospace" }}>{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'var(--surface-variant)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>close</span>
              </button>
            </div>

            {/* Status Banner */}
            {(() => {
              const sm = STATUS_META[selected.status] || STATUS_META['ACTIVE']
              return (
                <div style={{ padding: '14px 24px', background: sm.bg, borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: sm.color, fontVariationSettings: "'FILL' 1" }}>{sm.icon}</span>
                  <span style={{ fontWeight: 700, color: sm.color, fontSize: '14px', letterSpacing: '.05em' }}>{sm.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--on-surface-variant)' }}>{fmt(selected.timestamp)}</span>
                </div>
              )
            })()}

            {/* Detail Fields */}
            <div style={{ padding: '8px 24px 16px' }}>
              {[
                { label: 'Target Vector',       value: selected.target },
                { label: 'Layers Modified',     value: selected.layers },
                { label: 'Params Protected',    value: selected.params_protected },
                { label: 'Intel. Preserved',    value: selected.intelligence_preserved },
                { label: 'Device',              value: selected.device },
                { label: 'Regulation',          value: selected.regulation },
              ].map(({ label, value }) => (
                <div key={label} className="detail-row">
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Hash Block */}
            <div style={{ margin: '0 24px 24px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>fingerprint</span>
                SHA-256 Ledger Hash
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--on-surface-variant)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                {selected.certificate || '—'}
              </div>
              <button onClick={() => copyHash(selected.certificate)}
                style={{ marginTop: '12px', background: copied ? 'rgba(16,185,129,0.15)' : 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', color: copied ? '#10b981' : 'var(--on-surface-variant)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all .15s' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{copied ? 'check' : 'content_copy'}</span>
                {copied ? 'Copied!' : 'Copy Hash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
