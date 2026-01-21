import React, { useState } from 'react';
import { useToast } from '@investiture/components';
import { supabase } from '@investiture/hooks';

/**
 * BraindumpEditor - Collapsible accordion for editing braindump
 * Works with the braindumps table (raw_input field)
 * @param {string} projectId - Project UUID
 * @param {object} braindump - Braindump object with id, raw_input, etc. from braindumps table
 * @param {function} onUpdate - Callback when braindump is updated (receives updated braindump object)
 */
function BraindumpEditor({ projectId, braindump, onUpdate }) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(braindump?.raw_input || '');
  const [saving, setSaving] = useState(false);

  // Sync edit value when braindump changes
  React.useEffect(() => {
    setEditValue(braindump?.raw_input || '');
  }, [braindump]);

  const handleEdit = () => {
    setEditValue(braindump?.raw_input || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(braindump?.raw_input || '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (braindump?.id) {
        // Update existing braindump
        const { data, error } = await supabase
          .from('braindumps')
          .update({ raw_input: editValue })
          .eq('id', braindump.id)
          .select()
          .single();

        if (error) throw error;
        onUpdate?.(data);
      } else {
        // Create new braindump
        const { data, error } = await supabase
          .from('braindumps')
          .insert({
            project_id: projectId,
            raw_input: editValue
          })
          .select()
          .single();

        if (error) throw error;
        onUpdate?.(data);
      }

      setIsEditing(false);
      showToast('Braindump saved!', 'success');
    } catch (error) {
      console.error('Save braindump error:', error);
      showToast('Failed to save: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Preview text (first 100 chars)
  const braindumpText = braindump?.raw_input || '';
  const preview = braindumpText
    ? braindumpText.substring(0, 100) + (braindumpText.length > 100 ? '...' : '')
    : 'No braindump yet';

  return (
    <div style={styles.accordion}>
      <button
        style={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={styles.header}>
          <h3 style={styles.title}>Braindump</h3>
          {!isExpanded && (
            <span style={styles.preview}>{preview}</span>
          )}
        </div>
        <span style={{ ...styles.chevron, transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
          &#9662;
        </span>
      </button>

      {isExpanded && (
        <div style={styles.body}>
          {isEditing ? (
            <>
              <textarea
                style={styles.textarea}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={10}
                placeholder="Pour out your ideas here..."
              />
              <div style={styles.actions}>
                <button style={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
                <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={styles.content}>
                {braindumpText || <em style={{ color: '#8B7D6B' }}>No braindump yet. Click Edit to add your ideas.</em>}
              </div>
              <button style={styles.editBtn} onClick={handleEdit}>
                Edit Braindump
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  accordion: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  toggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '16px 24px',
    background: '#F5EEE6',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
    overflow: 'hidden'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0,
    flexShrink: 0
  },
  preview: {
    fontSize: '14px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1
  },
  chevron: {
    color: '#8B7D6B',
    transition: 'transform 0.2s ease',
    flexShrink: 0
  },
  body: {
    padding: '24px',
    borderTop: '1px solid #D9CFC2'
  },
  content: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '16px',
    lineHeight: 1.8,
    color: '#2C2416',
    whiteSpace: 'pre-wrap',
    marginBottom: '16px'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FFFCF8',
    border: '2px solid #B85C38',
    borderRadius: '8px',
    resize: 'vertical',
    minHeight: '200px',
    lineHeight: 1.8
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px'
  },
  editBtn: {
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
  saveBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'white',
    background: '#B85C38',
    border: '1px solid #B85C38',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  }
};

export default BraindumpEditor;
