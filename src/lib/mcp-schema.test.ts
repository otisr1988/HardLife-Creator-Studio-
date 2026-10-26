import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MCP_TOOLS,
  validateMcpToolCall,
  checkOperationConfirmation,
} from './mcp-schema';

test('MCP_TOOLS registers all 16 required tools', () => {
  const expectedTools = [
    'list_projects',
    'get_connected_accounts',
    'get_video_analytics',
    'upload_source_video',
    'analyze_video',
    'transcribe_video',
    'create_video_project',
    'generate_short',
    'edit_video',
    'render_video',
    'get_render_status',
    'create_video_metadata',
    'schedule_video',
    'publish_video',
    'get_publication_status',
    'list_content_calendar',
  ];

  assert.equal(MCP_TOOLS.length, 16);
  for (const name of expectedTools) {
    const found = MCP_TOOLS.some((t) => t.name === name);
    assert.equal(found, true, `Expected tool ${name} to be registered`);
  }
});

test('validateMcpToolCall passes valid parameters and rejects missing required fields', () => {
  const validCreate = validateMcpToolCall('create_video_project', {
    title: 'Top 5 Powerful Towboats on the Mississippi',
    category: 'towboats',
    format: 'youtube_16_9',
  });
  assert.equal(validCreate.valid, true);

  const missingFormat = validateMcpToolCall('create_video_project', {
    title: 'Test',
    category: 'towboats',
  });
  assert.equal(missingFormat.valid, false);
  assert.match(missingFormat.error || '', /Missing required parameter 'format'/);

  const unknownTool = validateMcpToolCall('random_nonexistent_tool', {});
  assert.equal(unknownTool.valid, false);
});

test('checkOperationConfirmation enforces review mode for publish_video and destructive ops', () => {
  // Review before publishing mode: publish_video must require confirmation
  const reviewCheck = checkOperationConfirmation('publish_video', 'review_before_publishing', {
    projectId: 'proj_123',
    platform: 'youtube',
  });
  assert.equal(reviewCheck.requiresConfirmation, true);
  assert.match(reviewCheck.message || '', /requires manual creator confirmation/);

  // Auto publish mode: publish_video proceeds
  const autoCheck = checkOperationConfirmation('publish_video', 'auto_publish', {
    projectId: 'proj_123',
    platform: 'youtube',
  });
  assert.equal(autoCheck.requiresConfirmation, false);

  // High-risk operations require confirmation in all modes
  const deleteCheck = checkOperationConfirmation('delete_video', 'auto_publish', {
    videoId: 'yt_999',
  });
  assert.equal(deleteCheck.requiresConfirmation, true);
});
