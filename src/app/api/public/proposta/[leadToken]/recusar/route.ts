import { NextRequest, NextResponse } from 'next/server';
import { POST as handleRecusar } from '@/app/api/proposta/recusar/route';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  const { leadToken } = await params;
  const body = await req.json().catch(() => ({}));
  const forwardedReq = new NextRequest(req.url, {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify({ ...body, leadToken })
  });
  return handleRecusar(forwardedReq);
}
