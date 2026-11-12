import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { sendDemoRequestEmail } from '@/lib/lark-mailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nome,
      responsibleName,
      empresa,
      businessName,
      whatsapp,
      instagram,
      mapsUrl,
      instagramOuMaps,
      segmento,
      niche,
      cityState,
    } = body;

    const companyName = (empresa || businessName || '').trim();
    const contactWhatsapp = (whatsapp || '').trim();
    const contactName = (nome || responsibleName || '').trim();
    const socialOrMaps = (instagramOuMaps || instagram || mapsUrl || '').trim();
    const businessNiche = (segmento || niche || 'Geral').trim();

    if (!companyName || !contactWhatsapp) {
      return NextResponse.json(
        { error: 'Por favor, informe ao menos o nome da empresa e o WhatsApp.' },
        { status: 400 }
      );
    }

    const slug = companyName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 32) || 'empresa';

    // Persistência em db.demos para visibilidade no painel
    try {
      const db = readDb();
      if (!db.demos) db.demos = {};
      const demoToken = `demo_${slug}_${Date.now().toString(36)}`;
      db.demos[demoToken] = {
        leadToken: demoToken,
        title: companyName,
        category: businessNiche,
        deployedUrl: `https://${slug}.webbilly.com.br`,
        instagram: socialOrMaps,
        phone: contactWhatsapp,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
    } catch (dbErr) {
      console.warn('[Demonstração API] Aviso na persistência local:', dbErr);
    }

    // Disparo oficial via SMTP Lark Suite para demo@webbilly.com.br
    await sendDemoRequestEmail({
      nome: contactName,
      empresa: companyName,
      whatsapp: contactWhatsapp,
      instagramOuMaps: socialOrMaps,
      segmento: businessNiche,
      subdominio: slug,
    });

    console.log(`[Demonstração API] Pedido de demo para ${companyName} enviado para demo@webbilly.com.br`);
    return NextResponse.json({
      success: true,
      slug,
      subdomainUrl: `https://${slug}.webbilly.com.br`,
      message: 'Demonstração solicitada com sucesso! Nossa equipe entrará em contato via WhatsApp.'
    });
  } catch (error: any) {
    console.error('[Demonstração API] Erro no pedido de demo:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao solicitar demonstração. Tente novamente.' },
      { status: 500 }
    );
  }
}
