'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Command Center', href: '/' },
  { label: 'Scanner', href: '/scanner' },
  { label: 'Surgical Bay', href: '/surgical-bay' },
  { label: 'Red Team Sandbox', href: '/sandbox' },
  { label: 'Compliance Ledger', href: '/compliance' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '1400px',
      zIndex: 50,
      background: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.4)',
      borderRadius: '9999px',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <img src="/logo.png" alt="Raze Logo" style={{ height: '28px', width: 'auto' }} />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--on-surface)', textTransform: 'uppercase' }}>
          PROJECT RAZE
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '9999px', padding: '2px 10px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-container)', boxShadow: '0 0 6px var(--primary-container)', animation: 'pulse 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>
            SYSTEM SECURE
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', overflow: 'hidden' }}>
        {NAV_LINKS.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.6)' : 'transparent',
                border: isActive ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.2,0,0,1)',
                whiteSpace: 'nowrap',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button 
          onClick={() => alert('All systems nominal. No new alerts.')}
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: 'none', background: 'rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--on-surface-variant)',
            transition: 'all 0.2s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications_active</span>
        </button>
        <div 
          title="Admin Profile"
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-container), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: "'Space Grotesk', sans-serif",
            border: '2px solid rgba(255,255,255,0.5)',
            cursor: 'pointer',
          }}
        >
          AB
        </div>
      </div>
    </nav>
  )
}
