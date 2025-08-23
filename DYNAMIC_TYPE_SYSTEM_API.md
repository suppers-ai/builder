# Dynamic Type System API Documentation

## Overview

The Dynamic Type System allows administrators to configure entity and product types with custom metadata schemas and filter configurations. This system replaces static tags with flexible, type-based metadata that can be validated and searched efficiently.

## Authentication

All admin endpoints require authentication with an admin role:
- Header: `Authorization: Bearer <token>`
- User must have `role: "admin"` in the users table

## Entity Type Management

### Get All Entity Types
```http
GET /api/v1/admin/entity-types
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "accommodation",
      "description": "Hotels, apartments, guesthouses and other lodging facilities",
      "metadata_schema": {
        "fields": {
          "check_in_time": {
            "type": "time",
            "label": "Check-in Time",
            "required": true
          },
          "max_guests": {
            "type": "number",
            "label": "Maximum Guests",
            "required": true,
            "min": 1
          }
        }
      },
      "filter_config": {
        "filter_numeric_1": {
          "label": "Star Rating",
          "searchable": true
        },
        "filter_text_1": {
          "label": "Property Type",
          "searchable": true
        }
      },
      "location_required": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "entity_sub_types": []
    }
  ]
}
```

### Create Entity Type
```http
POST /api/v1/admin/entity-types
```

**Request Body:**
```json
{
  "name": "venue",
  "description": "Event venues and meeting spaces",
  "location_required": true,
  "metadata_schema": {
    "fields": {
      "capacity": {
        "type": "number",
        "label": "Maximum Capacity",
        "required": true,
        "min": 1
      },
      "venue_type": {
        "type": "select",
        "label": "Venue Type",
        "options": ["conference_room", "wedding_venue", "restaurant"],
        "required": true
      }
    }
  },
  "filter_config": {
    "filter_numeric_1": {
      "label": "Capacity",
      "searchable": true
    },
    "filter_text_1": {
      "label": "Venue Type",
      "searchable": true
    }
  }
}
```

### Update Entity Type
```http
PUT /api/v1/admin/entity-types/{id}
```

### Delete Entity Type
```http
DELETE /api/v1/admin/entity-types/{id}
```

### Get Entity Sub-types
```http
GET /api/v1/admin/entity-types/{id}/sub-types
```

### Create Entity Sub-type
```http
POST /api/v1/admin/entity-types/{id}/sub-types
```

**Request Body:**
```json
{
  "name": "luxury",
  "description": "High-end luxury accommodations",
  "metadata_schema": {
    "fields": {
      "concierge": {
        "type": "boolean",
        "label": "Concierge Service"
      }
    }
  },
  "filter_config": {
    "filter_boolean_3": {
      "label": "Concierge Available",
      "searchable": true
    }
  }
}
```

## Product Type Management

### Get All Product Types
```http
GET /api/v1/admin/product-types
```

### Create Product Type
```http
POST /api/v1/admin/product-types
```

**Request Body:**
```json
{
  "name": "ecommerce",
  "description": "Physical and digital products for sale",
  "metadata_schema": {
    "fields": {
      "product_category": {
        "type": "select",
        "label": "Product Category",
        "options": ["electronics", "clothing", "books"],
        "required": true
      },
      "physical_product": {
        "type": "boolean",
        "label": "Physical Product",
        "default": true
      },
      "weight": {
        "type": "number",
        "label": "Weight (kg)",
        "min": 0
      }
    }
  },
  "filter_config": {
    "filter_text_1": {
      "label": "Product Category",
      "searchable": true
    },
    "filter_boolean_1": {
      "label": "Physical Product",
      "searchable": true
    },
    "filter_numeric_1": {
      "label": "Weight (kg)",
      "searchable": true
    }
  }
}
```

## Enhanced Entity Creation

### Create Entity with Dynamic Types
```http
POST /api/v1/entity
```

**Request Body:**
```json
{
  "name": "Grand Hotel Plaza",
  "description": "Luxury hotel in downtown",
  "type": "accommodation",
  "sub_type": "luxury",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY, USA"
  },
  "metadata": {
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "max_guests": 4,
    "star_rating": 5,
    "property_type": "hotel",
    "concierge": true
  },
  "photos": ["https://example.com/hotel1.jpg"],
  "connected_application_ids": []
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Grand Hotel Plaza",
  "description": "Luxury hotel in downtown",
  "type": "accommodation",
  "sub_type": "luxury",
  "metadata": {
    "check_in_time": "15:00",
    "check_out_time": "11:00",
    "max_guests": 4,
    "star_rating": 5,
    "property_type": "hotel",
    "concierge": true
  },
  "location": "POINT(-74.0060 40.7128)",
  "filter_numeric_1": 5,
  "filter_numeric_2": 4,
  "filter_text_1": "hotel",
  "filter_boolean_1": false,
  "filter_boolean_3": true,
  "status": "pending",
  "verified": true,
  "owner_id": "user-uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Enhanced Product Creation

### Create Product with Dynamic Types
```http
POST /api/v1/product
```

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones",
  "type": "ecommerce",
  "sub_type": "digital",
  "thumbnail_url": "https://example.com/headphones.jpg",
  "metadata": {
    "product_category": "electronics",
    "physical_product": true,
    "weight": 0.3,
    "warranty": "2 years",
    "return_policy": "30_days"
  },
  "entity_id": "store-entity-uuid"
}
```

## Metadata Schema Format

### Field Types

- **text**: String input
- **number**: Numeric input with optional min/max
- **boolean**: Checkbox input
- **date**: Date picker
- **time**: Time picker
- **select**: Dropdown with predefined options
- **array**: Multiple selection from options
- **object**: Nested object with properties

### Field Configuration

```json
{
  "field_name": {
    "type": "text|number|boolean|date|time|select|array|object",
    "label": "Display Label",
    "required": true|false,
    "min": 0,
    "max": 100,
    "options": ["option1", "option2"],
    "default": "default_value",
    "properties": {
      "nested_field": {
        "type": "text",
        "label": "Nested Field"
      }
    }
  }
}
```

## Filter Configuration Format

```json
{
  "filter_numeric_1": {
    "label": "Price Range",
    "searchable": true
  },
  "filter_text_1": {
    "label": "Category",
    "searchable": true
  },
  "filter_boolean_1": {
    "label": "In Stock",
    "searchable": true
  },
  "filter_date_1": {
    "label": "Available From",
    "searchable": true
  }
}
```

## Geographic Search (Entities Only)

Entities with location data support geographic search:

```http
GET /api/v1/entities/search?lat=40.7128&lng=-74.0060&radius=10&unit=km
```

## Error Responses

### Validation Error
```json
{
  "error": "Metadata validation failed",
  "details": [
    "Field 'max_guests' is required",
    "Field 'star_rating' must be between 1 and 5"
  ]
}
```

### Type Not Found
```json
{
  "error": "Invalid entity type"
}
```

### Location Required
```json
{
  "error": "Location is required for this entity type"
}
```

## Default Types

The system comes with predefined types:

### Entity Types
- **accommodation**: Hotels, apartments, guesthouses
- **service**: Professional services and consultations
- **venue**: Event venues and meeting spaces
- **general**: Generic entities

### Product Types
- **service**: Service-based products
- **accommodation**: Accommodation products
- **ecommerce**: Physical and digital products
- **experience**: Events and activities

Each type includes comprehensive metadata schemas and filter configurations suitable for common use cases.