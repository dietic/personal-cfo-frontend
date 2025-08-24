import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

const BACKEND_URL = (() => {
  const raw =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.API_BASE ||
    "http://personalcfo-alb-821661594.us-east-1.elb.amazonaws.com";
  console.log('Environment variables:', {
    API_BASE_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
    API_BASE: process.env.API_BASE,
    raw: raw
  });
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
    
    console.log('Proxy request:', { method, targetUrl, backend: BACKEND_URL });

    // Get the request body for non-GET requests
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await req.text();
      } catch (e) {
        console.log('No body for request');
      }
    }

    // Forward headers, excluding host and some others
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    console.log('Making fetch request to:', targetUrl);
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    console.log('Response received:', response.status);

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
    console.error('Proxy error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      backend: BACKEND_URL
    });
    return NextResponse.json(
      { 
        error: 'Proxy error', 
        detail: error.message,
        backend: BACKEND_URL,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}