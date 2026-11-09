import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const { operatorId, serialToken } = await req.json();
    if (!operatorId && !serialToken) {
      return NextResponse.json({ error: 'Informe o ID ou Token Serial do operador.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(
      o => (operatorId && o.id === operatorId) || (serialToken && o.serialToken.toUpperCase() === serialToken.toUpperCase())
    );

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado no sistema.' }, { status: 404 });
    }

    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const newTempPassword = `Billy@${randomSuffix}`;
    const passwordHash = bcrypt.hashSync(newTempPassword, 10);

    operator.passwordHash = passwordHash;
    operator.tempPasswordPlain = newTempPassword;
    operator.mustChangePassword = true;

    writeDb(db);

    return NextResponse.json({
      success: true,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorEmail: operator.email,
      tempPassword: newTempPassword,
      message: `Senha provisória do operador ${operator.name} resetada para: ${newTempPassword}`
    });

  } catch (err: any) {
    console.error('Erro ao resetar senha do operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao resetar senha do operador.' },
      { status: 500 }
    );
  }
}
