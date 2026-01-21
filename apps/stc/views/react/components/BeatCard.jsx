import React from 'react';
import CharacterToken from './CharacterToken.jsx';

/**
 * Common honorifics to skip when displaying short names
 */
const HONORIFICS = new Set([
  'dr.', 'dr', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms', 'prof.', 'prof',
  'capt.', 'capt', 'lt.', 'lt', 'sgt.', 'sgt', 'gen.', 'gen', 'col.', 'col',
  'sir', 'dame', 'lady', 'lord', 'doctor', 'professor', 'captain', 'detective'
]);

/**
 * Get the first "real" name part, skipping honorifics
 */
function getDisplayName(fullName) {
  if (!fullName) return 'Unnamed';
  const parts = fullName.split(/\s+/);
  for (const part of parts) {
    if (!HONORIFICS.has(part.toLowerCase())) {
      return part;
    }
  }
  return parts[0] || 'Unnamed';
}

/**
 * BeatCard - A single beat in the beat sheet grid
 *
 * Shows beat name, content preview, and character chips.
 * Visual distinction between empty and filled states.
 */
function BeatCard({ beat, characters, onClick }) {
  const hasContent = beat.content && beat.content.trim().length > 0;

  // Get characters that appear in this beat
  const beatCharacters = characters.filter(c =>
    beat.characterIds?.includes(c.id)
  );

  // Truncate content for preview
  const contentPreview = hasContent
    ? beat.content.length > 60
      ? beat.content.substring(0, 60) + '...'
      : beat.content
    : null;

  return (
    <button
      style={{
        ...styles.card,
        ...(hasContent ? styles.cardFilled : styles.cardEmpty)
      }}
      onClick={onClick}
      title={beat.name}
    >
      <div style={styles.header}>
        <span style={styles.beatName}>{beat.name}</span>
      </div>

      <div style={styles.content}>
        {contentPreview ? (
          <p style={styles.preview}>{contentPreview}</p>
        ) : (
          <p style={styles.placeholder}>Click to add...</p>
        )}
      </div>

      {beatCharacters.length > 0 && (
        <div style={styles.characters}>
          {beatCharacters.slice(0, 3).map(char => (
            <span key={char.id} style={styles.characterChip}>
              {getDisplayName(char.name)}
            </span>
          ))}
          {beatCharacters.length > 3 && (
            <span style={styles.moreChip}>+{beatCharacters.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'all 0.15s ease',
    minHeight: '80px',
    flex: '1 1 0',
    minWidth: '140px',
    maxWidth: '200px'
  },
  cardEmpty: {
    background: '#FAF6F1',
    border: '2px dashed #D9CFC2',
    color: '#8B7D6B'
  },
  cardFilled: {
    background: '#FFFCF8',
    border: '2px solid #D9CFC2',
    color: '#2C2416',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  header: {
    marginBottom: '6px'
  },
  beatName: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    color: '#5C5346',
    whiteSpace: 'nowrap'
  },
  content: {
    flex: 1,
    minHeight: '32px'
  },
  preview: {
    fontSize: '13px',
    lineHeight: 1.4,
    margin: 0,
    color: '#2C2416'
  },
  placeholder: {
    fontSize: '13px',
    fontStyle: 'italic',
    margin: 0,
    color: '#A89F91'
  },
  characters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #E5DDD3'
  },
  characterChip: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 500,
    color: '#B85C38',
    background: '#FFF5F0',
    border: '1px solid #FECACA',
    borderRadius: '3px'
  },
  moreChip: {
    display: 'inline-block',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 500,
    color: '#8B7D6B',
    background: '#F5EEE6',
    borderRadius: '3px'
  }
};

export default BeatCard;
