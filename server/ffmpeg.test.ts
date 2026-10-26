import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVideoWithFfmpeg } from './ffmpeg-service';

test('renderVideoWithFfmpeg generates genuine MP4 and thumbnail using local FFmpeg', async () => {
  const result = await renderVideoWithFfmpeg({
    renderId: 'test_smoketest',
    projectId: 'proj_smoke',
    title: 'Mississippi Towboat Diesel Power',
    format: 'shorts_9_16',
    durationSeconds: 3,
  });

  if (!result.success) {
    console.error('FFmpeg render failed with error:', result.error);
  }
  assert.equal(result.success, true, `FFmpeg failed: ${result.error}`);
  assert.ok(result.outputUrl.includes('render_test_smoketest.mp4'));
  assert.ok(result.thumbnailUrl.includes('thumb_test_smoketest.jpg'));
  assert.ok(result.fileSizeBytes > 1000, 'Rendered MP4 file should have size > 1KB');
  assert.equal(fs.existsSync(result.outputPath), true);
});
