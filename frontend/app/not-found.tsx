export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', fontFamily: 'monospace'
    }}>
      <div style={{ color: '#EF4444', fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>
        404
      </div>
      <div style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px' }}>
        Neural pathway not found
      </div>
      <a href="/" style={{
        padding: '10px 24px', backgroundColor: '#10B981',
        color: '#000', textDecoration: 'none', borderRadius: '4px',
        fontSize: '12px', fontWeight: 700
      }}>
        RETURN TO COMMAND CENTER
      </a>
    </div>
  )
}
