"use client";

import { CopyButton } from "./CopyButton";

function shortenAddress(address: string): string {
  if (!address.startsWith("0x") || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AddressLink({
  address,
  href,
  mono = true,
  copy = true,
}: {
  address: string;
  href?: string;
  mono?: boolean;
  copy?: boolean;
}) {
  const content = (
    <span
      className={[
        "truncate",
        mono ? "font-mono text-xs sm:text-sm" : "text-sm",
        "text-accent-300 hover:text-accent-200",
      ].join(" ")}
      title={address}
    >
      {shortenAddress(address)}
    </span>
  );

  return (
    <div className="flex items-center justify-end gap-2">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 hover:underline decoration-accent-400/50 underline-offset-4"
        >
          {content}
        </a>
      ) : (
        content
      )}
      {copy ? <CopyButton value={address} /> : null}
    </div>
  );
}

