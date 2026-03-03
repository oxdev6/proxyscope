"use client";

import type { ProxyScopeReport } from "@proxyscope/core";
import { RiskBadge } from "./RiskBadge";
import { TopologyTree } from "./TopologyTree";
import { ReasoningPanel } from "./ReasoningPanel";
import * as Dialog from "@radix-ui/react-dialog";
import { Card, Divider, KeyValue } from "./ui/Card";
import { AddressLink } from "./ui/Address";
import { CopyButton } from "./ui/CopyButton";

interface ReportViewProps {
  report: ProxyScopeReport;
  loading?: boolean;
}

export function ReportView({ report }: ReportViewProps) {
  const rawJson = JSON.stringify(report, null, 2);
  const contractHref = report.chain.explorerAddressUrl;
  const implHref =
    report.proxy.implementation?.address
      ? `${report.chain.explorerBaseUrl}${report.proxy.implementation.address}`
      : undefined;
  const adminHref =
    report.proxy.admin?.address
      ? `${report.chain.explorerBaseUrl}${report.proxy.admin.address}`
      : undefined;

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-5">
        <Card
          title="Contract"
          actions={
            <div className="flex items-center gap-2">
              <a
                href={contractHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-slate-300 hover:text-slate-100 hover:underline decoration-accent-400/50 underline-offset-4"
              >
                Explorer
              </a>
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-300 hover:text-slate-100"
                  >
                    Raw JSON
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(940px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                      <div>
                        <Dialog.Title className="text-sm font-semibold text-slate-100">
                          Raw report JSON
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 text-xs text-slate-400">
                          Stable, machine-readable output for integrations.
                        </Dialog.Description>
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton value={rawJson} label="Copy JSON" />
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-900"
                          >
                            Close
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                    <div className="max-h-[70vh] overflow-auto p-5">
                      <pre className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
                        {rawJson}
                      </pre>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          }
        >
          <div className="space-y-4">
            <KeyValue
              label="Address"
              value={<AddressLink address={report.contract.address} href={contractHref} />}
            />
            <KeyValue label="Network" value={report.chain.name} />
            <KeyValue
              label="Bytecode"
              value={
                report.contract.bytecodePresent ? (
                  <span className="text-sm text-slate-100">Present</span>
                ) : (
                  <span className="text-sm text-slate-400">Not found</span>
                )
              }
            />
            <KeyValue
              label="Upgradeable"
              value={report.analysis.upgradeable ? "Yes" : "No"}
            />
          </div>
        </Card>

        <Card title="Proxy metadata">
          {report.proxy.detected ? (
            <div className="space-y-4">
              <KeyValue label="Pattern" value={report.proxy.type ?? "Unknown"} />
              <Divider />
              <KeyValue
                label="Implementation"
                value={
                  report.proxy.implementation?.address ? (
                    <AddressLink
                      address={report.proxy.implementation.address}
                      href={implHref}
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Not found</span>
                  )
                }
              />
              <KeyValue
                label="Admin"
                value={
                  report.proxy.admin?.address ? (
                    <AddressLink address={report.proxy.admin.address} href={adminHref} />
                  ) : (
                    <span className="text-sm text-slate-400">Not found</span>
                  )
                }
              />
            </div>
          ) : (
            <div className="text-sm text-slate-400">
              No proxy pattern detected at this address.
            </div>
          )}
        </Card>

        <Card title="Analysis notes">
          <ul className="space-y-2">
            {report.analysis.notes.map((line, idx) => (
              <li key={idx} className="text-sm text-slate-200">
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-7">
        <Card title="Risk assessment">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <RiskBadge level={report.risk.level} />
              {report.analysis.ultimateControllerAddress ? (
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ultimate controller
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-100">
                    {report.analysis.ultimateControllerType ?? "Unknown"}
                  </div>
                  <div className="mt-1">
                    <AddressLink
                      address={report.analysis.ultimateControllerAddress}
                      href={`${report.chain.explorerBaseUrl}${report.analysis.ultimateControllerAddress}`}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Summary
              </div>
              <div className="mt-1 text-sm font-medium text-slate-100">
                {report.risk.summary}
              </div>
            </div>

            <ReasoningPanel reasoning={report.risk.reasoning} />
          </div>
        </Card>

        <Card title="Governance topology">
          {report.upgradeAuthority.topology ? (
            <TopologyTree topology={report.upgradeAuthority.topology} />
          ) : (
            <div className="text-sm text-slate-600">
              No governance topology detected.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
