import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, DemoRecord } from '@/lib/db';

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
