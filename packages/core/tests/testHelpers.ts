import { vi, type Mock } from "vitest";
import type { PublicClient } from "viem";
import type { Address } from "../src/utils/rpc";

export interface MockClient {
  client: PublicClient;
  getBytecode: Mock;
  getStorageAt: Mock;
  readContract: Mock;
}

/**
 * Creates a fresh mock client with all methods reset.
 * Use this at the start of each test.
 */
export function createMockClient(): MockClient {
  const getBytecode = vi.fn();
  const getStorageAt = vi.fn();
  const readContract = vi.fn();

  const client = {
    getBytecode,
    getStorageAt,
    readContract,
  } as unknown as PublicClient;

  return { client, getBytecode, getStorageAt, readContract };
}

/**
 * Resets all mocks to a clean state.
 * Useful in beforeEach hooks.
 */
export function resetMockClient(mock: MockClient): void {
  mock.getBytecode.mockReset();
  mock.getStorageAt.mockReset();
  mock.readContract.mockReset();
}

/**
 * Mocks an EOA (Externally Owned Account) - no bytecode.
 */
export function mockEOA(
  mock: MockClient,
  address: Address,
): void {
  mock.getBytecode.mockResolvedValueOnce("0x");
}

/**
 * Mocks a generic contract with bytecode.
 */
export function mockContract(
  mock: MockClient,
  address: Address,
  bytecode: `0x${string}` = "0x1234" as `0x${string}`,
): void {
  mock.getBytecode.mockResolvedValueOnce(bytecode);
}

/**
 * Mocks a Timelock contract.
 * Handles the correct call sequence for classifyAuthority.
 */
export function mockTimelock(
  mock: MockClient,
  address: Address,
  minDelay: bigint,
): void {
  mockContract(mock, address);
  // classifyAuthority checks timelock first (getMinDelay)
  mock.readContract.mockResolvedValueOnce(minDelay);
}

/**
 * Mocks a Gnosis Safe multisig contract.
 * Handles the correct call sequence: timelock check fails, then Safe detection succeeds.
 */
export function mockSafe(
  mock: MockClient,
  address: Address,
  owners: Address[],
  threshold: bigint,
): void {
  mockContract(mock, address);
  // classifyAuthority checks timelock first, then safe
  // Promise.all means both getOwners and getThreshold are called
  mock.readContract
    .mockRejectedValueOnce(new Error("not timelock")) // getMinDelay fails
    .mockResolvedValueOnce(owners) // getOwners succeeds
    .mockResolvedValueOnce(threshold); // getThreshold succeeds
}

/**
 * Mocks a generic contract (not Safe, not Timelock).
 * Handles all the failed detection attempts.
 */
export function mockGenericContract(
  mock: MockClient,
  address: Address,
): void {
  mockContract(mock, address);
  // Not timelock (getMinDelay fails)
  // Not safe (getOwners + getThreshold both fail in Promise.all)
  mock.readContract
    .mockRejectedValueOnce(new Error("not timelock")) // getMinDelay fails
    .mockRejectedValueOnce(new Error("not safe")) // getOwners fails
    .mockRejectedValueOnce(new Error("not safe")); // getThreshold also called in Promise.all
}

/**
 * Mocks an Ownable contract that exposes owner().
 * Sets up: generic contract + owner() call succeeds.
 */
export function mockOwnableContract(
  mock: MockClient,
  contractAddress: Address,
  ownerAddress: Address,
): void {
  mockGenericContract(mock, contractAddress);
  // owner() call succeeds
  mock.readContract.mockResolvedValueOnce(ownerAddress);
}

/**
 * Mocks EIP-1967 proxy storage slots.
 * Formats addresses correctly as 32-byte slot values (last 20 bytes).
 */
export function mockProxySlots(
  mock: MockClient,
  proxyAddress: Address,
  implementationAddress: Address | null,
  adminAddress: Address | null,
): void {
  const implSlotRaw = implementationAddress
    ? (`0x${"0".repeat(24)}${implementationAddress.slice(2)}` as `0x${string}`)
    : ("0x" as `0x${string}`);
  const adminSlotRaw = adminAddress
    ? (`0x${"0".repeat(24)}${adminAddress.slice(2)}` as `0x${string}`)
    : ("0x" as `0x${string}`);

  mock.getStorageAt
    .mockResolvedValueOnce(implSlotRaw)
    .mockResolvedValueOnce(adminSlotRaw);
}

/**
 * Mocks a complete proxy inspection scenario.
 * Useful for integration-style tests.
 */
export function mockProxyInspection(
  mock: MockClient,
  proxyAddress: Address,
  implementationAddress: Address,
  adminAddress: Address,
  adminType: "EOA" | "Safe" | "Timelock" | "Contract",
  adminConfig?: {
    owners?: Address[];
    threshold?: bigint;
    minDelay?: bigint;
    owner?: Address;
  },
): void {
  // Proxy has bytecode
  mock.getBytecode.mockResolvedValueOnce("0x1234" as `0x${string}`);
  // Proxy slots
  mockProxySlots(mock, proxyAddress, implementationAddress, adminAddress);

  // Admin classification
  switch (adminType) {
    case "EOA":
      mockEOA(mock, adminAddress);
      break;
    case "Safe":
      if (!adminConfig?.owners || adminConfig.threshold === undefined) {
        throw new Error("Safe requires owners and threshold");
      }
      mockSafe(mock, adminAddress, adminConfig.owners, adminConfig.threshold);
      break;
    case "Timelock":
      if (adminConfig?.minDelay === undefined) {
        throw new Error("Timelock requires minDelay");
      }
      mockTimelock(mock, adminAddress, adminConfig.minDelay);
      break;
    case "Contract":
      if (adminConfig?.owner) {
        mockOwnableContract(mock, adminAddress, adminConfig.owner);
      } else {
        mockGenericContract(mock, adminAddress);
      }
      break;
  }
}

/**
 * Helper to create test addresses with predictable patterns.
 */
export function testAddress(index: number): Address {
  const hex = index.toString(16).padStart(40, "0");
  return `0x${hex}` as Address;
}
