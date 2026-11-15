'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  X,
  Send,
  Trash2,
  Power,
  Flame,
  Sparkles,
  Info,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  ExternalLink,
  Globe,
  ArrowRight
} from 'lucide-react';

interface AdminAlertItem {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'promo' | 'urgent';
  action_label?: string;
  action_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  readsCount: number;
}

interface AdminAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertsUpdated?: () => void;
  adminEmail?: string;
  adminName?: string;
  pendingCancellations?: any[];
  onRefreshData?: () => Promise<void>;
}

export default function AdminAlertsModal({
  isOpen,
  onClose,
  onAlertsUpdated,
  adminEmail,
  adminName,
  pendingCancellations = [],
  onRefreshData
}: AdminAlertsModalProps) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingCancellationsList = Array.isArray(pendingCancellations) ? pendingCancellations : [];
  const [activeTab, setActiveTab] = useState<'cancellations' | 'broadcast'>(
    pendingCancellationsList.length > 0 ? 'cancellations' : 'broadcast'
  );

  useEffect(() => {
    if (pendingCancellationsList.length > 0) {
      setActiveTab('cancellations');
    }
  }, [pendingCancellationsList.length]);

  // Formulário
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'info' | 'promo' | 'urgent'>('info');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  const fetchAdminAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/alerts', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch (err: any) {
      console.warn('[AdminAlerts] Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminAlerts();
    }
  }, [isOpen]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage('Preencha o título e a mensagem do comunicado.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          priority,
          action_label: actionLabel || undefined,
          action_url: actionUrl || undefined,
          created_by: adminEmail || 'admin@billysuite.com.br'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar alerta.');
      }

      setSuccessMessage('Alerta disparado com sucesso para todos os operadores!');
      setTitle('');
      setMessage('');
      setActionLabel('');
      setActionUrl('');
      setPriority('info');

      await fetchAdminAlerts();
      if (onAlertsUpdated) onAlertsUpdated();

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao disparar alerta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (alertItem: AdminAlertItem) => {
    try {
      const newStatus = !alertItem.is_active;
      // Otimista
      setAlerts(prev =>
        prev.map(a => (a.id === alertItem.id ? { ...a, is_active: newStatus } : a))
      );

      await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertItem.id, is_active: newStatus })
      });

      if (onAlertsUpdated) onAlertsUpdated();
    } catch (err) {
      console.warn('[AdminAlerts] Erro ao alternar status:', err);
      fetchAdminAlerts();
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Deseja realmente excluir este comunicado do sistema?')) return;
    try {
      setAlerts(prev => prev.filter(a => a.id !== alertId));

      await fetch(`/api/admin/alerts?id=${encodeURIComponent(alertId)}`, {
        method: 'DELETE'
      });

      if (onAlertsUpdated) onAlertsUpdated();
    } catch (err) {
      console.warn('[AdminAlerts] Erro ao excluir:', err);
      fetchAdminAlerts();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0d1017] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black flex flex-col overflow-hidden text-left">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-[#111522] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#84cc16]/15 border border-[#84cc16]/30 flex items-center justify-center">
              <img src="/icones/029-megaphone.svg" alt="" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Central de Comunicados & Alertas Globais</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Broadcast Push
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Dispare avisos em tempo real com sininho pulsante no painel de todos os operadores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAdminAlerts();
                if (onRefreshData) onRefreshData();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Abas */}
        <div className="px-6 py-2.5 bg-[#0e111a] border-b border-white/[0.08] flex items-center gap-2 shrink-0">
          {pendingCancellationsList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('cancellations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'cancellations'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-950/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Solicitações de Cancelamento</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono font-black animate-bounce">
                {pendingCancellationsList.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>Comunicados Globais ({alerts.length})</span>
          </button>
        </div>

        {/* Conteúdo da Aba Cancelamentos */}
        {activeTab === 'cancellations' && (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                  <span>Clientes Aguardando Contato / Cancelamento</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Faça o contato prévio de retenção ou confirmação via WhatsApp antes de executar o encerramento definitivo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/admin/sites?filter=CANCELLATION_REQUESTED');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition flex items-center gap-1.5"
              >
                <span>Ver Todos em Sites</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {pendingCancellationsList.map((sub: any) => {
                const cleanSlug = sub.siteSlug || sub.slug || (sub.id?.startsWith('sub_') ? sub.id.replace('sub_', '') : '') || '';
                const cleanPhone = (sub.clientPhone || sub.clientWhatsapp || '').replace(/\D/g, '');
                const cleanPhoneForWa = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                const waMessage = `Olá! Recebemos sua solicitação de cancelamento do site ${cleanSlug ? `${cleanSlug}.webbilly.com.br` : (sub.clientName || '')} na Webbilly. Podemos confirmar se deseja prosseguir com o encerramento definitivo da assinatura?`;
                const waUrl = `https://wa.me/${cleanPhoneForWa}?text=${encodeURIComponent(waMessage)}`;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-[#141824] border border-rose-500/30 shadow-lg relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Cancelamento Solicitado
                        </span>
                        {cleanSlug && (
                          <a
                            href={`https://${cleanSlug}.webbilly.com.br`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-sky-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>{cleanSlug}.webbilly.com.br</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <h5 className="text-base font-bold text-white tracking-tight">
                        {sub.clientName}
                      </h5>

                      <div className="text-xs text-zinc-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                          <Phone className="w-3.5 h-3.5" />
                          {sub.clientPhone || 'Sem telefone'}
                        </span>
                        {sub.monthlyPrice && (
                          <span className="font-mono text-zinc-400">
                            Mensalidade: <strong className="text-white">R$ {sub.monthlyPrice?.toFixed(2)}/mês</strong>
                          </span>
                        )}
                        {(sub.cancellationRequestedAt || sub.cancellation_requested_at) && (
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Solicitado em: {new Date(sub.cancellationRequestedAt || sub.cancellation_requested_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {(sub.cancellationReason || sub.cancellation_reason) && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04] text-xs text-zinc-300 mt-2">
                          <strong className="text-zinc-400 font-medium">Motivo: </strong>
                          {sub.cancellationReason || sub.cancellation_reason}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                      {cleanPhone && (
                        <ActionTooltip
                          title="Abrir WhatsApp do Cliente"
                          description="Inicia conversa no WhatsApp com texto de retenção e confirmação de encerramento."
                          side="top"
                        >
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Abrir WhatsApp do Cliente</span>
                          </a>
                        </ActionTooltip>
                      )}

                      <ActionTooltip
                        title="Gerenciar Encerramento"
                        description="Abre a tela de sites ativos para executar o cancelamento definitivo."
                        side="top"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push('/admin/sites?filter=CANCELLATION_REQUESTED');
                          }}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Gerenciar em Sites Ativos</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </ActionTooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Corpo do Modal com 2 Colunas (Broadcast) */}
        {activeTab === 'broadcast' && (
        <div className="flex-1 min-h-0 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Formulário de Envio (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08]">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-[#84cc16]" />
                <span>Novo Disparo Global</span>
              </h4>

              <form onSubmit={handleCreateAlert} className="space-y-3">
                {/* Título */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Título do Comunicado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 🚀 Meta Batida! Bônus de 20% no ar"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0d15] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]/80 transition"
                  />
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Prioridade Visual
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPriority('info')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                        priority === 'info'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/60'
                          : 'bg-black/20 text-zinc-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      <Info className="w-3 h-3 text-sky-400" />
                      <span>Aviso</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('promo')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                        priority === 'promo'
                          ? 'bg-[#84cc16]/20 text-[#a3e635] border-[#84cc16]/60'
                          : 'bg-black/20 text-zinc-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#84cc16]" />
                      <span>Campanha</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriority('urgent')}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 cursor-pointer ${
                        priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                          : 'bg-black/20 text-zinc-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Urgente</span>
                    </button>
                  </div>
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Escreva a mensagem completa que aparecerá na central dos operadores..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0d15] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]/80 transition resize-none"
                  />
                </div>

                {/* Ação Opcional (Botão & Link) */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Botão de Ação Rápida (Opcional)
                  </div>
                  <input
                    type="text"
                    placeholder="Texto do Botão (Ex: Ver Meu Ranking)"
                    value={actionLabel}
                    onChange={e => setActionLabel(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0d15] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition"
                  />
                  <input
                    type="text"
                    placeholder="Link ou URL (Ex: /operador?tab=ranking)"
                    value={actionUrl}
                    onChange={e => setActionUrl(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0a0d15] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/80 transition font-mono"
                  />
                </div>

                {/* Mensagens de Sucesso ou Erro */}
                {successMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}
                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Botão Submeter */}
                <ActionTooltip
                  title="Disparar Comunicado"
                  description="Envia este comunicado imediatamente para o painel de todos os operadores conectados."
                  side="top"
                >
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#a3e635] text-black shadow-lg shadow-[#84cc16]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {submitting ? 'Disparando...' : 'Disparar Comunicado Global'}
                    </span>
                  </button>
                </ActionTooltip>
              </form>
            </div>
          </div>

          {/* Coluna Direita: Lista dos Alertas Cadastrados (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Histórico de Comunicados ({alerts.length})
              </h4>
              <span className="text-[10px] text-zinc-400">
                {alerts.filter(a => a.is_active).length} ativos no momento
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-10 rounded-xl bg-[#141824] border border-white/[0.08] text-center text-xs text-zinc-400">
                  Nenhum comunicado disparado ainda.
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition ${
                      alert.is_active
                        ? 'bg-[#141824] border-white/[0.08] hover:border-white/[0.16]'
                        : 'bg-black/40 border-white/[0.04] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {alert.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Urgente
                          </span>
                        )}
                        {alert.priority === 'promo' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30">
                            Campanha
                          </span>
                        )}
                        {alert.priority === 'info' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Aviso
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            alert.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {alert.is_active ? '● ATIVO' : 'PAUSADO'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ActionTooltip
                          title={alert.is_active ? 'Pausar Comunicado' : 'Reativar Comunicado'}
                          description={alert.is_active ? 'Oculta este alerta do painel dos operadores.' : 'Torna este alerta visível novamente para os operadores.'}
                          side="top"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(alert)}
                            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                              alert.is_active
                                ? 'text-amber-400 hover:bg-amber-500/10'
                                : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </ActionTooltip>

                        <ActionTooltip title="Excluir Comunicado" description="Remove este comunicado definitivamente do histórico." side="top">
                          <button
                            type="button"
                            onClick={() => handleDelete(alert.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </ActionTooltip>
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-white mb-1">{alert.title}</h5>
                    <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed mb-3">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.04] text-zinc-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{alert.readsCount} operador{alert.readsCount === 1 ? '' : 'es'} visualizou</span>
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* Rodapé do Modal */}
        <div className="px-6 py-3 bg-[#0a0d15] border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
          <span>Sistema Integrado com Supabase & db.json</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
