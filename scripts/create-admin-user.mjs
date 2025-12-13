import 'dotenv/config';
import connectDB from '../lib/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';
const email = process.argv[4] || `admin@mypeteats.com`;

async function createAdmin() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { name: username }
      ]
    });

    if (existingUser) {
      // Update existing user to admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        const passwordHash = await bcrypt.hash(password, 10);
        existingUser.passwordHash = passwordHash;
        if (!existingUser.name) {
          existingUser.name = username;
        }
        await existingUser.save();
        console.log('✅ Updated existing user to admin');
      } else {
        // Update password
        const passwordHash = await bcrypt.hash(password, 10);
        existingUser.passwordHash = passwordHash;
        if (!existingUser.name) {
          existingUser.name = username;
        }
        await existingUser.save();
        console.log('✅ Updated admin user password');
      }
      console.log('\n📋 Admin User Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Username: ${existingUser.name || username}`);
      console.log(`Email:    ${existingUser.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role:     ${existingUser.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        name: username,
        email: email.toLowerCase(),
        passwordHash,
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin User Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Username: ${user.name}`);
      console.log(`Email:    ${user.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role:     ${user.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();

