'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Laptop, Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errCode = searchParams.get('erro');
    if (errCode === 'operador_nao_autorizado') {
      setError('Este e-mail corporativo do Lark não possui cadastro de Operador Aprovado no Webbilly. Candidate-se abaixo para liberação.');
    } else if (errCode === 'operador_bloqueado') {
      setError('Sua conta de operador está suspensa pelo administrador. Entre em contato com o suporte.');
    } else if (errCode === 'lark_config_ausente') {
      setError('Chaves do Lark OAuth (LARK_APP_ID / LARK_APP_SECRET) não configuradas no servidor.');
    } else if (errCode === 'codigo_nao_fornecido' || errCode === 'lark_falha_token' || errCode === 'lark_erro_inesperado') {
      setError('Falha ao autenticar com o Lark Suite. Tente novamente ou use suas credenciais.');
    } else if (errCode) {
      setError(`Erro na autenticação: ${errCode}`);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      router.push(data.redirectUrl || '/operador');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-100 flex flex-col justify-center items-center px-4 relative select-none font-sans">
      {/* Background Glows Synadmin */}
      <div className="absolute w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -top-10 -left-10" />
      <div className="absolute w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -bottom-10 -right-10" />

      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Início
        </Link>
      </div>

      <div className="max-w-md w-full bg-[#151821] rounded-2xl p-8 border border-white/[0.08] shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-[#84cc16]/20 to-indigo-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <Laptop className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Área do Operador Billy</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Acompanhe seus Clientes, Subdomínios, Downloads e Repasses Pix
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed animate-fade-in">
            <span className="text-rose-400 font-bold shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 1. BOTÃO EM DESTAQUE: ENTRAR COM LARK OAUTH (@webbilly.com.br) */}
        <div className="mb-5">
          <a
            href="/api/auth/lark/login"
            className="w-full group relative overflow-hidden flex items-center justify-between gap-3 py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#205bf0] via-[#1a85ff] to-[#00bda6] hover:brightness-110 shadow-lg shadow-[#1a85ff]/25 transition-all duration-200 border border-white/20 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/25 shadow-inner">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5L12 2L20 6.5L12 11L4 6.5Z" fill="#FFFFFF" />
                <path d="M4 12.5L12 17L20 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17.5L12 22L20 17.5" stroke="#A5F3FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                <span>Entrar com Lark</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/30 border border-white/20 text-[#A5F3FC]">
                  @webbilly.com.br
                </span>
              </div>
              <p className="text-[10px] text-white/90 truncate font-medium">
                Autenticação Oficial do Operador
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </a>
          <p className="text-[11px] text-zinc-400 text-center mt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>Use seu e-mail corporativo e senha do Lark para acessar o Painel Operador</span>
          </p>
        </div>

        {/* 2. DIVISOR ELEGANTE */}
        <div className="relative flex items-center justify-center my-5">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#151821] px-3 text-[10px] uppercase font-bold tracking-wider text-zinc-500 absolute">
            ou acesse com e-mail e senha
          </span>
        </div>

        {/* 3. FORMULÁRIO DE LOGIN SECUNDÁRIO (ADMIN MASTER / ACESSO DIRETO) */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">E-mail Corporativo ou Pessoal</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="nome.sobrenome@webbilly.com.br ou e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Senha de Acesso</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-1 rounded-lg cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <span>Entrar com Senha</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
          <p className="text-xs text-zinc-400">
            Ainda não é um Operador Credenciado?
          </p>
          <Link
            href="/#trabalhe-aqui"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition mt-2"
          >
            <span>Candidate-se para faturar comissões Pix recorrentes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <LoginContent />
    </Suspense>
  );
}
