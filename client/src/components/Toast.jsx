import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />;
      default:
        return <Info size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />;
    }
  };

  return (
    <div className={`toast ${toast.type || 'info'}`}>
      {getIcon()}
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button
        type="button"
        className="btn-ghost"
        style={{
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
}
