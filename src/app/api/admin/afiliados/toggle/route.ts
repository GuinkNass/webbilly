import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { generateAffiliateCode } from '@/lib/gamification';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, enabled } = body;

    if (!operatorId) {
      return NextResponse.json({ error: 'ID do operador não informado.' }, { status: 400 });
    }

    const db = readDb();
    let operator = db.operators.find(o => o.id === operatorId);

    // Se não encontrou no db local, tenta buscar no Supabase
    if (!operator) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: supaOp } = await supabase.from('operators').select('*').eq('id', operatorId).maybeSingle();
        if (supaOp) {
          operator = {
            id: supaOp.id,
            name: supaOp.name,
            email: supaOp.email,
            status: supaOp.status || 'ATIVO',
            affiliate_enabled: supaOp.affiliate_enabled ?? false,
            affiliate_code: supaOp.affiliate_code || null,
            serialToken: supaOp.serial_token || ''
          } as any;
          db.operators.push(operator!);
        }
      } catch (err) {
        console.warn('Erro ao consultar Supabase no toggle:', err);
      }
    }

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    // Determina o novo status
    const newEnabled = typeof enabled === 'boolean' ? enabled : !Boolean(operator.affiliate_enabled);

    // Se estiver ativando e ainda não tiver código, gera código exclusivo
    let code = operator.affiliate_code;
    if (newEnabled && !code) {
      code = generateAffiliateCode(operator.name, operator.id);
      while (db.operators.some(o => o.affiliate_code === code && o.id !== operator?.id)) {
        code = `${generateAffiliateCode(operator.name, operator.id)}-${Math.floor(10 + Math.random() * 90)}`;
      }
    }

    operator.affiliate_enabled = newEnabled;
    operator.affiliate_code = code;

    writeDb(db);

    // Persiste no Supabase
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('operators')
        .update({
          affiliate_enabled: newEnabled,
          affiliate_code: code,
          updated_at: new Date().toISOString()
        })
        .eq('id', operator.id);
    } catch (e) {
      console.warn('Erro ao atualizar affiliate no Supabase:', e);
    }

    return NextResponse.json({
      success: true,
      operatorId: operator.id,
      affiliate_enabled: newEnabled,
      affiliate_code: code,
      message: newEnabled
        ? `Programa Billy Afiliados LIBERADO para ${operator.name} (Código: ${code})`
        : `Programa Billy Afiliados BLOQUEADO para ${operator.name}`
    });
  } catch (error: any) {
    console.error('[Admin Afiliados Toggle] Erro:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao alterar status do afiliado.' }, { status: 500 });
  }
}
