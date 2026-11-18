import { NextRequest, NextResponse } from 'next/server';
import { getClientUserFromRequest } from '@/lib/client-auth';
import { findClientAccountById, getSupabaseAdmin } from '@/lib/supabase';
import { listAsaasPayments, getPaymentPixQrCode } from '@/services/asaas';
import { readDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    // Busca detalhes da assinatura no db ou supabase
    let sub: any = null;
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('site_slug', account.site_slug)
        .maybeSingle();
      if (data) sub = data;
    } catch (_) {}

    if (!sub) {
      const db = readDb();
      sub = (db.subscriptions || []).find(s => s.siteSlug?.toLowerCase() === account.site_slug.toLowerCase());
    }

    const asaasCustId = account.asaas_customer_id || sub?.asaas_customer_id || sub?.asaasCustomerId;
    let payments: any[] = [];
    let activePixPayment: any = null;

    if (asaasCustId) {
      try {
        const asaasRes = await listAsaasPayments({
          customer: asaasCustId,
          limit: 10
        });
        payments = (asaasRes.data || []).map((p: any) => ({
          id: p.id,
          value: p.value,
          netValue: p.netValue,
          status: p.status, // 'CONFIRMED', 'RECEIVED', 'PENDING', 'OVERDUE'
          billingType: p.billingType,
          dueDate: p.dueDate,
          paymentDate: p.paymentDate || p.clientPaymentDate,
          invoiceUrl: p.invoiceUrl || p.bankSlipUrl || `https://www.asaas.com/i/${p.id}`,
          description: p.description
        }));

        // Se houver fatura pendente, busca os dados de Pix Copia e Cola / QR Code
        const pendingPayment = payments.find((p: any) => p.status === 'PENDING' || p.status === 'OVERDUE');
        if (pendingPayment) {
          try {
            const pixInfo = await getPaymentPixQrCode(pendingPayment.id);
            if (pixInfo) {
              activePixPayment = {
                paymentId: pendingPayment.id,
                value: pendingPayment.value,
                dueDate: pendingPayment.dueDate,
                invoiceUrl: pendingPayment.invoiceUrl,
                pixPayload: pixInfo.payload,
                pixQrCodeImage: pixInfo.encodedImage
              };
            }
          } catch (_) {}
        }
      } catch (err) {
        console.warn('[Cliente Cobranças] Aviso ao consultar Asaas:', err);
      }
    }

    return NextResponse.json({
      planType: account.plan_type,
      monthlyPrice: account.plan_type === 'custom_domain_490' ? 0 : 29.90,
      nextRenewalDate: sub?.next_renewal_date || sub?.nextRenewalDate || account.edits_reset_at,
      status: sub?.status || account.status,
      payments,
      activePixPayment
    });
  } catch (err: any) {
    console.error('[Cliente Cobranças GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros.' }, { status: 500 });
  }
}
