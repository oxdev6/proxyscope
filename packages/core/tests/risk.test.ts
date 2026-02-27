import { describe, it, expect } from "vitest";
import { evaluateGovernanceRisk } from "../src/risk/evaluator";
import type { AuthorityTopologyNode } from "../src/buildReport";
import { testAddress } from "./testHelpers";

describe("Governance Risk Evaluation", () => {
  it("should return VeryLow for non-upgradeable contracts", () => {
    const risk = evaluateGovernanceRisk(false, null);

    expect(risk.level).toBe("VeryLow");
    expect(risk.summary).toContain("not upgradeable");
    expect(risk.reasoning.length).toBeGreaterThan(0);
  });

  it("should return High for EOA-controlled proxy", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Externally Owned Account (EOA)",
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("High");
    expect(risk.summary).toContain("single externally owned account");
    expect(risk.reasoning.some((r) => r.includes("Single key compromise risk"))).toBe(true);
    expect(risk.reasoning.some((r) => r.includes("No execution delay"))).toBe(true);
  });

  it("should return Medium for Safe-only (no timelock)", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Gnosis Safe Multisig",
      details: ["Owners: 5", "Threshold: 3"],
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("multisig without timelock");
    expect(risk.reasoning.some((r) => r.includes("Multisig threshold enforced"))).toBe(true);
    expect(risk.reasoning.some((r) => r.includes("No execution delay"))).toBe(true);
  });

  it("should return Low for Timelock + Safe chain", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Timelock Controller",
      details: ["Minimum Delay (seconds): 172800"],
      owner: {
        address: testAddress(2),
        type: "Gnosis Safe Multisig",
        details: ["Owners: 5", "Threshold: 3"],
      },
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("Low");
    expect(risk.summary).toContain("timelock with multisig");
    expect(risk.reasoning.some((r) => r.includes("Execution delay present"))).toBe(true);
    expect(risk.reasoning.some((r) => r.includes("Multisig approval required"))).toBe(true);
  });

  it("should return Low for Timelock alone", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Timelock Controller",
      details: ["Minimum Delay (seconds): 86400"],
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("Low");
    expect(risk.summary).toContain("timelock");
    expect(risk.reasoning.some((r) => r.includes("Execution delay present"))).toBe(true);
  });

  it("should return Medium for unknown contract authority", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Contract",
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("undetermined governance pattern");
    expect(risk.reasoning.some((r) => r.includes("Upgrade authority is a contract"))).toBe(true);
  });

  it("should return Medium for upgradeable but no topology", () => {
    const risk = evaluateGovernanceRisk(true, null);

    expect(risk.level).toBe("Medium");
    expect(risk.summary).toContain("undetermined");
  });

  it("should detect timelock in nested chain", () => {
    const topology: AuthorityTopologyNode = {
      address: testAddress(1),
      type: "Contract",
      owner: {
        address: testAddress(2),
        type: "Timelock Controller",
        details: ["Minimum Delay (seconds): 86400"],
        owner: {
          address: testAddress(3),
          type: "Gnosis Safe Multisig",
          details: ["Owners: 3", "Threshold: 2"],
        },
      },
    };

    const risk = evaluateGovernanceRisk(true, topology);

    expect(risk.level).toBe("Low");
    expect(risk.summary).toContain("timelock with multisig");
  });
});
