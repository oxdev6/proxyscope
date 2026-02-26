export { IMPLEMENTATION_SLOT, ADMIN_SLOT } from "./proxy/patterns";
export type { Address } from "./utils/rpc";
export { createRpcClient } from "./utils/rpc";
export { detectProxy } from "./proxy/detectProxy";
export type { ProxyDetectionResult } from "./proxy/detectProxy";
export type {
  ProxyScopeReport,
  AuthorityTopologyNode,
  InspectOptions,
} from "./buildReport";
export { inspectContract } from "./buildReport";
export type { GovernanceRisk, RiskLevel } from "./risk/riskModel";
export { evaluateGovernanceRisk } from "./risk/evaluator";
