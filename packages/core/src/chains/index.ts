import type { ProxyScopeChain } from "./types";
import { ethereum } from "./ethereum";
import { arbitrum } from "./arbitrum";
import { optimism } from "./optimism";
import { base } from "./base";

export { type ProxyScopeChain } from "./types";

export const SUPPORTED_CHAINS: ProxyScopeChain[] = [
  ethereum,
  arbitrum,
  optimism,
  base,
];

export function getChain(chainId: number): ProxyScopeChain | undefined {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getRpcUrl(chain: ProxyScopeChain): string {
  const value = process.env[chain.rpcEnvKey];
  if (!value) {
    throw new Error(
      `Missing RPC environment variable for chain ${chain.name}: ${chain.rpcEnvKey}`,
    );
  }
  return value;
}

