import connectDB from '../../../lib/db';
import { findUserById, updateUserById } from '../../../lib/users';
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

    // Find user and update club membership
    const userDoc = await findUserById(user.id);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userDoc.clubMember) {
      return res.status(200).json({
        success: true,
        message: 'You are already a member',
        user: {
          id: userDoc._id.toString(),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          clubMember: userDoc.clubMember || false,
        },
      });
    }

    const updatedUser = await updateUserById(user.id, { clubMember: true });

    return res.status(200).json({
      success: true,
      message: 'Successfully joined MyPetEats Club',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        clubMember: updatedUser.clubMember || false,
      },
    });
  } catch (error) {
    console.error('[API] Error joining club:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

