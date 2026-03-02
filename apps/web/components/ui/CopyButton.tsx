"use client";

import { useState } from "react";

export function CopyButton({
  value,
  className = "",
  label = "Copy",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // no-op: clipboard may be blocked in some contexts
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={[
        "inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200",
        "hover:bg-slate-900 active:bg-slate-800",
        "focus:outline-none focus:ring-2 focus:ring-accent-500/25",
        className,
      ].join(" ")}
      aria-label={label}
      title={label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}

