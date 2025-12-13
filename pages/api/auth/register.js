import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { setAuthCookie } from './_utils';
import { apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password, joinClub } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || '',
      email: email.toLowerCase(),
      passwordHash,
      role: 'customer',
      clubMember: joinClub === true,
    });

    setAuthCookie(res, user);

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        clubMember: user.clubMember || false,
      },
    });
  } catch (error) {
    apiLog('/api/auth/register', 'Error during registration', { level: 'error', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
}


