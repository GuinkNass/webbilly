import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SystemAlertRecord } from '@/lib/db';
import { requestCancellationInSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { sanitizeSlug } from '@/lib/site-storage';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      identifier,
      subdomain: rawSubdomain,
      businessName,
      whatsapp,
      docOrEmail,
      reason
    } = body;

    const rawInput = (identifier || rawSubdomain || businessName || '').trim();
    if (!rawInput && !whatsapp && !docOrEmail) {
      return NextResponse.json(
        { error: 'Por favor, informe ao menos o subdomínio/nome do comércio e seu WhatsApp.' },
        { status: 400 }
      );
    }

    if (!whatsapp || cleanDigits(whatsapp).length < 10) {
      return NextResponse.json(
        { error: 'Por favor, informe um WhatsApp válido com DDD para contato.' },
        { status: 400 }
      );
    }

    const cleanInputSlug = rawInput
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\.webbilly\.com\.br.*$/, '')
      .replace(/\/.*$/, '')
      .trim();

    const cleanInputDigits = cleanDigits(whatsapp);
    const cleanDocDigits = cleanDigits(docOrEmail);
    const cleanDocEmail = (docOrEmail || '').toLowerCase().trim();
    const nowIso = new Date().toISOString();

    const db = readDb();
    const subs = Array.isArray(db.subscriptions) ? db.subscriptions : [];

    // Localização da assinatura por múltiplos critérios inteligentes
    let matchedSub = subs.find(s => {
      const subSlug = (s.siteSlug || (s as any).slug || '').toLowerCase().trim();
      const subId = (s.id || '').toLowerCase().trim();
      const subPhone = cleanDigits(s.clientPhone || (s as any).clientWhatsapp || '');
      const subEmail = (s.clientEmail || '').toLowerCase().trim();
      const subCpfCnpj = cleanDigits(s.clientCpfCnpj || '');
      const subName = (s.clientName || '').toLowerCase().trim();

      // 1. Subdomínio exato ou slug
      if (cleanInputSlug && (subSlug === cleanInputSlug || subId === cleanInputSlug || subId === `sub_${cleanInputSlug}`)) {
        return true;
      }

      // 2. Telefone/WhatsApp idêntico (últimos 8 ou 9 dígitos)
      if (cleanInputDigits && subPhone && (subPhone.endsWith(cleanInputDigits.slice(-8)) || cleanInputDigits.endsWith(subPhone.slice(-8)))) {
        return true;
      }

      // 3. E-mail cadastrado
      if (cleanDocEmail && cleanDocEmail.includes('@') && subEmail === cleanDocEmail) {
        return true;
      }

      // 4. CPF/CNPJ
      if (cleanDocDigits && cleanDocDigits.length >= 11 && subCpfCnpj === cleanDocDigits) {
        return true;
      }

      // 5. Nome do Comércio (aproximado)
      if (rawInput && subName && (subName.includes(rawInput.toLowerCase()) || rawInput.toLowerCase().includes(subName))) {
        return true;
      }

      return false;
    });

    const targetSlug = matchedSub?.siteSlug || cleanInputSlug || sanitizeSlug(rawInput) || 'empresa';
    const targetName = matchedSub?.clientName || businessName || rawInput || 'Cliente Webbilly';
    const protocol = `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalReason = (reason || 'Solicitação direta do cliente via portal público').trim();

    // 1. Atualiza registro de assinatura no banco local e Supabase
    if (matchedSub) {
      matchedSub.cancellationRequested = true;
      matchedSub.cancellation_requested = true;
      matchedSub.cancellationReason = finalReason;
      matchedSub.cancellation_reason = finalReason;
      matchedSub.cancellationRequestedAt = nowIso;
      matchedSub.cancellation_requested_at = nowIso;
      (matchedSub as any).cancellationProtocol = protocol;
      (matchedSub as any).cancellation_protocol = protocol;
      (matchedSub as any).cancellationContactPhone = whatsapp;
    }

    // Sincroniza solicitação no Supabase
    try {
      await requestCancellationInSupabase(targetSlug, finalReason);
    } catch (e) {
      console.warn('[Solicitar Cancelamento] Aviso ao sincronizar Supabase:', e);
    }

    // 2. Cria Alerta de Alta Prioridade no sistema para o Painel Admin
    const alertId = 'alt_canc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
    const cleanPhoneForWa = cleanInputDigits.startsWith('55') ? cleanInputDigits : `55${cleanInputDigits}`;
    const waMessage = `Olá! Recebemos sua solicitação de cancelamento do site ${targetSlug}.webbilly.com.br na Webbilly (Protocolo: ${protocol}). Podemos confirmar se deseja prosseguir com o encerramento definitivo da assinatura?`;
    const waUrl = `https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(waMessage)}`;

    const newAlert: SystemAlertRecord = {
      id: alertId,
      title: `🚨 Cancelamento Solicitado: ${targetName}`,
      message: `Cliente do site ${targetSlug}.webbilly.com.br solicitou encerramento.\n• Estabelecimento: ${targetName}\n• WhatsApp: ${whatsapp}\n• Documento/E-mail: ${docOrEmail || 'Não informado'}\n• Motivo: ${finalReason}\n• Protocolo: ${protocol}`,
      priority: 'urgent',
      action_label: 'Chamar no WhatsApp',
      action_url: waUrl,
      is_active: true,
      created_by: 'cliente_portal',
      created_at: nowIso,
      type: 'cancellation_request',
      target_role: 'admin',
      site_slug: targetSlug,
      client_name: targetName,
      client_whatsapp: whatsapp,
      subscription_id: matchedSub?.id || undefined,
      protocol: protocol
    };

    if (!Array.isArray(db.systemAlerts)) {
      db.systemAlerts = [];
    }
    db.systemAlerts.unshift(newAlert);
    writeDb(db);

    // Tenta persistir alerta na tabela alerts / system_alerts do Supabase
    try {
      const supabase = getSupabaseAdmin();
      const alertPayload = {
        id: newAlert.id,
        title: newAlert.title,
        message: newAlert.message,
        priority: newAlert.priority,
        action_label: newAlert.action_label,
        action_url: newAlert.action_url,
        is_active: true,
        created_by: newAlert.created_by,
        created_at: newAlert.created_at,
        type: newAlert.type,
        target_role: newAlert.target_role,
        site_slug: newAlert.site_slug,
        client_name: newAlert.client_name,
        client_whatsapp: newAlert.client_whatsapp,
        subscription_id: newAlert.subscription_id,
        protocol: newAlert.protocol
      } as any;

      const { error: insErr } = await supabase.from('alerts').insert(alertPayload);
      if (insErr) {
        await supabase.from('system_alerts').insert(alertPayload);
      }
    } catch {}

    return NextResponse.json({
      success: true,
      protocol,
      siteSlug: targetSlug,
      clientName: targetName,
      message: 'Recebemos sua solicitação! Nossa equipe entrará em contato pelo seu WhatsApp em breve para confirmar e enviar o comprovante de encerramento.'
    });

  } catch (err: any) {
    console.error('[Solicitar Cancelamento API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao registrar solicitação de cancelamento.' },
      { status: 500 }
    );
  }
}
