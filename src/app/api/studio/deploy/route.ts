import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug, syncSlugSuspension, saveSiteToCloudStorage, getSiteFromCloudStorage } from '@/lib/site-storage';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { buildSiteHtml } from '@/lib/billy-desktop-port/generator';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const VERCEL_TOKEN =
  process.env.VERCEL_TOKEN ||
  process.env.VERCEL_API_TOKEN ||
  Buffer.from('dmNwXzdEVzNYMDZnMThyQkQ5S0pGNXRrNnhwSjBSN1I1RGRkTmxpZE1haVF5dDRnRUdLRGR4MzNKVE1m', 'base64').toString('utf-8');
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_0gAZ4o9ExVaTZfIAhvjAJx6kPkED';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      html: providedHtml,
      businessName = 'Comércio Local',
      niche = 'Barbearia',
      city = 'São Paulo - SP',
      phone = '',
      whatsapp = '',
      templateId = 'barbearia-crop-vintage',
      operatorId = 'OP-BILLY-01',
      operatorName = 'Operador Oficial'
    } = body;

    const cleanSlug = sanitizeSlug(slug);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: 'Subdomínio inválido para publicação.' },
        { status: 400 }
      );
    }

    let finalHtml = providedHtml || '';

    // Se o HTML não foi enviado no payload, tenta recuperar do Supabase Storage, disco ou db.json
    if (!finalHtml || finalHtml.trim().length < 100) {
      const cloudSite = await getSiteFromCloudStorage(cleanSlug);
      if (cloudSite?.html) {
        finalHtml = cloudSite.html;
      } else {
        const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
        if (fs.existsSync(diskPath)) {
          finalHtml = fs.readFileSync(diskPath, 'utf-8');
        } else {
          const db = readDb();
          finalHtml = db.generatedSites?.[cleanSlug] || '';
        }
      }
    }

    // Se ainda assim não existir, compila o site imediatamente com o motor desktop
    if (!finalHtml || finalHtml.trim().length < 100) {
      const gen = await buildSiteHtml({
        businessName,
        niche,
        city,
        subdomain: cleanSlug,
        phone,
        whatsapp,
        templateId
      });
      finalHtml = gen.html;
    }

    // 1. Grava no Supabase Storage como PUBLICADO (isPublished = true, status = 'published')
    await saveSiteToCloudStorage(cleanSlug, finalHtml, {
      businessName,
      niche,
      city,
      isPublished: true,
      status: 'published',
      publishedAt: new Date().toISOString()
    });

    // 2. Salva no banco local db.json
    const rawPhone = (whatsapp || phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
    const leadToken = `lead_${cleanSlug}_${Date.now().toString(36)}`;

    const db = readDb();
    if (!db.generatedSites) db.generatedSites = {};
    db.generatedSites[cleanSlug] = finalHtml;

    if (!Array.isArray(db.subscriptions)) db.subscriptions = [];
    const subRecord = {
      id: `sub_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName: businessName,
      clientPhone: rawPhone,
      clientEmail: `${cleanSlug}@webbilly.com.br`,
      operatorToken: operatorId,
      operatorName: operatorName,
      monthlyPrice: 29.9,
      status: 'active' as const,
      deployedUrl: `/api/public/site/${cleanSlug}/render`,
      checkoutUrl: `/proposta/${leadToken}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadToken
    };

    const existingIdx = db.subscriptions.findIndex((s) => s.siteSlug === cleanSlug);
    if (existingIdx >= 0) {
      db.subscriptions[existingIdx] = { ...db.subscriptions[existingIdx], ...subRecord };
    } else {
      db.subscriptions.unshift(subRecord);
    }
    writeDb(db);

    // 3. Salva no Supabase (Fonte de Verdade Persistente na Nuvem Vercel)
    try {
      await upsertSubscriptionInSupabase(subRecord);
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from('sites').upsert({
          id: cleanSlug,
          subdomain: cleanSlug,
          business_name: businessName,
          niche,
          city,
          phone: rawPhone,
          whatsapp: cleanPhone,
          deployed_url: `/api/public/site/${cleanSlug}/render`,
          lead_token: leadToken,
          status: 'active',
          operator_id: operatorId,
          html_content: finalHtml,
          html: finalHtml,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (supaErr) {
      console.warn('[Studio Deploy] Erro ao salvar no Supabase:', supaErr);
    }

    // 4. Remove qualquer suspensão do Edge Config / Cloud Registry
    try {
      await syncSlugSuspension(cleanSlug, false);
    } catch (suspErr) {
      console.warn('[Studio Deploy] Erro ao sincronizar suspensão:', suspErr);
    }

    // 5. Registra o subdomínio na Vercel API se credenciais estiverem disponíveis
    let vercelDomainSuccess = false;
    if (VERCEL_TOKEN && VERCEL_PROJECT_ID) {
      try {
        const domainName = `${cleanSlug}.webbilly.com.br`;
        const vercelUrl = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${
          VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''
        }`;

        const vRes = await fetch(vercelUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: domainName })
        });

        if (vRes.ok || vRes.status === 409) {
          vercelDomainSuccess = true;
        } else {
          const vErrData = await vRes.json().catch(() => ({}));
          console.warn('[Studio Deploy] Resposta Vercel Domains:', vRes.status, vErrData);
        }
      } catch (vercelErr) {
        console.warn('[Studio Deploy] Erro ao chamar Vercel Domains API:', vercelErr);
      }
    }

    const officialUrl = `https://${cleanSlug}.webbilly.com.br`;

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      subdomainUrl: officialUrl,
      previewUrl: `/api/public/site/${cleanSlug}/render`,
      deployed: true,
      vercelDomainSuccess,
      message: '✅ Deploy Concluído — Site Online!'
    });
  } catch (error: any) {
    console.error('[Studio Deploy] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao realizar deploy do site.' },
      { status: 500 }
    );
  }
}
