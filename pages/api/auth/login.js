import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
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
    const query = email 
      ? { email: email.toLowerCase() }
      : { name: username.trim() };
    
    const user = await User.findOne(query).select('+passwordHash');
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    setAuthCookie(res, user);

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


