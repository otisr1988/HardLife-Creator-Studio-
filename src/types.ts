export type StudioTab =
  | 'overview'
  | 'ai_creator'
  | 'editor'
  | 'media'
  | 'ideas'
  | 'calendar'
  | 'youtube'
  | 'tiktok'
  | 'analytics'
  | 'automations'
  | 'mcp'
  | 'settings';

export interface CustomCategory {
  id: string;
  name: string;
  description: string;
  defaultVideoStyle?: string;
  preferredVoice?: string;
  preferredDuration?: number;
  visualStyle?: string;
  captionStyle?: 'bold_punchy' | 'clean_minimal' | 'karaoke_highlight' | 'subtle_bottom';
  backgroundMusicStyle?: string;
  defaultHashtags: string[];
  publishingAccounts: string[];
  preferredCta?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstructionTemplate {
  id: string;
  title: string;
  instructions: string;
  defaultDuration: number;
  visualStyle: string;
  categoryTag?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'editing' | 'rendering' | 'rendered' | 'scheduled' | 'published' | 'failed';
  format: 'shorts_9_16' | 'tiktok_9_16' | 'youtube_16_9' | 'square_1_1';
  duration: number;
  timeline: {
    clips: any[];
    subtitles: any[];
    backgroundMusic?: string;
    musicVolume?: number;
    duckingEnabled?: boolean;
    voiceVolume?: number;
  };
  script: string;
  storyboard?: Array<{
    sceneNumber: number;
    visualPrompt: string;
    narration: string;
    duration: number;
    visualAssetType?: string;
    disclosureNote?: string;
  }>;
  voiceId?: string;
  tags: string[];
  ownerId: string;
  renderedUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  mediaType: 'video' | 'audio' | 'image';
  url: string;
  localPath?: string;
  size: number;
  duration: number;
  width?: number;
  height?: number;
  tags: string[];
  ownerId: string;
  createdAt: string;
}

export interface Publication {
  id: string;
  projectId: string;
  platform: 'youtube' | 'tiktok' | 'metricool_bridge';
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'pending_approval';
  title: string;
  description: string;
  privacy: 'public' | 'unlisted' | 'private' | 'draft';
  scheduledTime?: string;
  publishedTime?: string;
  externalId?: string;
  externalUrl?: string;
  channelHandle: string;
  copyrightStatus?: 'clean' | 'claim_detected' | 'checking';
  processingStatus?: 'uploaded' | 'processing' | 'succeeded' | 'failed';
  error?: string;
  ownerId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  category: 'render' | 'publish' | 'oauth' | 'mcp' | 'edit' | 'automation';
  details: string;
  userEmail: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  ownerId: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly_3' | 'weekly_5' | 'custom';
  category: 'gaming' | 'towboats' | 'tarot' | 'comedy' | 'facts';
  targetDuration: number;
  targetPlatforms: Array<'youtube' | 'tiktok'>;
  approvalRequired: boolean;
  monthlyBudgetCap: number;
  currentMonthSpend: number;
  lastRun?: string;
  nextRun?: string;
  ownerId: string;
  createdAt: string;
}

export interface ConnectedAccount {
  id: string;
  platform: 'youtube' | 'tiktok' | 'metricool';
  handle: string;
  channelTitle: string;
  channelId: string;
  connected: boolean;
  connectedAt?: string;
  scopes: string[];
  subscriberCount?: number;
  followerCount?: number;
  totalViews?: number;
  statusMessage?: string;
  ownerId: string;
}

export interface StudioSettings {
  ownerEmail: string;
  mcpApiKey: string;
  approvalMode: 'review_before_publishing' | 'auto_publish';
  enableLocalWhisper: boolean;
  enableLocalTts: boolean;
  monthlyComputeBudgetCap: number;
  metricoolWebhookUrl?: string;
}
