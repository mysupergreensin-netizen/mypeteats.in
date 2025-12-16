# Fix MongoDB Connection and Index Issues

## Issues Fixed

### 1. Duplicate Schema Index Warnings
**Error:**
```
[MONGOOSE] Warning: Duplicate schema index on {"sku":1} found.
[MONGOOSE] Warning: Duplicate schema index on {"slug":1} found.
```

**Cause:** The Product model had both:
- `unique: true` in the schema definition (which automatically creates an index)
- Explicit `productSchema.index({ sku: 1 }, { unique: true })` calls

**Fix:** Removed the explicit index calls for `sku` and `slug` since `unique: true` already creates the indexes automatically.

**File Changed:** `models/Product.js`

### 2. MongoDB Connection Timeout
**Error:**
```
MongooseError: Operation `products.find()` buffering timed out after 10000ms
```

**Cause:** The application uses both:
- Native MongoDB driver (for collections via `lib/collections.js`)
- Mongoose models (Product, User, Order)

However, `lib/db.js` was only connecting the native driver, not Mongoose. When API routes used Mongoose models, Mongoose wasn't connected, causing timeouts.

**Fix:** 
- Added Mongoose connection support to `lib/db.js`
- Updated `connectDB()` to connect both the native driver and Mongoose
- Increased `serverSelectionTimeoutMS` from 5s to 10s for better Vercel serverless compatibility

**Files Changed:** `lib/db.js`

## Changes Made

### `models/Product.js`
- Commented out duplicate index definitions for `sku` and `slug`
- Kept `unique: true` in schema definitions (which automatically creates indexes)
- Kept other indexes (`published`, `created_at`)

### `lib/db.js`
- Added `mongoose` import
- Added `connectMongoose()` function to handle Mongoose connections
- Updated `connectDB()` to connect both native driver and Mongoose
- Increased `serverSelectionTimeoutMS` from 5000ms to 10000ms for both connections
- Added global caching for Mongoose connection state

## Testing

After deploying these fixes:

1. **Index Warnings Should Be Gone:**
   - No more duplicate index warnings in logs
   - Indexes still work correctly (unique constraints enforced)

2. **MongoDB Connection Should Work:**
   - Routes using Mongoose models (User, Product, Order) should connect successfully
   - Routes using native collections should continue working
   - No more timeout errors

## Deployment Notes

1. These changes are backward compatible
2. No database migration needed
3. The fixes work for both Vercel and Docker deployments
4. Mongoose connection is cached globally (same as native driver) for performance

## Verification

After deployment, check:
- ✅ No duplicate index warnings in logs
- ✅ API routes using Mongoose models work (e.g., `/api/auth/register`, `/api/orders`)
- ✅ API routes using collections work (e.g., `/api/products`, `/api/admin/products`)
- ✅ No MongoDB connection timeout errors

