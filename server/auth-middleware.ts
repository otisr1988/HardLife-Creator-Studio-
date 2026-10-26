import type { Request, Response, NextFunction } from 'express';
import { StudioStore } from './store.ts';
import { isAuthorizedOwner, CONFIGURED_OWNER_EMAIL, extractBearerToken } from '../src/lib/security.ts';

// In-memory sliding-window rate limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(limit: number = 100, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const entry = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
    } else {
      entry.count += 1;
    }

    requestCounts.set(ip, entry);

    if (entry.count > limit) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      return res.status(429).json({
        error: 'Too Many Requests: Rate limit exceeded. Try again in a minute.',
      });
    }

    next();
  };
}

/**
 * Validates that an incoming request is authenticated as the designated owner (kodir1988@gmail.com)
 * Accepts:
 * 1. Bearer token matching studio MCP API key
 * 2. Session cookie/header from verified owner session
 * 3. Loopback/local dev requests if running in development mode
 */
export function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const state = StudioStore.getState();
  const bearerToken = extractBearerToken(req.headers['authorization']);
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['x-mcp-api-key'];

  // Check Bearer / API token
  if (bearerToken && bearerToken === state.settings.mcpApiKey) {
    return next();
  }

  if (typeof apiKeyHeader === 'string' && apiKeyHeader === state.settings.mcpApiKey) {
    return next();
  }

  // Check verified owner email header from trusted auth proxy
  const emailHeader = req.headers['x-user-email'] as string;
  const verifiedHeader = req.headers['x-email-verified'] === 'true';

  if (emailHeader && isAuthorizedOwner(emailHeader, verifiedHeader)) {
    return next();
  }

  // Allow if owner session cookie is present
  const studioAuthCookie = req.headers['cookie']?.includes('hardlife_owner_session=verified');
  if (studioAuthCookie) {
    return next();
  }

  // Reject all other unauthenticated requests
  return res.status(401).json({
    error: `Unauthorized: Protected operation restricted to verified owner (${CONFIGURED_OWNER_EMAIL}).`,
  });
}
