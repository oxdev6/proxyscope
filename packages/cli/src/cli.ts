#!/usr/bin/env node
import { Command } from "commander";
import {
  inspectContract,
  type ProxyScopeReport,
  type AuthorityTopologyNode,
} from "@proxyscope/core";

function renderTopology(node: AuthorityTopologyNode | null, indent = 0): string[] {
  if (!node) return [];
  const padding = " ".repeat(indent);
  const lines = [`${padding}- ${node.address} [${node.type}]`];
  if (node.details && node.details.length) {
    for (const d of node.details) {
      lines.push(`${padding}  - ${d}`);
    }
  }
  if (node.owner) {
    lines.push(...renderTopology(node.owner, indent + 2));
  }
  return lines;
}

function renderTextReport(report: ProxyScopeReport): string {
  const lines: string[] = [
    "ProxyScope Report",
    "-----------------",
    `Contract: ${report.contract.address}`,
  ];

  if (!report.contract.bytecodePresent) {
    lines.push(
      "",
      "Status: No contract bytecode found.",
      "",
      "Result:",
      ...report.analysis.notes.map((n) => `- ${n}`),
    );
    return lines.join("\n");
  }

  if (!report.proxy.detected) {
    lines.push(
      "",
      "Proxy Type: None",
      "Status: Not detected as an EIP-1967 proxy.",
      "",
      "Result:",
      ...report.analysis.notes.map((n) => `- ${n}`),
    );
    return lines.join("\n");
  }

  lines.push(
    "",
    `Proxy Type: ${report.proxy.type}`,
    `Implementation: ${report.proxy.implementation?.address ?? "Unknown"}`,
  );

  const adminAddress = report.proxy.admin?.address;
  if (adminAddress) {
    lines.push(`Upgrade Authority: ${adminAddress}`);
  } else {
    lines.push("Upgrade Authority: Not found (admin slot empty or unsupported).");
  }

  if (report.analysis.ultimateControllerType) {
    lines.push(
      `Authority Type: ${report.analysis.ultimateControllerType}`,
    );
  }

  if (report.upgradeAuthority.depth > 1 && report.upgradeAuthority.topology) {
    lines.push("", "Upgrade Authority Chain:");
    lines.push(...renderTopology(report.upgradeAuthority.topology, 2));
  }

  lines.push("", "Governance Risk Assessment:");
  lines.push(`Risk Level: ${report.risk.level}`);
  lines.push(`Summary: ${report.risk.summary}`);
  if (report.risk.reasoning.length > 0) {
    lines.push("");
    lines.push("Reasoning:");
    for (const reason of report.risk.reasoning) {
      lines.push(`  - ${reason}`);
    }
  }

  lines.push("", "Analysis Notes:");
  for (const note of report.analysis.notes) {
    lines.push(`  - ${note}`);
  }

  return lines.join("\n");
}

const program = new Command();

program
  .name("proxyscope")
  .description("Upgradeable proxy governance inspector")
  .version("0.1.0");

program
  .command("inspect")
  .argument("<address>", "Contract address")
  .requiredOption("--chain <id>", "Chain ID (e.g. 1 for Ethereum)")
  .option("--rpc <url>", "Override RPC URL")
  .option("--json", "Output JSON instead of text")
  .action(
    async (
      address: string,
      options: {
        chain: string;
        rpc?: string;
        json?: boolean;
      },
    ) => {
      try {
        const chainId = Number(options.chain);
        if (!Number.isInteger(chainId) || chainId <= 0) {
          throw new Error(`Invalid chain ID: ${options.chain}`);
        }

        const report = await inspectContract({
          contractAddress: address,
          chainId,
          rpcUrl: options.rpc,
        });

        if (options.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(report, null, 2));
        } else {
          // eslint-disable-next-line no-console
          console.log(renderTextReport(report));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred.";
        // eslint-disable-next-line no-console
        console.error(`Error: ${message}`);
        process.exitCode = 1;
      }
    },
  );

program.parse();

