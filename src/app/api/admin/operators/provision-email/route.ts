import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { upsertOperatorInSupabase } from '@/lib/supabase';
import { sendCorporateCredentialsEmail } from '@/lib/lark-mailer';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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
      message: 'Chaves LARK_APP_ID e LARK_APP_SECRET não configuradas no ambiente. Caixa deve ser criada no painel Lark.'
    };
  }

  try {
    // 1. Obter tenant_access_token
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

    // 2. Criar usuário / caixa postal
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

    const body = await req.json().catch(() => ({}));
    const { operatorId, customPrefix } = body;

    if (!operatorId) {
      return NextResponse.json({ error: 'operatorId é obrigatório.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(o => o.id === operatorId);

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    // 1. Gera ou valida o prefixo de e-mail corporativo
    let basePrefix = (customPrefix || '').toLowerCase().trim().replace(/[^a-z0-9._-]/g, '');
    if (!basePrefix) {
      basePrefix = cleanPrefixFromName(operator.name);
    }

    let candidateEmail = `${basePrefix}@webbilly.com.br`;
    let counter = 2;

    // Trata colisão com outros operadores
    while (
      db.operators.some(
        o => o.id !== operator.id &&
             (o.corporate_email?.toLowerCase() === candidateEmail.toLowerCase() ||
              o.corporateEmail?.toLowerCase() === candidateEmail.toLowerCase())
      )
    ) {
      candidateEmail = `${basePrefix}${counter}@webbilly.com.br`;
      counter++;
    }

    // 2. Gera senha temporária segura (ex: Billy@2026#7B2E)
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const tempPassword = `Billy@2026#${randomHex}`;
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    // 3. Tenta provisionar na API Lark Suite
    const larkResult = await provisionLarkMailbox(operator.name, candidateEmail, operator.whatsapp);

    // 4. Atualiza o cadastro do operador
    operator.corporate_email = candidateEmail;
    operator.corporateEmail = candidateEmail;
    operator.passwordHash = passwordHash;
    operator.tempPasswordPlain = tempPassword;
    operator.mustChangePassword = true;
    operator.must_change_password = true;
    operator.lark_provisioned = larkResult.success;
    operator.larkProvisioned = larkResult.success;

    // Salva no banco local/runtime
    writeDb(db);

    // 5. Salva no Supabase (Fonte Única de Verdade)
    try {
      await upsertOperatorInSupabase({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        whatsapp: operator.whatsapp,
        corporate_email: candidateEmail,
        passwordHash,
        mustChangePassword: true,
        lark_provisioned: larkResult.success,
        status: operator.status
      });
    } catch (sbErr) {
      console.warn('[ProvisionEmail] Aviso ao salvar no Supabase:', sbErr);
    }

    // 6. Envia as credenciais ao e-mail pessoal de cadastro do operador
    let emailSent = false;
    if (operator.email) {
      try {
        emailSent = await sendCorporateCredentialsEmail({
          operadorNome: operator.name,
          operadorEmailPessoal: operator.email,
          corporateEmail: candidateEmail,
          temporaryPassword: tempPassword,
          serialToken: operator.serialToken,
          webmailUrl: 'https://mail.larksuite.com',
          painelUrl: 'https://webbilly.com.br/operador'
        });
      } catch (mailErr) {
        console.warn('[ProvisionEmail] Falha ao enviar e-mail de credenciais:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      operatorId: operator.id,
      operatorName: operator.name,
      personalEmail: operator.email,
      corporateEmail: candidateEmail,
      tempPassword,
      larkProvisioned: larkResult.success,
      larkNotice: larkResult.success
        ? 'Caixa postal criada com sucesso na API do Lark Suite!'
        : (larkResult.message || 'Chaves de API Lark não configuradas. Crie a conta manualmente no console Lark.'),
      emailSent,
      message: `E-mail corporativo ${candidateEmail} gerado com sucesso para ${operator.name}!`
    });
  } catch (err: any) {
    console.error('[ProvisionEmail] Erro:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao provisionar e-mail corporativo.' },
      { status: 500 }
    );
  }
}
