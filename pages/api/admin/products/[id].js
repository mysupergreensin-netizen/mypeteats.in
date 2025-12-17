import connectDB from '../../../../lib/db';
import { ObjectId } from 'mongodb';
import { getProductsCollection } from '../../../../lib/collections';
import { requireAdmin } from '../../../../lib/_auth';
import { createRateLimiter } from '../../../../middleware/rateLimiter';
import { slugify } from '../../../../utils/slugify';
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

async function generateUniqueSlug(productsCollection, baseSlug, excludeId) {
  let candidate = baseSlug;
  let suffix = 2;

  while (candidate) {
    const exists = await productsCollection.findOne(
      { slug: candidate, _id: { $ne: excludeId } },
      { projection: { _id: 1 } }
    );
    if (!exists) return candidate;
    candidate = `${baseSlug}-${suffix++}`;
    if (suffix > 50) break;
  }

  return `${baseSlug}-${Date.now()}`;
}

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
    const productsCollection = await getProductsCollection();

    if (req.method === 'GET') {
      // Get single product
      let product;
      try {
        product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
      } catch {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      
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

      let product;
      try {
        product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
      } catch {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }

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
        const existingSKU = await productsCollection.findOne({
          sku: skuValidation.value,
          _id: { $ne: new ObjectId(id) },
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
        // If slug isn't explicitly provided, regenerate from title
        if (slug === undefined) {
          const baseSlug = slugify(product.title);
          if (baseSlug) {
            product.slug = await generateUniqueSlug(productsCollection, baseSlug, new ObjectId(id));
          }
        }
      }

      if (slug !== undefined && typeof slug === 'string') {
        const baseSlug = slugify(slug);
        if (baseSlug) {
          product.slug = await generateUniqueSlug(productsCollection, baseSlug, new ObjectId(id));
        }
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

      const updateResult = await productsCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...product,
            updated_at: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      const updatedProduct = updateResult.value;

      return res.status(200).json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    }

    if (req.method === 'DELETE') {
      // Delete product
      const deleteResult = await productsCollection.findOneAndDelete({
        _id: new ObjectId(id),
      });

      if (!deleteResult.value) {
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

