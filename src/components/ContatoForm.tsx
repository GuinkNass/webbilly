'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, AlertCircle, MessageSquare, Phone, Mail, User, HelpCircle, Headphones, Wrench, ShieldAlert } from 'lucide-react';

export default function ContatoForm() {
  const [activeChannel, setActiveChannel] = useState<'comercial' | 'sac'>('comercial');
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    assunto: '',
    categoria: 'Dúvida',
    mensagem: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.mensagem) {
      setError('Por favor, preencha os campos obrigatórios: Nome, E-mail e Mensagem.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = activeChannel === 'sac' ? '/api/sac' : '/api/contato';
      const payload = activeChannel === 'sac'
        ? {
            nome: formData.nome,
            email: formData.email,
            whatsapp: formData.whatsapp,
            categoria: formData.categoria,
            mensagem: formData.mensagem
          }
        : {
            nome: formData.nome,
            email: formData.email,
            whatsapp: formData.whatsapp,
            assunto: formData.assunto || 'Contato via Site',
            mensagem: formData.mensagem
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao enviar mensagem.');
      }

      setSuccess(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="sac-contato" className="w-full max-w-3xl mx-auto bg-[#121622] border border-white/[0.08] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
      {/* Glow de fundo */}
      <div className={`absolute w-80 h-80 rounded-full blur-[100px] pointer-events-none -top-10 -right-10 transition duration-500 ${
        activeChannel === 'sac' ? 'bg-rose-500/10' : 'bg-blue-500/10'
      }`} />

      {/* Seletor de Canal: Comercial vs SAC */}
      <div className="flex items-center justify-center gap-2 mb-8 relative z-10">
        <div className="bg-[#080a10] p-1.5 rounded-2xl border border-white/[0.08] inline-flex">
          <button
            type="button"
            onClick={() => { setActiveChannel('comercial'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeChannel === 'comercial'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Atendimento Comercial</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveChannel('sac'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeChannel === 'sac'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>SAC & Suporte Técnico</span>
          </button>
        </div>
      </div>

      {/* Header do Formulário */}
      <div className="text-center mb-8 relative z-10">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
          activeChannel === 'sac'
            ? 'bg-rose-950/60 border border-rose-800/40 text-rose-400'
            : 'bg-blue-950/60 border border-blue-800/40 text-blue-400'
        }`}>
          {activeChannel === 'sac' ? <Headphones className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
          <span>{activeChannel === 'sac' ? 'Canal Oficial de SAC & Suporte' : 'Canal Comercial'}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
          {activeChannel === 'sac' ? 'SAC & Suporte ao Cliente' : 'Fale com o Comercial'}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          {activeChannel === 'sac'
            ? 'Dúvidas técnicas, alterações no seu site, suporte ou solicitações tratadas com prioridade'
            : 'Tire suas dúvidas ou solicite propostas comerciais personalizadas para seu negócio'}
        </p>
      </div>

      {success ? (
        <div className="p-8 rounded-xl bg-[#090d16] border border-white/[0.08] text-center animate-fade-in relative z-10">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeChannel === 'sac' ? 'Chamado de SAC Registrado!' : 'Mensagem Enviada com Sucesso!'}
          </h3>
          <p className="text-zinc-300 text-sm max-w-md mx-auto leading-relaxed">
            {activeChannel === 'sac'
              ? 'Seu chamado foi encaminhado para a equipe de suporte (sac@webbilly.com.br). Retornaremos via e-mail ou WhatsApp com a resolução.'
              : 'Recebemos seu contato e nossa equipe comercial (comercial@webbilly.com.br) retornará em breve.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ nome: '', whatsapp: '', email: '', assunto: '', categoria: 'Dúvida', mensagem: '' });
              }}
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-700 transition"
            >
              Enviar Outra Mensagem
            </button>
            <a
              href={`mailto:${activeChannel === 'sac' ? 'sac@webbilly.com.br' : 'comercial@webbilly.com.br'}`}
              className="py-2.5 px-6 rounded-xl text-xs font-bold text-zinc-300 bg-white/[0.04] border border-white/[0.08] hover:text-white transition"
            >
              {activeChannel === 'sac' ? 'sac@webbilly.com.br' : 'comercial@webbilly.com.br'}
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                placeholder="Ex: Carlos Silva"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                WhatsApp com DDD
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                E-mail de Contato *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="seuemail@exemplo.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition"
              />
            </div>

            <div>
              {activeChannel === 'sac' ? (
                <>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-rose-400" />
                    Categoria do Chamado *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-rose-500 transition"
                  >
                    <option value="Dúvida">Dúvida</option>
                    <option value="Suporte Técnico">Suporte Técnico</option>
                    <option value="Alteração de Site">Alteração de Site / Dados</option>
                    <option value="Reclamação">Reclamação</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                    Assunto
                  </label>
                  <input
                    type="text"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    placeholder="Ex: Informações sobre planos, contratação"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              Sua Mensagem / Relato *
            </label>
            <textarea
              name="mensagem"
              required
              rows={4}
              value={formData.mensagem}
              onChange={handleChange}
              placeholder={activeChannel === 'sac' ? 'Descreva detalhadamente o suporte que precisa ou a alteração desejada...' : 'Descreva sua dúvida ou proposta comercial...'}
              className="w-full px-4 py-2.5 rounded-xl bg-[#080a10] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${
                activeChannel === 'sac'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {activeChannel === 'sac'
                      ? 'Registrar Chamado em sac@webbilly.com.br'
                      : 'Enviar Mensagem para comercial@webbilly.com.br'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
