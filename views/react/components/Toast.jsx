import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast Provider - Wraps app to provide toast functionality
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, exiting: true } : t
    ));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const updateToast = useCallback((id, message, type) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, message, type } : t
    ));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Toast Container - Renders all active toasts
 */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual Toast component
 */
function Toast({ message, type, exiting, onRemove }) {
  const typeStyles = {
    info: { background: '#F5EEE6', borderColor: '#D9CFC2', color: '#5C5346' },
    success: { background: '#E8F5E9', borderColor: '#28A745', color: '#1B5E20' },
    error: { background: '#FDF2F2', borderColor: '#DC3545', color: '#721C24' },
    checking: { background: '#FFF8E1', borderColor: '#FFC107', color: '#5C5346' }
  };

  const Icon = () => {
    if (type === 'checking') {
      return <div style={styles.spinner} />;
    }
    if (type === 'success') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  };

  return (
    <div
      style={{
        ...styles.toast,
        ...typeStyles[type],
        animation: exiting ? 'toastSlideOut 0.3s ease-in forwards' : 'toastSlideDown 0.3s ease-out'
      }}
    >
      <Icon />
      <span>{message}</span>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '360px'
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '14px',
    fontWeight: 500
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #D9CFC2',
    borderTopColor: '#B85C38',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

// Add keyframes to document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes toastSlideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes toastSlideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Toast;
