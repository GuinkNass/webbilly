import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, generateSerial, Operator, LicenseRecord } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso não autorizado. Apenas Master Admin.' }, { status: 403 });
    }

    const body = await req.json();
    const { candidateId, action, rejectionReason } = body;

    if (!candidateId || !['APROVAR', 'RECUSAR'].includes(action)) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const db = readDb();
    const candidateIndex = db.candidates.findIndex(c => c.id === candidateId);

    if (candidateIndex === -1) {
      return NextResponse.json({ error: 'Candidato não encontrado.' }, { status: 404 });
    }

    const candidate = db.candidates[candidateIndex];

    if (action === 'APROVAR') {
      // Gera token serial único
      let serialToken = generateSerial();
      while (db.licenses.some(l => l.serialToken === serialToken)) {
        serialToken = generateSerial();
      }

      // Senha temporária para o primeiro acesso
      const initialPassword = `billy@${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = bcrypt.hashSync(initialPassword, 10);

      const opId = `OP-${1000 + db.operators.length + 1}`;

      const newOperator: Operator = {
        id: opId,
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email,
        passwordHash,
        whatsapp: candidate.whatsapp,
        pixType: candidate.pixType,
        pixKey: candidate.pixKey,
        serialToken,
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        dailyLimit: db.adminSettings.defaultDailyLimit || 50,
        todayGenerations: 0,
        createdAt: new Date().toISOString(),
        referred_by_operator_id: candidate.referred_by_operator_id || null
      };

      const newLicense: LicenseRecord = {
        serialToken,
        operatorId: opId,
        operatorName: candidate.name,
        status: 'ATIVO',
        machineId: null,
        osInfo: null,
        lastSync: null,
        createdAt: new Date().toISOString()
      };

      // Atualiza o candidato
      candidate.status = 'APROVADO';
      candidate.reviewedAt = new Date().toISOString();

      db.operators.unshift(newOperator);
      db.licenses.unshift(newLicense);
      writeDb(db);

      // Simulação de envio de e-mail de onboarding com as credenciais e serial
      const emailContent = `
Parabéns, ${candidate.name}! Sua candidatura para Operador Comercial Billy Suite foi APROVADA.

Seu Token Serial de Ativação do Billy Suite Desktop:
👉 ${serialToken}

Acesso ao Painel do Operador (https://www.webbilly.com.br/operador/login):
E-mail: ${candidate.email}
Senha Provisória: ${initialPassword}

Baixe o app desktop e conclua o módulo de treinamento rápido na sua área restrita.
Boas vendas!
      `.trim();

      return NextResponse.json({
        success: true,
        message: `Operador ${candidate.name} aprovado com sucesso! Token Serial gerado.`,
        operator: {
          id: opId,
          name: candidate.name,
          email: candidate.email,
          serialToken,
          initialPassword
        },
        simulatedEmail: emailContent
      });
    } else {
      // RECUSAR
      candidate.status = 'RECUSADO';
      candidate.reviewedAt = new Date().toISOString();
      candidate.notes = rejectionReason || 'Perfil não alinhado com os requisitos técnicos/comerciais no momento.';
      writeDb(db);

      const emailContent = `
Olá, ${candidate.name}.
Agradecemos seu interesse em atuar como Operador Comercial na Billy Suite.
Neste momento optamos por seguir com outros perfis que atendiam mais de perto os pré-requisitos vigentes.
Seu cadastro continuará em nosso banco de talentos para futuras expansões da nossa rede comercial.
      `.trim();

      return NextResponse.json({
        success: true,
        message: `Candidatura de ${candidate.name} recusada. Notificação registrada.`,
        simulatedEmail: emailContent
      });
    }
  } catch (err: any) {
    console.error('Erro ao revisar candidatura:', err);
    return NextResponse.json({ error: 'Erro ao processar revisão de candidato.' }, { status: 500 });
  }
}
