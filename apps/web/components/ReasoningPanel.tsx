"use client";

import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

interface ReasoningPanelProps {
  reasoning: string[];
}

export function ReasoningPanel({ reasoning }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-100 transition-colors hover:bg-slate-900">
        <span>Why is this risk level assigned?</span>
        <svg
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Collapsible.Trigger>
      <Collapsible.Content className="mt-2 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <ul className="space-y-2">
          {reasoning.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
              <span className="mt-0.5 shrink-0 rounded-md border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide text-slate-400">
                R{idx + 1}
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
