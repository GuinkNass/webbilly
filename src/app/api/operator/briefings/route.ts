import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = readDb();
    const briefings = db.briefings ? Object.values(db.briefings) : [];

    return NextResponse.json({
      success: true,
      briefings: briefings.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao listar briefings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { leadToken, status } = await req.json();
    if (!leadToken) {
      return NextResponse.json({ error: 'leadToken é obrigatório' }, { status: 400 });
    }

    const db = readDb();
    if (db.briefings && db.briefings[leadToken]) {
      db.briefings[leadToken].status = status || 'PROCESSADO';
      writeDb(db);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao atualizar briefing' },
      { status: 500 }
    );
  }
}
