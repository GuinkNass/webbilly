'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, AlertCircle, Sparkles, ArrowRight, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';

export default function TrabalheAquiForm() {
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    cidade: '',
    experiencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.whatsapp || !formData.email) {
      setError('Por favor, preencha os campos obrigatórios: Nome, WhatsApp e E-mail.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/trabalhe-aqui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao enviar candidatura.');
      }

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar candidatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#121622] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
      {/* Glow de fundo */}
      <div className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -top-10 -right-10" />

      {/* Header do Formulário */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Oportunidade &bull; Parceria Comercial
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          Trabalhe Aqui
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Torne-se um operador licenciado Billy Suite e fature 50% em cada venda
        </p>
      </div>

      {success ? (
        <div className="text-center py-10 space-y-4 relative z-10 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
            Candidatura enviada com sucesso!
          </h3>
          <p className="text-zinc-300 text-sm max-w-md mx-auto leading-relaxed">
            Entraremos em contato pelo WhatsApp. Nossa equipe comercial analisará suas informações e liberará o acesso ao sistema.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ nome: '', whatsapp: '', email: '', cidade: '', experiencia: '' });
              }}
              className="px-6 py-2.5 rounded-xl border border-white/[0.1] hover:border-emerald-500/40 text-xs font-bold text-zinc-300 hover:text-white transition"
            >
              Enviar Outra Candidatura
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Nome Completo <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="nome"
                required
                placeholder="Ex: Carlos Eduardo Silva"
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp com DDD <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                required
                placeholder="Ex: (11) 98765-4321"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                E-mail <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="Ex: seuemail@exemplo.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>

            {/* Cidade / Estado */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Cidade / Estado
              </label>
              <input
                type="text"
                name="cidade"
                placeholder="Ex: São Paulo / SP"
                value={formData.cidade}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition"
              />
            </div>
          </div>

          {/* Experiência */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Conte brevemente sua experiência com vendas ou prospecção
            </label>
            <textarea
              name="experiencia"
              rows={3}
              placeholder="Descreva sua experiência anterior com vendas, captação ou perfil do Instagram/LinkedIn..."
              value={formData.experiencia}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b0e14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-emerald-500 placeholder-zinc-600 transition resize-none"
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-[#7abf18] hover:opacity-95 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  <span>Enviando candidatura...</span>
                </>
              ) : (
                <>
                  <span>Enviar Minha Candidatura</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-2">
              Seus dados serão enviados de forma segura para nossa equipe de seleção.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
