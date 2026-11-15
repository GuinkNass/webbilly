import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb, generateSerial, Operator, LicenseRecord } from '@/lib/db';
import { fetchAllOperatorsFromSupabase, upsertOperatorInSupabase, getSupabaseAdmin, mapRowToOperator } from '@/lib/supabase';
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
    const { operatorId, candidateId, email, serialToken } = body;

    const targetId = (operatorId || candidateId || '').trim();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSerial = serialToken && serialToken !== 'NOVO' && serialToken !== 'PENDENTE'
      ? String(serialToken).trim().toUpperCase()
      : null;

    if (!targetId && !cleanEmail && !cleanSerial) {
      return NextResponse.json(
        { error: 'ID do Operador, Candidato, E-mail ou Serial deve ser fornecido.' },
        { status: 400 }
      );
    }

    const db = readDb();

    // 1. Busca operador no banco local e Supabase
    let op = (db.operators || []).find(o =>
      (targetId && (o.id === targetId || o.candidateId === targetId)) ||
      (cleanEmail && (
        (o.email && o.email.toLowerCase().trim() === cleanEmail) ||
        (o.corporate_email && o.corporate_email.toLowerCase().trim() === cleanEmail) ||
        ((o as any).corporateEmail && (o as any).corporateEmail.toLowerCase().trim() === cleanEmail)
      )) ||
      (cleanSerial && (o.serialToken || '').trim().toUpperCase() === cleanSerial)
    );

    if (!op) {
      try {
        const allOps = await fetchAllOperatorsFromSupabase();
        op = allOps.find(o =>
          (targetId && (o.id === targetId || o.candidateId === targetId)) ||
          (cleanEmail && (
            (o.email && o.email.toLowerCase().trim() === cleanEmail) ||
            (o.corporate_email && o.corporate_email.toLowerCase().trim() === cleanEmail) ||
            ((o as any).corporateEmail && (o as any).corporateEmail.toLowerCase().trim() === cleanEmail)
          )) ||
          (cleanSerial && (o.serialToken || '').trim().toUpperCase() === cleanSerial)
        );
      } catch (err) {
        console.warn('Erro ao consultar operadores no Supabase:', err);
      }
    }

    // 2. Se não encontrou operador cadastrado, busca na lista de candidaturas (db.candidates)
    let candidate = (db.candidates || []).find(c =>
      (targetId && c.id === targetId) ||
      (cleanEmail && c.email && c.email.toLowerCase().trim() === cleanEmail)
    );

    // Fallback direto no Supabase caso o candidato tenha se inscrito na landing page
    if (!op && !candidate) {
      try {
        const supabase = getSupabaseAdmin();
        if (targetId) {
          const { data: opData } = await supabase.from('operators').select('*').eq('id', targetId).maybeSingle();
          if (opData) op = mapRowToOperator(opData);
        }
        if (!op && cleanEmail) {
          const { data: opData } = await supabase.from('operators').select('*').eq('email', cleanEmail).maybeSingle();
          if (opData) op = mapRowToOperator(opData);
        }
        if (!op && targetId) {
          const { data: candData } = await supabase.from('candidaturas').select('*').eq('id', targetId).maybeSingle();
          if (candData) {
            candidate = {
              id: candData.id,
              name: candData.full_name || candData.name || 'Candidato',
              email: candData.email,
              whatsapp: candData.whatsapp,
              pixKey: candData.pix_key,
              pixType: candData.pix_type,
              status: 'PENDENTE'
            } as any;
          }
        }
      } catch (errSup) {
        console.warn('Erro na busca de candidato no Supabase:', errSup);
      }
    }

    if (!op && !candidate) {
      return NextResponse.json({ error: 'Operador / Candidato não encontrado no sistema.' }, { status: 404 });
    }

    // 3. Se era apenas um candidato em db.candidates, promove para Operator
    if (!op && candidate) {
      const newOpId = `OP-${Date.now().toString(36).toUpperCase()}`;
      op = {
        id: newOpId,
        candidateId: candidate.id,
        name: candidate.name,
        email: candidate.email.trim().toLowerCase(),
        whatsapp: candidate.whatsapp,
        pixType: candidate.pixType || 'cpf',
        pixKey: candidate.pixKey || '',
        pix_type: candidate.pixType || 'cpf',
        pix_key: candidate.pixKey || '',
        city_state: candidate.city && candidate.state ? `${candidate.city} - ${candidate.state}` : (candidate.city || candidate.state || ''),
        experience: candidate.experience || '',
        status: 'ATIVO',
        serialToken: cleanSerial || '',
        dailyLimit: 50,
        todayGenerations: 0,
        createdAt: new Date().toISOString(),
        referred_by_operator_id: candidate.referred_by_operator_id || null,
        affiliate_enabled: false,
        passwordHash: '',
        mustChangePassword: true,
        must_change_password: true
      };
      db.operators.push(op);
    }

    const finalOp = op!;

    // Marca status do candidato como APROVADO para remover da triagem pendente
    if (candidate) {
      candidate.status = 'APROVADO';
      candidate.reviewedAt = new Date().toISOString();
    } else {
      // Se já era op, verifica se também existe ficha de candidatura para marcar aprovado
      const matchingCand = (db.candidates || []).find(c =>
        (finalOp.candidateId && c.id === finalOp.candidateId) ||
        (finalOp.email && c.email && c.email.toLowerCase().trim() === finalOp.email.toLowerCase().trim())
      );
      if (matchingCand) {
        matchingCand.status = 'APROVADO';
        matchingCand.reviewedAt = new Date().toISOString();
      }
    }

    // 4. Gera Serial Desktop único
    let finalSerial = (finalOp.serialToken || '').trim().toUpperCase();
    if (!finalSerial || finalSerial === 'PENDENTE' || finalSerial === 'NOVO' || finalSerial === '') {
      finalSerial = generateSerial();
      while (db.licenses.some(l => (l.serialToken || '').trim().toUpperCase() === finalSerial)) {
        finalSerial = generateSerial();
      }
    }

    // 5. Gera E-mail Corporativo (@webbilly.com.br)
    let corporateEmail = finalOp.corporate_email || (finalOp as any).corporateEmail;
    if (!corporateEmail) {
      const basePrefix = cleanPrefixFromName(finalOp.name);
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

    // 6. Gera Senha Provisória Forte
    const randomDigits = crypto.randomInt(1000, 9999);
    const tempPassword = `Billy@2026#${randomDigits}`;
    const passwordHash = bcrypt.hashSync(tempPassword, 10);
    const nowIso = new Date().toISOString();

    // 7. Provisiona no Lark Suite se credenciais estiverem ativas
    const larkResult = await provisionLarkMailbox(finalOp.name, corporateEmail, finalOp.whatsapp);

    // 8. Atualiza Supabase como fonte única de verdade (payload seguro)
    await upsertOperatorInSupabase({
      ...finalOp,
      id: finalOp.id,
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

    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('candidaturas').update({ status: 'approved' }).or(`id.eq.${finalOp.id},email.eq.${finalOp.email}`);
      await supabase.from('candidates').update({ status: 'approved' }).or(`id.eq.${finalOp.id},email.eq.${finalOp.email}`);
    } catch (_) {}

    // 9. Atualiza banco local
    const localOp = db.operators.find(o => o.id === finalOp.id);
    if (localOp) {
      localOp.status = 'ATIVO';
      localOp.serialToken = finalSerial;
      localOp.corporate_email = corporateEmail;
      localOp.corporateEmail = corporateEmail;
      localOp.passwordHash = passwordHash;
      localOp.tempPasswordPlain = tempPassword;
      localOp.mustChangePassword = true;
      localOp.must_change_password = true;
      localOp.lark_provisioned = larkResult.success;
      localOp.larkProvisioned = larkResult.success;
      localOp.lastSync = nowIso;
    } else {
      db.operators.push({
        ...finalOp,
        status: 'ATIVO',
        serialToken: finalSerial,
        corporate_email: corporateEmail,
        corporateEmail: corporateEmail,
        passwordHash: passwordHash,
        tempPasswordPlain: tempPassword,
        mustChangePassword: true,
        must_change_password: true,
        lark_provisioned: larkResult.success,
        larkProvisioned: larkResult.success,
        lastSync: nowIso
      });
    }

    // 8. Cria / Ativa Licença Desktop em db.licenses
    const existingLic = db.licenses.find(l => (l.serialToken || '').trim().toUpperCase() === finalSerial);
    if (existingLic) {
      existingLic.status = 'active';
      existingLic.operatorId = finalOp.id;
      existingLic.operatorName = finalOp.name;
      existingLic.operatorEmail = corporateEmail;
      existingLic.email = finalOp.email;
      existingLic.lastSync = nowIso;
    } else {
      db.licenses.unshift({
        serialToken: finalSerial,
        operatorId: finalOp.id,
        operatorName: finalOp.name,
        operatorEmail: corporateEmail,
        email: finalOp.email,
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
      operadorNome: finalOp.name,
      operadorEmailPessoal: finalOp.email,
      corporateEmail: corporateEmail,
      temporaryPassword: tempPassword,
      serialToken: finalSerial,
      painelUrl: 'https://webbilly.com.br/operador'
    });

    console.log(`[Admin Operadores] Operador ${finalOp.name} aprovado com sucesso! Serial: ${finalSerial}, Email: ${corporateEmail}`);

    return NextResponse.json({
      success: true,
      serialToken: finalSerial,
      corporateEmail: corporateEmail,
      tempPassword: tempPassword,
      larkProvisioned: larkResult.success,
      larkMessage: larkResult.message,
      operatorName: finalOp.name,
      message: `Operador ${finalOp.name} aprovado com sucesso! E-mail corporativo (${corporateEmail}), senha provisória e chave serial gerados e enviados para ${finalOp.email}.`
    });

  } catch (err: any) {
    console.error('Erro ao aprovar operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao aprovar operador.' },
      { status: 500 }
    );
  }
}
