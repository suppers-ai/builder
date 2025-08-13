# Monthly Bandwidth Reset Setup

This document explains how to set up the monthly bandwidth reset cronjob for the Suppers AI Builder platform.

## Overview

The bandwidth tracking system limits users to 250MB of download bandwidth per month by default. To reset these limits monthly, we need to set up a scheduled task (cronjob) that calls the reset function.

## Edge Function

The reset functionality is implemented as a Supabase Edge Function in:
```
packages/api/supabase/functions/reset-monthly-bandwidth/index.ts
```

This function:
- Resets all users' `bandwidth_used` to 0
- Logs the reset operation
- Returns success/failure status

## Deployment

Deploy the edge function to Supabase:

```bash
# From the packages/api directory
deno task api:deploy
```

Or manually:
```bash
supabase functions deploy reset-monthly-bandwidth
```

## Cronjob Setup Options

### Option 1: Supabase pg_cron (Recommended)

If you have access to Supabase's pg_cron extension:

```sql
-- Run on the 1st day of every month at 12:01 AM UTC
SELECT cron.schedule(
  'monthly-bandwidth-reset',
  '1 0 1 * *',
  $$
  SELECT net.http_post(
    'https://your-project.supabase.co/functions/v1/reset-monthly-bandwidth',
    '{}',
    'application/json',
    '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  );
  $$
);
```

### Option 2: External Cron Service

Use services like GitHub Actions, Vercel Cron, or a VPS crontab:

```bash
# Add to your crontab (runs 1st day of month at midnight)
0 0 1 * * curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/reset-monthly-bandwidth
```

### Option 3: GitHub Actions

Create `.github/workflows/monthly-bandwidth-reset.yml`:

```yaml
name: Monthly Bandwidth Reset
on:
  schedule:
    # Run on the 1st day of every month at 12:01 AM UTC
    - cron: '1 0 1 * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  reset-bandwidth:
    runs-on: ubuntu-latest
    steps:
      - name: Reset Monthly Bandwidth
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://your-project.supabase.co/functions/v1/reset-monthly-bandwidth
```

## Security Considerations

1. **Service Role Key**: Keep your Supabase service role key secure and use it only for admin operations
2. **Access Control**: Consider adding API key verification to the reset function if needed
3. **Monitoring**: Set up alerts to ensure the reset runs successfully each month

## Testing

Test the reset function manually:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/reset-monthly-bandwidth
```

## Monitoring

Check the function logs in your Supabase dashboard under Functions > reset-monthly-bandwidth to monitor successful resets.