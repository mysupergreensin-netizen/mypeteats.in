import connectDB from '../../../lib/db';
import { ObjectId } from 'mongodb';
import { getOrdersCollection, getProductsCollection } from '../../../lib/collections';
import { getUserFromRequest } from '../auth/_utils';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// In-memory cart storage (same as cart API)
const carts = new Map();

function getCartId(req) {
  const user = req.user;
  if (user) {
    return `user:${user.id}`;
  }
  return `session:${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous'}`;
}

// Initialize Razorpay
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const productsCollection = await getProductsCollection();
    const ordersCollection = await getOrdersCollection();

    // Get user if authenticated
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.user = user;

    const cartId = getCartId(req);
    const cart = carts.get(cartId);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Get shipping address from request body
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    for (const field of requiredFields) {
      if (!shippingAddress[field] || typeof shippingAddress[field] !== 'string' || shippingAddress[field].trim().length === 0) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Fetch all products and validate
    const productIds = cart.items.map((item) => new ObjectId(item.productId));
    const products = await productsCollection
      .find({ _id: { $in: productIds } })
      .toArray();

    if (products.length !== cart.items.length) {
      return res.status(400).json({ error: 'Some products are no longer available' });
    }

    // Validate inventory and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );

      if (!product) {
        return res.status(400).json({ error: 'Product not found' });
      }

      if (!product.published) {
        return res.status(400).json({ error: `Product ${product.title} is no longer available` });
      }

      if (product.inventory < cartItem.quantity) {
        return res.status(400).json({
          error: `Insufficient inventory for ${product.title}. Only ${product.inventory} available.`,
        });
      }

      const itemTotal = product.price_cents * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        sku: product.sku,
        price_cents: product.price_cents,
        quantity: cartItem.quantity,
        image: product.images?.[0] || '',
      });
    }

    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    // Create order in database first (with pending status)
    const orderDoc = {
      user: user.id,
      items: orderItems,
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: total,
      currency: 'INR',
      status: 'pending',
      shippingAddress: {
        firstName: shippingAddress.firstName.trim(),
        lastName: shippingAddress.lastName.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        instructions: shippingAddress.instructions?.trim() || '',
      },
      payment: {
        method: 'razorpay',
        status: 'pending',
      },
    };

    const insertResult = await ordersCollection.insertOne(orderDoc);
    let order = await ordersCollection.findOne({
      _id: insertResult.insertedId,
    });

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(500).json({
        error: 'Payment gateway not configured',
        message: 'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables',
      });
    }

    // Create Razorpay order
    const razorpayOptions = {
      amount: total, // Amount in paise (smallest currency unit)
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: user.id,
        orderNumber: order.orderNumber,
      },
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    // Update order with Razorpay order ID
    await ordersCollection.updateOne(
      { _id: order._id },
      { $set: { 'payment.transactionId': razorpayOrder.id } }
    );
    order = await ordersCollection.findOne({ _id: order._id });

    return res.status(200).json({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('[API] Error in /api/payments/create-order:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

