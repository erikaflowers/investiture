import React, { useState, useEffect } from 'react';
import { Modal } from '@investiture/components';
import { useToast } from '@investiture/components';
import { useAIOverlay } from '@investiture/components';
import { supabase } from '@investiture/hooks';

const ARC_TYPES = [
  { value: '', label: 'Select arc type...' },
  { value: 'positive-change', label: 'Positive Change – Transforms for the better' },
  { value: 'negative-change', label: 'Negative Change – Transforms for the worse' },
  { value: 'steadfast', label: 'Steadfast – Holds their ground' }
];

const FIELDS = ['name', 'want', 'need', 'arc_type', 'arc_description', 'connections'];

/**
 * CharacterModal - Full character editing modal
 * Handles create, edit, AI generation, re-roll, and delete
 */
function CharacterModal({
  isOpen,
  onClose,
  character,
  projectId,
  role,
  braindump,
  storyConcept,
  genome,
  allCharacters,
  onSave,
  onDelete
}) {
  const { showToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();

  const [formData, setFormData] = useState({
    name: '',
    want: '',
    need: '',
    arc_type: '',
    arc_description: '',
    connections: ''
  });
  const [loading, setLoading] = useState(false);
  const [rerolling, setRerolling] = useState(null);

  // Populate form when character changes
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        want: character.want || '',
        need: character.need || '',
        arc_type: character.arc_type || '',
        arc_description: character.arc_description || '',
        connections: character.connections || ''
      });
    } else {
      setFormData({
        name: '',
        want: '',
        need: '',
        arc_type: '',
        arc_description: '',
        connections: ''
      });
    }
  }, [character, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const characterData = {
        ...formData,
        project_id: projectId,
        role: character?.role || role || null
      };

      if (character?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('characters')
          .update(characterData)
          .eq('id', character.id)
          .select()
          .single();

        if (error) throw error;

        showToast('Character saved!', 'success');
        onSave?.(data);
      } else {
        // Create new
        const { data, error } = await supabase
          .from('characters')
          .insert(characterData)
          .select()
          .single();

        if (error) throw error;

        showToast('Character created!', 'success');
        onSave?.(data);
      }

      onClose();
    } catch (error) {
      console.error('Save character error:', error);
      showToast('Failed to save character: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!character?.id) return;
    if (!window.confirm('Delete this character? This cannot be undone.')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', character.id);

      if (error) throw error;

      showToast('Character deleted', 'info');
      onDelete?.(character.id);
      onClose();
    } catch (error) {
      console.error('Delete character error:', error);
      showToast('Failed to delete character: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    showOverlay('Creating your character...', 'Claude is crafting a character that fits your story');

    try {
      const payload = {
        mode: 'full',
        role: character?.role || role,
        braindump,
        storyConcept,
        genome,
        existingCharacters: allCharacters?.filter(c => c.id !== character?.id)
      };

      console.log('[CharacterModal] Generate payload:', {
        hasBraindump: !!braindump,
        braindumpLength: braindump?.length,
        hasStoryConcept: !!storyConcept,
        storyConceptLength: storyConcept?.length,
        role: payload.role
      });

      const response = await fetch('/.netlify/functions/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CharacterModal] API error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || errorData.details || 'Generation failed');
      }

      const data = await response.json();
      const generated = data.character;

      setFormData({
        name: generated.name || '',
        want: generated.want || '',
        need: generated.need || '',
        arc_type: generated.arc_type || '',
        arc_description: generated.arc_description || '',
        connections: generated.connections || ''
      });

      showToast('Character generated!', 'success');
    } catch (error) {
      console.error('AI generation error:', error);
      showToast('Failed to generate character: ' + error.message, 'error');
    } finally {
      hideOverlay();
    }
  };

  const handleReroll = async (field) => {
    setRerolling(field);

    try {
      const response = await fetch('/.netlify/functions/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single-field',
          field,
          rerollField: field,
          role: character?.role || role,
          currentCharacter: formData,
          braindump,
          storyConcept,
          genome,
          existingCharacters: allCharacters?.filter(c => c.id !== character?.id)
        })
      });

      if (!response.ok) {
        throw new Error('Re-roll failed');
      }

      const data = await response.json();
      const newValue = data.character?.[field] || data.value;

      if (newValue) {
        setFormData(prev => ({ ...prev, [field]: newValue }));
        showToast(`${field} regenerated`, 'success');
      }
    } catch (error) {
      console.error('Re-roll error:', error);
      showToast('Failed to regenerate field', 'error');
    } finally {
      setRerolling(null);
    }
  };

  const isEditing = !!character?.id;
  const title = isEditing ? `Edit ${character.name || 'Character'}` : 'New Character';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Loading overlay for form */}
        {loading && (
          <div style={styles.formLoading}>
            <div style={styles.spinner} />
            <span>Saving...</span>
          </div>
        )}

        {/* Name field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Name</label>
            <RerollButton field="name" loading={rerolling === 'name'} onClick={() => handleReroll('name')} />
          </div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="What's their name?"
            style={styles.input}
            required
          />
        </div>

        {/* Want field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Want (External Goal)</label>
            <RerollButton field="want" loading={rerolling === 'want'} onClick={() => handleReroll('want')} />
          </div>
          <textarea
            value={formData.want}
            onChange={(e) => handleChange('want', e.target.value)}
            placeholder="What do they want?"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {/* Need field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Need (Internal Growth)</label>
            <RerollButton field="need" loading={rerolling === 'need'} onClick={() => handleReroll('need')} />
          </div>
          <textarea
            value={formData.need}
            onChange={(e) => handleChange('need', e.target.value)}
            placeholder="What do they need to learn?"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {/* Arc Type field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Arc Type</label>
            <RerollButton field="arc_type" loading={rerolling === 'arc_type'} onClick={() => handleReroll('arc_type')} />
          </div>
          <select
            value={formData.arc_type}
            onChange={(e) => handleChange('arc_type', e.target.value)}
            style={styles.select}
          >
            {ARC_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Arc Description field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Arc Description</label>
            <RerollButton field="arc_description" loading={rerolling === 'arc_description'} onClick={() => handleReroll('arc_description')} />
          </div>
          <textarea
            value={formData.arc_description}
            onChange={(e) => handleChange('arc_description', e.target.value)}
            placeholder="How do they change (or hold steady)?"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {/* Connections field */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Connections</label>
            <RerollButton field="connections" loading={rerolling === 'connections'} onClick={() => handleReroll('connections')} />
          </div>
          <textarea
            value={formData.connections}
            onChange={(e) => handleChange('connections', e.target.value)}
            placeholder="How do they relate to other characters?"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button type="button" style={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={styles.btnSecondary} onClick={handleGenerateAI}>
            Generate with AI
          </button>
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            Save Character
          </button>
        </div>

        {/* Delete section */}
        {isEditing && (
          <div style={styles.deleteSection}>
            <button type="button" style={styles.btnDanger} onClick={handleDelete} disabled={loading}>
              Delete Character
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}

/**
 * Re-roll button component
 */
function RerollButton({ field, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={styles.rerollBtn}
      title={`Regenerate ${field}`}
    >
      {loading ? (
        <div style={styles.miniSpinner} />
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      )}
    </button>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative'
  },
  formLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 252, 248, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    zIndex: 10,
    borderRadius: '8px'
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #D9CFC2',
    borderTopColor: '#B85C38',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontWeight: 500,
    fontSize: '14px',
    color: '#2C2416'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#2C2416',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  textarea: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#2C2416',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    fontFamily: "'Source Sans 3', sans-serif",
    resize: 'vertical',
    minHeight: '60px'
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#2C2416',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  rerollBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    padding: 0,
    background: 'transparent',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    color: '#8B7D6B',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  miniSpinner: {
    width: '12px',
    height: '12px',
    border: '2px solid #D9CFC2',
    borderTopColor: '#B85C38',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #D9CFC2'
  },
  btnSecondary: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#2C2416',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  btnPrimary: {
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
  },
  deleteSection: {
    paddingTop: '16px',
    borderTop: '1px solid #D9CFC2',
    marginTop: '8px'
  },
  btnDanger: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#DC3545',
    background: '#FDF2F2',
    border: '1px solid #F5C6CB',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif"
  }
};

export default CharacterModal;
