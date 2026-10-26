import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateClipDuration,
  calculateTotalTimelineDuration,
  detectSilenceIntervals,
  formatWebVTTTime,
  generateWebVTT,
  isSubtitleInSafeZone,
  EXPORT_PRESETS,
  type TimelineClip,
  type SubtitleCue,
} from './video-timeline';

test('calculateClipDuration correctly computes trimmed and speed-adjusted duration', () => {
  assert.equal(calculateClipDuration(0, 10, 1.0), 10);
  assert.equal(calculateClipDuration(5, 15, 2.0), 5); // 10s at 2x is 5s
  assert.equal(calculateClipDuration(0, 10, 0.5), 20); // 10s at 0.5x is 20s
  assert.equal(calculateClipDuration(10, 5, 1.0), 0); // invalid trim
  assert.equal(calculateClipDuration(0, 10, -1), 0); // invalid speed
});

test('calculateTotalTimelineDuration finds max end time across clips', () => {
  const clips: TimelineClip[] = [
    {
      id: 'c1',
      mediaId: 'm1',
      trackId: 't1',
      title: 'Intro',
      startTime: 0,
      duration: 5.5,
      sourceStartTime: 0,
      sourceEndTime: 5.5,
      speed: 1,
      volume: 1,
    },
    {
      id: 'c2',
      mediaId: 'm2',
      trackId: 't1',
      title: 'Main',
      startTime: 5.5,
      duration: 12.0,
      sourceStartTime: 0,
      sourceEndTime: 12.0,
      speed: 1,
      volume: 1,
    },
    {
      id: 'c3',
      mediaId: 'm3',
      trackId: 't2',
      title: 'B-Roll',
      startTime: 3.0,
      duration: 8.0,
      sourceStartTime: 0,
      sourceEndTime: 8.0,
      speed: 1,
      volume: 0.8,
    },
  ];

  assert.equal(calculateTotalTimelineDuration(clips), 17.5);
  assert.equal(calculateTotalTimelineDuration([]), 0);
});

test('detectSilenceIntervals finds quiet intervals above min threshold', () => {
  // 10 samples per sec: 0 to 4 is talking, 5 to 14 is silent (1 second), 15 to 20 talking
  const samples = [
    0.8, 0.9, 0.7, 0.8, 0.6, // 0.0 - 0.5s: loud
    0.01, 0.02, 0.01, 0.0, 0.01, 0.01, 0.02, 0.01, 0.0, 0.01, // 0.5 - 1.5s: 1.0s silence
    0.7, 0.8, 0.9, 0.7, 0.8, 0.9, // 1.5 - 2.1s: loud
  ];

  const silences = detectSilenceIntervals(samples, 10, 0.05, 0.5);
  assert.equal(silences.length, 1);
  assert.equal(silences[0].start, 0.5);
  assert.equal(silences[0].end, 1.5);
  assert.equal(silences[0].duration, 1.0);
});

test('formatWebVTTTime formats timestamps with millisecond precision', () => {
  assert.equal(formatWebVTTTime(0), '00:00:00.000');
  assert.equal(formatWebVTTTime(65.432), '00:01:05.432');
  assert.equal(formatWebVTTTime(3661.1), '01:01:01.100');
});

test('generateWebVTT outputs standard WEBVTT string', () => {
  const cues: SubtitleCue[] = [
    { id: '1', startTime: 0, endTime: 2.5, text: 'Check out this massive towboat on the Mississippi!' },
    { id: '2', startTime: 2.5, endTime: 5.0, text: 'Over 10,000 horsepower pushing 36 barges.' },
  ];
  const vtt = generateWebVTT(cues);
  assert.match(vtt, /^WEBVTT/);
  assert.match(vtt, /00:00:00\.000 --> 00:00:02\.500/);
  assert.match(vtt, /Check out this massive towboat/);
});

test('isSubtitleInSafeZone validates vertical positioning for TikTok and Shorts', () => {
  const tiktok = EXPORT_PRESETS.tiktok_9_16;
  // In TikTok, top padding 180 (9.3%), bottom padding 380 (19.8% from bottom = 80.2%)
  // A caption placed at 50% (vertical center) or 65% is safe
  assert.equal(isSubtitleInSafeZone(50, tiktok), true);
  assert.equal(isSubtitleInSafeZone(70, tiktok), true);
  // A caption placed at 5% (too high, hidden by status bar) or 92% (hidden by username/caption) is unsafe
  assert.equal(isSubtitleInSafeZone(5, tiktok), false);
  assert.equal(isSubtitleInSafeZone(95, tiktok), false);
});
