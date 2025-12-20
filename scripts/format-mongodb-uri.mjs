/**
 * Helper script to format MongoDB connection string for Vercel
 * Usage: node scripts/format-mongodb-uri.mjs <password>
 */

import { config } from 'dotenv';

// Load environment variables
config();

const password = process.argv[2] || process.env.MONGODB_PASSWORD;

if (!password) {
  console.error('❌ Error: MongoDB password is required');
  console.log('\nUsage:');
  console.log('  node scripts/format-mongodb-uri.mjs <password>');
  console.log('\nOr set MONGODB_PASSWORD in .env file');
  process.exit(1);
}

// URL encode the password (handles special characters)
const encodedPassword = encodeURIComponent(password);

// Your MongoDB Atlas connection details
const username = 'Vercel-Admin-Vbt';
const cluster = 'vbt.htnlvqx.mongodb.net';
const database = 'store';
const appName = 'Vbt';

// Format the connection string
const connectionString = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority&appName=${appName}`;

console.log('\n✅ Formatted MongoDB Connection String:\n');
console.log(connectionString);
console.log('\n📋 Copy this and add it to Vercel as MONGODB_URI environment variable\n');
console.log('Steps:');
console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('2. Add new variable:');
console.log('   Key: MONGODB_URI');
console.log(`   Value: ${connectionString}`);
console.log('   Environment: Production, Preview, Development');
console.log('3. Click Save');
console.log('4. Redeploy your project\n');
