'use client';

import React, { useState } from 'react';
import {
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  CreditCard,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Edit3
} from 'lucide-react';

interface AdminCustomDomainsProps {
  subscriptions: any[];
  onRefresh: () => Promise<void> | void;
  selectedProjectId?: string;
}

export default function AdminCustomDomains({
  subscriptions,
  onRefresh,
  selectedProjectId: initialSelected
}: AdminCustomDomainsProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialSelected || '');
  const [domainInput, setDomainInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{
    available: boolean;
    domain: string;
    isBr: boolean;
    price?: number;
    currency?: string;
    message?: string;
  } | null>(null);

  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buyResult, setBuyResult] = useState<any | null>(null);

  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filtra assinaturas ativas para seleção
  const activeSubs = Array.isArray(subscriptions) ? subscriptions : [];

  // Assinaturas que já possuem domínio próprio mapeado
  const domainsList = activeSubs.filter(s => s.custom_domain || s.customDomain);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // 1. Checar disponibilidade de domínio
  const handleCheckDomain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCheckError(null);
    setCheckResult(null);
    setBuyResult(null);
    setBuyError(null);

    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    if (!clean || !clean.includes('.')) {
      setCheckError('Digite um domínio válido com extensão (ex: meudominio.com ou meudominio.com.br)');
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/admin/domains/check?domain=${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao verificar disponibilidade');
      setCheckResult(json);
    } catch (err: any) {
      setCheckError(err.message || 'Falha na checagem de disponibilidade.');
    } finally {
      setChecking(false);
    }
  };

  // 2. Comprar ou Vincular e Publicar na Vercel
  const handlePurchaseAndDeploy = async (paymentMethod: 'card_vercel' | 'pix_br') => {
    if (!selectedProjectId) {
      setBuyError('Selecione primeiro qual subdomínio/cliente receberá o domínio próprio.');
      return;
    }

    const targetDomain = checkResult?.domain || domainInput.trim().toLowerCase();
    if (!targetDomain) {
      setBuyError('Informe um domínio válido para vincular.');
      return;
    }

    setBuying(true);
    setBuyError(null);
    try {
      const res = await fetch('/api/admin/domains/purchase-and-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          domain: targetDomain,
          paymentMethod
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao processar compra/vinculação.');

      setBuyResult(json);
      setStatusMessage(json.message);
      await onRefresh();
    } catch (err: any) {
      setBuyError(err.message || 'Falha ao vincular domínio na Vercel.');
    } finally {
      setBuying(false);
    }
  };

  // 3. Verificar propagação DNS e certificado SSL
  const handleVerify = async (domainToVerify: string) => {
    setVerifyingDomain(domainToVerify);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/domains/verify?domain=${encodeURIComponent(domainToVerify)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao verificar domínio');

      if (json.verified) {
        setStatusMessage(`✅ Domínio ${domainToVerify} verificado com sucesso! SSL e DNS ativos.`);
      } else {
        setStatusMessage(`⏳ Domínio ${domainToVerify} ainda está em propagação de DNS. Aguarde alguns instantes.`);
      }
      await onRefresh();
    } catch (err: any) {
      setStatusMessage(`Erro ao verificar: ${err.message}`);
    } finally {
      setVerifyingDomain(null);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Banner Principal com Apresentação da Opção 2 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111625] via-[#0d121e] to-[#080b12] border border-white/[0.08] p-6 lg:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Opção 2 • Domínio Próprio Exclusivo (R$ 500,00)</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Migração e Vinculação Automática de Domínio Próprio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Mapeie instantaneamente qualquer subdomínio oficial (<code className="text-emerald-400 font-mono">*.webbilly.com.br</code>) para o domínio próprio da marca do cliente (ex: <code className="text-white font-bold">empresa.com.br</code> ou <code className="text-white font-bold">empresa.com</code>). O site continua editável a qualquer momento e com sincronização automática em tempo real.
            </p>
          </div>

          <div className="bg-[#171c2c]/80 border border-white/[0.08] p-4 rounded-2xl flex flex-col gap-1 text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold tracking-wider">Valor do Pacote</span>
            <span className="text-3xl font-black text-white font-mono">R$ 500,00</span>
            <span className="text-[10px] text-emerald-400 font-medium">Registro Anual + SSL Vercel Incluso</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid de Configuração: Seletor + Busca de Domínio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card Formulário de Registro / Migração (7 cols) */}
        <div className="lg:col-span-7 bg-[#11141c] border border-white/[0.06] rounded-3xl p-6 lg:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Nova Vinculação de Domínio</h3>
              <p className="text-xs text-zinc-400">Selecione o subdomínio e consulte a disponibilidade do domínio desejado.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Seletor de Subdomínio/Projeto */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>1. Escolha o Subdomínio / Projeto do Cliente</span>
                <span className="text-[11px] text-zinc-400">{activeSubs.length} projetos disponíveis</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-[#08090d] border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">-- Selecione o Subdomínio Atual --</option>
                {activeSubs.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.clientName} ({sub.siteSlug}.webbilly.com.br) {sub.custom_domain ? `[Já vinculado: ${sub.custom_domain}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Campo de Busca de Domínio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                2. Domínio Próprio Desejado
              </label>
              <form onSubmit={handleCheckDomain} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="exemplo: sushihiroshi.com.br ou clinicaexemplo.com"
                    value={domainInput}
                    onChange={(e) => {
                      setDomainInput(e.target.value);
                      setCheckResult(null);
                      setCheckError(null);
                    }}
                    className="w-full px-4 py-3 bg-[#08090d] border border-white/[0.08] rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-400 font-mono focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={checking || !domainInput.trim()}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/20"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verificar Disponibilidade</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {checkError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkError}</span>
              </div>
            )}

            {/* Resultado da Checagem de Disponibilidade */}
            {checkResult && (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  checkResult.available
                    ? 'bg-emerald-950/25 border-emerald-500/30'
                    : 'bg-rose-950/25 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {checkResult.available ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                        <span>{checkResult.domain}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            checkResult.available
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {checkResult.available ? 'Disponível para Registro!' : 'Indisponível / Ocupado'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {checkResult.isBr
                          ? 'Extensão Nacional (.br) via Registro.br • Pagamento via Pix'
                          : 'Extensão Internacional via Vercel Global Domains'}
                      </p>
                    </div>
                  </div>

                  {checkResult.available && (
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Preço do Mapeamento:</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        R$ 500,00
                      </span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação para Domínio Disponível */}
                {checkResult.available && (
                  <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center gap-3">
                    {checkResult.isBr ? (
                      <button
                        onClick={() => handlePurchaseAndDeploy('pix_br')}
                        disabled={buying || !selectedProjectId}
                        className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                      >
                        {buying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Configurando na Vercel...</span>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            <span>Vincular na Vercel & Gerar Instruções Pix Registro.br</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseAndDeploy('card_vercel')}
                        disabled={buying || !selectedProjectId}
                        className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                      >
                        {buying ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Registrando na Vercel...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>Comprar no Cartão (Vercel) & Publicar Agora</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {buyError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{buyError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Informativo e Instruções DNS / Registro.br (5 cols) */}
        <div className="lg:col-span-5 bg-[#11141c] border border-white/[0.06] rounded-3xl p-6 lg:p-7 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Instruções DNS Vercel Cloud</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Para domínios nacionais (<code className="text-emerald-400 font-mono">.com.br</code>), configure os seguintes apontamentos no painel do Registro.br ou provedor DNS do cliente:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Registro A */}
              <div className="p-3 rounded-xl bg-[#08090d] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">Tipo A (Apex / Raiz):</span>
                  <span className="text-zinc-300">@ ou vazio</span> &rarr;{' '}
                  <strong className="text-emerald-400 font-bold">76.76.21.21</strong>
                </div>
                <button
                  onClick={() => copyToClipboard('76.76.21.21', 'dnsA')}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition"
                  title="Copiar IP Vercel"
                >
                  {copiedKey === 'dnsA' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Registro CNAME */}
              <div className="p-3 rounded-xl bg-[#08090d] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-sans">Tipo CNAME (Subdomínio WWW):</span>
                  <span className="text-zinc-300">www</span> &rarr;{' '}
                  <strong className="text-emerald-400 font-bold">cname.vercel-dns.com</strong>
                </div>
                <button
                  onClick={() => copyToClipboard('cname.vercel-dns.com', 'dnsCname')}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 transition"
                  title="Copiar CNAME Vercel"
                >
                  {copiedKey === 'dnsCname' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {buyResult?.dnsInstructions?.registroBrUrl && (
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <a
                href={buyResult.dnsInstructions.registroBrUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600/80 hover:bg-indigo-600 transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>Concluir Registro no Registro.br</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-400 leading-normal">
            💡 <strong>Sincronização em Tempo Real:</strong> Uma vez configurado, qualquer modificação futura realizada na Billy Suite ou no Painel Admin é refletida instantaneamente no domínio próprio sem necessidade de novas configurações.
          </div>
        </div>
      </div>

      {/* Tabela de Domínios Próprios Conectados */}
      <div className="bg-[#11141c] border border-white/[0.06] rounded-3xl p-6 lg:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Domínios Próprios Ativos e Conectados</span>
            </h3>
            <p className="text-xs text-zinc-400">Lista de clientes que adquiriram a Opção 2 de Domínio Próprio.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#161a26] text-zinc-300 border border-white/[0.08] self-start sm:self-auto font-mono">
            {domainsList.length} domínios conectados
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#141824] text-zinc-400 uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <th className="py-3.5 px-5">Cliente / Comércio</th>
                <th className="py-3.5 px-4">Subdomínio Original</th>
                <th className="py-3.5 px-4">Domínio Próprio Conectado</th>
                <th className="py-3.5 px-4">Status SSL / DNS</th>
                <th className="py-3.5 px-4">Plano</th>
                <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {domainsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 text-xs">
                    Nenhum domínio próprio registrado ainda. Selecione um projeto acima para vincular o primeiro!
                  </td>
                </tr>
              ) : (
                domainsList.map((sub: any) => {
                  const domainName = sub.custom_domain || sub.customDomain;
                  const domStatus = sub.domain_status || sub.domainStatus || 'propagating';
                  const isVerified = domStatus === 'active';

                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-5">
                        <span className="font-bold text-white text-sm block">{sub.clientName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{sub.clientPhone || 'Sem telefone'}</span>
                      </td>

                      <td className="py-4 px-4 font-mono text-zinc-400">
                        <a
                          href={`https://${sub.siteSlug}.webbilly.com.br`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-400 transition inline-flex items-center gap-1"
                        >
                          <span>{sub.siteSlug}.webbilly.com.br</span>
                          <ExternalLink className="w-3 h-3 text-zinc-600" />
                        </a>
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <a
                          href={`https://${domainName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white hover:text-emerald-400 font-bold transition inline-flex items-center gap-1.5"
                        >
                          <span>{domainName}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        </a>
                      </td>

                      <td className="py-4 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            SSL & DNS Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-950/40 text-amber-400 border border-amber-800/40">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Propagando DNS
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-emerald-400 block">R$ 500,00</span>
                        <span className="text-[10px] text-zinc-400">Opção 2 (Anual)</span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleVerify(domainName)}
                            disabled={verifyingDomain === domainName}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#161a26] text-zinc-200 border border-white/[0.08] hover:bg-white/[0.06] transition flex items-center gap-1"
                            title="Verificar status DNS e Certificado SSL"
                          >
                            <RefreshCw className={`w-3 h-3 ${verifyingDomain === domainName ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
                            <span>Verificar DNS</span>
                          </button>

                          <a
                            href={`https://${domainName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1"
                            title="Abrir site no domínio próprio"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Abrir</span>
                          </a>

                          <a
                            href={`https://${sub.siteSlug}.webbilly.com.br`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition flex items-center gap-1"
                            title="Editar site mantendo acesso total"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Site</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
