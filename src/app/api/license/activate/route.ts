import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Operator } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId, osInfo, operatorIp: clientProvidedIp, onboardingData } = body;

    // Detecta o IP público via headers caso não tenha sido explicitamente enviado
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');
    let detectedIp = clientProvidedIp;
    if (!detectedIp) {
      if (forwardedFor) {
        detectedIp = forwardedFor.split(',')[0].trim();
      } else if (realIp) {
        detectedIp = realIp.trim();
      } else if (cfIp) {
        detectedIp = cfIp.trim();
      }
    }
    if (detectedIp === '::1' || detectedIp === '::ffff:127.0.0.1') {
      detectedIp = '127.0.0.1';
    }

    if (!serialToken || typeof serialToken !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Token Serial não fornecido.' },
        { status: 400 }
      );
    }

    if (!machineId || typeof machineId !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Identificador do computador (Machine ID) é obrigatório.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanedSerial = serialToken.trim().toUpperCase();

    const license = db.licenses.find(l => l.serialToken.toUpperCase() === cleanedSerial);
    if (!license) {
      return NextResponse.json(
        { valid: false, error: 'Token Serial inexistente ou inválido no sistema Billy Suite.' },
        { status: 404 }
      );
    }

    if (license.status === 'revoked' || license.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'Esta licença foi bloqueada ou revogada pelo Administrador Central.' },
        { status: 403 }
      );
    }

    const nowIso = new Date().toISOString();
    const sessionToken = `BILLY-SES-${crypto.randomBytes(16).toString('hex')}`;

    // =========================================================================
    // CASO 1: CHAVE VIRGEM (Aguardando Onboarding) OU AGUARDANDO APROVAÇÃO
    // =========================================================================
    if (license.status === 'pending_approval') {
      const op = db.operators.find(o => o.serialToken.toUpperCase() === cleanedSerial || o.id === license.operatorId);
      return NextResponse.json({
        valid: true,
        status: 'pending_approval',
        serialToken: cleanedSerial,
        operatorName: op?.name || license.operatorName || 'Operador',
        message: 'Cadastro recebido com sucesso. Aguardando liberação do Administrador Master.'
      });
    }

    if (license.status === 'pending_onboarding' || license.status === 'pending_activation' || !license.operatorId) {
      if (!onboardingData) {
        return NextResponse.json({
          valid: true,
          requiresOnboarding: true,
          status: 'pending_onboarding',
          serialToken: cleanedSerial,
          message: 'Chave serial virgem. Preencha seus dados de operador para submeter o cadastro.'
        });
      }

      const { name, cpf, email, whatsapp, pixType, pixKey } = onboardingData;

      if (!name || !cpf || !email || !whatsapp || !pixKey) {
        return NextResponse.json(
          {
            valid: false,
            error: 'Todos os campos de onboarding são obrigatórios (Nome, CPF, E-mail, WhatsApp e Chave Pix).'
          },
          { status: 400 }
        );
      }

      const cleanCpf = String(cpf).replace(/\D/g, '');
      if (cleanCpf.length < 11) {
        return NextResponse.json(
          { valid: false, error: 'CPF inválido. Informe os 11 dígitos do seu documento.' },
          { status: 400 }
        );
      }

      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        return NextResponse.json(
          { valid: false, error: 'Endereço de e-mail inválido.' },
          { status: 400 }
        );
      }

      // Verifica duplicidade de e-mail em operators
      const existingEmail = db.operators.find(o => o.email.toLowerCase() === cleanEmail);
      if (existingEmail && existingEmail.serialToken !== cleanedSerial) {
        return NextResponse.json(
          { valid: false, error: 'Já existe um operador cadastrado com este e-mail. Utilize outro e-mail.' },
          { status: 409 }
        );
      }

      // Gera senha provisória segura (ex: Billy@8A3F19)
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const tempPassword = `Billy@${randomSuffix}`;
      const passwordHash = bcrypt.hashSync(tempPassword, 10);

      // Cria ou atualiza o registro do operador
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
          machineId,
          osInfo: osInfo || 'Windows PC',
          operatorIp: detectedIp || null,
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
        operator.machineId = machineId;
        operator.osInfo = osInfo || 'Windows PC';
        operator.operatorIp = detectedIp || null;
        operator.lastSync = nowIso;
        operator.status = 'PENDENTE_APROVACAO';
      }

      // Vincula à licença e define status de aprovação
      license.operatorId = operator.id;
      license.operatorName = operator.name;
      license.machineId = machineId;
      license.osInfo = osInfo || 'Windows PC';
      license.operatorIp = detectedIp || null;
      license.status = 'pending_approval';
      license.lastSync = nowIso;

      writeDb(db);

      return NextResponse.json({
        valid: true,
        success: true,
        requiresOnboarding: false,
        status: 'pending_approval',
        operatorId: operator.id,
        operatorName: operator.name,
        operatorEmail: operator.email,
        sessionToken,
        machineId,
        webCredentials: {
          email: operator.email,
          tempPassword,
          mustChangePassword: true,
          webLoginUrl: 'https://webbilly.com.br/operador/login'
        },
        message: 'Cadastro submetido com sucesso! Aguardando aprovação do Administrador Master.'
      });
    }

    // =========================================================================
    // CASO 2: LICENÇA JÁ ATIVADA (Reconexão da mesma máquina)
    // =========================================================================
    const operator = db.operators.find(
      o => o.serialToken.toUpperCase() === cleanedSerial || o.id === license.operatorId
    );

    if (!operator) {
      return NextResponse.json(
        { valid: false, error: 'Operador vinculado à licença não localizado no sistema.' },
        { status: 404 }
      );
    }

    if (operator.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'Este operador foi bloqueado pelo Administrador Central.' },
        { status: 403 }
      );
    }

    // Hardware Lock
    const isAdminMaster = cleanedSerial === 'BILLY-OP-ADMIN-MASTER-2026' || operator.id === 'OP-0001';
    if (!isAdminMaster && license.machineId && license.machineId !== machineId) {
      return NextResponse.json(
        {
          valid: false,
          error: `Este Token Serial já está vinculado a outro computador (${license.machineId}). Solicite a liberação de máquina ao Administrador.`
        },
        { status: 409 }
      );
    }

    // Atualiza heartbeat / dados da máquina caso vazios
    if (!license.machineId) license.machineId = machineId;
    license.osInfo = osInfo || license.osInfo || 'Windows PC';
    license.operatorIp = detectedIp || license.operatorIp || null;
    license.status = 'active';
    license.lastSync = nowIso;

    if (!operator.machineId) operator.machineId = machineId;
    operator.osInfo = osInfo || operator.osInfo || 'Windows PC';
    operator.operatorIp = detectedIp || operator.operatorIp || null;
    operator.lastSync = nowIso;

    writeDb(db);

    const apiConfig = {
      geminiApiKey: db.adminSettings?.geminiApiKey || '',
      geminiModel: db.adminSettings?.geminiModel || 'gemini-3.8-flash',
      cloudflareAccountId: db.adminSettings?.cloudflareAccountId || '',
      cloudflareApiToken: db.adminSettings?.cloudflareApiToken || '',
      vercelToken: db.adminSettings?.vercelToken || '',
      dailyLimit: operator.dailyLimit || 50,
      todayGenerations: operator.todayGenerations || 0
    };

    return NextResponse.json({
      valid: true,
      requiresOnboarding: false,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorEmail: operator.email,
      permissions: ['OPERATOR'],
      sessionToken,
      machineId,
      operatorIp: detectedIp || null,
      isFirstActivation: false,
      activatedAt: license.activatedAt || license.createdAt,
      webCredentials: {
        email: operator.email,
        mustChangePassword: operator.mustChangePassword ?? false,
        webLoginUrl: 'https://webbilly.com.br/operador/login'
      },
      apiConfig,
      message: 'Licença reconhecida e validada para este computador.'
    });

  } catch (err: any) {
    console.error('Erro ao ativar licença:', err);
    return NextResponse.json(
      { valid: false, error: err.message || 'Erro interno ao validar ativação da licença.' },
      { status: 500 }
    );
  }
}
