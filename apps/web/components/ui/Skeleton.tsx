export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-slate-900/70 ring-1 ring-slate-800",
        className,
      ].join(" ")}
    />
  );
}

