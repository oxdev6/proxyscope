import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";

export type AuthorityType =
  | "Externally Owned Account (EOA)"
  | "Gnosis Safe Multisig"
  | "Timelock Controller"
  | "Contract";

export interface AuthorityClassification {
  authorityAddress: Address;
  authorityType: AuthorityType;
  details?: string[];
}

export async function classifyAuthority(
  client: PublicClient,
  address: Address,
): Promise<AuthorityClassification> {
  const bytecode = await client.getBytecode({ address });
  const isEoa = !bytecode || bytecode === "0x";

  if (isEoa) {
    return {
      authorityAddress: address,
      authorityType: "Externally Owned Account (EOA)",
    };
  }

  return {
    authorityAddress: address,
    authorityType: "Contract",
  };
}

export interface AuthorityChainNode {
  address: Address;
  classification: AuthorityClassification;
}

const OWNABLE_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

async function getOwnerIfPresent(
  client: PublicClient,
  address: Address,
): Promise<Address | null> {
  try {
    const owner = await client.readContract({
      address,
      abi: OWNABLE_ABI,
      functionName: "owner",
    });
    return owner as Address;
  } catch {
    return null;
  }
}

export async function traceAuthorityChain(
  client: PublicClient,
  start: Address,
  maxDepth = 2,
): Promise<AuthorityChainNode[]> {
  const chain: AuthorityChainNode[] = [];
  let current: Address | null = start;

  for (let depth = 0; depth <= maxDepth && current; depth++) {
    const classification = await classifyAuthority(client, current);
    chain.push({ address: current, classification });

    if (
      classification.authorityType === "Externally Owned Account (EOA)" ||
      classification.authorityType === "Gnosis Safe Multisig" ||
      classification.authorityType === "Timelock Controller"
    ) {
      break;
    }

    const nextOwner = await getOwnerIfPresent(client, current);
    if (!nextOwner) break;
    current = nextOwner;
  }

  return chain;
}
