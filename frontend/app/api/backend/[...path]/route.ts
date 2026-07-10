import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://processor-packages-nextel-both.trycloudflare.com';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(req, resolvedParams.path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(req, resolvedParams.path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(req, resolvedParams.path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> | { path: string[] } }) {
  const resolvedParams = await Promise.resolve(params);
  return proxyRequest(req, resolvedParams.path);
}

async function proxyRequest(req: NextRequest, pathArray: string[]) {
  const path = pathArray.join('/');
  const searchParams = req.nextUrl.searchParams.toString();
  const targetUrl = `${API_BASE}/${path}${searchParams ? `?${searchParams}` : ''}`;

  // Build clean headers - force identity encoding so we get raw JSON back (no gzip)
  const headers = new Headers();
  headers.set('accept', 'application/json');
  headers.set('accept-encoding', 'identity'); // prevents gzip/deflate compression
  headers.set('content-type', req.headers.get('content-type') || 'application/json');
  headers.set('X-Raze-API-Key', 'raze-ent-k3yX9pQmL2vZnR7wT4uA'); // enterprise API key

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
