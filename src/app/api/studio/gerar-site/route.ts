import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug, saveSiteToCloudStorage, persistSiteImages } from '@/lib/site-storage';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { buildSiteHtml } from '@/lib/billy-desktop-port/generator';
import { getPlatformPricing, formatBRL } from '@/lib/pricing';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      businessName,
      shortName = '',
      headerName = '',
      niche = 'Barbearia',
      city = 'São Paulo - SP',
      phone,
      whatsapp,
      subdomain,
      tagline,
      description,
      theme = 'dark-neon',
      templateId = 'barbearia-crop-vintage',
      accentColor = '#84cc16',
      primaryColor,
      backgroundColor,
      surfaceColor,
      textColor,
      fontPair,
      paletteId,
      logoUrl = '',
      heroPhoto = '',
      galleryPhotos = [],
      services = [],
      features = [],
      faqs = [],
      testimonials = [],
      reviews = [],
      hours = 'Segunda a Sábado das 08h às 19h',
      address = '',
      instagram = '',
      blocks = {},
      differentiators = '',
      toneOfVoice = 'comercial',
      uploadedText = '',
      operatorId = 'OP-BILLY-01',
      operatorName = 'Operador Oficial'
    } = body;

    if (!businessName || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa e subdomínio são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanSlug = sanitizeSlug(subdomain);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: 'Subdomínio inválido. Use apenas letras e números.' },
        { status: 400 }
      );
    }

    const rawPhone = (whatsapp || phone || '11999999999').replace(/\D/g, '');
    const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Olá! Vim pelo site ${cleanSlug}.webbilly.com.br e gostaria de agendar um horário.`
    )}`;

    // 1. Persiste fotos temporárias externas do Google/Instagram no Supabase Storage permanente
    let finalHeroPhoto = heroPhoto;
    let finalGalleryPhotos = galleryPhotos;
    try {
      const persisted = await persistSiteImages(heroPhoto, galleryPhotos, cleanSlug);
      finalHeroPhoto = persisted.heroPhoto;
      finalGalleryPhotos = persisted.galleryPhotos;
    } catch (persistErr) {
      console.warn('[Studio Gerar Site] Falha ao persistir imagens no Supabase Storage:', persistErr);
    }

    // 2. Gera o HTML com o motor completo portado do Billy Desktop
    let generationResult;
    try {
      generationResult = await buildSiteHtml({
        businessName,
        shortName,
        headerName,
        niche,
        city,
        subdomain: cleanSlug,
        phone: rawPhone,
        whatsapp: cleanPhone,
        instagram,
        address,
        tagline,
        description,
        theme,
        templateId: (body.mode === 'architect' || body.architectMode === true) ? 'modular-architect' : templateId,
        accentColor,
        primaryColor,
        backgroundColor,
        surfaceColor,
        textColor,
        fontPair,
        paletteId,
        logoUrl,
        heroPhoto: finalHeroPhoto,
        galleryPhotos: finalGalleryPhotos,
        services,
        features,
        faqs,
        reviews: reviews.length > 0 ? reviews : testimonials,
        hours,
        blocks,
        differentiators,
        toneOfVoice,
        uploadedText
      });
    } catch (genErr: any) {
      console.error('[Studio Gerar Site] Erro no buildSiteHtml:', genErr);
      return NextResponse.json(
        { success: false, error: `Falha na geração do HTML: ${genErr?.message || 'Erro desconhecido'}` },
        { status: 500 }
      );
    }

    const generatedHtml = generationResult.html;

    // 2. Grava no disco local apenas se não estiver em ambiente Vercel Serverless
    try {
      if (!process.env.VERCEL) {
        const siteDir = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug);
        if (!fs.existsSync(siteDir)) {
          fs.mkdirSync(siteDir, { recursive: true });
        }
        fs.writeFileSync(path.join(siteDir, 'index.html'), generatedHtml, 'utf-8');
      }
    } catch (fsErr) {
      console.warn('[Studio Gerar Site] Aviso gravação em disco:', fsErr);
    }

    // 3. Salva no banco local db.json
    const leadToken = `lead_${cleanSlug}_${Date.now().toString(36)}`;
    try {
      const db = readDb();
      if (!db.generatedSites) db.generatedSites = {};
      db.generatedSites[cleanSlug] = generatedHtml;

      if (!db.demos) db.demos = {};
      db.demos[leadToken] = {
        leadToken,
        title: businessName,
        category: niche,
        deployedUrl: `/api/public/site/${cleanSlug}/render`,
        phone: rawPhone,
        instagram,
        html: generatedHtml,
        updatedAt: new Date().toISOString()
      };

      // Preços dinâmicos da plataforma
      const pricing = await getPlatformPricing();
      const monthlyPrice = pricing.monthly_plan_price;
      const formattedMonthly = formatBRL(monthlyPrice);

      if (!Array.isArray(db.subscriptions)) {
        db.subscriptions = [];
      }

      const existingSubIdx = db.subscriptions.findIndex((s) => s.siteSlug === cleanSlug);
      const subRecord = {
        id: `sub_${cleanSlug}`,
        siteSlug: cleanSlug,
        clientName: businessName,
        clientPhone: rawPhone,
        clientEmail: `${cleanSlug}@webbilly.com.br`,
        operatorToken: operatorId,
        operatorName: operatorName,
        monthlyPrice: monthlyPrice,
        status: 'draft' as const,
        site_status: 'draft',
        deployedUrl: `/api/public/site/${cleanSlug}/render`,
        checkoutUrl: `/proposta/${leadToken}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        leadToken
      };

      if (existingSubIdx >= 0) {
        db.subscriptions[existingSubIdx] = { ...db.subscriptions[existingSubIdx], ...subRecord };
      } else {
        db.subscriptions.unshift(subRecord);
      }

      writeDb(db);
    } catch (dbErr) {
      console.warn('[Studio Gerar Site] Aviso db.json:', dbErr);
    }

    // 4. Salva no Supabase Storage e na tabela subscriptions estritamente como RASCUNHO (status = 'draft', isPublished = false)
    await saveSiteToCloudStorage(cleanSlug, generatedHtml, {
      businessName,
      niche,
      city,
      isPublished: false,
      status: 'draft'
    });

    const pricing = await getPlatformPricing();
    const monthlyPrice = pricing.monthly_plan_price;
    const formattedMonthly = formatBRL(monthlyPrice);

    const subRecord = {
      id: `sub_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName: businessName,
      clientPhone: rawPhone,
      clientEmail: `${cleanSlug}@webbilly.com.br`,
      operatorId: operatorId,
      operatorToken: operatorId,
      operatorName: operatorName,
      monthlyPrice: monthlyPrice,
      status: 'draft' as const,
      site_status: 'draft',
      deployedUrl: `/api/public/site/${cleanSlug}/render`,
      checkoutUrl: `/proposta/${leadToken}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadToken
    };

    try {
      await upsertSubscriptionInSupabase(subRecord);
    } catch (supaErr) {
      console.warn('[Studio Gerar Site] Erro ao sincronizar com Supabase:', supaErr);
    }

    // 5. Mensagem de Fechamento de Venda no WhatsApp
    const siteUrl = `https://${cleanSlug}.webbilly.com.br`;
    const proposalUrl = `https://webbilly.com.br/proposta/${leadToken}`;

    const whatsappMessage = `Olá, tudo bem? Sou da equipe da Webbilly e temos uma novidade exclusiva para a *${businessName}*!

Tomamos a iniciativa de criar uma demonstração profissional do site oficial de vocês, adaptado para celulares e pronto para receber clientes do Google:

${siteUrl}

Hoje a maioria das pessoas pesquisa antes no Google ao procurar por ${niche} em ${city}. Ter esse endereço no ar passa muito mais autoridade imediata e ajuda a fechar agendamentos pelo WhatsApp.

Como a página já está montada, preparamos uma condição especial de lançamento por apenas ${formattedMonthly}/mês, sem taxa de criação e sem fidelidade:

${proposalUrl}

O que achou do visual que preparamos para vocês? Se quiser tirar qualquer dúvida ou ativar hoje mesmo, é só me responder por aqui!`;

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      html: generatedHtml,
      usedAi: generationResult.usedAi,
      modelUsed: generationResult.modelUsed,
      subdomainUrl: siteUrl,
      previewUrl: `/api/public/site/${cleanSlug}/render`,
      proposalUrl,
      leadToken,
      whatsappMessage,
      isPublished: false,
      isDeployed: false
    });
  } catch (error: any) {
    console.error('[Studio Gerar Site] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao processar a geração do site.' },
      { status: 500 }
    );
  }
}
