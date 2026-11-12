'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Laptop, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OperatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-indigo-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <Laptop className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Área do Operador Billy</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Acompanhe seus Clientes, Subdomínios, Downloads e Repasses Pix
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">E-mail do Operador</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="operador@webbilly.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Senha de Acesso</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
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
                <span>Entrar no Painel do Operador</span>
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
            href="/#seja-operador"
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
