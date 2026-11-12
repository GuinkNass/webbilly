import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { persistSite, sanitizeDomain, sanitizeSlug } from '@/lib/site-storage';
import path from 'path';
import fs from 'fs-extra';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json();
    const { projectId, domain: rawDomain, paymentMethod } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId (ou subdomínio) é obrigatório.' }, { status: 400 });
    }

    const domain = sanitizeDomain(rawDomain);
    if (!domain || !domain.includes('.')) {
      return NextResponse.json({ error: 'Domínio inválido para vinculação.' }, { status: 400 });
    }

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    // Localiza a assinatura pelo id, siteSlug ou leadToken
    const cleanId = sanitizeSlug(projectId);
    const sub = db.subscriptions.find(
      s => s.id === projectId || s.siteSlug === cleanId || s.leadToken === projectId
    );

    if (!sub) {
      return NextResponse.json(
        { error: `Projeto/Assinatura não encontrado para o identificador "${projectId}".` },
        { status: 404 }
      );
    }

    const isBr = domain.endsWith('.br');
    const nowIso = new Date().toISOString();
    const vercelToken =
      process.env.VERCEL_API_TOKEN ||
      process.env.VERCEL_TOKEN ||
      db.adminSettings?.vercelToken ||
      '';
    const vercelProjectId =
      process.env.VERCEL_PROJECT_ID ||
      process.env.VERCEL_PROJECT ||
      'webbilly';

    let vercelPurchaseResult: any = null;
    let vercelDomainAddApex: any = null;
    let vercelDomainAddWww: any = null;

    // 1. Se for domínio internacional (.com, .net, etc.) e pagamento via cartão Vercel
    if (!isBr && paymentMethod === 'card_vercel' && vercelToken) {
      try {
        const purchaseRes = await fetch('https://api.vercel.com/v5/domains', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: domain })
        });
        if (purchaseRes.ok) {
          vercelPurchaseResult = await purchaseRes.json();
        } else {
          console.warn('[Vercel Domain Purchase Info]:', await purchaseRes.text());
        }
      } catch (pErr) {
        console.warn('[Vercel Purchase Error]:', pErr);
      }
    }

    // 2. Vincula o domínio e o www no projeto da Vercel
    if (vercelToken && vercelProjectId) {
      // Adiciona apex (ex: empresa.com.br)
      try {
        const addRes = await fetch(
          `https://api.vercel.com/v10/projects/${encodeURIComponent(vercelProjectId)}/domains`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: domain })
          }
        );
        if (addRes.ok) vercelDomainAddApex = await addRes.json();
      } catch (addErr) {
        console.warn('[Vercel Add Apex Error]:', addErr);
      }

      // Adiciona www (ex: www.empresa.com.br)
      try {
        const addWwwRes = await fetch(
          `https://api.vercel.com/v10/projects/${encodeURIComponent(vercelProjectId)}/domains`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: `www.${domain}` })
          }
        );
        if (addWwwRes.ok) vercelDomainAddWww = await addWwwRes.json();
      } catch (addWwwErr) {
        console.warn('[Vercel Add WWW Error]:', addWwwErr);
      }
    }

    // 3. Define status do domínio: 'active' para internacional via cartão ou 'propagating' para .com.br
    const finalDomainStatus = !isBr && paymentMethod === 'card_vercel' ? 'active' : 'propagating';

    sub.custom_domain = domain;
    sub.customDomain = domain;
    sub.domain_status = finalDomainStatus;
    sub.domainStatus = finalDomainStatus;
    sub.domain_purchased_at = nowIso;
    sub.domainPurchasedAt = nowIso;
    sub.domainPrice = 490.0;
    sub.domainPaymentMethod = paymentMethod === 'card_vercel' ? 'card_vercel' : 'pix_br';
    sub.updatedAt = nowIso;

    // Se houver operador vinculado, registra a comissão de 30% (R$ 147,00)
    if (sub.operatorId || sub.operatorToken) {
      if (!Array.isArray(db.sales)) db.sales = [];
      const existingDomainSale = db.sales.find(
        (sale: any) => sale.siteUrl?.includes(domain) || (sale.clientName === sub.clientName && sale.saleValue === 490)
      );
      if (!existingDomainSale) {
        db.sales.unshift({
          id: `sale_dom_${Date.now()}`,
          operatorId: sub.operatorId || 'OP-0001',
          operatorName: sub.operatorName || 'Administrador Master',
          clientName: sub.clientName,
          clientWhatsapp: sub.clientPhone || '',
          siteUrl: `https://${domain}`,
          niche: 'Domínio Próprio (Opção 2)',
          saleValue: 490.0,
          commissionValue: 147.0, // 30% de R$ 490,00
          pixStatus: 'PENDENTE',
          createdAt: nowIso
        });
      }
    }

    // Persiste no banco local e runtime
    writeDb(db);

    try {
      const bundledPath = path.join(process.cwd(), 'src', 'data', 'db.json');
      if (fs.existsSync(bundledPath)) {
        fs.writeJsonSync(bundledPath, db, { spaces: 2 });
      }
    } catch {}

    // Persiste na camada de resolução de sites e caches
    await persistSite(sub);

    // 4. Instruções e dados de retorno
    const dnsInstructions = {
      typeA: {
        record: '@',
        type: 'A',
        value: '76.76.21.21'
      },
      typeCname: {
        record: 'www',
        type: 'CNAME',
        value: 'cname.vercel-dns.com'
      },
      registroBrUrl: `https://registro.br/busca-dominio/?fqdn=${encodeURIComponent(domain)}`,
      pixPrice: 490.0
    };

    return NextResponse.json({
      success: true,
      message: isBr
        ? `Domínio ${domain} mapeado com sucesso! Conclua o registro e aponte o DNS no Registro.br.`
        : `Domínio ${domain} registrado e publicado na Vercel com sucesso!`,
      project: {
        id: sub.id,
        siteSlug: sub.siteSlug,
        clientName: sub.clientName,
        custom_domain: sub.custom_domain,
        domain_status: sub.domain_status,
        domain_purchased_at: sub.domain_purchased_at
      },
      dnsInstructions,
      vercel: {
        purchase: vercelPurchaseResult,
        apex: vercelDomainAddApex,
        www: vercelDomainAddWww
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao vincular e publicar domínio.' }, { status: 500 });
  }
}
