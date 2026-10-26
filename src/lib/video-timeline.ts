/**
 * HardLife Creator Studio - Video Timeline & Media Processing Logic
 */

export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  title: string;
  startTime: number; // in timeline seconds
  duration: number; // duration on timeline in seconds
  sourceStartTime: number; // in-point in source file
  sourceEndTime: number; // out-point in source file
  speed: number; // 0.25 to 4.0
  volume: number; // 0.0 to 2.0
  muted?: boolean;
}

export interface SubtitleCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
  speaker?: string;
  stylePreset?: 'punchy_yellow' | 'clean_white' | 'electric_blue' | 'karaoke_pop';
}

export interface VideoExportPreset {
  id: string;
  name: string;
  platform: 'youtube_shorts' | 'tiktok' | 'youtube_long' | 'square';
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  maxRecommendedDuration?: number;
  safeZone: {
    topPadding: number;
    bottomPadding: number;
    sidePadding: number;
  };
}

export const EXPORT_PRESETS: Record<string, VideoExportPreset> = {
  shorts_9_16: {
    id: 'shorts_9_16',
    name: 'YouTube Shorts',
    platform: 'youtube_shorts',
    width: 1080,
    height: 1920,
    fps: 60,
    aspectRatio: '9:16',
    maxRecommendedDuration: 60,
    safeZone: {
      topPadding: 160,
      bottomPadding: 320,
      sidePadding: 80,
    },
  },
  tiktok_9_16: {
    id: 'tiktok_9_16',
    name: 'TikTok (Creator Rewards 1m+ Ready)',
    platform: 'tiktok',
    width: 1080,
    height: 1920,
    fps: 60,
    aspectRatio: '9:16',
    safeZone: {
      topPadding: 180,
      bottomPadding: 380,
      sidePadding: 120, // right side has buttons
    },
  },
  youtube_16_9: {
    id: 'youtube_16_9',
    name: 'YouTube Standard (1080p Full HD)',
    platform: 'youtube_long',
    width: 1920,
    height: 1080,
    fps: 60,
    aspectRatio: '16:9',
    safeZone: {
      topPadding: 60,
      bottomPadding: 90,
      sidePadding: 90,
    },
  },
  square_1_1: {
    id: 'square_1_1',
    name: 'Square Social Feed',
    platform: 'square',
    width: 1080,
    height: 1080,
    fps: 30,
    aspectRatio: '1:1',
    safeZone: {
      topPadding: 60,
      bottomPadding: 60,
      sidePadding: 60,
    },
  },
};

/**
 * Calculates effective playback duration of a clip given source trim and speed
 */
export function calculateClipDuration(sourceStartTime: number, sourceEndTime: number, speed: number = 1.0): number {
  if (sourceEndTime <= sourceStartTime) return 0;
  if (speed <= 0) return 0;
  return Number(((sourceEndTime - sourceStartTime) / speed).toFixed(3));
}

/**
 * Total timeline duration given an array of clips across all tracks
 */
export function calculateTotalTimelineDuration(clips: TimelineClip[]): number {
  if (!clips || clips.length === 0) return 0;
  let maxEnd = 0;
  for (const clip of clips) {
    const end = clip.startTime + clip.duration;
    if (end > maxEnd) maxEnd = end;
  }
  return Number(maxEnd.toFixed(3));
}

/**
 * Detect silence regions based on simulated or sampled audio energy thresholds
 * Returns ranges of [start, end] where audio is below threshold for longer than minSilenceDuration.
 */
export interface SilenceRegion {
  start: number;
  end: number;
  duration: number;
}

export function detectSilenceIntervals(
  audioEnergySamples: number[],
  sampleRateHz: number = 10, // 10 samples per second
  silenceThreshold: number = 0.05,
  minSilenceDurationSec: number = 0.5
): SilenceRegion[] {
  const minSamples = Math.ceil(minSilenceDurationSec * sampleRateHz);
  const silences: SilenceRegion[] = [];
  let inSilence = false;
  let silenceStartSample = 0;

  for (let i = 0; i < audioEnergySamples.length; i++) {
    const isQuiet = audioEnergySamples[i] < silenceThreshold;

    if (isQuiet && !inSilence) {
      inSilence = true;
      silenceStartSample = i;
    } else if (!isQuiet && inSilence) {
      inSilence = false;
      const count = i - silenceStartSample;
      if (count >= minSamples) {
        const start = silenceStartSample / sampleRateHz;
        const end = i / sampleRateHz;
        silences.push({
          start: Number(start.toFixed(2)),
          end: Number(end.toFixed(2)),
          duration: Number((end - start).toFixed(2)),
        });
      }
    }
  }

  // Handle trailing silence
  if (inSilence) {
    const count = audioEnergySamples.length - silenceStartSample;
    if (count >= minSamples) {
      const start = silenceStartSample / sampleRateHz;
      const end = audioEnergySamples.length / sampleRateHz;
      silences.push({
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        duration: Number((end - start).toFixed(2)),
      });
    }
  }

  return silences;
}

/**
 * Format timestamp in seconds to WebVTT timestamp format (HH:MM:SS.mmm)
 */
export function formatWebVTTTime(seconds: number): string {
  const pad = (num: number, size: number = 2) => String(num).padStart(size, '0');
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.min(999, Math.round((seconds - Math.floor(seconds)) * 1000));

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(millis, 3)}`;
}

/**
 * Generates valid WebVTT subtitle file text from cues
 */
export function generateWebVTT(cues: SubtitleCue[]): string {
  let vtt = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    vtt += `${index + 1}\n`;
    vtt += `${formatWebVTTTime(cue.startTime)} --> ${formatWebVTTTime(cue.endTime)}\n`;
    vtt += `${cue.text.trim()}\n\n`;
  });
  return vtt;
}

/**
 * Check if a subtitle cue is safely positioned within TikTok or YouTube Shorts UI overlays
 */
export function isSubtitleInSafeZone(
  yPercentage: number, // 0 (top) to 100 (bottom)
  preset: VideoExportPreset
): boolean {
  const safeTopPct = (preset.safeZone.topPadding / preset.height) * 100;
  const safeBottomPct = 100 - (preset.safeZone.bottomPadding / preset.height) * 100;
  return yPercentage >= safeTopPct && yPercentage <= safeBottomPct;
}
