# Dynamic Products Application

A comprehensive Golang web application for dynamic product and entity management with flexible metadata schemas, built with PostgreSQL and a modern web interface.

## Features

### Core Functionality
- **Dynamic Entity Management**: Create and manage entities with configurable types and metadata schemas
- **Flexible Product System**: Products with dynamic fields and filtering capabilities
- **User Authentication**: Session-based authentication with role-based access control
- **Purchase Tracking**: Complete purchase lifecycle management with API endpoints
- **Admin Dashboard**: Full administrative interface for type configuration and user management
- **Seller Dashboard**: Seller interface for managing entities and products

### Technical Features
- **PostgreSQL with PostGIS**: Advanced database features including geographic data support
- **RESTful API**: Comprehensive API endpoints for integration
- **Modern Web UI**: Clean, responsive interface with CSS Grid and Flexbox
- **Role-based Security**: Admin and seller roles with proper access control
- **Session Management**: Secure session handling with configurable secrets
- **Dynamic Filtering**: Configurable filter columns for advanced searching

## Architecture

### Database Schema
The application uses the `dynamicproducts` PostgreSQL schema with the following main tables:
- `users` - User authentication and profiles
- `entity_types` / `entity_sub_types` - Configurable entity type definitions
- `entities` - Entity instances with dynamic metadata
- `product_types` / `product_sub_types` - Configurable product type definitions
- `products` - Product instances with pricing and metadata
- `purchases` - Purchase transactions and tracking
- `sessions` - User session management

### Application Structure
```
dynamicproducts/
├── models/          # Data models and database operations
├── handlers/        # HTTP handlers for web and API endpoints
├── middleware/      # Authentication and request middleware
├── templates/       # HTML template system
├── static/css/      # CSS styling
├── database/        # Database migrations
└── main.go          # Application entry point
```

## Getting Started

### Prerequisites
- Go 1.23 or later
- PostgreSQL 12+ with PostGIS extension
- Database with `dynamicproducts` schema

### Environment Variables
Create a `.env` file with the following variables:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dynamicproducts
DB_SSLMODE=disable

# Application Configuration
PORT=8080
SESSION_SECRET=your-secure-session-secret-here

# Default Admin User
DEFAULT_ADMIN_EMAIL=admin@dynamicproducts.local
DEFAULT_ADMIN_PASSWORD=admin123
```

### Installation and Setup

1. **Clone and install dependencies**:
```bash
cd dynamicproducts
go mod tidy
```

2. **Set up the database**:
```bash
# Run the database migrations manually
psql -h localhost -U postgres -d dynamicproducts -f database/migrations/001_initial_schema.up.sql
psql -h localhost -U postgres -d dynamicproducts -f database/migrations/002_seed_data.up.sql
```

3. **Run the application**:
```bash
go run main.go
```

4. **Access the application**:
- Web Interface: http://localhost:8080
- API Endpoints: http://localhost:8080/api
- Default Login: admin@dynamicproducts.local / admin123

## API Documentation

### Authentication
The API supports both session-based authentication (for web requests) and token-based authentication (for API requests).

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/products` - List active products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/search` - Search products
- `POST /api/purchases` - Create purchase

### Authenticated Endpoints
- `GET /api/auth/me/purchases` - Get user's purchases
- `GET /api/auth/me/stats` - Get user's statistics

### Admin Endpoints
- `GET|POST /api/admin/entity-types` - Manage entity types
- `GET|PUT|DELETE /api/admin/entity-types/{id}` - Entity type operations
- `GET|POST /api/admin/product-types` - Manage product types
- `GET|PUT|DELETE /api/admin/product-types/{id}` - Product type operations
- `GET /api/admin/users` - List users
- `GET|PUT|DELETE /api/admin/users/{id}` - User operations

### Seller Endpoints
- `GET|POST /api/seller/entities` - Manage entities
- `GET|PUT|DELETE /api/seller/entities/{id}` - Entity operations
- `GET|POST /api/seller/products` - Manage products
- `GET|PUT|DELETE /api/seller/products/{id}` - Product operations

## Usage Examples

### Creating an Entity Type (Admin)
```bash
curl -X POST http://localhost:8080/api/admin/entity-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Restaurant",
    "description": "Restaurant entity type",
    "location_required": true,
    "metadata_schema": {
      "properties": {
        "cuisine": {"type": "string"},
        "capacity": {"type": "integer"}
      }
    },
    "filter_config": {
      "filter_text_1": "cuisine",
      "filter_numeric_1": "capacity"
    }
  }'
```

### Creating an Entity (Seller)
```bash
curl -X POST http://localhost:8080/api/seller/entities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mario's Italian Restaurant",
    "description": "Authentic Italian cuisine",
    "type": "Restaurant",
    "metadata": {
      "cuisine": "Italian",
      "capacity": 50
    },
    "filter_text_1": "Italian",
    "filter_numeric_1": 50
  }'
```

### Creating a Product
```bash
curl -X POST http://localhost:8080/api/seller/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Pizza Margherita",
    "description": "Classic Italian pizza with tomato and mozzarella",
    "price": 18.99,
    "currency": "USD",
    "type": "Food",
    "entity_id": "ENTITY_UUID_HERE"
  }'
```

### Recording a Purchase
```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRODUCT_UUID_HERE",
    "buyer_email": "customer@example.com",
    "buyer_name": "John Doe",
    "quantity": 2,
    "payment_method": "credit_card",
    "source": "web"
  }'
```

## Web Interface

### Admin Features
- **Entity Type Management**: Configure entity types with custom metadata schemas
- **Product Type Management**: Configure product types with custom fields
- **User Management**: Create and manage seller accounts
- **System Overview**: View all purchases and system statistics

### Seller Features
- **Entity Management**: Create and manage entities based on configured types
- **Product Management**: Create and manage products with pricing
- **Sales Dashboard**: View sales statistics and purchase history
- **Dynamic Filtering**: Use configured filter fields for organization

## Security Features

- **Role-based Access Control**: Admin and seller roles with appropriate permissions
- **Session Security**: Secure session handling with configurable secrets
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Security headers and input escaping
- **CORS Configuration**: Proper CORS handling for API endpoints

## Development

### Project Structure
The application follows standard Go project structure with clear separation of concerns:
- **Models**: Database operations and business logic
- **Handlers**: HTTP request handling for web and API
- **Middleware**: Authentication, logging, and security
- **Templates**: Basic HTML template system (can be upgraded to templ)

### Database Migrations
Database migrations are located in `database/migrations/` and should be run manually:
- `001_initial_schema.up.sql` - Initial database schema
- `002_seed_data.up.sql` - Optional seed data

### Extending the Application
The dynamic metadata system allows for easy extension:
1. Configure new entity/product types through the admin interface
2. Define custom metadata schemas using JSON Schema format
3. Use dynamic filter columns for searchable fields
4. Extend API endpoints as needed

## Production Deployment

### Environment Configuration
- Set secure `SESSION_SECRET`
- Configure proper database credentials
- Set `DB_SSLMODE=require` for production
- Use environment-specific configuration

### Security Considerations
- Enable HTTPS
- Configure proper CORS origins
- Implement rate limiting
- Regular security updates
- Database backup strategy

## License

This project is created as part of the Suppers AI Builder system. Please refer to the main project for licensing information.