import 'dotenv/config';
import connectDB from '../lib/db.js';
import { createUser, findUserByEmail, updateUserById, updateUserPassword, hashPassword } from '../lib/users.js';
import { getUsersCollection } from '../lib/collections.js';

const username = process.argv[2] || 'admin';
const password = process.argv[3] || 'admin123';
const email = process.argv[4] || `admin@mypeteats.com`;

async function createAdmin() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if user already exists by email
    let existingUser = await findUserByEmail(email);
    
    // Also check by name if not found by email
    if (!existingUser) {
      const usersCollection = await getUsersCollection();
      existingUser = await usersCollection.findOne({ name: username });
    }

    if (existingUser) {
      // Update existing user to admin
      const passwordHash = await hashPassword(password);
      const updateData = {
        role: 'admin',
        passwordHash,
      };
      if (!existingUser.name) {
        updateData.name = username;
      }

      await updateUserPassword(existingUser._id.toString(), passwordHash);
      const updated = await updateUserById(existingUser._id.toString(), {
        role: 'admin',
        name: existingUser.name || username,
      });

      console.log('✅ Updated existing user to admin');
      console.log('\n📋 Admin User Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Username: ${updated.name || username}`);
      console.log(`Email:    ${updated.email}`);
      console.log(`Password: ${password}`);
      console.log(`Role:     ${updated.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      // Create new admin user
      const passwordHash = await hashPassword(password);
      
      const user = await createUser({
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
