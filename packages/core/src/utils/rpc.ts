import { createPublicClient, http, type PublicClient } from "viem";

export type Address = `0x${string}`;

export function createRpcClient(rpcUrl: string): PublicClient {
  return createPublicClient({
    transport: http(rpcUrl),
  });
}

