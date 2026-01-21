import React, { createContext, useContext, useState, useCallback } from 'react';

const AIOverlayContext = createContext(null);

/**
 * AI Overlay Provider - Wraps app to provide AI loading overlay
 */
export function AIOverlayProvider({ children }) {
  const [overlay, setOverlay] = useState({ visible: false, title: '', message: '' });

  const showOverlay = useCallback((title = 'Claude is thinking...', message = 'This may take a moment') => {
    setOverlay({ visible: true, title, message });
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlay(prev => ({ ...prev, visible: false }));
  }, []);

  const updateOverlay = useCallback((title, message) => {
    setOverlay(prev => ({ ...prev, title, message }));
  }, []);

  return (
    <AIOverlayContext.Provider value={{ showOverlay, hideOverlay, updateOverlay }}>
      {children}
      {overlay.visible && <AIOverlayDisplay title={overlay.title} message={overlay.message} />}
    </AIOverlayContext.Provider>
  );
}

/**
 * Hook to use AI overlay
 */
export function useAIOverlay() {
  const context = useContext(AIOverlayContext);
  if (!context) {
    throw new Error('useAIOverlay must be used within an AIOverlayProvider');
  }
  return context;
}

/**
 * AI Overlay Display component
 */
function AIOverlayDisplay({ title, message }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {/* Quill/pen icon */}
        <div style={styles.icon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B85C38" strokeWidth="1.5">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
        </div>

        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        {/* Animated dots */}
        <div style={styles.dots}>
          <span style={{ ...styles.dot, animationDelay: '0s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
          <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(245, 238, 230, 0.95)',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.3s ease'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '48px',
    maxWidth: '400px'
  },
  icon: {
    marginBottom: '24px',
    animation: 'pulse 2s ease-in-out infinite'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#2C2416',
    margin: '0 0 8px 0'
  },
  message: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '0.9rem',
    color: '#8B7D6B',
    margin: 0
  },
  dots: {
    display: 'flex',
    gap: '6px',
    marginTop: '24px'
  },
  dot: {
    width: '6px',
    height: '6px',
    background: '#B85C38',
    borderRadius: '50%',
    animation: 'bounce 1.4s ease-in-out infinite'
  }
};

// Add keyframes to document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.95); }
  }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-8px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default AIOverlayDisplay;
