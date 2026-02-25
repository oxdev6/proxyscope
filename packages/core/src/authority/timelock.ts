import type { PublicClient } from "viem";
import type { Address } from "../utils/rpc";

const TIMELOCK_ABI = [
  {
    type: "function",
    name: "getMinDelay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface TimelockInfo {
  isTimelock: boolean;
  minDelay?: bigint;
}

export async function detectTimelock(
  client: PublicClient,
  address: Address,
): Promise<TimelockInfo> {
  try {
    const minDelay = await client.readContract({
      address,
      abi: TIMELOCK_ABI,
      functionName: "getMinDelay",
    });

    if (typeof minDelay !== "bigint") {
      return { isTimelock: false };
    }

    return {
      isTimelock: true,
      minDelay,
    };
  } catch {
    // Calls reverted or function missing – not an OZ-style TimelockController (or not accessible)
    return { isTimelock: false };
  }
}

