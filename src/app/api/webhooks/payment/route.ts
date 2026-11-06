import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Sale } from '@/lib/db';
import {
  registerCompleteClientDomain,
  checkDomainAvailability,
  ClientPayload,
  DomainRegisterResult
} from '@/services/resellerClub';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Aceita múltiplos formatos de webhook (Mercado Pago, Asaas, Billy Pay)
    const status = body?.status || body?.event || body?.action || body?.type;
    const isPaid =
      status === 'paid' ||
      status === 'PAYMENT_RECEIVED' ||
      status === 'payment.created' ||
      status === 'approved' ||
      body?.data?.status === 'approved';

    if (!isPaid) {
      return NextResponse.json({
        received: true,
        message: `Status de pagamento '${status}' não requer registro de domínio imediato.`
      });
    }

    // Extração de metadados do domínio e cliente
    const metadata = body?.metadata || body?.data?.metadata || body;
    const domainRaw = metadata?.domain || metadata?.sld || body?.domain;
    const client: ClientPayload = metadata?.client || {
      name: metadata?.clientName || body?.clientName || 'Cliente Billy',
      email: metadata?.clientEmail || body?.clientEmail || 'cliente@exemplo.com.br',
      document: metadata?.clientDocument || metadata?.document || body?.clientDocument || '',
      phone: metadata?.clientPhone || metadata?.phone || body?.clientPhone || '',
      address: metadata?.address,
      city: metadata?.city,
      state: metadata?.state,
      zipcode: metadata?.zipcode
    };

    if (!domainRaw || typeof domainRaw !== 'string') {
      return NextResponse.json(
        {
          error: 'Domínio (metadata.domain) não informado no payload de pagamento.',
          code: 'MISSING_DOMAIN'
        },
        { status: 400 }
      );
    }

    if (!client.document || client.document.replace(/\D/g, '').length < 11) {
      return NextResponse.json(
        {
          error: 'CPF ou CNPJ do cliente ausente ou inválido no payload (mínimo 11 dígitos).',
          code: 'INVALID_DOCUMENT'
        },
        { status: 422 }
      );
    }

    const cleanSld = domainRaw
      .trim()
      .toLowerCase()
      .replace(/\.com\.br$/i, '')
      .replace(/[^a-z0-9-]/g, '');

    const fullDomain = `${cleanSld}.com.br`;

    // 1. Checagem prévia de disponibilidade
    const availability = await checkDomainAvailability(cleanSld, 'com.br');
    if (!availability.available) {
      return NextResponse.json(
        {
          error: `O domínio '${fullDomain}' não está disponível para registro na ResellerClub.`,
          code: 'DOMAIN_TAKEN',
          domain: fullDomain
        },
        { status: 409 }
      );
    }

    // 2. Registro Completo com Contact BR e DNS da Vercel
    const nameservers = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];
    let regResult: DomainRegisterResult;

    try {
      regResult = await registerCompleteClientDomain(cleanSld, client, nameservers);
    } catch (regErr: any) {
      const errMsg = regErr.message || 'Erro no registro';

      if (errMsg.includes('[RESELLERCLUB_IP_BLOCKED]')) {
        return NextResponse.json(
          {
            error: errMsg,
            code: 'IP_NOT_ALLOWED',
            resolution: 'Cadastre o IP do servidor na whitelist da ResellerClub em https://rclubbr.webpropanel.com/settings/pro-suite/api-settings'
          },
          { status: 403 }
        );
      }

      if (errMsg.includes('[RESELLERCLUB_INSUFFICIENT_FUNDS]')) {
        return NextResponse.json(
          {
            error: errMsg,
            code: 'INSUFFICIENT_FUNDS',
            resolution: 'Recarregue o saldo pré-pago da sua conta de revenda ResellerClub.'
          },
          { status: 402 }
        );
      }

      if (errMsg.includes('[RESELLERCLUB_INVALID_DOCUMENT]')) {
        return NextResponse.json(
          {
            error: errMsg,
            code: 'INVALID_DOCUMENT_DATA'
          },
          { status: 422 }
        );
      }

      throw regErr;
    }

    // 3. Persistência da Venda no Banco de Dados
    const db = readDb();
    const operatorId = metadata?.operatorId || 'OP-1001';
    const operator = db.operators.find(o => o.id === operatorId) || db.operators[0];

    const saleValue = Number(metadata?.saleValue) || 600;
    const commissionValue = db.adminSettings.commissionPerSale || 200;
    const saleId = `SALE-${Date.now().toString().slice(-6)}`;

    const newSale: Sale = {
      id: saleId,
      operatorId: operator?.id || 'OP-1001',
      operatorName: operator?.name || 'Operador Comercial',
      clientName: client.name,
      clientWhatsapp: client.phone,
      siteUrl: `https://${fullDomain}`,
      niche: metadata?.niche || 'Geral',
      saleValue,
      commissionValue,
      pixStatus: 'PAGO',
      pixPaidAt: new Date().toISOString(),
      pixProof: body?.id || `PIX-${Date.now()}`,
      domainRegistered: fullDomain,
      resellerClubOrderId: regResult.orderId || null,
      createdAt: new Date().toISOString()
    };

    db.sales.unshift(newSale);
    writeDb(db);

    // 4. Mensagem estruturada para entrega ao cliente via WhatsApp
    const whatsappMessage = `🎉 Olá, ${client.name}! Parabéns pela aquisição!\n\n` +
      `Seu domínio oficial já foi registrado com sucesso:\n` +
      `👉 https://${fullDomain}\n\n` +
      `Os servidores DNS já estão apontados para a infraestrutura de alta velocidade da Vercel. ` +
      `Seu site exclusivo estará no ar em poucos minutos com certificado de segurança SSL ativo!`;

    return NextResponse.json({
      success: true,
      message: `Domínio ${fullDomain} registrado com sucesso na ResellerClub!`,
      saleId,
      domain: fullDomain,
      nameservers,
      registration: {
        orderId: regResult.orderId,
        customerId: regResult.customerId,
        contactId: regResult.contactId,
        status: regResult.status
      },
      client: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        document: client.document.replace(/\D/g, '')
      },
      commission: {
        operatorId: operator?.id,
        operatorName: operator?.name,
        commissionValue
      },
      delivery: {
        siteUrl: `https://${fullDomain}`,
        whatsappMessage
      }
    });
  } catch (err: any) {
    console.error('Erro no webhook de pagamento / registro:', err);
    return NextResponse.json(
      {
        error: err.message || 'Erro interno ao processar webhook de pagamento e registro.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
