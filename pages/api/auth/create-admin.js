import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/db';
import User from '../../../models/User';

const ADMIN_TOKEN = process.env.APP_ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!ADMIN_TOKEN) {
    return res.status(500).json({ error: 'APP_ADMIN_TOKEN is not configured on the server' });
  }

  const headerToken = req.headers['x-admin-token'] || req.headers['X-Admin-Token'];
  if (!headerToken || headerToken !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid or missing admin setup token' });
  }

  const { name, email, password } = req.body || {};

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
      // If the user already exists, upgrade to admin
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
      }
      return res.status(200).json({
        message: 'Admin user already existed; ensured role is admin',
        user: {
          id: existing._id.toString(),
          email: existing.email,
          name: existing.name,
          role: existing.role,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || '',
      email: email.toLowerCase(),
      passwordHash,
      role: 'admin',
    });

    return res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[API] Error in /api/auth/create-admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


