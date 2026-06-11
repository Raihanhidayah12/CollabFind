/**
 * Parse mentions from text content.
 * Mentions are stored as @[name](userId) in the content string.
 */

// Extract mentioned user IDs from content
export function parseMentions(content) {
  if (!content) return [];
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    mentions.push({
      name: match[1],
      userId: match[2],
    });
  }

  return mentions;
}

// Render content with highlighted mentions
export function renderContentWithMentions(content, teamMembers) {
  if (!content) return content;

  const parts = [];
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }

    // Add mention
    const userId = match[2];
    const member = teamMembers.find(m => m.id === userId);
    parts.push({
      type: 'mention',
      name: member?.name || match[1],
      userId,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

// Create mention tag string for storage
export function createMentionTag(name, userId) {
  return `@[${name}](${userId})`;
}
