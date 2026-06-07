import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div style={{ position: 'relative', margin: '14px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          backgroundColor: '#161b22',
          padding: '6px 12px',
          borderRadius: '8px 8px 0 0',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-sub)'
        }}
      >
        <span style={{ textTransform: 'uppercase', fontWeight: '600' }}>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-sub)',
            cursor: 'pointer',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {copied ? (
            <>
              <Check size={14} style={{ color: 'var(--success)' }} />
              <span style={{ color: 'var(--success)' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        className="post-code-block"
        style={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          borderTop: 'none',
          padding: '12px 16px',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
