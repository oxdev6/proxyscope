import { describe, it, expect } from "vitest";
import { evaluateGovernanceRisk } from "../src/risk/evaluator";
import type { AuthorityTopologyNode } from "../src/buildReport";
import { testAddress } from "./testHelpers";

describe("Risk Evaluation Snapshot Tests", () => {
  it("should match snapshot for Proxy → Timelock → Safe → EOA", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Contract",
      owner: {
        address: testAddress(2),
        type: "Timelock Controller",
        details: ["Minimum Delay (seconds): 172800"],
        owner: {
          address: testAddress(3),
          type: "Gnosis Safe Multisig",
          details: ["Owners: 5", "Threshold: 3"],
          owner: {
            address: testAddress(4),
            type: "Externally Owned Account (EOA)",
          },
        },
      },
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk).toMatchSnapshot();
  });

  it("should match snapshot for EOA-controlled proxy", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Externally Owned Account (EOA)",
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk).toMatchSnapshot();
  });

  it("should match snapshot for Safe-only", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Gnosis Safe Multisig",
      details: ["Owners: 3", "Threshold: 2"],
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk).toMatchSnapshot();
  });

  it("should match snapshot for non-upgradeable", () => {
    const risk = evaluateGovernanceRisk(false, null);

    expect(risk).toMatchSnapshot();
  });
});
