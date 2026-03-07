# Accurate Proposal Claims for Resubmission

Use this wording when resubmitting your proposal. Do **not** claim UUPS, Transparent, or Beacon support.

---

## What ProxyScope Does (copy-paste ready)

ProxyScope is a governance mutability inspector for EVM proxy contracts. It detects upgradeable proxy patterns and maps their governance topology—revealing who can upgrade contracts and through what mechanisms.

**Current capabilities (v0.1):**

- **Proxy detection:** EIP-1967 only (UUPS, Transparent, and Beacon are planned but not yet implemented)
- **Authority classification:** EOA, Gnosis Safe multisigs, Timelock controllers, generic contracts
- **Authority chain tracing:** Up to depth 2 (e.g. Proxy → Timelock → Safe → EOA)
- **Governance risk assessment:** VeryLow / Low / Medium / High / Critical
- **Multi-chain:** Ethereum, Arbitrum, Optimism, Base
- **Outputs:** Structured JSON and human-readable reports
- **Interfaces:** CLI, web app, programmatic API

---

## What to Avoid

- Do not claim UUPS, Transparent, or Beacon proxy detection.
- Do not overstate capabilities; describe only what is implemented and tested.

---

## Suggested Proposal Language

> ProxyScope inspects any EVM contract address and detects EIP-1967 proxy patterns, extracts implementation and admin addresses, classifies upgrade authorities (EOA, Gnosis Safe, Timelock), traces authority chains, and produces a deterministic governance risk assessment. It supports Ethereum, Arbitrum, Optimism, and Base. A working web interface and CLI are available.
