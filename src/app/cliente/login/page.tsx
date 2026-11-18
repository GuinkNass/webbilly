'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle, Sun, Moon, ExternalLink } from 'lucide-react';

export default function ClienteLoginPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Alternador de tema simples
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !password.trim()) {
      setError('Por favor, informe o domínio/endereço do seu site e a senha.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/cliente/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao autenticar.');
      }

      router.push('/cliente');
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {/* Top Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
            B
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>Billy Suite</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Portal Exclusivo do Cliente</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border transition-colors hover:opacity-80"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-app)' }}
            title="Alternar Tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-sm transition-all"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl mb-3 shadow-inner" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Acessar Painel do Meu Site
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Acompanhe seu site oficial, solicite alterações e consulte suas faturas com transparência total.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl border flex items-start gap-3 text-xs sm:text-sm" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Domínio ou Endereço do Site
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="ex: seunegocio.webbilly.com.br ou seunegocio"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Dica: você pode digitar o endereço completo ou apenas o nome do seu comércio.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Sua Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Sua senha inicial foi fornecida na confirmação da sua assinatura (ex: Billy4829).
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Meu Painel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t text-center space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Precisa de ajuda com seu acesso?
            </p>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20acessar%20meu%20painel%20do%20cliente%20no%20Billy."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              <span>Falar com o Suporte Billy no WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)' }}>
        © {new Date().getFullYear()} Billy Suite — Tecnologia & Presença Digital Oficial
      </footer>
    </div>
  );
}
