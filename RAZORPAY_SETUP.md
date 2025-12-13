# Razorpay Payment Integration Setup Guide

## Overview

MyPetEats now includes full Razorpay payment gateway integration for secure online payments. This guide will help you set up and configure Razorpay in your project.

## Features Implemented

- ✅ Razorpay Checkout integration
- ✅ Payment order creation
- ✅ Payment signature verification
- ✅ Webhook handling for payment events
- ✅ Automatic order status updates
- ✅ Inventory management on successful payment
- ✅ Error handling and validation

## Setup Instructions

### 1. Create Razorpay Account

1. Sign up at https://razorpay.com
2. Complete KYC verification (required for live mode)
3. Access your dashboard

### 2. Get API Keys

1. Go to **Dashboard → Settings → API Keys**
2. Click **Generate Test Key** (for testing) or use **Live Keys** (for production)
3. Copy your **Key ID** and **Key Secret**
4. Keep these secure - never commit them to version control

### 3. Configure Webhook (Recommended)

1. Go to **Dashboard → Settings → Webhooks**
2. Click **Add New Webhook**
3. Set webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - `payment.captured`
   - `payment.failed`
5. Copy the **Webhook Secret**

### 4. Add Environment Variables

Add these to your `.env` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx  # Test key (rzp_test_...) or Live key (rzp_live_...)
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here  # Optional but recommended
```

### 5. Update Docker Configuration

The environment variables are already configured in:
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `next.config.js`

Just add them to your `.env` file and restart the containers.

## Payment Flow

1. **User fills checkout form** → Enters shipping details
2. **Clicks "Proceed to Payment"** → Frontend calls `/api/payments/create-order`
3. **Backend creates order** → Creates Order document in database (status: pending)
4. **Razorpay order created** → Backend creates Razorpay order
5. **Checkout modal opens** → Razorpay checkout popup appears
6. **User completes payment** → Enters card/UPI details in Razorpay modal
7. **Payment success** → Frontend calls `/api/payments/verify`
8. **Backend verifies** → Validates payment signature
9. **Order confirmed** → Order status updated to "confirmed", inventory deducted
10. **User redirected** → To order confirmation page

## API Endpoints

### POST /api/payments/create-order

Creates a Razorpay order and returns payment gateway details.

**Request:**
```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "postalCode": "400001",
    "instructions": "Leave at door"
  }
}
```

**Response:**
```json
{
  "orderId": "order_id",
  "orderNumber": "ORD-1234567890-000001",
  "razorpayOrderId": "order_xxxxx",
  "amount": 50000,
  "currency": "INR",
  "key": "rzp_test_xxxxx"
}
```

### POST /api/payments/verify

Verifies payment after Razorpay checkout completion.

**Request:**
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "orderId": "order_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "id": "order_id",
    "orderNumber": "ORD-1234567890-000001",
    "status": "confirmed"
  }
}
```

### POST /api/payments/webhook

Handles Razorpay webhook events (automatically called by Razorpay).

**Events handled:**
- `payment.captured` - Updates order to confirmed status
- `payment.failed` - Updates order payment status to failed

## Test Cards (Test Mode)

Use these test cards when `RAZORPAY_KEY_ID` starts with `rzp_test_`:

| Card Number | Scenario |
|------------|----------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Failure |
| 5104 0600 0000 0008 | International card success |

**Test Details:**
- Use any future expiry date (e.g., 12/25)
- Use any CVV (e.g., 123)
- Use any name

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256 signatures
2. **Webhook Verification**: Webhook requests are verified using webhook secret
3. **Idempotency**: Duplicate payment verifications are handled gracefully
4. **Inventory Safety**: Inventory is only deducted after payment confirmation
5. **Order Status Protection**: Orders can't be modified after confirmation

## Troubleshooting

### Payment Gateway Not Loading

- Check that `RAZORPAY_KEY_ID` is set in environment variables
- Verify Razorpay script is loading: Check browser console for errors
- Ensure you're using HTTPS in production (Razorpay requires HTTPS)

### Payment Verification Fails

- Verify `RAZORPAY_KEY_SECRET` matches your Key ID
- Check that signature is being generated correctly
- Ensure order exists in database before verification

### Webhook Not Working

- Verify webhook URL is accessible from internet
- Check `RAZORPAY_WEBHOOK_SECRET` is set correctly
- Verify webhook events are enabled in Razorpay dashboard
- Check server logs for webhook errors

### Order Created But Payment Failed

- Order remains in "pending" status
- Inventory is NOT deducted
- User can retry payment
- Failed payments are logged in order payment status

## Production Checklist

- [ ] Switch to Live API keys (`rzp_live_...`)
- [ ] Configure webhook with production URL
- [ ] Test payment flow end-to-end
- [ ] Verify webhook events are working
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications (future enhancement)
- [ ] Test refund process (if needed)

## Support

For Razorpay-specific issues:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

For application issues:
- Check server logs: `docker compose logs app`
- Check payment API logs in console

