import connectDB from '../../../lib/db';
import { findOrdersByUserId, countOrders } from '../../../lib/orders';
import { getUserFromRequest } from '../auth/_utils';
import { ObjectId } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get user's orders
    const orders = await findOrdersByUserId(user.id, {
      page,
      limit,
      sort: { created_at: -1 },
    });

    const total = await countOrders({ user: user.id });

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] Error in /api/orders:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

