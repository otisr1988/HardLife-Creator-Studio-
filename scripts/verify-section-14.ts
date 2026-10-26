import fs from 'node:fs';
import path from 'node:path';
import { StudioStore, type VideoProject, type MediaAsset, type Publication } from '../server/store.ts';
import { renderVideoWithFfmpeg } from '../server/ffmpeg-service.ts';

async function runSection14Challenge() {
  console.log('--- Starting Section 14 Verification Challenge: GTA Short Test ---');

  const projectId = 'proj_gta_short_test_01';
  const renderId = 'rnd_gta_short_test_01';
  const durationSeconds = 30; // 20-45s range

  // 1. Media Asset: Labeled illustrative simulated recreation
  const mediaAsset: MediaAsset = {
    id: 'med_gta_simulated_footage_01',
    name: 'GTA_ViceCity_HighSpeed_Escape.mp4',
    type: 'video',
    sizeBytes: 42500000,
    duration: 35,
    url: '/rendered/gta_simulated_base.mp4',
    thumbnailUrl: '/rendered/thumb_gta_simulated.jpg',
    tags: ['gaming', 'gta', 'simulation', 'simulated_recreation'],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
  };

  // 2. Video Project: GTA Short Test
  const gtaProject: VideoProject = {
    id: projectId,
    title: 'GTA Short Test: Impossible Freeway Evading [Simulated Gameplay Recreation]',
    description: 'High-speed freeway escape sequence in 9:16 format. Labeled as [Simulated Gameplay Recreation]. Features accurate beat-timed captions, audio ducking, and creator CTA. Prepared for @towboater2011.',
    category: 'gaming',
    status: 'draft',
    format: 'shorts_9_16',
    duration: durationSeconds,
    timeline: {
      clips: [
        {
          id: 'clip_gta_main',
          mediaId: mediaAsset.id,
          trackId: 'v1',
          title: 'High Speed Pursuit [Simulated Recreation]',
          startTime: 0,
          duration: durationSeconds,
          sourceStartTime: 0,
          sourceEndTime: durationSeconds,
          speed: 1.0,
          volume: 1.0,
        },
      ],
      subtitles: [
        {
          id: 'sub_gta_1',
          startTime: 0.5,
          endTime: 4.5,
          text: 'Notice this precision 180 J-turn across 4 lanes! 🎮',
        },
        {
          id: 'sub_gta_2',
          startTime: 5.0,
          endTime: 10.0,
          text: '[DISCLAIMER: Modded Engine Recreation — Not Official GTA VI Release]',
        },
        {
          id: 'sub_gta_3',
          startTime: 10.5,
          endTime: 16.0,
          text: 'Engine RPM pegged at 8,200. Timing the oncoming tanker gap.',
        },
        {
          id: 'sub_gta_4',
          startTime: 16.5,
          endTime: 23.0,
          text: 'Threading the needle with centimeters to spare!',
        },
        {
          id: 'sub_gta_5',
          startTime: 23.5,
          endTime: 29.5,
          text: 'Like, comment, and subscribe on @towboater2011 for daily stunts!',
        },
      ],
      duckingEnabled: true,
      voiceVolume: 1.0,
      musicVolume: 0.18,
    },
    script: 'Hook: High-stakes evade sequence. Body: Technical breakdown of escape maneuvers. Climax: Near-miss underpass drift. CTA: Like, comment, and subscribe on @towboater2011.',
    tags: ['GTA', 'Gaming', 'Shorts', 'SimulatedRecreation', 'Gameplay', 'Towboater2011'],
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 3. Render real MP4 with /usr/bin/ffmpeg
  console.log('Rendering 30s 1080x1920 9:16 Short with /usr/bin/ffmpeg...');
  const renderResult = await renderVideoWithFfmpeg({
    renderId,
    projectId,
    title: 'GTA Short Test [Simulated Recreation]',
    format: 'shorts_9_16',
    durationSeconds,
    subtitles: gtaProject.timeline.subtitles,
  });

  if (!renderResult.success) {
    throw new Error(`FFmpeg rendering failed: ${renderResult.error}`);
  }

  console.log(`Render succeeded! Output file: ${renderResult.outputPath} (${(renderResult.fileSizeBytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Poster thumbnail generated: ${renderResult.thumbnailUrl}`);

  // Update project status to ready
  gtaProject.status = 'ready';
  gtaProject.renderUrl = renderResult.outputUrl;
  gtaProject.thumbnailUrl = renderResult.thumbnailUrl;

  // 4. Generate SEO Metadata
  const seoPayload = {
    title: 'Impossible Freeway Evade! 🏎️💨 [Simulated Gameplay Recreation] #Shorts',
    description: `Watch this insane 4-lane freeway escape sequence! \n\n⚠️ Transparency Label: This video is a [Simulated Gameplay Recreation / Modded Physics Engine Showcase]. Not genuine gameplay footage of unreleased titles.\n\nDon't forget to like, comment, and subscribe to @towboater2011 for more high-octane gaming and towboat operations!\n\n#GTA #Gaming #Shorts #SimulatedRecreation #Stunts #Gamers`,
    tags: ['GTA', 'Gaming Shorts', 'Simulated Gameplay Recreation', 'Stunts', 'High Speed Escape', 'Towboater2011', 'Viral'],
    category: '20', // Gaming category ID in YouTube
    privacyStatus: 'private', // Enforced safe default before explicit owner publication confirmation
    targetChannel: '@towboater2011',
    madeForKids: false,
  };

  // 5. Prepare YouTube upload payload
  const publicationPayload: Publication = {
    id: `pub_gta_test_${Date.now()}`,
    projectId: gtaProject.id,
    platform: 'youtube',
    status: 'scheduled',
    title: seoPayload.title,
    description: seoPayload.description,
    videoUrl: renderResult.outputUrl,
    thumbnailUrl: renderResult.thumbnailUrl,
    tags: seoPayload.tags,
    scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    analytics: {
      views: 0,
      likes: 0,
      comments: 0,
    },
    ownerId: 'owner_kodir',
    createdAt: new Date().toISOString(),
  };

  // Save to persistent store
  StudioStore.updateState((prev) => ({
    ...prev,
    media: [mediaAsset, ...prev.media.filter((m) => m.id !== mediaAsset.id)],
    projects: [gtaProject, ...prev.projects.filter((p) => p.id !== gtaProject.id)],
    publications: [publicationPayload, ...prev.publications.filter((p) => p.id !== publicationPayload.id)],
  }));

  StudioStore.logActivity(
    'Section 14 Challenge Completed',
    'publish',
    `Produced and rendered 'GTA Short Test' (30s 9:16). YouTube payload staged for @towboater2011. Awaiting owner sign-off.`,
    'success'
  );

  console.log('\n--- Section 14 Challenge Successfully Prepared ---');
  console.log('Project ID:', gtaProject.id);
  console.log('Render URL:', renderResult.outputUrl);
  console.log('SEO Title:', seoPayload.title);
  console.log('Target Channel:', seoPayload.targetChannel);
  console.log('Status: STAGED — Crucial gate: STOPPING for explicit user approval before publishing to @towboater2011.');
}

runSection14Challenge().catch((err) => {
  console.error('Failed to run challenge:', err);
  process.exit(1);
});
