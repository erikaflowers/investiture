import React, { useState, useCallback } from 'react';
import { vertebrae } from '../../../core/logic/vertebrae.js';

/**
 * GenomeSelector - Full genome editing interface
 * Matches vanilla vertebrae selection with tags and dropdowns
 */
function GenomeSelector({ genome, onChange, onSave }) {
  // Debug: log genome data to see what we're getting
  console.log('[GenomeSelector] genome:', genome);

  const handleToggle = useCallback((category, id) => {
    const current = genome?.[category] || [];
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];

    onChange?.({ ...genome, [category]: updated });
  }, [genome, onChange]);

  const handleHumorRole = useCallback((value) => {
    onChange?.({ ...genome, humorRole: value });
  }, [genome, onChange]);

  const handleHumorStyle = useCallback((id) => {
    // NOTE: Supabase stores as 'humorStyle' (singular), not 'humorStyles'
    const current = genome?.humorStyle || [];
    const updated = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];

    onChange?.({ ...genome, humorStyle: updated });
  }, [genome, onChange]);

  const humorEnabled = genome?.humorRole && genome.humorRole !== 'none';

  return (
    <div style={styles.container}>
      {/* Genre - NOTE: Supabase stores as 'genre' (singular) */}
      <VertebraRow
        label={vertebrae.genres.label}
        description={vertebrae.genres.description}
        options={vertebrae.genres.options}
        selected={genome?.genre || []}
        onToggle={(id) => handleToggle('genre', id)}
      />

      {/* Archetype - NOTE: Supabase stores as 'archetype' (singular) */}
      <VertebraRow
        label={vertebrae.archetypes.label}
        description={vertebrae.archetypes.description}
        options={vertebrae.archetypes.options}
        selected={genome?.archetype || []}
        onToggle={(id) => handleToggle('archetype', id)}
      />

      {/* Theme - NOTE: Supabase stores as 'theme' (singular) */}
      <VertebraRow
        label={vertebrae.themes.label}
        description={vertebrae.themes.description}
        options={vertebrae.themes.options}
        selected={genome?.theme || []}
        onToggle={(id) => handleToggle('theme', id)}
      />

      {/* Tone & Humor - Combined 3-column row (matches vanilla Row 4) */}
      <div style={styles.row}>
        <div style={styles.rowHeader}>
          <h4 style={styles.rowLabel}>Tone & Humor</h4>
          <p style={styles.rowDesc}>How does it feel, and how much does humor carry?</p>
        </div>

        <div style={styles.toneHumorGrid}>
          {/* Tone (left column) */}
          <div style={styles.toneHumorCol}>
            <span style={styles.colLabel}>{vertebrae.tones.label}</span>
            <span style={styles.colDesc}>{vertebrae.tones.description}</span>
            <div style={styles.tags}>
              {(genome?.tone || []).map(id => {
                const opt = vertebrae.tones.options.find(o => o.id === id);
                if (!opt) return null;
                return <Tag key={id} label={opt.name} onRemove={() => handleToggle('tone', id)} />;
              })}
              {(!genome?.tone || genome.tone.length === 0) && (
                <span style={styles.empty}>None selected</span>
              )}
            </div>
            <Combobox
              options={vertebrae.tones.options}
              selected={genome?.tone || []}
              onSelect={(id) => handleToggle('tone', id)}
              placeholder="Add tone..."
            />
          </div>

          {/* Humor Role (center column) - same pattern as others */}
          <div style={styles.toneHumorCol}>
            <span style={styles.colLabel}>{vertebrae.humor.role.label}</span>
            <span style={styles.colDesc}>{vertebrae.humor.role.description}</span>
            <div style={styles.tags}>
              {genome?.humorRole && genome.humorRole !== 'none' ? (
                <Tag
                  label={vertebrae.humor.role.options.find(o => o.id === genome.humorRole)?.name || genome.humorRole}
                  onRemove={() => handleHumorRole('none')}
                />
              ) : (
                <span style={styles.empty}>None selected</span>
              )}
            </div>
            <select
              style={styles.select}
              value={genome?.humorRole || 'none'}
              onChange={(e) => handleHumorRole(e.target.value)}
            >
              {vertebrae.humor.role.options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Humor Style (right column) */}
          <div style={{ ...styles.toneHumorCol, opacity: humorEnabled ? 1 : 0.4 }}>
            <span style={styles.colLabel}>{vertebrae.humor.style.label}</span>
            <span style={styles.colDesc}>{vertebrae.humor.style.description}</span>
            <div style={styles.tags}>
              {(genome?.humorStyle || []).map(id => {
                const opt = vertebrae.humor.style.options.find(o => o.id === id);
                if (!opt) return null;
                return (
                  <Tag
                    key={id}
                    label={opt.name}
                    onRemove={humorEnabled ? () => handleHumorStyle(id) : undefined}
                  />
                );
              })}
              {humorEnabled && (!genome?.humorStyle || genome.humorStyle.length === 0) && (
                <span style={styles.empty}>None selected</span>
              )}
            </div>
            {humorEnabled && (
              <Combobox
                options={vertebrae.humor.style.options}
                selected={genome?.humorStyle || []}
                onSelect={(id) => handleHumorStyle(id)}
                placeholder="Add humor style..."
              />
            )}
          </div>
        </div>
      </div>

      {/* Stakes */}
      <VertebraRow
        label={vertebrae.stakes.label}
        description={vertebrae.stakes.description}
        options={vertebrae.stakes.options}
        selected={genome?.stakes || []}
        onToggle={(id) => handleToggle('stakes', id)}
      />

      {/* Save button */}
      {onSave && (
        <div style={styles.saveRow}>
          <button style={styles.saveBtn} onClick={onSave}>
            Save Genome Changes
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * VertebraRow - Single vertebra category
 */
function VertebraRow({ label, description, options, selected, onToggle }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowHeader}>
        <h4 style={styles.rowLabel}>{label}</h4>
        <p style={styles.rowDesc}>{description}</p>
      </div>

      <div style={styles.rowBody}>
        <div style={styles.tags}>
          {selected.map(id => {
            const opt = options.find(o => o.id === id);
            if (!opt) return null;
            return (
              <Tag key={id} label={opt.name} onRemove={() => onToggle(id)} />
            );
          })}
          {selected.length === 0 && (
            <span style={styles.empty}>None selected</span>
          )}
        </div>

        <Combobox
          options={options}
          selected={selected}
          onSelect={onToggle}
          placeholder={`Add ${label.toLowerCase()}...`}
        />
      </div>
    </div>
  );
}

/**
 * Tag - Removable selection tag
 */
function Tag({ label, onRemove }) {
  return (
    <span style={styles.tag}>
      <span>{label}</span>
      {onRemove && (
        <button style={styles.tagRemove} onClick={onRemove}>&times;</button>
      )}
    </span>
  );
}

/**
 * Combobox - Dropdown selector
 */
function Combobox({ options, selected, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = options.filter(opt =>
    !selected.includes(opt.id) &&
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id) => {
    onSelect(id);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div style={styles.combobox}>
      <div style={styles.comboboxInputWrap}>
        <input
          type="text"
          style={styles.comboboxInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
        />
        <span style={styles.comboboxArrow}>&#9662;</span>
      </div>

      {isOpen && filtered.length > 0 && (
        <div style={styles.comboboxDropdown}>
          {filtered.map(opt => (
            <div
              key={opt.id}
              style={styles.comboboxOption}
              onMouseDown={() => handleSelect(opt.id)}
            >
              <strong>{opt.name}</strong>
              {opt.description && (
                <span style={styles.optionDesc}> — {opt.description}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  row: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    padding: '16px'
  },
  rowHeader: {
    marginBottom: '12px'
  },
  rowLabel: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  rowDesc: {
    fontSize: '13px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    margin: '4px 0 0 0'
  },
  rowBody: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: '16px'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    flex: 1,
    minHeight: '36px',
    alignItems: 'center'
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: '#B85C38',
    color: 'white',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 500
  },
  tagRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    padding: 0,
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer'
  },
  empty: {
    fontSize: '13px',
    color: '#8B7D6B',
    fontStyle: 'italic'
  },
  combobox: {
    position: 'relative',
    minWidth: '200px'
  },
  comboboxInputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  comboboxInput: {
    width: '100%',
    padding: '8px 32px 8px 12px',
    fontSize: '14px',
    color: '#2C2416',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    fontFamily: "'Source Sans 3', sans-serif"
  },
  comboboxArrow: {
    position: 'absolute',
    right: '8px',
    color: '#8B7D6B',
    fontSize: '12px',
    pointerEvents: 'none'
  },
  comboboxDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 100
  },
  comboboxOption: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#2C2416',
    cursor: 'pointer',
    borderBottom: '1px solid #F5EEE6'
  },
  optionDesc: {
    color: '#8B7D6B',
    fontSize: '13px'
  },
  // 3-column grid for Tone & Humor combined row
  toneHumorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px'
  },
  toneHumorCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  colLabel: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#5C5346'
  },
  colDesc: {
    fontSize: '12px',
    color: '#8B7D6B',
    fontStyle: 'italic',
    marginBottom: '4px'
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
  saveRow: {
    paddingTop: '16px',
    borderTop: '1px solid #D9CFC2'
  },
  saveBtn: {
    padding: '10px 20px',
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

export default GenomeSelector;
