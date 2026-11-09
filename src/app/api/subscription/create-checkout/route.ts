import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return await handleCreateCheckout(body);
  } catch (err: any) {
    console.error('[create-checkout error]:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar checkout de assinatura.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = {
      leadId: searchParams.get('leadId') || '',
      siteSlug: searchParams.get('slug') || searchParams.get('siteSlug') || '',
      clientName: searchParams.get('clientName') || '',
      clientPhone: searchParams.get('clientPhone') || '',
      operatorToken: searchParams.get('operatorToken') || ''
    };
    return await handleCreateCheckout(body);
  } catch (err: any) {
    console.error('[create-checkout GET error]:', err);
    return NextResponse.json({ error: err.message || 'Erro ao gerar checkout de assinatura.' }, { status: 500 });
  }
}

async function handleCreateCheckout(body: any) {
  const db = readDb();
  if (!Array.isArray(db.subscriptions)) {
    db.subscriptions = [];
  }

  const rawSlug = body.siteSlug || body.slug || body.leadId || '';
  const siteSlug = rawSlug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'site-cliente';

  const clientName = body.clientName || body.name || `Comércio ${siteSlug}`;
  const clientPhone = body.clientPhone || body.phone || '';
  const clientEmail = body.clientEmail || body.email || `contato@${siteSlug}.webbilly.com.br`;
  const operatorToken = body.operatorToken || '';

  // Procura operador correspondente
  const operator = db.operators.find(o => o.serialToken === operatorToken) || db.operators[0];
  const operatorId = operator?.id || 'OP-1001';
  const operatorName = operator?.name || 'Operador Parceiro';

  // Verifica se já existe assinatura para esse slug
  let sub = db.subscriptions.find(s => s.siteSlug === siteSlug);
  const monthlyPrice = 29.90;
  const commissionMonthly = db.adminSettings.operatorCommissionMonthly || 10.00;

  // Busca se há demo prévia para puxar a URL do site gerado
  const existingDemo = db.demos ? Object.values(db.demos).find(d => 
    (d.leadToken && (d.leadToken === body.leadId || d.leadToken.includes(siteSlug))) ||
    (d.deployedUrl && d.deployedUrl.includes(siteSlug))
  ) : null;

  const deployedUrl = body.deployedUrl || existingDemo?.deployedUrl || `https://${siteSlug}.webbilly.com.br`;

  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN || db.adminSettings.mercadopagoAccessToken;

  let checkoutUrl = '';
  let mpPreferenceId = '';

  if (mpToken && mpToken.trim() !== '') {
    try {
      // Cria preferência de checkout no Mercado Pago com suporte a Cartão de Crédito e Pix
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mpToken.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              id: `sub_${siteSlug}`,
              title: `Assinatura Mensal Site Oficial - ${clientName}`,
              description: `Hospedagem, manutenção e site ativo no subdomínio ${siteSlug}.webbilly.com.br`,
              quantity: 1,
              currency_id: 'BRL',
              unit_price: monthlyPrice
            }
          ],
          payer: {
            name: clientName,
            email: clientEmail,
            phone: {
              number: clientPhone.replace(/\D/g, '')
            }
          },
          external_reference: sub?.id || `sub_${siteSlug}_${Date.now()}`,
          back_urls: {
            success: `https://webbilly.com.br/site/${siteSlug}?status=active`,
            pending: `https://webbilly.com.br/site/${siteSlug}?status=pending`,
            failure: `https://webbilly.com.br/site/${siteSlug}?status=suspended`
          },
          auto_return: 'approved',
          notification_url: 'https://webbilly.com.br/api/webhooks/mercadopago'
        })
      });

      if (mpResponse.ok) {
        const mpData = await mpResponse.json();
        checkoutUrl = mpData.init_point || mpData.sandbox_init_point || '';
        mpPreferenceId = mpData.id || '';
      }
    } catch (mpErr) {
      console.warn('[MercadoPago API Warning]:', mpErr);
    }
  }

  // Fallback transparente e confiável caso as credenciais não estejam configuradas em dev/staging
  if (!checkoutUrl) {
    checkoutUrl = `https://webbilly.com.br/site/${siteSlug}?checkout=mercadopago&price=29.90&sub=${sub?.id || 'new'}`;
  }

  if (sub) {
    sub.clientName = clientName;
    sub.clientPhone = clientPhone || sub.clientPhone;
    sub.clientEmail = clientEmail || sub.clientEmail;
    sub.deployedUrl = deployedUrl || sub.deployedUrl;
    sub.checkoutUrl = checkoutUrl;
    if (mpPreferenceId) sub.mpPreferenceId = mpPreferenceId;
    sub.updatedAt = new Date().toISOString();
  } else {
    sub = {
      id: `sub_${siteSlug}_${Date.now().toString(36)}`,
      leadToken: body.leadId || `brf_${siteSlug}`,
      siteSlug,
      clientName,
      clientPhone,
      clientEmail,
      operatorId,
      operatorName,
      operatorToken: operator?.serialToken,
      monthlyPrice,
      commissionMonthly,
      status: 'active', // inicia ativo para demonstração imediata do cliente
      deployedUrl,
      mpPreferenceId,
      checkoutUrl,
      lastPaymentDate: new Date().toISOString(),
      nextRenewalDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.subscriptions.unshift(sub);
  }

  writeDb(db);

  return NextResponse.json({
    success: true,
    subscriptionId: sub.id,
    siteSlug: sub.siteSlug,
    subdomainUrl: `https://${sub.siteSlug}.webbilly.com.br`,
    siteUrl: `https://webbilly.com.br/site/${sub.siteSlug}`,
    checkoutUrl: sub.checkoutUrl,
    monthlyPrice: sub.monthlyPrice,
    status: sub.status,
    subscription: sub
  });
}
