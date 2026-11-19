import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito ao Operador.' }, { status: 403 });
    }

    const db = readDb();
    let operator = db.operators.find(
      (o: any) => o.id === user.userId || o.email?.toLowerCase() === user.email?.toLowerCase()
    );

    if (!operator && user.role === 'MASTER') {
      operator = db.operators.find((o: any) => o.id === 'OP-0001') || db.operators[0];
    }

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      pixKey: operator.pixKey || '',
      pixType: operator.pixType || 'CPF'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao carregar dados Pix.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito ao Operador.' }, { status: 403 });
    }

    const body = await req.json();
    const { pixKey, pixType } = body;

    if (!pixKey || typeof pixKey !== 'string' || !pixKey.trim()) {
      return NextResponse.json({ error: 'Chave Pix é obrigatória.' }, { status: 400 });
    }

    const validTypes = ['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA'];
    const normalizedType = (pixType || 'CPF').toUpperCase();
    if (!validTypes.includes(normalizedType)) {
      return NextResponse.json({ error: 'Tipo de chave Pix inválido.' }, { status: 400 });
    }

    const db = readDb();
    let operatorIdx = db.operators.findIndex(
      (o: any) => o.id === user.userId || o.email?.toLowerCase() === user.email?.toLowerCase()
    );

    if (operatorIdx === -1 && user.role === 'MASTER') {
      operatorIdx = db.operators.findIndex((o: any) => o.id === 'OP-0001');
      if (operatorIdx === -1 && db.operators.length > 0) operatorIdx = 0;
    }

    if (operatorIdx === -1) {
      return NextResponse.json({ error: 'Operador não encontrado no sistema.' }, { status: 404 });
    }

    db.operators[operatorIdx].pixKey = pixKey.trim();
    db.operators[operatorIdx].pixType = normalizedType;
    db.operators[operatorIdx].pix_key = pixKey.trim();
    db.operators[operatorIdx].pix_type = normalizedType;

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Chave Pix salva com sucesso!',
      pixKey: db.operators[operatorIdx].pixKey,
      pixType: db.operators[operatorIdx].pixType
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao salvar chave Pix.' }, { status: 500 });
  }
}
