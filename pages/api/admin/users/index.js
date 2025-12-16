import connectDB from '../../../../lib/db';
import { findUsers, countUsers, createUser, findUserByEmail, hashPassword } from '../../../../lib/users';
import { requireAdmin } from '../../../../lib/_auth';
import { createRateLimiter } from '../../../../middleware/rateLimiter';

const rateLimiter = createRateLimiter(10, 60000); // 10 requests per minute

async function handler(req, res) {
  // Apply rate limiting
  const rateLimit = rateLimiter(req);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      resetAt: new Date(rateLimit.resetAt).toISOString()
    });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Build query with optional filters
      const query = {};
      if (req.query.role) {
        query.role = req.query.role;
      }
      if (req.query.clubMember !== undefined) {
        query.clubMember = req.query.clubMember === 'true';
      }
      if (req.query.search) {
        query.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      // Get all users (admin can see all)
      const users = await findUsers(query, {
        page,
        limit,
        sort: { created_at: -1 },
      });

      const total = await countUsers(query);

      return res.status(200).json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      // Create a new admin/staff account – only super_admin allowed
      const actingUser = req.user;
      if (!actingUser || actingUser.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can create admin accounts' });
      }

      const { name, email, password, role } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const allowedRoles = ['staff', 'manager', 'admin'];
      const targetRole = allowedRoles.includes(role) ? role : 'staff';

      const existing = await findUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }

      const passwordHash = await hashPassword(password);

      const user = await createUser({
        name: name || '',
        email: email.toLowerCase(),
        passwordHash,
        role: targetRole
      });

      const safeUser = user; // Already doesn't include passwordHash

      return res.status(201).json({
        message: 'Admin account created successfully',
        user: safeUser
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in /api/admin/users:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

