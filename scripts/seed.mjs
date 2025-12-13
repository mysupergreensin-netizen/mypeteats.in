/**
 * Seed script to insert sample products
 * Also creates indexes if they don't exist
 */

import mongoose from 'mongoose';
import Product from '../models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/store';

const sampleProducts = [
  {
    sku: 'SKU-0001',
    title: 'Premium Dog Food - Chicken & Rice',
    description: 'High-quality dry dog food made with real chicken and brown rice. Perfect for adult dogs of all sizes. Rich in protein and essential nutrients.',
    price_cents: 249900, // ₹2,499.00
    currency: 'INR',
    inventory: 50,
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'
    ],
    categories: ['Dog Food', 'Dry Food', 'Premium'],
    attributes: {
      weight: '15kg',
      flavor: 'Chicken & Rice',
      age_group: 'Adult',
      breed_size: 'All Sizes'
    },
    published: true,
    metadata: {
      brand: 'MyPetEats',
      rating: 4.5,
      reviews: 120
    }
  },
  {
    sku: 'SKU-0002',
    title: 'Grain-Free Cat Food - Salmon',
    description: 'Natural grain-free cat food with fresh salmon. Ideal for cats with sensitive stomachs. Contains omega-3 fatty acids for healthy skin and coat.',
    price_cents: 189900, // ₹1,899.00
    currency: 'INR',
    inventory: 30,
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500'
    ],
    categories: ['Cat Food', 'Grain-Free', 'Wet Food'],
    attributes: {
      weight: '2kg',
      flavor: 'Salmon',
      age_group: 'Adult',
      special_diet: 'Grain-Free'
    },
    published: true,
    metadata: {
      brand: 'MyPetEats',
      rating: 4.8,
      reviews: 85
    }
  }
];

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected to MongoDB');

    // Create indexes first
    console.log('[SEED] Ensuring indexes exist...');
    try {
      await Product.collection.createIndex({ sku: 1 }, { unique: true });
      console.log('[SEED] ✓ Index on sku created');
    } catch (error) {
      if (error.code !== 86) console.log('[SEED] Index on sku already exists or error:', error.message);
    }

    try {
      await Product.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('[SEED] ✓ Index on slug created');
    } catch (error) {
      if (error.code !== 86) console.log('[SEED] Index on slug already exists or error:', error.message);
    }

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});

    // Insert sample products
    console.log('[SEED] Inserting sample products...');
    let inserted = 0;
    let skipped = 0;

    for (const productData of sampleProducts) {
      try {
        const existing = await Product.findOne({ sku: productData.sku });
        if (existing) {
          console.log(`[SEED] ⚠ Product with SKU ${productData.sku} already exists, skipping...`);
          skipped++;
          continue;
        }

        const product = new Product(productData);
        await product.save();
        console.log(`[SEED] ✓ Created product: ${product.title} (${product.sku})`);
        inserted++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`[SEED] ⚠ Product with SKU ${productData.sku} already exists (duplicate key), skipping...`);
          skipped++;
        } else {
          console.error(`[SEED] ✗ Error creating product ${productData.sku}:`, error.message);
        }
      }
    }

    console.log(`[SEED] ✓ Seeding complete! Inserted: ${inserted}, Skipped: ${skipped}`);
    
    await mongoose.connection.close();
    console.log('[SEED] Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
}

seed();

