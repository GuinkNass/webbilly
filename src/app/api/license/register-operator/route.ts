import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Operator } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId, osInfo, name, cpf, email, whatsapp, pixType, pixKey } = body;

    if (!serialToken || typeof serialToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Chave Serial não informada.' },
        { status: 400 }
      );
    }

    if (!name || !cpf || !email || !whatsapp || !pixKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Todos os campos de cadastro são obrigatórios (Nome Completo, CPF, E-mail, WhatsApp e Chave Pix).'
        },
        { status: 400 }
      );
    }

    const cleanCpf = String(cpf).replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      return NextResponse.json(
        { success: false, error: 'CPF inválido. Informe os 11 dígitos do documento.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Endereço de e-mail corporativo inválido.' },
        { status: 400 }
      );
    }

    const cleanedSerial = serialToken.trim().toUpperCase();
    const db = readDb();

    const license = db.licenses.find(l => l.serialToken.toUpperCase() === cleanedSerial);
    if (!license) {
      return NextResponse.json(
        { success: false, error: 'Chave Serial não encontrada no sistema Billy Suite.' },
        { status: 404 }
      );
    }

    if (license.status === 'revoked' || license.status === 'BLOQUEADO') {
      return NextResponse.json(
        { success: false, error: 'Esta chave serial foi bloqueada ou revogada pela administração.' },
        { status: 403 }
      );
    }

    // Verifica se e-mail já pertence a outro operador ativo com serial diferente
    const existingOp = db.operators.find(
      o => o.email.toLowerCase() === cleanEmail && o.serialToken.toUpperCase() !== cleanedSerial
    );
    if (existingOp) {
      return NextResponse.json(
        { success: false, error: 'Já existe um operador cadastrado com este e-mail. Utilize outro e-mail.' },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();

    // Gera senha provisória para o acesso web
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const tempPassword = `Billy@${randomSuffix}`;
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    let operator = db.operators.find(o => o.serialToken.toUpperCase() === cleanedSerial);
    if (!operator) {
      operator = {
        id: `OP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        name: name.trim(),
        cpf: cleanCpf,
        email: cleanEmail,
        passwordHash,
        tempPasswordPlain: tempPassword,
        mustChangePassword: true,
        whatsapp: String(whatsapp).trim(),
        pixType: pixType || 'cpf',
        pixKey: String(pixKey).trim(),
        serialToken: cleanedSerial,
        status: 'PENDENTE_APROVACAO',
        machineId: machineId || null,
        osInfo: osInfo || 'Windows PC',
        operatorIp: null,
        lastSync: nowIso,
        dailyLimit: db.adminSettings?.defaultDailyLimit || 50,
        todayGenerations: 0,
        createdAt: nowIso
      };
      db.operators.push(operator);
    } else {
      operator.name = name.trim();
      operator.cpf = cleanCpf;
      operator.email = cleanEmail;
      operator.passwordHash = passwordHash;
      operator.tempPasswordPlain = tempPassword;
      operator.mustChangePassword = true;
      operator.whatsapp = String(whatsapp).trim();
      operator.pixType = pixType || 'cpf';
      operator.pixKey = String(pixKey).trim();
      operator.status = 'PENDENTE_APROVACAO';
      operator.machineId = machineId || operator.machineId;
      operator.osInfo = osInfo || operator.osInfo;
      operator.lastSync = nowIso;
    }

    // Atualiza a licença para pending_approval
    license.operatorId = operator.id;
    license.operatorName = operator.name;
    license.machineId = machineId || license.machineId;
    license.osInfo = osInfo || license.osInfo;
    license.status = 'pending_approval';
    license.lastSync = nowIso;

    writeDb(db);

    return NextResponse.json({
      success: true,
      status: 'pending_approval',
      serialToken: cleanedSerial,
      operatorId: operator.id,
      operatorName: operator.name,
      message: 'Cadastro submetido com sucesso! Aguardando aprovação do Administrador Master.'
    });

  } catch (err: any) {
    console.error('Erro ao registrar operador:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar cadastro do operador.' },
      { status: 500 }
    );
  }
}
