# Enhanced Entity & Product Creation Guide

## Overview

The new entity and product creation system provides dynamic forms that adapt based on the type you select. This ensures you provide all necessary information while keeping forms focused and relevant.

## Creating Entities

### Step 1: Basic Information

1. **Name**: Give your entity a clear, descriptive name
2. **Description**: Provide additional context about your entity

### Step 2: Select Entity Type

Choose the type that best describes your entity:

- **Accommodation**: Hotels, apartments, guesthouses, vacation rentals
- **Service**: Professional services, consultations, repair services
- **Venue**: Event spaces, meeting rooms, wedding venues
- **General**: Other entities that don't fit specific categories

### Step 3: Select Sub-type (Optional)

If available, choose a more specific sub-type:

**For Accommodation:**
- **Luxury**: High-end properties with premium services
- **Budget**: Cost-effective lodging options

**For Service:**
- **Hourly**: Services billed by time
- **Project**: Fixed-scope project work

**For Venue:**
- **Indoor**: Climate-controlled indoor spaces
- **Outdoor**: Open-air venues and gardens

### Step 4: Set Location (If Required)

Some entity types require a geographic location:

**Option 1: Use Current Location**
- Click "📍 Get Current Location"
- Allow browser access to your location
- Review and confirm the detected coordinates

**Option 2: Enter Manually**
- Click "📝 Enter Manually"
- Enter latitude and longitude coordinates
- Optionally add a descriptive address
- Click "Save Location"

**Tips for Manual Entry:**
- Find coordinates on Google Maps by right-clicking a location
- Latitude ranges from -90 to 90 (negative = South)
- Longitude ranges from -180 to 180 (negative = West)
- Be precise - this affects search results and distance calculations

### Step 5: Additional Information

Based on your selected type, you'll see relevant fields:

**For Accommodation Entities:**
- Check-in/check-out times
- Maximum number of guests
- Star rating (1-5)
- Property type (hotel, apartment, etc.)
- Amenities (WiFi, parking, pool, etc.)

**For Service Entities:**
- Service duration in minutes
- Service category
- Available remotely (yes/no)
- Required qualifications

**For Venue Entities:**
- Maximum capacity
- Venue type (conference room, wedding venue, etc.)
- Available equipment
- Setup and cleanup time requirements

### Step 6: Connected Applications (Optional)

If you have applications in the system, you can connect them to your entity for integrated functionality.

## Creating Products

### Step 1: Basic Information

1. **Name**: Product or service name
2. **Description**: Detailed description of what you're offering
3. **Thumbnail URL**: Main product image (optional)
4. **Associated Entity**: Link to a related entity (optional)

### Step 2: Select Product Type

Choose the appropriate product type:

- **Service**: Professional services, consultations, appointments
- **Accommodation**: Room bookings, property rentals
- **E-commerce**: Physical or digital products for sale
- **Experience**: Tours, activities, events, classes

### Step 3: Select Sub-type (Optional)

Refine your product classification:

**For Service Products:**
- **Premium**: High-end service offerings with priority support
- **Basic**: Standard service offerings

**For Accommodation Products:**
- **Luxury**: Premium rooms with additional amenities
- **Economy**: Budget-friendly accommodation options

**For E-commerce Products:**
- **Digital**: Downloadable products (software, media)
- **Subscription**: Recurring service products

**For Experience Products:**
- **Group**: Activities designed for groups
- **Private**: One-on-one or private experiences

### Step 4: Product Photos

Add visual content to showcase your product:

1. Click "Add Photo"
2. Enter the URL of your product image
3. Repeat for multiple photos
4. Remove photos by clicking the "×" button

**Photo Tips:**
- Use high-quality, well-lit images
- Show multiple angles or aspects
- Ensure images load quickly
- Use descriptive alt text when possible

### Step 5: Product Details

Complete type-specific information:

**For Service Products:**
- Service type (consultation, maintenance, training, etc.)
- Delivery method (in-person, remote, hybrid)
- Duration in minutes
- What's included (materials, follow-up, certification)
- Prerequisites or requirements

**For Accommodation Products:**
- Room type (single, double, suite, etc.)
- Bed configuration
- Maximum occupancy
- Meal plan options
- Cancellation policy

**For E-commerce Products:**
- Product category
- Physical vs. digital product
- Weight and dimensions (for shipping)
- Warranty information
- Return policy

**For Experience Products:**
- Experience type (tour, workshop, class, etc.)
- Group size limits
- Difficulty level
- Age restrictions
- Location type (indoor, outdoor, virtual)
- Equipment provided

## Form Features

### Dynamic Field Validation

The system validates your input in real-time:

- **Required fields** are marked with a red asterisk (*)
- **Format validation** ensures data is entered correctly
- **Range validation** keeps numbers within acceptable bounds
- **Option validation** restricts selections to predefined choices

### Smart Defaults

Some fields have intelligent defaults:
- Boolean fields may default to common values
- Number fields might have suggested minimums
- Time fields could default to standard business hours

### Conditional Fields

Certain fields appear only when relevant:
- Sub-type options appear after selecting a main type
- Location fields show only when required
- Specific metadata fields depend on your type selection

## Common Field Types

### Text Fields
- Enter free-form text
- May have minimum or maximum length requirements
- Examples: names, descriptions, addresses

### Number Fields
- Enter numeric values only
- May have minimum/maximum limits
- Examples: capacity, duration, price, rating

### Boolean Fields (Checkboxes)
- Check for "yes/true", uncheck for "no/false"
- Examples: pet-friendly, WiFi available, equipment included

### Date/Time Fields
- Use the picker or enter directly
- Format: MM/DD/YYYY for dates, HH:MM for times
- Examples: check-in time, event date, availability

### Selection Fields (Dropdowns)
- Choose from predefined options
- Options are specific to your entity/product type
- Examples: categories, types, policies

### Multiple Selection (Checkboxes)
- Select multiple options from a list
- Examples: amenities, included services, equipment

## Error Handling

### Common Errors and Solutions

**"Name is required"**
- Fill in the name field - it cannot be empty

**"Type is required"**
- Select an entity or product type from the dropdown

**"Location is required for this entity type"**
- Add location information using one of the provided methods

**"Invalid format"**
- Check that dates, times, and numbers are in the correct format
- Ensure URLs start with http:// or https://

**"Value out of range"**
- Check minimum/maximum requirements for number fields
- Adjust values to fall within acceptable limits

**"Invalid selection"**
- Choose from the available dropdown options
- Don't enter custom values in selection fields

### Validation Messages

The system provides helpful feedback:
- Red highlighting indicates problematic fields
- Specific error messages explain what needs to be fixed
- Forms won't submit until all validation passes

## Best Practices

### Entity Creation

1. **Be descriptive**: Use clear names and detailed descriptions
2. **Choose accurately**: Select the most appropriate type and sub-type
3. **Provide location**: For location-based entities, accurate coordinates improve discoverability
4. **Complete metadata**: Fill in all relevant fields for better search results
5. **Connect applications**: Link related applications for integrated functionality

### Product Creation

1. **Clear naming**: Use descriptive, searchable product names
2. **Quality images**: Add multiple high-quality photos
3. **Detailed descriptions**: Explain what customers get
4. **Accurate categorization**: Choose the right type and sub-type
5. **Complete specifications**: Fill in all relevant product details
6. **Set realistic values**: Ensure capacity, duration, and other limits are accurate

### General Tips

1. **Save frequently**: The system auto-saves, but manual saves prevent data loss
2. **Preview before publishing**: Review all information for accuracy
3. **Update regularly**: Keep information current as things change
4. **Use consistent formatting**: Maintain similar styles across your entities/products
5. **Test functionality**: Verify that all features work as expected

## Getting Help

### In-App Support
- Hover over field labels for additional context
- Error messages provide specific guidance
- Form validation prevents common mistakes

### Common Questions

**Q: Can I change the type after creating an entity/product?**
A: Yes, but changing types may remove metadata that doesn't fit the new type's schema.

**Q: What happens if I don't fill in optional fields?**
A: The entity/product will be created, but search and filtering may be less effective.

**Q: Can I add custom fields not in the type definition?**
A: No, fields are defined by administrators. Contact support to request new field types.

**Q: How do I know which type to choose?**
A: Read the type descriptions carefully and choose the one that best matches your offering.

**Q: Can I have multiple entities/products of the same type?**
A: Yes, you can create as many as needed for your business.

This enhanced system ensures data consistency while providing flexibility for different business models. The dynamic forms guide you through providing complete, structured information that improves discoverability and user experience.