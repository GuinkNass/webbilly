import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { recordTermsAcceptanceInSupabase } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    if (!leadToken) {
      return NextResponse.json({ error: 'leadToken é obrigatório.' }, { status: 400 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    const nowIso = new Date().toISOString();

    const db = readDb();

    // 1. Atualiza no briefing se existir
    if (db.briefings && db.briefings[leadToken]) {
      db.briefings[leadToken].accepted_terms_at = nowIso;
      db.briefings[leadToken].accepted_terms_ip = clientIp;
      db.briefings[leadToken].accepted_terms_version = 'v1.0';
    }

    // 2. Atualiza em assinaturas vinculadas se houver
    if (Array.isArray(db.subscriptions)) {
      const sub = db.subscriptions.find(s => s.leadToken === leadToken || s.siteSlug === leadToken || s.id === leadToken);
      if (sub) {
        sub.accepted_terms_at = nowIso;
        sub.accepted_terms_ip = clientIp;
        sub.accepted_terms_version = 'v1.0';
      }
    }

    writeDb(db);

    // 3. Grava prova digital no Supabase (Fonte Única de Auditoria)
    try {
      await recordTermsAcceptanceInSupabase({
        targetType: 'subscription',
        identifier: leadToken,
        ip: clientIp,
        version: 'v1.0'
      });
    } catch (sbErr) {
      console.warn('[Proposta Terms] Supabase sync warning:', sbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Aceite dos Termos de Uso registrado com sucesso com prova digital e IP.',
      accepted_at: nowIso,
      ip: clientIp,
      version: 'v1.0'
    });
  } catch (err: any) {
    console.error('[Proposta Terms Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro ao registrar aceite.' }, { status: 500 });
  }
}
