import type { RiskLevel } from "@proxyscope/core";

interface RiskBadgeProps {
  level: RiskLevel;
}

const riskStyles: Record<RiskLevel, string> = {
  VeryLow: "bg-slate-950 text-slate-200 border-slate-700",
  Low: "bg-slate-950 text-emerald-200 border-emerald-800/60",
  Medium: "bg-slate-950 text-amber-200 border-amber-800/60",
  High: "bg-slate-950 text-red-200 border-red-800/60",
  Critical: "bg-slate-950 text-red-100 border-red-700",
};

const riskDot: Record<RiskLevel, string> = {
  VeryLow: "bg-slate-500",
  Low: "bg-emerald-500",
  Medium: "bg-amber-600",
  High: "bg-red-600",
  Critical: "bg-red-700",
};

export function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 text-xs font-semibold ${riskStyles[level]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${riskDot[level]}`} />
      {level}
    </span>
  );
}
