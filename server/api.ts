import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { StudioStore, type VideoProject, type CustomCategory } from './store.ts';
import { renderVideoWithFfmpeg } from './ffmpeg-service.ts';
import { generateAiVideoPackage, classifyTopic, generateVideoIdeas } from './ai-service.ts';
import { YouTubeService } from './youtube-service.ts';
import { TikTokService } from './tiktok-service.ts';
import { handleMcpRpc, authenticateMcpRequest, executeMcpTool } from './mcp-server.ts';
import { MCP_TOOLS } from '../src/lib/mcp-schema.ts';
import { isAuthorizedOwner, CONFIGURED_OWNER_EMAIL } from '../src/lib/security.ts';
import { rateLimiter, requireOwnerAuth } from './auth-middleware.ts';
import { repurposeVideoRecording } from './repurposing-service.ts';

export const apiRouter = express.Router();
export const studioApp = express();

studioApp.use(express.json({ limit: '50mb' }));
studioApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
studioApp.use('/api', apiRouter);
studioApp.use('/mcp', apiRouter);

// Global sliding-window rate limiter
apiRouter.use(rateLimiter(150));

// 0. Healthcheck & System Status
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'HardLife Creator Studio',
    version: '1.0.0',
    owner: CONFIGURED_OWNER_EMAIL,
    ffmpegDetected: true,
    storage: 'persistent_firestore_and_local_disk',
    timestamp: new Date().toISOString(),
  });
});

// 1. Auth & Owner Status
apiRouter.get('/auth/owner-status', (req, res) => {
  const email = (req.query.email as string) || (req.headers['x-user-email'] as string);
  const verified = req.query.verified === 'true' || req.headers['x-email-verified'] === 'true';

  const isOwner = isAuthorizedOwner(email, verified);
  res.json({
    configuredOwnerEmail: CONFIGURED_OWNER_EMAIL,
    isOwner,
    email: email || null,
    enforcedOnServer: true,
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email, verified, apiKey } = req.body;
  const state = StudioStore.getState();

  const isOwnerByEmail = email && isAuthorizedOwner(email, verified === true);
  const isOwnerByKey = apiKey && apiKey === state.settings.mcpApiKey;

  if (isOwnerByEmail || isOwnerByKey) {
    res.setHeader('Set-Cookie', 'hardlife_owner_session=verified; Path=/; SameSite=Lax');
    StudioStore.logActivity('Owner Authenticated', 'auth', `Owner session initialized for ${CONFIGURED_OWNER_EMAIL}`);
    return res.json({ success: true, owner: CONFIGURED_OWNER_EMAIL });
  }

  return res.status(401).json({
    error: `Access Denied: Account is not authorized owner (${CONFIGURED_OWNER_EMAIL}).`,
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'hardlife_owner_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  StudioStore.logActivity('Owner Signed Out', 'auth', 'Owner session cleared');
  res.json({ success: true });
});

// 2. Projects API
apiRouter.get('/projects', (req, res) => {
  const state = StudioStore.getState();
  res.json(state.projects);
});

apiRouter.get('/projects/:id', (req, res) => {
  const state = StudioStore.getState();
  const proj = state.projects.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  res.json(proj);
});

apiRouter.post('/projects', requireOwnerAuth, (req, res) => {
  const { title, category, format, description, script, duration } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newProj: VideoProject = {
    id: `proj_${Date.now()}`,
    title,
    description: description || '',
    category: category || 'custom',
    status: 'draft',
    format: format || 'shorts_9_16',
    duration: duration || 45,
    timeline: { clips: [], subtitles: [] },
    script: script || '',
    tags: [category || 'video'],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    projects: [newProj, ...prev.projects],
  }));

  StudioStore.logActivity('Project Created', 'edit', `Created project '${newProj.title}'`);
  res.status(201).json(newProj);
});

apiRouter.patch('/projects/:id', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const index = state.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });

  const updated: VideoProject = {
    ...state.projects[index],
    ...req.body,
    id: state.projects[index].id, // Prevent ID tampering
    ownerId: state.projects[index].ownerId, // Immutable
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => {
    const list = [...prev.projects];
    list[index] = updated;
    return { ...prev, projects: list };
  });

  StudioStore.logActivity('Project Updated', 'edit', `Saved changes to project '${updated.title}'`);
  res.json(updated);
});

apiRouter.delete('/projects/:id', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const proj = state.projects.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  StudioStore.updateState((prev) => ({
    ...prev,
    projects: prev.projects.filter((p) => p.id !== req.params.id),
  }));

  StudioStore.logActivity('Project Deleted', 'edit', `Deleted project '${proj.title}'`, 'warning');
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Media Library API & Uploads
apiRouter.get('/media', (req, res) => {
  const state = StudioStore.getState();
  res.json(state.media);
});

apiRouter.post('/media/upload', requireOwnerAuth, (req, res) => {
  const { name, mediaType, base64Data, tags } = req.body;
  if (!name || !base64Data) {
    return res.status(400).json({ error: 'name and base64Data are required' });
  }

  // Security: Guard against path traversal attacks
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return res.status(400).json({
      error: 'Security error: Directory traversal characters (.., /, \\) are strictly prohibited in media filename',
    });
  }

  const sanitizedBase = path.basename(name);
  const ext = path.extname(sanitizedBase).toLowerCase();
  const allowedExts = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.mp3', '.wav', '.m4a', '.jpg', '.jpeg', '.png', '.webp'];

  if (!allowedExts.includes(ext)) {
    return res.status(400).json({
      error: `Unsupported file extension '${ext}'. Allowed media: ${allowedExts.join(', ')}`,
    });
  }

  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const safeName = `${Date.now()}_${sanitizedBase.replace(/[^a-zA-Z0-9._-]/g, '')}`;
  const filePath = path.join(uploadDir, safeName);

  // Write base64 file to disk
  const buffer = Buffer.from(base64Data.replace(/^data:[^;]+;base64,/, ''), 'base64');
  fs.writeFileSync(filePath, buffer);

  const mediaAsset = {
    id: `med_${Date.now()}`,
    name: sanitizedBase,
    mediaType: mediaType || 'video',
    url: `/uploads/${safeName}`,
    localPath: filePath,
    size: buffer.length,
    duration: 30,
    tags: tags || [],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    media: [mediaAsset, ...prev.media],
  }));

  StudioStore.logActivity('Media Uploaded', 'edit', `Uploaded '${sanitizedBase}' (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
  res.status(201).json(mediaAsset);
});

// Video Repurposing Endpoint (1 Long recording -> 1 Master Feature + 3 to 5 Shorts)
apiRouter.post('/media/repurpose', requireOwnerAuth, async (req, res) => {
  try {
    const { mediaId, category, shortsCount, disableCta } = req.body;
    if (!mediaId) {
      return res.status(400).json({ error: 'mediaId is required for repurposing' });
    }

    const result = await repurposeVideoRecording({
      mediaId,
      category: category || 'towboats',
      shortsCount: shortsCount || 3,
      disableCta: !!disableCta,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Render Worker API
apiRouter.post('/render', requireOwnerAuth, async (req, res) => {
  const { projectId, preset, customDuration } = req.body;
  const state = StudioStore.getState();
  const proj = state.projects.find((p) => p.id === projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const renderId = `rnd_${Date.now()}`;
  const renderJob = {
    id: renderId,
    projectId: proj.id,
    status: 'processing' as const,
    progress: 15,
    ownerId: proj.ownerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    renders: [renderJob, ...prev.renders],
    projects: prev.projects.map((p) => (p.id === proj.id ? { ...p, status: 'rendering' as const } : p)),
  }));

  res.json({ renderId, status: 'processing', message: 'FFmpeg render job queued' });

  // Async execution
  renderVideoWithFfmpeg({
    renderId,
    projectId: proj.id,
    title: proj.title,
    format: preset || proj.format,
    durationSeconds: customDuration || proj.duration || 15,
  }).then((result) => {
    StudioStore.updateState((prev) => ({
      ...prev,
      renders: prev.renders.map((r) =>
        r.id === renderId
          ? {
              ...r,
              status: result.success ? 'completed' : 'failed',
              progress: 100,
              outputPath: result.outputPath,
              outputUrl: result.outputUrl,
              thumbnailUrl: result.thumbnailUrl,
              durationSeconds: result.durationSeconds,
              fileSizeBytes: result.fileSizeBytes,
              error: result.error,
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
      projects: prev.projects.map((p) =>
        p.id === proj.id && result.success
          ? {
              ...p,
              status: 'rendered',
              renderedUrl: result.outputUrl,
              thumbnailUrl: result.thumbnailUrl,
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));

    StudioStore.logActivity(
      result.success ? 'FFmpeg Render Complete' : 'FFmpeg Render Failed',
      'render',
      `Rendered '${proj.title}' in ${result.durationSeconds}s. URL: ${result.outputUrl}`,
      result.success ? 'success' : 'error'
    );
  });
});

apiRouter.get('/render/:id', (req, res) => {
  const state = StudioStore.getState();
  const render = state.renders.find((r) => r.id === req.params.id);
  if (!render) return res.status(404).json({ error: 'Render job not found' });
  res.json(render);
});

// 4.5. Content Categories (Presets & Custom Saved Categories)
const PRESET_CATEGORIES = [
  { id: 'custom', name: 'Anything / Custom Topic', description: 'Universal creation for any subject, idea, tutorial, or documentary', isPreset: true },
  { id: 'towboats', name: 'Towboats & River', description: 'Authentic inland waterway operations, heavy diesel mechanics, Mississippi pilotage', isPreset: true },
  { id: 'gaming', name: 'GTA & Gaming', description: 'Game physics breakdowns, gameplay recreations, mechanics and telemetry', isPreset: true },
  { id: 'tarot', name: 'Tarot Readings', description: 'Intuitive card readings, astrological transits, and collective guidance', isPreset: true },
  { id: 'facts', name: 'Viral Facts', description: 'Surprising truths, historical mysteries, scientific deep dives, and curiosities', isPreset: true },
];

apiRouter.get('/categories', (req, res) => {
  const state = StudioStore.getState();
  res.json({
    presets: PRESET_CATEGORIES,
    customCategories: state.customCategories || [],
    all: [
      ...PRESET_CATEGORIES,
      ...(state.customCategories || []).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPreset: false,
        ...c,
      })),
    ],
  });
});

apiRouter.post('/categories', requireOwnerAuth, (req, res) => {
  const { name, description, defaultVideoStyle, preferredVoice, preferredDuration, visualStyle, captionStyle, backgroundMusicStyle, defaultHashtags, publishingAccounts, preferredCta } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat: CustomCategory = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    description: description || '',
    defaultVideoStyle: defaultVideoStyle || 'Balanced high-retention video',
    preferredVoice: preferredVoice || 'studio_creator',
    preferredDuration: preferredDuration || 45,
    visualStyle: visualStyle || 'b_roll',
    captionStyle: captionStyle || 'bold_punchy',
    backgroundMusicStyle: backgroundMusicStyle || 'Upbeat background',
    defaultHashtags: Array.isArray(defaultHashtags) ? defaultHashtags : ['creator', 'video'],
    publishingAccounts: Array.isArray(publishingAccounts) ? publishingAccounts : ['@towboater2011', '@otis0239'],
    preferredCta: preferredCta || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    customCategories: [newCat, ...(prev.customCategories || [])],
  }));

  StudioStore.logActivity('Category Created', 'edit', `Created custom category '${newCat.name}'`);
  res.status(201).json(newCat);
});

apiRouter.patch('/categories/:id', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const list = state.customCategories || [];
  const index = list.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });

  const updated: CustomCategory = {
    ...list[index],
    ...req.body,
    id: list[index].id,
    updatedAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => {
    const nextList = [...(prev.customCategories || [])];
    nextList[index] = updated;
    return { ...prev, customCategories: nextList };
  });

  StudioStore.logActivity('Category Updated', 'edit', `Updated custom category '${updated.name}'`);
  res.json(updated);
});

apiRouter.delete('/categories/:id', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const list = state.customCategories || [];
  const found = list.find((c) => c.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Category not found' });

  StudioStore.updateState((prev) => ({
    ...prev,
    customCategories: (prev.customCategories || []).filter((c) => c.id !== req.params.id),
  }));

  StudioStore.logActivity('Category Deleted', 'edit', `Deleted custom category '${found.name}'`);
  res.json({ success: true, deletedId: req.params.id });
});

// 5. AI Video Generation & Universal Intelligence
apiRouter.post('/ai/classify-topic', (req, res) => {
  const text = req.body.text || req.body.topic || req.body.instructions || '';
  const result = classifyTopic(text);
  res.json(result);
});

apiRouter.post('/ai/ideas', async (req, res) => {
  try {
    const subject = req.body.subject || req.body.topic || 'Fascinating Discoveries';
    const count = typeof req.body.count === 'number' ? req.body.count : 12;
    const ideas = await generateVideoIdeas(subject, count);
    res.json({ subject, ideas });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Idea generation failed' });
  }
});

apiRouter.post('/ai/generate', async (req, res) => {
  try {
    const pkg = await generateAiVideoPackage(req.body);
    StudioStore.logActivity('AI Video Generated', 'automation', `Generated script & storyboard for topic: "${req.body.topic}"`);
    res.json(pkg);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// 6. YouTube API
apiRouter.get('/youtube/account', (req, res) => {
  res.json(YouTubeService.getAccountStatus());
});

apiRouter.get('/youtube/videos', async (req, res) => {
  const videos = await YouTubeService.getRecentVideos();
  res.json(videos);
});

apiRouter.post('/youtube/publish', requireOwnerAuth, async (req, res) => {
  try {
    const pub = await YouTubeService.uploadVideo(req.body, '');
    res.json(pub);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/youtube/verify/:id', async (req, res) => {
  try {
    const status = await YouTubeService.verifyVideoStatus(req.params.id);
    res.json(status);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. TikTok API
apiRouter.get('/tiktok/account', (req, res) => {
  res.json(TikTokService.getAccountStatus());
});

apiRouter.get('/tiktok/posts', async (req, res) => {
  const posts = await TikTokService.getRecentPosts();
  res.json(posts);
});

apiRouter.post('/tiktok/publish', requireOwnerAuth, async (req, res) => {
  try {
    const pub = await TikTokService.uploadVideo(req.body, '');
    res.json(pub);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/tiktok/verify/:id', async (req, res) => {
  try {
    const status = await TikTokService.verifyPostStatus(req.params.id);
    res.json(status);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Automations
apiRouter.get('/automations', (req, res) => {
  res.json(StudioStore.getState().automations);
});

apiRouter.post('/automations', requireOwnerAuth, (req, res) => {
  const auto = {
    id: `auto_${Date.now()}`,
    ...req.body,
    ownerId: 'owner_kodir',
    currentMonthSpend: 0,
    createdAt: new Date().toISOString(),
  };
  StudioStore.updateState((prev) => ({
    ...prev,
    automations: [auto, ...prev.automations],
  }));
  StudioStore.logActivity('Automation Created', 'automation', `Created recurring automation rule '${auto.name}'`);
  res.status(201).json(auto);
});

apiRouter.patch('/automations/:id', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const auto = state.automations.find((a) => a.id === req.params.id);
  if (!auto) return res.status(404).json({ error: 'Automation not found' });

  const updated = { ...auto, ...req.body, id: auto.id, ownerId: auto.ownerId };
  StudioStore.updateState((prev) => ({
    ...prev,
    automations: prev.automations.map((a) => (a.id === req.params.id ? updated : a)),
  }));
  res.json(updated);
});

// 9. Publications Calendar
apiRouter.get('/publications', (req, res) => {
  res.json(StudioStore.getState().publications);
});

// 10. Activity Logs
apiRouter.get('/logs', (req, res) => {
  res.json(StudioStore.getState().activityLogs);
});

// 11. Studio Settings & MCP Credentials
apiRouter.get('/settings', (req, res) => {
  res.json(StudioStore.getState().settings);
});

apiRouter.patch('/settings', requireOwnerAuth, (req, res) => {
  const state = StudioStore.getState();
  const updated = { ...state.settings, ...req.body };
  StudioStore.updateState((prev) => ({ ...prev, settings: updated }));
  StudioStore.logActivity('Settings Updated', 'oauth', 'Updated studio security and publishing settings');
  res.json(updated);
});

// 12. Model Context Protocol (MCP) Endpoints
// Manifest / Tools Discovery
apiRouter.get(['/mcp', '/mcp/tools'], (req, res) => {
  res.json({
    name: 'HardLife Creator Studio MCP Server',
    version: '1.0.0',
    description: 'Authenticated Model Context Protocol server for ChatGPT to manage video creation, editing, scheduling, and publishing.',
    owner: CONFIGURED_OWNER_EMAIL,
    accounts: {
      youtube: '@towboater2011',
      tiktok: '@otis0239',
    },
    tools: MCP_TOOLS,
  });
});

// MCP JSON-RPC 2.0 Endpoint
apiRouter.post(['/mcp', '/mcp/rpc'], async (req, res) => {
  const authHeader = req.headers['authorization'];
  const apiKeyHeader = req.headers['x-mcp-api-key'] as string;

  // Authenticate request
  const isAuthenticated = authenticateMcpRequest(authHeader, apiKeyHeader);
  if (!isAuthenticated) {
    return res.status(401).json({
      jsonrpc: '2.0',
      id: req.body?.id ?? null,
      error: {
        code: -32001,
        message: 'Unauthorized: Invalid or missing HardLife MCP API key or Bearer token.',
      },
    });
  }

  const response = await handleMcpRpc(req.body);
  res.json(response);
});
