import { StudioStore, type VideoProject, type MediaAsset } from './store.ts';

export interface RepurposeRequest {
  mediaId: string;
  category: 'gaming' | 'towboats' | 'tarot' | 'comedy' | 'facts';
  shortsCount?: number; // 3 to 5
  generateThumbnails?: boolean;
  ctaPlatformDefault?: 'youtube' | 'tiktok' | 'both';
  disableCta?: boolean;
}

export interface RepurposeResult {
  sourceMedia: MediaAsset;
  fullLengthProject: VideoProject;
  shortsProjects: VideoProject[];
  summary: {
    totalProjectsCreated: number;
    shortsGeneratedCount: number;
    estimatedTotalDurationSec: number;
  };
}

/**
 * Intelligent Video Repurposing Engine
 * Slices 1 long recording into 1 full-length feature + 3 to 5 viral Shorts (9:16)
 */
export async function repurposeVideoRecording(req: RepurposeRequest): Promise<RepurposeResult> {
  const state = StudioStore.getState();
  const source = state.media.find((m) => m.id === req.mediaId);

  if (!source) {
    throw new Error(`Media asset with ID '${req.mediaId}' not found in Media Library.`);
  }

  const shortsCount = Math.max(3, Math.min(5, req.shortsCount || 3));
  const totalDuration = source.duration || 120;
  const segmentLength = Math.min(50, Math.floor(totalDuration / (shortsCount + 1)));

  // 1. Full-length project
  const fullLengthId = `proj_repurpose_full_${Date.now()}`;
  const fullLengthProj: VideoProject = {
    id: fullLengthId,
    title: `[Master Cut] ${source.name.replace(/\.[^/.]+$/, '')}`,
    description: `Complete full-length production of ${source.name}. Master 1080p edit.`,
    category: req.category,
    status: 'draft',
    format: 'youtube_16_9',
    duration: totalDuration,
    timeline: {
      clips: [
        {
          id: `c_full_${Date.now()}`,
          mediaId: source.id,
          trackId: 'v1',
          title: 'Full Master Track',
          startTime: 0,
          duration: totalDuration,
          sourceStartTime: 0,
          sourceEndTime: totalDuration,
          speed: 1,
          volume: 1,
        },
      ],
      subtitles: [],
      duckingEnabled: true,
      voiceVolume: 1.0,
      musicVolume: 0.15,
    },
    script: `Master full-length video derived from ${source.name}.`,
    tags: [req.category, 'fulllength', 'master'],
    ownerId: source.ownerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 2. Generate 3 to 5 distinct Shorts
  const shortsProjects: VideoProject[] = [];
  const hookPrefixes = [
    'Wait until you see how this maneuver starts: ',
    'Here is the secret nobody tells you about ',
    'Watch this high-stakes moment in ',
    'Why this is considered the hardest part of ',
    'The crazy physics behind ',
  ];

  for (let i = 0; i < shortsCount; i++) {
    const startSec = i * segmentLength;
    const endSec = Math.min(totalDuration, startSec + segmentLength);
    const shortDur = Math.max(15, Math.round(endSec - startSec));

    const isYtShort = i % 2 === 0;
    const ctaText = req.disableCta
      ? ''
      : isYtShort
      ? 'Like, comment, and subscribe on @towboater2011!'
      : 'Like, comment, and follow @otis0239!';

    const shortId = `proj_short_${i + 1}_${Date.now()}`;
    const shortProj: VideoProject = {
      id: shortId,
      title: `${hookPrefixes[i % hookPrefixes.length]}${source.name.replace(/\.[^/.]+$/, '')} (Part ${i + 1})`,
      description: `High-retention highlight segment #${i + 1} from ${source.name}. #${req.category} #Shorts #Viral`,
      category: req.category,
      status: 'draft',
      format: isYtShort ? 'shorts_9_16' : 'tiktok_9_16',
      duration: shortDur,
      timeline: {
        clips: [
          {
            id: `c_short_${i}_${Date.now()}`,
            mediaId: source.id,
            trackId: 'v1',
            title: `Clip Segment ${i + 1}`,
            startTime: 0,
            duration: shortDur,
            sourceStartTime: startSec,
            sourceEndTime: endSec,
            speed: 1,
            volume: 1,
          },
        ],
        subtitles: [
          {
            id: `s_${i}_1`,
            startTime: 0,
            endTime: 4.0,
            text: `${hookPrefixes[i % hookPrefixes.length]}`,
          },
          {
            id: `s_${i}_2`,
            startTime: Math.max(0, shortDur - 5),
            endTime: shortDur,
            text: ctaText,
          },
        ],
        duckingEnabled: true,
      },
      script: `Highlight segment ${i + 1}. Opening hook followed by climactic moment. CTA: ${ctaText}`,
      tags: [req.category, 'shorts', 'repurposed', isYtShort ? 'youtube' : 'tiktok'],
      ownerId: source.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shortsProjects.push(shortProj);
  }

  // Save all generated projects to store
  StudioStore.updateState((prev) => ({
    ...prev,
    projects: [fullLengthProj, ...shortsProjects, ...prev.projects],
  }));

  StudioStore.logActivity(
    'Video Repurposed',
    'edit',
    `Repurposed '${source.name}' into 1 Full-Length Feature and ${shortsCount} distinct Shorts/TikToks.`,
    'success'
  );

  return {
    sourceMedia: source,
    fullLengthProject: fullLengthProj,
    shortsProjects,
    summary: {
      totalProjectsCreated: 1 + shortsCount,
      shortsGeneratedCount: shortsCount,
      estimatedTotalDurationSec: totalDuration + shortsProjects.reduce((a, b) => a + b.duration, 0),
    },
  };
}
