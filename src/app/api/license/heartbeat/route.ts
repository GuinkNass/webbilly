import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId } = body;

    if (!serialToken || !machineId) {
      return NextResponse.json(
        { valid: false, error: 'serialToken e machineId são obrigatórios no heartbeat.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanedSerial = serialToken.trim().toUpperCase();

    const license = db.licenses.find(l => l.serialToken.toUpperCase() === cleanedSerial);
    const operator = db.operators.find(o => o.serialToken.toUpperCase() === cleanedSerial);

    if (!license || !operator) {
      return NextResponse.json(
        { valid: false, status: 'REVOKED', message: 'Licença inexistente ou revogada.' },
        { status: 404 }
      );
    }

    if (license.status === 'BLOQUEADO' || operator.status === 'BLOQUEADO') {
      return NextResponse.json(
        {
          valid: false,
          status: 'BLOQUEADO',
          message: 'Sua licença foi bloqueada pelo Administrador Master em tempo real.'
        },
        { status: 403 }
      );
    }

    if (license.machineId && license.machineId !== machineId) {
      return NextResponse.json(
        {
          valid: false,
          status: 'MACHINE_MISMATCH',
          message: 'Identificador de hardware divergente da máquina registrada.'
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    license.lastSync = nowIso;
    license.status = 'EM_USO';
    operator.lastSync = nowIso;

    writeDb(db);

    const geminiKey = process.env.GEMINI_API_KEY || db.adminSettings?.geminiApiKey || '';
    const geminiModel = process.env.GEMINI_MODEL || db.adminSettings?.geminiModel || 'gemini-3.8-flash';

    return NextResponse.json({
      valid: true,
      status: 'ATIVO',
      operatorId: operator.id,
      operatorName: operator.name,
      lastSync: nowIso,
      dailyLimit: operator.dailyLimit || 50,
      todayGenerations: operator.todayGenerations || 0,
      config: {
        geminiApiKey: geminiKey,
        geminiModel,
        dailyLimit: operator.dailyLimit || 50
      },
      apiConfig: {
        geminiApiKey: geminiKey,
        geminiModel,
        cloudflareAccountId: db.adminSettings.cloudflareAccountId,
        cloudflareApiToken: db.adminSettings.cloudflareApiToken,
        vercelToken: db.adminSettings.vercelToken
      }
    });
  } catch (err: any) {
    console.error('Erro no heartbeat:', err);
    return NextResponse.json(
      { valid: false, error: 'Erro interno ao processar heartbeat.' },
      { status: 500 }
    );
  }
}
