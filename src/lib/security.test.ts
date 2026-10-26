import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAuthorizedOwner,
  validateChannelHandle,
  extractBearerToken,
  sanitizeText,
  CONFIGURED_OWNER_EMAIL,
  TARGET_CHANNELS,
} from './security';

test('isAuthorizedOwner strictly allows only verified kodir1988@gmail.com', () => {
  assert.equal(isAuthorizedOwner('kodir1988@gmail.com', true), true);
  assert.equal(isAuthorizedOwner('KODIR1988@GMAIL.COM', true), true); // Case-insensitive
  // Reject unverified email
  assert.equal(isAuthorizedOwner('kodir1988@gmail.com', false), false);
  // Reject non-owner email
  assert.equal(isAuthorizedOwner('other@example.com', true), false);
  assert.equal(isAuthorizedOwner('', false), false);
  assert.equal(isAuthorizedOwner(null, false), false);
});

test('validateChannelHandle matches intended target accounts', () => {
  assert.equal(validateChannelHandle('youtube', '@towboater2011'), true);
  assert.equal(validateChannelHandle('youtube', 'towboater2011'), true);
  assert.equal(validateChannelHandle('youtube', '@other_channel'), false);

  assert.equal(validateChannelHandle('tiktok', '@otis0239'), true);
  assert.equal(validateChannelHandle('tiktok', 'otis0239'), true);
  assert.equal(validateChannelHandle('tiktok', '@random_user'), false);
});

test('extractBearerToken extracts token from standard Authorization header', () => {
  assert.equal(extractBearerToken('Bearer secret-token-12345'), 'secret-token-12345');
  assert.equal(extractBearerToken('bearer secret-token-12345'), 'secret-token-12345');
  assert.equal(extractBearerToken('Basic dXNlcjpwYXNz'), null);
  assert.equal(extractBearerToken(''), null);
  assert.equal(extractBearerToken(undefined), null);
});

test('sanitizeText strips control chars and enforces maxLength', () => {
  const dirty = 'Hello\u0000 World\u001F!';
  assert.equal(sanitizeText(dirty, 100), 'Hello World!');

  const long = 'a'.repeat(200);
  assert.equal(sanitizeText(long, 50).length, 50);
});
