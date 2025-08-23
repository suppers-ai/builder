# Admin Type Management Guide

## Overview

The Type Management system allows administrators to configure how entities and products are structured and validated in the payments system. This replaces static tags with dynamic, configurable metadata that can be tailored to specific business needs.

## Accessing Type Management

1. Log in to the admin panel with an admin account
2. Navigate to **Configuration** in the sidebar
3. Choose either **Entity Types** or **Product Types**

## Entity Type Management

### Creating a New Entity Type

1. Click **Create Entity Type**
2. Fill in the basic information:
   - **Name**: Unique identifier (e.g., "restaurant", "hotel")
   - **Description**: Human-readable description
   - **Location Required**: Check if entities of this type must have a geographic location

3. **Configure Metadata Fields**:
   - Click **Add Field** to create a new metadata field
   - Set the field name (used in the database)
   - Configure field properties:
     - **Type**: Choose from text, number, boolean, date, time, select, array, or object
     - **Label**: Display name for users
     - **Required**: Check if this field is mandatory
     - **Options**: For select/array types, define available choices

4. **Configure Filters** (Optional):
   - The system automatically maps metadata to filter columns
   - Filters enable efficient searching and sorting

5. Click **Create** to save the entity type

### Example: Creating a "Restaurant" Entity Type

**Basic Information:**
- Name: `restaurant`
- Description: `Restaurants and dining establishments`
- Location Required: ✓ (checked)

**Metadata Fields:**
- `cuisine_type`: Select field with options ["italian", "chinese", "mexican", "american"]
- `price_range`: Number field (1-4, representing $ to $$$$)
- `capacity`: Number field for maximum diners
- `accepts_reservations`: Boolean field
- `operating_hours`: Object field with start/end times

### Creating Sub-types

Sub-types inherit from parent types and can add or override metadata:

1. Select an entity type from the list
2. Click **Add Sub-type**
3. Define the sub-type name and additional metadata
4. Sub-types automatically inherit all parent metadata fields

**Example Sub-types for "Restaurant":**
- `fine_dining`: Adds fields for dress code, sommelier service
- `fast_food`: Adds fields for drive-through, delivery options
- `cafe`: Adds fields for coffee types, wifi availability

## Product Type Management

### Creating Product Types

Similar to entity types but focused on products and services:

1. Click **Create Product Type**
2. Configure metadata relevant to products:
   - Pricing information
   - Delivery methods
   - Product specifications
   - Service details

### Example: Creating an "E-commerce" Product Type

**Metadata Fields:**
- `product_category`: Select field ["electronics", "clothing", "books", "home"]
- `physical_product`: Boolean field
- `weight`: Number field (for shipping)
- `dimensions`: Object field with length, width, height
- `warranty_period`: Text field
- `return_policy`: Select field ["30_days", "60_days", "no_returns"]

## Metadata Field Types

### Text Fields
- Simple text input
- Optional min/max length validation
- Use for: names, descriptions, IDs

### Number Fields
- Numeric input with validation
- Set min/max values
- Use for: prices, quantities, ratings, capacities

### Boolean Fields
- Checkbox input (true/false)
- Use for: features, availability, flags

### Date/Time Fields
- Date or time picker
- Use for: schedules, deadlines, operating hours

### Select Fields
- Dropdown with predefined options
- Define available choices in the options array
- Use for: categories, types, statuses

### Array Fields
- Multiple selection from predefined options
- Users can select multiple values
- Use for: amenities, features, tags

### Object Fields
- Nested structure with sub-properties
- Define properties with their own field types
- Use for: addresses, contact info, complex data

## Best Practices

### Naming Conventions
- Use lowercase, underscore-separated names: `check_in_time`
- Be descriptive but concise: `max_capacity` not `maximum_number_of_people`
- Avoid special characters or spaces in field names

### Field Organization
- Group related fields logically
- Put required fields first
- Use clear, user-friendly labels
- Provide helpful descriptions for complex fields

### Filter Configuration
- Map important searchable fields to filter columns
- Use consistent labeling across types
- Consider what users will want to search/filter by

### Type Hierarchy
- Use sub-types for variations within a category
- Keep parent types general, sub-types specific
- Don't create too many sub-types (max 5-10 per parent)

## Managing Existing Types

### Editing Types
1. Select a type from the list
2. Click **Edit**
3. Modify fields, but be careful:
   - Removing fields will lose existing data
   - Changing field types may cause validation errors
   - Always test changes in a development environment first

### Deleting Types
- Only delete types that have no associated entities/products
- The system will prevent deletion if data exists
- Consider marking as inactive instead of deleting

## Validation and Error Handling

### Common Validation Errors
- **Required field missing**: User didn't fill in a required field
- **Invalid format**: Data doesn't match field type (e.g., text in number field)
- **Out of range**: Number outside min/max bounds
- **Invalid option**: Select field value not in options list

### Error Messages
The system provides clear error messages:
- Field-specific errors highlight the problematic field
- Validation runs when forms are submitted
- Errors prevent saving until resolved

## User Impact

### For Entity/Product Creators
- Forms dynamically generate based on selected type
- Only relevant fields are shown
- Validation ensures data consistency
- Type selection guides users to provide complete information

### For Searchers/Browsers
- Consistent filtering across similar entities/products
- Geographic search for location-based entities
- Advanced filtering by metadata values
- Predictable data structure

## Migration from Tags

The new system replaces the old tag-based approach:

### Old System (Tags)
```json
{
  "tags": {
    "pet_friendly": true,
    "wifi": true,
    "parking": false
  }
}
```

### New System (Typed Metadata)
```json
{
  "type": "accommodation",
  "metadata": {
    "amenities": ["wifi", "pet_friendly"],
    "parking_available": false,
    "star_rating": 4,
    "property_type": "hotel"
  }
}
```

### Benefits of New System
- **Validation**: Ensures data consistency
- **Structure**: Organized, predictable format
- **Searchability**: Efficient filtering and searching
- **Flexibility**: Easy to add new types and fields
- **User Experience**: Dynamic forms guide user input

## Troubleshooting

### Common Issues

**Forms not generating**: Check that the type has valid metadata_schema
**Validation failing**: Verify field types match expected data
**Missing options**: Ensure select fields have options array defined
**Location errors**: Confirm location_required is set correctly for entity types

### Getting Help

- Check the API documentation for technical details
- Review error messages carefully - they indicate specific issues
- Test changes in a development environment first
- Contact technical support for complex configuration issues

## Future Enhancements

The type system is designed for extensibility:
- Additional field types can be added
- Custom validation rules
- Import/export type definitions
- Type templates and cloning
- Advanced filtering options
- Integration with external data sources