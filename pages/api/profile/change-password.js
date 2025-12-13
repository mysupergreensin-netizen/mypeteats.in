import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { getUserFromRequest } from '../auth/_utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Find user with password hash
    const userDoc = await User.findById(user.id).select('+passwordHash');
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await userDoc.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    const bcrypt = require('bcryptjs');
    userDoc.passwordHash = await bcrypt.hash(newPassword, 10);
    await userDoc.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[API] Error changing password:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

