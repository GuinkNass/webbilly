'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import {
  Users,
  Key,
  Lock,
  Unlock,
  RotateCcw,
  KeyRound,
  Mail,
  Copy,
  Check,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ExternalLink,
  Laptop
} from 'lucide-react';

export default function AdminOperatorsPage() {
  const { data, loading, error, searchQuery, loadData, setActionSuccess, copyToClipboard } = useAdmin();

  const [activeTabSub, setActiveTabSub] = useState<'licenses' | 'candidates'>('licenses');
  const [candidateSearch, setCandidateSearch] = useState('');

  // Modal de Provisionamento de E-mail Corporativo
  const [provisionModal, setProvisionModal] = useState<{
    isOpen: boolean;
    operatorId: string;
    operatorName: string;
    suggestedPrefix: string;
    customPrefix: string;
    loading: boolean;
    result?: {
      corporateEmail: string;
      tempPassword?: string;
      larkProvisioned: boolean;
      message: string;
    };
    error?: string;
  } | null>(null);

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

  // Gerar Nova Chave Serial Virgem
  const handleGenerateSerial = async () => {
    try {
      const res = await fetch('/api/admin/license/generate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Chave serial virgem gerada: ${json.serialToken} (Copiada para a área de transferência!)`);
      copyToClipboard(json.serialToken);
      setTimeout(() => setActionSuccess(null), 6000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar chave serial.');
    }
  };

  // Resetar Senha Web do Operador
  const handleResetOperatorPassword = async (serialToken: string, operatorId?: string) => {
    if (!confirm('Deseja gerar uma nova senha provisória para este operador? Ele terá que trocá-la no próximo acesso.')) return;
    try {
      const res = await fetch('/api/admin/operator/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(`Nova senha provisória de ${json.operatorName}: ${json.tempPassword} (Copiada!)`);
      copyToClipboard(json.tempPassword);
      setTimeout(() => setActionSuccess(null), 6000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao resetar senha provisória.');
    }
  };

  // Aprovar Operador e Liberar Licença Desktop
  const handleApproveOperator = async (serialToken: string, operatorId?: string) => {
    if (!confirm(`Deseja aprovar o cadastro do operador e liberar imediatamente o acesso desta licença (${serialToken})?`)) return;
    try {
      const res = await fetch('/api/admin/operators/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, operatorId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(json.message || `Operador aprovado com sucesso! Acesso liberado no app desktop.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar operador.');
    }
  };

  // Abrir Modal de Provisionamento
  const handleOpenProvisionModal = (lic: any) => {
    const op = (data?.operators || []).find((o: any) =>
      (lic.operatorId && o.id === lic.operatorId) ||
      (lic.serialToken && (o.serialToken || '').trim().toUpperCase() === lic.serialToken.trim().toUpperCase())
    );
    const targetId = op?.id || lic.operatorId || lic.id;
    const targetName = op?.name || lic.operatorName || 'Operador';

    const cleanPrefix = targetName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');

    setProvisionModal({
      isOpen: true,
      operatorId: targetId,
      operatorName: targetName,
      suggestedPrefix: cleanPrefix,
      customPrefix: cleanPrefix,
      loading: false
    });
  };

  // Confirmar Provisionamento
  const handleConfirmProvisionEmail = async () => {
    if (!provisionModal) return;
    setProvisionModal(prev => prev ? { ...prev, loading: true, error: undefined } : null);

    try {
      const res = await fetch('/api/admin/operators/provision-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: provisionModal.operatorId,
          customPrefix: provisionModal.customPrefix
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao provisionar e-mail corporativo.');

      setProvisionModal(prev => prev ? {
        ...prev,
        loading: false,
        result: {
          corporateEmail: json.corporateEmail,
          tempPassword: json.tempPassword,
          larkProvisioned: json.larkProvisioned,
          message: json.message
        }
      } : null);

      await loadData();
    } catch (err: any) {
      setProvisionModal(prev => prev ? { ...prev, loading: false, error: err.message || 'Erro ao provisionar e-mail.' } : null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando operadores e licenças...</span>
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

  const licenses = (data?.licenses || []).filter((l: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.serialToken && l.serialToken.toLowerCase().includes(q)) ||
      (l.operatorName && l.operatorName.toLowerCase().includes(q)) ||
      (l.machineId && l.machineId.toLowerCase().includes(q))
    );
  });

  const candidates = (data?.candidates || []).filter((c: any) => {
    if (!candidateSearch) return true;
    const q = candidateSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header com Navegação Interna */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2 font-mono">
            <Users className="w-3.5 h-3.5" />
            Equipe Operacional
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão de Licenças & Candidaturas
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Controle de ativação no Windows Desktop, triagem de candidatos e provisionamento de e-mails corporativos Lark.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-[#0a0d14] rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTabSub('licenses')}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTabSub === 'licenses'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Licenças Desktop ({licenses.length})
            </button>
            <button
              onClick={() => setActiveTabSub('candidates')}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTabSub === 'candidates'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Candidaturas ({candidates.length})
            </button>
          </div>

          {activeTabSub === 'licenses' && (
            <button
              onClick={handleGenerateSerial}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black transition flex items-center gap-1.5 shadow-md shadow-lime-950/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Nova Licença</span>
            </button>
          )}
        </div>
      </div>

      {/* ABA 1: LICENÇAS DESKTOP */}
      {activeTabSub === 'licenses' && (
        <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4">Serial Token</th>
                  <th className="py-3.5 px-4">Operador Vinculado</th>
                  <th className="py-3.5 px-4">Machine ID (PC)</th>
                  <th className="py-3.5 px-4">Status Licença</th>
                  <th className="py-3.5 px-4">E-mail Corporativo</th>
                  <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {licenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                      Nenhuma licença encontrada.
                    </td>
                  </tr>
                ) : (
                  licenses.map((lic: any) => (
                    <tr key={lic.id || lic.serialToken} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#84cc16]">{lic.serialToken}</span>
                          <button
                            onClick={() => {
                              copyToClipboard(lic.serialToken);
                              alert('Serial copiado!');
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                            title="Copiar Serial"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">Tipo: {lic.licenseType || 'PRO'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white block">{lic.operatorName || 'Não vinculado (Chave Virgem)'}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{lic.operatorEmail || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {lic.machineId ? (
                          <span className="truncate max-w-[140px] block" title={lic.machineId}>
                            {lic.machineId}
                          </span>
                        ) : (
                          <span className="text-zinc-500 italic">Livre para ativação</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            lic.status === 'ATIVO'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : lic.status === 'BLOQUEADO'
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                              : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                          }`}
                        >
                          {lic.status || 'PENDENTE'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {lic.corporateEmail || lic.corporate_email ? (
                          <span className="text-cyan-300 text-xs font-semibold block">
                            {lic.corporateEmail || lic.corporate_email}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenProvisionModal(lic)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Provisionar @webbilly</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Bloquear / Desbloquear */}
                          <button
                            onClick={() => handleToggleLicense(lic.serialToken, lic.status)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              lic.status === 'BLOQUEADO'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                            title={lic.status === 'BLOQUEADO' ? 'Desbloquear Licença' : 'Bloquear Licença'}
                          >
                            {lic.status === 'BLOQUEADO' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reset Machine ID */}
                          {lic.machineId && (
                            <button
                              onClick={() => handleResetMachine(lic.serialToken)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
                              title="Resetar Machine ID (Liberar computador)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reset Senha Web */}
                          <button
                            onClick={() => handleResetOperatorPassword(lic.serialToken, lic.operatorId)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
                            title="Gerar nova senha provisória de acesso web"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CANDIDATURAS */}
      {activeTabSub === 'candidates' && (
        <div className="bg-[#0f121a] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden space-y-4 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Candidatos Registrados na Landing Page
            </span>
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Filtrar candidatos por nome ou email..."
                className="w-full bg-[#141824] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141824] text-zinc-400 uppercase font-mono text-[11px] border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4">Nome do Candidato</th>
                  <th className="py-3.5 px-4">E-mail Pessoal</th>
                  <th className="py-3.5 px-4">WhatsApp</th>
                  <th className="py-3.5 px-4">Chave Pix Informada</th>
                  <th className="py-3.5 px-4">Data Registro</th>
                  <th className="py-3.5 px-4 text-right">Ação de Aprovação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                      Nenhum candidato encontrado.
                    </td>
                  </tr>
                ) : (
                  candidates.map((cand: any) => (
                    <tr key={cand.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {cand.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {cand.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {cand.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400">
                        {cand.pixKey || cand.pix_key || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        {cand.createdAt ? new Date(cand.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {cand.status === 'APROVADO' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Aprovado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveOperator(cand.serialToken || 'NOVO', cand.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950/40 cursor-pointer"
                          >
                            Aprovar & Emitir Serial
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE PROVISIONAMENTO DE E-MAIL CORPORATIVO */}
      {provisionModal && provisionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#11141c] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setProvisionModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Provisionar E-mail Corporativo Lark</h3>
                <span className="text-xs text-zinc-400">Domínio oficial @webbilly.com.br</span>
              </div>
            </div>

            {provisionModal.result ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 space-y-2">
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>E-mail Corporativo Criado com Sucesso!</span>
                </div>
                <p>
                  Endereço: <strong className="font-mono text-cyan-300">{provisionModal.result.corporateEmail}</strong>
                </p>
                {provisionModal.result.tempPassword && (
                  <p>
                    Senha Provisória: <strong className="font-mono text-amber-300">{provisionModal.result.tempPassword}</strong>
                  </p>
                )}
                <p className="text-[11px] text-zinc-400 pt-1">
                  O operador já pode acessar via <code>mail.larksuite.com</code> com estas credenciais.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#141824] border border-white/[0.06] text-xs text-zinc-300">
                  Operador: <strong className="text-white">{provisionModal.operatorName}</strong>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Prefixo do E-mail (@webbilly.com.br) *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={provisionModal.customPrefix}
                      onChange={(e) => setProvisionModal({ ...provisionModal, customPrefix: e.target.value })}
                      className="flex-1 bg-[#161a26] border border-white/[0.08] rounded-l-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <span className="px-3 py-2 bg-zinc-800 border border-l-0 border-white/[0.08] rounded-r-xl text-xs font-mono text-zinc-400">
                      @webbilly.com.br
                    </span>
                  </div>
                </div>

                {provisionModal.error && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                    {provisionModal.error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={provisionModal.loading}
                    onClick={() => setProvisionModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={provisionModal.loading || !provisionModal.customPrefix.trim()}
                    onClick={handleConfirmProvisionEmail}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 disabled:opacity-50 cursor-pointer"
                  >
                    {provisionModal.loading ? 'Criando no Lark...' : 'Confirmar Provisionamento'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
