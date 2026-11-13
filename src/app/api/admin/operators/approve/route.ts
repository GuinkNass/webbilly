import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb, generateSerial, Operator, LicenseRecord } from '@/lib/db';
import { fetchAllOperatorsFromSupabase, upsertOperatorInSupabase } from '@/lib/supabase';
import { sendOperatorApprovalEmail } from '@/lib/lark-mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function cleanPrefixFromName(name: string): string {
  const parts = (name || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'operador';
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[parts.length - 1]}`;
}

async function provisionLarkMailbox(
  name: string,
  corporateEmail: string,
  mobile: string
): Promise<{ success: boolean; message?: string }> {
  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    return {
      success: false,
      message: 'Chaves LARK_APP_ID e LARK_APP_SECRET não configuradas no ambiente. Caixa deve ser criada no console Lark.'
    };
  }

  try {
    const authRes = await fetch('https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret
      })
    });

    const authJson = await authRes.json();
    if (!authRes.ok || !authJson.tenant_access_token) {
      return { success: false, message: `Falha ao autenticar API do Lark: ${authJson.msg || 'Erro desconhecido'}` };
    }

    const token = authJson.tenant_access_token;
    const cleanDigits = (mobile || '').replace(/\D/g, '');
    const formattedPhone = cleanDigits.startsWith('55') ? cleanDigits : '55' + cleanDigits;

    const userRes = await fetch('https://open.larksuite.com/open-apis/contact/v3/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        enterprise_email: corporateEmail,
        mobile: formattedPhone.length >= 10 ? `+${formattedPhone}` : undefined
      })
    });

    const userJson = await userRes.json();
    if (!userRes.ok || userJson.code !== 0) {
      return { success: false, message: `Lark API retorno code ${userJson.code}: ${userJson.msg}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Erro de conexão com Lark API.' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const body = await req.json();
    const { operatorId, serialToken } = body;

    if (!operatorId && !serialToken) {
      return NextResponse.json(
        { error: 'ID do Operador ou Serial deve ser fornecido.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const cleanSerial = serialToken ? String(serialToken).trim().toUpperCase() : null;

    // 1. Busca operador no banco local e Supabase
    let op = (db.operators || []).find(o =>
      (operatorId && o.id === operatorId) ||
      (cleanSerial && (o.serialToken || '').trim().toUpperCase() === cleanSerial)
    );

    if (!op) {
      const allOps = await fetchAllOperatorsFromSupabase();
      op = allOps.find(o =>
        (operatorId && o.id === operatorId) ||
        (cleanSerial && (o.serialToken || '').trim().toUpperCase() === cleanSerial)
      );
    }

    if (!op) {
      return NextResponse.json({ error: 'Operador / Candidato não encontrado no sistema.' }, { status: 404 });
    }

    // 2. Gera Serial Desktop único
    let finalSerial = (op.serialToken || '').trim().toUpperCase();
    if (!finalSerial || finalSerial === 'PENDENTE' || finalSerial === '') {
      finalSerial = generateSerial();
      while (db.licenses.some(l => l.serialToken === finalSerial)) {
        finalSerial = generateSerial();
      }
    }

    // 3. Gera E-mail Corporativo (@webbilly.com.br)
    let corporateEmail = op.corporate_email || (op as any).corporateEmail;
    if (!corporateEmail) {
      const basePrefix = cleanPrefixFromName(op.name);
      let candidatePrefix = basePrefix;
      let counter = 1;

      const existingEmails = new Set(
        (db.operators || [])
          .map(o => (o.corporate_email || (o as any).corporateEmail || '').toLowerCase())
          .filter(Boolean)
      );

      while (existingEmails.has(`${candidatePrefix}@webbilly.com.br`)) {
        counter += 1;
        candidatePrefix = `${basePrefix}${counter}`;
      }

      corporateEmail = `${candidatePrefix}@webbilly.com.br`;
    }

    // 4. Gera Senha Provisória Forte
    const randomDigits = crypto.randomInt(1000, 9999);
    const tempPassword = `Billy@2026#${randomDigits}`;
    const passwordHash = bcrypt.hashSync(tempPassword, 10);
    const nowIso = new Date().toISOString();

    // 5. Provisiona no Lark Suite se credenciais estiverem ativas
    const larkResult = await provisionLarkMailbox(op.name, corporateEmail, op.whatsapp);

    // 6. Atualiza Supabase como fonte única de verdade
    await upsertOperatorInSupabase({
      ...op,
      status: 'ATIVO',
      serialToken: finalSerial,
      corporate_email: corporateEmail,
      corporateEmail: corporateEmail,
      passwordHash: passwordHash,
      mustChangePassword: true,
      must_change_password: true,
      lark_provisioned: larkResult.success,
      larkProvisioned: larkResult.success
    });

    // 7. Atualiza banco local
    const localOp = db.operators.find(o => o.id === op!.id);
    if (localOp) {
      localOp.status = 'ATIVO';
      localOp.serialToken = finalSerial;
      localOp.corporate_email = corporateEmail;
      localOp.corporateEmail = corporateEmail;
      localOp.passwordHash = passwordHash;
      localOp.tempPasswordPlain = tempPassword;
      localOp.mustChangePassword = true;
      localOp.lark_provisioned = larkResult.success;
      localOp.larkProvisioned = larkResult.success;
      localOp.lastSync = nowIso;
    } else {
      db.operators.push({
        ...op,
        status: 'ATIVO',
        serialToken: finalSerial,
        corporate_email: corporateEmail,
        corporateEmail: corporateEmail,
        passwordHash: passwordHash,
        tempPasswordPlain: tempPassword,
        mustChangePassword: true,
        lark_provisioned: larkResult.success,
        larkProvisioned: larkResult.success,
        lastSync: nowIso
      });
    }

    // 8. Cria / Ativa Licença Desktop em db.licenses
    const existingLic = db.licenses.find(l => (l.serialToken || '').trim().toUpperCase() === finalSerial);
    if (existingLic) {
      existingLic.status = 'active';
      existingLic.operatorId = op.id;
      existingLic.operatorName = op.name;
      existingLic.operatorEmail = corporateEmail;
      existingLic.email = op.email;
      existingLic.lastSync = nowIso;
    } else {
      db.licenses.unshift({
        serialToken: finalSerial,
        operatorId: op.id,
        operatorName: op.name,
        operatorEmail: corporateEmail,
        email: op.email,
        status: 'active',
        machineId: null,
        osInfo: null,
        dailyLimit: 50,
        createdAt: nowIso,
        lastSync: nowIso,
        activatedAt: nowIso
      });
    }

    writeDb(db);

    // 9. Envia e-mail oficial com credenciais e link do painel
    await sendOperatorApprovalEmail({
      operadorNome: op.name,
      operadorEmailPessoal: op.email,
      corporateEmail: corporateEmail,
      temporaryPassword: tempPassword,
      serialToken: finalSerial,
      painelUrl: 'https://webbilly.com.br/operador'
    });

    console.log(`[Admin Operadores] Operador ${op.name} aprovado com sucesso! Serial: ${finalSerial}, Email: ${corporateEmail}`);

    return NextResponse.json({
      success: true,
      serialToken: finalSerial,
      corporateEmail: corporateEmail,
      tempPassword: tempPassword,
      larkProvisioned: larkResult.success,
      larkMessage: larkResult.message,
      operatorName: op.name,
      message: `Operador ${op.name} aprovado com sucesso! E-mail corporativo (${corporateEmail}), senha provisória e chave serial gerados e enviados para ${op.email}.`
    });

  } catch (err: any) {
    console.error('Erro ao aprovar operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao aprovar operador.' },
      { status: 500 }
    );
  }
}
