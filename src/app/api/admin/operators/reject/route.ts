import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { fetchAllOperatorsFromSupabase, upsertOperatorInSupabase } from '@/lib/supabase';
import { sendOperatorRejectionEmail } from '@/lib/lark-mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, reason } = body;

    if (!operatorId) {
      return NextResponse.json(
        { error: 'ID do Operador deve ser fornecido.' },
        { status: 400 }
      );
    }

    const db = readDb();

    // 1. Localiza operador
    let op = (db.operators || []).find(o => o.id === operatorId);
    if (!op) {
      const allOps = await fetchAllOperatorsFromSupabase();
      op = allOps.find(o => o.id === operatorId);
    }

    if (!op) {
      return NextResponse.json({ error: 'Candidato não localizado.' }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    // 2. Atualiza Supabase com status RECUSADO
    await upsertOperatorInSupabase({
      ...op,
      status: 'RECUSADO'
    });

    // 3. Atualiza db local
    const localOp = db.operators.find(o => o.id === operatorId);
    if (localOp) {
      localOp.status = 'RECUSADO';
      localOp.lastSync = nowIso;
    }

    // Se houver em db.candidates, atualiza também
    const localCand = db.candidates.find(c => c.email.toLowerCase() === op!.email.toLowerCase());
    if (localCand) {
      localCand.status = 'RECUSADO';
      localCand.reviewedAt = nowIso;
      localCand.notes = reason || 'Negado por contingência operacional e cota regional.';
    }

    writeDb(db);

    // 4. Dispara e-mail de contingência ao candidato
    await sendOperatorRejectionEmail({
      operadorNome: op.name,
      operadorEmailPessoal: op.email
    });

    console.log(`[Admin Operadores] Candidatura de ${op.name} (${op.email}) negada por contingência operacional.`);

    return NextResponse.json({
      success: true,
      message: `Candidatura de ${op.name} recusada por contingência com sucesso. O e-mail informativo foi enviado ao candidato.`
    });

  } catch (err: any) {
    console.error('Erro ao recusar candidatura:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar recusa de candidatura.' },
      { status: 500 }
    );
  }
}
