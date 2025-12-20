/**
 * Rebuild database script
 * Drops all collections and recreates indexes
 * Optionally seeds with initial data
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables from .env file
config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/store';
const DB_NAME = process.env.MONGODB_DB || (() => {
  // Extract DB name from URI if present
  const match = MONGODB_URI.match(/\/([^/?]+)(\?|$)/);
  return match ? match[1] : 'store';
})();

const collections = ['products', 'users', 'orders', 'carts'];

async function rebuildDatabase() {
  let client;
  try {
    console.log('[REBUILD] Connecting to MongoDB...');
    
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
    console.log('[REBUILD] Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    console.log(`[REBUILD] Using database: ${DB_NAME}`);

    // Drop all collections
    console.log('[REBUILD] Dropping collections...');
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const exists = await collection.countDocuments({}, { limit: 1 }).catch(() => null);
        if (exists !== null) {
          await collection.drop();
          console.log(`[REBUILD] ✓ Dropped collection: ${collectionName}`);
        } else {
          console.log(`[REBUILD] ⚠ Collection ${collectionName} does not exist, skipping`);
        }
      } catch (error) {
        if (error.code === 26) {
          console.log(`[REBUILD] ⚠ Collection ${collectionName} does not exist, skipping`);
        } else {
          console.error(`[REBUILD] ✗ Error dropping collection ${collectionName}:`, error.message);
        }
      }
    }

    // Recreate indexes
    console.log('[REBUILD] Recreating indexes...');
    
    const productsCollection = db.collection('products');
    const usersCollection = db.collection('users');
    const ordersCollection = db.collection('orders');

    // Product indexes
    try {
      await productsCollection.createIndex({ sku: 1 }, { unique: true });
      console.log('[REBUILD] ✓ Created unique index on products.sku');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on products.sku:', error.message);
    }

    try {
      await productsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
      console.log('[REBUILD] ✓ Created unique index on products.slug');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on products.slug:', error.message);
    }

    try {
      await productsCollection.createIndex({ published: 1 });
      console.log('[REBUILD] ✓ Created index on products.published');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on products.published:', error.message);
    }

    try {
      await productsCollection.createIndex({ created_at: -1 });
      console.log('[REBUILD] ✓ Created index on products.created_at');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on products.created_at:', error.message);
    }

    // User indexes
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('[REBUILD] ✓ Created unique index on users.email');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on users.email:', error.message);
    }

    try {
      await usersCollection.createIndex({ role: 1 });
      console.log('[REBUILD] ✓ Created index on users.role');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on users.role:', error.message);
    }

    try {
      await usersCollection.createIndex({ clubMember: 1 });
      console.log('[REBUILD] ✓ Created index on users.clubMember');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on users.clubMember:', error.message);
    }

    // Order indexes
    try {
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      console.log('[REBUILD] ✓ Created unique index on orders.orderNumber');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on orders.orderNumber:', error.message);
    }

    try {
      await ordersCollection.createIndex({ user: 1, created_at: -1 });
      console.log('[REBUILD] ✓ Created index on orders.user and created_at');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on orders.user and created_at:', error.message);
    }

    try {
      await ordersCollection.createIndex({ status: 1, created_at: -1 });
      console.log('[REBUILD] ✓ Created index on orders.status and created_at');
    } catch (error) {
      console.error('[REBUILD] ✗ Error creating index on orders.status and created_at:', error.message);
    }

    console.log('[REBUILD] ✓ Database rebuild complete!');
    console.log('[REBUILD] You can now run "npm run seed" to populate with sample data');
    
    await client.close();
    console.log('[REBUILD] Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[REBUILD] Error:', error);
    if (client) {
      await client.close();
    }
    process.exit(1);
  }
}

rebuildDatabase();
