import connectDB from '../../lib/db';
import Order from '../../models/Order';
import Product from '../../models/Product';
import { getUserFromRequest } from './auth/_utils';

// In-memory cart storage (same as cart API)
const carts = new Map();

function getCartId(req) {
  const user = req.user;
  if (user) {
    return `user:${user.id}`;
  }
  return `session:${req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous'}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

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

    // Get shipping and payment info from request body
    const {
      shippingAddress,
      paymentMethod = 'card',
    } = req.body;

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
    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

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

    // Create order
    const order = new Order({
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
        method: paymentMethod,
        status: 'pending',
      },
    });

    await order.save();

    // Update inventory
    for (const cartItem of cart.items) {
      const product = products.find(
        (p) => p._id.toString() === cartItem.productId.toString()
      );
      if (product) {
        await Product.findByIdAndUpdate(product._id, {
          $inc: { inventory: -cartItem.quantity },
        });
      }
    }

    // Clear cart
    carts.delete(cartId);

    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        orderNumber: order.orderNumber,
        id: order._id.toString(),
        total_cents: order.total_cents,
        currency: order.currency,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('[API] Error in /api/checkout:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

