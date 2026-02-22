import type { GetStorageAtReturnType, PublicClient } from "viem";
import type { Address } from "../utils/rpc";
import { IMPLEMENTATION_SLOT, ADMIN_SLOT } from "./patterns";
import { bytes32SlotToAddress } from "./readSlots";

export interface ProxyDetectionResult {
  isProxy: boolean;
  proxyType: "EIP-1967" | "None";
  implementationAddress: Address | null;
  adminAddress: Address | null;
  implementationSlotRaw: GetStorageAtReturnType | null;
  adminSlotRaw: GetStorageAtReturnType | null;
}

export async function detectProxy(
  client: PublicClient,
  contractAddress: Address,
): Promise<ProxyDetectionResult> {
  const implementationSlotRaw = await client.getStorageAt({
    address: contractAddress,
    slot: IMPLEMENTATION_SLOT,
  });
  const implementationAddress = bytes32SlotToAddress(implementationSlotRaw);

  if (!implementationAddress) {
    return {
      isProxy: false,
      proxyType: "None",
      implementationAddress: null,
      adminAddress: null,
      implementationSlotRaw: null,
      adminSlotRaw: null,
    };
  }

  const adminSlotRaw = await client.getStorageAt({
    address: contractAddress,
    slot: ADMIN_SLOT,
  });
  const adminAddress = bytes32SlotToAddress(adminSlotRaw);

  return {
    isProxy: true,
    proxyType: "EIP-1967",
    implementationAddress,
    adminAddress,
    implementationSlotRaw,
    adminSlotRaw,
  };
}

