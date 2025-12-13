#!/usr/bin/env node

/**
 * Script to create .env.example file
 * This file documents all required environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envExampleContent = `# MyPetEats Environment Variables
# Copy this file to .env and fill in your actual values
# DO NOT commit .env to version control

# MongoDB Connection
# Format: mongodb://[host]:[port]/[database]
# For Docker: mongodb://mongo:27017/store
# For local: mongodb://localhost:27017/store
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/store
MONGODB_URI=mongodb://mongo:27017/store

# Admin Authentication Token (Required for admin panel access)
# Generate a strong random token: openssl rand -hex 32
# This is used for legacy token-based admin authentication
# Optional if using user-based admin authentication
APP_ADMIN_TOKEN=your-secure-admin-token-here-change-in-production

# JWT Secret for User Authentication (REQUIRED)
# Generate a strong random string: openssl rand -hex 32
# This is used to sign and verify JWT tokens for user sessions
# MUST be set in production
JWT_SECRET=your-strong-jwt-secret-here-change-in-production

# Razorpay Payment Gateway Configuration
# Get these from: https://dashboard.razorpay.com/app/keys
# Test keys start with: rzp_test_
# Live keys start with: rzp_live_
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Server Configuration
# Port the application will listen on
PORT=9000

# Environment
# Set to 'production' for production deployments
# Set to 'development' for local development
NODE_ENV=production
`;

const envExamplePath = path.join(rootDir, '.env.example');

try {
  fs.writeFileSync(envExamplePath, envExampleContent, 'utf8');
  console.log('✅ Created .env.example file successfully');
  console.log(`   Location: ${envExamplePath}`);
} catch (error) {
  console.error('❌ Error creating .env.example file:', error.message);
  process.exit(1);
}

