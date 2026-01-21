import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast, useAIOverlay } from '@investiture/components';
import CharacterToken from './CharacterToken.jsx';

/**
 * BeatModal - Full editing modal for a single beat
 *
 * Shows beat description, guiding question, content editor,
 * and AI generation button.
 */
function BeatModal({
  isOpen,
  onClose,
  beat,
  characters,
  onSave,
  onGenerate,
  onCharacterClick
}) {
  const { showToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();

  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Sync content when beat changes
  useEffect(() => {
    if (beat) {
      setContent(beat.content || '');
    }
  }, [beat]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Extract character IDs from content
      const characterIds = extractCharacterIds(content, characters);
      await onSave(beat.id, content, characterIds);
      showToast('Beat saved!', 'success');
      onClose();
    } catch (err) {
      console.error('Save beat error:', err);
      showToast('Failed to save beat', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    showOverlay('Generating beat...', `Writing ${beat.name}`);

    try {
      const generatedContent = await onGenerate(beat.id);
      if (generatedContent) {
        setContent(generatedContent);
        showToast('Beat generated! Review and edit as needed.', 'success');
      }
    } catch (err) {
      console.error('Generate beat error:', err);
      showToast('Failed to generate beat: ' + err.message, 'error');
    } finally {
      setGenerating(false);
      hideOverlay();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !beat) return null;

  return createPortal(
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.beatOrder}>Beat {beat.order}</span>
            <h2 style={styles.title}>{beat.name}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Beat info */}
        <div style={styles.info}>
          <p style={styles.description}>{beat.description}</p>
          <p style={styles.question}>
            <strong>Ask yourself:</strong> {beat.question}
          </p>
        </div>

        {/* Content editor */}
        <div style={styles.editorSection}>
          <label style={styles.label}>Your Content</label>
          <textarea
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write what happens in this beat..."
            rows={6}
          />
          <p style={styles.hint}>
            Use character names - they'll appear as clickable tokens when saved.
          </p>
        </div>

        {/* Content preview with character tokens */}
        {content && (
          <div style={styles.previewSection}>
            <label style={styles.label}>Preview</label>
            <div style={styles.preview}>
              <RenderWithCharacterTokens
                text={content}
                characters={characters}
                onCharacterClick={onCharacterClick}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={styles.generateBtn}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span style={styles.spinner}>↻</span>
                Generating...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Generate with AI
              </>
            )}
          </button>

          <div style={styles.rightActions}>
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{
                ...styles.saveBtn,
                opacity: saving ? 0.6 : 1
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Beat'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a lookup map and list of names including aliases
 */
function buildCharacterMatcher(characters) {
  const nameToCharMap = new Map();
  const allNames = [];

  for (const char of characters) {
    if (!char.name) continue;

    // Add primary name
    const primaryLower = char.name.toLowerCase();
    nameToCharMap.set(primaryLower, char);
    allNames.push(char.name);

    // Add aliases
    if (Array.isArray(char.aliases)) {
      for (const alias of char.aliases) {
        if (alias && alias.trim()) {
          const aliasLower = alias.trim().toLowerCase();
          if (!nameToCharMap.has(aliasLower)) {
            nameToCharMap.set(aliasLower, char);
          }
          allNames.push(alias.trim());
        }
      }
    }
  }

  // Sort by length (longest first) to match longest names first
  allNames.sort((a, b) => b.length - a.length);

  return { nameToCharMap, allNames };
}

/**
 * Extract character IDs from content text (matches names and aliases)
 */
function extractCharacterIds(text, characters) {
  if (!text || !characters || characters.length === 0) return [];

  const ids = new Set();
  const filteredChars = characters.filter(c => c.name);
  const { nameToCharMap, allNames } = buildCharacterMatcher(filteredChars);

  for (const name of allNames) {
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
    if (pattern.test(text)) {
      const char = nameToCharMap.get(name.toLowerCase());
      if (char) {
        ids.add(char.id);
      }
    }
  }

  return Array.from(ids);
}

/**
 * Render text with character names as tokens (matches names and aliases)
 */
function RenderWithCharacterTokens({ text, characters, onCharacterClick }) {
  if (!text) return null;
  if (!characters || characters.length === 0) return <span>{text}</span>;

  const filteredChars = characters.filter(c => c.name);
  if (filteredChars.length === 0) return <span>{text}</span>;

  const { nameToCharMap, allNames } = buildCharacterMatcher(filteredChars);

  if (allNames.length === 0) return <span>{text}</span>;

  const escapedNames = allNames.map(n => escapeRegex(n));
  const pattern = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    const matchedChar = nameToCharMap.get(match[1].toLowerCase());

    if (matchedChar) {
      parts.push({ type: 'character', value: match[1], character: matchedChar });
    } else {
      parts.push({ type: 'text', value: match[1] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === 'character') {
          return (
            <CharacterToken
              key={i}
              characterId={part.character.id}
              characterName={part.character.name}
              onClick={() => onCharacterClick?.(part.character)}
            >
              {part.value}
            </CharacterToken>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(44, 36, 22, 0.6)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 9000
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    background: '#FFFCF8',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: '#F5EEE6',
    borderBottom: '1px solid #D9CFC2'
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  beatOrder: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#B85C38',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    background: 'transparent',
    border: '1px solid #D9CFC2',
    borderRadius: '6px',
    color: '#5C5346',
    cursor: 'pointer'
  },
  info: {
    padding: '16px 24px',
    background: '#FAF6F1',
    borderBottom: '1px solid #E5DDD3'
  },
  description: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#5C5346',
    margin: '0 0 12px 0'
  },
  question: {
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#2C2416',
    margin: 0,
    fontStyle: 'italic'
  },
  editorSection: {
    padding: '20px 24px',
    flex: 1,
    overflow: 'auto'
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#5C5346',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FFFCF8',
    border: '2px solid #D9CFC2',
    borderRadius: '6px',
    resize: 'vertical',
    minHeight: '120px',
    lineHeight: 1.6
  },
  hint: {
    fontSize: '12px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    marginTop: '8px'
  },
  previewSection: {
    padding: '0 24px 20px'
  },
  preview: {
    padding: '12px 16px',
    background: '#FAF6F1',
    border: '1px solid #E5DDD3',
    borderRadius: '6px',
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#2C2416'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    background: '#F5EEE6',
    borderTop: '1px solid #D9CFC2'
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  rightActions: {
    display: 'flex',
    gap: '8px'
  },
  cancelBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: 'transparent',
    border: '1px solid #D9CFC2',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  saveBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
    background: '#B85C38',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite'
  }
};

export default BeatModal;
