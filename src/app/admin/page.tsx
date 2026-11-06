'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Key,
  Sliders,
  DollarSign,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  RefreshCw,
  LogOut,
  ExternalLink,
  Shield,
  Laptop,
  Check,
  AlertTriangle,
  Mail,
  Copy,
  Search,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'candidates' | 'licenses' | 'apis' | 'financial'>('candidates');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Estados de formulário e modal
  const [approvalModalData, setApprovalModalData] = useState<any>(null);
  const [apiSettings, setApiSettings] = useState<any>({
    geminiApiKey: '',
    geminiModel: 'gemini-3.8-flash',
    cloudflareAccountId: '',
    cloudflareApiToken: '',
    vercelToken: '',
    pixGateway: 'mercadopago',
    pixGatewayKey: '',
    defaultDailyLimit: 50,
    commissionPerSale: 200
  });

  const [filterCandidate, setFilterCandidate] = useState<'TODOS' | 'PENDENTE' | 'APROVADO' | 'RECUSADO'>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setData(json);
      setApiSettings(json.settings);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // Aprovar ou Recusar Candidato
  const handleReviewCandidate = async (candidateId: string, action: 'APROVAR' | 'RECUSAR') => {
    try {
      const res = await fetch('/api/candidates/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (action === 'APROVAR') {
        setApprovalModalData(json);
      } else {
        setActionSuccess(`Candidatura recusada com sucesso.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao processar ação no candidato.');
    }
  };

  // Bloquear / Desbloquear Licença
  const handleToggleLicense = async (serialToken: string, currentStatus: string) => {
    try {
      const action = currentStatus === 'BLOQUEADO' ? 'UNBLOCK' : 'BLOCK';
      const res = await fetch('/api/admin/license/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, action })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Licença ${serialToken} atualizada: ${action === 'BLOCK' ? 'Bloqueada em tempo real' : 'Ativada'}`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar licença.');
    }
  };

  // Resetar Machine ID
  const handleResetMachine = async (serialToken: string) => {
    if (!confirm('Deseja realmente desvincular o computador atual desta licença? O operador poderá ativar em uma nova máquina.')) return;
    try {
      const res = await fetch('/api/admin/license/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, action: 'RESET_MACHINE' })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Machine ID liberado com sucesso para a licença ${serialToken}`);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao liberar máquina.');
    }
  };

  // Salvar Configurações Centrais de APIs
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiSettings)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess('Configurações de APIs salvas com sucesso! O app desktop sincronizará no próximo heartbeat.');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    }
  };

  // Pagar Comissão Pix
  const handlePayPixCommission = async (saleId: string) => {
    const proof = prompt('Informe o código de identificação do comprovante Pix (ou deixe em branco para confirmação automática):');
    try {
      const res = await fetch('/api/admin/sales/pay-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, pixProof: proof })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess('Comissão marcada como paga com sucesso via Pix!');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar pagamento Pix.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência: ' + text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Carregando Painel Administrativo Master...</span>
        </div>
      </div>
    );
  }

  const filteredCandidates = (data?.candidates || []).filter((c: any) => {
    if (filterCandidate !== 'TODOS' && c.status !== filterCandidate) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.whatsapp.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-16">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Billy Master Admin</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  CENTRAL CONTROL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">WebBilly - Gestão Centralizada da Operação</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Recarregar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-zinc-800"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner de Feedback */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Resumo Financeiro e Operacional */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Total Faturado</span>
            <div className="text-2xl font-black text-white mt-1">
              R$ {data?.metrics?.totalSold?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">{data?.metrics?.totalSalesCount || 0} sites ativados</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Comissões a Pagar</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              R$ {data?.metrics?.pendingCommissions?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[10px] text-zinc-500">Pendentes de Pix</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Comissões Pagas</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              R$ {data?.metrics?.paidCommissions?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[10px] text-zinc-500">Já repassadas via Pix</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold">Lucro Líquido Central</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              R$ {data?.metrics?.netProfit?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[10px] text-zinc-500">Após dedução das comissões</span>
          </div>
        </div>

        {/* ALERTA DE WHITELIST RESELLERCLUB */}
        {data?.operators?.some((o: any) => o.operatorIp) && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-zinc-900 border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  Atenção: Whitelist de IPs na ResellerClub Requerida
                </h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Operadores ativos informaram seus IPs de máquina. Certifique-se de adicioná-los no painel de segurança da ResellerClub para que o registro autônomo de domínios .com.br não seja bloqueado.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.operators
                    .filter((o: any) => o.operatorIp)
                    .map((o: any) => (
                      <span key={o.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 border border-amber-500/30 text-[11px] font-mono text-amber-200">
                        <strong>{o.name}:</strong> {o.operatorIp}
                        <button
                          onClick={() => copyToClipboard(o.operatorIp)}
                          className="text-zinc-400 hover:text-white"
                          title="Copiar IP"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <a
              href="https://rclubbr.webpropanel.com/settings/pro-suite/api-settings"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-lg shadow-amber-600/20"
            >
              <span>Configurar IPs na ResellerClub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Abas de Navegação */}
        <div className="flex border-b border-zinc-800 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'candidates'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Candidatos a Operadores
            {data?.metrics?.pendingCandidatesCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {data.metrics.pendingCandidatesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'licenses'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Gestor de Licenças & Seriais
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
              {data?.licenses?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'financial'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Extrato Financeiro Global
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'apis'
                ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Controle Central de APIs
          </button>
        </div>

        {/* CONTEÚDO DA ABA 1: CANDIDATOS */}
        {activeTab === 'candidates' && (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                {(['TODOS', 'PENDENTE', 'APROVADO', 'RECUSADO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterCandidate(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filterCandidate === st
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st === 'PENDENTE' ? 'Pendentes' : st === 'APROVADO' ? 'Aprovados' : 'Recusados'}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar candidato..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Tabela de Candidatos */}
            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Candidato</th>
                      <th className="py-3 px-4">Contato / Localidade</th>
                      <th className="py-3 px-4">Chave Pix</th>
                      <th className="py-3 px-4">Currículo / LinkedIn</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum candidato encontrado neste filtro.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((c: any) => (
                        <tr key={c.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{c.name}</div>
                            <div className="text-[11px] text-zinc-400 font-normal">{c.email}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <a
                              href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                            >
                              {c.whatsapp}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="text-[11px] text-zinc-500">{c.city}/{c.state}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-[10px] text-zinc-500 uppercase block">{c.pixType}</span>
                            <span className="text-zinc-300">{c.pixKey}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            {c.resumeUrl ? (
                              <a
                                href={c.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                Ver Perfil
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-zinc-600">Não informado</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.status === 'APROVADO'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : c.status === 'RECUSADO'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {c.status === 'PENDENTE' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleReviewCandidate(c.id, 'APROVAR')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-md shadow-emerald-600/20"
                                  title="Aprova e gera o Token Serial com 1 clique"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => handleReviewCandidate(c.id, 'RECUSAR')}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 border border-zinc-700 hover:border-rose-500/40 text-xs transition flex items-center gap-1"
                                  title="Recusar candidatura"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Recusar
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Processado</span>
                            )}
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

        {/* CONTEÚDO DA ABA 2: GESTOR DE LICENÇAS E SERIAIS */}
        {activeTab === 'licenses' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Licenças & Seriais Emitidos</h3>
                <p className="text-xs text-zinc-400">
                  Formato padrão: <code className="text-indigo-400 font-bold font-mono">BILLY-OP-XXXX-XXXX-2026</code>. O bloqueio tem efeito instantâneo no desktop.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Em Uso / Ativos: {data?.licenses?.filter((l: any) => l.status !== 'BLOQUEADO').length}
                </span>
                <span className="flex items-center gap-1 text-rose-400 font-semibold ml-3">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Bloqueados: {data?.licenses?.filter((l: any) => l.status === 'BLOQUEADO').length}
                </span>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Token Serial</th>
                      <th className="py-3 px-4">Operador Vinculado</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Machine ID Registrado</th>
                      <th className="py-3 px-4">IP Máquina (Reseller)</th>
                      <th className="py-3 px-4">Último Heartbeat</th>
                      <th className="py-3 px-4 text-right">Ações de Segurança</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.licenses || []).map((l: any) => (
                      <tr key={l.serialToken} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                          <div className="flex items-center gap-2">
                            <span>{l.serialToken}</span>
                            <button
                              onClick={() => copyToClipboard(l.serialToken)}
                              className="text-zinc-500 hover:text-white"
                              title="Copiar serial"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">{l.operatorName}</span>
                          <span className="text-[11px] text-zinc-500 font-mono">{l.operatorId}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              l.status === 'EM_USO'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : l.status === 'ATIVO'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {l.machineId ? (
                            <div className="flex items-center gap-1.5 text-zinc-300">
                              <Laptop className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{l.machineId}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-500 italic">Aguardando 1ª ativação</span>
                          )}
                          {l.osInfo && <div className="text-[10px] text-zinc-500">{l.osInfo}</div>}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {l.operatorIp ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                {l.operatorIp}
                              </span>
                              <button
                                onClick={() => copyToClipboard(l.operatorIp)}
                                className="text-zinc-500 hover:text-white"
                                title="Copiar IP"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-zinc-600 italic">Pendente</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                          {l.lastSync ? new Date(l.lastSync).toLocaleString('pt-BR') : 'Nunca sincronizou'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {l.machineId && (
                              <button
                                onClick={() => handleResetMachine(l.serialToken)}
                                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] border border-zinc-700 transition"
                                title="Desvincula a máquina para permitir novo PC"
                              >
                                Liberar PC
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleLicense(l.serialToken, l.status)}
                              className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                                l.status === 'BLOQUEADO'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white'
                              }`}
                            >
                              {l.status === 'BLOQUEADO' ? (
                                <>
                                  <Unlock className="w-3 h-3" /> Desbloquear
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" /> Bloquear
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO DA ABA 3: EXTRATO FINANCEIRO GLOBAL */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-xl border border-zinc-800">
              <h3 className="text-base font-bold text-white mb-2">Relatório de Vendas Fechadas e Repasse Pix</h3>
              <p className="text-xs text-zinc-400">
                Cada site ativado gera uma receita de R$ 600,00, da qual <strong>R$ 200,00</strong> é creditada diretamente ao Operador comercial.
              </p>
            </div>

            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Data / ID</th>
                      <th className="py-3 px-4">Operador</th>
                      <th className="py-3 px-4">Cliente / Nicho</th>
                      <th className="py-3 px-4">Valor Total</th>
                      <th className="py-3 px-4">Comissão Operador</th>
                      <th className="py-3 px-4">Status do Pix</th>
                      <th className="py-3 px-4 text-right">Ação Financeira</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.sales || []).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhuma venda registrada até o momento.
                        </td>
                      </tr>
                    ) : (
                      (data?.sales || []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-white">{s.id}</span>
                            <div className="text-[11px] text-zinc-500">
                              {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{s.operatorName}</span>
                            <span className="text-[11px] text-zinc-500 font-mono">{s.operatorId}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-zinc-200">{s.clientName}</div>
                            <div className="text-[11px] text-zinc-400">{s.niche || 'Nicho Comercial'}</div>
                            {s.siteUrl && (
                              <a
                                href={s.siteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-400 hover:underline inline-flex items-center gap-1"
                              >
                                Ver Site Gerado <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">
                            R$ {s.saleValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                            R$ {s.commissionValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.pixStatus === 'PAGO'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {s.pixStatus === 'PAGO' ? 'Pix Efetuado' : 'Pix Pendente'}
                            </span>
                            {s.pixPaidAt && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Pago em {new Date(s.pixPaidAt).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {s.pixStatus === 'PENDENTE' ? (
                              <button
                                onClick={() => handlePayPixCommission(s.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                              >
                                Pagar Pix
                              </button>
                            ) : (
                              <span className="text-[11px] text-zinc-500 font-mono">Liquidado</span>
                            )}
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

        {/* CONTEÚDO DA ABA 4: CONTROLE CENTRAL DE APIS */}
        {activeTab === 'apis' && (
          <div className="max-w-3xl">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-base font-bold text-white">Gerenciador Central de Chaves e Limites</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Estas credenciais são injetadas em tempo de execução no app Billy Suite Desktop do operador através da validação da licença. Os operadores não têm acesso direto às chaves raw.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={apiSettings.geminiApiKey || ''}
                    onChange={(e) => setApiSettings({ ...apiSettings, geminiApiKey: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="AQ.Ab8RN6LImQKyoWgqw..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      Modelo Gemini Ativo
                    </label>
                    <select
                      value={apiSettings.geminiModel || 'gemini-3.8-flash'}
                      onChange={(e) => setApiSettings({ ...apiSettings, geminiModel: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="gemini-3.8-flash">gemini-3.8-flash (Recomendado)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      Limite Diário por Operador (Gerações/dia)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={apiSettings.defaultDailyLimit || 50}
                      onChange={(e) => setApiSettings({ ...apiSettings, defaultDailyLimit: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">
                    Deploy Automático (Cloudflare & Vercel)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cloudflare Account ID</label>
                      <input
                        type="text"
                        value={apiSettings.cloudflareAccountId || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, cloudflareAccountId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Cloudflare API Token</label>
                      <input
                        type="password"
                        value={apiSettings.cloudflareApiToken || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, cloudflareApiToken: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] text-zinc-400 mb-1">Vercel Token (Deploy alternativo)</label>
                    <input
                      type="password"
                      value={apiSettings.vercelToken || ''}
                      onChange={(e) => setApiSettings({ ...apiSettings, vercelToken: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      API ResellerClub (Registro Automático de Domínios .com.br)
                    </h4>
                    <a
                      href="https://rclubbr.webpropanel.com/settings/pro-suite/api-settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Painel ResellerClub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Reseller User ID</label>
                      <input
                        type="text"
                        value={apiSettings.resellerClubUserId || '1354859'}
                        onChange={(e) => setApiSettings({ ...apiSettings, resellerClubUserId: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        placeholder="1354859"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">API Key</label>
                      <input
                        type="password"
                        value={apiSettings.resellerClubApiKey || ''}
                        onChange={(e) => setApiSettings({ ...apiSettings, resellerClubApiKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                        placeholder="2IQ6a2S6wRyMqdUbFF9344vPxqprjCae"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-[11px] text-zinc-400 mb-1">HTTP API URL</label>
                    <input
                      type="text"
                      value={apiSettings.resellerClubApiUrl || 'https://httpapi.com/api'}
                      onChange={(e) => setApiSettings({ ...apiSettings, resellerClubApiUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      placeholder="https://httpapi.com/api"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    Gateway Pix & Repasse
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Gateway Provedor</label>
                      <select
                        value={apiSettings.pixGateway || 'mercadopago'}
                        onChange={(e) => setApiSettings({ ...apiSettings, pixGateway: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="mercadopago">Mercado Pago API Pix</option>
                        <option value="asaas">Asaas Pix Gateway</option>
                        <option value="manual">Manual com comprovante</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Comissão por Venda (R$)</label>
                      <input
                        type="number"
                        value={apiSettings.commissionPerSale || 200}
                        onChange={(e) => setApiSettings({ ...apiSettings, commissionPerSale: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Sliders className="w-4 h-4" />
                  Salvar e Sincronizar Configurações Centrais
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE CANDIDATO APROVADO COM SERIAL GERADO */}
      {approvalModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Operador Aprovado com Sucesso!</h3>
                <p className="text-xs text-zinc-400">Token Serial único gerado e conta de operador criada.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs mb-4">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Operador:</span>
                <span className="text-white font-bold">{approvalModalData.operator?.name}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Token Serial Oficial:</span>
                <div className="flex items-center justify-between bg-zinc-900 p-2 rounded border border-indigo-500/30 text-indigo-300 font-bold text-sm">
                  <span>{approvalModalData.operator?.serialToken}</span>
                  <button
                    onClick={() => copyToClipboard(approvalModalData.operator?.serialToken)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">E-mail de Login:</span>
                  <span className="text-zinc-300">{approvalModalData.operator?.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Senha Inicial:</span>
                  <span className="text-emerald-400 font-bold">{approvalModalData.operator?.initialPassword}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1 mb-4">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> E-mail enviado automaticamente ao operador
              </div>
              <p className="text-zinc-500">
                O operador já pode acessar a Área do Operador e ativar o aplicativo Billy Suite Desktop com este serial.
              </p>
            </div>

            <button
              onClick={() => setApprovalModalData(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Concluir e Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
