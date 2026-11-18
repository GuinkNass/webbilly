import { NextRequest, NextResponse } from 'next/server';
import { getClientUserFromRequest } from '@/lib/client-auth';
import { findClientAccountById, createOrUpdateClientAccount } from '@/lib/supabase';
import { findOrCreateCustomer, createExtraEditPayment } from '@/services/asaas';

export async function POST(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    let customerId = account.asaas_customer_id;
    if (!customerId) {
      // Cria cliente no Asaas caso ainda não exista
      customerId = await findOrCreateCustomer({
        name: account.business_name,
        email: account.email || undefined,
        phone: account.phone || undefined
      });
      account.asaas_customer_id = customerId;
      await createOrUpdateClientAccount(account);
    }

    const charge = await createExtraEditPayment({
      customerId,
      siteSlug: account.site_slug,
      operatorId: account.operator_id || undefined,
      clientAccountId: account.id,
      value: 19.90
    });

    return NextResponse.json({
      success: true,
      paymentId: charge.paymentId,
      invoiceUrl: charge.invoiceUrl,
      pixPayload: charge.pixPayload,
      pixQrCodeImage: charge.pixQrCodeImage,
      dueDate: charge.dueDate,
      value: 19.90
    });
  } catch (err: any) {
    console.error('[Cliente Comprar Alteração] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro ao gerar cobrança Pix de alteração extra.' },
      { status: 500 }
    );
  }
}
