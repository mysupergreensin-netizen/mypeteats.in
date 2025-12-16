import connectDB from '../../../lib/db';
import { findUserById, updateUserById, findUserByEmail } from '../../../lib/users';
import { getUserFromRequest } from '../auth/_utils';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, email, phone } = req.body;

    // Find user
    const userDoc = await findUserById(user.id);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== userDoc.email) {
      const existingUser = await findUserByEmail(email);
      if (existingUser && existingUser._id.toString() !== user.id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;

    const updatedUser = await updateUserById(user.id, updateData);

    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        clubMember: updatedUser.clubMember || false,
      },
    });
  } catch (error) {
    console.error('[API] Error updating profile:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

