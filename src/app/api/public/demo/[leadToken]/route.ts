import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, DemoRecord } from '@/lib/db';
import { persistSite } from '@/lib/site-storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    const db = readDb();
    const demo = db.demos?.[leadToken] || null;
    const briefing = db.briefings?.[leadToken] || null;

    return NextResponse.json({
      success: true,
      leadToken,
      title: demo?.title || briefing?.title || 'Demonstração Exclusiva',
      category: demo?.category || briefing?.category || 'Negócio Local',
      deployedUrl: demo?.deployedUrl || briefing?.deployedUrl || null,
      instagram: demo?.instagram || briefing?.instagram || null,
      phone: demo?.phone || briefing?.phone || null
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao carregar dados da demonstração' },
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
    if (!db.demos) {
      db.demos = {};
    }

    const demoRecord: DemoRecord = {
      leadToken,
      title: body.title || 'Demonstração Exclusiva',
      category: body.category || '',
      deployedUrl: body.deployedUrl || '',
      instagram: (body.instagram || '').replace(/^@/, '').trim(),
      phone: body.phone || '',
      updatedAt: new Date().toISOString()
    };

    db.demos[leadToken] = demoRecord;

    if (db.briefings && db.briefings[leadToken]) {
      db.briefings[leadToken].deployedUrl = body.deployedUrl;
    }

    writeDb(db);

    // Persistência adicional de alta disponibilidade
    try {
      const siteSlug = (demoRecord.title || leadToken)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      await persistSite({
        siteSlug,
        leadToken,
        clientName: demoRecord.title,
        deployedUrl: demoRecord.deployedUrl,
        clientPhone: demoRecord.phone,
        status: 'active'
      });
    } catch {}

    return NextResponse.json({
      success: true,
      leadToken,
      demo: demoRecord
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao salvar demonstração' },
      { status: 500 }
    );
  }
}
