# MyPetEats - Docker-based Ecommerce Platform

A complete Next.js 14 + MongoDB ecommerce platform running entirely in Docker containers. No Node.js installation required on your machine.

## Features

- ✅ **Full Docker Setup** - Everything runs in containers
- ✅ **Next.js 14** with Pages Router
- ✅ **MongoDB** integration with Mongoose
- ✅ **User Authentication** - JWT-based login/register system
- ✅ **Admin Panel** - Token-based and user-based authentication for product management
- ✅ **Shopping Cart** - Session-based cart with inventory management
- ✅ **Order Management** - Complete order processing and tracking
- ✅ **Club Membership** - User membership system with exclusive benefits
- ✅ **Extended Product Schema** - SKU, inventory, categories, attributes, metadata
- ✅ **Production Ready** - Multi-stage builds, health checks, rate limiting
- ✅ **Security** - Input validation, XSS protection, brute-force protection
- ✅ **Error Handling** - Custom error pages and error boundaries
- ✅ **Hot Reload** - Development mode with live code updates

## Project Structure

```
mypeteats/
├── Dockerfile                 # Production multi-stage build
├── Dockerfile.dev            # Development build
├── docker-compose.yml         # Production compose
├── docker-compose.dev.yml     # Development overrides
├── .env.example               # Environment variables template
├── package.json
├── next.config.js
├── lib/
│   ├── db.js                  # MongoDB connection
│   └── _auth.js               # Admin authentication
├── models/
│   ├── Product.js             # Product model
│   ├── User.js                # User model
│   └── Order.js               # Order model
├── middleware/
│   └── rateLimiter.js         # Rate limiting
├── utils/
│   └── validation.js          # Input validation
├── components/
│   ├── auth/                  # Auth components
│   ├── layout/                # Layout components
│   ├── ui/                     # UI components
│   └── ErrorBoundary.jsx      # Error boundary
├── pages/
│   ├── index.js               # Homepage
│   ├── admin/                 # Admin pages
│   ├── auth/                   # Auth pages
│   ├── cart.js                 # Shopping cart
│   ├── checkout.js             # Checkout page
│   ├── products/               # Product pages
│   ├── profile/                # User profile
│   ├── club/                   # Club membership
│   ├── 404.js                  # 404 error page
│   ├── 500.js                  # 500 error page
│   ├── _error.js               # Error handler
│   └── api/
│       ├── health.js           # Health check
│       ├── auth/                # Authentication API
│       ├── products/            # Public product API
│       ├── cart/                # Cart API
│       ├── checkout.js          # Checkout API
│       ├── orders/              # Orders API
│       ├── club/                 # Club API
│       └── admin/products/      # Admin CRUD API
└── scripts/
    ├── init.mjs                # Create indexes
    └── seed.mjs                # Seed sample products
```

## Quick Start

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://mongo:27017/store

# Admin Authentication Token (generate a strong random token)
APP_ADMIN_TOKEN=your-secure-admin-token-here-change-in-production

# JWT Secret for user authentication (required)
JWT_SECRET=your-strong-jwt-secret-here-change-in-production

# Razorpay Payment Gateway (required for payments)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Server Port
PORT=9000

# Environment
NODE_ENV=production
```

**Important:** 
- Generate a strong random token for `APP_ADMIN_TOKEN`: `openssl rand -hex 32`
- Generate a strong random string for `JWT_SECRET`: `openssl rand -hex 32`
- Get Razorpay credentials from: https://dashboard.razorpay.com/app/keys
- See `.env.example` for a complete template

### 2. Build and Run (Production)

```bash
# Build the images (includes Razorpay package)
docker compose build

# Start services
docker compose up -d

# Check logs
docker compose logs -f app

# Stop services
docker compose down
```

**Note:** After adding Razorpay credentials, rebuild images:
```bash
docker compose build --no-cache
docker compose up -d
```

The application will be available at: **http://localhost:9000**

### 3. Development Mode (Hot Reload)

```bash
# Start in development mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or in detached mode
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 4. Initialize Database

```bash
# Create indexes (includes User and Product model indexes)
docker compose run --rm app node scripts/init.mjs

# Seed sample products
docker compose run --rm app node scripts/seed.mjs
```

### 5. Update Docker with Razorpay (After Adding Credentials)

If you've added Razorpay credentials to `.env`, rebuild the containers:

```bash
# Rebuild to include Razorpay package
docker compose build --no-cache

# Restart services
docker compose up -d

# Verify Razorpay is installed
docker compose exec app npm list razorpay
```

Or use the update script:
```bash
# PowerShell (Windows)
.\scripts\update-docker.ps1

# Bash (Linux/Mac)
chmod +x scripts/update-docker.sh
./scripts/update-docker.sh
```

### 6. Access Admin Panel

1. Navigate to: **http://localhost:9000/admin**
2. Enter your `APP_ADMIN_TOKEN` from the `.env` file
3. Start managing products!

### 7. Test Razorpay Integration

1. Add products to cart
2. Go to checkout page
3. Fill in shipping details
4. Click "Proceed to Payment"
5. Use test card: `4111 1111 1111 1111` (any future expiry, any CVV)
6. Complete payment and verify order confirmation

## API Endpoints

### Public Endpoints

- `GET /api/products` - List published products
  - Query params: `page`, `limit`, `category`, `search`
  - Returns: `{ products: [], pagination: {} }`
- `GET /api/products/[slug]` - Get product by slug
  - Returns: `{ product: {} }`
- `GET /api/health` - Health check endpoint
  - Returns: `{ status: 'healthy', timestamp: string }`

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  - Returns: `{ user: { id, email, name, role } }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ user: { id, email, name, role } }`
  - Sets HTTP-only cookie with JWT token
- `POST /api/auth/logout` - Logout user
  - Clears authentication cookie
- `GET /api/auth/me` - Get current user
  - Requires: Authentication cookie
  - Returns: `{ user: { id, email, name, role, clubMember } }`
- `POST /api/auth/create-admin` - Create admin user (requires admin token)
  - Headers: `x-admin-token`
  - Body: `{ name, email, password }`

### Cart Endpoints (Session-based)

- `GET /api/cart` - Get cart contents
  - Returns: `{ items: [], subtotal_cents: number, total_cents: number, currency: string }`
- `POST /api/cart` - Add item to cart
  - Body: `{ productId: string, quantity: number }`
  - Returns: `{ message: string, cart: { items: [] } }`
- `PUT /api/cart` - Update cart item quantity
  - Body: `{ productId: string, quantity: number }`
  - Returns: `{ message: string, cart: { items: [] } }`
- `DELETE /api/cart` - Clear entire cart
  - Returns: `{ message: string }`
- `DELETE /api/cart/[id]` - Remove item from cart
  - Returns: `{ message: string, cart: { items: [] } }`

### Payment Endpoints (Require Authentication)

- `POST /api/payments/create-order` - Create Razorpay order
  - Requires: Authentication cookie
  - Body: `{ shippingAddress: { firstName, lastName, email, phone, address, city, postalCode, instructions? } }`
  - Returns: `{ orderId, orderNumber, razorpayOrderId, amount, currency, key }`
  - Creates order in database and Razorpay, returns payment gateway details
- `POST /api/payments/verify` - Verify payment after Razorpay checkout
  - Requires: Authentication cookie
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }`
  - Returns: `{ success: boolean, message: string, order: {} }`
  - Verifies payment signature and updates order status
- `POST /api/payments/webhook` - Razorpay webhook handler
  - Handles payment.captured and payment.failed events
  - Updates order status automatically
  - Requires: `x-razorpay-signature` header for verification

### Checkout & Orders Endpoints (Require Authentication)

- `POST /api/checkout` - Create order from cart (legacy, use payment endpoints instead)
  - Requires: Authentication cookie
  - Body: `{ shippingAddress: { firstName, lastName, email, phone, address, city, postalCode, instructions? }, paymentMethod?: string }`
  - Returns: `{ message: string, order: { orderNumber, id, total_cents, currency, status } }`
  - Automatically clears cart and updates inventory
- `GET /api/orders` - Get user's orders
  - Requires: Authentication cookie
  - Query params: `page`, `limit`
  - Returns: `{ orders: [], pagination: {} }`
- `GET /api/orders/[id]` - Get order details
  - Requires: Authentication cookie
  - Returns: `{ order: {} }`
  - Users can only access their own orders

### Club Endpoints (Require Authentication)

- `POST /api/club/join` - Join MyPetEats Club
  - Requires: Authentication cookie
  - Returns: `{ success: boolean, message: string, user: {} }`

### Admin Endpoints (Require Admin Authentication)

Admin endpoints accept either:
- `x-admin-token` header (legacy token-based auth)
- Authentication cookie with admin role

- `GET /api/admin/products` - List all products
  - Query params: `page`, `limit`, `published`
  - Returns: `{ products: [], pagination: {} }`
- `POST /api/admin/products` - Create product
  - Body: `{ sku, title, description?, price_cents, currency?, inventory?, images?, categories?, attributes?, published?, metadata? }`
  - Returns: `{ message: string, product: {} }`
- `GET /api/admin/products/[id]` - Get single product
  - Returns: `{ product: {} }`
- `PUT /api/admin/products/[id]` - Update product
  - Body: Same as POST (all fields optional)
  - Returns: `{ message: string, product: {} }`
- `DELETE /api/admin/products/[id]` - Delete product
  - Returns: `{ message: string }`

## Product Schema

```javascript
{
  sku: String (unique, required),
  title: String (required, max 200 chars),
  slug: String (unique, auto-generated),
  description: String (max 5000 chars, HTML escaped),
  price_cents: Integer (required, non-negative),
  currency: String (default: "INR"),
  inventory: Integer (default: 0, non-negative),
  images: [String] (array of valid URLs),
  categories: [String],
  attributes: Object (freeform JSON),
  published: Boolean (default: false),
  metadata: Object (freeform JSON),
  created_at: Date (auto),
  updated_at: Date (auto)
}
```

## Security Features

- ✅ **Token-based Admin Auth** - Environment variable stored token
- ✅ **Rate Limiting** - 10 requests/minute per IP for admin endpoints
- ✅ **Brute-force Protection** - 5 failed attempts = 15 minute lockout
- ✅ **Input Validation** - Server-side validation on all admin inputs
- ✅ **XSS Protection** - HTML escaping for descriptions
- ✅ **CORS Protection** - Admin endpoints are same-origin only
- ✅ **SKU Uniqueness** - Enforced at database level
- ✅ **Payment Security** - Razorpay integration with signature verification
- ✅ **Webhook Verification** - HMAC signature verification for payment webhooks

## Production Deployment

### Important Production Notes

1. **MongoDB Port**: Production compose does NOT expose MongoDB port (27017). Use MongoDB Atlas or internal network only.

2. **Secrets Management**: 
   - Do NOT commit `.env` file
   - Use Docker secrets, CI/CD environment variables, or secrets manager
   - Rotate `APP_ADMIN_TOKEN` and `RAZORPAY_KEY_SECRET` regularly
   - Keep `RAZORPAY_WEBHOOK_SECRET` secure and never expose it

3. **Volumes**: Production compose does NOT mount source code (immutable containers).

4. **Backups**: 
   - Set up MongoDB backups (Atlas automated backups recommended)
   - Document restore procedures
   - Nightly snapshots minimum

5. **Monitoring**:
   - Health check endpoint: `/api/health`
   - Docker healthchecks configured
   - Logs available via `docker compose logs`

6. **Scaling**:
   - For production, consider MongoDB Atlas
   - Use Redis for rate limiting (replace in-memory store)
   - Add load balancer for multiple app instances

### Docker Compose Production

```bash
# Build
docker compose build

# Start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

## Development

### Hot Reload

Development mode mounts your source code, so changes are reflected immediately:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Running Scripts

```bash
# Initialize indexes (creates indexes for Product and User models)
docker compose run --rm app node scripts/init.mjs

# Seed products
docker compose run --rm app node scripts/seed.mjs

# Access MongoDB shell
docker compose exec mongo mongosh store
```

### Local Development (Optional)

If you want to run outside Docker (requires Node.js):

```bash
npm install
npm run dev
```

## Troubleshooting

### Port Already in Use

If port 9000 is taken, change it in `.env`:
```
PORT=9001
```

And update `docker-compose.yml` port mapping:
```yaml
ports:
  - "9001:9000"
```

### MongoDB Connection Issues

1. Check MongoDB is running: `docker compose ps`
2. Check logs: `docker compose logs mongo`
3. Verify `MONGODB_URI` in `.env` matches service name: `mongodb://mongo:27017/store`

### Admin Token Not Working

1. Verify `APP_ADMIN_TOKEN` in `.env` matches what you're entering
2. Check token is being sent in `x-admin-token` header
3. Clear browser sessionStorage and try again

### Build Failures

1. Clear Docker cache: `docker compose build --no-cache`
2. Check Node version compatibility (requires Node 18+)
3. Verify all files are present

## Data Models

### User Schema
```javascript
{
  name: String (max 120 chars),
  email: String (unique, required, indexed),
  passwordHash: String (required, not selected by default),
  role: String (enum: ['customer', 'admin'], default: 'customer', indexed),
  phone: String,
  clubMember: Boolean (default: false, indexed),
  created_at: Date,
  updated_at: Date
}
```

### Order Schema
```javascript
{
  orderNumber: String (unique, auto-generated, indexed),
  user: ObjectId (ref: 'User', required, indexed),
  items: [{
    product: ObjectId (ref: 'Product'),
    title: String,
    sku: String,
    price_cents: Number,
    quantity: Number,
    image: String
  }],
  subtotal_cents: Number (required),
  shipping_cents: Number (default: 0),
  total_cents: Number (required),
  currency: String (default: 'INR'),
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], indexed),
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    instructions: String
  },
  payment: {
    method: String (enum: ['card', 'cash_on_delivery', 'upi', 'netbanking', 'razorpay']),
    status: String (enum: ['pending', 'completed', 'failed', 'refunded']),
    transactionId: String
  },
  metadata: Object,
  created_at: Date,
  updated_at: Date
}
```

## Razorpay Payment Integration

The project includes full Razorpay payment gateway integration:

### Setup Instructions

1. **Create Razorpay Account**
   - Sign up at https://razorpay.com
   - Go to Dashboard → Settings → API Keys
   - Generate API keys (Key ID and Key Secret)

2. **Configure Webhook** (Optional but recommended)
   - Go to Dashboard → Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`
   - Copy the webhook secret

3. **Add to Environment Variables**
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxx  # or rzp_live_xxxxx for production
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

### Payment Flow

1. User fills checkout form and clicks "Proceed to Payment"
2. Frontend calls `/api/payments/create-order` to create order
3. Razorpay checkout modal opens
4. User completes payment
5. Frontend calls `/api/payments/verify` to verify payment
6. Backend verifies signature and updates order status
7. User redirected to order confirmation page

### Test Cards (Test Mode)

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- Use any future expiry date and any CVV

### Security

- Payment signatures are verified using HMAC SHA256
- Webhook signatures are verified for all incoming events
- Order status is only updated after successful verification
- Inventory is only deducted after payment confirmation

## Future Enhancements

- [x] Image upload (JPEG/PNG, up to 4 images per product) ✅
- [ ] Redis-based cart storage (currently in-memory)
- [x] Payment gateway integration (Razorpay) ✅
- [ ] Email notifications (order confirmations, password reset)
- [ ] Advanced search with filters
- [ ] Product variants (size, color, etc.)
- [ ] Order status tracking for users
- [ ] Admin order management dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality

## License

MIT

## Support

For issues and questions, check the logs:
```bash
docker compose logs -f app
docker compose logs -f mongo
```

