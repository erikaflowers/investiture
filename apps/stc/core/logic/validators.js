/**
 * Validation rules for Save the Cat beat sheet
 */

/**
 * Check if a beat entry has content
 */
export function isBeatFilled(content) {
  return content && content.trim().length > 0;
}

/**
 * Check if project has required fields
 */
export function isProjectValid(project) {
  return project && project.title && project.title.trim().length > 0;
}

/**
 * Count completed beats from user entries
 */
export function countCompletedBeats(entries) {
  if (!entries) return 0;
  return Object.values(entries).filter(isBeatFilled).length;
}

/**
 * Validate project title (not empty, reasonable length)
 */
export function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title is too long' };
  }
  return { valid: true, error: null };
}

/**
 * Get validation status for export readiness
 */
export function getExportReadiness(project, entries, totalBeats) {
  const completed = countCompletedBeats(entries);
  const hasTitle = isProjectValid(project);

  return {
    canExport: hasTitle && completed > 0,
    completionPercent: Math.round((completed / totalBeats) * 100),
    missingTitle: !hasTitle,
    beatsCompleted: completed,
    beatsTotal: totalBeats
  };
}
