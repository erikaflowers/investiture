import React, { useState } from 'react';
import { useToast } from '@investiture/components';
import { useAIOverlay } from '@investiture/components';
import { supabase } from '@investiture/hooks';

/**
 * BriefDisplay - Shows and allows editing of the Brief section
 */
function BriefDisplay({ projectId, brief, braindump, onUpdate }) {
  const { showToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field) => {
    setEditValue(brief?.[field] || '');
    setEditingField(field);
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async (field) => {
    try {
      const updatedBrief = { ...brief, [field]: editValue };

      const { error } = await supabase
        .from('projects')
        .update({ brief: updatedBrief })
        .eq('id', projectId);

      if (error) throw error;

      onUpdate?.(updatedBrief);
      setEditingField(null);
      showToast('Brief updated!', 'success');
    } catch (error) {
      console.error('Save brief error:', error);
      showToast('Failed to save: ' + error.message, 'error');
    }
  };

  const handleRegenerate = async () => {
    if (!braindump) {
      showToast('Add a braindump first to generate a brief', 'info');
      return;
    }

    showOverlay('Extracting the essence...', 'Claude is distilling your braindump into a brief');

    try {
      const response = await fetch('/.netlify/functions/extract-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ braindump })
      });

      if (!response.ok) {
        throw new Error('Brief extraction failed');
      }

      const data = await response.json();
      const newBrief = {
        coreConcept: data.coreConcept || '',
        premise: data.premise || '',
        worldAndTone: data.worldAndTone || '',
        locked: false
      };

      const { error } = await supabase
        .from('projects')
        .update({ brief: newBrief })
        .eq('id', projectId);

      if (error) throw error;

      onUpdate?.(newBrief);
      showToast('Brief generated!', 'success');
    } catch (error) {
      console.error('Generate brief error:', error);
      showToast('Failed to generate brief: ' + error.message, 'error');
    } finally {
      hideOverlay();
    }
  };

  const fields = [
    { key: 'coreConcept', label: 'Core Concept', desc: 'The essential idea in one sentence' },
    { key: 'premise', label: 'Premise', desc: 'The story setup and hook' },
    { key: 'worldAndTone', label: 'World & Tone', desc: 'Setting and emotional feel' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Brief</h3>
        <button style={styles.regenBtn} onClick={handleRegenerate} title="Regenerate brief from braindump">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {!brief ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>No brief yet. Generate one from your braindump.</p>
          <button style={styles.generateBtn} onClick={handleRegenerate}>
            Generate Brief
          </button>
        </div>
      ) : (
        <div style={styles.fields}>
          {fields.map(field => (
            <BriefField
              key={field.key}
              label={field.label}
              description={field.desc}
              value={brief[field.key]}
              isEditing={editingField === field.key}
              editValue={editValue}
              onEdit={() => handleEdit(field.key)}
              onCancel={handleCancel}
              onSave={() => handleSave(field.key)}
              onChange={setEditValue}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * BriefField - Single editable brief field
 */
function BriefField({ label, description, value, isEditing, editValue, onEdit, onCancel, onSave, onChange }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldHeader}>
        <div>
          <h4 style={styles.fieldLabel}>{label}</h4>
          <p style={styles.fieldDesc}>{description}</p>
        </div>
        {!isEditing && (
          <button style={styles.editBtn} onClick={onEdit} title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={styles.fieldEdit}>
          <textarea
            style={styles.fieldTextarea}
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
          <div style={styles.fieldActions}>
            <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
            <button style={styles.saveBtn} onClick={onSave}>Save</button>
          </div>
        </div>
      ) : (
        <p style={styles.fieldValue}>
          {value || <em style={{ color: '#8B7D6B' }}>Not set</em>}
        </p>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    padding: '24px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #B85C38'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  regenBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: 0,
    background: 'transparent',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    color: '#8B7D6B',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  empty: {
    textAlign: 'center',
    padding: '24px'
  },
  emptyText: {
    color: '#8B7D6B',
    marginBottom: '16px'
  },
  generateBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'white',
    background: '#B85C38',
    border: '1px solid #B85C38',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  field: {
    background: '#FAF6F1',
    borderRadius: '8px',
    padding: '16px'
  },
  fieldHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  fieldLabel: {
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.03em'
  },
  fieldDesc: {
    fontSize: '12px',
    color: '#8B7D6B',
    margin: '2px 0 0 0',
    fontStyle: 'italic'
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#8B7D6B',
    cursor: 'pointer'
  },
  fieldValue: {
    fontSize: '15px',
    color: '#2C2416',
    lineHeight: 1.6,
    margin: 0
  },
  fieldEdit: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  fieldTextarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    background: '#FFFCF8',
    border: '2px solid #B85C38',
    borderRadius: '4px',
    resize: 'vertical',
    minHeight: '80px'
  },
  fieldActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  saveBtn: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'white',
    background: '#B85C38',
    border: '1px solid #B85C38',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  }
};

export default BriefDisplay;
