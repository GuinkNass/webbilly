import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }

    const { serialToken, action } = await req.json();

    if (!serialToken || !action) {
      return NextResponse.json({ error: 'serialToken e action são obrigatórios.' }, { status: 400 });
    }

    const db = readDb();
    const license = db.licenses.find(l => l.serialToken === serialToken);
    const operator = db.operators.find(o => o.serialToken === serialToken);

    if (!license || !operator) {
      return NextResponse.json({ error: 'Licença ou operador não encontrado.' }, { status: 404 });
    }

    if (action === 'BLOCK') {
      license.status = 'BLOQUEADO';
      operator.status = 'BLOQUEADO';
    } else if (action === 'UNBLOCK') {
      license.status = license.machineId ? 'EM_USO' : 'ATIVO';
      operator.status = 'ATIVO';
    } else if (action === 'RESET_MACHINE') {
      license.machineId = null;
      license.osInfo = null;
      license.status = 'ATIVO';
      operator.machineId = null;
      operator.osInfo = null;
    } else {
      return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 });
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Ação ${action} executada com sucesso para ${license.operatorName}.`,
      license,
      operator: {
        id: operator.id,
        status: operator.status,
        machineId: operator.machineId
      }
    });
  } catch (err: any) {
    console.error('Erro na ação de licença:', err);
    return NextResponse.json({ error: 'Erro ao atualizar status da licença.' }, { status: 500 });
  }
}
