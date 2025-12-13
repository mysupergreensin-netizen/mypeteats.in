// Shared in-memory cart store for both cart endpoints
export const carts = new Map();

export function getCartId(req) {
  const user = req.user;
  if (user) {
    return `user:${user.id}`;
  }
  return `session:${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous'}`;
}

