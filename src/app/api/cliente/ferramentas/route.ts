import { NextResponse } from 'next/server';
import { listAdminAffiliateTools } from '@/lib/supabase';

export async function GET() {
  try {
    const tools = await listAdminAffiliateTools(true);
    return NextResponse.json({ tools });
  } catch (err: any) {
    console.error('[Cliente Ferramentas GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao carregar ferramentas parceiras.' }, { status: 500 });
  }
}
