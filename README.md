# ProxyScope

**Governance mutability inspector for EVM proxy contracts.**

ProxyScope is a CLI tool and TypeScript library that detects upgradeable proxy patterns and maps their governance topology—revealing who can upgrade contracts and through what mechanisms.

## What It Does

ProxyScope inspects any contract address and:

- ✅ Detects **EIP-1967** proxy patterns
- ✅ Extracts **implementation** and **admin** addresses
- ✅ Classifies upgrade authorities:
  - Externally Owned Accounts (EOA)
  - Gnosis Safe multisigs (with owners/threshold)
  - Timelock controllers (with delay)
  - Generic contracts
- ✅ Traces **authority chains** (e.g., Proxy → Timelock → Safe → EOA)
- ✅ **Classifies governance risk** (VeryLow/Low/Medium/High/Critical)
- ✅ Outputs structured **JSON** or human-readable reports

## Installation

```bash
npm install -g proxyscope
```

Or use as a library:

```bash
npm install @proxyscope/core
```

## Usage

### CLI

```bash
# Human-readable report
proxyscope inspect 0xYourContract --rpc https://eth.llamarpc.com

# JSON output
proxyscope inspect 0xYourContract --rpc https://eth.llamarpc.com --json
```

### Library

```typescript
import { inspectContract } from "@proxyscope/core";

const report = await inspectContract({
  contractAddress: "0x...",
  rpcUrl: "https://eth.llamarpc.com",
});

console.log(report.analysis.ultimateControllerType); // "Gnosis Safe Multisig"
```

## Example Output

```
ProxyScope Report
-----------------
Contract: 0xABC...

Proxy Type: EIP-1967
Implementation: 0xDEF...
Upgrade Authority: 0x123...
Authority Type: Gnosis Safe Multisig
  - Owners: 5
  - Threshold: 3

Upgrade Authority Chain:
  - 0x123... [Gnosis Safe Multisig]

Governance Risk Assessment:
Risk Level: Medium
Summary: Upgrade authority is a multisig without timelock

Reasoning:
  - Multisig threshold enforced: multiple signers required.
  - No execution delay: upgrades can be applied immediately after multisig approval.
  - Coordinated signer risk: if threshold signers collude, upgrades proceed without delay.

Analysis Notes:
  - Proxy uses EIP-1967 storage slots.
  - This contract's logic can be upgraded by a Gnosis Safe multisig authority.
  - Users should review the Safe configuration (owners and threshold) to understand upgrade governance.
```

## Architecture

ProxyScope is built as a monorepo:

- **`@proxyscope/core`** - Core inspection engine (publishable npm package)
- **`@proxyscope/cli`** - CLI interface
- **`@proxyscope/api`** - Backend API server (Next.js)
- **`@proxyscope/web`** - Web interface (Next.js)

## Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run CLI locally
cd packages/cli && node dist/cli.js inspect 0x... --chain 1

# Run web interface (requires API server)
npm run dev:api  # Terminal 1: Start API server (port 3001)
npm run dev:web  # Terminal 2: Start web app (port 3000)
```

See `apps/web/README.md` and `apps/api/README.md` for detailed setup. See `DEPLOYMENT.md` for production deployment (Vercel, Docker).

## Current Scope (v0.1)

Proxy detection supports **EIP-1967 only**. UUPS, Transparent, and Beacon proxies are not yet implemented.

- ✅ EIP-1967 proxy detection
- ✅ Safe multisig detection
- ✅ Timelock detection
- ✅ Authority chain tracing (depth 2)
- ✅ Governance risk classification (VeryLow/Low/Medium/High/Critical)
- ✅ Structured JSON output
- ✅ Multi-chain support (Ethereum, Arbitrum, Optimism, Base)

## Roadmap

- [ ] Additional proxy patterns (UUPS, Beacon)
- ✅ Web interface
- [ ] More authority types (Compound Governor, Aave Governance)
- [ ] ENS resolution support

## Why ProxyScope?

Most blockchain explorers show proxy addresses but don't clearly surface:

- **Who controls upgrades?** (EOA vs multisig vs timelock)
- **What's the governance topology?** (Proxy → Admin → Owner chain)
- **What are the upgrade risks?** (Single key vs multi-sig vs delayed)

ProxyScope fills this gap by providing **governance mutability transparency**—helping users understand upgradeability risks before interacting with contracts.

## License

MIT
