import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Project Raze — Neural Decontamination Platform',
  description: 'Enterprise AI Compliance — Surgical Weight Ablation for LLMs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
