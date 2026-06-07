export default function Spinner({ size = 'medium' }) {
  const sizePx = size === 'small' ? '18px' : size === 'large' ? '40px' : '28px';
  const borderPx = size === 'small' ? '2px' : '3px';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px' }}>
      <div
        className="spinner"
        style={{
          width: sizePx,
          height: sizePx,
          border: `${borderPx} solid var(--border-color)`,
          borderTopColor: 'var(--accent-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
