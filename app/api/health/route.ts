import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (() => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    "http://localhost:8000";
  return raw.replace(/\/+$/, "");
})();

export async function GET(req: NextRequest) {
  try {
    const resp = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!resp.ok) {
      return NextResponse.json(
        { error: "Backend health check failed" },
        { status: resp.status }
      );
    }
    
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Health check failed", detail: error.message },
      { status: 500 }
    );
  }
}