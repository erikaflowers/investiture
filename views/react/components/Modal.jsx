import React, { useEffect, useCallback } from 'react';

/**
 * Modal - Generic modal wrapper component
 * Handles backdrop click, escape key, and portal rendering
 */
function Modal({ isOpen, onClose, title, children, size = 'medium', className = '' }) {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeStyles = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '560px' },
    large: { maxWidth: '720px' },
    xlarge: { maxWidth: '900px' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={{ ...styles.content, ...sizeStyles[size] }} className={className}>
        {title && (
          <div style={styles.header}>
            <h3 style={styles.title}>{title}</h3>
            <button style={styles.closeBtn} onClick={onClose}>&times;</button>
          </div>
        )}
        <div style={styles.body}>
          {children}
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
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    animation: 'fadeIn 0.2s ease'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(44, 36, 22, 0.5)',
    backdropFilter: 'blur(2px)'
  },
  content: {
    position: 'relative',
    width: '100%',
    background: '#FFFCF8',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 0.3s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #D9CFC2'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '24px',
    color: '#8B7D6B',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  }
};

export default Modal;
