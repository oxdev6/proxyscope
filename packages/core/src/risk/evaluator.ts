import type { AuthorityTopologyNode } from "../buildReport";
import type { GovernanceRisk, RiskLevel } from "./riskModel";

export function evaluateGovernanceRisk(
  upgradeable: boolean,
  topology: AuthorityTopologyNode | null,
): GovernanceRisk {
  // Case 1: No proxy - not upgradeable
  if (!upgradeable) {
    return {
      level: "VeryLow",
      summary: "Contract is not upgradeable",
      reasoning: [
        "No proxy pattern detected at this address.",
        "Contract logic cannot be upgraded without redeployment.",
      ],
    };
  }

  // If upgradeable but no topology, fallback to Medium
  if (!topology) {
    return {
      level: "Medium",
      summary: "Upgrade authority pattern undetermined",
      reasoning: [
        "Proxy detected but upgrade authority could not be resolved.",
        "Governance pattern requires manual review.",
      ],
    };
  }

  const ultimateType = topology.type;
  const hasTimelock = checkForTimelockInChain(topology);

  // Case 2: EOA control
  if (ultimateType === "Externally Owned Account (EOA)") {
    return {
      level: "High",
      summary: "Upgrade authority is a single externally owned account",
      reasoning: [
        "Single key compromise risk: one compromised key enables immediate upgrades.",
        "No execution delay: upgrades can be applied immediately.",
        "No multisig protection: no threshold approval required.",
      ],
    };
  }

  // Case 3: Safe only (no timelock)
  if (ultimateType === "Gnosis Safe Multisig" && !hasTimelock) {
    return {
      level: "Medium",
      summary: "Upgrade authority is a multisig without timelock",
      reasoning: [
        "Multisig threshold enforced: multiple signers required.",
        "No execution delay: upgrades can be applied immediately after multisig approval.",
        "Coordinated signer risk: if threshold signers collude, upgrades proceed without delay.",
      ],
    };
  }

  // Case 4: Timelock + Safe (or Timelock alone)
  if (hasTimelock) {
    const hasSafe = checkForSafeInChain(topology);
    if (hasSafe) {
      return {
        level: "Low",
        summary: "Upgrade authority uses timelock with multisig",
        reasoning: [
          "Execution delay present: upgrades require waiting period before execution.",
          "Multisig approval required: threshold signers must approve.",
          "Governance transparency: delay allows community review of proposed changes.",
        ],
      };
    } else {
      // Timelock but no Safe - still Low because delay exists
      return {
        level: "Low",
        summary: "Upgrade authority uses timelock",
        reasoning: [
          "Execution delay present: upgrades require waiting period before execution.",
          "Governance transparency: delay allows review of proposed changes.",
        ],
      };
    }
  }

  // Case 5: Unknown contract authority
  if (ultimateType === "Contract") {
    return {
      level: "Medium",
      summary: "Upgrade authority is a contract with undetermined governance pattern",
      reasoning: [
        "Upgrade authority is a contract, not an EOA.",
        "Governance pattern could not be automatically determined.",
        "Manual review of authority contract recommended.",
      ],
    };
  }

  // Fallback (shouldn't reach here, but TypeScript needs it)
  return {
    level: "Medium",
    summary: "Upgrade authority classification incomplete",
    reasoning: [
      "Authority type detected but risk classification incomplete.",
      "Manual review recommended.",
    ],
  };
}

function checkForTimelockInChain(node: AuthorityTopologyNode | null): boolean {
  if (!node) return false;
  if (node.type === "Timelock Controller") return true;
  if (node.owner) return checkForTimelockInChain(node.owner);
  return false;
}

function checkForSafeInChain(node: AuthorityTopologyNode | null): boolean {
  if (!node) return false;
  if (node.type === "Gnosis Safe Multisig") return true;
  if (node.owner) return checkForSafeInChain(node.owner);
  return false;
}
