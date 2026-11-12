'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Globe,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function ProposalPage() {
  const params = useParams();
  const leadToken = (params?.leadToken as string) || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsSubmitting, setTermsSubmitting] = useState(false);

  useEffect(() => {
    if (!leadToken) return;
    fetch(`/api/public/proposta/${leadToken}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        if (resData?.domains && resData.domains.length > 0) {
          setSelectedDomain(resData.domains[0].domain);
        }
        if (resData?.lead?.accepted_terms_at) {
          setTermsAccepted(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [leadToken]);

  const handleToggleTerms = async (checked: boolean) => {
    setTermsAccepted(checked);
    if (checked && leadToken) {
      setTermsSubmitting(true);
      try {
        await fetch(`/api/public/proposta/${leadToken}/accept-terms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: 'v1.0' })
        });
      } catch (err) {
        console.warn('Erro ao salvar aceite eletrônico:', err);
      } finally {
        setTermsSubmitting(false);
      }
    }
  };

  const copyPix = () => {
    if (!data?.pix?.payload) return;
    navigator.clipboard.writeText(data.pix.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          <span>Carregando proposta oficial...</span>
        </div>
      </div>
    );
  }

  const lead = data?.lead || {};
  const pix = data?.pix || {};
  const domains = data?.domains || [];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img src="/billy-logo.png" alt="Billy Suite" className="h-9 w-9 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Billy Suite</span>
                <span className="font-mono text-[9px] uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  Proposta Oficial
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Ativação de Presença Digital & Domínio Próprio</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Site Pronto para Lançamento
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-[#0b101c] border border-blue-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <span className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold block mb-2">
            Proposta Comercial Exclusiva
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Coloque a {lead.title || 'sua empresa'} no ar com endereço oficial e tecnologia de ponta.
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-xl">
            Sua demonstração foi personalizada e aprovada. Agora você pode registrar seu domínio .com.br próprio, ativar os servidores globais e começar a receber pedidos e clientes diretamente pelo WhatsApp.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.08] text-xs font-mono">
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Hospedagem</span>
              <strong className="text-white">Inclusa (Vercel Edge)</strong>
            </div>
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Certificado SSL</span>
              <strong className="text-emerald-400">Segurança Ativa</strong>
            </div>
            <div className="bg-[#070a11] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-slate-500 block text-[10px] uppercase">Taxa Mensal</span>
              <strong className="text-white">R$ 0,00 (Sem Mensalidade)</strong>
            </div>
          </div>
        </div>

        {/* Escolha do Domínio */}
        <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold block mb-1">
              Registro de Titularidade
            </span>
            <h2 className="text-lg font-bold text-white">Escolha o seu endereço web oficial (.com.br)</h2>
            <p className="text-xs text-slate-300">
              O domínio será registrado com exclusividade no seu CPF ou CNPJ via Registro.br / ResellerClub:
            </p>
          </div>

          <div className="space-y-2.5">
            {domains.map((d: any, idx: number) => (
              <label
                key={idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedDomain === d.domain
                    ? 'bg-blue-600/10 border-blue-500/50 text-white'
                    : 'bg-[#070a11] border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 font-mono text-xs font-bold">
                  <input
                    type="radio"
                    name="domain_option"
                    checked={selectedDomain === d.domain}
                    onChange={() => setSelectedDomain(d.domain)}
                    className="accent-blue-500"
                  />
                  <span>{d.domain}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  DISPONÍVEL
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Termos de Uso e Aceite Obrigatório */}
        <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-5 shadow-xl">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => handleToggleTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer shrink-0"
            />
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed block">
                Li e concordo com os{' '}
                <a
                  href="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 inline-flex items-center gap-1"
                >
                  <span>Termos de Uso e Licenciamento de Presença Digital da Webbilly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                .
              </span>
              <p className="text-[11px] text-slate-400">
                O aceite eletrônico é registrado com endereço IP, data e hora nos termos da legislação brasileira vigente.
              </p>
            </div>
          </label>
        </div>

        {/* Pagamento Pix */}
        <div className={`bg-[#0b101c] border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-all ${!termsAccepted ? 'opacity-50 grayscale select-none pointer-events-none' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Pacote Completo • Domínio Próprio + Site por 1 Ano
              </span>
              <div className="text-3xl font-black text-white font-mono">
                R$ 490,00
              </div>
              <span className="text-xs text-slate-400">
                1 ano de domínio próprio incluso • Renovação anual de R$ 70,00/ano • Atualizações avulsas por R$ 29,90 (sem mensalidade obrigatória)
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Ativação Imediata via Pix
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center max-w-[220px] mx-auto">
              <img src={pix.qrCodeUrl} alt="QR Code Pix" className="w-44 h-44 object-contain" />
              <span className="text-[10px] font-mono text-zinc-900 font-bold mt-2">
                Escaneie com o app do seu banco
              </span>
            </div>

            {/* Copia e Cola */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Pix Copia e Cola
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={pix.payload || ''}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-slate-300 text-xs font-mono pr-24 focus:outline-none"
                  />
                  <button
                    onClick={copyPix}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 space-y-1 bg-[#070a11] p-3.5 rounded-xl border border-white/[0.06]">
                <div>Beneficiário: <strong className="text-white">{pix.name}</strong></div>
                <div>Identificador: <strong className="text-blue-400">{pix.txid}</strong></div>
                <div>Domínio selecionado: <strong className="text-emerald-400">{selectedDomain}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
