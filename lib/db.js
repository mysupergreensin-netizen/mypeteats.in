import { MongoClient, ObjectId } from 'mongodb';
import { log, error as logError } from '../utils/logger';

// Conditionally import @vercel/functions for Vercel serverless optimization
// This package is optional and only needed when deployed on Vercel
let attachDatabasePool = null;
if (typeof require !== 'undefined') {
  try {
    const vercelFunctions = require('@vercel/functions');
    attachDatabasePool = vercelFunctions.attachDatabasePool;
  } catch (e) {
    // @vercel/functions not installed or not available (e.g., local development)
    // This is fine - the app will work without it, just without the optimization
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or Vercel environment variables');
}

/**
 * Use a global cached client across hot reloads in development and
 * across serverless function invocations in production.
 */
let cached = global._mongoClient;

if (!cached) {
  cached = global._mongoClient = { client: null, promise: null };
}

async function getMongoClient() {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    let connectionString = MONGODB_URI;

    // Ensure retryWrites and w=majority for MongoDB Atlas if not already present
    if (connectionString.includes('mongodb+srv://') && !connectionString.includes('retryWrites')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}retryWrites=true&w=majority`;
    }

    const client = new MongoClient(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds - increased for Vercel serverless cold starts
      socketTimeoutMS: 45000,
      family: 4,
    });

    cached.promise = client
      .connect()
      .then((connectedClient) => {
        log('[DB] Connected to MongoDB');

        // Attach Vercel Functions database pool management for serverless optimization
        if (attachDatabasePool) {
          try {
            attachDatabasePool(connectedClient);
            log('[DB] Vercel Functions database pool attached');
          } catch (poolError) {
            // Non-fatal: continue even if pool attachment fails
            logError('[DB] Failed to attach Vercel Functions pool (non-fatal):', poolError);
          }
        }

        return connectedClient;
      })
      .catch((err) => {
        logError('[DB] Connection error:', err);
        cached.promise = null; // Reset promise on error to allow retry
        throw err;
      });
  }

  try {
    cached.client = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
}

/**
 * Get a MongoDB database instance. If no database name is provided,
 * the default database from the connection string is used.
 */
async function getDb(dbName) {
  const client = await getMongoClient();
  return dbName ? client.db(dbName) : client.db();
}

/**
 * Backwards-compatible default export: many API routes call `await connectDB()`
 * just to ensure the connection exists.
 */
async function connectDB() {
  return getDb();
}

export { getMongoClient, getDb, ObjectId };
export default connectDB;

