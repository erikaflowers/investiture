/**
 * Database Service
 * Wrapper for database operations - now powered by Supabase
 *
 * Generic interface (query, insert, update, remove) works with any table.
 * STC-specific functions provide convenience methods for the STC app.
 */

import { supabase } from './supabase.js';

// =============================================================================
// Generic Database Operations
// =============================================================================

/**
 * Query records from a table
 * @param {string} table - Table name
 * @param {object} [filters] - Query filters
 * @param {object} [filters.where] - Field-value pairs to filter by
 * @param {object} [filters.orderBy] - { field, direction: 'asc'|'desc' }
 * @param {number} [filters.limit] - Max records to return
 * @returns {Promise<{data: any[], error: object|null, count: number}>}
 */
export async function query(table, filters = {}) {
  try {
    let q = supabase.from(table).select('*');

    // Apply where filters
    if (filters.where) {
      for (const [key, value] of Object.entries(filters.where)) {
        q = q.eq(key, value);
      }
    }

    // Apply ordering
    if (filters.orderBy) {
      const { field, direction = 'asc' } = filters.orderBy;
      q = q.order(field, { ascending: direction === 'asc' });
    }

    // Apply limit
    if (filters.limit) {
      q = q.limit(filters.limit);
    }

    const { data, error } = await q;

    if (error) {
      console.error(`[Database] Query error on ${table}:`, error);
      return { data: [], error, count: 0 };
    }

    return { data: data || [], error: null, count: data?.length || 0 };
  } catch (e) {
    console.error(`[Database] Query exception on ${table}:`, e);
    return { data: [], error: { message: e.message }, count: 0 };
  }
}

/**
 * Insert a new record
 * @param {string} table - Table name
 * @param {object} data - Data to insert
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function insert(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`[Database] Insert error on ${table}:`, error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (e) {
    console.error(`[Database] Insert exception on ${table}:`, e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Update an existing record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {object} data - Data to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function update(table, id, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[Database] Update error on ${table}/${id}:`, error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (e) {
    console.error(`[Database] Update exception on ${table}/${id}:`, e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Delete a record
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function remove(table, id) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[Database] Delete error on ${table}/${id}:`, error);
      return { data: null, error };
    }

    return { data: result, error: null };
  } catch (e) {
    console.error(`[Database] Delete exception on ${table}/${id}:`, e);
    return { data: null, error: { message: e.message } };
  }
}

// Alias for backwards compatibility
export { remove as delete };

// =============================================================================
// STC: Projects
// =============================================================================

/**
 * Create a new project
 * @param {object} data - Project data
 * @param {string} [data.title] - Project title
 * @param {string} [data.user_id] - User ID (optional for now)
 * @param {string} [data.status] - Project status (default: 'braindump')
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createProject(data = {}) {
  return insert('projects', {
    title: data.title || 'Untitled Project',
    user_id: data.user_id || null,
    status: data.status || 'braindump',
  });
}

/**
 * Get a project by ID with all related data
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getProjectWithRelations(projectId) {
  try {
    // Fetch project and all related tables in parallel
    const [
      projectResult,
      braindumpResult,
      premiseResult,
      shellsResult,
      checkpointsResult,
      highConceptResult,
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('braindumps').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('premise_spine').select('*').eq('project_id', projectId).order('version', { ascending: false }),
      supabase.from('story_shells').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('checkpoints').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('high_concepts').select('*').eq('project_id', projectId).order('version', { ascending: false }),
    ]);

    if (projectResult.error) {
      return { data: null, error: projectResult.error };
    }

    return {
      data: {
        ...projectResult.data,
        braindumps: braindumpResult.data || [],
        premise_spines: premiseResult.data || [],
        story_shells: shellsResult.data || [],
        checkpoints: checkpointsResult.data || [],
        high_concepts: highConceptResult.data || [],
      },
      error: null,
    };
  } catch (e) {
    console.error(`[Database] getProjectWithRelations error:`, e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Get all projects for a user
 * @param {string} [userId] - User ID (optional, returns all if not provided)
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getUserProjects(userId = null) {
  const filters = userId ? { where: { user_id: userId } } : {};
  return query('projects', {
    ...filters,
    orderBy: { field: 'updated_at', direction: 'desc' },
  });
}

/**
 * Update project status
 * @param {string} projectId - Project ID
 * @param {string} status - New status
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateProjectStatus(projectId, status) {
  return update('projects', projectId, { status });
}

// =============================================================================
// STC: Braindumps
// =============================================================================

/**
 * Save a braindump for a project
 * @param {string} projectId - Project ID
 * @param {string} rawInput - The raw braindump text
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveBraindump(projectId, rawInput) {
  return insert('braindumps', {
    project_id: projectId,
    raw_input: rawInput,
  });
}

/**
 * Get braindumps for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getBraindumps(projectId) {
  return query('braindumps', {
    where: { project_id: projectId },
    orderBy: { field: 'created_at', direction: 'desc' },
  });
}

// =============================================================================
// STC: Premise Spine
// =============================================================================

/**
 * Save a premise spine
 * @param {string} projectId - Project ID
 * @param {object} data - Premise spine data
 * @param {string} [data.world] - The world/setting
 * @param {string} [data.central_conflict] - Central conflict
 * @param {string} [data.protagonist_seed] - Protagonist seed
 * @param {object} [data.variables] - Additional variables (JSONB)
 * @param {number} [data.version] - Version number
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function savePremiseSpine(projectId, data) {
  return insert('premise_spine', {
    project_id: projectId,
    world: data.world || null,
    central_conflict: data.central_conflict || null,
    protagonist_seed: data.protagonist_seed || null,
    variables: data.variables || {},
    version: data.version || 1,
  });
}

/**
 * Get premise spines for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getPremiseSpines(projectId) {
  return query('premise_spine', {
    where: { project_id: projectId },
    orderBy: { field: 'version', direction: 'desc' },
  });
}

// =============================================================================
// STC: Story Shells
// =============================================================================

/**
 * Save a story shell option
 * @param {string} projectId - Project ID
 * @param {object} data - Story shell data
 * @param {string} [data.archetype] - Story archetype
 * @param {string} [data.genre] - Genre
 * @param {string} [data.theme] - Theme
 * @param {string} [data.suggested_arc] - Suggested arc
 * @param {object} [data.variables] - Additional variables (JSONB)
 * @param {boolean} [data.is_selected] - Whether this shell is selected
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveStoryShell(projectId, data) {
  return insert('story_shells', {
    project_id: projectId,
    archetype: data.archetype || null,
    genre: data.genre || null,
    theme: data.theme || null,
    suggested_arc: data.suggested_arc || null,
    variables: data.variables || {},
    is_selected: data.is_selected || false,
  });
}

/**
 * Select a story shell (and deselect others)
 * @param {string} projectId - Project ID
 * @param {string} shellId - Story shell ID to select
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function selectStoryShell(projectId, shellId) {
  try {
    // First, deselect all shells for this project
    await supabase
      .from('story_shells')
      .update({ is_selected: false })
      .eq('project_id', projectId);

    // Then select the chosen one
    return update('story_shells', shellId, { is_selected: true });
  } catch (e) {
    console.error(`[Database] selectStoryShell error:`, e);
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Get story shells for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getStoryShells(projectId) {
  return query('story_shells', {
    where: { project_id: projectId },
    orderBy: { field: 'created_at', direction: 'desc' },
  });
}

// =============================================================================
// STC: Checkpoints
// =============================================================================

/**
 * Save a checkpoint
 * @param {string} projectId - Project ID
 * @param {object} data - Checkpoint data
 * @param {string} data.checkpoint_type - Type of checkpoint
 * @param {string} [data.premise_spine_id] - Related premise spine ID
 * @param {string} [data.story_shell_id] - Related story shell ID
 * @param {boolean} [data.user_confirmed] - Whether user confirmed
 * @param {string} [data.notes] - User notes
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveCheckpoint(projectId, data) {
  return insert('checkpoints', {
    project_id: projectId,
    checkpoint_type: data.checkpoint_type,
    premise_spine_id: data.premise_spine_id || null,
    story_shell_id: data.story_shell_id || null,
    user_confirmed: data.user_confirmed || false,
    notes: data.notes || null,
  });
}

/**
 * Confirm a checkpoint
 * @param {string} checkpointId - Checkpoint ID
 * @param {string} [notes] - Optional notes
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function confirmCheckpoint(checkpointId, notes = null) {
  const updateData = { user_confirmed: true };
  if (notes) updateData.notes = notes;
  return update('checkpoints', checkpointId, updateData);
}

/**
 * Get checkpoints for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getCheckpoints(projectId) {
  return query('checkpoints', {
    where: { project_id: projectId },
    orderBy: { field: 'created_at', direction: 'desc' },
  });
}

// =============================================================================
// STC: High Concepts
// =============================================================================

/**
 * Save a high concept pitch
 * @param {string} projectId - Project ID
 * @param {object} data - High concept data
 * @param {string} data.pitch_text - The pitch text
 * @param {boolean} [data.confirmed] - Whether confirmed
 * @param {number} [data.version] - Version number
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveHighConcept(projectId, data) {
  return insert('high_concepts', {
    project_id: projectId,
    pitch_text: data.pitch_text,
    confirmed: data.confirmed || false,
    version: data.version || 1,
  });
}

/**
 * Confirm a high concept
 * @param {string} highConceptId - High concept ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function confirmHighConcept(highConceptId) {
  return update('high_concepts', highConceptId, { confirmed: true });
}

/**
 * Get high concepts for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getHighConcepts(projectId) {
  return query('high_concepts', {
    where: { project_id: projectId },
    orderBy: { field: 'version', direction: 'desc' },
  });
}

// =============================================================================
// STC: Characters (Phase 2)
// =============================================================================

/**
 * Create a character
 * @param {string} projectId - Project ID
 * @param {object} data - Character data
 * @param {string} data.name - Character name
 * @param {string} [data.role] - Role (protagonist, antagonist, supporting, etc.)
 * @param {string} [data.arc] - Character arc description
 * @param {string} [data.backstory] - Character backstory
 * @param {string} [data.goals] - Character goals
 * @param {string} [data.flaws] - Character flaws
 * @param {object} [data.traits] - Additional traits (JSONB)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createCharacter(projectId, data) {
  return insert('characters', {
    project_id: projectId,
    name: data.name,
    role: data.role || null,
    arc: data.arc || null,
    backstory: data.backstory || null,
    goals: data.goals || null,
    flaws: data.flaws || null,
    traits: data.traits || {},
  });
}

/**
 * Update a character
 * @param {string} characterId - Character ID
 * @param {object} data - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateCharacter(characterId, data) {
  return update('characters', characterId, data);
}

/**
 * Delete a character
 * @param {string} characterId - Character ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function deleteCharacter(characterId) {
  return remove('characters', characterId);
}

/**
 * Get all characters for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getCharacters(projectId) {
  return query('characters', {
    where: { project_id: projectId },
    orderBy: { field: 'created_at', direction: 'asc' },
  });
}

/**
 * Get a single character by ID
 * @param {string} characterId - Character ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getCharacter(characterId) {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (error) {
      return { data: null, error };
    }
    return { data, error: null };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

// =============================================================================
// STC: Beat Entries (Phase 3)
// =============================================================================

/**
 * Save a beat entry
 * @param {string} projectId - Project ID
 * @param {object} data - Beat entry data
 * @param {string} data.beat_id - Beat identifier (e.g., 'opening_image', 'catalyst')
 * @param {string} data.content - The user's content for this beat
 * @param {number} [data.version] - Version number
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveBeatEntry(projectId, data) {
  return insert('beat_entries', {
    project_id: projectId,
    beat_id: data.beat_id,
    content: data.content,
    version: data.version || 1,
  });
}

/**
 * Update a beat entry
 * @param {string} entryId - Beat entry ID
 * @param {object} data - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateBeatEntry(entryId, data) {
  return update('beat_entries', entryId, data);
}

/**
 * Delete a beat entry
 * @param {string} entryId - Beat entry ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function deleteBeatEntry(entryId) {
  return remove('beat_entries', entryId);
}

/**
 * Get all beat entries for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getBeatEntries(projectId) {
  return query('beat_entries', {
    where: { project_id: projectId },
    orderBy: { field: 'created_at', direction: 'asc' },
  });
}

/**
 * Get a specific beat entry by beat_id
 * @param {string} projectId - Project ID
 * @param {string} beatId - Beat identifier
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getBeatEntry(projectId, beatId) {
  try {
    const { data, error } = await supabase
      .from('beat_entries')
      .select('*')
      .eq('project_id', projectId)
      .eq('beat_id', beatId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return { data: null, error };
    }
    return { data: data || null, error: null };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

/**
 * Upsert a beat entry (create or update based on project_id + beat_id)
 * @param {string} projectId - Project ID
 * @param {string} beatId - Beat identifier
 * @param {string} content - The content
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function upsertBeatEntry(projectId, beatId, content) {
  try {
    // Check if entry exists
    const existing = await getBeatEntry(projectId, beatId);

    if (existing.data) {
      // Update existing
      return update('beat_entries', existing.data.id, { content });
    } else {
      // Create new
      return saveBeatEntry(projectId, { beat_id: beatId, content });
    }
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

// =============================================================================
// STC: Parking Lot (Ideas that don't fit yet)
// =============================================================================

/**
 * Add an idea to the parking lot
 * @param {string} projectId - Project ID
 * @param {object} data - Parking lot entry data
 * @param {string} data.content - The idea content
 * @param {string} [data.category] - Optional category
 * @param {string} [data.source_beat] - Which beat this idea came from (if any)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function addToParkingLot(projectId, data) {
  return insert('parking_lot', {
    project_id: projectId,
    content: data.content,
    category: data.category || null,
    source_beat: data.source_beat || null,
    resolved: false,
  });
}

/**
 * Update a parking lot entry
 * @param {string} entryId - Entry ID
 * @param {object} data - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateParkingLotEntry(entryId, data) {
  return update('parking_lot', entryId, data);
}

/**
 * Mark a parking lot entry as resolved
 * @param {string} entryId - Entry ID
 * @param {string} [usedIn] - Where the idea was used
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function resolveParkingLotEntry(entryId, usedIn = null) {
  return update('parking_lot', entryId, {
    resolved: true,
    used_in: usedIn,
  });
}

/**
 * Delete a parking lot entry
 * @param {string} entryId - Entry ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function deleteParkingLotEntry(entryId) {
  return remove('parking_lot', entryId);
}

/**
 * Get all parking lot entries for a project
 * @param {string} projectId - Project ID
 * @param {boolean} [includeResolved=false] - Include resolved entries
 * @returns {Promise<{data: object[], error: object|null}>}
 */
export async function getParkingLot(projectId, includeResolved = false) {
  try {
    let q = supabase
      .from('parking_lot')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!includeResolved) {
      q = q.eq('resolved', false);
    }

    const { data, error } = await q;

    if (error) {
      return { data: [], error };
    }
    return { data: data || [], error: null };
  } catch (e) {
    return { data: [], error: { message: e.message } };
  }
}
