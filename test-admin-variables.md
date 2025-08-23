# Testing Variable Definitions in Admin

## Setup Instructions

### 1. Start Supabase (if not already running)
```bash
cd packages/api
npx supabase start
```

### 2. Start the Admin Server
```bash
cd packages/admin
deno task dev
```
The admin server will run on http://localhost:8004

### 3. Create an Admin User (if needed)
Run this SQL in Supabase Studio or psql:
```sql
-- Create admin user in auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding users table entry with admin role
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Admin User',
  'admin',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 4. Access Variable Definitions Page
1. Open http://localhost:8004
2. Log in with admin@example.com / admin123
3. Navigate to "Pricing System" → "Variable Definitions"

## Features to Test

### ✅ View Variables
- The page should display existing variable definitions
- Variables should be categorized (Pricing, Capacity, Features, etc.)
- System variables should be marked with a "System" badge

### ✅ Create New Variable
1. Click "Create Variable" button
2. Fill in the form:
   - Variable ID: `customDiscount`
   - Display Name: `Custom Discount`
   - Description: `Special discount for custom scenarios`
   - Category: `pricing`
   - Value Type: `percentage`
   - Default Value: `0`
   - Validation Rules: Set min: 0, max: 100
3. Click "Create Variable"

### ✅ Edit Variable
1. Click "Edit" on a non-system variable
2. Modify some fields
3. Click "Update Variable"

### ✅ Delete Variable
1. Click "Delete" on a non-system variable
2. Confirm the deletion

### ⚠️ System Variables
- System variables cannot be edited or deleted
- Edit and Delete buttons should be disabled for system variables

## API Endpoints

The component uses these endpoints:

- `GET /api/v1/admin/variable-definitions` - List all variables
- `POST /api/v1/admin/variable-definitions` - Create new variable
- `PUT /api/v1/admin/variable-definitions/:id` - Update variable
- `DELETE /api/v1/admin/variable-definitions/:id` - Delete variable

## Troubleshooting

### If the page shows an error:
1. Check that Supabase is running: `npx supabase status`
2. Check that the admin server is running
3. Check browser console for errors
4. Verify you're logged in as an admin user

### If variables don't load:
1. Check that the `global_variable_definitions` table exists
2. Run the migration if needed:
   ```bash
   psql $DATABASE_URL < packages/payments/database-schema.sql
   ```

### If API calls fail:
1. Check that the API edge function is deployed:
   ```bash
   cd packages/api
   npx supabase functions serve api
   ```