import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json();
    const { serialToken, operatorId } = body;

    if (!serialToken && !operatorId) {
      return NextResponse.json(
        { error: 'Token Serial ou ID do Operador deve ser fornecido.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanedSerial = serialToken ? String(serialToken).trim().toUpperCase() : null;

    // Localiza a licença
    const license = db.licenses.find(l => 
      (cleanedSerial && (l.serialToken || '').trim().toUpperCase() === cleanedSerial) ||
      (operatorId && l.operatorId === operatorId)
    );

    if (!license) {
      return NextResponse.json({ error: 'Licença não encontrada no sistema.' }, { status: 404 });
    }

    // Localiza o operador
    const operator = db.operators.find(o => 
      (operatorId && o.id === operatorId) ||
      (cleanedSerial && (o.serialToken || '').trim().toUpperCase() === cleanedSerial) ||
      (license.operatorId && o.id === license.operatorId)
    );

    const nowIso = new Date().toISOString();

    // Ativa a licença
    license.status = 'active';
    license.activatedAt = license.activatedAt || nowIso;
    license.lastSync = nowIso;

    if (operator) {
      operator.status = 'ATIVO';
      operator.lastSync = nowIso;
      license.operatorId = operator.id;
      license.operatorName = operator.name;
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      serialToken: license.serialToken,
      operatorName: operator?.name || license.operatorName || 'Operador',
      message: `Operador ${operator?.name || license.operatorName} aprovado com sucesso! O acesso ao Billy Suite Desktop está liberado.`
    });

  } catch (err: any) {
    console.error('Erro ao aprovar operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao aprovar operador.' },
      { status: 500 }
    );
  }
}
