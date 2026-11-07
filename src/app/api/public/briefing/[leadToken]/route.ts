import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, BriefingRecord } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    const db = readDb();
    const briefing = db.briefings?.[leadToken];

    return NextResponse.json({
      success: true,
      leadToken,
      briefing: briefing || null
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao carregar dados do briefing' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    const body = await req.json();

    const db = readDb();
    if (!db.briefings) {
      db.briefings = {};
    }

    const briefingRecord: BriefingRecord = {
      leadToken,
      title: body.title || 'Estabelecimento Parceiro',
      phone: body.phone || '',
      category: body.category || '',
      address: body.address || '',
      instagram: (body.instagram || '').replace(/^@/, '').trim(),
      bio: body.bio || '',
      services: Array.isArray(body.services) ? body.services : [],
      domainIdeas: Array.isArray(body.domainIdeas) ? body.domainIdeas : [],
      photos: Array.isArray(body.photos) ? body.photos : [],
      submittedAt: new Date().toISOString(),
      status: 'PENDENTE'
    };

    db.briefings[leadToken] = briefingRecord;
    writeDb(db);

    // Tenta notificar o local-server do operador caso ele esteja rodando no mesmo host
    try {
      fetch(`http://127.0.0.1:5200/api/public/briefing/${leadToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Briefing recebido com sucesso!',
      briefing: briefingRecord
    });
  } catch (err: any) {
    console.error('Erro ao salvar briefing:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar briefing' },
      { status: 500 }
    );
  }
}
