import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "marketplace",
    timestamp: new Date().toISOString(),
  });
}
