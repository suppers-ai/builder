# Payment Integration Guide

## Overview

The formulapricing application now includes payment processing capabilities using Stripe Checkout, with a provider-agnostic design to support multiple payment providers in the future.

## Features

- **Provider-Agnostic Design**: Database schema and code structure support multiple payment providers
- **Stripe Integration**: Currently implemented with Stripe Checkout
- **Secure Webhook Handling**: Idempotent webhook processing with signature verification
- **Purchase History**: Track all completed purchases for each user
- **Calculation Validation**: Validates pricing calculations before creating payment sessions

## Database Schema

The payment system uses the following tables:

- `payment_providers`: Stores payment provider configurations
- `payment_sessions`: Tracks checkout sessions created for users
- `purchases`: Records completed purchases
- `payment_webhooks`: Ensures idempotent webhook processing

## API Endpoints

### 1. Create Checkout Session
```bash
POST /api/checkout
Content-Type: application/json

{
  "user_id": "uuid",
  "pricing_name": "basic_pricing",
  "variables": {
    "quantity": 10,
    "price_per_unit": 5.99
  }
}

Response:
{
  "session_id": "cs_test_...",
  "payment_url": "https://checkout.stripe.com/c/pay/...",
  "expires_at": 1234567890
}
```

### 2. Payment Webhook (Stripe)
```bash
POST /api/payments/webhook
Stripe-Signature: t=...,v1=...

[Stripe webhook payload]
```

### 3. Payment Success Callback
```bash
GET /api/payments/success?session_id={CHECKOUT_SESSION_ID}

Response:
{
  "status": "success",
  "session_id": "cs_test_...",
  "payment_status": "paid",
  "amount": 59.90,
  "currency": "USD"
}
```

### 4. Get User Purchases
```bash
GET /api/purchases?user_id=uuid

Response:
[
  {
    "id": "uuid",
    "pricing_name": "basic_pricing",
    "amount": 59.90,
    "currency": "USD",
    "status": "completed",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Base URL (for callbacks)
BASE_URL=https://yourdomain.com
```

## Setup Instructions

### 1. Run Database Migrations

The payment tables will be created automatically when the application starts if `AUTO_MIGRATE=true` (default).

To manually run migrations:
```bash
cd applications/formulapricing
go run cmd/migrate/main.go
```

### 2. Configure Stripe

1. Get your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Set up webhook endpoint in Stripe:
   - Go to Webhooks in Stripe Dashboard
   - Add endpoint: `https://yourdomain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`
   - Copy the webhook secret

### 3. Test the Integration

```bash
# Start the application
PORT=8091 go run main.go

# Create a test checkout session
curl -X POST http://localhost:8091/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-uuid",
    "pricing_name": "your-pricing-name",
    "variables": {
      "quantity": 10,
      "price": 5.99
    }
  }'
```

## Payment Flow

1. **Client Request**: User submits pricing variables and requests checkout
2. **Calculation**: Server validates and calculates the total price
3. **Session Creation**: Creates a Stripe checkout session and saves to database
4. **User Payment**: User is redirected to Stripe Checkout to complete payment
5. **Webhook Processing**: Stripe sends webhook on payment completion
6. **Purchase Recording**: System creates a purchase record and updates session status
7. **Success Page**: User is redirected to success page with payment confirmation

## Security Considerations

- Webhook signatures are verified to ensure authenticity
- Idempotent webhook processing prevents duplicate purchases
- User authentication required for viewing purchase history
- All payment data is encrypted in transit (HTTPS)
- Sensitive payment details are handled by Stripe, not stored locally

## Adding New Payment Providers

To add a new payment provider (e.g., PayPal, Square):

1. Implement the `PaymentProvider` interface in `payments/provider.go`
2. Create a new file `payments/[provider].go` with the implementation
3. Update `NewPaymentProvider` factory function
4. Add provider configuration to `payment_providers` table
5. Test webhook handling and payment flow

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
   - Check that the webhook endpoint URL matches exactly

2. **Checkout session expires**
   - Default expiry is 30 minutes
   - Adjust in `stripe.go` if needed

3. **Payment not recorded**
   - Check webhook logs in Stripe Dashboard
   - Verify database migrations ran successfully
   - Check application logs for errors

## Example Integration Code

### Frontend JavaScript
```javascript
async function createCheckout(pricingName, variables) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentUser.id,
      pricing_name: pricingName,
      variables: variables
    })
  });
  
  const data = await response.json();
  
  // Redirect to Stripe Checkout
  window.location.href = data.payment_url;
}
```

### Testing with Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:8091/api/payments/webhook

# Trigger test events
stripe trigger checkout.session.completed
```