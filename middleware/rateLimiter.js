// Simple in-memory rate limiter
// For production, use Redis-based rate limiting

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.expiresAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  return (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection?.remoteAddress || 
               'unknown';
    
    const key = `rate_limit_${ip}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || record.expiresAt < now) {
      // New window
      rateLimitStore.set(key, {
        count: 1,
        expiresAt: now + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (record.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetAt: record.expiresAt
      };
    }

    record.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - record.count 
    };
  };
}

// Failed auth attempt tracker
const failedAuthStore = new Map();

export function trackFailedAuth(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             'unknown';
  
  const key = `failed_auth_${ip}`;
  const now = Date.now();
  const record = failedAuthStore.get(key);

  if (!record || record.expiresAt < now) {
    failedAuthStore.set(key, {
      count: 1,
      expiresAt: now + (15 * 60 * 1000) // 15 minute lockout window
    });
    return { attempts: 1, locked: false };
  }

  record.count++;
  const locked = record.count >= 5;
  
  return { 
    attempts: record.count, 
    locked,
    resetAt: record.expiresAt
  };
}

export function clearFailedAuth(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             'unknown';
  
  const key = `failed_auth_${ip}`;
  failedAuthStore.delete(key);
}

// Clean up failed auth entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of failedAuthStore.entries()) {
    if (value.expiresAt < now) {
      failedAuthStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

