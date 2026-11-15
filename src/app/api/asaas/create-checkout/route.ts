import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';
import { findOrCreateCustomer, createIndividualPayment } from '@/services/asaas';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { getSiteFromCloudStorage, formatSlugToTitle, setSlugSuspended } from '@/lib/site-storage';

function extractSlug(token: string): string {
  if (!token) return '';
  let s = token.trim().toLowerCase();
  s = s.replace(/^lead_/, '').replace(/^brf_/, '').replace(/^sub_/, '');
  s = s.replace(/_[a-z0-9]{4,14}$/i, '');
  return s.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return await handleCreateCheckout(req, body);
  } catch (err: any) {
    console.error('[asaas/create-checkout POST error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao gerar cobrança no Asaas.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = {
      leadToken: searchParams.get('leadToken') || searchParams.get('leadId') || '',
      slug: searchParams.get('slug') || searchParams.get('siteSlug') || '',
      name: searchParams.get('name') || searchParams.get('clientName') || '',
      cpfCnpj: searchParams.get('cpfCnpj') || searchParams.get('cpf') || '',
      email: searchParams.get('email') || searchParams.get('clientEmail') || '',
      phone: searchParams.get('phone') || searchParams.get('clientPhone') || '',
      plan: searchParams.get('plan') || 'mensal',
      domain: searchParams.get('domain') || '',
      operatorSerial:
        searchParams.get('operatorSerial') ||
        searchParams.get('operatorToken') ||
        searchParams.get('token') ||
        ''
    };
    return await handleCreateCheckout(req, body);
  } catch (err: any) {
    console.error('[asaas/create-checkout GET error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao gerar cobrança no Asaas.' },
      { status: 500 }
    );
  }
}

async function handleCreateCheckout(req: NextRequest, body: any) {
  const leadToken = (body.leadToken || body.leadId || '').trim();
  const rawSlug = (body.slug || body.siteSlug || extractSlug(leadToken) || '').trim();

  const cleanSlug = rawSlug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'site';

  const plan = body.plan === 'proprio' ? 'proprio' : 'mensal';
  const selectedDomain = body.domain?.trim() || `${cleanSlug}.com.br`;

  // Validação de CPF ou CNPJ
  const rawCpfCnpj = body.cpfCnpj || body.clientCpfCnpj || '';
  const cleanCpfCnpj = String(rawCpfCnpj).replace(/\D/g, '');

  if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
    return NextResponse.json(
      {
        success: false,
        error: 'CPF ou CNPJ inválido. Digite 11 números para CPF ou 14 para CNPJ.'
      },
      { status: 400 }
    );
  }

  // Validação de E-mail
  const cleanEmail = (body.email || body.clientEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return NextResponse.json(
      {
        success: false,
        error: 'E-mail inválido. Informe um endereço de e-mail válido para envio do comprovante.'
      },
      { status: 400 }
    );
  }

  // Localiza dados do site em db.json ou Supabase para obter o nome oficial
  const db = readDb();
  if (!Array.isArray(db.subscriptions)) {
    db.subscriptions = [];
  }

  const demo = db.demos?.[leadToken];
  let sub = db.subscriptions.find(
    s => s.siteSlug === cleanSlug || (leadToken && s.leadToken === leadToken)
  );

  let supaSub: any = null;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`site_slug.eq.${cleanSlug},lead_token.eq.${leadToken || cleanSlug}`)
      .limit(1);
    if (data && data.length > 0) {
      supaSub = data[0];
    }
  } catch (e) {
    // ignore
  }

  let cloudData = null;
  if (!sub && !supaSub && !demo) {
    try {
      cloudData = await getSiteFromCloudStorage(cleanSlug);
    } catch (e) {
      // ignore
    }
  }

  const defaultBusinessName =
    demo?.title ||
    sub?.clientName ||
    supaSub?.client_name ||
    cloudData?.businessName ||
    formatSlugToTitle(cleanSlug);

  const clientName = (body.name || body.clientName || defaultBusinessName || 'Cliente Webbilly').trim();
  const clientPhone = (body.phone || body.clientPhone || demo?.phone || sub?.clientPhone || '').replace(/\D/g, '');

  // Operador
  const operatorSerial =
    body.operatorSerial ||
    sub?.operatorToken ||
    supaSub?.operator_token ||
    'BILLY-OP-ADMIN-MASTER-2026';

  const operator =
    db.operators.find(
      o => (o.serialToken || '').trim().toUpperCase() === operatorSerial.trim().toUpperCase()
    ) || db.operators[0];

  const operatorId = operator?.id || supaSub?.operator_id || 'OP-0001';
  const operatorName = operator?.name || supaSub?.operator_name || 'Administrador Master Billy';

  // 1. Cadastra ou localiza o cliente no Asaas
  let asaasCustomerId: string;
  try {
    asaasCustomerId = await findOrCreateCustomer({
      name: clientName,
      cpfCnpj: cleanCpfCnpj,
      email: cleanEmail,
      phone: clientPhone
    });
  } catch (custErr: any) {
    console.error('[Asaas findOrCreateCustomer Error]:', custErr);
    return NextResponse.json(
      { success: false, error: custErr.message || 'Erro ao registrar cliente no gateway Asaas.' },
      { status: 502 }
    );
  }

  // 2. Cria cobrança individual no Asaas
  const isProprio = plan === 'proprio';
  const chargeValue = isProprio ? 490.0 : 29.9;
  const description = isProprio
    ? `Site Completo + Domínio Próprio (${selectedDomain}) - Webbilly`
    : `Presença Digital Oficial - ${cleanSlug}.webbilly.com.br`;

  let paymentResult: { paymentId: string; invoiceUrl: string; dueDate: string };
  try {
    paymentResult = await createIndividualPayment({
      customerId: asaasCustomerId,
      siteSlug: cleanSlug,
      leadToken: leadToken || `lead_${cleanSlug}`,
      operatorId,
      value: chargeValue,
      description,
      dueDateDays: 2
    });
  } catch (payErr: any) {
    console.error('[Asaas createIndividualPayment Error]:', payErr);
    return NextResponse.json(
      { success: false, error: payErr.message || 'Erro ao emitir cobrança individual no Asaas.' },
      { status: 502 }
    );
  }

  const { paymentId, invoiceUrl } = paymentResult;
  const nowIso = new Date().toISOString();

  // 3. Atualiza db.subscriptions
  if (sub) {
    sub.clientName = clientName;
    sub.clientPhone = clientPhone || sub.clientPhone;
    sub.clientEmail = cleanEmail;
    sub.clientCpfCnpj = cleanCpfCnpj;
    sub.asaasCustomerId = asaasCustomerId;
    sub.asaasInvoiceUrl = invoiceUrl;
    sub.checkoutUrl = invoiceUrl;
    (sub as any).asaasPaymentId = paymentId;
    (sub as any).asaas_payment_id = paymentId;
    sub.updatedAt = nowIso;
  } else {
    sub = {
      id: `sub_${cleanSlug}`,
      leadToken: leadToken || `lead_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName,
      clientPhone,
      clientEmail: cleanEmail,
      clientCpfCnpj: cleanCpfCnpj,
      operatorId,
      operatorName,
      operatorToken: operator?.serialToken || operatorSerial,
      monthlyPrice: chargeValue,
      commissionMonthly: isProprio ? 147.0 : 10.0,
      status: 'pending',
      deployedUrl: `https://${cleanSlug}.webbilly.com.br`,
      asaasCustomerId,
      asaasInvoiceUrl: invoiceUrl,
      checkoutUrl: invoiceUrl,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    (sub as any).asaasPaymentId = paymentId;
    (sub as any).asaas_payment_id = paymentId;
    db.subscriptions.unshift(sub);
  }

  writeDb(db);

  // 4. Salva no Supabase
  try {
    await upsertSubscriptionInSupabase({
      ...sub,
      id: sub.id,
      leadToken: sub.leadToken,
      siteSlug: cleanSlug,
      clientName,
      clientPhone,
      clientEmail: cleanEmail,
      checkoutUrl: invoiceUrl,
      status: 'pending'
    });

    const supabase = getSupabaseAdmin();
    await supabase
      .from('subscriptions')
      .update({
        asaas_customer_id: asaasCustomerId,
        asaas_payment_id: paymentId,
        checkout_url: invoiceUrl,
        client_cpf_cnpj: cleanCpfCnpj,
        updated_at: nowIso
      })
      .or(`site_slug.eq.${cleanSlug},id.eq.${sub.id}`);
  } catch (supaErr) {
    console.warn('[Asaas Checkout Supabase sync warning]:', supaErr);
  }

  // 5. Garante que o site permanece bloqueado até o primeiro pagamento ser confirmado
  try {
    setSlugSuspended(cleanSlug, true);
  } catch (suspErr) {
    console.warn('[Asaas Checkout setSlugSuspended warning]:', suspErr);
  }

  // 6. Resposta
  const acceptHeader = req.headers.get('accept') || '';
  const isBrowserRequest =
    req.method === 'GET' ||
    acceptHeader.includes('text/html') ||
    !acceptHeader.includes('application/json');

  if (isBrowserRequest) {
    return NextResponse.redirect(invoiceUrl, 302);
  }

  return NextResponse.json({
    success: true,
    invoiceUrl,
    paymentId,
    customerId: asaasCustomerId,
    siteSlug: cleanSlug
  });
}
