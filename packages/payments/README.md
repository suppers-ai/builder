# Payments System

A complete payments and subscription management system built with Fresh, Supabase, and Stripe
integration.

## 🏗️ Architecture Overview

The payments system consists of several key components:

### 1. **Database Schema** (`database-schema.sql`)

- **Users**: Authentication and role management (user, admin)
- **Products**: Seller products with variables and restrictions
- **Pricing**: Dynamic pricing with formulas and conditions
- **Purchases**: Order management and payment tracking
- **Subscriptions**: Recurring billing management
- **System Products**: Admin-defined products (storage, features, etc.)

### 2. **Core Pricing System**

- **Dynamic Pricing**: Formula-based pricing with variables
- **Product Variables**: Configurable pricing variables per product
- **Formula-Based Restrictions**: Simple array-based product availability rules
- **Index-Based Priority**: Formula execution order based on array position

### 3. **Authentication** (`lib/auth.ts`)

- **OAuth Integration**: Uses OAuthAuthClient for centralized authentication
- **Role-Based Access**: User and admin roles
- **Session Management**: Automatic user creation and session handling

### 4. **API Endpoints** (`routes/api/index.ts`)

- **RESTful API**: CRUD operations for products, pricing, and purchases
- **Role-Based Authorization**: Protected endpoints based on user roles
- **Error Handling**: Comprehensive error responses and logging

### 5. **User Interfaces**

- **Admin Dashboard**: System product and subscription management
- **User Dashboard**: Product creation, inventory, and order management
- **Product Catalog**: Customer-facing product browsing and purchasing

## 🚀 Quick Start

### Prerequisites

- Deno 1.40+
- Supabase account
- Stripe account (for payment processing)
- OAuth provider (Google, GitHub, etc.)

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Configuration
PROFILE_SERVICE_URL=http://localhost:8001
OAUTH_CLIENT_ID=your_oauth_client_id

# Stripe Configuration (for payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Database Setup

Run the database schema:

```bash
# Connect to your Supabase database and run:
psql -h your_supabase_host -U postgres -d postgres -f database-schema.sql
```

### 3. Start Development Server

```bash
deno task dev
```

The application will be available at `http://localhost:8000`

## 📊 Key Features

### 1. **Dynamic Pricing System**

```typescript
// Product with variables
const product = {
  productVariables: {
    basePrice: { id: "basePrice", type: "fixed", value: 100 },
    availableStock: { id: "availableStock", type: "fixed", value: 50 },
  },
  restrictions: [
    "availableStockCheck", // availableStock > 0
    "maxParticipantsCheck", // participants <= maxParticipants
  ],
};

// Pricing formulas
const formulas = {
  baseCalculation: {
    id: "baseCalculation",
    valueCalculation: ["participants", "*", "basePrice"],
  },
  weekendSurcharge: {
    id: "weekendSurcharge",
    valueCalculation: [50],
    applyCondition: ["isWeekend", "==", 1],
  },
};
```

### 2. **Role-Based Access Control**

- **Users**: Can browse and purchase products
- **Sellers**: Can create and manage their own products
- **Admins**: Can manage system products and view all data

### 3. **Product Management**

Sellers can:

- Create products with dynamic pricing
- Set product variables (price, stock, etc.)
- Configure restrictions (availability rules)
- Manage inventory and orders
- View analytics and insights

### 4. **Subscription Management**

Admins can:

- Create system products (storage plans, features)
- Manage user subscriptions
- Track revenue and usage
- Handle billing and payments

## 🛠️ API Reference

### Authentication Endpoints

```typescript
// Get current user
GET / api / user;

// Login
POST / api / auth / login;

// Logout
POST / api / auth / logout;
```

### Product Endpoints

```typescript
// Get all products
GET /api/products

// Get seller's products
GET /api/products/my

// Get system products
GET /api/products/system

// Create product
POST /api/products

// Update product
PUT /api/products/:id

// Delete product
DELETE /api/products/:id
```

### Purchase Endpoints

```typescript
// Get user purchases
GET / api / purchases;

// Create purchase
POST / api / purchases;
```

## 🎨 UI Components

The system uses the `@suppers/ui-lib` component library for consistent styling:

```typescript
import { Button, Card, Badge } from "@suppers/ui-lib";

// Usage examples
<Button variant="primary" size="lg">Create Product</Button>
<Card><div>Product information</div></Card>
<Badge variant="success">In Stock</Badge>
```

## 🔧 Development

### Project Structure

```
applications/payments/
├── database-schema.sql      # Database schema
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── database.ts         # Database client and types
├── routes/
│   ├── api/                # API endpoints
│   ├── admin/              # Admin dashboard
│   ├── seller/             # Seller dashboard
│   └── index.tsx           # Main landing page
├── islands/
│   └── AuthProvider.tsx    # Authentication provider
├── tests/                  # Test files
└── deno.json              # Deno configuration
```

### Running Tests

```bash
# Run all tests
deno task test

# Run specific test files
deno test tests/refactored-pricing-system.test.ts
deno test tests/dynamic-pricing.test.ts
deno test tests/product-based/ecommerce.test.ts
```

### Code Quality

```bash
# Format code
deno task fmt

# Lint code
deno task lint

# Type check
deno task check
```

## 🔒 Security Features

1. **Authentication**: OAuth-based authentication with role verification
2. **Authorization**: Role-based access control for all endpoints
3. **Input Validation**: Comprehensive validation for all API inputs
4. **SQL Injection Protection**: Parameterized queries via Supabase
5. **HTTPS Enforcement**: Secure communication for all requests

## 📈 Monitoring & Analytics

The system provides:

- **Real-time Analytics**: Sales, revenue, and user metrics
- **Order Tracking**: Complete order lifecycle management
- **Payment Monitoring**: Stripe integration for payment tracking
- **User Insights**: Customer behavior and preferences

## 🚀 Deployment

### Production Setup

1. **Database**: Set up Supabase production instance
2. **Environment**: Configure production environment variables
3. **Domain**: Set up custom domain and SSL certificates
4. **Monitoring**: Configure logging and monitoring tools

### Environment Variables (Production)

```bash
# Production OAuth
PROFILE_SERVICE_URL=https://your-auth-service.com
OAUTH_CLIENT_ID=your_production_oauth_client_id

# Production Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key

# Production Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is part of the Suppers AI Builder ecosystem.

## 🆘 Support

For support and questions:

- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

**Built with ❤️ using Fresh, Supabase, and Stripe**
