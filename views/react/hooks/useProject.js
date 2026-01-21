import { useState, useEffect } from 'react';
import { supabase } from './useSupabase.js';

/**
 * Investiture-level hook for fetching a project, its braindump, and characters
 * @param {string} projectId - The project UUID
 * @returns {{ project, braindump, characters, loading, error }}
 */
export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [braindump, setBraindump] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project, braindump, and characters in parallel
        const [projectResult, braindumpResult, charactersResult] = await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single(),
          supabase
            .from('braindumps')
            .select('*')
            .eq('project_id', projectId)
            .single(),
          supabase
            .from('characters')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })
        ]);

        if (projectResult.error) throw projectResult.error;
        // Braindump might not exist yet - that's okay
        if (braindumpResult.error && braindumpResult.error.code !== 'PGRST116') {
          console.warn('Braindump fetch warning:', braindumpResult.error);
        }
        if (charactersResult.error) throw charactersResult.error;

        console.log('[useProject] Project data:', projectResult.data);
        console.log('[useProject] Braindump data:', braindumpResult.data);
        console.log('[useProject] Characters data:', charactersResult.data);

        setProject(projectResult.data);
        setBraindump(braindumpResult.data || null);
        setCharacters(charactersResult.data || []);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  return { project, braindump, characters, loading, error };
}
