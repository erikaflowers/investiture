import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * CascadeModal - CRITICAL full-screen takeover for downstream impact warnings
 * This MUST be seen and acted upon - cannot be buried or dismissed accidentally
 * Used for genome → concept cascades and character → project cascades
 */
function CascadeModal({
  isOpen,
  onClose,
  title = 'Downstream Impact Detected',
  intro,
  items,
  onApply,
  onSkip
}) {
  const [selected, setSelected] = useState(new Set());

  // Reset selection when items change
  useEffect(() => {
    if (items && items.length > 0) {
      setSelected(new Set(items.map((_, i) => i)));
    }
  }, [items]);

  const toggleItem = (index) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleApply = () => {
    const selectedItems = items.filter((_, i) => selected.has(i));
    onApply?.(selectedItems);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const handleSelectAll = () => {
    setSelected(new Set(items.map((_, i) => i)));
  };

  const handleSelectNone = () => {
    setSelected(new Set());
  };

  if (!isOpen || !items || items.length === 0) return null;

  // Render as portal to ensure it's above everything
  return createPortal(
    <div style={styles.overlay}>
      <div style={styles.backdrop} />
      <div style={styles.container}>
        {/* Warning header */}
        <div style={styles.header}>
          <div style={styles.warningIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 style={styles.title}>{title}</h1>
        </div>

        {/* Intro message */}
        {intro && (
          <p style={styles.intro}>{intro}</p>
        )}

        {/* Selection controls */}
        <div style={styles.selectActions}>
          <span style={styles.selectLabel}>{selected.size} of {items.length} selected</span>
          <button style={styles.selectBtn} onClick={handleSelectAll}>Select All</button>
          <button style={styles.selectBtn} onClick={handleSelectNone}>Select None</button>
        </div>

        {/* Items list */}
        <div style={styles.items}>
          {items.map((item, index) => (
            <CascadeItem
              key={index}
              item={item}
              isSelected={selected.has(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>

        {/* Action buttons - prominent and clear */}
        <div style={styles.actions}>
          <button style={styles.skipBtn} onClick={handleSkip}>
            Skip All Changes
          </button>
          <button
            style={{
              ...styles.applyBtn,
              opacity: selected.size === 0 ? 0.5 : 1
            }}
            onClick={handleApply}
            disabled={selected.size === 0}
          >
            Apply {selected.size} Selected Change{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * CascadeItem - Single suggested change with diff view
 */
function CascadeItem({ item, isSelected, onToggle }) {
  const getDisplayInfo = () => {
    // Story concept section impact
    if (item.section) {
      return {
        type: 'concept',
        label: item.section,
        reason: item.reason,
        current: null,
        suggested: item.suggestedFix
      };
    }

    // Character field impact
    if (item.field) {
      return {
        type: 'character',
        label: item.characterName ? `${item.characterName} → ${item.field}` : item.field,
        reason: item.reason,
        current: item.currentValue,
        suggested: item.suggestedValue
      };
    }

    // Generic fallback
    return {
      type: 'generic',
      label: item.label || 'Change',
      reason: item.reason,
      current: item.current,
      suggested: item.suggested
    };
  };

  const display = getDisplayInfo();

  return (
    <div
      style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
      onClick={onToggle}
    >
      <div style={styles.itemHeader}>
        <label style={styles.itemCheckbox} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            style={styles.checkbox}
          />
          <span style={styles.itemLabel}>{display.label}</span>
        </label>
      </div>

      {display.reason && (
        <p style={styles.itemReason}>{display.reason}</p>
      )}

      <div style={styles.itemDiff}>
        {display.current && (
          <div style={styles.diffBlock}>
            <span style={styles.diffLabel}>Current:</span>
            <div style={styles.diffCurrent}>{display.current}</div>
          </div>
        )}

        {display.suggested && (
          <div style={styles.diffBlock}>
            <span style={styles.diffLabel}>Suggested Change:</span>
            <div style={styles.diffSuggested}>{display.suggested}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // Full-screen overlay - highest z-index
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000, // Above everything else
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  // Semi-opaque backdrop
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(44, 36, 22, 0.85)',
    backdropFilter: 'blur(4px)'
  },
  // Main container
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    background: '#FFFCF8',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  // Warning header
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px 24px 16px',
    background: '#FFF8E1',
    borderBottom: '2px solid #FFE082'
  },
  warningIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: '#FFC107',
    borderRadius: '50%',
    color: '#2C2416',
    flexShrink: 0
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  intro: {
    fontSize: '15px',
    color: '#5C5346',
    lineHeight: 1.6,
    margin: 0,
    padding: '16px 24px',
    background: '#FAF6F1',
    borderBottom: '1px solid #D9CFC2'
  },
  selectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    borderBottom: '1px solid #D9CFC2'
  },
  selectLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#5C5346',
    marginRight: 'auto'
  },
  selectBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 24px',
    overflowY: 'auto',
    flex: 1
  },
  item: {
    background: '#FFFCF8',
    border: '2px solid #D9CFC2',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  itemSelected: {
    borderColor: '#B85C38',
    background: '#FFF9F5',
    boxShadow: '0 0 0 3px rgba(184, 92, 56, 0.15)'
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  itemCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: '#B85C38',
    cursor: 'pointer'
  },
  itemLabel: {
    fontWeight: 600,
    fontSize: '15px',
    color: '#2C2416'
  },
  itemReason: {
    fontSize: '14px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    margin: '0 0 12px 30px',
    lineHeight: 1.5
  },
  itemDiff: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginLeft: '30px'
  },
  diffBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  diffLabel: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#8B7D6B'
  },
  diffCurrent: {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#5C5346',
    background: '#FDF2F2',
    border: '1px solid #F5C6CB',
    borderRadius: '6px',
    lineHeight: 1.6,
    textDecoration: 'line-through',
    opacity: 0.8
  },
  diffSuggested: {
    padding: '10px 14px',
    fontSize: '14px',
    color: '#1B5E20',
    background: '#E8F5E9',
    border: '1px solid #A5D6A7',
    borderRadius: '6px',
    lineHeight: 1.6
  },
  // Action buttons - very prominent
  actions: {
    display: 'flex',
    gap: '16px',
    padding: '20px 24px',
    background: '#F5EEE6',
    borderTop: '2px solid #D9CFC2'
  },
  skipBtn: {
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#5C5346',
    background: '#FFFCF8',
    border: '2px solid #D9CFC2',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'all 0.15s ease'
  },
  applyBtn: {
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'white',
    background: '#B85C38',
    border: '2px solid #B85C38',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    marginLeft: 'auto',
    transition: 'all 0.15s ease'
  }
};

export default CascadeModal;
