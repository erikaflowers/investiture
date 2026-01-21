import React, { useState } from 'react';
import { useToast, useAIOverlay } from '@investiture/components';
import CharacterToken from './CharacterToken.jsx';

/**
 * DevZone - Development testing area
 * Only visible in development mode
 */
function DevZone({
  characters = [],
  onCharacterClick,
  onTriggerGenomeCascade,
  onTriggerCharacterCascade,
  onTriggerCascadeModal
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast, removeToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();

  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  const handleTestToastSuccess = () => {
    showToast('This is a success toast!', 'success');
  };

  const handleTestToastError = () => {
    showToast('This is an error toast!', 'error');
  };

  const handleTestToastChecking = () => {
    const id = showToast('Checking something...', 'checking', 0);
    setTimeout(() => {
      removeToast(id);
      showToast('Done checking!', 'success');
    }, 2000);
  };

  const handleTestAIOverlay = () => {
    showOverlay('Testing AI Overlay...', 'This is what users see during AI operations');
    setTimeout(() => {
      hideOverlay();
      showToast('AI Overlay test complete', 'success');
    }, 3000);
  };

  // Generate test paragraph with character names
  const generateTestParagraph = () => {
    if (!characters || characters.length === 0) {
      return <em style={{ color: '#8B7D6B' }}>No characters in project to test with.</em>;
    }

    const names = characters.filter(c => c.name).map(c => c.name);
    if (names.length === 0) {
      return <em style={{ color: '#8B7D6B' }}>Characters exist but have no names.</em>;
    }

    // Build a test paragraph that includes all character names
    const testText = `In this story, ${names[0] || 'Character 1'} embarks on a journey that will change everything. ` +
      (names[1] ? `Along the way, ${names[1]} becomes an unlikely ally. ` : '') +
      (names[2] ? `But ${names[2]} has other plans that threaten to derail everything. ` : '') +
      (names[3] ? `Meanwhile, ${names[3]} watches from the shadows, waiting for the right moment. ` : '') +
      (names[4] ? `And nobody suspects that ${names[4]} holds the key to it all.` : '');

    // Now render with CharacterTokens
    return renderWithCharacterTokens(testText, characters, onCharacterClick);
  };

  // Build lookup map including aliases
  const buildCharacterMatcher = (characters) => {
    const nameToCharMap = new Map();
    const allNames = [];

    for (const char of characters) {
      if (!char.name) continue;

      // Add primary name
      nameToCharMap.set(char.name.toLowerCase(), char);
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

    // Sort by length (longest first)
    allNames.sort((a, b) => b.length - a.length);
    return { nameToCharMap, allNames };
  };

  const renderWithCharacterTokens = (text, chars, onClick) => {
    const filteredChars = chars.filter(c => c.name);
    if (filteredChars.length === 0) return text;

    const { nameToCharMap, allNames } = buildCharacterMatcher(filteredChars);
    if (allNames.length === 0) return text;

    const escapedNames = allNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
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
                onClick={() => onClick?.(part.character)}
              >
                {part.value}
              </CharacterToken>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span style={styles.headerText}>Dev Zone</span>
        <span style={styles.headerIcon}>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div style={styles.content}>
          {/* Entity Rendering Test */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Entity Rendering Test</h4>
            <p style={styles.sectionDesc}>
              Character names should appear as clickable tokens:
            </p>
            <div style={styles.testParagraph}>
              {generateTestParagraph()}
            </div>
            <p style={styles.charCount}>
              {characters.length} character(s) in project: {characters.map(c => c.name || '(unnamed)').join(', ') || 'none'}
            </p>
          </div>

          {/* Toast Tests */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Toast Tests</h4>
            <div style={styles.buttonRow}>
              <button style={styles.btnSuccess} onClick={handleTestToastSuccess}>
                Test Toast (Success)
              </button>
              <button style={styles.btnError} onClick={handleTestToastError}>
                Test Toast (Error)
              </button>
              <button style={styles.btnInfo} onClick={handleTestToastChecking}>
                Test Toast (Checking)
              </button>
            </div>
          </div>

          {/* Overlay Test */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>AI Overlay Test</h4>
            <div style={styles.buttonRow}>
              <button style={styles.btn} onClick={handleTestAIOverlay}>
                Test AI Overlay (3s)
              </button>
            </div>
          </div>

          {/* Cascade Tests */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Cascade Modal Tests</h4>
            <div style={styles.buttonRow}>
              <button style={styles.btn} onClick={onTriggerCascadeModal}>
                Test Cascade Modal (Mock Data)
              </button>
              <button style={styles.btnWarning} onClick={onTriggerGenomeCascade}>
                Trigger Genome Cascade
              </button>
              <button style={styles.btnWarning} onClick={onTriggerCharacterCascade}>
                Trigger Character Cascade
              </button>
            </div>
            <p style={styles.hint}>
              Note: Genome/Character cascades require actual data changes to produce real results.
            </p>
          </div>

          {/* Environment Info */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Environment</h4>
            <pre style={styles.envInfo}>
              Mode: {import.meta.env.MODE}{'\n'}
              DEV: {String(import.meta.env.DEV)}{'\n'}
              PROD: {String(import.meta.env.PROD)}{'\n'}
              Base URL: {import.meta.env.BASE_URL}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginTop: '48px',
    border: '2px dashed #D9CFC2',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#FAF6F1'
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#F5EEE6',
    border: 'none',
    borderBottom: '1px solid #D9CFC2',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: '#5C5346',
    textAlign: 'left'
  },
  headerText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  headerIcon: {
    fontSize: '10px'
  },
  content: {
    padding: '16px'
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #E5DDD3'
  },
  sectionTitle: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#8B7D6B',
    margin: '0 0 12px 0'
  },
  testParagraph: {
    padding: '16px',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '6px',
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#2C2416'
  },
  charCount: {
    fontSize: '12px',
    color: '#8B7D6B',
    marginTop: '8px',
    fontStyle: 'italic'
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  btn: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  btnSuccess: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#1B5E20',
    background: '#E8F5E9',
    border: '1px solid #A5D6A7',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  btnError: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#721C24',
    background: '#FDF2F2',
    border: '1px solid #F5C6CB',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  btnInfo: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#FFF8E1',
    border: '1px solid #FFE082',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  btnWarning: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#92400E',
    background: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  hint: {
    fontSize: '12px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    marginTop: '8px'
  },
  envInfo: {
    padding: '12px',
    background: '#2C2416',
    color: '#A5D6A7',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: 0,
    overflow: 'auto'
  }
};

export default DevZone;
