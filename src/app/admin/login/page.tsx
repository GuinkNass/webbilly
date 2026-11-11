'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
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
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-zinc-100 flex flex-col justify-center items-center px-4 relative select-none font-sans">
      {/* Background Glows Synadmin */}
      <div className="absolute w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -top-10 -left-10" />
      <div className="absolute w-[30rem] h-[30rem] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -bottom-10 -right-10" />

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Painel Master Billy Suite</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão de Assinaturas SaaS, Licenças, APIs e Repasses
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">E-mail Master</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="admin@billysuite.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Senha Master</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d0f14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-indigo-500 placeholder-zinc-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Acessar Painel Master</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
