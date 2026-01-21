import React, { useState } from 'react';
import { useToast } from '@investiture/components';
import { useAIOverlay } from '@investiture/components';
import CharacterToken from './CharacterToken.jsx';

/**
 * ConceptSection - Editable concept section with AI refine
 */
function ConceptSection({
  section,
  index,
  characters,
  storyConcept,
  allSections,
  genome,
  braindump,
  onUpdate,
  onCharacterClick
}) {
  const { showToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.content);
  const [direction, setDirection] = useState('');

  const handleEdit = () => {
    setEditValue(section.content);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(section.content);
    setDirection('');
  };

  const handleSave = () => {
    console.log('[ConceptSection] Saving section:', section.name);
    console.log('[ConceptSection] editValue:', editValue?.substring(0, 100) + '...');
    console.log('[ConceptSection] onUpdate exists:', !!onUpdate);
    onUpdate?.(section.name, editValue);
    setIsEditing(false);
    setDirection('');
  };

  const handleRefine = async () => {
    showOverlay('Refining section...', 'Claude is improving this section');

    try {
      const response = await fetch('/.netlify/functions/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: section.name,
          allSections: allSections || [],
          direction: direction || undefined,
          genome,
          braindump
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Refine failed');
      }

      const data = await response.json();

      if (data.revisedSection) {
        setEditValue(data.revisedSection);
        setIsEditing(true);
        showToast('Section refined! Review the changes.', 'success');

        if (data.affectedSections?.length > 0) {
          showToast(`${data.affectedSections.length} other section(s) may need updates`, 'info');
        }
      } else {
        showToast('Refine returned no content', 'error');
      }
    } catch (error) {
      console.error('Refine error:', error);
      showToast('Failed to refine section: ' + error.message, 'error');
    } finally {
      hideOverlay();
    }
  };

  // Render content with character tokens
  const renderContent = () => {
    const content = section.content;
    if (!content || !characters || characters.length === 0) {
      return <FormattedContent content={content} />;
    }

    return (
      <RenderContentWithEntities
        content={content}
        characters={characters}
        onCharacterClick={onCharacterClick}
      />
    );
  };

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h4 style={styles.title}>{section.name}</h4>
        <div style={styles.actions}>
          <button
            style={styles.actionBtn}
            onClick={handleEdit}
            title="Edit manually"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            style={styles.actionBtn}
            onClick={handleRefine}
            title="Refine with AI"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div style={styles.editMode}>
          <textarea
            style={styles.textarea}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={6}
          />
          <input
            type="text"
            style={styles.directionInput}
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="Optional: give AI a direction for refinement..."
          />
          <div style={styles.editActions}>
            <button style={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
            <button style={styles.refineBtn} onClick={handleRefine}>
              Refine with AI
            </button>
            <button style={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.display}>
          {renderContent()}
        </div>
      )}
    </div>
  );
}

/**
 * Format markdown content
 */
function FormattedContent({ content }) {
  if (!content) return <em style={{ color: '#8B7D6B' }}>No content</em>;

  const formatted = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return <div dangerouslySetInnerHTML={{ __html: `<p>${formatted}</p>` }} />;
}

/**
 * Render content with character tokens
 */
function RenderContentWithEntities({ content, characters, onCharacterClick }) {
  if (!content) return <em style={{ color: '#8B7D6B' }}>No content</em>;

  // Sort by name length (longest first)
  const sortedChars = [...characters]
    .filter(c => c.name)
    .sort((a, b) => b.name.length - a.name.length);

  if (sortedChars.length === 0) {
    return <FormattedContent content={content} />;
  }

  // Build regex
  const escapedNames = sortedChars.map(c => c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

  // Split and render
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    const matchedChar = sortedChars.find(
      c => c.name.toLowerCase() === match[1].toLowerCase()
    );

    if (matchedChar) {
      parts.push({ type: 'character', value: match[1], character: matchedChar });
    } else {
      parts.push({ type: 'text', value: match[1] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  // Format text parts
  const formatText = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ lineHeight: 1.6 }}>
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
        return <span key={i} dangerouslySetInnerHTML={{ __html: formatText(part.value) }} />;
      })}
    </div>
  );
}

const styles = {
  section: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: '#F5EEE6',
    borderBottom: '1px solid #D9CFC2'
  },
  title: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  actions: {
    display: 'flex',
    gap: '4px'
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
  display: {
    padding: '16px',
    fontSize: '15px',
    color: '#2C2416',
    lineHeight: 1.6
  },
  editMode: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FAF6F1',
    border: '2px solid #B85C38',
    borderRadius: '4px',
    resize: 'vertical',
    minHeight: '150px',
    lineHeight: 1.6
  },
  directionInput: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '4px'
  },
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  cancelBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  refineBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  saveBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'white',
    background: '#B85C38',
    border: '1px solid #B85C38',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    marginLeft: 'auto'
  }
};

export default ConceptSection;
