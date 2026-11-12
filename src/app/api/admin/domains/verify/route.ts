import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { persistSite, sanitizeDomain } from '@/lib/site-storage';
import path from 'path';
import fs from 'fs-extra';
import dns from 'dns';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawDomain = searchParams.get('domain') || '';
    const domain = sanitizeDomain(rawDomain);

    if (!domain || !domain.includes('.')) {
      return NextResponse.json({ error: 'Domínio inválido para verificação.' }, { status: 400 });
    }

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    const sub = db.subscriptions.find(
      s =>
        (s.custom_domain && sanitizeDomain(s.custom_domain) === domain) ||
        (s.customDomain && sanitizeDomain(s.customDomain) === domain)
    );

    const vercelToken =
      process.env.VERCEL_API_TOKEN ||
      process.env.VERCEL_TOKEN ||
      db.adminSettings?.vercelToken ||
      '';
    const vercelProjectId =
      process.env.VERCEL_PROJECT_ID ||
      process.env.VERCEL_PROJECT ||
      'webbilly';

    let isVerified = false;
    let vercelDomainData: any = null;

    // 1. Consulta verificação na API da Vercel
    if (vercelToken && vercelProjectId) {
      try {
        const vRes = await fetch(
          `https://api.vercel.com/v9/projects/${encodeURIComponent(vercelProjectId)}/domains/${encodeURIComponent(domain)}`,
          {
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          }
        );

        if (vRes.ok) {
          vercelDomainData = await vRes.json();
          if (vercelDomainData.verified === true) {
            isVerified = true;
          }
        }
      } catch (vErr) {
        console.warn('[Vercel Domain Verify Error]:', vErr);
      }
    }

    // 2. Verificação complementar de DNS por resolução direta caso a API Vercel não esteja configurada
    if (!isVerified) {
      try {
        const addresses = await dns.promises.resolve4(domain);
        if (addresses && addresses.includes('76.76.21.21')) {
          isVerified = true;
        }
      } catch (dnsErr) {
        // DNS ainda não propagado
      }
    }

    // 3. Se verificado com sucesso, atualiza o status para 'active'
    if (isVerified && sub) {
      sub.domain_status = 'active';
      sub.domainStatus = 'active';
      sub.updatedAt = new Date().toISOString();

      writeDb(db);

      try {
        const bundledPath = path.join(process.cwd(), 'src', 'data', 'db.json');
        if (fs.existsSync(bundledPath)) {
          fs.writeJsonSync(bundledPath, db, { spaces: 2 });
        }
      } catch {}

      await persistSite(sub);
    }

    return NextResponse.json({
      success: true,
      verified: isVerified,
      domain,
      domain_status: isVerified ? 'active' : sub?.domain_status || 'propagating',
      vercelData: vercelDomainData,
      project: sub
        ? {
            id: sub.id,
            siteSlug: sub.siteSlug,
            clientName: sub.clientName,
            custom_domain: sub.custom_domain,
            domain_status: sub.domain_status
          }
        : null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao verificar domínio.' }, { status: 500 });
  }
}
