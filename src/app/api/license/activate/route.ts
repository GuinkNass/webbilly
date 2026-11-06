import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId, osInfo, operatorIp: clientProvidedIp } = body;

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
    const operator = db.operators.find(o => o.serialToken.toUpperCase() === cleanedSerial);

    if (!license || !operator) {
      return NextResponse.json(
        { valid: false, error: 'Token Serial inválido ou inexistente no sistema Billy Suite.' },
        { status: 404 }
      );
    }

    if (license.status === 'BLOQUEADO' || operator.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'Esta licença foi bloqueada pelo Administrador Central. Entre em contato com a equipe.' },
        { status: 403 }
      );
    }

    // Validação de vinculação de máquina (Hardware Lock)
    if (license.machineId && license.machineId !== machineId) {
      return NextResponse.json(
        {
          valid: false,
          error: `Este Token Serial já está vinculado a outro computador (${license.machineId}). Solicite a liberação de máquina ao Administrador.`
        },
        { status: 409 }
      );
    }

    // Primeira ativação ou reconexão da mesma máquina
    const isFirstActivation = !license.machineId;
    const nowIso = new Date().toISOString();

    license.machineId = machineId;
    license.osInfo = osInfo || license.osInfo || 'Windows PC';
    license.operatorIp = detectedIp || license.operatorIp || null;
    license.status = 'EM_USO';
    license.lastSync = nowIso;

    operator.machineId = machineId;
    operator.osInfo = osInfo || operator.osInfo || 'Windows PC';
    operator.operatorIp = detectedIp || operator.operatorIp || null;
    operator.lastSync = nowIso;

    // Gera um sessionToken assinado para controle de requisições do desktop
    const sessionToken = `BILLY-SES-${crypto.randomBytes(16).toString('hex')}`;

    writeDb(db);

    // Credenciais centrais injetadas dinamicamente
    const apiConfig = {
      geminiApiKey: db.adminSettings.geminiApiKey,
      geminiModel: db.adminSettings.geminiModel || 'gemini-3.8-flash',
      cloudflareAccountId: db.adminSettings.cloudflareAccountId,
      cloudflareApiToken: db.adminSettings.cloudflareApiToken,
      vercelToken: db.adminSettings.vercelToken,
      dailyLimit: operator.dailyLimit || 50,
      todayGenerations: operator.todayGenerations || 0
    };

    return NextResponse.json({
      valid: true,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorEmail: operator.email,
      permissions: ['OPERATOR'],
      sessionToken,
      machineId,
      operatorIp: detectedIp || null,
      resellerWhitelistUrl: 'https://rclubbr.webpropanel.com/settings/pro-suite/api-settings',
      isFirstActivation,
      activatedAt: nowIso,
      apiConfig
    });
  } catch (err: any) {
    console.error('Erro ao ativar licença:', err);
    return NextResponse.json(
      { valid: false, error: 'Erro interno ao validar ativação da licença.' },
      { status: 500 }
    );
  }
}
