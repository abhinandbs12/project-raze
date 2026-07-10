import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

  const headers = new Headers(req.headers);
  headers.delete('host'); // Let fetch set the correct host for ngrok
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*'); 

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
