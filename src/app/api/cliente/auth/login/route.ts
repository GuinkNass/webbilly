import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findClientAccountByDomain } from '@/lib/supabase';
import { signClientToken, setClientTokenCookie } from '@/lib/client-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain, password } = body;

    if (!domain || !password) {
      return NextResponse.json(
        { error: 'Por favor, informe seu domínio/login e a senha.' },
        { status: 400 }
      );
    }

    const cleanDomain = String(domain).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    const account = await findClientAccountByDomain(cleanDomain);
    if (!account) {
      return NextResponse.json(
        { error: 'Domínio ou conta não encontrada. Verifique se digitou o endereço do seu site corretamente (ex: seunegocio.webbilly.com.br ou seunegocio.com.br).' },
        { status: 404 }
      );
    }

    if (account.status === 'blocked') {
      return NextResponse.json(
        { error: 'O acesso a este painel está suspenso ou bloqueado. Entre em contato com a equipe de suporte Billy.' },
        { status: 403 }
      );
    }

    // Validação de senha: hash bcrypt ou senha inicial simples (fallback seguro)
    let passwordMatch = false;
    if (account.password_hash) {
      try {
        passwordMatch = await bcrypt.compare(cleanPassword, account.password_hash);
      } catch (_) {}
    }

    if (!passwordMatch && account.initial_password_plain) {
      passwordMatch = account.initial_password_plain.trim() === cleanPassword;
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Senha incorreta. Verifique os caracteres e tente novamente.' },
        { status: 401 }
      );
    }

    // Gera token JWT exclusivo do cliente (30 dias)
    const token = signClientToken({
      clientAccountId: account.id,
      domainLogin: account.domain_login,
      siteSlug: account.site_slug,
      role: 'CLIENT'
    });

    const res = NextResponse.json({
      success: true,
      account: {
        id: account.id,
        businessName: account.business_name,
        domainLogin: account.domain_login,
        siteSlug: account.site_slug,
        planType: account.plan_type,
        status: account.status,
        monthlyEditsLimit: account.monthly_edits_limit,
        monthlyEditsUsed: account.monthly_edits_used,
        extraEditCredits: account.extra_edit_credits,
        editsResetAt: account.edits_reset_at
      }
    });

    setClientTokenCookie(res, token);
    return res;
  } catch (err: any) {
    console.error('[Cliente Login API] Erro:', err);
    return NextResponse.json(
      { error: 'Erro interno ao realizar login. Tente novamente em instantes.' },
      { status: 500 }
    );
  }
}
