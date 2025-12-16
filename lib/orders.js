import { getOrdersCollection, ObjectId } from './collections';

/**
 * Generate order number
 */
async function generateOrderNumber() {
  const ordersCollection = await getOrdersCollection();
  const count = await ordersCollection.countDocuments();
  return `ORD-${Date.now()}-${String(count + 1).padStart(6, '0')}`;
}

/**
 * Create a new order
 */
export async function createOrder(orderData) {
  const ordersCollection = await getOrdersCollection();
  
  const orderNumber = await generateOrderNumber();
  const now = new Date();

  const order = {
    orderNumber,
    user: new ObjectId(orderData.user),
    items: orderData.items.map(item => ({
      product: item.product ? new ObjectId(item.product) : null,
      title: item.title,
      sku: item.sku,
      price_cents: item.price_cents,
      quantity: item.quantity,
      image: item.image || null,
    })),
    subtotal_cents: orderData.subtotal_cents,
    shipping_cents: orderData.shipping_cents || 0,
    total_cents: orderData.total_cents,
    currency: (orderData.currency || 'INR').toUpperCase().substring(0, 3),
    status: orderData.status || 'pending',
    shippingAddress: {
      firstName: orderData.shippingAddress.firstName?.trim(),
      lastName: orderData.shippingAddress.lastName?.trim(),
      email: orderData.shippingAddress.email?.toLowerCase().trim(),
      phone: orderData.shippingAddress.phone?.trim(),
      address: orderData.shippingAddress.address?.trim(),
      city: orderData.shippingAddress.city?.trim(),
      postalCode: orderData.shippingAddress.postalCode?.trim(),
      instructions: orderData.shippingAddress.instructions?.trim() || null,
    },
    payment: {
      method: orderData.payment?.method || 'card',
      status: orderData.payment?.status || 'pending',
      transactionId: orderData.payment?.transactionId || null,
    },
    metadata: orderData.metadata || {},
    created_at: now,
    updated_at: now,
  };

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(order.status)) {
    throw new Error('Invalid order status');
  }

  // Validate payment method
  const validPaymentMethods = ['card', 'cash_on_delivery', 'upi', 'netbanking', 'razorpay'];
  if (!validPaymentMethods.includes(order.payment.method)) {
    throw new Error('Invalid payment method');
  }

  // Validate payment status
  const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validPaymentStatuses.includes(order.payment.status)) {
    throw new Error('Invalid payment status');
  }

  const result = await ordersCollection.insertOne(order);
  return await ordersCollection.findOne({ _id: result.insertedId });
}

/**
 * Find order by ID
 */
export async function findOrderById(id) {
  const ordersCollection = await getOrdersCollection();
  return await ordersCollection.findOne({ _id: new ObjectId(id) });
}

/**
 * Find order by order number
 */
export async function findOrderByOrderNumber(orderNumber) {
  const ordersCollection = await getOrdersCollection();
  return await ordersCollection.findOne({ orderNumber });
}

/**
 * Find orders by user ID
 */
export async function findOrdersByUserId(userId, options = {}) {
  const ordersCollection = await getOrdersCollection();
  const { page = 1, limit = 20, sort = { created_at: -1 } } = options;
  const skip = (page - 1) * limit;

  return await ordersCollection
    .find({ user: new ObjectId(userId) })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Find all orders with query
 */
export async function findOrders(query = {}, options = {}) {
  const ordersCollection = await getOrdersCollection();
  const { page = 1, limit = 50, sort = { created_at: -1 } } = options;
  const skip = (page - 1) * limit;

  // Convert user ID string to ObjectId if present
  if (query.user && typeof query.user === 'string') {
    query.user = new ObjectId(query.user);
  }

  return await ordersCollection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
}

/**
 * Count orders
 */
export async function countOrders(query = {}) {
  const ordersCollection = await getOrdersCollection();
  
  // Convert user ID string to ObjectId if present
  if (query.user && typeof query.user === 'string') {
    query.user = new ObjectId(query.user);
  }

  return await ordersCollection.countDocuments(query);
}

/**
 * Update order by ID
 */
export async function updateOrderById(id, updateData) {
  const ordersCollection = await getOrdersCollection();
  
  const update = {
    ...updateData,
    updated_at: new Date(),
  };

  // Remove fields that shouldn't be updated directly
  delete update._id;
  delete update.created_at;
  delete update.orderNumber;

  // Convert user ID to ObjectId if present
  if (update.user && typeof update.user === 'string') {
    update.user = new ObjectId(update.user);
  }

  // Convert product IDs in items if present
  if (update.items && Array.isArray(update.items)) {
    update.items = update.items.map(item => ({
      ...item,
      product: item.product ? new ObjectId(item.product) : null,
    }));
  }

  // Handle nested fields like payment.status and payment.method
  const setUpdate = {};
  for (const [key, value] of Object.entries(update)) {
    if (key.includes('.')) {
      // Nested field
      setUpdate[key] = value;
    } else {
      setUpdate[key] = value;
    }
  }

  const result = await ordersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: setUpdate },
    { returnDocument: 'after' }
  );

  return result;
}

/**
 * Delete order by ID
 */
export async function deleteOrderById(id) {
  const ordersCollection = await getOrdersCollection();
  const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

