import React, { useState } from 'react';
import { useBeats } from '@investiture/hooks';
import { acts, getBeatsByAct } from '../../../core/logic/beats.js';
import BeatCard from './BeatCard.jsx';
import BeatModal from './BeatModal.jsx';

/**
 * BeatSheet - The complete Save the Cat beat sheet
 *
 * Displays all 19 beats in a 4-row grid organized by act.
 */
function BeatSheet({
  projectId,
  characters,
  braindump,
  genome,
  storyConcept,
  onCharacterClick
}) {
  const { beats, loading, saveBeat, generateBeat } = useBeats(projectId);
  const [selectedBeat, setSelectedBeat] = useState(null);

  // Organize beats by act
  const beatsByAct = getBeatsByAct();

  // Merge beat definitions with saved data
  const getBeatWithData = (beatDef) => {
    const saved = beats.find(b => b.id === beatDef.id);
    return saved || { ...beatDef, content: '', characterIds: [] };
  };

  const handleBeatClick = (beat) => {
    const beatWithData = getBeatWithData(beat);
    setSelectedBeat(beatWithData);
  };

  const handleSave = async (beatId, content, characterIds) => {
    await saveBeat(beatId, content, characterIds);
    setSelectedBeat(null);
  };

  const handleGenerate = async (beatId) => {
    return generateBeat(beatId, {
      braindump,
      genome,
      storyConcept,
      characters
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading beat sheet...</p>
      </div>
    );
  }

  // Count filled beats
  const filledCount = beats.filter(b => b.content && b.content.trim()).length;

  return (
    <div style={styles.container}>
      {/* Coach text */}
      <div style={styles.coach}>
        <p style={styles.coachText}>
          This is your story's skeleton. Don't worry about getting it perfect—beats can shift as you discover your story. Start with the beats that feel clearest.
        </p>
        <span style={styles.progress}>{filledCount} of 19 beats</span>
      </div>

      {/* Beat grid by act */}
      <div style={styles.grid}>
        {acts.map(act => (
          <ActRow
            key={act.id}
            act={act}
            beats={beatsByAct[act.id]}
            getBeatWithData={getBeatWithData}
            characters={characters}
            onBeatClick={handleBeatClick}
          />
        ))}
      </div>

      {/* Beat editing modal */}
      <BeatModal
        isOpen={!!selectedBeat}
        onClose={() => setSelectedBeat(null)}
        beat={selectedBeat}
        characters={characters}
        onSave={handleSave}
        onGenerate={handleGenerate}
        onCharacterClick={onCharacterClick}
      />
    </div>
  );
}

/**
 * ActRow - A single act's row of beats
 */
function ActRow({ act, beats, getBeatWithData, characters, onBeatClick }) {
  return (
    <div style={styles.actRow}>
      {/* Act label */}
      <div style={styles.actLabel}>
        <span style={styles.actName}>{act.name}</span>
        <span style={styles.actSubtitle}>{act.subtitle}</span>
      </div>

      {/* Beat cards */}
      <div style={styles.beatCards}>
        {beats.map(beat => (
          <BeatCard
            key={beat.id}
            beat={getBeatWithData(beat)}
            characters={characters}
            onClick={() => onBeatClick(beat)}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '16px'
  },
  loading: {
    padding: '32px',
    textAlign: 'center',
    color: '#8B7D6B'
  },
  coach: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  coachText: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#5C5346',
    margin: 0,
    lineHeight: 1.5,
    maxWidth: '600px'
  },
  progress: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#B85C38',
    whiteSpace: 'nowrap',
    marginLeft: '16px'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  actRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'stretch'
  },
  actLabel: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: '90px',
    padding: '12px',
    background: '#2C2416',
    borderRadius: '6px',
    color: 'white'
  },
  actName: {
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.02em'
  },
  actSubtitle: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#A89F91',
    marginTop: '2px'
  },
  beatCards: {
    display: 'flex',
    gap: '10px',
    flex: 1,
    flexWrap: 'wrap'
  }
};

export default BeatSheet;
