'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Filter,
  MessageSquare,
  Search,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';

interface EditRequest {
  id: string;
  client_account_id: string;
  site_slug: string;
  operator_id?: string;
  title: string;
  description: string;
  photos: string[];
  status: 'enviada' | 'em_andamento' | 'publicada';
  operator_notes?: string;
  is_extra_credit: boolean;
  created_at: string;
  completed_at?: string;
}

export default function OperadorSolicitacoesPage() {
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/operador/solicitacoes-alteracao');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        // Inicializa rascunhos de notas
        const drafts: Record<string, string> = {};
        (data.requests || []).forEach((r: EditRequest) => {
          drafts[r.id] = r.operator_notes || '';
        });
        setNotesDraft(drafts);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'enviada' | 'em_andamento' | 'publicada') => {
    setUpdatingId(id);
    try {
      const notes = notesDraft[id] ?? '';
      const res = await fetch('/api/operador/solicitacoes-alteracao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, operatorNotes: notes })
      });

      if (res.ok) {
        setRequests(prev =>
          prev.map(r => (r.id === id ? { ...r, status: newStatus, operator_notes: notes } : r))
        );
        setSavedFeedback(id);
        setTimeout(() => setSavedFeedback(null), 2500);
      }
    } catch (_) {}
    finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setUpdatingId(id);
    try {
      const current = requests.find(r => r.id === id);
      const notes = notesDraft[id] ?? '';
      const res = await fetch('/api/operador/solicitacoes-alteracao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: current?.status || 'em_andamento', operatorNotes: notes })
      });

      if (res.ok) {
        setRequests(prev =>
          prev.map(r => (r.id === id ? { ...r, operator_notes: notes } : r))
        );
        setSavedFeedback(id);
        setTimeout(() => setSavedFeedback(null), 2500);
      }
    } catch (_) {}
    finally {
      setUpdatingId(null);
    }
  };

  const filtered = requests.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        r.site_slug.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Fila de Alterações dos Clientes
            </h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Gerencie as solicitações enviadas pelos seus clientes através do Portal do Cliente (/cliente).
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="self-start md:self-auto px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)', backgroundColor: 'var(--bg-app)' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Fila</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl border" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'enviada', label: '1. Enviadas' },
            { id: 'em_andamento', label: '2. Em Andamento' },
            { id: 'publicada', label: '3. Publicadas' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === f.id ? 'text-white shadow-xs' : 'hover:opacity-80'
              }`}
              style={
                filterStatus === f.id
                  ? { backgroundColor: 'var(--color-primary)' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por slug ou texto..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Carregando solicitações de alteração...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <Layers className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
          <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Nenhuma alteração encontrada</div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Nenhum cliente solicitou alterações com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => {
            const isUpdating = updatingId === req.id;
            return (
              <div
                key={req.id}
                className="p-5 sm:p-6 rounded-2xl border shadow-xs space-y-4 transition-all"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
              >
                {/* Header do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--color-primary)' }}>
                        {req.site_slug}.webbilly.com.br
                      </span>
                      {req.is_extra_credit && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Crédito Extra Pago
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base mt-1" style={{ color: 'var(--text-main)' }}>{req.title}</h3>
                  </div>

                  {/* Botões de Ação de Status */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      disabled={isUpdating || req.status === 'enviada'}
                      onClick={() => handleUpdateStatus(req.id, 'enviada')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        req.status === 'enviada'
                          ? 'bg-blue-500/15 text-blue-600 border-blue-500/40 font-bold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      Enviada
                    </button>

                    <button
                      disabled={isUpdating || req.status === 'em_andamento'}
                      onClick={() => handleUpdateStatus(req.id, 'em_andamento')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        req.status === 'em_andamento'
                          ? 'bg-amber-500/15 text-amber-600 border-amber-500/40 font-bold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      Em Andamento
                    </button>

                    <button
                      disabled={isUpdating || req.status === 'publicada'}
                      onClick={() => handleUpdateStatus(req.id, 'publicada')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        req.status === 'publicada'
                          ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40 font-bold'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      Publicada
                    </button>

                    <a
                      href={`/operador/estudio?slug=${req.site_slug}`}
                      className="ml-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 shadow-xs hover:opacity-95"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Abrir no Studio</span>
                    </a>
                  </div>
                </div>

                {/* Descrição das Alterações */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    O que o cliente solicitou alterar:
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap p-3.5 rounded-xl border" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {req.description}
                  </p>
                </div>

                {/* Fotos de Referência */}
                {req.photos && req.photos.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Fotos de Referência Fornecidas:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {req.photos.map((p, idx) => (
                        <a
                          key={idx}
                          href={p}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:underline"
                          style={{ borderColor: 'var(--border-subtle)', color: 'var(--color-primary)', backgroundColor: 'var(--bg-app)' }}
                        >
                          <span>Foto {idx + 1}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nota do Operador para o Cliente */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Nota Explicativa para o Cliente (visível no painel dele)
                    </label>
                    {savedFeedback === req.id && (
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={notesDraft[req.id] ?? ''}
                      onChange={(e) => setNotesDraft({ ...notesDraft, [req.id]: e.target.value })}
                      placeholder="ex: Banner atualizado e novos horários inseridos no site!"
                      className="flex-1 px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                    />
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleSaveNotes(req.id)}
                      className="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 hover:opacity-80"
                      style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Salvar Nota</span>
                    </button>
                  </div>
                </div>

                {/* Footer do Card */}
                <div className="text-[11px] flex items-center justify-between pt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>Solicitado em: {new Date(req.created_at).toLocaleString('pt-BR')}</span>
                  {req.completed_at && (
                    <span className="text-emerald-500 font-medium">
                      Concluído em: {new Date(req.completed_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
