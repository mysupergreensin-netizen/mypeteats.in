import connectDB from '../../../lib/db';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Public endpoint - only return published products
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    const query = { published: true };
    if (category) {
      query.categories = { $in: [category] };
    }
    if (search && search.trim().length > 0) {
      // Search in title, description, and categories
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { categories: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const products = await Product.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v') // Exclude version key
      .lean();

    const total = await Product.countDocuments(query);

    // CORS headers for public API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    return res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[API] Error in /api/products:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

