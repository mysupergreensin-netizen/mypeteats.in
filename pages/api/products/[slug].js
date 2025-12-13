import connectDB from '../../../lib/db';
import Product from '../../../models/Product';
import { warn, error, apiLog } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Product slug is required' });
  }

  try {
    await connectDB();
    // Normalize slug - ensure it's lowercase and trimmed
    const normalizedSlug = slug.toLowerCase().trim();
    
    const product = await Product.findOne({ slug: normalizedSlug, published: true }).lean();

    if (!product) {
      // Log for debugging - check if product exists but isn't published
      const unpublishedProduct = await Product.findOne({ slug: normalizedSlug }).lean();
      if (unpublishedProduct) {
        warn(`[API] Product found but not published: ${normalizedSlug}`);
      }
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    apiLog('/api/products/[slug]', 'Error fetching product', { level: 'error', error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
}


