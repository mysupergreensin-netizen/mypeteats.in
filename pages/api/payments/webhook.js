import connectDB from '../../../lib/db';
import { ObjectId } from 'mongodb';
import { getOrdersCollection, getProductsCollection } from '../../../lib/collections';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const ordersCollection = await getOrdersCollection();
    const productsCollection = await getProductsCollection();

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set, skipping webhook verification');
    }

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature if secret is set
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('[WEBHOOK] Invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Handle payment.captured event
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (!orderId) {
        console.warn('[WEBHOOK] No orderId in payment notes');
        return res.status(200).json({ received: true });
      }

      let order;
      try {
        order = await ordersCollection.findOne({
          _id: new ObjectId(orderId),
        });
      } catch {
        console.warn(`[WEBHOOK] Invalid orderId format: ${orderId}`);
        return res.status(200).json({ received: true });
      }
      if (!order) {
        console.warn(`[WEBHOOK] Order ${orderId} not found`);
        return res.status(200).json({ received: true });
      }

      // Update order status
      if (order.payment.status !== 'completed') {
        // Only update status and inventory if order is still pending
        if (order.status === 'pending') {
          await ordersCollection.updateOne(
            { _id: order._id },
            {
              $set: {
                'payment.status': 'completed',
                'payment.transactionId': payment.id,
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

          console.log(`[WEBHOOK] Order ${order.orderNumber} confirmed via webhook`);
        } else {
          await ordersCollection.updateOne(
            { _id: order._id },
            {
              $set: {
                'payment.status': 'completed',
                'payment.transactionId': payment.id,
              },
            }
          );
        }
      }
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      const orderId = payment.notes?.orderId;

      if (orderId) {
        let order;
        try {
          order = await ordersCollection.findOne({
            _id: new ObjectId(orderId),
          });
        } catch {
          console.warn(`[WEBHOOK] Invalid orderId format on payment.failed: ${orderId}`);
          return res.status(200).json({ received: true });
        }
        if (order && order.payment.status === 'pending') {
          await ordersCollection.updateOne(
            { _id: order._id },
            { $set: { 'payment.status': 'failed' } }
          );
          console.log(`[WEBHOOK] Payment failed for order ${order.orderNumber}`);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

