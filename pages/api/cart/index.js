import connectDB from '../../../lib/db';
import { ObjectId } from 'mongodb';
import { getProductsCollection } from '../../../lib/collections';
import { getUserFromRequest } from '../auth/_utils';
import { carts, getCartId } from './_store';
import { warn, error, apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  try {
    await connectDB();
    const productsCollection = await getProductsCollection();
    
    // Get user if authenticated
    const user = await getUserFromRequest(req);
    if (user) {
      req.user = user;
    }

    const cartId = getCartId(req);

    if (req.method === 'GET') {
      // Get cart
      const cart = carts.get(cartId) || { items: [] };
      
      // Enrich cart items with product data
      const enrichedItems = await Promise.all(
        cart.items.map(async (item) => {
          try {
            const product = await productsCollection.findOne({
              _id: new ObjectId(item.productId),
            });
            if (!product) {
              return null; // Product no longer exists
            }
            return {
              productId: item.productId,
              quantity: item.quantity,
              product: {
                _id: product._id,
                title: product.title,
                slug: product.slug,
                price_cents: product.price_cents,
                currency: product.currency,
                images: product.images,
                sku: product.sku,
                inventory: product.inventory,
              },
            };
          } catch {
            return null;
          }
        })
      );

      const validItems = enrichedItems.filter(Boolean);
      
      // Update cart with valid items only
      if (validItems.length !== cart.items.length) {
        carts.set(cartId, {
          items: validItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }

      const subtotal = validItems.reduce(
        (sum, item) => sum + item.product.price_cents * item.quantity,
        0
      );

      return res.status(200).json({
        items: validItems,
        subtotal_cents: subtotal,
        total_cents: subtotal, // Shipping is free
        currency: 'INR',
      });
    }

    if (req.method === 'POST') {
      // Add item to cart
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

      // Verify product exists and is published
      let product;
      try {
        product = await productsCollection.findOne({
          _id: new ObjectId(productId),
        });
      } catch (findError) {
        apiLog('/api/cart', 'Error finding product', { level: 'error', error: findError.message });
        return res.status(400).json({ 
          error: 'Invalid product ID format',
          details: process.env.NODE_ENV === 'development' ? findError.message : undefined
        });
      }

      if (!product) {
        warn(`[API] Product not found: ${productId}`);
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!product.published) {
        return res.status(400).json({ error: 'Product is not available for purchase' });
      }

      // Check inventory - allow adding even if inventory is 0 (backorder scenario)
      // But warn if inventory is insufficient
      if (product.inventory !== undefined && product.inventory !== null && product.inventory < qty) {
        if (product.inventory === 0) {
          // Allow adding to cart even if out of stock (for backorder)
          warn(`[API] Product ${productId} is out of stock, but allowing cart addition`);
        } else {
          return res.status(400).json({
            error: `Only ${product.inventory} items available in stock`,
          });
        }
      }

      const cart = carts.get(cartId) || { items: [] };
      
      // Check if item already exists in cart
      const existingIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (existingIndex >= 0) {
        // Update quantity
        const newQuantity = cart.items[existingIndex].quantity + qty;
        // Check inventory only if it's defined and greater than 0
        if (product.inventory !== undefined && product.inventory !== null && product.inventory > 0 && product.inventory < newQuantity) {
          return res.status(400).json({
            error: `Only ${product.inventory} items available in stock`,
          });
        }
        cart.items[existingIndex].quantity = newQuantity;
      } else {
        // Add new item - store productId as string for consistency
        cart.items.push({ productId: String(productId), quantity: qty });
      }

      carts.set(cartId, cart);

      return res.status(200).json({
        message: 'Item added to cart',
        cart: {
          items: cart.items,
        },
      });
    }

    if (req.method === 'PUT') {
      // Update cart item quantity
      const { productId, quantity } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const qty = Math.max(0, Math.floor(Number(quantity)) || 0);

      const cart = carts.get(cartId) || { items: [] };
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex < 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      if (qty === 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Verify product still exists and check inventory
        let product;
        try {
          product = await productsCollection.findOne({
            _id: new ObjectId(productId),
          });
        } catch (findError) {
          return res.status(400).json({ error: 'Invalid product ID format' });
        }
        if (!product || !product.published) {
          return res.status(400).json({ error: 'Product is not available' });
        }
        if (product.inventory < qty) {
          return res.status(400).json({
            error: `Only ${product.inventory} items available in stock`,
          });
        }
        cart.items[itemIndex].quantity = qty;
      }

      carts.set(cartId, cart);

      return res.status(200).json({
        message: 'Cart updated',
        cart: {
          items: cart.items,
        },
      });
    }

    if (req.method === 'DELETE') {
      // Clear cart
      carts.delete(cartId);
      return res.status(200).json({ message: 'Cart cleared' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    apiLog('/api/cart', 'Error processing cart request', { level: 'error', error: error.message });
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

