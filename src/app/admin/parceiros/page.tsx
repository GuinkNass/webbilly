'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  Check,
  AlertCircle
} from 'lucide-react';

interface AffiliateTool {
  id: string;
  name: string;
  category: string;
  description: string;
  benefit?: string;
  logo_url?: string;
  affiliate_link: string;
  is_active: boolean;
  display_order: number;
  clicks_count: number;
}

export default function AdminParceirosPage() {
  const [tools, setTools] = useState<AffiliateTool[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState<AffiliateTool | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'E-commerce & Vendas',
    description: '',
    benefit: '',
    logo_url: '',
    affiliate_link: '',
    display_order: 1,
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ferramentas');
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools || []);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const openNewModal = () => {
    setEditingTool(null);
    setFormData({
      name: '',
      category: 'E-commerce & Vendas',
      description: '',
      benefit: '',
      logo_url: '',
      affiliate_link: '',
      display_order: (tools.length + 1),
      is_active: true
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (tool: AffiliateTool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      category: tool.category,
      description: tool.description,
      benefit: tool.benefit || '',
      logo_url: tool.logo_url || '',
      affiliate_link: tool.affiliate_link,
      display_order: tool.display_order,
      is_active: tool.is_active
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.affiliate_link.trim()) {
      setErrorMsg('Nome e Link de Afiliado são obrigatórios.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const url = editingTool
        ? `/api/admin/ferramentas/${editingTool.id}`
        : '/api/admin/ferramentas';

      const method = editingTool ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Erro ao salvar ferramenta.');
      }

      setShowModal(false);
      await fetchTools();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar ferramenta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover esta ferramenta parceira?')) return;
    try {
      await fetch(`/api/admin/ferramentas/${id}`, { method: 'DELETE' });
      await fetchTools();
    } catch (_) {}
  };

  const handleToggleActive = async (tool: AffiliateTool) => {
    try {
      await fetch(`/api/admin/ferramentas/${tool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !tool.is_active })
      });
      await fetchTools();
    } catch (_) {}
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              Vitrine de Parceiros & Billy Afiliados B2B
            </h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
            Gerencie as ferramentas e benefícios exibidos no Portal do Cliente (/cliente) e monitore os cliques gerados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTools}
            className="p-2.5 rounded-xl border hover:opacity-80 transition-all"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 shadow-sm transition-all hover:opacity-95"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ferramenta</span>
          </button>
        </div>
      </div>

      {/* Grid of Tools */}
      {loading ? (
        <div className="p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Carregando ferramentas parceiras...
        </div>
      ) : tools.length === 0 ? (
        <div className="p-12 rounded-2xl border text-center space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <Sparkles className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
          <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Nenhuma ferramenta cadastrada</div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Clique em "Nova Ferramenta" para adicionar Nuvemshop, Ton, BotConversa, Bling ou qualquer outro parceiro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: tool.is_active ? 'var(--border-strong)' : 'var(--border-subtle)',
                opacity: tool.is_active ? 1 : 0.65
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tool.logo_url ? (
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-10 h-10 rounded-xl object-contain p-1 border"
                        style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-app)' }}
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                        {tool.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>{tool.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                          Ordem: {tool.display_order}
                        </span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{tool.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(tool)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 border transition-all ${
                      tool.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}
                  >
                    {tool.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{tool.is_active ? 'Ativa' : 'Pausada'}</span>
                  </button>
                </div>

                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {tool.description}
                </p>

                {tool.benefit && (
                  <div className="p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Benefício: {tool.benefit}</span>
                  </div>
                )}
              </div>

              {/* Footer com Cliques e Ações */}
              <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
                  <span>{tool.clicks_count || 0} cliques registrados</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={tool.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border text-xs hover:opacity-80"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    title="Testar Link de Afiliado"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => openEditModal(tool)}
                    className="p-2 rounded-lg border text-xs hover:opacity-80"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(tool.id)}
                    className="p-2 rounded-lg border text-xs hover:text-red-500 transition-colors"
                    style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg p-6 sm:p-7 rounded-2xl border shadow-xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-main)' }}>
                  {editingTool ? 'Editar Ferramenta Parceira' : 'Nova Ferramenta Parceira'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--color-danger-soft)', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Nome da Ferramenta
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Nuvemshop ou Ton"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="ex: E-commerce ou Maquininhas"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Benefício / Desconto Exclusivo (visível em destaque)
                </label>
                <input
                  type="text"
                  value={formData.benefit}
                  onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                  placeholder="ex: 25% de desconto no 1º mês ou 3 meses grátis"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Link Oficial de Afiliado (onde o cliente será direcionado)
                </label>
                <input
                  type="url"
                  value={formData.affiliate_link}
                  onChange={(e) => setFormData({ ...formData, affiliate_link: e.target.value })}
                  placeholder="https://suaparceria.com.br/?ref=webbilly"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    URL do Logo / Ícone
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://site.com/logo.svg"
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    min={1}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Descrição / Apresentação da Ferramenta
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explique resumidamente como a ferramenta ajuda o comércio do cliente..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl font-bold text-xs text-white shadow-xs transition-all hover:opacity-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {saving ? 'Salvando...' : 'Salvar Ferramenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
