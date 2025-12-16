import connectDB from '../../../lib/db';
import { findUserByEmailWithPassword, comparePassword } from '../../../lib/users';
import { getUsersCollection } from '../../../lib/collections';
import { setAuthCookie, clearAuthCookie } from './_utils';
import { apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, username, password } = req.body || {};

  if ((!email && !username) || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  try {
    await connectDB();

    // Support both email and username (name) login
    let user;
    if (email) {
      user = await findUserByEmailWithPassword(email);
    } else if (username) {
      const usersCollection = await getUsersCollection();
      user = await usersCollection.findOne({ name: username.trim() });
    } else {
      clearAuthCookie(res);
      return res.status(400).json({ error: 'Email or username is required' });
    }

    if (!user || !user.passwordHash) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await comparePassword(password, user.passwordHash);
    if (!match) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Remove passwordHash before setting cookie
    const { passwordHash, ...userWithoutPassword } = user;
    setAuthCookie(res, userWithoutPassword);

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    apiLog('/api/auth/login', 'Error during login', { level: 'error', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
}


