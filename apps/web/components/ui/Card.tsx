import type { ReactNode } from "react";

export function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 shadow-[0_0_0_1px_rgba(2,6,23,0.6)] backdrop-blur">
      {title && (
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-200">
            {title}
          </h2>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function Divider() {
  return <div className="my-4 h-px w-full bg-slate-800" />;
}

export function KeyValue({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="min-w-0 text-right text-sm text-slate-100">{value}</div>
    </div>
  );
}

