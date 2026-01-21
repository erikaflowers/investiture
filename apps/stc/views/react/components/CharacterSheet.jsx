import React from 'react';
import { Modal } from '@investiture/components';

const ARC_LABELS = {
  'positive-change': 'Positive Change',
  'negative-change': 'Negative Change',
  'steadfast': 'Steadfast'
};

const ROLE_LABELS = {
  protagonist: 'Protagonist',
  antagonist: 'Antagonist',
  mirror: 'Mirror',
  ally: 'Ally',
  skeptic: 'Skeptic',
  wildcard: 'Wildcard'
};

/**
 * CharacterSheet - Read-only character view modal
 */
function CharacterSheet({ isOpen, onClose, character, onEdit }) {
  if (!character) return null;

  const arcLabel = character.arc_type ? ARC_LABELS[character.arc_type] : null;
  const roleLabel = character.role ? ROLE_LABELS[character.role] : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={character.name || 'Character'} size="medium">
      <div style={styles.sheet}>
        {/* Role badge */}
        {roleLabel && (
          <div style={styles.roleBadge}>{roleLabel}</div>
        )}

        {/* Aliases */}
        {character.aliases && character.aliases.length > 0 && (
          <div style={styles.aliases}>
            <span style={styles.aliasLabel}>Also known as:</span>
            <span style={styles.aliasList}>
              {character.aliases.join(', ')}
            </span>
          </div>
        )}

        {/* Fields */}
        <div style={styles.fields}>
          {character.want && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Want (External Goal)</label>
              <p style={styles.fieldValue}>{character.want}</p>
            </div>
          )}

          {character.need && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Need (Internal Growth)</label>
              <p style={styles.fieldValue}>{character.need}</p>
            </div>
          )}

          {arcLabel && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Arc Type</label>
              <p style={styles.fieldValue}>{arcLabel}</p>
            </div>
          )}

          {character.arc_description && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Arc Description</label>
              <p style={styles.fieldValue}>{character.arc_description}</p>
            </div>
          )}

          {character.connections && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Connections</label>
              <p style={styles.fieldValue}>{character.connections}</p>
            </div>
          )}
        </div>

        {/* Edit button */}
        <div style={styles.actions}>
          <button style={styles.editBtn} onClick={() => onEdit?.(character)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Character
          </button>
        </div>
      </div>
    </Modal>
  );
}

const styles = {
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: '#7C5E4A',
    color: 'white',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '4px',
    alignSelf: 'flex-start'
  },
  aliases: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    flexWrap: 'wrap'
  },
  aliasLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#8B7D6B',
    fontStyle: 'italic'
  },
  aliasList: {
    fontSize: '13px',
    color: '#5C5346'
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#8B7D6B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  fieldValue: {
    fontSize: '15px',
    color: '#2C2416',
    lineHeight: 1.6,
    margin: 0
  },
  actions: {
    paddingTop: '16px',
    borderTop: '1px solid #D9CFC2',
    marginTop: '8px'
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#2C2416',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  }
};

export default CharacterSheet;
