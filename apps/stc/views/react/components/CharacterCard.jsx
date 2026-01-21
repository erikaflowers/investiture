import React from 'react';

const ARC_LABELS = {
  'positive-change': 'Positive Change',
  'negative-change': 'Negative Change',
  'steadfast': 'Steadfast'
};

/**
 * CharacterCard - Displays a character in the pyramid slot
 */
function CharacterCard({ character, onView, onEdit }) {
  const arcLabel = character.arc_type ? ARC_LABELS[character.arc_type] : null;

  return (
    <div style={styles.card}>
      <h4 style={styles.name}>{character.name || 'Unnamed'}</h4>

      {character.want && (
        <p style={styles.field}>
          <strong>Want:</strong> {character.want}
        </p>
      )}

      {character.need && (
        <p style={styles.field}>
          <strong>Need:</strong> {character.need}
        </p>
      )}

      {arcLabel && (
        <span style={styles.arc}>{arcLabel}</span>
      )}

      <div style={styles.actions}>
        <button
          style={styles.actionBtn}
          onClick={() => onView?.(character)}
          title="View character sheet"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          style={styles.actionBtn}
          onClick={() => onEdit?.(character)}
          title="Edit character"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * CharacterSlot - Empty slot with role description
 */
export function CharacterSlot({ role, description, character, onAdd, onView, onEdit }) {
  if (character) {
    return (
      <div style={styles.slot}>
        <div style={styles.slotRoleTag}>{role}</div>
        <CharacterCard character={character} onView={onView} onEdit={onEdit} />
      </div>
    );
  }

  return (
    <div style={styles.slot}>
      <div style={styles.empty}>
        <h4 style={styles.roleTitle}>{role}</h4>
        <p style={styles.roleDesc}>{description}</p>
        <button style={styles.addBtn} onClick={onAdd}>
          Add Character
        </button>
      </div>
    </div>
  );
}

/**
 * CharacterPyramid - Full pyramid layout for all character roles
 */
export function CharacterPyramid({ characters, onAdd, onView, onEdit }) {
  const ROLES = {
    protagonist: { label: 'Protagonist', desc: "Drives the story toward the goal. The perspective we follow." },
    antagonist: { label: 'Antagonist', desc: "Opposes the goal. Not necessarily evil—just in the way." },
    mirror: { label: 'Mirror', desc: "Reflects or challenges the protagonist's worldview. Forces growth." },
    ally: { label: 'Ally', desc: 'Supports the protagonist. Provides faith, help, or mentorship.' },
    skeptic: { label: 'Skeptic', desc: 'Questions and doubts. Keeps the protagonist honest.' },
    wildcard: { label: 'Wildcard', desc: "Doesn't fit neatly. Comic relief, love interest, or chaos agent." }
  };

  const getCharForRole = (role) => characters?.find(c => c.role === role);

  // Extra characters (no role or role not in standard list)
  const standardRoles = Object.keys(ROLES);
  const extraCharacters = characters?.filter(
    c => !c.role || !standardRoles.includes(c.role)
  ) || [];

  return (
    <div style={styles.pyramid}>
      {/* Tier 1: Core Roles (Protagonist, Antagonist) */}
      <div style={styles.tier1}>
        <CharacterSlot
          role={ROLES.protagonist.label}
          description={ROLES.protagonist.desc}
          character={getCharForRole('protagonist')}
          onAdd={() => onAdd('protagonist')}
          onView={onView}
          onEdit={onEdit}
        />
        <CharacterSlot
          role={ROLES.antagonist.label}
          description={ROLES.antagonist.desc}
          character={getCharForRole('antagonist')}
          onAdd={() => onAdd('antagonist')}
          onView={onView}
          onEdit={onEdit}
        />
      </div>

      {/* Tier 2: Supporting Roles */}
      <div style={styles.tier2}>
        <CharacterSlot
          role={ROLES.mirror.label}
          description={ROLES.mirror.desc}
          character={getCharForRole('mirror')}
          onAdd={() => onAdd('mirror')}
          onView={onView}
          onEdit={onEdit}
        />
        <CharacterSlot
          role={ROLES.ally.label}
          description={ROLES.ally.desc}
          character={getCharForRole('ally')}
          onAdd={() => onAdd('ally')}
          onView={onView}
          onEdit={onEdit}
        />
        <CharacterSlot
          role={ROLES.skeptic.label}
          description={ROLES.skeptic.desc}
          character={getCharForRole('skeptic')}
          onAdd={() => onAdd('skeptic')}
          onView={onView}
          onEdit={onEdit}
        />
        <CharacterSlot
          role={ROLES.wildcard.label}
          description={ROLES.wildcard.desc}
          character={getCharForRole('wildcard')}
          onAdd={() => onAdd('wildcard')}
          onView={onView}
          onEdit={onEdit}
        />
      </div>

      {/* Extra characters */}
      {extraCharacters.length > 0 && (
        <div style={styles.extra}>
          <h4 style={styles.extraTitle}>Additional Characters</h4>
          <div style={styles.extraList}>
            {extraCharacters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                onView={onView}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add another character button */}
      <div style={styles.addMore}>
        <button style={styles.addMoreBtn} onClick={() => onAdd(null)}>
          + Add Another Character
        </button>
      </div>
    </div>
  );
}

const styles = {
  pyramid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  tier1: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  tier2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  slot: {
    position: 'relative',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    padding: '16px',
    minHeight: '140px'
  },
  slotRoleTag: {
    position: 'absolute',
    top: '-8px',
    left: '12px',
    padding: '2px 8px',
    background: '#7C5E4A',
    color: 'white',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '4px'
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '12px'
  },
  roleTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: '0 0 8px 0'
  },
  roleDesc: {
    fontSize: '12px',
    color: '#8B7D6B',
    margin: '0 0 12px 0',
    lineHeight: 1.4
  },
  addBtn: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  name: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  field: {
    fontSize: '12px',
    color: '#5C5346',
    margin: 0,
    lineHeight: 1.4
  },
  arc: {
    display: 'inline-block',
    padding: '2px 6px',
    background: '#B85C38',
    color: 'white',
    fontSize: '10px',
    fontWeight: 500,
    borderRadius: '4px',
    marginTop: '4px',
    alignSelf: 'flex-start'
  },
  actions: {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #D9CFC2'
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '4px',
    color: '#8B7D6B',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  extra: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #D9CFC2'
  },
  extraTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1rem',
    fontWeight: 600,
    color: '#2C2416',
    marginBottom: '16px'
  },
  extraList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px'
  },
  addMore: {
    marginTop: '16px',
    textAlign: 'center'
  },
  addMoreBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  }
};

// Responsive styles via media query
const mediaStyles = document.createElement('style');
mediaStyles.textContent = `
  @media (max-width: 768px) {
    .stc-tier-2 {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
`;
document.head.appendChild(mediaStyles);

export default CharacterCard;
