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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const resp = await fetch(`${BACKEND_URL}/api/v1/public/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        source: body.source || "landing",
      }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: data?.detail || "Failed" },
        { status: resp.status }
      );
    }
    const data = await resp.json();
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
