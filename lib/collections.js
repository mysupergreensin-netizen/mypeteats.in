import { getDb, ObjectId } from './db';

async function getCollection(name) {
  const db = await getDb();
  return db.collection(name);
}

export async function getUsersCollection() {
  return getCollection('users');
}

export async function getProductsCollection() {
  return getCollection('products');
}

export async function getOrdersCollection() {
  return getCollection('orders');
}

export { ObjectId };


