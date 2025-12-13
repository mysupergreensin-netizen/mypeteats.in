import { trackFailedAuth, clearFailedAuth } from '../middleware/rateLimiter';
import { getUserFromRequest } from '../pages/api/auth/_utils';
import { warn } from '../utils/logger';

const ADMIN_TOKEN = process.env.APP_ADMIN_TOKEN;

// Validate critical environment variables on startup
if (process.env.NODE_ENV === 'production') {
  if (!ADMIN_TOKEN) {
    throw new Error('APP_ADMIN_TOKEN is required in production. Please set it in your .env file.');
  }
} else if (!ADMIN_TOKEN) {
  warn('[AUTH] WARNING: APP_ADMIN_TOKEN not set in environment');
}

/**
 * Backwards-compatible admin token validation (x-admin-token header)
 * Used only as a fallback when no logged-in admin user is present.
 */
export function validateAdminToken(req) {
  // Check for brute-force lockout
  const authStatus = trackFailedAuth(req);
  if (authStatus.locked) {
    return {
      valid: false,
      error: 'Too many failed authentication attempts. Please try again later.',
      status: 429,
      resetAt: authStatus.resetAt,
    };
  }

  const token = req.headers['x-admin-token'] || req.headers['X-Admin-Token'];

  if (!token) {
    trackFailedAuth(req); // Track failed attempt
    return {
      valid: false,
      error: 'Admin token required',
      status: 401,
    };
  }

  if (token !== ADMIN_TOKEN) {
    trackFailedAuth(req); // Track failed attempt
    return {
      valid: false,
      error: 'Invalid admin token',
      status: 401,
    };
  }

  // Clear failed attempts on successful auth
  clearFailedAuth(req);

  return { valid: true };
}

/**
 * API route wrapper for admin authentication
 * Prefers logged-in admin user via auth cookie; falls back to legacy header token.
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    // CORS check - admin endpoints should be same-origin only
    const origin = req.headers.origin;
    const host = req.headers.host;

    // In production, enforce same-origin (no CORS for admin)
    if (process.env.NODE_ENV === 'production' && origin && !origin.includes(host)) {
      return res.status(403).json({ error: 'Forbidden: Admin endpoints are same-origin only' });
    }

    // 1. Try cookie-based user auth
    const user = await getUserFromRequest(req);
    if (user && ['admin', 'super_admin', 'manager', 'staff'].includes(user.role)) {
      req.user = user;
      return handler(req, res);
    }

    // 2. Fallback to legacy admin token header
    const authResult = validateAdminToken(req);

    if (!authResult.valid) {
      return res.status(authResult.status || 401).json({
        error: authResult.error,
        ...(authResult.resetAt && { resetAt: new Date(authResult.resetAt).toISOString() }),
      });
    }

    return handler(req, res);
  };
}

