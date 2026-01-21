import React from 'react';

/**
 * CharacterToken - Clickable inline token for character names in text
 * Used to render character names as interactive elements in concept sections
 */
function CharacterToken({ characterId, characterName, children, onClick }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      console.log('Character clicked:', characterId, characterName);
    }
  };

  return (
    <span
      onClick={handleClick}
      style={{
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        color: '#7c3aed',
        padding: '2px 6px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'background-color 0.15s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)'}
      data-character-id={characterId}
      data-character-name={characterName}
    >
      {children || characterName}
    </span>
  );
}

export default CharacterToken;
