'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Key,
  Copy,
  Download,
  PlayCircle,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  Laptop,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileText,
  Video,
  Award,
  Globe,
  Lock,
  KeyRound,
  AlertTriangle,
  X
} from 'lucide-react';

export default function OperatorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'training' | 'sales'>('overview');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Troca Obrigatória de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação de senha não confere.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/operator/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (data && data.operator) {
          setData({
            ...data,
            operator: { ...data.operator, mustChangePassword: false }
          });
        }
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/operator/overview');
      if (res.status === 401 || res.status === 403) {
        router.push('/operador/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setData(json);
      if (json.operator?.mustChangePassword) {
        setShowPasswordModal(true);
      }
      if (json.trainingModules?.length > 0) {
        setSelectedVideo(json.trainingModules[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do operador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/operador/login');
  };

  const handleCopySerial = () => {
    if (!data?.operator?.serialToken) return;
    navigator.clipboard.writeText(data.operator.serialToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Carregando Painel do Operador...</span>
        </div>
      </div>
    );
  }

  const op = data?.operator;
  const stats = data?.stats;
  const license = data?.license;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-16">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-lg">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">Painel do Operador</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {op?.id}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">{op?.name} • Billy Suite Comercial</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Alterar senha de acesso"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Minha Conta / Alterar Senha</span>
            </button>

            {(data?.isMaster || op?.email === 'admin@billysuite.com.br' || op?.id === 'OP-0001') && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:brightness-110 shadow-lg shadow-indigo-600/20 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Painel Master Admin
              </Link>
            )}
            <button
              onClick={loadData}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-zinc-800"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* CARD PRINCIPAL DO TOKEN SERIAL DE ATIVAÇÃO */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-purple-950/40 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
                <Key className="w-3.5 h-3.5" />
                Seu Token Serial Oficial do Billy Suite Desktop
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-700 select-all">
                  {op?.serialToken}
                </span>
                <button
                  onClick={handleCopySerial}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Serial Copiado!' : 'Copiar Serial'}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Insira este token na tela de ativação inicial do software <strong>Billy Suite Desktop</strong> no seu computador.
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 text-xs space-y-1.5 shrink-0 min-w-[260px]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Status da Licença:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {license?.status || op?.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Computador:</span>
                <span className="font-mono text-zinc-300">{op?.machineId || 'Ainda não vinculado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Última Sincronização:</span>
                <span className="font-mono text-zinc-400">
                  {op?.lastSync ? new Date(op.lastSync).toLocaleTimeString('pt-BR') : 'Nunca'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARDS DE RESUMO FINANCEIRO E RECORRÊNCIA SAAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold">Sites Ativos (SaaS)</span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.activeSubscriptionsCount ?? stats?.salesCount ?? 0} sites
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">no ar via subdomínio</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">Comissão Mensal (MRR)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00
            </div>
            <span className="text-[10px] text-zinc-500">R$ 10,00/mês por cliente ativo</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-teal-400 font-semibold">Comissões Acumuladas</span>
            <div className="text-2xl font-black text-teal-400 mt-1">
              R$ {stats?.totalCommissions?.toLocaleString('pt-BR') || 0},00
            </div>
            <span className="text-[10px] text-zinc-500">Total histórico registrado</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">Chave Pix de Repasse</span>
            <div className="text-sm font-black text-white mt-2 truncate">
              {op?.pixKey || 'Não cadastrada'}
            </div>
            <span className="text-[10px] text-zinc-500 uppercase">{op?.pixType || 'Pix'} cadastrado</span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS DO OPERADOR */}
        <div className="flex border-b border-zinc-800 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-emerald-500 text-white bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Download do App & Guia
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'subscriptions'
                ? 'border-sky-500 text-white bg-sky-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            Sites Ativos (SaaS)
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
              {stats?.activeSubscriptionsCount || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'training'
                ? 'border-emerald-500 text-white bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-4 h-4" />
            Área de Treinamento
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              4 Aulas
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'sales'
                ? 'border-emerald-500 text-white bg-emerald-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Minhas Vendas & Extrato Pix
          </button>
        </div>

        {/* CONTEÚDO 1: DOWNLOAD DO INSTALADOR */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card de Download */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Instalador Oficial Billy Suite Desktop</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Versão atualizada v{data?.installer?.version || '2.0.4'} para Windows 10/11 64-bit. Inclui módulo scraper Google Maps, gerador de sites Gemini IA e servidor local integrado.
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1 font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Arquivo:</span> <span className="text-zinc-200">{data?.installer?.fileName}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Tamanho:</span> <span className="text-zinc-200">{data?.installer?.fileSize}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Atualização:</span> <span className="text-zinc-200">{data?.installer?.releaseDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={data?.installer?.downloadUrl}
                    download
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Billy Suite Desktop (.exe)
                  </a>
                </div>
              </div>

              {/* Guia Rápido de Instalação */}
              <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Passo a Passo de Instalação & Ativação
                </h3>

                <ol className="space-y-4 text-xs text-zinc-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <strong className="text-white block font-semibold">Baixe e execute o instalador Billy Suite:</strong>
                      Faça o download do aplicativo oficial para Windows 10/11 e conclua a instalação no seu computador.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <strong className="text-white block font-semibold">Insira o Token Serial recebido:</strong>
                      Cole sua chave de ativação oficial <code className="text-indigo-300 font-bold font-mono">{op?.serialToken}</code> para desbloquear o sistema.
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-sky-400 font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <strong className="text-white block font-semibold">Gere e publique o site instantaneamente:</strong>
                      Cada site do cliente fica online no subdomínio oficial <code className="text-sky-300 font-mono font-bold">slug.webbilly.com.br</code> com assinatura de R$ 29,90/mês e comissão recorrente de R$ 10,00/mês para você.
                    </div>
                  </li>
                </ol>

                <div className="mt-6 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Dúvidas técnicas? Acesse a aba de <strong>Treinamento</strong> para assistir à aula em vídeo.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO: ASSINATURAS RECORRENTES SAAS (SITES ATIVOS) */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Seus Clientes no Modelo SaaS Recorrente
                </span>
                <p className="text-xs text-zinc-300 mt-1">
                  Cada cliente ativo gera <strong>R$ 10,00/mês</strong> de comissão recorrente repassada para sua chave Pix.
                </p>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                MRR Atual: <strong className="text-emerald-400 font-bold">R$ {(stats?.monthlyCommissionMRR ?? ((stats?.activeSubscriptionsCount ?? 0) * 10)).toLocaleString('pt-BR')},00 / mês</strong>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Subdomínio Oficial</th>
                      <th className="py-3 px-4">Cliente / Estabelecimento</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">Mensalidade</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.subscriptions || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Nenhum cliente ativo no momento. Dispare demonstrações no Billy Desktop com o link de checkout!
                        </td>
                      </tr>
                    ) : (
                      (data?.subscriptions || []).map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-zinc-800/40 transition">
                          <td className="py-3.5 px-4 font-mono">
                            <a
                              href={`https://${sub.slug}.webbilly.com.br`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-sky-400 hover:underline flex items-center gap-1.5"
                            >
                              <span>{sub.slug}.webbilly.com.br</span>
                              <ExternalLink className="w-3 h-3 text-sky-400" />
                            </a>
                            <span className="text-[10px] text-zinc-500">ID: {sub.id}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-white block">{sub.clientName}</span>
                            <span className="text-[11px] text-zinc-400">{sub.planName || 'Assinatura Mensal'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {sub.clientPhone || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-white font-bold">R$ {sub.monthlyPrice?.toFixed(2)}/mês</span>
                            <span className="text-[10px] text-emerald-400 block font-semibold">+R$ {sub.operatorCommissionMonthly?.toFixed(2)} repasse</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                sub.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : sub.status === 'suspended'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {sub.status === 'active' ? '● No Ar (Ativo)' : sub.status === 'suspended' ? '● Suspenso (Inadimplente)' : '● Pendente'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://webbilly.com.br/api/subscription/create-checkout?slug=${sub.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-[11px] transition"
                                title="Link de Pagamento / Assinatura"
                              >
                                Link Checkout
                              </a>
                              <a
                                href={`https://${sub.slug}.webbilly.com.br`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30"
                                title="Ver Site Online"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
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

        {/* CONTEÚDO 2: ÁREA DE TREINAMENTO COM PLAYER DE VÍDEO */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player do Vídeo Selecionado */}
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl relative">
                  {selectedVideo ? (
                    <iframe
                      src={selectedVideo.videoUrl}
                      title={selectedVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      Selecione uma aula na lista ao lado.
                    </div>
                  )}
                </div>

                {selectedVideo && (
                  <div className="glass-panel p-6 rounded-2xl border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        {selectedVideo.duration}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {selectedVideo.description}
                    </p>

                    {selectedVideo.downloadAttachment && (
                      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>Material de Apoio: <strong>{selectedVideo.downloadAttachment}</strong></span>
                        </div>
                        <button
                          onClick={() => alert('Download do material iniciado.')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white transition flex items-center gap-1.5 border border-zinc-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Baixar Anexo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Playlist de Aulas */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Grade Curricular do Operador
                </h3>

                {(data?.trainingModules || []).map((mod: any, idx: number) => {
                  const isCurrent = selectedVideo?.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedVideo(mod)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-600/10'
                          : 'glass-card border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCurrent ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">{mod.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {mod.duration}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO 3: MINHAS VENDAS & EXTRATO PIX */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Card com os dados do Pix do Operador */}
            <div className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Chave Pix Cadastrada para Recebimento
                </span>
                <div className="text-sm font-mono text-white mt-1">
                  Tipo: <strong className="uppercase">{op?.pixType}</strong> • Chave: <strong className="text-emerald-400">{op?.pixKey}</strong>
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                Pagamentos liquidados via Pix diretamente após a confirmação do cliente.
              </div>
            </div>

            {/* Tabela de Vendas do Operador */}
            <div className="glass-panel rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Data / ID Venda</th>
                      <th className="py-3 px-4">Cliente / Estabelecimento</th>
                      <th className="py-3 px-4">Nicho</th>
                      <th className="py-3 px-4">Valor Total</th>
                      <th className="py-3 px-4">Sua Comissão</th>
                      <th className="py-3 px-4 text-right">Status do Pix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {(data?.sales || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">
                          Você ainda não registrou vendas. Abra o app Billy Suite Desktop e gere suas primeiras propostas!
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
                            <div className="font-semibold text-white">{s.clientName}</div>
                            {s.siteUrl && (
                              <a
                                href={s.siteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-indigo-400 hover:underline inline-flex items-center gap-1"
                              >
                                Ver Site Entregue <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">{s.niche || 'Geral'}</td>
                          <td className="py-3.5 px-4 font-bold text-white font-mono">
                            R$ {s.saleValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 font-black text-emerald-400 font-mono text-sm">
                            R$ {s.commissionValue?.toLocaleString('pt-BR')},00
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                s.pixStatus === 'PAGO'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {s.pixStatus === 'PAGO' ? 'Comissão Paga via Pix' : 'Aguardando Pagamento Pix'}
                            </span>
                            {s.pixProof && (
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Compr: {s.pixProof}
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
          </div>
        )}
      </main>

      {/* MODAL DE TROCA DE SENHA (PRIMEIRO ACESSO OU MANUAL) */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            {!data?.operator?.mustChangePassword && (
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-black text-white">
                {data?.operator?.mustChangePassword ? 'Troca Obrigatória de Senha' : 'Minha Conta • Alterar Senha'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {data?.operator?.mustChangePassword
                  ? `Olá, ${data?.operator?.name}! Por questões de segurança no primeiro acesso com senha provisória, defina sua senha definitiva.`
                  : 'Atualize sua senha de acesso ao portal do operador corporativo.'}
              </p>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">Senha Salva com Sucesso!</div>
                <p className="text-xs text-zinc-400">Suas credenciais já estão atualizadas.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                {!data?.operator?.mustChangePassword && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Sua senha atual"
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Salvar Nova Senha
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
