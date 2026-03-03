import type { AuthorityTopologyNode } from "@proxyscope/core";

interface TopologyTreeProps {
  topology: AuthorityTopologyNode;
  rootLabel?: string;
}

export function TopologyTree({ topology, rootLabel = "upgrade authority" }: TopologyTreeProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40">
      <div className="p-4">
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {rootLabel}
        </div>
        <Node node={topology} isRoot />
      </div>
    </div>
  );
}

function Node({
  node,
  isRoot = false,
}: {
  node: AuthorityTopologyNode;
  isRoot?: boolean;
}) {
  const badge = typeBadge(node.type);

  return (
    <div className={["relative", !isRoot ? "mt-6" : ""].join(" ")}>
      {!isRoot ? (
        <>
          <div className="absolute -top-6 left-[11px] h-6 w-px bg-slate-800" />
          <div className="absolute top-[23px] left-[11px] h-[calc(100%-23px)] w-px bg-slate-800" />
          <div className="absolute -top-5 left-[26px] text-[10px] font-mono text-slate-500">
            owner()
          </div>
        </>
      ) : (
        <div className="absolute top-[23px] left-[11px] h-[calc(100%-23px)] w-px bg-slate-800" />
      )}

      <div className="relative flex gap-3">
        <div className="relative z-10 mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-slate-800 bg-slate-950">
          <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {node.type}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${badge.pill}`}
              >
                {badge.label}
              </span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-200">
              {node.address}
            </div>
            {node.details && node.details.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {node.details.map((detail, idx) => (
                  <span
                    key={idx}
                    className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {node.owner ? (
        <div className="ml-[6px] pl-6">
          <Node node={node.owner} />
        </div>
      ) : null}
    </div>
  );
}

function typeBadge(type: AuthorityTopologyNode["type"]): {
  label: string;
  pill: string;
  dot: string;
} {
  switch (type) {
    case "Externally Owned Account (EOA)":
      return {
        label: "EOA",
        pill: "border-slate-700 bg-slate-950 text-slate-200",
        dot: "bg-slate-600",
      };
    case "Gnosis Safe Multisig":
      return {
        label: "Multisig",
        pill: "border-accent-800/60 bg-slate-950 text-accent-200",
        dot: "bg-accent-600",
      };
    case "Timelock Controller":
      return {
        label: "Timelock",
        pill: "border-emerald-800/60 bg-slate-950 text-emerald-200",
        dot: "bg-green-600",
      };
    default:
      return {
        label: "Contract",
        pill: "border-slate-800 bg-slate-950 text-slate-200",
        dot: "bg-slate-500",
      };
  }
}
