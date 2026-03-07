# Deployment

## Vercel (recommended)

Deploy the API and Web as two separate Vercel projects from this monorepo.

### Step 1: Deploy the API

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo (`oxdev6/proxyscope`).
2. Configure the project:
   - **Project Name:** `proxyscope-api` (or any name)
   - **Root Directory:** `apps/api`
   - **Build Command:** `cd ../.. && npm run build -w @proxyscope/core && npm run build`
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default, runs from repo root)

3. Add environment variables (Settings → Environment Variables):
   - `ETH_RPC` – Ethereum mainnet RPC URL (e.g. https://eth.llamarpc.com)
   - `ARB_RPC` – Arbitrum RPC URL
   - `OP_RPC` – Optimism RPC URL
   - `BASE_RPC` – Base RPC URL

4. Deploy. Note the URL (e.g. `https://proxyscope-api-xxx.vercel.app`).

### Step 2: Deploy the Web

1. Create a second Vercel project from the same repo.
2. Configure:
   - **Project Name:** `proxyscope` (or any name)
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && npm run build -w @proxyscope/web`
   - **Install Command:** `npm install`

3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` – Your API URL from Step 1 (e.g. `https://proxyscope-api-xxx.vercel.app`)

4. Deploy.

### Result

- API: `https://your-api.vercel.app/api/inspect`
- Web: `https://your-web.vercel.app` (calls API via `NEXT_PUBLIC_API_URL`)

## Local development

```bash
npm install
npm run dev:api   # Terminal 1: API on port 3001
npm run dev:web   # Terminal 2: Web on port 3000
```

Set `ETH_RPC`, `ARB_RPC`, `OP_RPC`, `BASE_RPC` in `apps/api/.env.local`.
