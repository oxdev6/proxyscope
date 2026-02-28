# ProxyScope API

Backend API server for ProxyScope web interface.

## Development

1. Ensure `@proxyscope/core` is built:
   ```bash
   npm run build -w @proxyscope/core
   ```

2. Set up environment variables (see below)

3. Start the server:
   ```bash
   npm run dev
   ```

The API will be available at [http://localhost:3001](http://localhost:3001)

## API Endpoints

### POST /api/inspect

Inspect a contract for proxy patterns and governance topology.

**Request:**
```json
{
  "address": "0x...",
  "chainId": 1,
  "rpcUrl": "https://..." // optional
}
```

**Response:**
```json
{
  "chain": { ... },
  "contract": { ... },
  "proxy": { ... },
  "upgradeAuthority": { ... },
  "analysis": { ... },
  "risk": { ... }
}
```

## Environment Variables

Required RPC URLs:
- `ETH_RPC` - Ethereum mainnet RPC URL
- `ARB_RPC` - Arbitrum RPC URL
- `OP_RPC` - Optimism RPC URL
- `BASE_RPC` - Base RPC URL

Create a `.env.local` file with these variables.
