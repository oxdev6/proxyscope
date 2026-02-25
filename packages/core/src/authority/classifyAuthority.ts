import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import { detectGnosisSafe } from "./gnosisSafe";
import { detectTimelock } from "./timelock";

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

  const timelockInfo = await detectTimelock(client, address);
  if (timelockInfo.isTimelock && timelockInfo.minDelay !== undefined) {
    const seconds = timelockInfo.minDelay;
    const daysApprox = Number(seconds) / (60 * 60 * 24);
    const details: string[] = [
      `Minimum Delay (seconds): ${seconds.toString()}`,
      `Minimum Delay (approx days): ${daysApprox.toFixed(2)}`,
    ];

    return {
      authorityAddress: address,
      authorityType: "Timelock Controller",
      details,
    };
  }

  const safeInfo = await detectGnosisSafe(client, address);
  if (safeInfo.isSafe && safeInfo.owners && safeInfo.threshold !== undefined) {
    const ownersCount = safeInfo.owners.length;
    const threshold = safeInfo.threshold;
    const details: string[] = [
      `Owners: ${ownersCount}`,
      `Threshold: ${threshold.toString()}`,
    ];

    return {
      authorityAddress: address,
      authorityType: "Gnosis Safe Multisig",
      details,
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
