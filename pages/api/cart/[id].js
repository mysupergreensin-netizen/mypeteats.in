import connectDB from '../../../lib/db';
import { getUserFromRequest } from '../auth/_utils';
import { carts, getCartId } from './_store';
import { apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  try {
    await connectDB();
    
    // Get user if authenticated
    const user = await getUserFromRequest(req);
    if (user) {
      req.user = user;
    }

    const cartId = getCartId(req);
    const { id: productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (req.method === 'DELETE') {
      // Remove item from cart
      const cart = carts.get(cartId);
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex < 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      cart.items.splice(itemIndex, 1);
      carts.set(cartId, cart);

      return res.status(200).json({
        message: 'Item removed from cart',
        cart: {
          items: cart.items,
        },
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    apiLog('/api/cart/[id]', 'Error processing cart item request', { level: 'error', error: error.message });
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

