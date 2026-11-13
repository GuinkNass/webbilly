'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle,
  XCircle,
  Check,
  AlertCircle,
  Users,
  Sparkles,
  Key,
  ShieldCheck,
  Layers
} from 'lucide-react';

export default function AdminFinancialPage() {
  const { data, loading, error, loadData, setActionSuccess } = useAdmin();

  const [activeTabSub, setActiveTabSub] = useState<'financial' | 'affiliates' | 'apis'>('financial');

  // Configurações de API
  const [apiSettings, setApiSettings] = useState<any>(data?.settings || {
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    cloudflareAccountId: '',
    cloudflareApiToken: '',
    vercelToken: '',
    mercadopagoAccessToken: '',
    monthlySubscriptionPrice: 29.90,
    operatorCommissionMonthly: 10.00,
    defaultDailyLimit: 50
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar parâmetros.');

      setSettingsSuccess('Parâmetros e chaves salvos com sucesso!');
      setActionSuccess('Configurações da plataforma atualizadas.');
      setTimeout(() => setSettingsSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      setSettingsError(err.message || 'Falha ao salvar configurações.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando controle financeiro e APIs...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados</h2>
        <p className="text-xs text-zinc-300">{error}</p>
      </div>
    );
  }

  const payoutRequests = data?.payoutRequests || [];
  const affiliateMetrics = data?.affiliatesAdmin || {};

  return (
    <div className="space-y-6">
      {/* Header com Navegação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2 font-mono">
            <DollarSign className="w-3.5 h-3.5" />
            Controle de Caixa
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Financeiro, Repasses & Parâmetros de API
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão da divisão 70/30, liquidação de solicitações Pix dos operadores, comissões de afiliados e chaves de integração.
          </p>
        </div>

        <div className="flex p-1 bg-[#0a0d14] rounded-xl border border-white/[0.06] text-xs">
          <button
            onClick={() => setActiveTabSub('financial')}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'financial'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Repasses Pix ({payoutRequests.length})
          </button>
          <button
            onClick={() => setActiveTabSub('affiliates')}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'affiliates'
                ? 'bg-[#84cc16] text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Billy Afiliados
          </button>
          <button
            onClick={() => setActiveTabSub('apis')}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTabSub === 'apis'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Configurações & APIs
          </button>
        </div>
      </div>

      {/* ABA 1: REPASSES PIX */}
      {activeTabSub === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total Solicitado no Mês</span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                R$ {(data?.stats?.totalRequestedPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Repasses dos operadores</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Total Já Liquidado</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                R$ {(data?.stats?.totalPaidPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Pix com comprovante</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f121a] border border-white/[0.06]">
              <span className="text-[10px] uppercase font-bold text-amber-400">Aguardando Pagamento</span>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                R$ {(data?.stats?.pendingPayouts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-zinc-500">Pendentes no caixa</span>
            </div>
          </div>

          <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-4">Operador</th>
                    <th className="py-3.5 px-4">Mês de Referência</th>
                    <th className="py-3.5 px-4">Chave Pix Cadastrada</th>
                    <th className="py-3.5 px-4">Valor do Repasse</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Data Solicitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {payoutRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                        Nenhuma solicitação de repasse registrada até o momento.
                      </td>
                    </tr>
                  ) : (
                    payoutRequests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">{req.operatorName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{req.operatorEmail}</span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">
                          {req.monthRef || 'Mês Ativo'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400">
                          {req.pixKey} ({req.pixType || 'CPF'})
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                          R$ {req.amount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                              req.status === 'PAGO'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                            }`}
                          >
                            {req.status === 'PAGO' ? '● Liquidado' : '● Aguardando Pix'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-400 text-[11px]">
                          {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('pt-BR') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: BILLY AFILIADOS */}
      {activeTabSub === 'affiliates' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121c10] to-[#0f141d] border border-[#84cc16]/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 text-[#a3e635] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Supervisão da Rede Billy Afiliados</h3>
                <p className="text-xs text-zinc-400">Regra oficial: 5% (R$ 24,50) para o padrinho em cada pacote de domínio vendido.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total de Padrinhos Ativos</span>
                <span className="text-2xl font-black text-white font-mono">{affiliateMetrics.totalAffiliatesCount || (data?.operators || []).filter((o: any) => o.affiliate_enabled).length || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Vendas de Domínio por Rede</span>
                <span className="text-2xl font-black text-[#a3e635] font-mono">{affiliateMetrics.totalNetworkSalesCount || 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Comissões Pagas à Rede</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">R$ {(affiliateMetrics.totalAffiliateCommissionsPaid || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CONFIGURAÇÕES & APIS */}
      {activeTabSub === 'apis' && (
        <div className="p-6 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Parâmetros Operacionais da Plataforma</h3>
            <p className="text-xs text-zinc-400">Ajuste os valores de assinatura, comissões e credenciais das APIs integradas.</p>
          </div>

          {settingsSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          {settingsError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Bloco de Preços e Comissões */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Mensalidade Base SaaS (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.monthlySubscriptionPrice}
                  onChange={(e) => setApiSettings({ ...apiSettings, monthlySubscriptionPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Repasse Recorrente Operador (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={apiSettings.operatorCommissionMonthly}
                  onChange={(e) => setApiSettings({ ...apiSettings, operatorCommissionMonthly: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Limite Diário Padrão de Sites
                </label>
                <input
                  type="number"
                  value={apiSettings.defaultDailyLimit}
                  onChange={(e) => setApiSettings({ ...apiSettings, defaultDailyLimit: parseInt(e.target.value, 10) || 50 })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Bloco de Chaves de API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiSettings.geminiApiKey || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Modelo Gemini Primário
                </label>
                <input
                  type="text"
                  value={apiSettings.geminiModel || 'gemini-3.8-flash'}
                  onChange={(e) => setApiSettings({ ...apiSettings, geminiModel: e.target.value })}
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Cloudflare API Token
                </label>
                <input
                  type="password"
                  value={apiSettings.cloudflareApiToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, cloudflareApiToken: e.target.value })}
                  placeholder="Token com permissões DNS / Zone"
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Vercel Token (Edge Config & Projects)
                </label>
                <input
                  type="password"
                  value={apiSettings.vercelToken || ''}
                  onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                  placeholder="vercel_..."
                  className="w-full bg-[#161a26] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? 'Salvando Parâmetros...' : 'Salvar Todas as Configurações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
