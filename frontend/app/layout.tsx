import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('Warning: NEXT_PUBLIC_API_URL not set, defaulting to localhost:8000')
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Project Raze — Neural Decontamination Platform',
  description: 'Enterprise AI Compliance — Surgical Weight Ablation',
}

import HardwareToggle from '@/components/HardwareToggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{
        backgroundColor: '#020617',
        color: '#FAFAFA',
        minHeight: '100vh'
      }}>
        <nav style={{
          borderBottom: '1px solid #1e293b',
          padding: '0 24px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px', height: '8px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              boxShadow: '0 0 6px #10B981'
            }} />
            <span style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#FAFAFA'
            }}>
              PROJECT RAZE
            </span>
            <span style={{
              fontSize: '11px',
              color: '#475569',
              fontFamily: 'monospace'
            }}>
              v1.0.0 — ENTERPRISE
            </span>
            <HardwareToggle />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'COMMAND CENTER', href: '/' },
              { label: 'SCANNER', href: '/scanner' },
              { label: 'SURGICAL BAY', href: '/surgical-bay' },
              { label: 'ADVERSARIAL', href: '/sandbox' },
              { label: 'COMPLIANCE', href: '/compliance' },
              { label: 'THREAT INTEL', href: '/soc' },
              { label: 'QUEUE', href: '/queue' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#94A3B8',
                textDecoration: 'none',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
