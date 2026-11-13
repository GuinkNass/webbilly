import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { requestCancellationInSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { siteSlug, reason, operatorId } = body;

    if (!siteSlug || !reason) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: siteSlug e reason são necessários.' },
        { status: 400 }
      );
    }

    const cleanSlug = siteSlug.toLowerCase().trim();
    const cleanReason = String(reason).trim();
    const nowIso = new Date().toISOString();

    // 1. Atualiza no Supabase
    await requestCancellationInSupabase(cleanSlug, cleanReason);

    // 2. Atualiza no db.json local
    const db = readDb();
    if (Array.isArray(db.subscriptions)) {
      const sub = db.subscriptions.find(
        s => s.siteSlug?.toLowerCase() === cleanSlug || s.id?.toLowerCase() === cleanSlug
      );
      if (sub) {
        sub.cancellationRequested = true;
        sub.cancellation_requested = true;
        sub.cancellationReason = cleanReason;
        sub.cancellation_reason = cleanReason;
        sub.cancellationRequestedAt = nowIso;
        sub.cancellation_requested_at = nowIso;
        sub.updatedAt = nowIso;
        writeDb(db);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação de cancelamento registrada com sucesso. Aguardando aprovação do Administrador Master.',
      siteSlug: cleanSlug,
      cancellationRequestedAt: nowIso
    });
  } catch (err: any) {
    console.error('[Request Cancellation Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar solicitação de cancelamento.' },
      { status: 500 }
    );
  }
}
