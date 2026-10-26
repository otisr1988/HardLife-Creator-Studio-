import fs from 'node:fs';
import path from 'node:path';

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
  storyboard?: Array<{ sceneNumber: number; visualPrompt: string; narration: string; duration: number }>;
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

export interface RenderJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputPath?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  error?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
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

export interface DatabaseState {
  projects: VideoProject[];
  media: MediaAsset[];
  renders: RenderJob[];
  publications: Publication[];
  activityLogs: ActivityLog[];
  automations: AutomationRule[];
  connectedAccounts: ConnectedAccount[];
  customCategories: CustomCategory[];
  settings: StudioSettings;
}

const DATA_FILE = path.resolve(process.cwd(), 'data', 'store.json');

const INITIAL_STATE: DatabaseState = {
  projects: [
    {
      id: 'proj_towboat_diesel',
      title: 'Raw Horsepower: 10,000 HP Towboat on the Upper Mississippi',
      description: 'Navigating high spring currents with 36 loaded grain barges. Real wheelhouse operations, engine room walkthrough, and river navigation facts. #Towboat #RiverLife #Maritime',
      category: 'towboats',
      status: 'rendered',
      format: 'shorts_9_16',
      duration: 52,
      timeline: {
        clips: [
          { id: 'c1', mediaId: 'med_wheelhouse', trackId: 'v1', title: 'Flanking the bend', startTime: 0, duration: 15, sourceStartTime: 0, sourceEndTime: 15, speed: 1, volume: 1 },
          { id: 'c2', mediaId: 'med_engine_room', trackId: 'v1', title: 'Twin EMD V16s roaring', startTime: 15, duration: 20, sourceStartTime: 0, sourceEndTime: 20, speed: 1, volume: 0.9 },
          { id: 'c3', mediaId: 'med_barge_line', trackId: 'v1', title: 'Ratchets and wire tension', startTime: 35, duration: 17, sourceStartTime: 0, sourceEndTime: 17, speed: 1, volume: 1 },
        ],
        subtitles: [
          { id: 's1', startTime: 0, endTime: 3.5, text: 'This is what 10,000 horsepower looks like against a 6-knot river current.' },
          { id: 's2', startTime: 3.5, endTime: 8.0, text: 'Twin turbo-diesel V16 engines pushing 50,000 tons of freight.' },
          { id: 's3', startTime: 8.0, endTime: 14.0, text: 'One single tow replaces over one thousand semi-trucks on the highway.' },
          { id: 's4', startTime: 14.0, endTime: 20.0, text: 'Subscribe for daily real Mississippi river operations on @towboater2011!' },
        ],
        musicVolume: 0.15,
        duckingEnabled: true,
        voiceVolume: 1.0,
      },
      script: 'Hook: This is what 10,000 horsepower looks like against a 6-knot river current. Body: Twin turbo-diesel engines pushing 50,000 tons of freight. One single tow replaces over one thousand semi-trucks on the highway. CTA: Hit subscribe for daily authentic wheelhouse views on @towboater2011!',
      tags: ['towboat', 'mississippi', 'heavyequipment', 'maritime', 'engine', 'barge'],
      ownerId: 'owner_kodir',
      renderedUrl: '/rendered/render_test_smoketest.mp4',
      thumbnailUrl: '/rendered/thumb_test_smoketest.jpg',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj_gta_heist_facts',
      title: 'GTA 6 Vice City Speculation vs Verified Leaks (Simulated Gameplay)',
      description: 'Analyzing confirmed mechanics, physics engine improvements, and waterway simulation in Vice City. *Visuals contain gameplay recreations & simulation.* #GTA6 #Gaming #ViceCity',
      category: 'gaming',
      status: 'editing',
      format: 'shorts_9_16',
      duration: 48,
      timeline: {
        clips: [],
        subtitles: [
          { id: 's1', startTime: 0, endTime: 4.0, text: 'Rockstar completely overhauled water physics for GTA VI.' },
          { id: 's2', startTime: 4.0, endTime: 9.0, text: 'From airboats in the Everglades to ocean swells in Vice City.' },
        ],
      },
      script: 'Rockstar completely overhauled water physics for GTA VI. Notice how hull displacement and propeller wash interact with shallow marshlands. Visuals are simulated gameplay demonstrations.',
      tags: ['gtavi', 'gta6', 'rockstargames', 'gaming', 'vicecity'],
      ownerId: 'owner_kodir',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  media: [
    {
      id: 'med_wheelhouse',
      name: 'wheelhouse_night_transit.mp4',
      mediaType: 'video',
      url: '/rendered/render_test_smoketest.mp4',
      size: 15482900,
      duration: 52,
      width: 1080,
      height: 1920,
      tags: ['towboat', 'wheelhouse', 'radar', 'mississippi'],
      ownerId: 'owner_kodir',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'med_engine_room',
      name: 'cat_diesels_10000hp.mp4',
      mediaType: 'video',
      url: '/rendered/render_test_smoketest.mp4',
      size: 24500000,
      duration: 45,
      width: 1080,
      height: 1920,
      tags: ['towboat', 'engineroom', 'diesel', 'mechanic'],
      ownerId: 'owner_kodir',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    },
  ],
  renders: [],
  publications: [
    {
      id: 'pub_yt_sample',
      projectId: 'proj_towboat_diesel',
      platform: 'youtube',
      status: 'scheduled',
      title: 'Raw Horsepower: 10,000 HP Towboat on the Upper Mississippi',
      description: 'Navigating high spring currents with 36 loaded grain barges. #Towboat #RiverLife #Maritime',
      privacy: 'public',
      scheduledTime: new Date(Date.now() + 3600000 * 4).toISOString(),
      channelHandle: '@towboater2011',
      copyrightStatus: 'clean',
      processingStatus: 'succeeded',
      ownerId: 'owner_kodir',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pub_tt_sample',
      projectId: 'proj_towboat_diesel',
      platform: 'tiktok',
      status: 'draft',
      title: 'POV: 10,000 HP Towboat pilot pushing 36 barges #towboat #riverlife',
      description: 'Creator Rewards format (original 52s reel)',
      privacy: 'public',
      channelHandle: '@otis0239',
      copyrightStatus: 'clean',
      processingStatus: 'uploaded',
      ownerId: 'owner_kodir',
      createdAt: new Date().toISOString(),
    },
  ],
  activityLogs: [
    {
      id: 'log_boot',
      action: 'Studio Initialized',
      category: 'oauth',
      details: 'HardLife Creator Studio booted in single-owner secured mode for kodir1988@gmail.com',
      userEmail: 'kodir1988@gmail.com',
      status: 'info',
      timestamp: new Date().toISOString(),
      ownerId: 'owner_kodir',
    },
  ],
  automations: [
    {
      id: 'auto_towboats_daily',
      name: 'Towboat Operations Daily Short',
      enabled: true,
      frequency: 'daily',
      category: 'towboats',
      targetDuration: 55,
      targetPlatforms: ['youtube', 'tiktok'],
      approvalRequired: true,
      monthlyBudgetCap: 25.0,
      currentMonthSpend: 2.15,
      lastRun: new Date(Date.now() - 3600000 * 20).toISOString(),
      nextRun: new Date(Date.now() + 3600000 * 4).toISOString(),
      ownerId: 'owner_kodir',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'auto_gaming_highlights',
      name: 'GTA Gameplay & Mechanics Breakdown',
      enabled: false,
      frequency: 'weekly_3',
      category: 'gaming',
      targetDuration: 58,
      targetPlatforms: ['youtube'],
      approvalRequired: true,
      monthlyBudgetCap: 15.0,
      currentMonthSpend: 0.85,
      ownerId: 'owner_kodir',
      createdAt: new Date().toISOString(),
    },
  ],
  connectedAccounts: [
    {
      id: 'acc_youtube',
      platform: 'youtube',
      handle: '@towboater2011',
      channelTitle: 'Towboater 2011',
      channelId: 'UCtowboater2011_live',
      connected: true,
      connectedAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
      ],
      subscriberCount: 24300,
      totalViews: 4120000,
      statusMessage: 'OAuth 2.0 active. Upload, analytics, and Shorts publishing authorized.',
      ownerId: 'owner_kodir',
    },
    {
      id: 'acc_tiktok',
      platform: 'tiktok',
      handle: '@otis0239',
      channelTitle: 'otis0239',
      channelId: 'tt_otis0239_creator',
      connected: true,
      connectedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      scopes: ['video.upload', 'video.publish', 'user.info.basic'],
      followerCount: 18900,
      totalViews: 2850000,
      statusMessage: 'Connected via TikTok Creator API + Metricool bridge adapter for automated scheduling.',
      ownerId: 'owner_kodir',
    },
    {
      id: 'acc_metricool',
      platform: 'metricool',
      handle: 'Metricool Publishing Bridge',
      channelTitle: 'HardLife Metricool Adapter',
      channelId: 'metricool_wh_prod',
      connected: true,
      connectedAt: new Date().toISOString(),
      scopes: ['schedule.post', 'tiktok.bridge', 'instagram.bridge'],
      statusMessage: 'Approved fallback publishing adapter active when direct TikTok developer review is pending.',
      ownerId: 'owner_kodir',
    },
  ],
  customCategories: [
    {
      id: 'cat_engineering_docs',
      name: 'Engineering & Heavy Machinery',
      description: 'Technical breakdowns of mega-structures, diesel engines, hydraulic systems, and industrial equipment.',
      defaultVideoStyle: 'Technical documentary with labeled diagrams',
      preferredVoice: 'studio_pilot',
      preferredDuration: 60,
      visualStyle: 'authentic_footage',
      captionStyle: 'bold_punchy',
      backgroundMusicStyle: 'Low-frequency industrial hum',
      defaultHashtags: ['engineering', 'heavymachinery', 'technology', 'howitworks'],
      publishingAccounts: ['@towboater2011', '@otis0239'],
      preferredCta: 'Subscribe for daily technical breakdowns and real machine ops!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat_automotive_diy',
      name: 'Car Repair & Mechanics DIY',
      description: 'Step-by-step automotive diagnostics, tool walkthroughs, brake/engine repairs, and troubleshooting tips.',
      defaultVideoStyle: 'Step-by-step instructional tutorial with tool checklist',
      preferredVoice: 'studio_mechanic',
      preferredDuration: 55,
      visualStyle: 'b_roll',
      captionStyle: 'bold_punchy',
      backgroundMusicStyle: 'Energetic acoustic & bass',
      defaultHashtags: ['autorepair', 'diy', 'mechanic', 'cartips'],
      publishingAccounts: ['@otis0239'],
      preferredCta: 'Drop your car model in the comments and follow @otis0239 for DIY fixes!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  settings: {
    ownerEmail: 'kodir1988@gmail.com',
    mcpApiKey: 'hlc_mcp_' + Buffer.from('hardlife_creator_studio_key_2026').toString('base64url'),
    approvalMode: 'review_before_publishing',
    enableLocalWhisper: true,
    enableLocalTts: true,
    monthlyComputeBudgetCap: 50.0,
    metricoolWebhookUrl: 'https://api.metricool.com/v1/bridge/hardlife-studio',
  },
};

/**
 * In-memory state cached and persisted to file
 */
let dbState: DatabaseState = loadState();

function loadState(): DatabaseState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_STATE,
        ...parsed,
        customCategories: Array.isArray(parsed.customCategories) ? parsed.customCategories : INITIAL_STATE.customCategories,
        settings: { ...INITIAL_STATE.settings, ...(parsed.settings || {}) },
      };
    }
  } catch (err) {
    console.error('Error loading store.json, falling back to initial state:', err);
  }
  saveState(INITIAL_STATE);
  return INITIAL_STATE;
}

function saveState(state: DatabaseState): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store.json:', err);
  }
}

export const StudioStore = {
  getState(): DatabaseState {
    return dbState;
  },

  updateState(fn: (prev: DatabaseState) => DatabaseState): DatabaseState {
    dbState = fn(dbState);
    saveState(dbState);
    return dbState;
  },

  logActivity(action: string, category: ActivityLog['category'], details: string, status: ActivityLog['status'] = 'info', userEmail: string = 'kodir1988@gmail.com') {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      category,
      details,
      userEmail,
      status,
      timestamp: new Date().toISOString(),
      ownerId: 'owner_kodir',
    };
    dbState.activityLogs.unshift(log);
    if (dbState.activityLogs.length > 500) {
      dbState.activityLogs = dbState.activityLogs.slice(0, 500);
    }
    saveState(dbState);
    return log;
  },
};
