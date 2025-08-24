import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

const BACKEND_URL = (() => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    "http://localhost:8000";
  return raw.replace(/\/+$/, "");
})();

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'POST');
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'PUT');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'DELETE');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, 'PATCH');
}

async function proxyRequest(
  req: NextRequest,
  pathArray: string[],
  method: string
) {
  try {
    const path = pathArray.join('/');
    const url = new URL(req.url);
    const queryString = url.search;
    const targetUrl = `${BACKEND_URL}/api/v1/${path}${queryString}`;

    // Get the request body for non-GET requests
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await req.text();
      } catch {
        // Body might be empty, that's ok
      }
    }

    // Forward headers, excluding host and some others
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    // Get response body
    const responseBody = await response.text();
    
    // Forward response headers, excluding some
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', detail: error.message },
      { status: 500 }
    );
  }
}