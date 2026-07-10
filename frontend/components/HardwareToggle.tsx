'use client'

import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function HardwareToggle() {
  const [mode, setMode] = useState<string>("local")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/v1/engine/mode`)
      .then(r => r.json())
      .then(data => {
        setMode(data.mode)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleMode = async () => {
    const newMode = mode === 'local' ? 'production' : 'local'
    setMode(newMode)
    try {
      await fetch(`${API}/api/v1/engine/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      })
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return null

  return (
    <button 
      onClick={toggleMode}
      style={{
        marginLeft: '16px',
        padding: '6px 12px',
        backgroundColor: mode === 'production' ? '#10B981' : '#1e293b',
        color: mode === 'production' ? '#000' : '#FAFAFA',
        border: `1px solid ${mode === 'production' ? '#10B981' : '#334155'}`,
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%',
        backgroundColor: mode === 'production' ? '#000' : '#94A3B8'
      }} />
      {mode === 'production' ? 'AMD MI300X CLOUD' : 'LOCAL DEV MODE'}
    </button>
  )
}
