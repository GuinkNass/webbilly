import { NextRequest, NextResponse } from 'next/server';
import { SiteChangeRequestRecord } from '@/lib/db';
import { createSiteChangeRequestInSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      siteSlug,
      clientName,
      clientWhatsapp,
      operatorId,
      changesPayload
    } = body;

    if (!siteSlug) {
      return NextResponse.json(
        { error: 'O identificador do site (slug) é obrigatório.' },
        { status: 400 }
      );
    }

    if (!changesPayload || typeof changesPayload !== 'object') {
      return NextResponse.json(
        { error: 'O pacote de alterações (changesPayload) é obrigatório.' },
        { status: 400 }
      );
    }

    const cleanSlug = String(siteSlug).trim().toLowerCase();
    const id = `SCR-${cleanSlug}-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    const record: SiteChangeRequestRecord = {
      id,
      siteSlug: cleanSlug,
      site_slug: cleanSlug,
      clientName: clientName ? String(clientName).trim() : undefined,
      client_name: clientName ? String(clientName).trim() : undefined,
      clientWhatsapp: clientWhatsapp ? String(clientWhatsapp).trim() : undefined,
      client_whatsapp: clientWhatsapp ? String(clientWhatsapp).trim() : undefined,
      operatorId: operatorId ? String(operatorId).trim() : undefined,
      operator_id: operatorId ? String(operatorId).trim() : undefined,
      status: 'pending',
      changesPayload: changesPayload || {},
      changes_payload: changesPayload || {},
      createdAt: nowIso,
      created_at: nowIso
    };

    await createSiteChangeRequestInSupabase(record);

    return NextResponse.json({
      success: true,
      message: 'Solicitação de alteração enviada com sucesso! Nossa equipe técnica já recebeu seu pedido.',
      id,
      siteSlug: cleanSlug,
      createdAt: nowIso
    });
  } catch (err: any) {
    console.error('[Public Site Changes Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar solicitação de alteração.' },
      { status: 500 }
    );
  }
}
