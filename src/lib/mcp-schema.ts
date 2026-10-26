/**
 * Model Context Protocol (MCP) Tools Schema and Validation for ChatGPT
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'list_projects',
    description: 'List video projects filtered by category, status, or date range',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['all', 'draft', 'editing', 'rendering', 'rendered', 'scheduled', 'published'] },
        category: { type: 'string', enum: ['all', 'gaming', 'towboats', 'tarot', 'comedy', 'facts', 'custom'] },
        limit: { type: 'number', description: 'Maximum projects to return (default 20)' },
      },
    },
  },
  {
    name: 'get_connected_accounts',
    description: 'Get verified status and channel handles for YouTube (@towboater2011) and TikTok (@otis0239)',
    parameters: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['all', 'youtube', 'tiktok'] },
      },
    },
  },
  {
    name: 'get_video_analytics',
    description: 'Retrieve views, watch time, retention, likes, comments for a published video or channel overview',
    parameters: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['youtube', 'tiktok'] },
        videoId: { type: 'string', description: 'Platform video ID or app publication ID' },
        days: { type: 'number', description: 'Lookback window in days (default 30)' },
      },
      required: ['platform'],
    },
  },
  {
    name: 'upload_source_video',
    description: 'Register an uploaded raw video, gameplay recording, or B-roll asset into the Media Library',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Descriptive asset name' },
        url: { type: 'string', description: 'Source file URL or file path' },
        mediaType: { type: 'string', enum: ['video', 'audio', 'image'] },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'url'],
    },
  },
  {
    name: 'analyze_video',
    description: 'Analyze video content to identify exciting moments, hooks, pacing, silences, and viral clip segments',
    parameters: {
      type: 'object',
      properties: {
        mediaId: { type: 'string', description: 'ID of the media asset to analyze' },
        category: { type: 'string', enum: ['gaming', 'towboats', 'tarot', 'comedy', 'facts'] },
      },
      required: ['mediaId'],
    },
  },
  {
    name: 'transcribe_video',
    description: 'Generate speech-to-text transcript with word timestamps using local Whisper or audio engine',
    parameters: {
      type: 'object',
      properties: {
        mediaId: { type: 'string', description: 'ID of the media asset' },
        language: { type: 'string', description: 'Language code (e.g. en)' },
      },
      required: ['mediaId'],
    },
  },
  {
    name: 'create_video_project',
    description: 'Create a new video project with title, category, format, and initial script',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Video title' },
        category: { type: 'string', enum: ['gaming', 'towboats', 'tarot', 'comedy', 'facts', 'custom'] },
        format: { type: 'string', enum: ['shorts_9_16', 'tiktok_9_16', 'youtube_16_9', 'square_1_1'] },
        script: { type: 'string', description: 'Initial script text' },
        description: { type: 'string', description: 'Video description' },
      },
      required: ['title', 'category', 'format'],
    },
  },
  {
    name: 'generate_short',
    description: 'End-to-end automated generation of a short-form video from a prompt, research topic, or clip',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic or concept to turn into a Short' },
        category: { type: 'string', enum: ['gaming', 'towboats', 'tarot', 'comedy', 'facts'] },
        durationSeconds: { type: 'number', description: 'Target duration in seconds (30-60s)' },
        includeVoiceover: { type: 'boolean', description: 'Generate AI narration' },
        style: { type: 'string', description: 'Tone and visual style guidelines' },
      },
      required: ['topic', 'category'],
    },
  },
  {
    name: 'edit_video',
    description: 'Modify timeline clips, trim points, subtitles, background music, or volume levels',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        actions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['trim', 'split', 'add_caption', 'set_music', 'duck_audio', 'remove_silence'] },
              params: { type: 'object' },
            },
          },
        },
      },
      required: ['projectId', 'actions'],
    },
  },
  {
    name: 'render_video',
    description: 'Queue an FFmpeg render job to output a production MP4 with burned captions, transitions, and audio',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID to render' },
        preset: { type: 'string', enum: ['shorts_9_16', 'tiktok_9_16', 'youtube_16_9', 'square_1_1'] },
        resolution: { type: 'string', enum: ['1080p', '720p'] },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'get_render_status',
    description: 'Poll status, progress percentage, and output download URL of an FFmpeg render job',
    parameters: {
      type: 'object',
      properties: {
        renderId: { type: 'string', description: 'Render job ID' },
      },
      required: ['renderId'],
    },
  },
  {
    name: 'create_video_metadata',
    description: 'Generate SEO-optimized title, description, tags, hashtags, and thumbnail concepts',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        platform: { type: 'string', enum: ['youtube', 'tiktok'] },
        focusKeywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['projectId', 'platform'],
    },
  },
  {
    name: 'schedule_video',
    description: 'Schedule a rendered video for publication to YouTube and/or TikTok at a specific date and time',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Rendered Project ID' },
        platform: { type: 'string', enum: ['youtube', 'tiktok', 'both'] },
        publishAt: { type: 'string', description: 'ISO 8601 timestamp' },
        title: { type: 'string' },
        description: { type: 'string' },
        privacy: { type: 'string', enum: ['public', 'unlisted', 'private', 'draft'] },
      },
      required: ['projectId', 'platform', 'publishAt'],
    },
  },
  {
    name: 'publish_video',
    description: 'Immediately publish a rendered video to YouTube or TikTok (subject to approval mode)',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Rendered Project ID' },
        platform: { type: 'string', enum: ['youtube', 'tiktok'] },
        title: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        privacy: { type: 'string', enum: ['public', 'unlisted', 'private'] },
      },
      required: ['projectId', 'platform'],
    },
  },
  {
    name: 'get_publication_status',
    description: 'Verify publication status, copyright checks, processing status, and live URL on YouTube or TikTok',
    parameters: {
      type: 'object',
      properties: {
        publicationId: { type: 'string', description: 'Publication ID' },
      },
      required: ['publicationId'],
    },
  },
  {
    name: 'list_content_calendar',
    description: 'View scheduled and published videos on the calendar for a given month or date range',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'ISO start date' },
        endDate: { type: 'string', description: 'ISO end date' },
        platform: { type: 'string', enum: ['all', 'youtube', 'tiktok'] },
      },
    },
  },
];

export interface McpToolCallRequest {
  id: string | number;
  tool: string;
  arguments: Record<string, any>;
}

export interface McpToolCallResult {
  tool: string;
  success: boolean;
  data?: any;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

/**
 * Validate incoming MCP tool call parameters against registered tool schema
 */
export function validateMcpToolCall(toolName: string, args: Record<string, any>): { valid: boolean; error?: string } {
  const tool = MCP_TOOLS.find((t) => t.name === toolName);
  if (!tool) {
    return { valid: false, error: `Tool '${toolName}' not found in HardLife Creator Studio MCP server.` };
  }

  if (tool.parameters.required) {
    for (const req of tool.parameters.required) {
      if (args[req] === undefined || args[req] === null || args[req] === '') {
        return { valid: false, error: `Missing required parameter '${req}' for tool '${toolName}'.` };
      }
    }
  }

  return { valid: true };
}

/**
 * Checks if a requested tool operation requires explicit creator confirmation under approval mode
 */
export function checkOperationConfirmation(
  toolName: string,
  approvalMode: 'review_before_publishing' | 'auto_publish',
  args: Record<string, any>
): { requiresConfirmation: boolean; message?: string } {
  // Publishing operations
  if (toolName === 'publish_video') {
    if (approvalMode === 'review_before_publishing') {
      return {
        requiresConfirmation: true,
        message: `Action 'publish_video' for project '${args.projectId}' to ${args.platform} requires manual creator confirmation before going live.`,
      };
    }
  }

  // High risk operations that always require confirmation
  if (toolName === 'delete_video' || toolName === 'disconnect_account') {
    return {
      requiresConfirmation: true,
      message: `Destructive action '${toolName}' requires explicit confirmation from creator kodir1988@gmail.com.`,
    };
  }

  return { requiresConfirmation: false };
}
