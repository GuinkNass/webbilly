import { NextRequest } from 'next/server';
import { POST as asaasPost, GET as asaasGet } from '@/app/api/asaas/create-checkout/route';

export async function POST(req: NextRequest) {
  return asaasPost(req);
}

export async function GET(req: NextRequest) {
  return asaasGet(req);
}
