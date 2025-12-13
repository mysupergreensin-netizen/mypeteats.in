import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get single user
      const user = await User.findById(id)
        .select('-passwordHash')
        .lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    }

    if (req.method === 'PUT') {
      // Update user (mainly role and clubMember status)
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { role, clubMember, name, phone } = req.body;

      // Validate role if provided
      if (role !== undefined) {
        const validRoles = ['customer', 'staff', 'manager', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ error: 'Invalid role' });
        }

        // Only super_admin can change other admin roles
        const actingUser = req.user;
        if (
          (!actingUser || actingUser.role !== 'super_admin') &&
          (user.role !== 'customer' || ['admin', 'super_admin'].includes(role))
        ) {
          return res.status(403).json({ error: 'Only super admins can modify admin roles' });
        }

        user.role = role;
      }

      // Update clubMember status if provided
      if (clubMember !== undefined) {
        user.clubMember = Boolean(clubMember);
      }

      // Update name if provided
      if (name !== undefined) {
        user.name = name.trim().substring(0, 120);
      }

      // Update phone if provided
      if (phone !== undefined) {
        user.phone = phone.trim();
      }

      await user.save();

      const updatedUser = await User.findById(id)
        .select('-passwordHash')
        .lean();

      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in /api/admin/users/[id]:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

