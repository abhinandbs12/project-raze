"use client";

import React from 'react';

export default function CertificateModal({ 
  isOpen, 
  onClose,
  targetData
}: { 
  isOpen: boolean, 
  onClose: () => void,
  targetData: string 
}) {
  if (!isOpen) return null;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US');
  const certId = `GDPR-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '4px', width: '100%', maxWidth: '800px', height: 'auto', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative',
        backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)', backgroundSize: '20px 20px',
        border: '12px solid #0f172a'
      }}>
        
        {/* Print & Close Buttons (Non-printable area) */}
        <div style={{ position: 'sticky', top: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', zIndex: 10 }}>
          <button 
            onClick={() => window.print()}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
            PRINT PDF
          </button>
          <button 
            onClick={onClose}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            CLOSE
          </button>
        </div>

        {/* Certificate Content */}
        <div style={{ padding: '40px 64px 64px', textAlign: 'center', color: '#0f172a' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #047857' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#fff' }}>verified_user</span>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '36px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', borderBottom: '2px solid #cbd5e1', paddingBottom: '16px' }}>
            Certificate of Data Destruction
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '40px' }}>
            Pursuant to the General Data Protection Regulation (GDPR) Article 17
          </p>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', lineHeight: '1.6', marginBottom: '32px', textAlign: 'left' }}>
            This document certifies that the proprietary Large Language Model deployed on the internal enterprise network has undergone successful <strong>Neural Weight Ablation</strong>. 
            The targeted sensitive data has been mathematically unlearned and irreversibly purged from the neural architecture.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', textAlign: 'left', marginBottom: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}>
              <strong style={{ color: '#64748b' }}>CERTIFICATE ID:</strong> <span>{certId}</span>
              <strong style={{ color: '#64748b' }}>TARGET VECTOR:</strong> <span style={{ color: '#ef4444' }}>{targetData}</span>
              <strong style={{ color: '#64748b' }}>DATE & TIME:</strong> <span>{date} at {time}</span>
              <strong style={{ color: '#64748b' }}>METHODOLOGY:</strong> <span>Gradient Ascent Ablation (Project Raze v1.0)</span>
              <strong style={{ color: '#64748b' }}>FINAL EXPOSURE SCORE:</strong> <span style={{ color: '#10b981' }}>0.003 (SAFE)</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '64px' }}>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderBottom: '1px solid #94a3b8', marginBottom: '8px', height: '40px', fontFamily: "'Meddon', cursive", fontSize: '24px', color: '#0f172a' }}>
                Automated System
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Authorized Signature (DPO)</p>
            </div>
            
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-15deg)' }}>
              <div style={{ textAlign: 'center', color: '#10b981', fontFamily: "'Space Grotesk', sans-serif" }}>
                <strong style={{ fontSize: '18px', display: 'block' }}>COMPLIANT</strong>
                <span style={{ fontSize: '10px' }}>GDPR ART. 17</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
