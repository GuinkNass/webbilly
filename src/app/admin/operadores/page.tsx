'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
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
  Laptop,
  Eye,
  FileText
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

  // Estados para Ficha do Candidato e Triagem de Recusa (60 dias)
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null);
  const [rejectResultModal, setRejectResultModal] = useState<{
    candidateName: string;
    candidateEmail: string;
    candidateWhatsapp: string;
    whatsappLink: string | null;
    messageText: string;
    reapplyDateBr: string;
    emailSent: boolean;
  } | null>(null);

  // Sincronização direta em tempo real de candidaturas do Supabase (sem cache)
  const [directCandidates, setDirectCandidates] = useState<any[] | null>(null);

  const refreshCandidatesFromSupabase = async () => {
    try {
      const res = await fetch('/api/admin/operadores', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.candidates)) {
          setDirectCandidates(json.candidates);
        }
      }
    } catch (e) {
      console.warn('Erro ao atualizar candidaturas do Supabase:', e);
    }
  };

  useEffect(() => {
    refreshCandidatesFromSupabase();
  }, [activeTabSub]);

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

  // Aprovar Operador / Candidato e Liberar Licença Desktop
  const handleApproveOperator = async (serialToken: string, operatorId?: string, email?: string) => {
    if (!confirm(`Deseja aprovar o cadastro e emitir a chave serial para este operador/candidato?`)) return;
    try {
      const res = await fetch('/api/admin/operators/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialToken, operatorId, candidateId: operatorId, email })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setActionSuccess(json.message || `Operador aprovado com sucesso! Acesso liberado no app desktop.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
      await refreshCandidatesFromSupabase();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar operador.');
    }
  };

  // Recusar Candidatura com Mensagem Educada e Prazo de 60 Dias
  const handleRejectCandidate = async (cand: any) => {
    if (!cand) return;
    const confirmMsg = `Deseja negar a candidatura de ${cand.name}?\n\nO candidato será informado que poderá tentar novamente após 60 dias.`;
    if (!confirm(confirmMsg)) return;

    setRejectLoadingId(cand.id);
    try {
      const res = await fetch('/api/admin/candidatos/negar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: cand.id,
          operatorId: cand.id,
          email: cand.email,
          reason: 'Candidatura negada pela triagem administrativa (nova tentativa após 60 dias).'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao recusar candidatura.');

      // Fecha modal de ficha se estiver aberta
      setSelectedCandidate(null);

      // Abre modal com resultado e opções de WhatsApp e Copiar
      setRejectResultModal({
        candidateName: json.candidateName || cand.name,
        candidateEmail: json.candidateEmail || cand.email,
        candidateWhatsapp: json.candidateWhatsapp || cand.whatsapp || cand.phone || '',
        whatsappLink: json.whatsappLink,
        messageText: json.messageText,
        reapplyDateBr: json.reapplyDateBr || '60 dias',
        emailSent: Boolean(json.emailSent)
      });

      setActionSuccess(`Candidatura de ${cand.name} recusada. Registro atualizado.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
      await refreshCandidatesFromSupabase();
    } catch (err: any) {
      alert(err.message || 'Falha ao processar recusa da candidatura.');
    } finally {
      setRejectLoadingId(null);
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

  const candidates = (directCandidates ?? data?.candidates ?? []).filter((c: any) => {
    const st = (c.status || '').toLowerCase();
    if (st === 'aprovado' || st === 'approved' || st === 'recusado' || st === 'rejected') return false;
    // Elimina qualquer resquício de mock
    if (c.email?.includes('exemplo.com.br') || c.name === 'Lucas Ferreira Mendes' || c.name === 'Beatriz Vasconcelos') return false;
    if (!candidateSearch) return true;
    const q = candidateSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.whatsapp && c.whatsapp.toLowerCase().includes(q))
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
            <ActionTooltip
              title="Gerar Nova Licença"
              description="Cria uma nova chave serial virgem pronta para ser repassada a um operador."
              side="bottom"
            >
              <button
                onClick={handleGenerateSerial}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black transition flex items-center gap-1.5 shadow-md shadow-lime-950/40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar Nova Licença</span>
              </button>
            </ActionTooltip>
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
                          <ActionTooltip title="Copiar Serial" description="Copia a chave serial de ativação desktop." side="top">
                            <button
                              onClick={() => {
                                copyToClipboard(lic.serialToken);
                                alert('Serial copiado!');
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </ActionTooltip>
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
                          <ActionTooltip title="Provisionar E-mail Lark" description="Cria a caixa postal corporativa oficial @webbilly.com.br deste operador." side="top">
                            <button
                              onClick={() => handleOpenProvisionModal(lic)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Provisionar @webbilly</span>
                            </button>
                          </ActionTooltip>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Bloquear / Desbloquear */}
                          <ActionTooltip
                            title={lic.status === 'BLOQUEADO' ? 'Desbloquear Licença' : 'Bloquear Licença'}
                            description={lic.status === 'BLOQUEADO' ? 'Reativa o acesso do operador ao software desktop Billy.' : 'Bloqueia imediatamente a execução do app desktop para esta licença.'}
                            side="top"
                          >
                            <button
                              onClick={() => handleToggleLicense(lic.serialToken, lic.status)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                lic.status === 'BLOQUEADO'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                            >
                              {lic.status === 'BLOQUEADO' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </ActionTooltip>

                          {/* Reset Machine ID */}
                          {lic.machineId && (
                            <ActionTooltip title="Resetar HWID / Machine ID" description="Desvincula o computador atual desta chave, permitindo ativar em uma nova máquina." side="top">
                              <button
                                onClick={() => handleResetMachine(lic.serialToken)}
                                className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </ActionTooltip>
                          )}

                          {/* Reset Senha Web */}
                          <ActionTooltip title="Resetar Senha Web" description="Gera uma senha provisória de acesso web para este operador." side="top">
                            <button
                              onClick={() => handleResetOperatorPassword(lic.serialToken, lic.operatorId)}
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          </ActionTooltip>
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
                  <th className="py-3.5 px-4 text-right">Ações de Triagem</th>
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
                        <button
                          onClick={() => setSelectedCandidate(cand)}
                          className="text-left font-bold text-white hover:text-[#84cc16] transition flex items-center gap-1.5 group cursor-pointer"
                          title="Clique para visualizar a ficha completa"
                        >
                          <span>{cand.name}</span>
                          <Eye className="w-3 h-3 text-zinc-500 group-hover:text-[#84cc16] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {cand.email}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        {cand.whatsapp || cand.phone || '—'}
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
                          <div className="flex items-center justify-end gap-1.5">
                            <ActionTooltip title="Ver Ficha" description="Visualizar todos os dados preenchidos pelo candidato no formulário do site" side="left">
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white font-medium text-xs transition border border-white/[0.1] flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Ver Ficha</span>
                              </button>
                            </ActionTooltip>

                            <ActionTooltip title="Aprovar & Emitir Serial" description="Aprova a inscrição, gera a licença desktop e ativa o acesso do operador." side="left">
                              <button
                                onClick={() => handleApproveOperator(cand.serialToken || 'NOVO', cand.id, cand.email)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950/40 cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar & Emitir Serial</span>
                              </button>
                            </ActionTooltip>

                            <ActionTooltip title="Negar Candidatura" description="Recusar candidatura e enviar aviso de nova tentativa após 60 dias" side="left">
                              <button
                                onClick={() => handleRejectCandidate(cand)}
                                disabled={rejectLoadingId === cand.id}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-medium text-xs transition border border-rose-500/30 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Negar</span>
                              </button>
                            </ActionTooltip>
                          </div>
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

      {/* MODAL: FICHA COMPLETA DO CANDIDATO */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0b0e14] border border-white/[0.12] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#121622] via-[#0f131d] to-[#121622] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#84cc16]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Ficha Completa do Candidato</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {selectedCandidate.status || 'PENDENTE'}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Dados oficiais preenchidos no formulário da Landing Page
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto text-xs">
              {/* Seção 1: Identificação & Contato */}
              <div>
                <span className="text-[11px] font-bold text-[#84cc16] uppercase tracking-wider block mb-3">
                  1. Dados Pessoais & Contato
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#121622]/80 border border-white/[0.06] rounded-2xl p-4">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Nome Completo</span>
                    <span className="text-white font-semibold text-sm">{selectedCandidate.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">E-mail Pessoal</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-zinc-200 font-mono select-all">{selectedCandidate.email}</span>
                      <button
                        onClick={() => copyToClipboard(selectedCandidate.email, 'E-mail copiado!')}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                        title="Copiar e-mail"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">WhatsApp</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400 font-mono font-semibold">
                        {selectedCandidate.whatsapp || selectedCandidate.phone || 'Não informado'}
                      </span>
                      {(selectedCandidate.whatsapp || selectedCandidate.phone) && (
                        <a
                          href={`https://wa.me/55${(selectedCandidate.whatsapp || selectedCandidate.phone).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                        >
                          <span>Abrir WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">CPF</span>
                    <span className="text-zinc-200 font-mono">
                      {selectedCandidate.cpf || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Cidade / Estado</span>
                    <span className="text-zinc-200">
                      {selectedCandidate.city_state || (selectedCandidate.city ? `${selectedCandidate.city} - ${selectedCandidate.state || 'BR'}` : 'Não informado')}
                    </span>
                  </div>
                  {selectedCandidate.address && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-mono">Endereço Residencial</span>
                      <span className="text-zinc-200">
                        {selectedCandidate.address}
                        {selectedCandidate.number ? `, ${selectedCandidate.number}` : ''}
                        {selectedCandidate.neighborhood ? ` - ${selectedCandidate.neighborhood}` : ''}
                        {selectedCandidate.cep ? ` (CEP: ${selectedCandidate.cep})` : ''}
                      </span>
                    </div>
                  )}
                  {selectedCandidate.instagram && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-mono">Instagram</span>
                      <a
                        href={`https://instagram.com/${selectedCandidate.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>{selectedCandidate.instagram}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção 2: Dados Financeiros / Repasse Pix */}
              <div>
                <span className="text-[11px] font-bold text-[#84cc16] uppercase tracking-wider block mb-3">
                  2. Dados Financeiros para Repasse das Comissões
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#121622]/80 border border-white/[0.06] rounded-2xl p-4">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Tipo da Chave Pix</span>
                    <span className="text-zinc-300 uppercase font-mono font-bold">
                      {selectedCandidate.pixType || selectedCandidate.pix_type || 'CPF'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Chave Pix Cadastrada</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400 font-mono font-bold select-all">
                        {selectedCandidate.pixKey || selectedCandidate.pix_key || 'Não informada'}
                      </span>
                      {(selectedCandidate.pixKey || selectedCandidate.pix_key) && (
                        <button
                          onClick={() => copyToClipboard(selectedCandidate.pixKey || selectedCandidate.pix_key, 'Chave Pix copiada!')}
                          className="text-zinc-500 hover:text-white cursor-pointer"
                          title="Copiar Pix"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Experiência Comercial */}
              <div>
                <span className="text-[11px] font-bold text-[#84cc16] uppercase tracking-wider block mb-3">
                  3. Perfil & Experiência Comercial Informada
                </span>
                <div className="bg-[#121622]/80 border border-white/[0.06] rounded-2xl p-4 space-y-2">
                  <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {selectedCandidate.experience || 'Nenhuma experiência detalhada informada pelo candidato.'}
                  </p>
                  {selectedCandidate.resumeUrl && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <a
                        href={selectedCandidate.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Acessar Link de Currículo / LinkedIn</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção 4: Auditoria de Aceite e Origem */}
              <div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">
                  4. Auditoria Jurídica & Origem da Inscrição
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#121622]/50 border border-white/[0.04] rounded-2xl p-3.5 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Data do Cadastro</span>
                    <span className="text-zinc-300 font-mono">
                      {selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleString('pt-BR') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">IP de Aceite dos Termos</span>
                    <span className="text-zinc-300 font-mono">
                      {selectedCandidate.accepted_terms_ip || '127.0.0.1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Indicação / Patrocinador</span>
                    <span className="text-zinc-300 font-mono">
                      {selectedCandidate.referred_by_name || selectedCandidate.affiliate_code_used || selectedCandidate.referred_by_operator_id || 'Inscrição Direta'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer com Botões de Decisão */}
            <div className="px-6 py-4 bg-[#0d1017] border-t border-white/[0.08] flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white font-medium text-xs transition cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cand = selectedCandidate;
                    handleRejectCandidate(cand);
                  }}
                  disabled={rejectLoadingId === selectedCandidate.id}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 font-bold text-xs transition border border-rose-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Negar Candidatura</span>
                </button>

                <button
                  onClick={async () => {
                    const cand = selectedCandidate;
                    await handleApproveOperator(cand.serialToken || 'NOVO', cand.id, cand.email);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar & Emitir Serial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO: CANDIDATURA RECUSADA (COM PRAZO DE 60 DIAS) */}
      {rejectResultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f121a] border border-rose-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <X className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  Candidatura Recusada
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  O cadastro de <strong className="text-white">{rejectResultModal.candidateName}</strong> foi marcado como recusado. Nova tentativa liberada em {rejectResultModal.reapplyDateBr}.
                </p>
              </div>
              <button
                onClick={() => setRejectResultModal(null)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectResultModal.emailSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>E-mail oficial com prazo de 60 dias enviado automaticamente para <strong>{rejectResultModal.candidateEmail}</strong>.</span>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Servidor SMTP não configurado. Você pode enviar a mensagem oficial diretamente via WhatsApp abaixo:</span>
              </div>
            )}

            {/* Caixa da mensagem pré-formatada */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Mensagem Padrão (Tentativa após 60 dias):
              </label>
              <div className="bg-[#141824] border border-white/[0.08] rounded-xl p-3.5 text-xs text-zinc-200 leading-relaxed font-sans select-all">
                {rejectResultModal.messageText}
              </div>
            </div>

            {/* Botões de Ação de 1 Clique */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              {rejectResultModal.whatsappLink && (
                <a
                  href={rejectResultModal.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Enviar via WhatsApp</span>
                </a>
              )}

              <button
                onClick={() => copyToClipboard(rejectResultModal.messageText, 'Mensagem copiada para a área de transferência!')}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white font-semibold text-xs transition border border-white/[0.1] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Mensagem</span>
              </button>

              <button
                onClick={() => setRejectResultModal(null)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
