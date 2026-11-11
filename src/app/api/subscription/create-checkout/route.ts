import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';
import { findOrCreateCustomer, createSubscription } from '@/services/asaas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return await handleCreateCheckout(req, body);
  } catch (err: any) {
    console.error('[create-checkout error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar checkout de assinatura via Asaas.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = {
      leadId: searchParams.get('leadId') || '',
      slug: searchParams.get('slug') || searchParams.get('siteSlug') || '',
      clientName: searchParams.get('clientName') || '',
      clientPhone: searchParams.get('clientPhone') || '',
      clientEmail: searchParams.get('clientEmail') || '',
      clientCpfCnpj: searchParams.get('clientCpfCnpj') || searchParams.get('cpf') || '',
      operatorSerial:
        searchParams.get('operatorSerial') ||
        searchParams.get('operatorToken') ||
        searchParams.get('token') ||
        ''
    };
    return await handleCreateCheckout(req, body);
  } catch (err: any) {
    console.error('[create-checkout GET error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar checkout de assinatura via Asaas.' },
      { status: 500 }
    );
  }
}

async function handleCreateCheckout(req: NextRequest, body: any) {
  const db = readDb();
  if (!Array.isArray(db.subscriptions)) {
    db.subscriptions = [];
  }

  const rawSlug = body.slug || body.siteSlug || body.leadId || '';
  const siteSlug =
    rawSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'site-cliente';

  const clientName = body.clientName || body.name || `Comércio ${siteSlug}`;
  const clientPhone = body.clientPhone || body.phone || '';
  const clientEmail = body.clientEmail || body.email || `contato@${siteSlug}.webbilly.com.br`;
  const clientCpfCnpj = body.clientCpfCnpj || body.cpfCnpj || '';
  const operatorSerial =
    body.operatorSerial || body.operatorToken || body.serialToken || 'BILLY-OP-ADMIN-MASTER-2026';

  // Localiza operador pelo serialToken
  const operator =
    db.operators.find(
      o => (o.serialToken || '').trim().toUpperCase() === operatorSerial.trim().toUpperCase()
    ) || db.operators[0];

  const operatorId = operator?.id || 'OP-0001';
  const operatorName = operator?.name || 'Administrador Master Billy';

  const monthlyPrice = 29.9;
  const commissionMonthly = db.adminSettings?.operatorCommissionMonthly || 10.0;

  // Busca se há demo prévia para puxar a URL do site gerado
  const existingDemo = db.demos
    ? Object.values(db.demos).find(
        d =>
          (d.leadToken && (d.leadToken === body.leadId || d.leadToken.includes(siteSlug))) ||
          (d.deployedUrl && d.deployedUrl.includes(siteSlug))
      )
    : null;

  const deployedUrl =
    body.deployedUrl || existingDemo?.deployedUrl || `https://${siteSlug}.webbilly.com.br`;

  let sub = db.subscriptions.find(s => s.siteSlug === siteSlug);

  let asaasCustomerId = sub?.asaasCustomerId || '';
  let asaasSubscriptionId = sub?.asaasSubscriptionId || '';
  let checkoutUrl = sub?.asaasInvoiceUrl || sub?.checkoutUrl || '';

  // Integração com Asaas API v3
  try {
    // 1. Localiza ou cria o cliente no Asaas
    asaasCustomerId = await findOrCreateCustomer({
      name: clientName,
      cpfCnpj: clientCpfCnpj,
      email: clientEmail,
      phone: clientPhone
    });

    // 2. Se ainda não possui assinatura criada no Asaas ou se solicitada nova
    if (!asaasSubscriptionId) {
      const asaasSub = await createSubscription({
        customerId: asaasCustomerId,
        siteSlug,
        operatorSerial: operator?.serialToken || operatorSerial,
        value: monthlyPrice
      });
      asaasSubscriptionId = asaasSub.subscriptionId;
      checkoutUrl = asaasSub.invoiceUrl;
    }
  } catch (asaasErr: any) {
    console.error('[Asaas API Warning]:', asaasErr);
    // Se der erro na chamada do Asaas (ex: sem conexão), gera link com fallback
    if (!checkoutUrl) {
      checkoutUrl = `https://www.asaas.com/c/cobranca?slug=${siteSlug}&valor=29.90`;
    }
  }

  const nowIso = new Date().toISOString();
  const renewalIso = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

  if (sub) {
    sub.clientName = clientName;
    sub.clientPhone = clientPhone || sub.clientPhone;
    sub.clientEmail = clientEmail || sub.clientEmail;
    if (clientCpfCnpj) sub.clientCpfCnpj = clientCpfCnpj;
    sub.deployedUrl = deployedUrl || sub.deployedUrl;
    sub.checkoutUrl = checkoutUrl;
    sub.asaasInvoiceUrl = checkoutUrl;
    if (asaasCustomerId) sub.asaasCustomerId = asaasCustomerId;
    if (asaasSubscriptionId) sub.asaasSubscriptionId = asaasSubscriptionId;
    sub.updatedAt = nowIso;
  } else {
    sub = {
      id: `sub_${siteSlug}_${Date.now().toString(36)}`,
      leadToken: body.leadId || `brf_${siteSlug}`,
      siteSlug,
      clientName,
      clientPhone,
      clientEmail,
      clientCpfCnpj,
      operatorId,
      operatorName,
      operatorToken: operator?.serialToken || operatorSerial,
      monthlyPrice,
      commissionMonthly,
      status: 'pending', // aguardando pagamento para liberação
      deployedUrl,
      asaasCustomerId,
      asaasSubscriptionId,
      asaasInvoiceUrl: checkoutUrl,
      checkoutUrl,
      lastPaymentDate: undefined,
      nextRenewalDate: renewalIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    db.subscriptions.unshift(sub);
  }

  writeDb(db);

  const acceptHeader = req.headers.get('accept') || '';
  const isBrowserRequest =
    req.method === 'GET' ||
    acceptHeader.includes('text/html') ||
    !acceptHeader.includes('application/json');

  if (isBrowserRequest && sub.checkoutUrl) {
    return NextResponse.redirect(sub.checkoutUrl, 302);
  }

  return NextResponse.json({
    success: true,
    checkoutUrl: sub.checkoutUrl,
    subscriptionId: sub.asaasSubscriptionId || sub.id,
    siteSlug: sub.siteSlug,
    subdomainUrl: `https://${sub.siteSlug}.webbilly.com.br`,
    siteUrl: `https://webbilly.com.br/site/${sub.siteSlug}`,
    monthlyPrice: sub.monthlyPrice,
    status: sub.status,
    subscription: sub
  });
}
