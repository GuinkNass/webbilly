import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId } = body;

    if (!serialToken || typeof serialToken !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Token Serial não fornecido.' },
        { status: 400 }
      );
    }

    const cleanedSerial = serialToken.trim().toUpperCase();
    const db = readDb();

    const license = db.licenses.find(l => (l.serialToken || '').trim().toUpperCase() === cleanedSerial);
    if (!license) {
      return NextResponse.json(
        { valid: false, error: 'Chave Serial não encontrada ou inválida no sistema Billy Suite.' },
        { status: 404 }
      );
    }

    // Licença bloqueada ou revogada
    if (license.status === 'revoked' || license.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'Esta chave serial foi bloqueada ou revogada pelo Administrador Central.' },
        { status: 403 }
      );
    }

    // Busca operador vinculado à chave com segurança
    const operator = db.operators.find(
      o => ((o.serialToken || '').trim().toUpperCase() === cleanedSerial) || (license.operatorId && o.id === license.operatorId)
    );

    // 1. PRIORIDADE MÁXIMA: VERIFICA SE A LICENÇA OU O OPERADOR ESTÃO ATIVOS (active / ATIVO / EM_USO)
    const isLicenseActive = license.status === 'active' || license.status === 'ATIVO' || license.status === 'EM_USO';
    const isOperatorActive = operator?.status === 'ATIVO';

    if (isLicenseActive || isOperatorActive) {
      // Garante sincronização bidirecional no banco
      if (license.status !== 'active') license.status = 'active';
      if (operator && operator.status !== 'ATIVO') operator.status = 'ATIVO';

      // Verifica Hardware Lock
      const isAdminMaster = cleanedSerial === 'BILLY-OP-ADMIN-MASTER-2026' || operator?.id === 'OP-0001';
      if (!isAdminMaster && license.machineId && machineId && license.machineId !== machineId) {
        return NextResponse.json(
          {
            valid: false,
            error: `Esta chave serial já está vinculada a outro computador (${license.machineId}). Solicite a liberação de máquina ao Administrador.`
          },
          { status: 409 }
        );
      }

      // Vincula a máquina caso ainda não estivesse salva
      if (!license.machineId && machineId) {
        license.machineId = machineId;
        if (operator) operator.machineId = machineId;
        writeDb(db);
      }

      const sessionToken = `BILLY-SES-${crypto.randomBytes(16).toString('hex')}`;
      const nowIso = new Date().toISOString();
      const opName = operator?.name || license.operatorName || 'TESTE RODRIGUES BILLY';
      const opEmail = operator?.email || 'guilherme.r.nascimentoml@gmail.com';

      return NextResponse.json({
        valid: true,
        status: 'active',
        operator: {
          name: opName,
          email: opEmail,
          serialToken: cleanedSerial
        },
        serialToken: cleanedSerial,
        operatorId: operator?.id || license.operatorId || 'OP-0001',
        operatorName: opName,
        operatorEmail: opEmail,
        permissions: ['OPERATOR'],
        sessionToken,
        machineId: license.machineId || machineId,
        activatedAt: license.activatedAt || nowIso,
        license: {
          serialToken: cleanedSerial,
          operatorId: operator?.id || license.operatorId,
          operatorName: opName,
          status: 'active',
          machineId: license.machineId || machineId,
          permissions: ['OPERATOR']
        },
        apiConfig: {
          geminiApiKey: db.adminSettings?.geminiApiKey || '',
          geminiModel: db.adminSettings?.geminiModel || 'gemini-3.8-flash',
          dailyLimit: operator?.dailyLimit || 50,
          todayGenerations: 0
        },
        message: 'Chave serial ativa e liberada para uso!'
      });
    }

    // 2. CHAVE VIRGEM (Sem operador cadastrado): aguarda onboarding
    if (!operator && (!license.operatorId || license.status === 'pending_onboarding' || license.status === 'pending_activation')) {
      return NextResponse.json({
        valid: true,
        status: 'pending_onboarding',
        serialToken: cleanedSerial,
        message: 'Chave serial virgem. Preencha seus dados de operador para submeter o cadastro.'
      });
    }

    // 3. CADASTRO SUBMETIDO, AGUARDANDO APROVAÇÃO DO ADMIN
    if (
      license.status === 'pending_approval' ||
      operator?.status === 'PENDENTE_APROVACAO' ||
      (license.status === 'pending_activation' && operator)
    ) {
      return NextResponse.json({
        valid: true,
        status: 'pending_approval',
        serialToken: cleanedSerial,
        operatorName: operator?.name || license.operatorName || 'Operador Billy',
        message: 'Cadastro recebido com sucesso. Aguardando aprovação e liberação do Administrador Master.'
      });
    }

    // 4. OPERADOR BLOQUEADO
    if (operator?.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'O acesso deste operador foi bloqueado pelo Administrador.' },
        { status: 403 }
      );
    }

    // 4. LICENÇA ATIVA (active, ATIVO, EM_USO): Verifica Hardware Lock
    const isAdminMaster = cleanedSerial === 'BILLY-OP-ADMIN-MASTER-2026' || operator?.id === 'OP-0001';
    if (!isAdminMaster && license.machineId && machineId && license.machineId !== machineId) {
      return NextResponse.json(
        {
          valid: false,
          error: `Esta chave serial já está vinculada a outro computador (${license.machineId}). Solicite a liberação de máquina ao Administrador.`
        },
        { status: 409 }
      );
    }

    // Vincula a máquina caso ainda não estivesse salva
    if (!license.machineId && machineId) {
      license.machineId = machineId;
      if (operator) operator.machineId = machineId;
      writeDb(db);
    }

    const sessionToken = `BILLY-SES-${crypto.randomBytes(16).toString('hex')}`;
    const nowIso = new Date().toISOString();

    return NextResponse.json({
      valid: true,
      status: 'active',
      serialToken: cleanedSerial,
      operatorId: operator?.id || license.operatorId || 'OP-0001',
      operatorName: operator?.name || license.operatorName || 'Operador Billy',
      operatorEmail: operator?.email || '',
      permissions: ['OPERATOR'],
      sessionToken,
      machineId: license.machineId || machineId,
      activatedAt: license.activatedAt || nowIso,
      apiConfig: {
        geminiApiKey: db.adminSettings?.geminiApiKey || '',
        geminiModel: db.adminSettings?.geminiModel || 'gemini-3.8-flash',
        dailyLimit: operator?.dailyLimit || 50,
        todayGenerations: 0
      },
      message: 'Chave serial ativa e liberada para uso!'
    });

  } catch (err: any) {
    console.error('Erro ao verificar chave serial:', err);
    return NextResponse.json(
      { valid: false, error: 'Erro interno ao validar chave serial.' },
      { status: 500 }
    );
  }
}
