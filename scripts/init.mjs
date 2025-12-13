/**
 * Initialize MongoDB indexes
 * Run this before the app starts to ensure indexes exist
 */

import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/store';

async function initIndexes() {
  try {
    console.log('[INIT] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[INIT] Connected to MongoDB');

    console.log('[INIT] Creating indexes...');
    
    // Ensure Product model is registered
    if (!mongoose.models.Product) {
      mongoose.model('Product', Product.schema);
    }

    // Ensure User model is registered
    if (!mongoose.models.User) {
      mongoose.model('User', User.schema);
    }

    // Create indexes
    const ProductModel = mongoose.model('Product');
    const UserModel = mongoose.model('User');
    
    // Create unique index on SKU
    try {
      await ProductModel.collection.createIndex({ sku: 1 }, { unique: true });
      console.log('[INIT] ✓ Created unique index on sku');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on sku already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on sku already exists');
      }
    }

    // Create unique index on slug
    try {
      await ProductModel.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('[INIT] ✓ Created unique index on slug');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on slug already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on slug already exists');
      }
    }

    // Create index on published
    try {
      await ProductModel.collection.createIndex({ published: 1 });
      console.log('[INIT] ✓ Created index on published');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on published already exists');
      }
    }

    // Create index on created_at
    try {
      await ProductModel.collection.createIndex({ created_at: -1 });
      console.log('[INIT] ✓ Created index on created_at');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on created_at already exists');
      }
    }

    // User model indexes
    console.log('[INIT] Creating User model indexes...');
    
    // Create unique index on email
    try {
      await UserModel.collection.createIndex({ email: 1 }, { unique: true });
      console.log('[INIT] ✓ Created unique index on email');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on email already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on email already exists');
      }
    }

    // Create index on role
    try {
      await UserModel.collection.createIndex({ role: 1 });
      console.log('[INIT] ✓ Created index on role');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on role already exists');
      }
    }

    // Create index on clubMember
    try {
      await UserModel.collection.createIndex({ clubMember: 1 });
      console.log('[INIT] ✓ Created index on clubMember');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on clubMember already exists');
      }
    }

    console.log('[INIT] ✓ All indexes created successfully');
    
    await mongoose.connection.close();
    console.log('[INIT] Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[INIT] Error:', error);
    process.exit(1);
  }
}

initIndexes();

