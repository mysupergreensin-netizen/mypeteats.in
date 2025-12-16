import connectDB from '../../../lib/db';
import { ObjectId } from 'mongodb';
import { getOrdersCollection, getProductsCollection } from '../../../lib/collections';
import crypto from 'crypto';

// In-memory cart storage (same as cart API)
const carts = new Map();

function getCartId(userId) {
  return `user:${userId}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const ordersCollection = await getOrdersCollection();
    const productsCollection = await getProductsCollection();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find order
    let order;
    try {
      order = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
      });
    } catch {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order is already processed
    if (order.payment.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
        },
      });
    }

    // Update order with payment details
    order.payment.status = 'completed';
    order.payment.transactionId = razorpay_payment_id;
    
    // Only update status and inventory if order is still pending
    if (order.status === 'pending') {
      await ordersCollection.updateOne(
        { _id: order._id },
        {
          $set: {
            'payment.status': 'completed',
            'payment.transactionId': razorpay_payment_id,
            status: 'confirmed',
          },
        }
      );

      // Update inventory (deduct from stock)
      for (const item of order.items) {
        await productsCollection.updateOne(
          { _id: item.product },
          { $inc: { inventory: -item.quantity } }
        );
      }

      // Refresh order document
      order = await ordersCollection.findOne({ _id: order._id });
    } else {
      await ordersCollection.updateOne(
        { _id: order._id },
        {
          $set: {
            'payment.status': 'completed',
            'payment.transactionId': razorpay_payment_id,
          },
        }
      );
      order = await ordersCollection.findOne({ _id: order._id });
    }

    // Clear cart
    const cartId = getCartId(order.user.toString());
    carts.delete(cartId);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('[API] Error in /api/payments/verify:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

