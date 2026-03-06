# Deployment

## Vercel (recommended)

1. **API** – Create a Vercel project with:
   - Root Directory: `apps/api`
   - Build Command: `cd ../.. && npm run build -w @proxyscope/core && npm run build`
   - Environment variables: `ETH_RPC`, `ARB_RPC`, `OP_RPC`, `BASE_RPC`

2. **Web** – Create a second Vercel project with:
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && npm run build -w @proxyscope/web`
   - Update `apps/web/next.config.js` rewrites to point `destination` to your API URL (or use `NEXT_PUBLIC_API_URL` env)

## Docker

Build and run locally:

```bash
# Build core first
npm run build -w @proxyscope/core

# API (port 3001)
cd apps/api && npm run build && npm run start

# Web (port 3000, in another terminal)
cd apps/web && npm run build && npm run start
```

Ensure `.env.local` in `apps/api/` has RPC URLs set.
