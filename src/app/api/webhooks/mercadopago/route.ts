import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const queryType = searchParams.get('type') || searchParams.get('topic');
    const queryId = searchParams.get('id') || searchParams.get('data.id');

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    // Suporte a teste/simulação manual
    if (body.action === 'simulate_payment' || body.action === 'test_toggle') {
      const slug = body.siteSlug || body.slug;
      const sub = db.subscriptions.find(s => s.siteSlug === slug || s.id === body.subscriptionId);
      if (sub) {
        sub.status = body.status === 'suspended' ? 'suspended' : 'active';
        if (sub.status === 'active') {
          sub.lastPaymentDate = new Date().toISOString();
          sub.nextRenewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        }
        sub.updatedAt = new Date().toISOString();
        writeDb(db);
        return NextResponse.json({ success: true, message: `Status alterado para ${sub.status}`, subscription: sub });
      }
    }

    const type = body.type || body.action || queryType || '';
    const paymentId = body.data?.id || body.id || queryId;

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || db.adminSettings.mercadopagoAccessToken;

    if (mpToken && paymentId && (type.includes('payment') || queryType === 'payment')) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${mpToken.trim()}` }
        });
        if (mpRes.ok) {
          const paymentData = await mpRes.json();
          const extRef = paymentData.external_reference;
          const status = paymentData.status;

          const sub = db.subscriptions.find(s => 
            s.id === extRef || 
            (extRef && extRef.includes(s.siteSlug)) ||
            (s.mpPreferenceId && s.mpPreferenceId === paymentData.preference_id)
          );

          if (sub) {
            if (status === 'approved') {
              sub.status = 'active';
              sub.lastPaymentDate = new Date().toISOString();
              sub.nextRenewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
              sub.mpPaymentId = String(paymentId);
            } else if (status === 'refunded' || status === 'charged_back' || status === 'cancelled') {
              sub.status = 'suspended';
            }
            sub.updatedAt = new Date().toISOString();
            writeDb(db);
            console.log(`[MercadoPago Webhook] Assinatura ${sub.siteSlug} atualizada para ${sub.status}`);
          }
        }
      } catch (errApi) {
        console.warn('[MercadoPago Webhook Fetch Error]:', errApi);
      }
    }

    // Eventos de Assinatura Recorrente (Preapproval)
    if (type.includes('preapproval') || type.includes('subscription')) {
      const preapprovalId = body.data?.id || body.id || queryId;
      const status = body.status || body.data?.status;

      const sub = db.subscriptions.find(s => s.mpPreapprovalId === preapprovalId || s.id === body.external_reference);
      if (sub) {
        if (status === 'authorized') {
          sub.status = 'active';
          sub.lastPaymentDate = new Date().toISOString();
          sub.nextRenewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        } else if (status === 'paused' || status === 'cancelled') {
          sub.status = 'suspended';
        }
        sub.updatedAt = new Date().toISOString();
        writeDb(db);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[MercadoPago Webhook Exception]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Mercado Pago testa webhooks enviando requisições GET
  return NextResponse.json({ received: true, service: 'MercadoPago Webhook Billy Suite' });
}
