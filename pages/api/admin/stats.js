import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import Order from '../../../models/Order';
import User from '../../../models/User';
import { requireAdmin } from '../../../lib/_auth';
import { createRateLimiter } from '../../../middleware/rateLimiter';

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

    // Get date range for recent stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Parallel queries for better performance
    const [
      totalProducts,
      publishedProducts,
      totalOrders,
      recentOrders,
      totalUsers,
      adminUsers,
      clubMembers,
      totalRevenue,
      recentRevenue,
      ordersByStatus,
      lowInventoryProducts,
      // Time series for last 7 days (orders + revenue)
      ordersTimeSeries
    ] = await Promise.all([
      // Product stats
      Product.countDocuments(),
      Product.countDocuments({ published: true }),
      
      // Order stats
      Order.countDocuments(),
      Order.countDocuments({ created_at: { $gte: thirtyDaysAgo } }),
      
      // User stats
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ clubMember: true }),
      
      // Revenue stats (sum of all completed orders)
      Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$total_cents' } } }
      ]),
      
      // Recent revenue (last 30 days)
      Order.aggregate([
        {
          $match: {
            'payment.status': 'completed',
            created_at: { $gte: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$total_cents' } } }
      ]),
      
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Low inventory products (less than 10)
      Product.countDocuments({ inventory: { $lt: 10, $gte: 0 } }),

      // Orders and revenue grouped by day for last 7 days
      Order.aggregate([
        {
          $match: {
            created_at: { $gte: (() => {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
              // midnight
              sevenDaysAgo.setHours(0, 0, 0, 0);
              return sevenDaysAgo;
            })()
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$created_at' },
              month: { $month: '$created_at' },
              day: { $dayOfMonth: '$created_at' }
            },
            orders: { $sum: 1 },
            revenue_cents: { $sum: '$total_cents' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ])
    ]);

    // Process revenue data
    const totalRevenueCents = totalRevenue[0]?.total || 0;
    const recentRevenueCents = recentRevenue[0]?.total || 0;

    // Process orders by status
    const statusCounts = {};
    ordersByStatus.forEach(({ _id, count }) => {
      statusCounts[_id] = count;
    });

    // Build a normalized 7-day time series (including days with 0)
    const sevenDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      sevenDays.push({ date: d, key });
    }

    const tsMap = new Map();
    ordersTimeSeries.forEach((entry) => {
      const { year, month, day } = entry._id;
      const key = `${year}-${month}-${day}`;
      tsMap.set(key, {
        orders: entry.orders,
        revenue_cents: entry.revenue_cents
      });
    });

    const normalizedTimeSeries = sevenDays.map(({ date, key }) => {
      const found = tsMap.get(key) || { orders: 0, revenue_cents: 0 };
      return {
        date: date.toISOString().slice(0, 10),
        orders: found.orders,
        revenue_cents: found.revenue_cents
      };
    });

    return res.status(200).json({
      products: {
        total: totalProducts,
        published: publishedProducts,
        draft: totalProducts - publishedProducts,
        lowInventory: lowInventoryProducts
      },
      orders: {
        total: totalOrders,
        recent: recentOrders,
        byStatus: statusCounts,
        timeSeries: normalizedTimeSeries
      },
      users: {
        total: totalUsers,
        admins: adminUsers,
        customers: totalUsers - adminUsers,
        clubMembers: clubMembers
      },
      revenue: {
        total_cents: totalRevenueCents,
        recent_cents: recentRevenueCents,
        total_formatted: (totalRevenueCents / 100).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        }),
        recent_formatted: (recentRevenueCents / 100).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        })
      }
    });
  } catch (error) {
    console.error('[API] Error in /api/admin/stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

