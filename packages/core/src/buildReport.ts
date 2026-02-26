import { isAddress } from "viem";
import { createRpcClient, type Address } from "./utils/rpc";
import { detectProxy } from "./proxy/detectProxy";
import {
  classifyAuthority,
  traceAuthorityChain,
  type AuthorityChainNode,
} from "./authority/classifyAuthority";
import {
  getChain,
  getRpcUrl,
  type ProxyScopeChain,
} from "./chains";
import { evaluateGovernanceRisk } from "./risk/evaluator";
import type { GovernanceRisk } from "./risk/riskModel";

export interface InspectOptions {
  contractAddress: string;
  chainId: number;
  rpcUrl?: string;
}

type InspectKind = "no_contract" | "not_proxy" | "proxy";

interface BaseInspectResult {
  kind: InspectKind;
  contract: Address;
  chain: ProxyScopeChain;
}

interface NoContractResult extends BaseInspectResult {
  kind: "no_contract";
  status: string;
  resultLines: string[];
}

interface NotProxyResult extends BaseInspectResult {
  kind: "not_proxy";
  proxyType: "None";
  status: string;
  resultLines: string[];
}

interface ProxyResult extends BaseInspectResult {
  kind: "proxy";
  proxyType: string;
  implementation: Address | null;
  admin: Address | null;
  implementationSlotRaw: string | null;
  adminSlotRaw: string | null;
  authoritySummary: string;
  authorityTypeLine: string;
  authorityDetails: string[];
  authorityChain: AuthorityChainNode[];
  governanceRiskLines: string[];
}

type InspectCoreResult = NoContractResult | NotProxyResult | ProxyResult;

export interface AuthorityTopologyNode {
  address: Address;
  type: string;
  details?: string[];
  owner?: AuthorityTopologyNode;
}

export interface ProxyScopeReport {
  chain: {
    id: number;
    name: string;
    explorerBaseUrl: string;
    explorerAddressUrl: string;
  };
  contract: {
    address: Address;
    bytecodePresent: boolean;
  };
  proxy: {
    detected: boolean;
    type: string | null;
    implementation: {
      address: Address | null;
      rawSlotValue: string | null;
    } | null;
    admin: {
      address: Address | null;
      rawSlotValue: string | null;
    } | null;
  };
  upgradeAuthority: {
    depth: number;
    topology: AuthorityTopologyNode | null;
  };
  analysis: {
    upgradeable: boolean;
    ultimateControllerType: string | null;
    ultimateControllerAddress: Address | null;
    notes: string[];
  };
  risk: GovernanceRisk;
}

async function inspectCore({
  contractAddress,
  chainId,
  rpcUrl,
}: InspectOptions): Promise<InspectCoreResult> {
  if (!isAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const address = contractAddress as Address;

  const chain = getChain(chainId);
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const resolvedRpcUrl = rpcUrl ?? getRpcUrl(chain);
  const client = createRpcClient(resolvedRpcUrl);

  const bytecode = await client.getBytecode({ address });
  if (!bytecode || bytecode === "0x") {
    return {
      kind: "no_contract",
      contract: address,
      chain,
      status: "No contract bytecode found.",
      resultLines: [
        "The target address does not contain deployed contract code.",
        "This is likely an externally owned account (EOA) or an unused address.",
      ],
    };
  }

  const proxyInfo = await detectProxy(client, address);

  if (!proxyInfo.isProxy) {
    return {
      kind: "not_proxy",
      contract: address,
      chain,
      proxyType: "None",
      status: "Not detected as an EIP-1967 proxy.",
      resultLines: [
        "ProxyScope v0.1 currently analyzes only EIP-1967-style proxies.",
        "Other upgrade patterns may exist at this address but are not yet covered.",
      ],
    };
  }

  let authoritySummary = "Upgrade Authority: Unknown";
  let authorityTypeLine = "Authority Type: Unknown";
  let authorityDetails: string[] = [];
  let governanceRiskLines: string[] = [];

  const authorityChain: AuthorityChainNode[] = [];

  if (proxyInfo.adminAddress) {
    const authority = await classifyAuthority(client, proxyInfo.adminAddress);
    const chain = await traceAuthorityChain(client, proxyInfo.adminAddress);

    authoritySummary = `Upgrade Authority: ${authority.authorityAddress}`;
    authorityTypeLine = `Authority Type: ${authority.authorityType}`;
    authorityDetails = authority.details ?? [];
    authorityChain.push(...chain);

    if (authority.authorityType === "Externally Owned Account (EOA)") {
      governanceRiskLines = [
        "Governance Risk:",
        "This contract's logic can be upgraded by a single externally owned account.",
        "Users should understand that functionality may change without notice.",
      ];
    } else if (authority.authorityType === "Timelock Controller") {
      governanceRiskLines = [
        "Governance Risk:",
        "This contract's logic can be upgraded by a timelock controller.",
        "Users should review who can schedule and execute timelocked operations and whether the delay is appropriate.",
      ];
    } else if (authority.authorityType === "Gnosis Safe Multisig") {
      governanceRiskLines = [
        "Governance Risk:",
        "This contract's logic can be upgraded by a Gnosis Safe multisig authority.",
        "Users should review the Safe configuration (owners and threshold) to understand upgrade governance.",
      ];
    } else {
      governanceRiskLines = [
        "Governance Risk:",
        "This contract's logic can be upgraded by a contract authority.",
        "Users should review the authority contract to understand upgrade governance.",
      ];
    }
  } else {
    authoritySummary =
      "Upgrade Authority: Not found (admin slot empty or unsupported).";
    authorityTypeLine = "Authority Type: Unknown";
    governanceRiskLines = [
      "Governance Risk:",
      "An implementation was detected but the EIP-1967 admin slot did not resolve to an address.",
      "This may indicate a proxy variant or governance pattern not yet supported by ProxyScope v0.1.",
    ];
  }

  return {
    kind: "proxy",
    contract: address,
    chain,
    proxyType: proxyInfo.proxyType,
    implementation: proxyInfo.implementationAddress,
    admin: proxyInfo.adminAddress,
    implementationSlotRaw: proxyInfo.implementationSlotRaw as string | null,
    adminSlotRaw: proxyInfo.adminSlotRaw as string | null,
    authoritySummary,
    authorityTypeLine,
    authorityDetails,
    authorityChain,
    governanceRiskLines,
  };
}

function coreResultToReport(result: InspectCoreResult): ProxyScopeReport {
  if (result.kind === "no_contract") {
    const risk = evaluateGovernanceRisk(false, null);
    return {
      chain: {
        id: result.chain.id,
        name: result.chain.name,
        explorerBaseUrl: result.chain.explorerBaseUrl,
        explorerAddressUrl: `${result.chain.explorerBaseUrl}${result.contract}`,
      },
      contract: {
        address: result.contract,
        bytecodePresent: false,
      },
      proxy: {
        detected: false,
        type: null,
        implementation: null,
        admin: null,
      },
      upgradeAuthority: {
        depth: 0,
        topology: null,
      },
      analysis: {
        upgradeable: false,
        ultimateControllerType: null,
        ultimateControllerAddress: null,
        notes: result.resultLines,
      },
      risk,
    };
  }

  if (result.kind === "not_proxy") {
    const risk = evaluateGovernanceRisk(false, null);
    return {
      chain: {
        id: result.chain.id,
        name: result.chain.name,
        explorerBaseUrl: result.chain.explorerBaseUrl,
        explorerAddressUrl: `${result.chain.explorerBaseUrl}${result.contract}`,
      },
      contract: {
        address: result.contract,
        bytecodePresent: true,
      },
      proxy: {
        detected: false,
        type: null,
        implementation: null,
        admin: null,
      },
      upgradeAuthority: {
        depth: 0,
        topology: null,
      },
      analysis: {
        upgradeable: false,
        ultimateControllerType: null,
        ultimateControllerAddress: null,
        notes: [result.status, ...result.resultLines],
      },
      risk,
    };
  }

  const depth = result.authorityChain.length;
  const topology: AuthorityTopologyNode | null =
    depth === 0
      ? null
      : result.authorityChain.reduceRight<AuthorityTopologyNode | null>(
          (ownerNode, node) => ({
            address: node.address,
            type: node.classification.authorityType,
            details: node.classification.details,
            owner: ownerNode ?? undefined,
          }),
          null,
        );

  const ultimate =
    depth > 0 ? result.authorityChain[depth - 1] : undefined;

  const notesBase = result.governanceRiskLines.filter(
    (line) => line !== "Governance Risk:",
  );
  if (result.proxyType === "EIP-1967") {
    notesBase.unshift("Proxy uses EIP-1967 storage slots.");
  }

  const risk = evaluateGovernanceRisk(true, topology);

  return {
    chain: {
      id: result.chain.id,
      name: result.chain.name,
      explorerBaseUrl: result.chain.explorerBaseUrl,
      explorerAddressUrl: `${result.chain.explorerBaseUrl}${result.contract}`,
    },
    contract: {
      address: result.contract,
      bytecodePresent: true,
    },
    proxy: {
      detected: true,
      type: result.proxyType,
      implementation: {
        address: result.implementation,
        rawSlotValue: result.implementationSlotRaw ?? null,
      },
      admin: {
        address: result.admin,
        rawSlotValue: result.adminSlotRaw ?? null,
      },
    },
    upgradeAuthority: {
      depth,
      topology,
    },
    analysis: {
      upgradeable: true,
      ultimateControllerType: ultimate
        ? ultimate.classification.authorityType
        : null,
      ultimateControllerAddress: ultimate ? ultimate.address : null,
      notes: notesBase,
    },
    risk,
  };
}

export async function inspectContract(
  options: InspectOptions,
): Promise<ProxyScopeReport> {
  const core = await inspectCore(options);
  return coreResultToReport(core);
}

