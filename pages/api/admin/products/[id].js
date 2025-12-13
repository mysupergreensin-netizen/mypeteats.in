import connectDB from '../../../../lib/db';
import Product from '../../../../models/Product';
import { requireAdmin } from '../../../../lib/_auth';
import { createRateLimiter } from '../../../../middleware/rateLimiter';
import {
  validateTitle,
  validateSKU,
  validatePrice,
  validateInventory,
  validateImageURLs,
  validateCategories,
  sanitizeDescription
} from '../../../../utils/validation';

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
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get single product
      const product = await Product.findById(id).lean();
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({ product });
    }

    if (req.method === 'PUT') {
      // Update product
      const {
        sku,
        title,
        slug,
        description,
        price_cents,
        currency,
        inventory,
        images,
        categories,
        attributes,
        published,
        metadata
      } = req.body;

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Validate fields if provided
      if (sku !== undefined) {
        const skuValidation = validateSKU(sku);
        if (!skuValidation.valid) {
          return res.status(400).json({ error: skuValidation.error });
        }
        
        // Check SKU uniqueness (excluding current product)
        const existingSKU = await Product.findOne({ 
          sku: skuValidation.value,
          _id: { $ne: id }
        });
        if (existingSKU) {
          return res.status(409).json({ error: 'SKU already exists' });
        }
        
        product.sku = skuValidation.value;
      }

      if (title !== undefined) {
        const titleValidation = validateTitle(title);
        if (!titleValidation.valid) {
          return res.status(400).json({ error: titleValidation.error });
        }
        product.title = titleValidation.value;
        // Slug will be auto-updated by pre-save hook
      }

      if (slug !== undefined && typeof slug === 'string') {
        product.slug = slug.trim().toLowerCase();
      }

      if (description !== undefined) {
        product.description = sanitizeDescription(description);
      }

      if (price_cents !== undefined) {
        const priceValidation = validatePrice(price_cents);
        if (!priceValidation.valid) {
          return res.status(400).json({ error: priceValidation.error });
        }
        product.price_cents = priceValidation.value;
      }

      if (currency !== undefined) {
        product.currency = (currency || 'INR').toUpperCase().substring(0, 3);
      }

      if (inventory !== undefined) {
        const inventoryValidation = validateInventory(inventory);
        if (!inventoryValidation.valid) {
          return res.status(400).json({ error: inventoryValidation.error });
        }
        product.inventory = inventoryValidation.value;
      }

      if (images !== undefined) {
        const imagesValidation = validateImageURLs(images);
        if (!imagesValidation.valid) {
          return res.status(400).json({ error: imagesValidation.error });
        }
        product.images = imagesValidation.value;
      }

      if (categories !== undefined) {
        const categoriesValidation = validateCategories(categories);
        if (!categoriesValidation.valid) {
          return res.status(400).json({ error: categoriesValidation.error });
        }
        product.categories = categoriesValidation.value;
      }

      if (attributes !== undefined) {
        product.attributes = attributes;
      }

      if (published !== undefined) {
        product.published = published === true;
      }

      if (metadata !== undefined) {
        product.metadata = metadata;
      }

      await product.save();

      return res.status(200).json({
        message: 'Product updated successfully',
        product: product.toObject()
      });
    }

    if (req.method === 'DELETE') {
      // Delete product
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({
        message: 'Product deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in /api/admin/products/[id]:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: `${field} already exists`,
        field 
      });
    }

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

