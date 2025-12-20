import connectDB from '../../../lib/db';
import { createUser, findUserByEmail, hashPassword } from '../../../lib/users';
import { setAuthCookie } from './_utils';
import { apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check required environment variables
  if (!process.env.MONGODB_URI) {
    apiLog('/api/auth/register', 'MONGODB_URI not configured', { level: 'error' });
    return res.status(500).json({ error: 'Server configuration error' });
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
    // Connect to database with timeout handling
    try {
      await connectDB();
    } catch (dbError) {
      apiLog('/api/auth/register', 'Database connection failed', { level: 'error', error: dbError.message });
      return res.status(503).json({ 
        error: 'Database connection failed. Please try again in a moment.' 
      });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser({
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
    apiLog('/api/auth/register', 'Error during registration', { level: 'error', error: error.message, stack: error.stack });
    
    // Provide more specific error messages
    if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
      return res.status(503).json({ error: 'Database connection failed. Please try again.' });
    }
    
    if (error.message?.includes('duplicate key') || error.code === 11000) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    // Return more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    
    return res.status(500).json({ error: errorMessage });
  }
}


