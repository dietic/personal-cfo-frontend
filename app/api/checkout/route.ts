import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.plan || !["plus", "pro"].includes(body.plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }
    if (!body?.email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }
    const resp = await fetch(`${BACKEND_URL}/api/v1/public/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: body.plan, email: body.email }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      return NextResponse.json(
        { error: data?.detail || "Fallo creando checkout" },
        { status: resp.status }
      );
    }
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
