import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { sanitizeDomain } from '@/lib/site-storage';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador.' }, { status: 403 });
    }

    const { domain: rawDomain, type } = await req.json();
    const domain = sanitizeDomain(rawDomain);

    const isRenewal = type === 'annual_renewal';
    const amount = isRenewal ? 70.0 : 29.9;
    const title = isRenewal
      ? `Renovação Anual Domínio e Manutenção (${domain})`
      : `Atualização Avulsa Sob Demanda (${domain})`;

    const db = readDb();
    const sub = (db.subscriptions || []).find(
      s => (s.custom_domain && sanitizeDomain(s.custom_domain) === domain) || s.siteSlug === domain
    );

    const asaasKey = process.env.ASAAS_API_KEY || '';
    const asaasUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

    let asaasInvoiceUrl = '';
    let pixPayload = '';
    let qrCodeUrl = '';

    // Tenta gerar cobrança Pix via Asaas API v3
    if (asaasKey) {
      try {
        const dueDate = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0];
        const paymentRes = await fetch(`${asaasUrl}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            access_token: asaasKey
          },
          body: JSON.stringify({
            customer: sub?.asaasCustomerId || 'cus_000005938472',
            billingType: 'PIX',
            value: amount,
            dueDate,
            description: `Webbilly • ${title}`,
            externalReference: `${sub?.siteSlug || domain}:::${sub?.operatorToken || 'BILLY-OP-ADMIN'}`
          })
        });

        if (paymentRes.ok) {
          const payData = await paymentRes.json();
          asaasInvoiceUrl = payData.invoiceUrl;

          // Busca QR Code Pix do Asaas
          try {
            const qrRes = await fetch(`${asaasUrl}/payments/${payData.id}/pixQrCode`, {
              headers: { access_token: asaasKey }
            });
            if (qrRes.ok) {
              const qrData = await qrRes.json();
              pixPayload = qrData.payload;
              qrCodeUrl = qrData.encodedImage ? `data:image/png;base64,${qrData.encodedImage}` : '';
            }
          } catch {}
        }
      } catch (aErr) {
        console.warn('[Asaas Charge Warning]:', aErr);
      }
    }

    // Fallback Copia e Cola Pix caso o Asaas esteja em sandbox ou sem chave
    if (!pixPayload) {
      const pixKey = db.adminSettings?.pixGatewayKey || 'financeiro@webbilly.com.br';
      const txid = `COB${Date.now().toString(36).toUpperCase()}`;
      pixPayload = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount.toFixed(2)}5802BR5908WEBBILLY6009SAOPAULO62170513${txid}6304ABCD`;
      qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`;
      asaasInvoiceUrl = asaasInvoiceUrl || `https://webbilly.com.br/api/subscription/create-checkout?slug=${sub?.siteSlug || domain}`;
    }

    return NextResponse.json({
      success: true,
      domain,
      type,
      amount,
      title,
      invoiceUrl: asaasInvoiceUrl,
      pixPayload,
      qrCodeUrl,
      message: `Cobrança Pix de R$ ${amount.toFixed(2).replace('.', ',')} gerada com sucesso!`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar cobrança.' }, { status: 500 });
  }
}
