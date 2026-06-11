import { supabase } from '../utils/supabaseClient';

/**
 * Log an activity to workspace_activity table.
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {string} params.userId - User ID who performed the action
 * @param {string} params.action - Action type (task_created, task_moved, task_edited, task_deleted, comment_added, file_uploaded, wiki_edited)
 * @param {string} params.entityType - Entity type (task, thread, file, wiki)
 * @param {string} params.entityId - Entity ID (optional)
 * @param {string} params.entityTitle - Entity title/name (optional)
 * @param {Object} params.details - Additional details (optional)
 */
export async function logActivity({ projectId, userId, action, entityType, entityId, entityTitle, details }) {
  const { error } = await supabase
    .from('workspace_activity')
    .insert({
      project_id: projectId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_title: entityTitle || null,
      details: details || null,
    });

  if (error) {
    console.error('Failed to log activity:', error);
  }
}

// Action type labels for display
export const ACTION_LABELS = {
  task_created: 'membuat task',
  task_moved: 'memindahkan task',
  task_edited: 'mengedit task',
  task_deleted: 'menghapus task',
  comment_added: 'menambahkan komentar',
  file_uploaded: 'mengupload file',
  wiki_edited: 'mengedit wiki',
};

// Icon mapping for action types
export const ACTION_ICONS = {
  task_created: 'plus',
  task_moved: 'move',
  task_edited: 'edit',
  task_deleted: 'trash',
  comment_added: 'message-square',
  file_uploaded: 'upload',
  wiki_edited: 'book',
};
