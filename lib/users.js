import { getUsersCollection } from './collections';
import { ObjectId } from './db';
import bcrypt from 'bcryptjs';

/**
 * Find user by ID
 */
export async function findUserById(id) {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  // Don't return passwordHash by default
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const usersCollection = await getUsersCollection();
  return await usersCollection.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Find user by email (including password hash - for auth)
 */
export async function findUserByEmailWithPassword(email) {
  const usersCollection = await getUsersCollection();
  return await usersCollection.findOne({ email: email.toLowerCase().trim() });
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  const usersCollection = await getUsersCollection();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    throw new Error('Invalid email address');
  }

  const now = new Date();
  const user = {
    name: userData.name?.trim() || '',
    email: userData.email.toLowerCase().trim(),
    passwordHash: userData.passwordHash,
    role: userData.role || 'customer',
    phone: userData.phone?.trim() || null,
    clubMember: userData.clubMember || false,
    created_at: now,
    updated_at: now,
  };

  // Validate name length
  if (user.name.length > 120) {
    throw new Error('Name must not exceed 120 characters');
  }

  // Validate role
  const validRoles = ['customer', 'staff', 'manager', 'admin', 'super_admin'];
  if (!validRoles.includes(user.role)) {
    throw new Error('Invalid role');
  }

  const result = await usersCollection.insertOne(user);
  const createdUser = await usersCollection.findOne({ _id: result.insertedId });
  
  // Don't return passwordHash
  const { passwordHash, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
}

/**
 * Update user by ID
 */
export async function updateUserById(id, updateData) {
  const usersCollection = await getUsersCollection();
  
  const update = {
    ...updateData,
    updated_at: new Date(),
  };

  // Remove fields that shouldn't be updated directly
  delete update._id;
  delete update.created_at;
  delete update.passwordHash; // Use changePassword for password updates

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  // Don't return passwordHash
  const { passwordHash, ...userWithoutPassword } = result;
  return userWithoutPassword;
}

/**
 * Update user password
 */
export async function updateUserPassword(id, newPasswordHash) {
  const usersCollection = await getUsersCollection();
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        passwordHash: newPasswordHash,
        updated_at: new Date(),
      }
    },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const { passwordHash, ...userWithoutPassword } = result;
  return userWithoutPassword;
}

/**
 * Compare password with hash
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Hash password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Find all users with pagination
 */
export async function findUsers(query = {}, options = {}) {
  const usersCollection = await getUsersCollection();
  const { page = 1, limit = 50, sort = { created_at: -1 } } = options;
  const skip = (page - 1) * limit;

  const users = await usersCollection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();

  // Remove passwordHash from all users
  return users.map(({ passwordHash, ...user }) => user);
}

/**
 * Count users
 */
export async function countUsers(query = {}) {
  const usersCollection = await getUsersCollection();
  return await usersCollection.countDocuments(query);
}

/**
 * Delete user by ID
 */
export async function deleteUserById(id) {
  const usersCollection = await getUsersCollection();
  const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

