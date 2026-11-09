import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb, LicenseRecord } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const db = readDb();

    // Gera um token serial virgem exclusivo no formato BILLY-OP-XXXX-YYYY
    let serialToken = '';
    let isUnique = false;

    while (!isUnique) {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      serialToken = `BILLY-OP-${part1}-${part2}`;
      isUnique = !db.licenses.some(l => l.serialToken.toUpperCase() === serialToken);
    }

    const nowIso = new Date().toISOString();
    const newLicense: LicenseRecord = {
      serialToken,
      operatorId: null,
      operatorName: 'Aguardando Onboarding',
      status: 'pending_activation',
      machineId: null,
      createdAt: nowIso,
      activatedAt: null,
      lastSync: null
    };

    db.licenses.unshift(newLicense);
    writeDb(db);

    return NextResponse.json({
      success: true,
      serialToken,
      license: newLicense,
      message: `Chave serial ${serialToken} gerada com sucesso! Envie ao novo operador.`
    });

  } catch (err: any) {
    console.error('Erro ao gerar chave serial:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao gerar chave serial.' },
      { status: 500 }
    );
  }
}
