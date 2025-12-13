import connectDB from '../../../lib/db';
import User from '../../../models/User';
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

    // Find user and update
    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== userDoc.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      userDoc.email = email.toLowerCase();
    }

    if (name !== undefined) userDoc.name = name;
    if (phone !== undefined) userDoc.phone = phone;

    await userDoc.save();

    return res.status(200).json({
      success: true,
      user: {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        phone: userDoc.phone,
        role: userDoc.role,
        clubMember: userDoc.clubMember || false,
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

