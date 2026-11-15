'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  Send,
  RefreshCw,
  Eye,
  FolderGit2,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Clock,
  Layers,
  Palette,
  AlertCircle,
  Building,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ActionTooltip } from '@/components/ui/ActionTooltip';

interface LeadResult {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  website?: string;
  hasWebsite?: boolean;
  opportunity?: 'HOT_NO_WEBSITE' | 'HAS_WEBSITE';
}

interface ProjectItem {
  id: string;
  slug: string;
  name: string;
  niche: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  subdomainUrl: string;
  previewUrl: string;
  proposalUrl: string;
  leadToken?: string;
  status: string;
  createdAt: string;
  operatorId?: string;
}

interface BillyWebStudioProps {
  role: 'operator' | 'admin';
  operatorId?: string;
  operatorName?: string;
  operatorEmail?: string;
}

const QUICK_NICHES = [
  'Barbearia',
  'Hamburgueria',
  'Pizzaria',
  'Odontologia',
  'Oficina Mecânica',
  'Pet Shop',
  'Salão de Beleza',
  'Academia',
  'Advogado',
  'Contabilidade',
  'Estética',
  'Imobiliária',
  'Confeitaria',
  'Lava Rápido',
  'Clínica Médica',
  'Restaurante Japonês',
  'Cafeteria',
  'Distribuidora de Gás',
  'Vidraçaria',
  'Marcenaria',
  'Tatuagem & Piercing',
  'Autoescola',
  'Consultoria de RH',
  'Segurança Eletrônica'
];

const THEME_OPTIONS = [
  { id: 'dark-neon', name: 'Escuro Neon (Lime)', primary: '#84cc16', bg: '#07090e', border: '#84cc16' },
  { id: 'corporate-blue', name: 'Azul Corporativo', primary: '#2563eb', bg: '#090d16', border: '#3b82f6' },
  { id: 'premium-gold', name: 'Dourado Premium', primary: '#f59e0b', bg: '#0d0b07', border: '#fbbf24' },
  { id: 'hot-orange', name: 'Laranja Quente', primary: '#ea580c', bg: '#0f0a07', border: '#f97316' },
  { id: 'purple-modern', name: 'Roxo Moderno', primary: '#7c3aed', bg: '#0c0714', border: '#8b5cf6' },
  { id: 'clean-dark', name: 'Minimalista Grafite', primary: '#10b981', bg: '#0a0d14', border: '#34d399' }
];

export default function BillyWebStudio({
  role,
  operatorId = 'OP-BILLY-01',
  operatorName = 'Operador Oficial',
  operatorEmail = 'operador@webbilly.com.br'
}: BillyWebStudioProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'prospectar' | 'estudio' | 'preview' | 'projetos'>('prospectar');

  // TAB 1: Leads
  const [nicheQuery, setNicheQuery] = useState('Barbearia');
  const [cityQuery, setCityQuery] = useState('São Paulo, SP');
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsList, setLeadsList] = useState<LeadResult[]>([]);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Lead fields
  const [manualName, setManualName] = useState('');
  const [manualNiche, setManualNiche] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // TAB 2: Studio / Site Form
  const [siteForm, setSiteForm] = useState({
    businessName: 'Barbearia Vintage Imperial',
    niche: 'Barbearia',
    city: 'São Paulo - SP',
    phone: '(11) 98765-4321',
    whatsapp: '11987654321',
    subdomain: 'barbearia-vintage-imperial',
    tagline: 'Cortes clássicos, barba na toalha quente e atendimento de primeira.',
    description: 'Espaço dedicado ao cavalheiro moderno com cerveja artesanal e os melhores barbeiros da região.',
    theme: 'dark-neon',
    services: [
      { name: 'Corte Tradicional', price: 'R$ 45,00', description: 'Corte com tesoura e máquina com finalização.' },
      { name: 'Barba Terapia', price: 'R$ 40,00', description: 'Toalha quente, óleos essenciais e navalha.' },
      { name: 'Combo Cabelo + Barba', price: 'R$ 75,00', description: 'Experiência completa com desconto exclusivo.' }
    ],
    features: [
      'Ambiente climatizado e confortável',
      'Wi-fi de alta velocidade e café expresso cortesia',
      'Agendamento rápido via WhatsApp',
      'Profissionais premiados com anos de experiência'
    ],
    hours: 'Segunda a Sábado das 09:00 às 20:00'
  });

  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  // TAB 3: Preview & Proposal
  const [previewSlug, setPreviewSlug] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [generatedResult, setGeneratedResult] = useState<{
    slug: string;
    subdomainUrl: string;
    previewUrl: string;
    proposalUrl: string;
    leadToken: string;
    whatsappMessage: string;
    phone: string;
  } | null>(null);

  const [customWaMessage, setCustomWaMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // TAB 4: Projects History
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // New service input in editor
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Auto slug generator from business name
  const handleBusinessNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSiteForm((prev) => ({ ...prev, businessName: name, subdomain: slug }));
  };

  // Load projects list
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const res = await fetch(`/api/studio/projetos?role=${role}&operatorId=${operatorId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('Erro ao carregar projetos:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Handler: Buscar Leads
  const handleSearchLeads = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nicheQuery) return;

    setLeadsLoading(true);
    setLeadsError(null);
    setLeadsList([]);

    try {
      const res = await fetch('/api/studio/buscar-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: nicheQuery, city: cityQuery, limit: 12 })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Falha ao buscar leads');
      }
      setLeadsList(data.leads || []);
      if (data.leads && data.leads.length === 0) {
        setShowManualForm(true);
      }
    } catch (err: any) {
      setLeadsError(err.message || 'Erro ao comunicar com o serviço de busca');
      setShowManualForm(true);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Handler: Select Lead to Generate
  const handleSelectLead = (lead: LeadResult) => {
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const cleanSlug = lead.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const niche = lead.category || nicheQuery || 'Comércio Local';
    const city = lead.city || cityQuery || 'Brasil';

    setSiteForm({
      businessName: lead.name,
      niche,
      city,
      phone: lead.phone || '',
      whatsapp: cleanPhone,
      subdomain: cleanSlug || 'site-' + Date.now().toString().slice(-4),
      tagline: `O melhor em ${niche} em ${city} com qualidade garantida.`,
      description: `Conheça nossos produtos e serviços de excelência. Atendimento exclusivo e satisfação garantida para você e sua família.`,
      theme: 'dark-neon',
      services: [
        { name: `Serviço Especial de ${niche}`, price: 'Consulte', description: 'Atendimento personalizado com máxima pontualidade.' },
        { name: 'Pacote Completo', price: 'Promoção', description: 'A melhor opção custo-benefício para suas necessidades.' },
        { name: 'Atendimento Rápido', price: 'Imediato', description: 'Fale conosco no WhatsApp e agende seu horário.' }
      ],
      features: [
        'Atendimento com profissionais especializados',
        'Facilidade de pagamento em Pix e Cartão',
        'Ambiente agradável e suporte prioritário',
        'Pontualidade e garantia em todos os serviços'
      ],
      hours: 'Segunda a Sábado das 08:30 às 19:00'
    });

    setActiveTab('estudio');
  };

  // Handler: Select Manual Lead
  const handleCreateFromManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName) return;

    handleSelectLead({
      name: manualName,
      category: manualNiche || nicheQuery,
      city: manualCity || cityQuery,
      phone: manualPhone,
      opportunity: 'HOT_NO_WEBSITE'
    });
  };

  // Add custom service
  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setSiteForm((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: newServiceName.trim(),
          price: newServicePrice.trim() || 'Sob Consulta',
          description: 'Qualidade e atendimento diferenciado.'
        }
      ]
    }));
    setNewServiceName('');
    setNewServicePrice('');
  };

  // Remove service
  const handleRemoveService = (index: number) => {
    setSiteForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // Handler: Gerar Site com IA
  const handleGenerateSite = async () => {
    if (!siteForm.businessName.trim() || !siteForm.subdomain.trim()) {
      alert('Por favor informe o Nome do Negócio e o Subdomínio.');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGenerationStep('Iniciando Inteligência Artificial do Billy...');

    try {
      setTimeout(() => setGenerationStep('Buscando fotos profissionais em alta resolução...'), 1200);
      setTimeout(() => setGenerationStep('Redigindo copywriting persuasivo e estrutura de alta conversão...'), 2600);
      setTimeout(() => setGenerationStep('Publicando no subdomínio oficial *.webbilly.com.br...'), 4200);
      setTimeout(() => setGenerationStep('Gerando proposta comercial e link de fechamento com Pix...'), 5800);

      const res = await fetch('/api/studio/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: siteForm.businessName,
          niche: siteForm.niche,
          city: siteForm.city,
          phone: siteForm.phone,
          whatsapp: siteForm.whatsapp,
          subdomain: siteForm.subdomain,
          tagline: siteForm.tagline,
          description: siteForm.description,
          theme: siteForm.theme,
          services: siteForm.services,
          features: siteForm.features,
          hours: siteForm.hours,
          operatorId,
          operatorName
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar site');
      }

      setGeneratedResult({
        slug: data.slug,
        subdomainUrl: data.subdomainUrl,
        previewUrl: data.previewUrl,
        proposalUrl: data.proposalUrl,
        leadToken: data.leadToken,
        whatsappMessage: data.whatsappMessage,
        phone: siteForm.whatsapp || siteForm.phone
      });

      setCustomWaMessage(data.whatsappMessage || '');
      setPreviewSlug(data.slug);
      setActiveTab('preview');
      loadProjects();
    } catch (err: any) {
      setGenerationError(err.message || 'Erro inesperado durante a geração.');
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  // Copy helper
  const handleCopy = (text: string, type: 'link' | 'msg') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    }
  };

  // Open WhatsApp Link
  const handleOpenWhatsApp = () => {
    if (!generatedResult) return;
    const clean = (generatedResult.phone || '').replace(/\D/g, '');
    const phoneParam = clean ? (clean.startsWith('55') ? clean : `55${clean}`) : '';
    const textParam = encodeURIComponent(customWaMessage || generatedResult.whatsappMessage);
    const waUrl = phoneParam
      ? `https://wa.me/${phoneParam}?text=${textParam}`
      : `https://wa.me/?text=${textParam}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          CABEÇALHO NEON DO BILLY STUDIO WEB
         ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1017] via-[#101522] to-[#07090e] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/40 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Billy Studio Web 100% em Nuvem</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#84cc16]/30 text-white font-mono">
                {role === 'admin' ? 'MASTER ADMIN' : 'OPERADOR OFICIAL'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Billy Studio Web</span>
              <span className="text-[#84cc16]">IA & Propostas</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Prospecte comércios locais, gere sites profissionais em segundos com IA, publique no subdomínio oficial{' '}
              <span className="text-[#84cc16] font-mono">*.webbilly.com.br</span> e envie propostas persuasivas no WhatsApp direto do navegador.
            </p>
          </div>

          {/* Badge de Operador & Atalhos Rápidos */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-black/50 border border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center text-[#84cc16]">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Operador Ativo</span>
                <span className="text-xs font-bold text-white font-mono">{operatorName}</span>
              </div>
            </div>

            <ActionTooltip
              title="Meus Projetos"
              description="Veja todos os sites criados pelo estúdio e seus respectivos links de proposta."
              side="bottom"
            >
              <button
                onClick={() => {
                  loadProjects();
                  setActiveTab('projetos');
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-zinc-200 hover:text-white transition flex items-center gap-2 cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4 text-[#84cc16]" />
                <span>Projetos ({projects.length})</span>
              </button>
            </ActionTooltip>
          </div>
        </div>

        {/* =========================================================================
            BARRA DE NAVEGAÇÃO DAS 4 ETAPAS DO ESTÚDIO
           ========================================================================= */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab('prospectar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'prospectar'
                ? 'bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>1. Prospectar Leads</span>
            {leadsList.length > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'prospectar' ? 'bg-black/20 text-black' : 'bg-[#84cc16]/20 text-[#a3e635]'}`}>
                {leadsList.length}
              </span>
            )}
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab('estudio')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'estudio'
                ? 'bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Gerador & IA</span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>3. Preview & Proposta</span>
            {previewSlug && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'preview' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {previewSlug}
              </span>
            )}
          </button>

          {/* Tab 4 */}
          <button
            onClick={() => {
              loadProjects();
              setActiveTab('projetos');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'projetos'
                ? 'bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>4. Meus Projetos</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${activeTab === 'projetos' ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-300'}`}>
              {projects.length}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PROSPECÇÃO DE LEADS COM IA & MAPS
         ========================================================================= */}
      {activeTab === 'prospectar' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#84cc16]" />
                <span>Radar de Oportunidades no Google Maps</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Localize estabelecimentos comerciais da sua cidade com alta propensão de fechamento (comércios sem site oficial próprio).
              </p>
            </div>

            {/* Quick Niches Carousel / Pills */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
                Sugestões Rápidas de Nicho (Clique para preencher):
              </span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 scrollbar-thin">
                {QUICK_NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNicheQuery(n)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                      nicheQuery.toLowerCase() === n.toLowerCase()
                        ? 'bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/50 shadow-md shadow-lime-950/40 font-bold'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/[0.06]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchLeads} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Ramo / Nicho de Atuação</label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={nicheQuery}
                    onChange={(e) => setNicheQuery(e.target.value)}
                    placeholder="Ex: Barbearia, Pet Shop, Hamburgueria"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Cidade e Estado</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Ex: Campinas - SP, Curitiba - PR"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={leadsLoading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#84cc16] hover:bg-[#9ae639] text-black transition shadow-[0_0_20px_rgba(132,204,22,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {leadsLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Buscar Leads</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {leadsError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{leadsError} — Você também pode cadastrar um comércio manualmente abaixo.</span>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {leadsList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Leads Encontrados ({leadsList.length})</span>
                  <span className="text-xs text-zinc-400 font-normal">Clique em "Selecionar" para gerar o site deste comércio</span>
                </h3>

                <button
                  type="button"
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="text-xs text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar comércio manual</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadsList.map((lead, idx) => {
                  const isHot = lead.opportunity === 'HOT_NO_WEBSITE';
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl bg-[#0f121a] border transition-all duration-200 flex flex-col justify-between space-y-4 group ${
                        isHot
                          ? 'border-[#84cc16]/40 shadow-lg shadow-lime-950/30 hover:border-[#84cc16]'
                          : 'border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Opportunity Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                            {lead.category || nicheQuery}
                          </span>

                          {isHot ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/40 animate-pulse">
                              <Flame className="w-3 h-3 text-[#84cc16]" />
                              <span>Sem Site Próprio 🔥</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-zinc-400">
                              Possui site externo
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-white text-base group-hover:text-[#84cc16] transition leading-snug">
                          {lead.name}
                        </h4>

                        <div className="space-y-1 text-xs text-zinc-400">
                          {lead.address && (
                            <p className="flex items-start gap-1.5 line-clamp-2">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-500 mt-0.5" />
                              <span>{lead.address}</span>
                            </p>
                          )}
                          {lead.phone && (
                            <p className="flex items-center gap-1.5 font-mono text-zinc-300">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                              <span>{lead.phone}</span>
                            </p>
                          )}
                          {lead.rating !== undefined && (
                            <p className="text-[11px] text-amber-400 font-semibold">
                              ★ {lead.rating.toFixed(1)} ({lead.reviews || 0} avaliações no Google)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <ActionTooltip
                          title="Geração Rápida"
                          description="Transfere os dados desse comércio para o Gerador com IA e monta a proposta comercial."
                          side="top"
                          className="w-full"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectLead(lead)}
                            className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#84cc16]/15 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Gerar Site com IA</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                          </button>
                        </ActionTooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Manual de Cadastro de Lead */}
          {(showManualForm || leadsList.length === 0) && (
            <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#84cc16]" />
                    <span>Cadastrar Comércio Manualmente</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Se você já tem o contato de um cliente ou estabelecimento em mente, digite abaixo para gerar o site agora.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateFromManual} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Nome do Estabelecimento</label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Ex: Hamburgueria do João"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Nicho / Categoria</label>
                  <input
                    type="text"
                    value={manualNiche}
                    onChange={(e) => setManualNiche(e.target.value)}
                    placeholder="Ex: Hamburgueria Artesanal"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Cidade / Bairro</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="Ex: Campinas - SP"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">WhatsApp do Dono</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition shrink-0 cursor-pointer"
                    >
                      Criar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GERADOR DE SITES & IA STUDIO
         ========================================================================= */}
      {activeTab === 'estudio' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#84cc16]" />
                  <span>Configuração e Geração com Inteligência Artificial</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Revise e customize os dados do comércio. A IA cuidará da redação, paleta de cores e fotos em alta resolução.
                </p>
              </div>

              {/* Botão de Disparo */}
              <button
                type="button"
                onClick={handleGenerateSite}
                disabled={generating}
                className="py-3 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:brightness-110 text-black shadow-[0_0_25px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gerando Site com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>🚀 Gerar Site Completo & Publicar</span>
                  </>
                )}
              </button>
            </div>

            {/* Status da Geração / Spinner */}
            {generating && (
              <div className="p-5 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#84cc16] shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Etapa em andamento:</h4>
                  <p className="text-sm font-semibold text-[#a3e635] mt-0.5">{generationStep}</p>
                </div>
              </div>
            )}

            {generationError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{generationError}</span>
              </div>
            )}

            {/* Formulário Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna 1: Dados Principais */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Nome Oficial do Estabelecimento</label>
                  <input
                    type="text"
                    value={siteForm.businessName}
                    onChange={(e) => handleBusinessNameChange(e.target.value)}
                    placeholder="Ex: Barbearia Vintage Imperial"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Nicho / Atividade</label>
                    <input
                      type="text"
                      value={siteForm.niche}
                      onChange={(e) => setSiteForm({ ...siteForm, niche: e.target.value })}
                      placeholder="Ex: Barbearia"
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Cidade e Estado</label>
                    <input
                      type="text"
                      value={siteForm.city}
                      onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                      placeholder="Ex: São Paulo - SP"
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">Telefone com DDD</label>
                    <input
                      type="text"
                      value={siteForm.phone}
                      onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300">WhatsApp (apenas números)</label>
                    <input
                      type="text"
                      value={siteForm.whatsapp}
                      onChange={(e) => setSiteForm({ ...siteForm, whatsapp: e.target.value.replace(/\D/g, '') })}
                      placeholder="11987654321"
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>
                </div>

                {/* Subdomínio Oficial */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>Subdomínio Oficial Gratuito</span>
                    <span className="text-[10px] text-[#84cc16] font-mono">*.webbilly.com.br</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-[#07090e] border border-white/[0.1] overflow-hidden focus-within:border-[#84cc16]">
                    <span className="pl-3 text-xs text-zinc-500 font-mono">https://</span>
                    <input
                      type="text"
                      value={siteForm.subdomain}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                        })
                      }
                      placeholder="barbearia-vintage"
                      className="w-full bg-transparent px-1 py-2.5 text-xs text-white font-mono font-bold focus:outline-none"
                    />
                    <span className="pr-3 text-xs text-[#84cc16] font-mono font-bold shrink-0">.webbilly.com.br</span>
                  </div>
                </div>

                {/* Slogan & Descrição */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Chamada Principal (Slogan / Headline)</label>
                  <input
                    type="text"
                    value={siteForm.tagline}
                    onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                    placeholder="Ex: Cortes clássicos e atendimento de primeira linha"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Descrição Institucional</label>
                  <textarea
                    rows={3}
                    value={siteForm.description}
                    onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                </div>
              </div>

              {/* Coluna 2: Paleta de Cores, Serviços e Diferenciais */}
              <div className="space-y-5">
                {/* Tema / Cores */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#84cc16]" />
                    <span>Estilo Visual e Paleta de Cores</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSiteForm({ ...siteForm, theme: theme.id })}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          siteForm.theme === theme.id
                            ? 'bg-white/[0.08] border-[#84cc16] shadow-md shadow-lime-950/40'
                            : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span className="text-[11px] font-bold text-white truncate">{theme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Serviços & Preços */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#84cc16]" />
                      <span>Serviços / Produtos Oferecidos</span>
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">{siteForm.services.length} adicionados</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {siteForm.services.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{srv.name}</span>
                            <span className="text-[10px] font-mono text-[#84cc16] bg-[#84cc16]/10 px-1.5 py-0.2 rounded border border-[#84cc16]/30">
                              {srv.price}
                            </span>
                          </div>
                          {srv.description && (
                            <p className="text-[11px] text-zinc-400 truncate">{srv.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add service mini-form */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Novo serviço..."
                      className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    />
                    <input
                      type="text"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      placeholder="R$ 50"
                      className="w-24 bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16]/20 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition cursor-pointer"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>

                {/* Horário de Atendimento */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#84cc16]" />
                    <span>Horário de Funcionamento</span>
                  </label>
                  <input
                    type="text"
                    value={siteForm.hours}
                    onChange={(e) => setSiteForm({ ...siteForm, hours: e.target.value })}
                    placeholder="Segunda a Sábado das 08:00 às 19:00"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PREVIEW AO VIVO & PROPOSTA COMERCIAL NO WHATSAPP
         ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {previewSlug ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna da Esquerda / Centro: Iframe Preview Split-Screen */}
              <div className="lg:col-span-8 space-y-3">
                {/* Barra de Controles do Preview */}
                <div className="p-3.5 rounded-2xl bg-[#0e121b] border border-white/[0.08] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-zinc-400 font-semibold pl-2 hidden sm:inline">
                      https://{previewSlug}.webbilly.com.br
                    </span>
                  </div>

                  {/* Switcher Desktop / Mobile */}
                  <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/[0.06]">
                    <ActionTooltip title="Visualização Desktop" description="Ver o site em tela cheia para computadores." side="bottom">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          previewDevice === 'desktop'
                            ? 'bg-[#84cc16] text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    </ActionTooltip>

                    <ActionTooltip title="Visualização Mobile" description="Ver o site simulado em tela de smartphone (375px)." side="bottom">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          previewDevice === 'mobile'
                            ? 'bg-[#84cc16] text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </ActionTooltip>
                  </div>

                  {/* Ações Rápidas do Preview */}
                  <div className="flex items-center gap-2">
                    <ActionTooltip title="Abrir em Nova Aba" description="Abre o subdomínio oficial do site em nova aba do navegador." side="bottom">
                      <a
                        href={`https://${previewSlug}.webbilly.com.br`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white border border-white/[0.08] flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#84cc16]" />
                        <span className="hidden sm:inline">Abrir Oficial</span>
                      </a>
                    </ActionTooltip>
                  </div>
                </div>

                {/* Container do Iframe */}
                <div className="flex justify-center bg-[#07090e] border border-white/[0.08] rounded-3xl p-4 overflow-hidden min-h-[640px]">
                  <div
                    className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl ${
                      previewDevice === 'mobile'
                        ? 'w-[375px] h-[667px] ring-8 ring-zinc-800'
                        : 'w-full h-[720px]'
                    }`}
                  >
                    <iframe
                      src={`/api/public/site/${previewSlug}/render`}
                      title="Preview do Site"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Card de Fechamento de Venda & WhatsApp Copy */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-6 rounded-3xl bg-[#0e121b] border border-[#84cc16]/40 shadow-xl space-y-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30">
                      Fechamento da Venda
                    </span>
                    <h3 className="text-base font-black text-white mt-2">
                      Proposta Comercial Pronta!
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Envie a demonstração diretamente para o dono do comércio pelo WhatsApp e receba 50% de comissão recorrente.
                    </p>
                  </div>

                  {/* Link da Proposta */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
                      Link da Proposta com Pix Integrado (R$ 29,90/mês)
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://webbilly.com.br/proposta/${generatedResult?.leadToken || previewSlug}`}
                        className="w-full bg-transparent text-xs text-white font-mono truncate focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `https://webbilly.com.br/proposta/${generatedResult?.leadToken || previewSlug}`,
                            'link'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#84cc16]/15 hover:bg-[#84cc16]/30 text-[#84cc16] text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mensagem Persuasiva do WhatsApp */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Copywriting Persuasivo (WhatsApp)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(customWaMessage, 'msg')}
                        className="text-[11px] text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMsg ? 'Copiado!' : 'Copiar Texto'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={8}
                      value={customWaMessage}
                      onChange={(e) => setCustomWaMessage(e.target.value)}
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-2xl p-3 text-xs text-zinc-200 leading-relaxed font-sans focus:outline-none focus:border-[#84cc16]"
                    />
                    <p className="text-[10px] text-zinc-500">
                      💡 Dica: Os links possuem quebra de linha dupla para o WhatsApp exibir miniatura visual automática.
                    </p>
                  </div>

                  {/* Botão de Envio WhatsApp com wa.me */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 via-[#84cc16] to-emerald-600 hover:brightness-110 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer transition animate-pulse"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar no WhatsApp do Dono</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('estudio')}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      Editar Dados no Estúdio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0e121b] border border-white/[0.06] rounded-3xl space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Nenhum site em visualização no momento</h3>
              <p className="text-xs text-zinc-400">
                Gere um site na aba "2. Gerador & IA" ou selecione um projeto já criado na aba "4. Meus Projetos" para visualizar e disparar no WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('estudio')}
                className="py-2.5 px-5 rounded-xl font-bold text-xs bg-[#84cc16] hover:bg-[#9ae639] text-black transition cursor-pointer"
              >
                Ir para o Gerador com IA
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: HISTÓRICO DE PROJETOS GERADOS
         ========================================================================= */}
      {activeTab === 'projetos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#84cc16]" />
                <span>Projetos Gerados no Billy Studio ({projects.length})</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Acompanhe os sites criados, acerte propostas comerciais e reenvie mensagens pelo WhatsApp.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProjects}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${projectsLoading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="bg-[#0e121b] border border-white/[0.06] rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3 px-4">Negócio / Cliente</th>
                      <th className="py-3 px-4">Nicho</th>
                      <th className="py-3 px-4">Subdomínio Oficial</th>
                      <th className="py-3 px-4">WhatsApp</th>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block">{proj.name}</span>
                          <span className="text-[10px] text-zinc-400">{proj.city || 'Brasil'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-300 border border-white/[0.06]">
                            {proj.niche}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          <a
                            href={proj.subdomainUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#84cc16] hover:underline flex items-center gap-1"
                          >
                            <span>{proj.slug}.webbilly.com.br</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">
                          {proj.whatsapp || proj.phone || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-zinc-400">
                          {new Date(proj.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <ActionTooltip title="Carregar no Preview" description="Abre este projeto no painel de preview e fechamento." side="left">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewSlug(proj.slug);
                                  setGeneratedResult({
                                    slug: proj.slug,
                                    subdomainUrl: proj.subdomainUrl,
                                    previewUrl: proj.previewUrl,
                                    proposalUrl: proj.proposalUrl,
                                    leadToken: proj.leadToken || proj.id,
                                    whatsappMessage: `Olá, tudo bem? Sou da equipe da Webbilly e criamos uma demonstração exclusiva para a *${proj.name}*!\n\nVocê pode ver o site completo aqui:\n${proj.subdomainUrl}\n\nE conferir a proposta especial com 50% de desconto aqui:\n${proj.proposalUrl}\n\nFicamos à disposição para ativar seu domínio oficial!`,
                                    phone: proj.whatsapp || proj.phone || ''
                                  });
                                  setCustomWaMessage(
                                    `Olá, tudo bem? Sou da equipe da Webbilly e criamos uma demonstração exclusiva para a *${proj.name}*!\n\nVocê pode ver o site completo aqui:\n${proj.subdomainUrl}\n\nE conferir a proposta especial com 50% de desconto aqui:\n${proj.proposalUrl}\n\nFicamos à disposição para ativar seu domínio oficial!`
                                  );
                                  setActiveTab('preview');
                                }}
                                className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#84cc16] hover:text-black text-zinc-300 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </ActionTooltip>

                            <ActionTooltip title="Copiar Link da Proposta" description="Copia a URL de proposta comercial do cliente." side="left">
                              <button
                                type="button"
                                onClick={() => handleCopy(proj.proposalUrl, 'link')}
                                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </ActionTooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0e121b] border border-white/[0.06] rounded-3xl space-y-3">
              <FolderGit2 className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">Nenhum projeto registrado ainda</h3>
              <p className="text-xs text-zinc-500">
                Use as abas "1. Prospectar Leads" e "2. Gerador & IA" para criar seu primeiro site em segundos.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
