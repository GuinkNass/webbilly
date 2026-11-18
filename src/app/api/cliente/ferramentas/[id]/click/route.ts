import { NextRequest, NextResponse } from 'next/server';
import { recordAffiliateToolClick } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID da ferramenta é obrigatório.' }, { status: 400 });
    }

    const clicksCount = await recordAffiliateToolClick(id);
    return NextResponse.json({ success: true, clicksCount });
  } catch (err: any) {
    console.error('[Cliente Ferramenta Click] Erro:', err);
    return NextResponse.json({ error: 'Erro ao registrar clique.' }, { status: 500 });
  }
}
