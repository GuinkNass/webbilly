'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  Phone,
  Clock,
  HelpCircle,
  FileText,
  Lock
} from 'lucide-react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function CancelamentoPage() {
  const [formData, setFormData] = useState({
    identifier: '',
    whatsapp: '',
    docOrEmail: '',
    reasonOption: 'Redução temporária de despesas',
    reasonDetails: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resultProtocol, setResultProtocol] = useState<string>('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      whatsapp: formatPhone(e.target.value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier.trim()) {
      setError('Por favor, informe o subdomínio ou o nome do seu estabelecimento.');
      return;
    }
    const cleanDigits = formData.whatsapp.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setError('Por favor, informe um WhatsApp válido com DDD para envio do comprovante.');
      return;
    }

    setLoading(true);
    setError(null);

    const fullReason = formData.reasonDetails.trim()
      ? `${formData.reasonOption}: ${formData.reasonDetails.trim()}`
      : formData.reasonOption;

    try {
      const res = await fetch('/api/assinatura/solicitar-cancelamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          subdomain: formData.identifier.trim(),
          whatsapp: formData.whatsapp.trim(),
          docOrEmail: formData.docOrEmail.trim(),
          reason: fullReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao registrar sua solicitação.');
      }

      setResultProtocol(data.protocol || `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar solicitação. Tente novamente ou fale no WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans select-none antialiased">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[40rem] h-[40rem] bg-rose-600/10 rounded-full blur-[140px] -top-20 -left-20" />
        <div className="absolute w-[35rem] h-[35rem] bg-[#84cc16]/10 rounded-full blur-[140px] -bottom-20 -right-20" />
      </div>

      {/* Header Limpo */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#0c0f17]/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/billy-logo.png"
              alt="Webbilly"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-black text-white tracking-tight block leading-none">
                Web<span className="text-[#84cc16]">billy</span>
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mt-0.5">
                Presença Web Recorrente
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para o Início</span>
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6 sm:my-10">
        <div className="max-w-xl w-full bg-[#11141c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black relative space-y-6">
          
          {submitted ? (
            /* Tela de Confirmação & Protocolo */
            <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block">
                  Solicitação Registrada
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Recebemos sua solicitação!
                </h1>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Nossa equipe entrará em contato pelo seu WhatsApp em breve para confirmar e enviar o comprovante oficial de encerramento definitivo.
                </p>
              </div>

              {/* Box de Protocolo */}
              <div className="p-4 rounded-2xl bg-[#0a0d14] border border-white/[0.08] text-left space-y-2 max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Protocolo de Atendimento:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{resultProtocol}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>WhatsApp Informado:</span>
                  <span className="font-mono text-white">{formData.whatsapp}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Site / Comércio:</span>
                  <span className="font-mono text-cyan-300 truncate max-w-[180px]">{formData.identifier}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200 text-left space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Garantia de Não Cobrança Futura
                </p>
                <p className="text-zinc-300">
                  Após a confirmação da nossa equipe pelo WhatsApp, nenhuma nova mensalidade de R$ 29,90 será gerada. Você receberá o recibo de cancelamento completo com este protocolo.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                >
                  Voltar para Página Inicial
                </Link>
                <a
                  href={`https://wa.me/5511943168939?text=${encodeURIComponent(`Olá! Acabei de registrar a solicitação de cancelamento de assinatura do site ${formData.identifier} (Protocolo: ${resultProtocol}). Poderiam confirmar?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Falar com SAC no WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            /* Formulário de Solicitação */
            <>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold font-mono mb-3">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Atendimento & Encerramento
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Solicitar Cancelamento de Assinatura
                </h1>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Sem multas ou fidelidade obrigatória. Preencha os dados do seu comércio para localizarmos sua assinatura recorrente de R$ 29,90/mês.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subdomínio ou Nome do Comércio */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Subdomínio do Site ou Nome do Comércio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: barbearia-alura ou barbearia-alura.webbilly.com.br"
                    value={formData.identifier}
                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 transition"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Pode informar o link do site ou o nome comercial utilizado na contratação.
                  </span>
                </div>

                {/* WhatsApp de Contato */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    WhatsApp do Responsável (com DDD) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 transition font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Nossa equipe entrará em contato por este número para confirmar o encerramento e enviar o comprovante.
                  </span>
                </div>

                {/* CPF/CNPJ ou E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    CPF/CNPJ ou E-mail cadastrado (Opcional, agiliza a localização)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00 ou seu-email@exemplo.com"
                    value={formData.docOrEmail}
                    onChange={e => setFormData({ ...formData, docOrEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 transition"
                  />
                </div>

                {/* Motivo do Cancelamento */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Motivo Principal do Cancelamento
                  </label>
                  <select
                    value={formData.reasonOption}
                    onChange={e => setFormData({ ...formData, reasonOption: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-rose-500/80 transition cursor-pointer"
                  >
                    <option value="Redução temporária de despesas">Redução temporária de despesas</option>
                    <option value="Fechamento temporário ou definitivo do estabelecimento">Fechamento temporário ou definitivo do estabelecimento</option>
                    <option value="Mudança de estratégia de divulgação">Mudança de estratégia de divulgação</option>
                    <option value="Desejo reformular dados ou identidade visual">Desejo reformular dados ou identidade visual</option>
                    <option value="Outro motivo">Outro motivo</option>
                  </select>
                </div>

                {/* Detalhes Opcionais */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Observações ou Sugestões para Nossa Equipe (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conte-nos brevemente o que podemos melhorar ou como podemos auxiliá-lo..."
                    value={formData.reasonDetails}
                    onChange={e => setFormData({ ...formData, reasonDetails: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0d14] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-rose-500/80 transition resize-none"
                  />
                </div>

                {/* Box de Tranquilidade */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    <strong className="text-white block font-medium">Transparência Webbilly:</strong>
                    Após enviar, a solicitação gera um protocolo formal. Nossa equipe entrará em contato via WhatsApp antes de despublicar seu site para garantir que tudo ocorra com tranquilidade e sem cobranças pendentes.
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando solicitação...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitação de Cancelamento</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </main>

      {/* Footer Mínimo */}
      <footer className="relative z-10 border-t border-white/[0.08] py-4 px-4 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Webbilly • Presença Web Recorrente para Negócios Locais.</p>
      </footer>
    </div>
  );
}
