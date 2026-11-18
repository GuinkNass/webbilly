import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Operator } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { getSupabaseAdmin, fetchAllOperatorsFromSupabase, upsertOperatorInSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      console.warn('[Lark Callback] Código de autorização não recebido.');
      return NextResponse.redirect(new URL('/operador/login?erro=codigo_nao_fornecido', req.url));
    }

    const appId = process.env.LARK_APP_ID;
    const appSecret = process.env.LARK_APP_SECRET;

    if (!appId || !appSecret) {
      console.error('[Lark Callback] LARK_APP_ID ou LARK_APP_SECRET ausentes no servidor.');
      return NextResponse.redirect(new URL('/operador/login?erro=lark_config_ausente', req.url));
    }

    // 1. Obter app_access_token oficial do Lark
    const tokenRes = await fetch('https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret
      }),
      cache: 'no-store'
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.app_access_token) {
      console.error('[Lark Callback] Erro ao obter app_access_token:', tokenData);
      return NextResponse.redirect(new URL('/operador/login?erro=lark_falha_token', req.url));
    }

    const appAccessToken = tokenData.app_access_token;

    // 2. Trocar code por user_access_token via endpoint OIDC do Lark
    let larkUser: any = null;
    const oidcRes = await fetch('https://open.larksuite.com/open-apis/authen/v1/oidc/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${appAccessToken}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code
      }),
      cache: 'no-store'
    });

    const oidcData = await oidcRes.json();
    if (oidcRes.ok && oidcData.data) {
      larkUser = oidcData.data;
    }

    // Fallback: se não veio dados completos do usuário, consulta endpoint user_info
    if (larkUser?.access_token) {
      try {
        const userInfoRes = await fetch('https://open.larksuite.com/open-apis/authen/v1/user_info', {
          headers: {
            Authorization: `Bearer ${larkUser.access_token}`
          },
          cache: 'no-store'
        });
        const userInfoJson = await userInfoRes.json();
        if (userInfoJson.data) {
          larkUser = { ...larkUser, ...userInfoJson.data };
        }
      } catch (uiErr) {
        console.warn('[Lark Callback] Aviso ao buscar user_info:', uiErr);
      }
    }

    const userEmail = (
      larkUser?.enterprise_email ||
      larkUser?.email ||
      ''
    ).trim().toLowerCase();

    const userName = larkUser?.name || larkUser?.en_name || 'Operador Webbilly';
    const userAvatar = larkUser?.avatar_url || larkUser?.avatar_thumb || '';

    if (!userEmail) {
      console.error('[Lark Callback] Usuário autenticado sem e-mail retornado pelo Lark:', larkUser);
      return NextResponse.redirect(new URL('/operador/login?erro=email_nao_encontrado_lark', req.url));
    }

    console.log(`[Lark Callback] Login realizado via Lark para: ${userEmail} (${userName})`);

    const db = readDb();
    const supabaseAdmin = getSupabaseAdmin();

    // 3. Validação: Verifica se é Administrador Master
    const adminUser = (db.adminUsers || []).find(
      u => (u.email && u.email.trim().toLowerCase() === userEmail) ||
           ((u as any).personal_email && (u as any).personal_email.trim().toLowerCase() === userEmail)
    );
    const isMasterAdmin =
      userEmail === 'admin@billysuite.com.br' ||
      userEmail === 'lucas@webbilly.com.br' ||
      userEmail === 'lucasklock@gmail.com' ||
      Boolean(adminUser);

    // 4. Validação: Verifica se é Operador Aprovado
    let operator: Operator | undefined = db.operators.find(
      o => (o.email && o.email.trim().toLowerCase() === userEmail) ||
           (o.corporate_email && o.corporate_email.trim().toLowerCase() === userEmail) ||
           (o.corporateEmail && o.corporateEmail.trim().toLowerCase() === userEmail)
    );

    // Se não encontrou no db local, consulta no Supabase (Fonte de Verdade dos operadores)
    if (!operator) {
      try {
        const supaOps = await fetchAllOperatorsFromSupabase();
        operator = supaOps.find(
          o => (o.email && o.email.trim().toLowerCase() === userEmail) ||
               (o.corporate_email && o.corporate_email.trim().toLowerCase() === userEmail) ||
               (o.corporateEmail && o.corporateEmail.trim().toLowerCase() === userEmail)
        );
      } catch (err) {
        console.warn('[Lark Callback] Erro ao consultar operadores do Supabase:', err);
      }
    }

    // Se ainda não encontrou, checa em candidaturas aprovadas ou tabela profiles no Supabase
    if (!operator && !isMasterAdmin) {
      try {
        const { data: candData } = await supabaseAdmin
          .from('candidaturas')
          .select('*')
          .or(`email.ilike.${userEmail},corporate_email.ilike.${userEmail}`)
          .eq('status', 'APROVADO')
          .maybeSingle();

        if (candData) {
          // Cria o operador correspondente se a candidatura foi aprovada
          operator = {
            id: `OP-${Date.now().toString(36).toUpperCase()}`,
            name: candData.nome || candData.name || userName,
            email: candData.email,
            corporate_email: userEmail.endsWith('@webbilly.com.br') ? userEmail : candData.corporate_email || `${candData.nome?.toLowerCase().replace(/\s+/g, '.')}@webbilly.com.br`,
            whatsapp: candData.whatsapp || '',
            pixType: candData.pix_type || 'cpf',
            pixKey: candData.pix_key || '',
            serialToken: `BILLY-OP-${Date.now().toString(36).toUpperCase()}-2026`,
            status: 'ATIVO',
            mustChangePassword: false,
            must_change_password: false,
            lark_provisioned: true,
            auth_provider: 'lark',
            createdAt: new Date().toISOString()
          } as any;

          db.operators.push(operator!);
          writeDb(db);
          await upsertOperatorInSupabase(operator!);
        }
      } catch (candErr) {
        console.warn('[Lark Callback] Erro ao consultar candidaturas:', candErr);
      }
    }

    // Se não for nem Admin Master nem Operador Aprovado, bloqueia acesso
    if (!isMasterAdmin && !operator) {
      console.warn(`[Lark Callback] Acesso negado: e-mail ${userEmail} não é um operador aprovado.`);
      return NextResponse.redirect(new URL('/operador/login?erro=operador_nao_autorizado', req.url));
    }

    if (operator && operator.status === 'BLOQUEADO') {
      return NextResponse.redirect(new URL('/operador/login?erro=operador_bloqueado', req.url));
    }

    // 5. Atualiza dados do operador: Lark como auth_provider e must_change_password = false
    if (operator) {
      operator.mustChangePassword = false;
      operator.must_change_password = false;
      (operator as any).auth_provider = 'lark';
      operator.lark_provisioned = true;
      if (userEmail.endsWith('@webbilly.com.br')) {
        operator.corporate_email = userEmail;
        operator.corporateEmail = userEmail;
      }
      writeDb(db);

      // Persiste no Supabase
      try {
        await upsertOperatorInSupabase({
          id: operator.id,
          name: operator.name || userName,
          email: operator.email,
          corporate_email: operator.corporate_email || operator.corporateEmail || userEmail,
          mustChangePassword: false,
          must_change_password: false,
          lark_provisioned: true,
          status: operator.status || 'ATIVO'
        });

        await supabaseAdmin
          .from('operators')
          .update({
            must_change_password: false,
            auth_provider: 'lark',
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${operator.id},email.eq.${operator.email}`);
      } catch (opErr) {
        console.warn('[Lark Callback] Erro ao persistir operador no Supabase:', opErr);
      }
    }

    // 6. Sincroniza usuário no Supabase Auth
    try {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = userList?.users?.find(
        u => u.email?.toLowerCase() === userEmail.toLowerCase()
      );

      if (existingAuthUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
          user_metadata: {
            ...existingAuthUser.user_metadata,
            name: userName,
            avatar_url: userAvatar,
            must_change_password: false,
            auth_provider: 'lark'
          }
        });
      } else {
        await supabaseAdmin.auth.admin.createUser({
          email: userEmail,
          email_confirm: true,
          user_metadata: {
            name: userName,
            avatar_url: userAvatar,
            must_change_password: false,
            auth_provider: 'lark'
          }
        });
      }

      // Gera link de magiclink para sessão completa do Supabase Auth
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: userEmail
      });
    } catch (authErr) {
      console.warn('[Lark Callback] Aviso ao sincronizar Supabase Auth:', authErr);
    }

    // 7. Emissão do token oficial de sessão Webbilly
    const token = signToken({
      userId: isMasterAdmin ? (adminUser?.id || 'MASTER-01') : operator!.id,
      email: userEmail,
      name: isMasterAdmin ? (adminUser?.name || 'Administrador Master') : (operator!.name || userName),
      role: isMasterAdmin ? 'MASTER' : 'OPERATOR',
      serialToken: operator?.serialToken
    });

    const redirectPath = isMasterAdmin ? '/admin' : '/operador';
    const response = NextResponse.redirect(new URL(redirectPath, req.url));

    // Define cookies de sessão
    response.cookies.set('billy_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    // Flag no cookie para o cliente e middleware identificarem autenticação Lark
    response.cookies.set('webbilly_lark_auth', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err: any) {
    console.error('[Lark Callback Fatal Error]:', err);
    return NextResponse.redirect(new URL('/operador/login?erro=lark_erro_inesperado', req.url));
  }
}
