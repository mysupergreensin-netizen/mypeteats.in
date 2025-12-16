/**
 * Initialize MongoDB indexes
 * Run this before the app starts to ensure indexes exist
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/store';

async function initIndexes() {
  let client;
  try {
    console.log('[INIT] Connecting to MongoDB...');
    
    let connectionString = MONGODB_URI;
    // Ensure retryWrites and w=majority for MongoDB Atlas if not already present
    if (connectionString.includes('mongodb+srv://') && !connectionString.includes('retryWrites')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}retryWrites=true&w=majority`;
    }

    client = new MongoClient(connectionString, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('[INIT] Connected to MongoDB');

    const db = client.db();
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');

    console.log('[INIT] Creating indexes...');
    
    // Product indexes
    // Create unique index on SKU
    try {
      await productsCollection.createIndex({ sku: 1 }, { unique: true });
      console.log('[INIT] ✓ Created unique index on products.sku');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on products.sku already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on products.sku already exists');
      }
    }

    // Create unique index on slug
    try {
      await productsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('[INIT] ✓ Created unique index on products.slug');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on products.slug already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on products.slug already exists');
      }
    }

    // Create index on published
    try {
      await productsCollection.createIndex({ published: 1 });
      console.log('[INIT] ✓ Created index on products.published');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on products.published already exists');
      }
    }

    // Create index on created_at
    try {
      await productsCollection.createIndex({ created_at: -1 });
      console.log('[INIT] ✓ Created index on products.created_at');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on products.created_at already exists');
      }
    }

    // User indexes
    console.log('[INIT] Creating User indexes...');
    
    // Create unique index on email
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('[INIT] ✓ Created unique index on users.email');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on users.email already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on users.email already exists');
      }
    }

    // Create index on role
    try {
      await usersCollection.createIndex({ role: 1 });
      console.log('[INIT] ✓ Created index on users.role');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on users.role already exists');
      }
    }

    // Create index on clubMember
    try {
      await usersCollection.createIndex({ clubMember: 1 });
      console.log('[INIT] ✓ Created index on users.clubMember');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on users.clubMember already exists');
      }
    }

    // Order indexes
    console.log('[INIT] Creating Order indexes...');
    
    // Create unique index on orderNumber
    try {
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      console.log('[INIT] ✓ Created unique index on orders.orderNumber');
    } catch (error) {
      if (error.code === 85) {
        console.log('[INIT] ⚠ Index on orders.orderNumber already exists with different options');
      } else if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on orders.orderNumber already exists');
      }
    }

    // Create index on user and created_at
    try {
      await ordersCollection.createIndex({ user: 1, created_at: -1 });
      console.log('[INIT] ✓ Created index on orders.user and created_at');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on orders.user and created_at already exists');
      }
    }

    // Create index on status and created_at
    try {
      await ordersCollection.createIndex({ status: 1, created_at: -1 });
      console.log('[INIT] ✓ Created index on orders.status and created_at');
    } catch (error) {
      if (error.code !== 86) {
        throw error;
      } else {
        console.log('[INIT] ✓ Index on orders.status and created_at already exists');
      }
    }

    console.log('[INIT] ✓ All indexes created successfully');
    
    await client.close();
    console.log('[INIT] Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[INIT] Error:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

initIndexes();
