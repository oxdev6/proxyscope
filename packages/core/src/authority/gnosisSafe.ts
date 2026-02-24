import type { Address } from "../utils/rpc";
import type { PublicClient } from "viem";

const GNOSIS_SAFE_ABI = [
  {
    type: "function",
    name: "getOwners",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getThreshold",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface SafeInfo {
  isSafe: boolean;
  owners?: Address[];
  threshold?: bigint;
}

export async function detectGnosisSafe(
  client: PublicClient,
  address: Address,
): Promise<SafeInfo> {
  try {
    const [owners, threshold] = await Promise.all([
      client.readContract({
        address,
        abi: GNOSIS_SAFE_ABI,
        functionName: "getOwners",
      }),
      client.readContract({
        address,
        abi: GNOSIS_SAFE_ABI,
        functionName: "getThreshold",
      }),
    ]);

    if (!Array.isArray(owners) || typeof threshold !== "bigint") {
      return { isSafe: false };
    }

    return {
      isSafe: true,
      owners: owners as Address[],
      threshold,
    };
  } catch {
    // Calls reverted or functions missing – not a Gnosis Safe (or not accessible)
    return { isSafe: false };
  }
}

