"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProxyScopeReport } from "@proxyscope/core";
import { InspectForm } from "@/components/InspectForm";
import { ReportView } from "@/components/ReportView";
import { CopyButton } from "@/components/ui/CopyButton";
import { ReportSkeleton } from "@/components/ReportSkeleton";

interface HomeClientProps {
  initialAddress?: string;
  initialChainId?: number;
}

export default function HomeClient({
  initialAddress,
  initialChainId,
}: HomeClientProps) {
  const [report, setReport] = useState<ProxyScopeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAddress, setLastAddress] = useState<string | null>(initialAddress ?? null);
  const [lastChainId, setLastChainId] = useState<number | null>(
    initialChainId ?? null,
  );
  const router = useRouter();
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  const handleInspect = async (address: string, chainId: number) => {
    setLastAddress(address);
    setLastChainId(chainId);

    const params = new URLSearchParams();
    params.set("address", address);
    params.set("chainId", String(chainId));
    router.replace(`/?${params.toString()}`);

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const apiBase =
        typeof process.env.NEXT_PUBLIC_API_URL === "string" &&
        process.env.NEXT_PUBLIC_API_URL.length > 0
          ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
          : "";
      const response = await fetch(`${apiBase}/api/inspect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, chainId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to inspect contract");
      }

      const data: ProxyScopeReport = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run initial query if provided
  useEffect(() => {
    if (initialAddress && initialChainId && !report && !loading && !error) {
      void handleInspect(initialAddress, initialChainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut: "/" focuses address input
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const tag = (event.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        addressInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Governance Intelligence / Inspector
              </div>
              <div className="mt-1 flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-slate-100">
                  ProxyScope
                </h1>
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                  v0.1 · Beta
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Surfaces contract upgrade authority and governance mutability risk across
                networks.
              </p>
            </div>
            <div className="hidden text-xs text-slate-500 sm:flex sm:flex-col sm:items-end sm:gap-0.5">
              <div>Chains: 4</div>
              <div>Proxy patterns: EIP-1967</div>
              <div>Authority types: EOA · Safe · Timelock · Contract</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-[0_0_0_1px_rgba(2,6,23,0.6)] backdrop-blur">
          <InspectForm
            onSubmit={handleInspect}
            loading={loading}
            initialAddress={initialAddress}
            initialChainId={initialChainId}
            inputRef={addressInputRef}
          />
          {report && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-800 bg-slate-950 px-2 py-0.5 font-medium text-slate-200">
                  {report.chain.name} · Chain ID {report.chain.id}
                </span>
              </div>
              <div className="hidden sm:block">
                Deterministic analysis · No on-chain writes
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium text-red-200">{error}</p>
              <CopyButton value={error} label="Copy error" />
            </div>
          </div>
        )}

        {loading && <ReportSkeleton />}
        {!loading && report && <ReportView report={report} loading={loading} />}
        {!report && !error && !loading && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-8">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-slate-100">
                Inspect a contract to surface upgrade authority.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                ProxyScope detects EIP-1967 proxies, resolves upgrade authority (EOA,
                Safe, Timelock), and produces a deterministic risk assessment with
                machine-readable JSON.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

