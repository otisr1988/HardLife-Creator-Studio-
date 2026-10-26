/**
 * Security and Authorization Utilities for HardLife Creator Studio
 */

export const CONFIGURED_OWNER_EMAIL = 'kodir1988@gmail.com';

export const TARGET_CHANNELS = {
  YOUTUBE: '@towboater2011',
  TIKTOK: '@otis0239',
};

/**
 * Checks whether the authenticated user is the designated single owner
 */
export function isAuthorizedOwner(email: string | null | undefined, emailVerified: boolean = false): boolean {
  if (!email) return false;
  return emailVerified && email.toLowerCase().trim() === CONFIGURED_OWNER_EMAIL.toLowerCase();
}

/**
 * Validates channel handle matches creator target
 */
export function validateChannelHandle(platform: 'youtube' | 'tiktok', handle: string): boolean {
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  if (platform === 'youtube') {
    return cleanHandle.toLowerCase() === TARGET_CHANNELS.YOUTUBE.toLowerCase();
  }
  if (platform === 'tiktok') {
    return cleanHandle.toLowerCase() === TARGET_CHANNELS.TIKTOK.toLowerCase();
  }
  return false;
}

/**
 * Extracts Bearer token from HTTP Authorization header
 */
export function extractBearerToken(authHeader: string | undefined | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.trim().split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1].trim();
  }
  return null;
}

/**
 * Sanitize plain text fields for titles and descriptions
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (!text) return '';
  // Strip control chars and null bytes, trim whitespace
  const sanitized = text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
  return sanitized.slice(0, maxLength);
}
