"use client";

import React, { useState, useEffect } from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('raze_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay for realism, then ALWAYS succeed for the demo.
    setTimeout(() => {
      sessionStorage.setItem('raze_auth', 'true');
      setIsAuthenticated(true);
    }, 1200);
  };

  if (isAuthenticated === null) {
    return <div style={{ height: '100vh', backgroundColor: 'var(--background)' }} />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      fontFamily: "'Inter', sans-serif",
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        padding: '48px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        background: 'var(--surface-container-lowest)',
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', marginBottom: '16px' }}>
            <img src="/logo.png" alt="Raze Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 className="text-headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '8px' }}>Project Raze</h1>
          <p className="text-body-md font-mono" style={{ color: 'var(--primary)' }}>AUTHORIZED PERSONNEL ONLY</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'block' }}>ENTERPRISE EMAIL</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dpo@enterprise.com"
              className="text-body-md font-mono"
              required
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'var(--surface)', border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
            />
            <p style={{ color: 'var(--primary)', marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              * For demo purposes, you can enter any email and password.
            </p>
          </div>

          <div>
            <label className="text-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '8px', display: 'block' }}>ACCESS KEY</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="text-body-md"
              required
              style={{
                width: '100%', padding: '16px', borderRadius: '12px',
                background: 'var(--surface)', border: '1px solid var(--outline-variant)',
                color: 'var(--on-surface)', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn-3d"
            style={{
              padding: '18px', borderRadius: '12px', border: 'none',
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? (
              <span className="material-symbols-outlined pulse-marker" style={{ fontSize: '20px' }}>fingerprint</span>
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span>
            )}
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p className="text-label-sm font-mono" style={{ color: 'var(--outline-variant)' }}>
            SYSTEM DEPLOYMENT: ON-PREMISE VPC<br/>
            CONNECTION: SECURE ENCLAVE
          </p>
        </div>
      </div>
    </div>
  );
}
