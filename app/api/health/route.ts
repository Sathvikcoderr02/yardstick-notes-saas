import { NextResponse } from 'next/server';
import { addCorsHeaders } from '@/lib/cors';

export async function GET() {
  const response = NextResponse.json({ status: 'ok' });
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
