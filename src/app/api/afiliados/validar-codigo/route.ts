import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCode = (searchParams.get('code') || '').trim();

    if (!rawCode) {
      return NextResponse.json({ valid: false, message: 'Código não informado.' }, { status: 400 });
    }

    const cleanCode = rawCode.toUpperCase();
    const db = readDb();

    // 1. Procura no banco local
    let sponsor = (db.operators || []).find(
      o => (o.affiliate_code || '').trim().toUpperCase() === cleanCode && (o.status === 'ATIVO' || (o as any).status === 'active')
    );

    // 2. Se não encontrou, consulta no Supabase
    if (!sponsor) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: supaOp } = await supabase
          .from('operators')
          .select('id, name, affiliate_code, affiliate_enabled, status')
          .ilike('affiliate_code', cleanCode)
          .maybeSingle();

        if (supaOp && (supaOp.status?.toUpperCase() === 'ATIVO' || supaOp.status?.toLowerCase() === 'active')) {
          sponsor = {
            id: supaOp.id,
            name: supaOp.name,
            affiliate_code: supaOp.affiliate_code,
            affiliate_enabled: supaOp.affiliate_enabled
          } as any;
        }
      } catch (e) {
        console.warn('[Validar Código] Erro ao consultar Supabase:', e);
      }
    }

    if (!sponsor) {
      return NextResponse.json({
        valid: false,
        message: 'Código de indicação não encontrado ou operador inativo.'
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      code: sponsor.affiliate_code || cleanCode,
      operatorId: sponsor.id,
      operatorName: sponsor.name,
      sponsorName: sponsor.name
    });
  } catch (error: any) {
    console.error('[Validar Código] Erro:', error);
    return NextResponse.json({ valid: false, message: 'Erro ao validar código.' }, { status: 500 });
  }
}
