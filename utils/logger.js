/**
 * Simple logger utility for production-ready logging
 * Replaces console statements with environment-aware logging
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log info messages (only in development)
 */
export function log(...args) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Log error messages (always logged)
 */
export function error(...args) {
  console.error(...args);
}

/**
 * Log warning messages (always logged)
 */
export function warn(...args) {
  console.warn(...args);
}

/**
 * Log debug messages (only in development)
 */
export function debug(...args) {
  if (isDevelopment) {
    console.debug(...args);
  }
}

/**
 * Structured logging for API routes
 */
export function apiLog(route, message, data = {}) {
  const logData = {
    route,
    message,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  if (isDevelopment) {
    console.log(`[API] ${route}:`, logData);
  } else {
    // In production, you might want to send to a logging service
    // For now, we'll still log errors and warnings
    if (data.level === 'error' || data.level === 'warn') {
      console.error(`[API] ${route}:`, JSON.stringify(logData));
    }
  }
}

export default {
  log,
  error,
  warn,
  debug,
  apiLog,
};

