import connectDB from '../../../../lib/db';
import Order from '../../../../models/Order';
import { requireAdmin } from '../../../../lib/_auth';
import { createRateLimiter } from '../../../../middleware/rateLimiter';

const rateLimiter = createRateLimiter(10, 60000); // 10 requests per minute

async function handler(req, res) {
  // Apply rate limiting
  const rateLimit = rateLimiter(req);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      resetAt: new Date(rateLimit.resetAt).toISOString()
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build query with optional filters
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.orderNumber) {
      query.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
    }

    // Get all orders (admin can see all)
    const orders = await Order.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.product', 'title slug images sku')
      .lean();

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[API] Error in /api/admin/orders:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

