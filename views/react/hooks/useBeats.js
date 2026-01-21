import { useState, useEffect, useCallback } from 'react';
import { supabase } from './useSupabase.js';
import { beats as beatDefinitions, getBeatById } from '../../../apps/stc/core/logic/beats.js';

/**
 * useBeats - Hook for managing beat sheet data
 *
 * @param {string} projectId - The project ID
 * @returns {object} { beats, loading, error, saveBeat, generateBeat, refetch }
 */
export function useBeats(projectId) {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch beats from Supabase
  const fetchBeats = useCallback(async () => {
    if (!projectId) {
      setBeats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('beats')
        .select('*')
        .eq('project_id', projectId);

      if (fetchError) throw fetchError;

      // Merge DB data with beat definitions
      const mergedBeats = beatDefinitions.map(def => {
        const dbBeat = data?.find(b => b.beat_id === def.id);
        return {
          ...def,
          dbId: dbBeat?.id || null,
          content: dbBeat?.content || '',
          characterIds: dbBeat?.character_ids || [],
          updatedAt: dbBeat?.updated_at || null
        };
      });

      setBeats(mergedBeats);
      setError(null);
    } catch (err) {
      console.error('Error fetching beats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchBeats();
  }, [fetchBeats]);

  /**
   * Save or update a beat
   */
  const saveBeat = useCallback(async (beatId, content, characterIds = []) => {
    if (!projectId) throw new Error('No project ID');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if beat exists in DB
    const existingBeat = beats.find(b => b.id === beatId);

    if (existingBeat?.dbId) {
      // Update existing
      const { error: updateError } = await supabase
        .from('beats')
        .update({
          content,
          character_ids: characterIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBeat.dbId);

      if (updateError) throw updateError;
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('beats')
        .insert({
          user_id: user.id,
          project_id: projectId,
          beat_id: beatId,
          content,
          character_ids: characterIds
        });

      if (insertError) throw insertError;
    }

    // Refetch to get updated data
    await fetchBeats();
  }, [projectId, beats, fetchBeats]);

  /**
   * Generate beat content with AI
   */
  const generateBeat = useCallback(async (beatId, context) => {
    const beatInfo = getBeatById(beatId);
    if (!beatInfo) throw new Error('Unknown beat ID');

    const response = await fetch('/.netlify/functions/generate-beat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        beatId,
        beatInfo: {
          name: beatInfo.name,
          description: beatInfo.description,
          question: beatInfo.question
        },
        braindump: context.braindump,
        genome: context.genome,
        storyConcept: context.storyConcept,
        characters: context.characters,
        existingBeats: beats.filter(b => b.content).map(b => ({
          id: b.id,
          name: b.name,
          content: b.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate beat');
    }

    const data = await response.json();
    return data.content;
  }, [beats]);

  return {
    beats,
    loading,
    error,
    saveBeat,
    generateBeat,
    refetch: fetchBeats
  };
}

export default useBeats;
