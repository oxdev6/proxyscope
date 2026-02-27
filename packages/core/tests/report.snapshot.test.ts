import { describe, it, expect, beforeEach, vi } from "vitest";
import { inspectContract } from "../src/buildReport";
import type { ProxyScopeReport } from "../src/buildReport";
import * as rpcModule from "../src/utils/rpc";
import {
  createMockClient,
  resetMockClient,
  mockProxySlots,
  mockTimelock,
  mockSafe,
  mockEOA,
  testAddress,
} from "./testHelpers";

describe("ProxyScopeReport JSON Schema Snapshot", () => {
  const mock = createMockClient();

  beforeEach(() => {
    resetMockClient(mock);
    // Mock createRpcClient to return our mock client
    vi.spyOn(rpcModule, "createRpcClient").mockReturnValue(mock.client);
  });

  it("should match snapshot for Proxy → Timelock (terminal node)", async () => {
    const proxyAddress = testAddress(1);
    const implAddress = testAddress(2);
    const timelockAddress = testAddress(3);

    // Proxy has bytecode
    mock.getBytecode.mockResolvedValueOnce("0x1234" as `0x${string}`);
    // Proxy slots
    mockProxySlots(mock, proxyAddress, implAddress, timelockAddress);

    // classifyAuthority call for timelock (in inspectCore)
    mock.getBytecode.mockResolvedValueOnce("0x1234" as `0x${string}`); // has bytecode
    mock.readContract.mockResolvedValueOnce(172800n); // getMinDelay succeeds
    
    // traceAuthorityChain call - starts with timelock
    // First node: Timelock (terminal, so stops here)
    mock.getBytecode.mockResolvedValueOnce("0x1234" as `0x${string}`); // has bytecode
    mock.readContract.mockResolvedValueOnce(172800n); // getMinDelay succeeds

    const report = await inspectContract({
      contractAddress: proxyAddress,
      chainId: 1,
      rpcUrl: "https://eth.llamarpc.com",
    });

    // Normalize addresses and BigInts for snapshot stability
    const normalized = JSON.parse(
      JSON.stringify(report, (key, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      }).replace(/0x[a-f0-9]{40}/gi, "0xADDRESS"),
    );

    expect(normalized).toMatchSnapshot();
  });

  it("should match snapshot for manually constructed Proxy → Timelock → Safe → EOA topology", () => {
    // This test shows what the JSON output would look like for a full nested topology
    // Note: Current implementation stops at terminal nodes, but the schema supports nested topologies
    const report: ProxyScopeReport = {
      chain: {
        id: 1,
        name: "Ethereum",
        explorerBaseUrl: "https://etherscan.io/address/",
        explorerAddressUrl: "https://etherscan.io/address/0xADDRESS",
      },
      contract: {
        address: "0xADDRESS" as const,
        bytecodePresent: true,
      },
      proxy: {
        detected: true,
        type: "EIP-1967",
        implementation: {
          address: "0xADDRESS" as const,
          rawSlotValue: "0xADDRESS000000000000000000000002",
        },
        admin: {
          address: "0xADDRESS" as const,
          rawSlotValue: "0xADDRESS000000000000000000000003",
        },
      },
      upgradeAuthority: {
        depth: 3,
        topology: {
          address: "0xADDRESS" as const,
          type: "Timelock Controller",
          details: ["Minimum Delay (seconds): 172800", "Minimum Delay (approx days): 2.00"],
          owner: {
            address: "0xADDRESS" as const,
            type: "Gnosis Safe Multisig",
            details: ["Owners: 5", "Threshold: 3"],
            owner: {
              address: "0xADDRESS" as const,
              type: "Externally Owned Account (EOA)",
            },
          },
        },
      },
      analysis: {
        upgradeable: true,
        ultimateControllerType: "Externally Owned Account (EOA)",
        ultimateControllerAddress: "0xADDRESS" as const,
        notes: [
          "Proxy uses EIP-1967 storage slots.",
          "This contract's logic can be upgraded by a timelock controller.",
          "Users should review who can schedule and execute timelocked operations and whether the delay is appropriate.",
        ],
      },
      risk: {
        level: "Low",
        summary: "Upgrade authority uses timelock with multisig",
        reasoning: [
          "Execution delay present: upgrades require waiting period before execution.",
          "Multisig approval required: threshold signers must approve.",
          "Governance transparency: delay allows community review of proposed changes.",
        ],
      },
    };

    // Normalize addresses for snapshot stability
    const normalized = JSON.parse(
      JSON.stringify(report).replace(/0x[a-f0-9]{40}/gi, "0xADDRESS"),
    );

    expect(normalized).toMatchSnapshot();
  });
});
