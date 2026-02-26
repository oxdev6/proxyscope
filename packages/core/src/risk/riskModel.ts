export type RiskLevel =
  | "VeryLow"
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export interface GovernanceRisk {
  level: RiskLevel;
  summary: string;
  reasoning: string[];
}
