import test from 'node:test';
import assert from 'node:assert/strict';
import { repurposeVideoRecording } from './repurposing-service.ts';
import { StudioStore, type MediaAsset } from './store.ts';

test('Repurposing Service: Slices 1 master video into 1 full-length feature and 4 viral shorts', async () => {
  // Setup a test media recording in store
  const mockAsset: MediaAsset = {
    id: `med_test_repurpose_${Date.now()}`,
    name: 'Pushing 24 Barges Through Chain of Rocks Canal.mp4',
    type: 'video',
    sizeBytes: 154200000,
    duration: 180, // 3 minutes long
    url: '/media/chain_of_rocks.mp4',
    thumbnailUrl: '/media/thumb_chain.jpg',
    tags: ['towboat', 'canal', 'barges'],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    media: [mockAsset, ...prev.media],
  }));

  const result = await repurposeVideoRecording({
    mediaId: mockAsset.id,
    category: 'towboats',
    shortsCount: 4,
    disableCta: false,
  });

  assert.ok(result);
  assert.equal(result.summary.shortsGeneratedCount, 4);
  assert.equal(result.summary.totalProjectsCreated, 5); // 1 master + 4 shorts

  // Verify Master Cut project
  assert.equal(result.fullLengthProject.format, 'youtube_16_9');
  assert.equal(result.fullLengthProject.duration, 180);
  assert.ok(result.fullLengthProject.title.includes('[Master Cut]'));

  // Verify Shorts projects
  assert.equal(result.shortsProjects.length, 4);
  for (const short of result.shortsProjects) {
    assert.ok(short.format === 'shorts_9_16' || short.format === 'tiktok_9_16');
    assert.ok(short.duration >= 15 && short.duration <= 60);
    assert.ok(short.timeline.subtitles && short.timeline.subtitles.length >= 2);

    // Verify safe-zone subtitle and CTA presence
    const ctaSubtitle = short.timeline.subtitles[short.timeline.subtitles.length - 1];
    assert.ok(
      ctaSubtitle.text.includes('@towboater2011') || ctaSubtitle.text.includes('@otis0239'),
      `Short should contain targeted channel CTA, got: "${ctaSubtitle.text}"`
    );
  }
});

test('Repurposing Service: disableCta flag removes call-to-action subtitles when requested', async () => {
  const mockAsset: MediaAsset = {
    id: `med_test_nocta_${Date.now()}`,
    name: 'Quiet River Fog Navigation.mp4',
    type: 'video',
    sizeBytes: 85000000,
    duration: 120,
    url: '/media/fog_nav.mp4',
    thumbnailUrl: '/media/thumb_fog.jpg',
    tags: ['fog', 'navigation'],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
  };

  StudioStore.updateState((prev) => ({
    ...prev,
    media: [mockAsset, ...prev.media],
  }));

  const result = await repurposeVideoRecording({
    mediaId: mockAsset.id,
    category: 'towboats',
    shortsCount: 3,
    disableCta: true,
  });

  assert.equal(result.shortsProjects.length, 3);
  for (const short of result.shortsProjects) {
    const ctaSubtitle = short.timeline.subtitles?.[short.timeline.subtitles.length - 1];
    assert.equal(ctaSubtitle?.text, '');
  }
});
