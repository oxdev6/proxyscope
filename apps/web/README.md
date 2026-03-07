# ProxyScope Web Interface

Professional governance mutability inspector web interface.

## Development

1. Ensure `@proxyscope/core` is built:
   ```bash
   npm run build -w @proxyscope/core
   ```

2. Start the API server (required for web app):
   ```bash
   npm run dev:api
   ```

3. In another terminal, start the web app:
   ```bash
   npm run dev:web
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

The API server requires RPC URLs via environment variables:
- `ETH_RPC` - Ethereum mainnet RPC URL
- `ARB_RPC` - Arbitrum RPC URL
- `OP_RPC` - Optimism RPC URL
- `BASE_RPC` - Base RPC URL

Create a `.env.local` file in `apps/api/` with these variables.

## Architecture

- **Next.js App Router** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
