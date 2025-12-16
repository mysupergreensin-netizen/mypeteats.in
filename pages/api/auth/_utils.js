import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import connectDB from '../../../lib/db';
import { findUserById } from '../../../lib/users';
import { warn } from '../../../utils/logger';

// Validate JWT_SECRET - required for authentication
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    const platform = process.env.VERCEL ? 'Vercel' : 'production';
    throw new Error(
      `JWT_SECRET is required in ${platform}. ` +
      `Please set it in your ${process.env.VERCEL ? 'Vercel environment variables' : '.env file'}. ` +
      `See FIX_VERCEL_JWT_SECRET.md for instructions.`
    );
  }
  warn('[AUTH] WARNING: JWT_SECRET not set, using insecure default. Set JWT_SECRET in .env for production.');
}

const JWT_SECRET_FINAL = JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'auth_token';

export async function getUserFromRequest(req) {
  await connectDB();

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET_FINAL);
    const user = await findUserById(payload.sub);
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      clubMember: user.clubMember || false,
      phone: user.phone,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(res, user) {
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    JWT_SECRET_FINAL,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const isProd = process.env.NODE_ENV === 'production';

  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.setHeader('Set-Cookie', cookie);
}

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce((acc, part) => {
    const [key, ...v] = part.split('=');
    acc[key.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}


