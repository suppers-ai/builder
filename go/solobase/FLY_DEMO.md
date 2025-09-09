# Solobase Demo - Fly.io Deployment

## Quick Deploy (2 minutes)

```bash
# From the go/ parent directory (important!)
cd /home/joris/Projects/suppers-ai/builder/go

# Install flyctl if needed
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy with the demo config (builds from parent directory)
fly deploy --config solobase/fly-demo.toml --dockerfile solobase/Dockerfile.fly

# When prompted:
# - Choose app name or accept default
# - Select region (closest to you)
# - Don't add PostgreSQL
# - Don't add Redis
# - Type 'y' to deploy
```

That's it! Your demo is live at `https://your-app-name.fly.dev`

## How It Works

- **Single shared instance** for all visitors
- **In-memory database** (SQLite `:memory:`)
- **Stays running** (min_machines_running = 1)
- **Reset manually** or via cron job

## Files Needed

Just 2 files:
- `Dockerfile` - Builds the app
- `fly.toml` - Fly.io config

## Reset Options

### Manual Reset
```bash
fly apps restart solobase-demo
```

### Automatic Reset (every 10 minutes)
Add to your crontab:
```bash
*/10 * * * * fly apps restart solobase-demo
```

Or use GitHub Actions (add to `.github/workflows/reset.yml`):
```yaml
on:
  schedule:
    - cron: '*/10 * * * *'
jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -L https://fly.io/install.sh | sh
          fly apps restart solobase-demo --access-token ${{ secrets.FLY_API_TOKEN }}
```

## Cost

- **Single VM running 24/7**: ~$1.58/month
- **Free tier**: Covers 3 VMs, so demo is FREE
- **After free tier**: Still just ~$1.58/month