import { describe, it, expect, beforeEach } from "vitest";
import { classifyAuthority, traceAuthorityChain } from "../src/authority/classifyAuthority";
import type { Address } from "../src/utils/rpc";
import {
  createMockClient,
  resetMockClient,
  mockEOA,
  mockSafe,
  mockTimelock,
  mockGenericContract,
  mockOwnableContract,
  testAddress,
} from "./testHelpers";

describe("Authority Classification", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should classify EOA correctly", async () => {
    const eoaAddress = testAddress(1);

    mockEOA(mock, eoaAddress);

    const result = await classifyAuthority(mock.client, eoaAddress);

    expect(result.authorityType).toBe("Externally Owned Account (EOA)");
    expect(result.authorityAddress).toBe(eoaAddress);
  });

  it("should classify Safe multisig correctly", async () => {
    const safeAddress = testAddress(1);
    const owners = [testAddress(10), testAddress(11)] as Address[];
    const threshold = 2n;

    mockSafe(mock, safeAddress, owners, threshold);

    const result = await classifyAuthority(mock.client, safeAddress);

    expect(result.authorityType).toBe("Gnosis Safe Multisig");
    expect(result.details).toContain("Owners: 2");
    expect(result.details).toContain("Threshold: 2");
  });

  it("should classify Timelock correctly", async () => {
    const timelockAddress = testAddress(1);
    const minDelay = 172800n; // 2 days

    mockTimelock(mock, timelockAddress, minDelay);

    const result = await classifyAuthority(mock.client, timelockAddress);

    expect(result.authorityType).toBe("Timelock Controller");
    expect(result.details).toContain("Minimum Delay (seconds): 172800");
    expect(result.details).toContain("Minimum Delay (approx days): 2.00");
  });

  it("should classify generic contract when no special pattern detected", async () => {
    const contractAddress = testAddress(1);

    mockGenericContract(mock, contractAddress);

    const result = await classifyAuthority(mock.client, contractAddress);

    expect(result.authorityType).toBe("Contract");
  });
});

describe("Authority Chain Tracing", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
  });

  it("should trace chain: Contract -> owner() -> EOA", async () => {
    const adminAddress = testAddress(1);
    const ownerAddress = testAddress(2);

    // Mock admin as generic contract with owner
    mockOwnableContract(mock, adminAddress, ownerAddress);
    // Mock owner as EOA
    mockEOA(mock, ownerAddress);

    const chain = await traceAuthorityChain(mock.client, adminAddress);

    expect(chain.length).toBe(2);
    expect(chain[0].address).toBe(adminAddress);
    expect(chain[0].classification.authorityType).toBe("Contract");
    expect(chain[1].address).toBe(ownerAddress);
    expect(chain[1].classification.authorityType).toBe("Externally Owned Account (EOA)");
  });

  it("should stop at Safe (terminal node)", async () => {
    const safeAddress = testAddress(1);
    const owners = [testAddress(10)] as Address[];
    const threshold = 1n;

    mockSafe(mock, safeAddress, owners, threshold);

    const chain = await traceAuthorityChain(mock.client, safeAddress);

    expect(chain.length).toBe(1);
    expect(chain[0].classification.authorityType).toBe("Gnosis Safe Multisig");
  });

  it("should respect maxDepth limit", async () => {
    const adminAddress = testAddress(1);
    const owner1Address = testAddress(2);
    const owner2Address = testAddress(3);

    // Admin -> owner1 -> owner2 chain
    mockOwnableContract(mock, adminAddress, owner1Address);
    mockOwnableContract(mock, owner1Address, owner2Address);
    mockGenericContract(mock, owner2Address);

    const chain = await traceAuthorityChain(mock.client, adminAddress, 2);

    // maxDepth=2 means depth 0, 1, 2 = 3 nodes max
    expect(chain.length).toBeLessThanOrEqual(3);
  });
});
