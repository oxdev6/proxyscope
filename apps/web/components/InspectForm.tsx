"use client";

import { useState, type RefObject } from "react";
import * as Select from "@radix-ui/react-select";

const CHAINS = [
  { id: 1, name: "Ethereum" },
  { id: 42161, name: "Arbitrum" },
  { id: 10, name: "Optimism" },
  { id: 8453, name: "Base" },
];

interface InspectFormProps {
  onSubmit: (address: string, chainId: number) => void;
  loading: boolean;
  initialAddress?: string;
  initialChainId?: number;
  inputRef?: RefObject<HTMLInputElement>;
}

export function InspectForm({
  onSubmit,
  loading,
  initialAddress,
  initialChainId,
  inputRef,
}: InspectFormProps) {
  const [address, setAddress] = useState(initialAddress ?? "");
  const [chainId, setChainId] = useState<number>(initialChainId ?? 1);
  const addressTrimmed = address.trim();
  const isAddressLike = /^0x[a-fA-F0-9]{40}$/.test(addressTrimmed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addressTrimmed && isAddressLike) {
      onSubmit(addressTrimmed, chainId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="address"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Contract address
          </label>
          <input
            id="address"
            type="text"
            ref={inputRef}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            className={[
              "w-full rounded-lg border bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-500",
              "focus:outline-none focus:ring-2",
              isAddressLike || addressTrimmed.length === 0
                ? "border-slate-800 focus:border-accent-500 focus:ring-accent-500/25"
                : "border-red-700/60 focus:border-red-500 focus:ring-red-500/25",
            ].join(" ")}
            disabled={loading}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Paste a checksummed or lowercase EVM address.
            </p>
            {addressTrimmed.length > 0 && !isAddressLike && (
              <p className="text-xs font-medium text-red-400">Invalid address</p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-52">
          <label
            htmlFor="chain"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Network
          </label>
          <Select.Root
            value={chainId.toString()}
            onValueChange={(v) => setChainId(Number(v))}
          >
            <Select.Trigger
              id="chain"
              className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25 disabled:opacity-50"
              disabled={loading}
            >
              <Select.Value />
              <Select.Icon className="text-slate-400">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-2xl">
                <Select.Viewport className="p-1">
                  {CHAINS.map((chain) => (
                    <Select.Item
                      key={chain.id}
                      value={chain.id.toString()}
                      className="relative flex cursor-pointer select-none items-center rounded px-3 py-2 text-sm text-slate-100 outline-none hover:bg-slate-900 focus:bg-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <Select.ItemText>{chain.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className="flex items-end lg:justify-end">
          <button
            type="submit"
            disabled={loading || !addressTrimmed || !isAddressLike}
            className="w-full rounded-lg bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
          >
            {loading ? "Inspecting..." : "Inspect"}
          </button>
        </div>
      </div>
    </form>
  );
}
