import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject, supabase } from '@investiture/hooks';
import { useToast, useAIOverlay } from '@investiture/components';
import {
  CharacterModal,
  CharacterSheet,
  CharacterPyramid,
  ConceptSection,
  GenomeSelector,
  CascadeModal,
  BraindumpEditor,
  BriefDisplay,
  DevZone
} from '@stc/components';
import { vertebrae } from '../../../core/logic/vertebrae.js';

/**
 * ProjectView - Full interactive project view
 * Matches vanilla functionality completely
 */
function ProjectView() {
  const { projectId } = useParams();
  const { project, braindump, characters, loading, error, refetch } = useProjectWithRefetch(projectId);
  const { showToast, removeToast } = useToast();
  const { showOverlay, hideOverlay } = useAIOverlay();

  // Local state for editing
  const [localProject, setLocalProject] = useState(null);
  const [localBraindump, setLocalBraindump] = useState(null);
  const [localCharacters, setLocalCharacters] = useState([]);

  // Modal states
  const [characterModal, setCharacterModal] = useState({ open: false, character: null, role: null });
  const [characterSheet, setCharacterSheet] = useState({ open: false, character: null });
  const [cascadeModal, setCascadeModal] = useState({ open: false, items: [], intro: '' });

  // Concept view state (sections vs combined)
  const [conceptView, setConceptView] = useState('sections');

  // Sync local state when project loads
  React.useEffect(() => {
    if (project) setLocalProject(project);
  }, [project]);

  React.useEffect(() => {
    if (braindump) setLocalBraindump(braindump);
  }, [braindump]);

  React.useEffect(() => {
    if (characters) setLocalCharacters(characters);
  }, [characters]);

  // ========== CHARACTER HANDLERS ==========
  const handleAddCharacter = (role) => {
    setCharacterModal({ open: true, character: null, role });
  };

  const handleViewCharacter = (character) => {
    setCharacterSheet({ open: true, character });
  };

  const handleEditCharacter = (character) => {
    setCharacterSheet({ open: false, character: null });
    setCharacterModal({ open: true, character, role: character.role });
  };

  const handleSaveCharacter = async (savedCharacter) => {
    // Update local state
    setLocalCharacters(prev => {
      const exists = prev.find(c => c.id === savedCharacter.id);
      if (exists) {
        return prev.map(c => c.id === savedCharacter.id ? savedCharacter : c);
      }
      return [...prev, savedCharacter];
    });

    // Close modal
    setCharacterModal({ open: false, character: null, role: null });

    // Check for cascade impacts
    await checkCharacterCascade(savedCharacter);
  };

  const handleDeleteCharacter = (characterId) => {
    setLocalCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  const checkCharacterCascade = async (character) => {
    const toastId = showToast('Checking for downstream impacts...', 'checking', 0);

    try {
      const response = await fetch('/.netlify/functions/cascade-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cascadeType: 'project-wide',
          character,
          previousCharacter: characters.find(c => c.id === character.id),
          storyConcept: localProject?.story_concept?.concept,
          allCharacters: localCharacters,
          genome: localProject?.genome
        })
      });

      if (response.ok) {
        const data = await response.json();
        const cascade = data.cascade;

        if (cascade?.hasImpact) {
          const items = [];

          if (cascade.storyConceptImpact?.needsUpdate) {
            items.push({
              type: 'story-concept',
              section: 'Story Concept',
              reason: cascade.storyConceptImpact.reason,
              suggestedFix: cascade.storyConceptImpact.suggestedRevisions
            });
          }

          if (cascade.characterImpacts) {
            cascade.characterImpacts.forEach(impact => {
              items.push({
                type: 'character',
                characterId: impact.characterId,
                characterName: impact.characterName,
                field: impact.field,
                reason: impact.reason,
                currentValue: impact.currentValue,
                suggestedValue: impact.suggestedValue
              });
            });
          }

          if (items.length > 0) {
            showToast('Potential impacts detected', 'info');
            setCascadeModal({
              open: true,
              items,
              intro: 'Your character changes may affect other parts of your project. Review the suggestions below.'
            });
          }
        }
      }
    } catch (err) {
      console.error('Cascade check error:', err);
    } finally {
      removeToast(toastId);
    }
  };

  // ========== CONCEPT SECTION HANDLERS ==========
  const handleUpdateSection = async (sectionName, newContent) => {
    try {
      // Parse current concept and get previous content for cascade check
      const currentConcept = localProject?.story_concept?.concept || '';
      const currentSections = parseConceptSections(currentConcept);
      const previousContent = currentSections.find(s => s.name === sectionName)?.content || '';

      const updatedConcept = updateSectionInConcept(currentConcept, sectionName, newContent);

      const newStoryConcept = {
        ...localProject?.story_concept,
        concept: updatedConcept
      };

      const { error } = await supabase
        .from('projects')
        .update({ story_concept: newStoryConcept })
        .eq('id', projectId);

      if (error) throw error;

      setLocalProject(prev => ({ ...prev, story_concept: newStoryConcept }));
      showToast('Section updated!', 'success');

      // Check for downstream impacts on other sections
      await checkSectionCascade(sectionName, previousContent, newContent, currentSections);
    } catch (err) {
      console.error('Update section error:', err);
      showToast('Failed to update section', 'error');
    }
  };

  const checkSectionCascade = async (sectionName, previousContent, newContent, allSections) => {
    // Skip if content didn't meaningfully change
    if (previousContent.trim() === newContent.trim()) return;
    // Skip if there are no other sections to check
    if (allSections.length <= 1) return;

    const toastId = showToast('Checking for downstream impacts...', 'checking', 0);

    try {
      const response = await fetch('/.netlify/functions/cascade-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editedSection: sectionName,
          previousContent,
          newContent,
          allSections,
          genome: hydrateGenome(localProject?.genome),
          braindump: localBraindump?.raw_input || ''
        })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.hasImpact && data.affectedSections?.length > 0) {
          showToast('Potential impacts detected', 'info');
          setCascadeModal({
            open: true,
            items: data.affectedSections,
            intro: data.summary || 'Your edit may affect other sections. Review the suggestions below.'
          });
        }
      }
    } catch (err) {
      console.error('Section cascade error:', err);
    } finally {
      removeToast(toastId);
    }
  };

  // ========== GENOME HANDLERS ==========
  const handleGenomeChange = (newGenome) => {
    setLocalProject(prev => ({ ...prev, genome: newGenome }));
  };

  const handleSaveGenome = async () => {
    const previousGenome = project?.genome;
    const newGenome = localProject?.genome;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ genome: newGenome })
        .eq('id', projectId);

      if (error) throw error;

      showToast('Genome saved!', 'success');

      // Check for cascade
      await checkGenomeCascade(previousGenome, newGenome);
    } catch (err) {
      console.error('Save genome error:', err);
      showToast('Failed to save genome', 'error');
    }
  };

  const checkGenomeCascade = async (previousGenome, newGenome) => {
    if (!localProject?.story_concept?.concept) return;

    const toastId = showToast('Checking for downstream impacts...', 'checking', 0);

    try {
      const sections = parseConceptSections(localProject.story_concept.concept);

      const response = await fetch('/.netlify/functions/cascade-genome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousGenome,
          newGenome,
          allSections: sections,
          braindump: localBraindump?.raw_input || ''
        })
      });

      if (response.ok) {
        const data = await response.json();

        if (data.affectedSections && data.affectedSections.length > 0) {
          showToast('Potential impacts detected', 'info');
          setCascadeModal({
            open: true,
            items: data.affectedSections,
            intro: data.summary || 'Your genome changes may affect your story concept. Review the suggestions below.'
          });
        }
      }
    } catch (err) {
      console.error('Genome cascade error:', err);
    } finally {
      removeToast(toastId);
    }
  };

  // ========== CASCADE HANDLERS ==========
  const handleApplyCascade = async (selectedItems) => {
    showOverlay('Applying changes...', 'Updating your project');

    try {
      for (const item of selectedItems) {
        if (item.section && item.suggestedFix) {
          // Story concept update
          const currentConcept = localProject?.story_concept?.concept || '';
          const updatedConcept = updateSectionInConcept(currentConcept, item.section, item.suggestedFix);

          const newStoryConcept = {
            ...localProject?.story_concept,
            concept: updatedConcept
          };

          await supabase
            .from('projects')
            .update({ story_concept: newStoryConcept })
            .eq('id', projectId);

          setLocalProject(prev => ({ ...prev, story_concept: newStoryConcept }));
        } else if (item.characterId && item.suggestedValue) {
          // Character update
          await supabase
            .from('characters')
            .update({ [item.field]: item.suggestedValue })
            .eq('id', item.characterId);

          setLocalCharacters(prev =>
            prev.map(c =>
              c.id === item.characterId ? { ...c, [item.field]: item.suggestedValue } : c
            )
          );
        }
      }

      showToast('Changes applied!', 'success');
    } catch (err) {
      console.error('Apply cascade error:', err);
      showToast('Failed to apply some changes', 'error');
    } finally {
      hideOverlay();
      setCascadeModal({ open: false, items: [], intro: '' });
    }
  };

  // ========== BRAINDUMP/BRIEF HANDLERS ==========
  const handleBraindumpUpdate = (newBraindump) => {
    setLocalBraindump(newBraindump);
  };

  const handleBriefUpdate = (newBrief) => {
    setLocalProject(prev => ({ ...prev, brief: newBrief }));
  };

  // ========== TITLE HANDLER ==========
  const [regeneratingTitle, setRegeneratingTitle] = useState(false);

  const handleRegenerateTitle = async () => {
    if (!localBraindump?.raw_input) {
      showToast('No braindump to generate title from', 'error');
      return;
    }

    setRegeneratingTitle(true);

    try {
      console.log('[ProjectView] Regenerating title...');
      const response = await fetch('/.netlify/functions/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ braindump: localBraindump.raw_input })
      });

      console.log('[ProjectView] Title response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ProjectView] Title generation failed:', errorText);
        throw new Error('Failed to generate title');
      }

      const data = await response.json();
      console.log('[ProjectView] Title data:', data);

      if (data.title) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ title: data.title })
          .eq('id', projectId);

        if (updateError) throw updateError;

        setLocalProject(prev => ({ ...prev, title: data.title }));
        showToast('Title updated!', 'success');
      }
    } catch (err) {
      console.error('Regenerate title error:', err);
      showToast('Failed to regenerate title', 'error');
    } finally {
      setRegeneratingTitle(false);
    }
  };

  // ========== DEV ZONE TEST HANDLERS ==========
  const handleTestCascadeModal = () => {
    // Mock data for testing cascade modal display
    const mockItems = [
      {
        section: 'Logline',
        reason: 'Test: A genome change affects the core premise',
        suggestedFix: 'This is a mock suggested revision for the logline section that demonstrates how the cascade modal works.'
      },
      {
        section: 'Thematic Core',
        reason: 'Test: Theme adjustment needed after genome change',
        suggestedFix: 'This is a mock suggested revision for the thematic core.'
      },
      {
        characterId: 'mock-char-1',
        characterName: 'Test Character',
        field: 'motivation',
        reason: 'Test: Character motivation needs adjustment',
        currentValue: 'Original motivation text here',
        suggestedValue: 'Updated motivation reflecting story changes'
      }
    ];

    setCascadeModal({
      open: true,
      items: mockItems,
      intro: 'This is a test of the cascade modal with mock data. Review how the interface displays various types of changes.'
    });
  };

  const handleDevTriggerGenomeCascade = async () => {
    // Trigger a real genome cascade check using current data
    if (!localProject?.story_concept?.concept) {
      showToast('No story concept to check against', 'error');
      return;
    }
    await checkGenomeCascade(localProject?.genome, localProject?.genome);
  };

  const handleDevTriggerCharacterCascade = async () => {
    // Trigger a real character cascade using first character
    const firstChar = localCharacters[0];
    if (!firstChar) {
      showToast('No characters to check', 'error');
      return;
    }
    await checkCharacterCascade(firstChar);
  };

  // ========== CONCEPT GENERATION HANDLER ==========
  const handleGenerateConcept = async () => {
    if (!localBraindump?.raw_input || !localProject?.genome) {
      showToast('Please add a braindump and genome first', 'error');
      return;
    }

    showOverlay('Generating Story Concept...', 'Your editor is crafting the foundation of your story');

    try {
      // Hydrate genome for the API (convert IDs to full labels)
      const hydratedGenome = hydrateGenome(localProject.genome);

      const response = await fetch('/.netlify/functions/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          braindump: localBraindump.raw_input,
          genome: hydratedGenome
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate concept');
      }

      const data = await response.json();

      // Save to Supabase
      const newStoryConcept = {
        concept: data.concept,
        generated_at: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from('projects')
        .update({ story_concept: newStoryConcept })
        .eq('id', projectId);

      if (saveError) throw saveError;

      // Update local state
      setLocalProject(prev => ({ ...prev, story_concept: newStoryConcept }));
      showToast('Story concept generated!', 'success');

    } catch (err) {
      console.error('Generate concept error:', err);
      showToast(err.message || 'Failed to generate concept', 'error');
    } finally {
      hideOverlay();
    }
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <Link to="/" style={styles.backLink}>Back to Dashboard</Link>
      </div>
    );
  }

  if (!localProject) {
    return (
      <div style={styles.error}>
        <p>Project not found.</p>
        <Link to="/" style={styles.backLink}>Back to Dashboard</Link>
      </div>
    );
  }

  const conceptSections = parseConceptSections(localProject.story_concept?.concept || '');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>&larr; Back to Dashboard</Link>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{localProject.title || 'Untitled Project'}</h1>
          <button
            style={{
              ...styles.rerollBtn,
              opacity: regeneratingTitle ? 0.6 : 1
            }}
            onClick={handleRegenerateTitle}
            disabled={regeneratingTitle}
            title="Regenerate title"
          >
            {regeneratingTitle ? (
              <span style={styles.spinner}>↻</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6" />
                <path d="M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            )}
          </button>
        </div>
        <p style={styles.meta}>
          Status: {localProject.status} | Created: {new Date(localProject.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Braindump */}
      <BraindumpEditor
        projectId={projectId}
        braindump={localBraindump}
        onUpdate={handleBraindumpUpdate}
      />

      {/* Brief */}
      <div style={styles.section}>
        <BriefDisplay
          projectId={projectId}
          brief={localProject.brief}
          braindump={localBraindump?.raw_input}
          onUpdate={handleBriefUpdate}
        />
      </div>

      {/* Genome */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Story Genome</h2>
        </div>
        <GenomeSelector
          genome={localProject.genome}
          onChange={handleGenomeChange}
          onSave={handleSaveGenome}
        />
      </div>

      {/* Story Concept */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Story Concept</h2>
        </div>
        {conceptSections.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No story concept yet.</p>
            {localBraindump?.raw_input && localProject?.genome ? (
              <button
                style={styles.generateBtn}
                onClick={handleGenerateConcept}
              >
                Generate Story Concept
              </button>
            ) : (
              <p style={styles.emptyHint}>
                Add your braindump and configure your genome above to generate a concept.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Story DNA - genome tags display */}
            <StoryDNA genome={localProject.genome} />

            {/* View toggle */}
            <div style={styles.viewToggle}>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(conceptView === 'sections' ? styles.viewBtnActive : {})
                }}
                onClick={() => setConceptView('sections')}
              >
                Sections
              </button>
              <button
                style={{
                  ...styles.viewBtn,
                  ...(conceptView === 'combined' ? styles.viewBtnActive : {})
                }}
                onClick={() => setConceptView('combined')}
              >
                Combined
              </button>
            </div>

            {/* Sections view */}
            {conceptView === 'sections' && conceptSections.map((section, index) => (
              <ConceptSection
                key={index}
                section={section}
                index={index}
                characters={localCharacters}
                storyConcept={localProject.story_concept?.concept}
                allSections={conceptSections}
                genome={hydrateGenome(localProject.genome)}
                braindump={localBraindump?.raw_input}
                onUpdate={handleUpdateSection}
                onCharacterClick={handleViewCharacter}
              />
            ))}

            {/* Combined view */}
            {conceptView === 'combined' && (
              <CombinedConceptView
                genome={localProject.genome}
                sections={conceptSections}
              />
            )}
          </>
        )}
      </div>

      {/* Characters */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Characters</h2>
        </div>
        <CharacterPyramid
          characters={localCharacters}
          onAdd={handleAddCharacter}
          onView={handleViewCharacter}
          onEdit={handleEditCharacter}
        />
      </div>

      {/* Dev Zone - only renders in development */}
      <DevZone
        characters={localCharacters}
        onCharacterClick={handleViewCharacter}
        onTriggerGenomeCascade={handleDevTriggerGenomeCascade}
        onTriggerCharacterCascade={handleDevTriggerCharacterCascade}
        onTriggerCascadeModal={handleTestCascadeModal}
      />

      {/* Character Modal */}
      <CharacterModal
        isOpen={characterModal.open}
        onClose={() => setCharacterModal({ open: false, character: null, role: null })}
        character={characterModal.character}
        projectId={projectId}
        role={characterModal.role}
        braindump={localBraindump?.raw_input}
        storyConcept={localProject.story_concept?.concept}
        genome={localProject.genome}
        allCharacters={localCharacters}
        onSave={handleSaveCharacter}
        onDelete={handleDeleteCharacter}
      />

      {/* Character Sheet */}
      <CharacterSheet
        isOpen={characterSheet.open}
        onClose={() => setCharacterSheet({ open: false, character: null })}
        character={characterSheet.character}
        onEdit={handleEditCharacter}
      />

      {/* Cascade Modal */}
      <CascadeModal
        isOpen={cascadeModal.open}
        onClose={() => setCascadeModal({ open: false, items: [], intro: '' })}
        items={cascadeModal.items}
        intro={cascadeModal.intro}
        onApply={handleApplyCascade}
        onSkip={() => setCascadeModal({ open: false, items: [], intro: '' })}
      />
    </div>
  );
}

// ========== HELPER HOOKS ==========

/**
 * Extended useProject hook with refetch capability
 */
function useProjectWithRefetch(projectId) {
  const result = useProject(projectId);

  const refetch = useCallback(async () => {
    // In a real implementation, this would re-fetch
    // For now, we rely on local state updates
  }, [projectId]);

  return { ...result, refetch };
}

// ========== STORY DNA COMPONENT ==========

/**
 * StoryDNA - Displays genome tags with copy button
 */
function StoryDNA({ genome }) {
  const [copied, setCopied] = useState(false);

  if (!genome) return null;

  // Hydrate genome IDs to full objects
  const findOption = (options, id) => options.find(o => o.id === id);

  const allTags = [
    ...(genome.genre || []).map(id => ({ label: findOption(vertebrae.genres.options, id)?.name, category: 'genre' })),
    ...(genome.archetype || []).map(id => ({ label: findOption(vertebrae.archetypes.options, id)?.name, category: 'archetype' })),
    ...(genome.theme || []).map(id => ({ label: findOption(vertebrae.themes.options, id)?.name, category: 'theme' })),
    ...(genome.tone || []).map(id => ({ label: findOption(vertebrae.tones.options, id)?.name, category: 'tone' })),
    ...(genome.stakes || []).map(id => ({ label: findOption(vertebrae.stakes.options, id)?.name, category: 'stakes' })),
    ...(genome.humorRole && genome.humorRole !== 'none'
      ? [{ label: findOption(vertebrae.humor.role.options, genome.humorRole)?.name, category: 'humor' }]
      : []),
    ...(genome.humorStyle || []).map(id => ({ label: findOption(vertebrae.humor.style.options, id)?.name, category: 'humor' }))
  ].filter(t => t.label);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(allTags.map(t => t.label).join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (allTags.length === 0) return null;

  return (
    <div style={storyDNAStyles.container}>
      <div style={storyDNAStyles.header}>
        <span style={storyDNAStyles.label}>Story DNA</span>
        <button style={storyDNAStyles.copyBtn} onClick={handleCopy} title="Copy Story DNA">
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <div style={storyDNAStyles.tags}>
        {allTags.map((tag, i) => (
          <span key={i} style={{ ...storyDNAStyles.tag, ...storyDNAStyles[`tag_${tag.category}`] }}>
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const storyDNAStyles = {
  container: {
    background: '#FAF6F1',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#8B7D6B'
  },
  copyBtn: {
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
    cursor: 'pointer'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  tag: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500
  },
  tag_genre: { background: '#dbeafe', color: '#1e40af' },
  tag_archetype: { background: '#fce7f3', color: '#9d174d' },
  tag_theme: { background: '#d1fae5', color: '#065f46' },
  tag_tone: { background: '#fef3c7', color: '#92400e' },
  tag_stakes: { background: '#fee2e2', color: '#991b1b' },
  tag_humor: { background: '#ede9fe', color: '#5b21b6' }
};

// ========== COMBINED CONCEPT VIEW ==========

/**
 * CombinedConceptView - Full concept text with copy button
 */
function CombinedConceptView({ genome, sections }) {
  const [copied, setCopied] = useState(false);

  // Build the full text for copying
  const findOption = (options, id) => options.find(o => o.id === id);

  const genomeLabels = genome ? [
    ...(genome.genre || []).map(id => findOption(vertebrae.genres.options, id)?.name),
    ...(genome.archetype || []).map(id => findOption(vertebrae.archetypes.options, id)?.name),
    ...(genome.theme || []).map(id => findOption(vertebrae.themes.options, id)?.name),
    ...(genome.tone || []).map(id => findOption(vertebrae.tones.options, id)?.name),
    ...(genome.stakes || []).map(id => findOption(vertebrae.stakes.options, id)?.name),
    ...(genome.humorRole && genome.humorRole !== 'none'
      ? [findOption(vertebrae.humor.role.options, genome.humorRole)?.name]
      : []),
    ...(genome.humorStyle || []).map(id => findOption(vertebrae.humor.style.options, id)?.name)
  ].filter(Boolean) : [];

  const genomeLine = genomeLabels.length > 0 ? `Story DNA: ${genomeLabels.join(', ')}\n\n` : '';
  const sectionsText = sections.map(s => `### ${s.name}\n${s.content}`).join('\n\n');
  const fullText = genomeLine + sectionsText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={combinedStyles.container}>
      <div style={combinedStyles.header}>
        <span style={combinedStyles.label}>Full Concept</span>
        <button style={combinedStyles.copyBtn} onClick={handleCopy}>
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ marginLeft: '4px', color: '#22c55e' }}>Copied!</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span style={{ marginLeft: '4px' }}>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre style={combinedStyles.text}>{fullText}</pre>
    </div>
  );
}

const combinedStyles = {
  container: {
    background: '#FFFCF8',
    border: '1px solid #D9CFC2',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#F5EEE6',
    borderBottom: '1px solid #D9CFC2'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#5C5346'
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 12px',
    background: 'white',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#5C5346',
    cursor: 'pointer'
  },
  text: {
    padding: '16px',
    margin: 0,
    fontSize: '14px',
    fontFamily: "'Source Sans 3', sans-serif",
    color: '#2C2416',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Parse concept text into sections
 * Format: ### Section Name (triple hash, not double)
 * May have a ## Story Concept header to skip
 */
function parseConceptSections(concept) {
  if (!concept) return [];

  // Debug: log what we're parsing
  console.log('[parseConceptSections] Raw concept:', concept?.substring(0, 200));

  // Skip the ## Story Concept header if present (vanilla does this too)
  const cleanText = concept.replace(/^## Story Concept\s*\n+/, '');

  const sections = [];
  // NOTE: Sections use ### (triple hash), not ## (double hash)
  const regex = /^###\s*(.+?)$/gm;
  let lastIndex = 0;
  let lastSection = null;
  let match;

  while ((match = regex.exec(cleanText)) !== null) {
    if (lastSection) {
      lastSection.content = cleanText.slice(lastIndex, match.index).trim();
      sections.push(lastSection);
    }
    lastSection = { name: match[1].trim(), content: '' };
    lastIndex = match.index + match[0].length;
  }

  if (lastSection) {
    lastSection.content = cleanText.slice(lastIndex).trim();
    sections.push(lastSection);
  }

  console.log('[parseConceptSections] Parsed sections:', sections.map(s => s.name));
  return sections;
}

/**
 * Update a specific section in the concept text
 * NOTE: Sections use ### (triple hash), not ## (double hash)
 */
function updateSectionInConcept(concept, sectionName, newContent) {
  // Match ### Section Name followed by content until next ### or end
  const regex = new RegExp(`(### ${escapeRegex(sectionName)}\\n)([\\s\\S]*?)(?=\\n### |$)`, 'g');

  if (regex.test(concept)) {
    // Reset regex lastIndex after test
    regex.lastIndex = 0;
    return concept.replace(regex, `$1${newContent}\n\n`);
  }

  // Section not found, append it
  return concept + `\n\n### ${sectionName}\n${newContent}`;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Hydrate genome IDs to full labels for API consumption
 */
function hydrateGenome(genome) {
  if (!genome) return {};

  const findLabel = (options, id) => options.find(o => o.id === id)?.name || id;

  return {
    genres: (genome.genre || []).map(id => findLabel(vertebrae.genres.options, id)),
    archetypes: (genome.archetype || []).map(id => findLabel(vertebrae.archetypes.options, id)),
    themes: (genome.theme || []).map(id => findLabel(vertebrae.themes.options, id)),
    tones: (genome.tone || []).map(id => findLabel(vertebrae.tones.options, id)),
    stakes: (genome.stakes || []).map(id => findLabel(vertebrae.stakes.options, id)),
    humorRole: genome.humorRole && genome.humorRole !== 'none'
      ? findLabel(vertebrae.humor.role.options, genome.humorRole)
      : null,
    humorStyles: (genome.humorStyle || []).map(id => findLabel(vertebrae.humor.style.options, id))
  };
}

// ========== STYLES ==========

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px'
  },
  loading: {
    padding: '48px',
    textAlign: 'center'
  },
  error: {
    padding: '48px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '32px'
  },
  backLink: {
    color: '#8B7D6B',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'inline-block',
    marginBottom: '8px'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  title: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.75rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  rerollBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    padding: 0,
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '6px',
    color: '#8B7D6B',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
    fontSize: '16px'
  },
  meta: {
    color: '#8B7D6B',
    fontSize: '14px',
    margin: 0
  },
  section: {
    marginBottom: '32px'
  },
  sectionHeader: {
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #B85C38'
  },
  sectionTitle: {
    fontFamily: "'Lora', Georgia, serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#2C2416',
    margin: 0
  },
  emptyState: {
    padding: '32px 24px',
    textAlign: 'center',
    background: '#FFFCF8',
    borderRadius: '8px',
    border: '1px solid #D9CFC2'
  },
  emptyText: {
    color: '#8B7D6B',
    fontStyle: 'italic',
    margin: '0 0 16px 0',
    fontSize: '15px'
  },
  emptyHint: {
    color: '#A89F91',
    fontSize: '13px',
    margin: 0
  },
  generateBtn: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'white',
    background: '#B85C38',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'background 0.15s ease'
  },
  // View toggle for sections/combined
  viewToggle: {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px'
  },
  viewBtn: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#5C5346',
    background: '#F5EEE6',
    border: '1px solid #D9CFC2',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Source Sans 3', sans-serif",
    transition: 'all 0.15s ease'
  },
  viewBtnActive: {
    background: '#B85C38',
    color: 'white',
    borderColor: '#B85C38'
  }
};

export default ProjectView;
