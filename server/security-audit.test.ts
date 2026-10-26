import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { studioApp } from './api.ts';
import { CONFIGURED_OWNER_EMAIL, isAuthorizedOwner, validateChannelHandle } from '../src/lib/security.ts';
import { StudioStore } from './store.ts';

let server: http.Server;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server = studioApp.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test('Security Audit: Unauthorized POST /api/projects is rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Hacked Video Project' }),
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error.includes('Unauthorized'));
});

test('Security Audit: Unauthorized POST /api/render is rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/api/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: 'any_proj' }),
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error.includes('Unauthorized'));
});

test('Security Audit: Unauthorized POST /api/media/upload is rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/api/media/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'exploit.mp4', dataBase64: 'AAAA' }),
  });

  assert.equal(res.status, 401);
});

test('Security Audit: Directory traversal attempt in media upload is rejected with 400', async () => {
  const apiKey = StudioStore.getState().settings.mcpApiKey;
  const res = await fetch(`${baseUrl}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: '../../../../etc/passwd',
      base64Data: 'dGVzdA==',
    }),
  });

  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('traversal') || data.error.includes('security'));
});

test('Security Audit: Authorized request with Bearer API Key succeeds', async () => {
  const apiKey = StudioStore.getState().settings.mcpApiKey;
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      title: 'Authorized Owner Project Test',
      category: 'towboats',
      format: 'youtube_16_9',
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.title, 'Authorized Owner Project Test');
});

test('Security Audit: Single-owner identity validation strictly enforces owner email and verification status', () => {
  // Correct owner with verified email
  assert.equal(isAuthorizedOwner(CONFIGURED_OWNER_EMAIL, true), true);

  // Correct owner without verified email (must be rejected)
  assert.equal(isAuthorizedOwner(CONFIGURED_OWNER_EMAIL, false), false);

  // Impostor emails
  assert.equal(isAuthorizedOwner('attacker@malicious.com', true), false);
  assert.equal(isAuthorizedOwner('admin@hardlifestudio.com', true), false);
  assert.equal(isAuthorizedOwner('kodir1988@yahoo.com', true), false);
  assert.equal(isAuthorizedOwner('', false), false);
  assert.equal(isAuthorizedOwner(null, false), false);
});

test('Security Audit: Channel target verification enforces @towboater2011 and @otis0239', () => {
  assert.equal(validateChannelHandle('youtube', '@towboater2011'), true);
  assert.equal(validateChannelHandle('youtube', 'towboater2011'), true);
  assert.equal(validateChannelHandle('youtube', '@random_channel'), false);

  assert.equal(validateChannelHandle('tiktok', '@otis0239'), true);
  assert.equal(validateChannelHandle('tiktok', 'otis0239'), true);
  assert.equal(validateChannelHandle('tiktok', '@fake_tiktok'), false);
});

test('Security Audit: MCP JSON-RPC rejects unauthorized tool call without API key', async () => {
  const res = await fetch(`${baseUrl}/api/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'req_1',
      method: 'tools/call',
      params: {
        name: 'list_projects',
        arguments: {},
      },
    }),
  });

  const data = await res.json();
  assert.ok(data.error, 'Should return error object');
  assert.equal(data.error.code, -32001);
});

test('Security Audit: Healthcheck endpoint returns verified server status and owner info', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.equal(data.owner, CONFIGURED_OWNER_EMAIL);
  assert.equal(data.ffmpegDetected, true);
});
