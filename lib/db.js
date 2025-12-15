import mongoose from 'mongoose';
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
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless function invocations in production.
 * This prevents connections growing exponentially during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection if not already in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering for serverless
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Add retryWrites and w=majority for MongoDB Atlas if not already in URI
    let connectionString = MONGODB_URI;
    if (connectionString.includes('mongodb+srv://') && !connectionString.includes('retryWrites')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      connectionString = `${connectionString}${separator}retryWrites=true&w=majority`;
    }

    cached.promise = mongoose.connect(connectionString, opts).then((mongooseConnection) => {
      log('[DB] Connected to MongoDB');
      
      // Attach Vercel Functions database pool management for serverless optimization
      // This ensures connections are properly managed when functions suspend and resume
      if (attachDatabasePool) {
        try {
          // Get the underlying MongoDB client from Mongoose connection
          const mongoClient = mongooseConnection.connection.getClient();
          attachDatabasePool(mongoClient);
          log('[DB] Vercel Functions database pool attached');
        } catch (poolError) {
          // Non-fatal: continue even if pool attachment fails
          logError('[DB] Failed to attach Vercel Functions pool (non-fatal):', poolError);
        }
      }
      
      return mongooseConnection;
    }).catch((err) => {
      logError('[DB] Connection error:', err);
      cached.promise = null; // Reset promise on error to allow retry
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

