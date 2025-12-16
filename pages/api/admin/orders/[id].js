import connectDB from '../../../../lib/db';
import { findOrderById, updateOrderById } from '../../../../lib/orders';
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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get single order
      let order;
      try {
        order = await findOrderById(id);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid order ID format' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      return res.status(200).json({ order });
    }

    if (req.method === 'PUT') {
      // Update order (mainly status and payment status)
      let order;
      try {
        order = await findOrderById(id);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid order ID format' });
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const { status, paymentStatus, paymentMethod } = req.body;
      const updateData = {};

      // Validate status if provided
      if (status !== undefined) {
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid order status' });
        }
        updateData.status = status;
      }

      // Validate payment status if provided
      if (paymentStatus !== undefined) {
        const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validPaymentStatuses.includes(paymentStatus)) {
          return res.status(400).json({ error: 'Invalid payment status' });
        }
        updateData['payment.status'] = paymentStatus;
      }

      // Update payment method if provided
      if (paymentMethod !== undefined) {
        const validPaymentMethods = ['card', 'cash_on_delivery', 'upi', 'netbanking', 'razorpay'];
        if (!validPaymentMethods.includes(paymentMethod)) {
          return res.status(400).json({ error: 'Invalid payment method' });
        }
        updateData['payment.method'] = paymentMethod;
      }

      const updatedOrder = await updateOrderById(id, updateData);

      return res.status(200).json({
        message: 'Order updated successfully',
        order: updatedOrder
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in /api/admin/orders/[id]:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

