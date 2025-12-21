/**
 * Setup script to create 2 admin users for production
 * Usage: node scripts/setup-admin-users.mjs
 */

import 'dotenv/config';
import connectDB from '../lib/db.js';
import { createUser, findUserByEmail, hashPassword } from '../lib/users.js';

// Generate secure random password
function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Admin user configurations
const adminUsers = [
  {
    name: 'Admin User 1',
    email: 'admin1@mypeteats.in',
    password: generatePassword(16),
  },
  {
    name: 'Admin User 2',
    email: 'admin2@mypeteats.in',
    password: generatePassword(16),
  },
];

async function setupAdminUsers() {
  try {
    console.log('🔐 Setting up admin users...\n');
    await connectDB();
    console.log('✅ Connected to database\n');

    const createdUsers = [];

    for (const userConfig of adminUsers) {
      try {
        // Check if user already exists
        const existing = await findUserByEmail(userConfig.email);
        
        if (existing) {
          console.log(`⚠️  User ${userConfig.email} already exists, skipping...`);
          continue;
        }

        // Create new admin user
        const passwordHash = await hashPassword(userConfig.password);
        const user = await createUser({
          name: userConfig.name,
          email: userConfig.email.toLowerCase(),
          passwordHash,
          role: 'admin',
        });

        createdUsers.push({
          name: user.name,
          email: user.email,
          password: userConfig.password,
          role: user.role,
        });

        console.log(`✅ Created admin user: ${user.email}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userConfig.email}:`, error.message);
      }
    }

    if (createdUsers.length > 0) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 ADMIN USER CREDENTIALS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      createdUsers.forEach((user, index) => {
        console.log(`Admin User ${index + 1}:`);
        console.log(`  Name:     ${user.name}`);
        console.log(`  Email:    ${user.email}`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Role:     ${user.role}`);
        console.log('');
      });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  IMPORTANT: Save these credentials securely!');
      console.log('    They will not be shown again.\n');
    } else {
      console.log('\n⚠️  No new users were created. All users may already exist.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin users:', error);
    process.exit(1);
  }
}

setupAdminUsers();
