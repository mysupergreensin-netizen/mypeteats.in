import connectDB from '../../../lib/db';
import Order from '../../../models/Order';
import { getUserFromRequest } from '../auth/_utils';

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
    const skip = (page - 1) * limit;

    // Get user's orders
    const orders = await Order.find({ user: user.id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'title slug images')
      .lean();

    const total = await Order.countDocuments({ user: user.id });

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

