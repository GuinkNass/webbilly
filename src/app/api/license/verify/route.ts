import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

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

    const license = db.licenses.find(l => l.serialToken.toUpperCase() === cleanedSerial);
    if (!license) {
      return NextResponse.json(
        { valid: false, error: 'Chave Serial não encontrada ou inválida no sistema Billy Suite.' },
        { status: 404 }
      );
    }

    if (license.status === 'revoked' || license.status === 'BLOQUEADO') {
      return NextResponse.json(
        { valid: false, error: 'Esta chave serial foi bloqueada ou revogada pelo Administrador Central.' },
        { status: 403 }
      );
    }

    // Se a licença é virgem (aguardando onboarding)
    if (license.status === 'pending_activation' || !license.operatorId) {
      return NextResponse.json({
        valid: true,
        requiresOnboarding: true,
        status: 'pending_activation',
        serialToken: cleanedSerial,
        message: 'Chave serial virgem válida. Preencha seus dados de operador para ativação.'
      });
    }

    // Licença já possui operador vinculado: verifica Hardware Lock
    const isAdminMaster = cleanedSerial === 'BILLY-OP-ADMIN-MASTER-2026' || license.operatorId === 'OP-0001';
    if (!isAdminMaster && license.machineId && machineId && license.machineId !== machineId) {
      return NextResponse.json(
        {
          valid: false,
          error: `Esta chave serial já está vinculada a outro computador (${license.machineId}). Solicite a liberação de máquina ao Administrador.`
        },
        { status: 409 }
      );
    }

    const operator = db.operators.find(o => o.serialToken.toUpperCase() === cleanedSerial || o.id === license.operatorId);

    return NextResponse.json({
      valid: true,
      requiresOnboarding: false,
      status: 'active',
      serialToken: cleanedSerial,
      operatorName: operator?.name || license.operatorName || 'Operador Billy',
      operatorEmail: operator?.email || '',
      message: 'Chave serial ativa e reconhecida para esta máquina.'
    });

  } catch (err: any) {
    console.error('Erro ao verificar chave serial:', err);
    return NextResponse.json(
      { valid: false, error: 'Erro interno ao validar chave serial.' },
      { status: 500 }
    );
  }
}
