import { NextRequest, NextResponse } from "next/server";
import { inspectContract } from "@proxyscope/core";
import type { ProxyScopeReport } from "@proxyscope/core";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, chainId, rpcUrl } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'address' field" },
        { status: 400 },
      );
    }

    if (!chainId || typeof chainId !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid 'chainId' field" },
        { status: 400 },
      );
    }

    const report: ProxyScopeReport = await inspectContract({
      contractAddress: address,
      chainId,
      rpcUrl,
    });

    return NextResponse.json(report);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
