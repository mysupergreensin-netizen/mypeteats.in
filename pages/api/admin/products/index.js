import connectDB from '../../../../lib/db';
import { ObjectId } from 'mongodb';
import { getProductsCollection } from '../../../../lib/collections';
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

  try {
    await connectDB();
    const productsCollection = await getProductsCollection();

    if (req.method === 'GET') {
      // List products with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;

      const query = {};
      if (published !== undefined) {
        query.published = published;
      }

      const products = await productsCollection
        .find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const total = await productsCollection.countDocuments(query);

      return res.status(200).json({
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }

    if (req.method === 'POST') {
      // Create new product
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

      // Validate required fields
      const skuValidation = validateSKU(sku);
      if (!skuValidation.valid) {
        return res.status(400).json({ error: skuValidation.error });
      }

      const titleValidation = validateTitle(title);
      if (!titleValidation.valid) {
        return res.status(400).json({ error: titleValidation.error });
      }

      const priceValidation = validatePrice(price_cents);
      if (!priceValidation.valid) {
        return res.status(400).json({ error: priceValidation.error });
      }

      // Check SKU uniqueness
      const existingSKU = await productsCollection.findOne({
        sku: skuValidation.value,
      });
      if (existingSKU) {
        return res.status(409).json({ error: 'SKU already exists' });
      }

      // Validate optional fields
      const inventoryValidation = validateInventory(inventory);
      if (!inventoryValidation.valid) {
        return res.status(400).json({ error: inventoryValidation.error });
      }

      const imagesValidation = validateImageURLs(images || []);
      if (!imagesValidation.valid) {
        return res.status(400).json({ error: imagesValidation.error });
      }

      const categoriesValidation = validateCategories(categories || []);
      if (!categoriesValidation.valid) {
        return res.status(400).json({ error: categoriesValidation.error });
      }

      // Create product
      const productData = {
        sku: skuValidation.value,
        title: titleValidation.value,
        description: sanitizeDescription(description),
        price_cents: priceValidation.value,
        currency: (currency || 'INR').toUpperCase().substring(0, 3),
        inventory: inventoryValidation.value,
        images: imagesValidation.value,
        categories: categoriesValidation.value,
        attributes: attributes || {},
        published: published === true,
        metadata: metadata || {}
      };

      // Add slug if provided, otherwise it will be auto-generated
      if (slug && typeof slug === 'string') {
        productData.slug = slug.trim().toLowerCase();
      }

      const now = new Date();
      const insertResult = await productsCollection.insertOne({
        ...productData,
        created_at: now,
        updated_at: now,
      });

      const product = await productsCollection.findOne({
        _id: insertResult.insertedId,
      });

      return res.status(201).json({
        message: 'Product created successfully',
        product
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[API] Error in /api/admin/products:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: `${field} already exists`,
        field 
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default requireAdmin(handler);

