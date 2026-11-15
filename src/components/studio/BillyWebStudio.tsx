'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  Smartphone,
  Tablet,
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
  Flame,
  ArrowRight,
  Wand2,
  ImageIcon,
  Upload,
  Bot,
  Zap,
  Sliders,
  Maximize2
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

// 20 Templates Oficiais do Billy Desktop
const DESKTOP_TEMPLATES = [
  {
    id: 'barbearia-crop-vintage',
    name: 'Crop Vintage',
    niche: 'Barbearia',
    badge: 'Vintage & Navalha',
    desc: 'Estilo clássico em madeira, navalha tradicional e ambiente cavalheiro.',
    accent: '#d4af37',
    previewImg: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'barbearia-barberon-moderno',
    name: 'BarberOn VIP',
    niche: 'Barbearia',
    badge: 'Moderno & Neon',
    desc: 'Layout urbano arrojado com cortes degradê, tatuagem e cerveja artesanal.',
    accent: '#84cc16',
    previewImg: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'estetica-pureglow-spa',
    name: 'PureGlow Spa',
    niche: 'Estética',
    badge: 'Beleza & Harmonização',
    desc: 'Tons suaves, massagens, estética facial e clínica de alto padrão.',
    accent: '#ec4899',
    previewImg: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'odontologia-dentia-clinica',
    name: 'Dentia Clínica',
    niche: 'Odontologia',
    badge: 'Implantes & Sorriso',
    desc: 'Autoridade médica, clareamento, lentes de contato dental e equipe cirúrgica.',
    accent: '#0ea5e9',
    previewImg: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'medico-medicalguide-clinica',
    name: 'MedicalGuide',
    niche: 'Saúde & Médicos',
    badge: 'Consultas & Exames',
    desc: 'Clínica médica multidisciplinar, agendamentos e prontuário online.',
    accent: '#10b981',
    previewImg: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'restaurante-foores-gourmet',
    name: 'FooRes Gourmet',
    niche: 'Gastronomia',
    badge: 'Alta Culinária',
    desc: 'Cardápio interativo, reservas de mesa, pratos autorais e adega de vinhos.',
    accent: '#ea580c',
    previewImg: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'restaurante-sumi-culinaria',
    name: 'Sumi Japanese',
    niche: 'Sushi & Japonês',
    badge: 'Oriental & Rodízio',
    desc: 'Rodízio japonês, sushis artesanais, delivery e combos especiais.',
    accent: '#ef4444',
    previewImg: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'bistro-granny-cafe',
    name: 'Granny Café',
    niche: 'Cafeteria & Confeitaria',
    badge: 'Brunch & Bolos',
    desc: 'Cafés especiais, tortas artesanais, ambiente aconchegante para fotos.',
    accent: '#b45309',
    previewImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'petshop-petly-veterinaria',
    name: 'Petly Animal Care',
    niche: 'Pet Shop',
    badge: 'Banho, Tosa & Vet',
    desc: 'Táxi dog, banho com hidratação, rações premium e consultas veterinárias.',
    accent: '#f59e0b',
    previewImg: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'autoescola-drivepro',
    name: 'DrivePro CFC',
    niche: 'Autoescola',
    badge: 'Habilitação A/B',
    desc: 'Primeira CNH, simulador, instrutores pacientes e frota de carros novos.',
    accent: '#eab308',
    previewImg: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'serralheria-welbim-soldagem',
    name: 'Welbim Serralheria',
    niche: 'Serralheria & Obras',
    badge: 'Portões & Estruturas',
    desc: 'Portões basculantes, grades de proteção e estruturas metálicas pesadas.',
    accent: '#64748b',
    previewImg: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'consultoria-financeira-fo',
    name: 'FinancePro Corp',
    niche: 'Consultoria & Contabilidade',
    badge: 'Fiscal & B2B',
    desc: 'Abertura de empresas, assessoria tributária e planejamento de lucros.',
    accent: '#2563eb',
    previewImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'commercial-vibrant',
    name: 'Commercial Vibrant',
    niche: 'Comércio Geral',
    badge: 'Vendas & Catálogo',
    desc: 'Ideal para lojas de roupas, acessórios, calçados e produtos locais.',
    accent: '#8b5cf6',
    previewImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'portfolio-dark',
    name: 'Tattoo & Creative Dark',
    niche: 'Tatuagem & Arte',
    badge: 'Fineline & Realismo',
    desc: 'Visual escuro imersivo para tatuadores, fotógrafos e designers gráficos.',
    accent: '#a855f7',
    previewImg: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'studio-minimal',
    name: 'Studio Minimal',
    niche: 'Arquitetura & Interiores',
    badge: 'Minimalismo & Luxo',
    desc: 'Espaço limpo, projetos 3D, paisagismo e decoração residencial.',
    accent: '#71717a',
    previewImg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
  }
];

const TONES_OF_VOICE = [
  { id: 'comercial', label: 'Comercial / Alta Conversão', icon: '🚀', desc: 'Foco total em vendas rápidas, gatilhos de escassez e botões de WhatsApp chamativos.' },
  { id: 'luxo', label: 'Luxo / Exclusivo', icon: '👑', desc: 'Linguagem nobre, sofisticada e com ênfase em alto padrão e atendimento reservado.' },
  { id: 'criativo', label: 'Jovem / Criativo', icon: '🎨', desc: 'Tom descontraído, moderno e focado em conexão visual, estética e estilo autêntico.' },
  { id: 'institucional', label: 'Técnico / Institucional', icon: '🏢', desc: 'Clareza técnica, credibilidade formal, segurança e precisão para B2B e saúde.' }
];

const QUICK_NICHES = [
  'Barbearia', 'Hamburgueria', 'Pizzaria', 'Odontologia', 'Oficina Mecânica',
  'Pet Shop', 'Salão de Beleza', 'Academia', 'Advogado', 'Contabilidade',
  'Estética', 'Imobiliária', 'Confeitaria', 'Lava Rápido', 'Clínica Médica',
  'Restaurante Japonês', 'Cafeteria', 'Distribuidora de Gás', 'Vidraçaria',
  'Marcenaria', 'Tatuagem & Piercing', 'Autoescola', 'Segurança Eletrônica'
];

export default function BillyWebStudio({
  role,
  operatorId = 'OP-BILLY-01',
  operatorName = 'Operador Oficial'
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

  // Manual Lead
  const [manualName, setManualName] = useState('');
  const [manualNiche, setManualNiche] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // TAB 2: Studio Form
  const [selectedTemplateId, setSelectedTemplateId] = useState('barbearia-crop-vintage');
  const [isRecommendingTemplate, setIsRecommendingTemplate] = useState(false);
  const [templateRecommendationReason, setTemplateRecommendationReason] = useState('');

  const [siteForm, setSiteForm] = useState({
    businessName: 'Barbearia Vintage Imperial',
    niche: 'Barbearia',
    city: 'São Paulo - SP',
    phone: '(11) 98765-4321',
    whatsapp: '11987654321',
    instagram: '@barbeariavintage',
    address: 'Av. Paulista, 1000 - Bela Vista',
    subdomain: 'barbearia-vintage-imperial',
    tagline: 'Cortes clássicos, barba na toalha quente e atendimento de primeira.',
    description: 'Espaço dedicado ao cavalheiro moderno com cerveja artesanal e os melhores barbeiros da região.',
    toneOfVoice: 'comercial',
    theme: 'dark-neon',
    accentColor: '#84cc16',
    logoUrl: '',
    heroPhoto: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80'
    ],
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
    faqs: [
      { question: 'Preciso agendar com antecedência?', answer: 'Recomendamos para garantir seu horário, mas atendemos por ordem de chegada se houver vaga.' },
      { question: 'Quais formas de pagamento?', answer: 'Aceitamos Pix com 5% de desconto, cartões de crédito e débito.' }
    ],
    hours: 'Segunda a Sábado das 09:00 às 20:00'
  });

  // Pixabay Interactive Search State
  const [pixabayQuery, setPixabayQuery] = useState('barbearia');
  const [pixabayImages, setPixabayImages] = useState<any[]>([]);
  const [pixabayLoading, setPixabayLoading] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // AI Copy Generation
  const [copyGenerating, setCopyGenerating] = useState(false);
  const [copySuccessNotice, setCopySuccessNotice] = useState(false);

  // Site Generation
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  // TAB 3: Preview & Proposal
  const [previewSlug, setPreviewSlug] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // AI Quick Adjustment Bar
  const [quickInstruction, setQuickInstruction] = useState('');
  const [adjustingSite, setAdjustingSite] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  // TAB 4: Projects History
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // New service input
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Auto slug
  const handleBusinessNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSiteForm((prev) => ({ ...prev, businessName: name, subdomain: slug }));
  };

  // Load Pixabay photos
  const handleSearchPixabay = async (q?: string) => {
    const searchTarget = q !== undefined ? q : pixabayQuery;
    setPixabayLoading(true);
    try {
      const res = await fetch(`/api/studio/pixabay?q=${encodeURIComponent(searchTarget || 'business')}&perPage=18`);
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setPixabayImages(data.images);
      }
    } catch (err) {
      console.warn('Erro ao buscar Pixabay:', err);
    } finally {
      setPixabayLoading(false);
    }
  };

  // Pre-fetch Pixabay on mount
  useEffect(() => {
    handleSearchPixabay('barbearia');
    loadProjects();
  }, []);

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

    setSiteForm((prev) => ({
      ...prev,
      businessName: lead.name,
      niche,
      city,
      phone: lead.phone || '',
      whatsapp: cleanPhone,
      subdomain: cleanSlug || 'site-' + Date.now().toString().slice(-4),
      tagline: `O melhor em ${niche} em ${city} com qualidade garantida.`,
      description: `Conheça nossos produtos e serviços de excelência. Atendimento exclusivo e satisfação garantida para você e sua família.`,
      address: lead.address || prev.address
    }));

    setPixabayQuery(niche);
    handleSearchPixabay(niche);
    setActiveTab('estudio');
  };

  // Handler: Recommend Template with AI
  const handleRecommendTemplateWithAI = () => {
    setIsRecommendingTemplate(true);
    const clean = siteForm.niche.toLowerCase();
    setTimeout(() => {
      let matched = DESKTOP_TEMPLATES[0];
      if (clean.includes('barba')) matched = DESKTOP_TEMPLATES[0];
      else if (clean.includes('estet') || clean.includes('spa') || clean.includes('unha') || clean.includes('cabelo')) matched = DESKTOP_TEMPLATES[2];
      else if (clean.includes('dent') || clean.includes('odonto')) matched = DESKTOP_TEMPLATES[3];
      else if (clean.includes('med') || clean.includes('saude') || clean.includes('clinic')) matched = DESKTOP_TEMPLATES[4];
      else if (clean.includes('restaurante') || clean.includes('gourmet') || clean.includes('churras')) matched = DESKTOP_TEMPLATES[5];
      else if (clean.includes('sushi') || clean.includes('japones') || clean.includes('peixe')) matched = DESKTOP_TEMPLATES[6];
      else if (clean.includes('cafe') || clean.includes('padaria') || clean.includes('doce') || clean.includes('bolo')) matched = DESKTOP_TEMPLATES[7];
      else if (clean.includes('pet') || clean.includes('vet') || clean.includes('cao') || clean.includes('gato')) matched = DESKTOP_TEMPLATES[8];
      else if (clean.includes('auto') || clean.includes('cfc') || clean.includes('cnh') || clean.includes('carteira')) matched = DESKTOP_TEMPLATES[9];
      else if (clean.includes('obra') || clean.includes('ferro') || clean.includes('solda') || clean.includes('portao')) matched = DESKTOP_TEMPLATES[10];
      else if (clean.includes('conta') || clean.includes('advoc') || clean.includes('consult')) matched = DESKTOP_TEMPLATES[11];
      else if (clean.includes('tattoo') || clean.includes('tatu') || clean.includes('piercing')) matched = DESKTOP_TEMPLATES[13];
      else if (clean.includes('arquitet') || clean.includes('decor') || clean.includes('moveis')) matched = DESKTOP_TEMPLATES[14];
      else matched = DESKTOP_TEMPLATES[12];

      setSelectedTemplateId(matched.id);
      setSiteForm((prev) => ({ ...prev, accentColor: matched.accent }));
      setTemplateRecommendationReason(`Template "${matched.name}" selecionado pela IA por ter a paleta e estrutura ideais para o nicho de ${siteForm.niche}.`);
      setIsRecommendingTemplate(false);
    }, 700);
  };

  // Handler: Preencher Textos e Serviços com IA
  const handleGenerateCopy = async () => {
    setCopyGenerating(true);
    setCopySuccessNotice(false);
    try {
      const res = await fetch('/api/studio/gerar-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: siteForm.businessName,
          niche: siteForm.niche,
          city: siteForm.city,
          toneOfVoice: siteForm.toneOfVoice
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSiteForm((prev) => ({
          ...prev,
          tagline: json.data.headline || prev.tagline,
          description: json.data.description || prev.description,
          services: json.data.services?.length ? json.data.services : prev.services,
          features: json.data.features?.length ? json.data.features : prev.features,
          faqs: json.data.faqs?.length ? json.data.faqs : prev.faqs,
          hours: json.data.hours || prev.hours
        }));
        setCopySuccessNotice(true);
        setTimeout(() => setCopySuccessNotice(false), 4000);
      }
    } catch (err) {
      alert('Erro ao gerar copy com IA: ' + err);
    } finally {
      setCopyGenerating(false);
    }
  };

  // Add custom photo URL
  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    setSiteForm((prev) => ({
      ...prev,
      galleryPhotos: [customPhotoUrl.trim(), ...prev.galleryPhotos]
    }));
    setCustomPhotoUrl('');
  };

  // Remove photo from gallery
  const handleRemovePhoto = (idx: number) => {
    setSiteForm((prev) => ({
      ...prev,
      galleryPhotos: prev.galleryPhotos.filter((_, i) => i !== idx)
    }));
  };

  // Add service
  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setSiteForm((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: newServiceName.trim(),
          price: newServicePrice.trim() || 'Sob Consulta',
          description: 'Atendimento com garantia e padrão de excelência.'
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

  // Handler: Gerar Site com IA & Publicar
  const handleGenerateSite = async () => {
    if (!siteForm.businessName.trim() || !siteForm.subdomain.trim()) {
      alert('Por favor informe o Nome do Negócio e o Subdomínio.');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGenerationStep('Iniciando Motor Gemini do Billy Studio...');

    try {
      setTimeout(() => setGenerationStep('Montando template e curadoria de fotos de alta resolução...'), 1200);
      setTimeout(() => setGenerationStep('Redigindo copywriting persuasivo e estrutura de alta conversão...'), 2600);
      setTimeout(() => setGenerationStep('Publicando no subdomínio oficial *.webbilly.com.br...'), 4200);
      setTimeout(() => setGenerationStep('Gerando proposta comercial e checkout Pix integrado...'), 5800);

      const res = await fetch('/api/studio/gerar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: siteForm.businessName,
          niche: siteForm.niche,
          city: siteForm.city,
          phone: siteForm.phone,
          whatsapp: siteForm.whatsapp,
          instagram: siteForm.instagram,
          address: siteForm.address,
          subdomain: siteForm.subdomain,
          tagline: siteForm.tagline,
          description: siteForm.description,
          theme: siteForm.theme,
          templateId: selectedTemplateId,
          accentColor: siteForm.accentColor,
          logoUrl: siteForm.logoUrl,
          heroPhoto: siteForm.heroPhoto,
          galleryPhotos: siteForm.galleryPhotos,
          services: siteForm.services,
          features: siteForm.features,
          faqs: siteForm.faqs,
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

  // Handler: Ajustar Site com IA (Chat Refinement)
  const handleQuickAdjust = async (promptOverride?: string) => {
    const text = promptOverride || quickInstruction;
    if (!text.trim() || !previewSlug || adjustingSite) return;

    setAdjustingSite(true);
    setAdjustSuccessMsg(null);
    try {
      const res = await fetch('/api/studio/ajustar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: previewSlug,
          instruction: text
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdjustSuccessMsg(`Alteração "${text}" aplicada! Atualizando preview...`);
        setQuickInstruction('');
        // Força recarregamento do iframe
        const frame = document.getElementById('studio-preview-iframe') as HTMLIFrameElement;
        if (frame) {
          frame.src = `/api/public/site/${previewSlug}/render?t=${Date.now()}`;
        }
        setTimeout(() => setAdjustSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Erro ao ajustar site.');
      }
    } catch (err: any) {
      alert('Erro ao enviar instrução: ' + err.message);
    } finally {
      setAdjustingSite(false);
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

  // Open WhatsApp
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
    <div className="space-y-6 select-none font-sans">
      {/* =========================================================================
          CABEÇALHO NEON DO BILLY STUDIO WEB
         ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1017] via-[#101522] to-[#07090e] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#84cc16]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/40 shadow-[0_0_15px_rgba(132,204,22,0.2)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Billy Studio Web • 100% no Navegador</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#84cc16]/30 text-white font-mono">
                {role === 'admin' ? 'MASTER ADMIN' : 'OPERADOR OFICIAL'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Billy Studio Web</span>
              <span className="text-[#84cc16]">IA & Templates</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Experiência idêntica ao software desktop: templates oficiais, fotos em alta resolução no Pixabay, textos gerados com IA, subdomínios oficiais{' '}
              <span className="text-[#84cc16] font-mono">*.webbilly.com.br</span> e fechamento direto no WhatsApp.
            </p>
          </div>

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

            <ActionTooltip title="Meus Projetos" description="Lista de todos os sites criados pelo estúdio e propostas geradas." side="bottom">
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

        {/* 4 ETAPAS DE NAVEGAÇÃO DO ESTÚDIO */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
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

          <button
            onClick={() => setActiveTab('estudio')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'estudio'
                ? 'bg-[#84cc16] text-black shadow-[0_0_20px_rgba(132,204,22,0.4)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Gerador & IA (Desktop Suite)</span>
          </button>

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
          TAB 1: PROSPECÇÃO DE LEADS
         ========================================================================= */}
      {activeTab === 'prospectar' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-[#84cc16]" />
                <span>Radar de Leads e Oportunidades no Google Maps</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Busque estabelecimentos comerciais na sua cidade com alta propensão de fechamento (comércios sem site próprio).
              </p>
            </div>

            {/* Quick Niches */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
                Nicho Rápido (Clique para preencher):
              </span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 scrollbar-thin">
                {QUICK_NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setNicheQuery(n);
                      setPixabayQuery(n);
                    }}
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
                <label className="text-[11px] font-bold text-zinc-300">Ramo / Nicho</label>
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
                <span>{leadsError} — Você também pode cadastrar um comércio manualmente.</span>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {leadsList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Leads Encontrados ({leadsList.length})</span>
                  <span className="text-xs text-zinc-400 font-normal">Clique para transferir os dados para o gerador</span>
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
                            <span className="text-[10px] font-medium text-zinc-400">Possui site externo</span>
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
                              ★ {lead.rating.toFixed(1)} ({lead.reviews || 0} avaliações)
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => handleSelectLead(lead)}
                          className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-[#84cc16]/15 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Configurar Site no Estúdio</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Manual */}
          {(showManualForm || leadsList.length === 0) && (
            <div className="p-6 rounded-3xl bg-[#0c1017] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#84cc16]" />
                <span>Cadastrar Comércio Manualmente</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Nome do Comércio"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={manualNiche}
                  onChange={(e) => setManualNiche(e.target.value)}
                  placeholder="Nicho / Categoria"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Cidade - UF"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    placeholder="WhatsApp"
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualName) return;
                      handleSelectLead({
                        name: manualName,
                        category: manualNiche || nicheQuery,
                        city: manualCity || cityQuery,
                        phone: manualPhone,
                        opportunity: 'HOT_NO_WEBSITE'
                      });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition shrink-0 cursor-pointer"
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GERADOR DE SITES & IA (PORTADO DO BILLY DESKTOP)
         ========================================================================= */}
      {activeTab === 'estudio' && (
        <div className="space-y-6">
          {/* Seção A: Galeria Visual de Templates Oficiais do Billy Desktop */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#84cc16]" />
                  <span>1. Escolha o Template Oficial do Billy Desktop</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Modelos de alta conversão adaptados para cada categoria comercial.
                </p>
              </div>

              {/* Botão Escolher com IA */}
              <button
                type="button"
                onClick={handleRecommendTemplateWithAI}
                disabled={isRecommendingTemplate}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 via-[#84cc16] to-emerald-600 hover:brightness-110 text-black shadow-lg flex items-center gap-2 cursor-pointer transition shrink-0"
              >
                {isRecommendingTemplate ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Analisando Nicho com IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-black" />
                    <span>✨ Escolher Melhor Template com IA</span>
                  </>
                )}
              </button>
            </div>

            {templateRecommendationReason && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-3 animate-pulse">
                <Bot className="w-4 h-4 shrink-0 text-purple-400" />
                <span>{templateRecommendationReason}</span>
              </div>
            )}

            {/* Grid de Templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {DESKTOP_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setSiteForm((prev) => ({ ...prev, accentColor: tpl.accent }));
                    }}
                    className={`rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#84cc16] ring-2 ring-[#84cc16]/50 bg-[#141b28] shadow-[0_0_20px_rgba(132,204,22,0.3)] scale-[1.02]'
                        : 'border-white/[0.08] bg-[#090d14] hover:border-white/20'
                    }`}
                  >
                    <div className="aspect-video w-full overflow-hidden relative">
                      <img src={tpl.previewImg} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md">
                        {tpl.badge}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#84cc16]/20 flex items-center justify-center">
                          <span className="w-8 h-8 rounded-full bg-[#84cc16] text-black flex items-center justify-center font-bold shadow-lg">
                            <Check className="w-5 h-5" />
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs truncate">{tpl.name}</span>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tpl.accent }} />
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{tpl.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção B: Dados da Empresa + Botão Mágico "Preencher Textos com IA" */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#84cc16]" />
                  <span>2. Dados do Comércio & Inteligência Artificial</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Personalize o conteúdo ou deixe a IA gerar slogan, descrição institucional e serviços com 1 clique.
                </p>
              </div>

              {/* Botão Mágico IA */}
              <button
                type="button"
                onClick={handleGenerateCopy}
                disabled={copyGenerating}
                className="py-2.5 px-5 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 via-[#84cc16] to-emerald-600 hover:brightness-110 text-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
              >
                {copyGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Gerando Copy com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>✨ Preencher Textos e Serviços com IA</span>
                  </>
                )}
              </button>
            </div>

            {copySuccessNotice && (
              <div className="p-4 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/40 text-[#a3e635] text-xs flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#84cc16]" />
                <span>Textos persuasivos, diferenciais e serviços com preços atualizados automaticamente pela IA!</span>
              </div>
            )}

            {/* Inputs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Nome Oficial do Estabelecimento</label>
                <input
                  type="text"
                  value={siteForm.businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="Ex: Barbearia Vintage Imperial"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Nicho / Categoria</label>
                <input
                  type="text"
                  value={siteForm.niche}
                  onChange={(e) => setSiteForm({ ...siteForm, niche: e.target.value })}
                  placeholder="Ex: Barbearia"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Cidade e Estado</label>
                <input
                  type="text"
                  value={siteForm.city}
                  onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                  placeholder="Ex: São Paulo - SP"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">WhatsApp Oficial</label>
                <input
                  type="text"
                  value={siteForm.whatsapp}
                  onChange={(e) => setSiteForm({ ...siteForm, whatsapp: e.target.value.replace(/\D/g, '') })}
                  placeholder="11999999999"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Instagram (@)</label>
                <input
                  type="text"
                  value={siteForm.instagram}
                  onChange={(e) => setSiteForm({ ...siteForm, instagram: e.target.value })}
                  placeholder="@seuperfil"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Endereço Completo</label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                  placeholder="Rua, Número, Bairro - Cidade/UF"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>
            </div>

            {/* Subdomínio Oficial */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                <span>Subdomínio Oficial Oficial (*.webbilly.com.br)</span>
                <span className="text-[10px] text-[#84cc16] font-mono">Sem custo de hospedagem</span>
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
                  className="w-full bg-transparent px-1 py-2.5 text-xs text-white font-mono font-bold focus:outline-none"
                />
                <span className="pr-3 text-xs text-[#84cc16] font-mono font-bold shrink-0">.webbilly.com.br</span>
              </div>
            </div>

            {/* Slogan & Descrição */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Chamada Principal (Slogan de Conversão)</label>
                <input
                  type="text"
                  value={siteForm.tagline}
                  onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Texto Institucional / Sobre Nós</label>
                <textarea
                  rows={3}
                  value={siteForm.description}
                  onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>
            </div>

            {/* Tom de Voz */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-300">Tom de Voz da Copywriting</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TONES_OF_VOICE.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSiteForm({ ...siteForm, toneOfVoice: tone.id })}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      siteForm.toneOfVoice === tone.id
                        ? 'bg-[#84cc16]/10 border-[#84cc16] text-white shadow-md'
                        : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tone.icon}</span>
                      <span className="text-xs font-bold text-white">{tone.label}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seção C: Buscador Interativo Pixabay & Galeria de Mídia */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#84cc16]" />
                  <span>3. Fotos Profissionais (Pixabay & Fotos Reais)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Clique nas fotos do Pixabay para definir o Banner Hero ou adicionar à Galeria, ou cole links do Instagram.
                </p>
              </div>

              {/* Busca no Pixabay */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={pixabayQuery}
                  onChange={(e) => setPixabayQuery(e.target.value)}
                  placeholder="Pesquisar fotos..."
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <button
                  type="button"
                  onClick={() => handleSearchPixabay()}
                  disabled={pixabayLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-[#84cc16] hover:bg-[#9ae639] text-black text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{pixabayLoading ? 'Buscando...' : 'Buscar'}</span>
                </button>
              </div>
            </div>

            {/* Grid de Fotos Pixabay */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Acervo de Fotos em Alta Resolução (Clique para adicionar):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {pixabayImages.map((img, idx) => {
                  const isHero = siteForm.heroPhoto === img.largeUrl || siteForm.heroPhoto === img.previewUrl;
                  const isGallery = siteForm.galleryPhotos.includes(img.largeUrl) || siteForm.galleryPhotos.includes(img.previewUrl);

                  return (
                    <div
                      key={img.id || idx}
                      className={`relative rounded-xl overflow-hidden aspect-video border group transition cursor-pointer ${
                        isHero
                          ? 'border-[#84cc16] ring-2 ring-[#84cc16]'
                          : isGallery
                          ? 'border-emerald-500'
                          : 'border-white/[0.08] hover:border-white/30'
                      }`}
                    >
                      <img src={img.previewUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col justify-between p-2">
                        <button
                          type="button"
                          onClick={() => setSiteForm((prev) => ({ ...prev, heroPhoto: img.largeUrl || img.previewUrl }))}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#84cc16] text-black"
                        >
                          Definir Hero
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const target = img.largeUrl || img.previewUrl;
                            if (siteForm.galleryPhotos.includes(target)) {
                              setSiteForm((prev) => ({ ...prev, galleryPhotos: prev.galleryPhotos.filter((p) => p !== target) }));
                            } else {
                              setSiteForm((prev) => ({ ...prev, galleryPhotos: [...prev.galleryPhotos, target] }));
                            }
                          }}
                          className="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-black"
                        >
                          {isGallery ? 'Remover' : '+ Galeria'}
                        </button>
                      </div>
                      {isHero && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-[#84cc16] text-black text-[8px] font-bold">
                          HERO ★
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adicionar Fotos Manuais / Instagram */}
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  placeholder="Colar URL de foto do Instagram, Google Fotos ou Imgur..."
                  className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPhoto}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white transition cursor-pointer"
                >
                  + Adicionar Foto
                </button>
              </div>

              {/* Fotos Atuais na Galeria */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-300 block">
                  Fotos Selecionadas para o Site ({siteForm.galleryPhotos.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {siteForm.galleryPhotos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.1] group">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Seção D: Serviços, Cardápio e Preços */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#84cc16]" />
                  <span>4. Cardápio, Tabela de Preços & Serviços</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Gerencie os itens exibidos para o cliente com valores em Real (R$).
                </p>
              </div>
              <span className="text-xs font-mono text-[#84cc16] font-bold">{siteForm.services.length} itens</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {siteForm.services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{srv.name}</span>
                      <span className="text-[10px] font-mono text-[#84cc16] bg-[#84cc16]/10 px-2 py-0.5 rounded border border-[#84cc16]/30">
                        {srv.price}
                      </span>
                    </div>
                    {srv.description && <p className="text-[11px] text-zinc-400 truncate mt-0.5">{srv.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Adicionar Serviço */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Novo item / serviço..."
                className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
              />
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="R$ 50,00"
                className="w-28 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16]/20 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition cursor-pointer shrink-0"
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* BOTÃO FINAL DE GERAÇÃO */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c1322] via-[#101b2e] to-[#0c1a16] border border-[#84cc16]/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#84cc16] tracking-wider block">Pronto para Publicar</span>
              <h4 className="text-base font-black text-white">Gere a Landing Page e Link de Proposta</h4>
              <p className="text-xs text-zinc-400">O site ficará no ar em https://{siteForm.subdomain}.webbilly.com.br</p>
            </div>

            <button
              type="button"
              onClick={handleGenerateSite}
              disabled={generating}
              className="py-3.5 px-8 rounded-2xl font-black text-sm bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:brightness-110 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Gerando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  <span>🚀 Gerar Site Completo & Publicar</span>
                </>
              )}
            </button>
          </div>

          {generating && (
            <div className="p-5 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#84cc16] shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Processando:</h4>
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
        </div>
      )}

      {/* =========================================================================
          TAB 3: PREVIEW AO VIVO + CHAT REFINEMENT IA + PROPOSTA WHATSAPP
         ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {previewSlug ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna da Esquerda: Iframe Multi-Device Preview + Barra de Ajuste IA */}
              <div className="lg:col-span-8 space-y-4">
                {/* Controles de Dispositivo */}
                <div className="p-3.5 rounded-2xl bg-[#0e121b] border border-white/[0.08] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-zinc-400 font-semibold pl-2 hidden sm:inline">
                      https://{previewSlug}.webbilly.com.br
                    </span>
                  </div>

                  {/* Switcher Desktop / Tablet / Smartphone */}
                  <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/[0.06]">
                    <ActionTooltip title="Desktop (100%)" description="Visualização completa para monitores." side="bottom">
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          previewDevice === 'desktop' ? 'bg-[#84cc16] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    </ActionTooltip>

                    <ActionTooltip title="Tablet (768px)" description="Visualização simulada para tablets." side="bottom">
                      <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          previewDevice === 'tablet' ? 'bg-[#84cc16] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                    </ActionTooltip>

                    <ActionTooltip title="Smartphone (390px)" description="Visualização perfeita para celulares." side="bottom">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          previewDevice === 'mobile' ? 'bg-[#84cc16] text-black font-bold' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </ActionTooltip>
                  </div>

                  {/* Abrir Oficial em Nova Aba */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://${previewSlug}.webbilly.com.br`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white border border-white/[0.08] flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#84cc16]" />
                      <span className="hidden sm:inline">Abrir Subdomínio</span>
                    </a>
                  </div>
                </div>

                {/* Container Iframe */}
                <div className="flex justify-center bg-[#07090e] border border-white/[0.08] rounded-3xl p-4 overflow-hidden min-h-[600px]">
                  <div
                    className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl ${
                      previewDevice === 'mobile'
                        ? 'w-[390px] h-[667px] ring-8 ring-zinc-800'
                        : previewDevice === 'tablet'
                        ? 'w-[768px] h-[720px] ring-8 ring-zinc-800'
                        : 'w-full h-[720px]'
                    }`}
                  >
                    <iframe
                      id="studio-preview-iframe"
                      src={`/api/public/site/${previewSlug}/render`}
                      title="Preview do Site"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>

                {/* BARRA DE AJUSTE RÁPIDO COM IA (PORTADO DO CHAT REFINEMENT DESKTOP) */}
                <div className="p-4 rounded-2xl bg-[#0e121b] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#84cc16]" />
                      <span>Pedir Alteração Rápida no Site com IA</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Gemini Studio Engine</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={quickInstruction}
                      onChange={(e) => setQuickInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAdjust()}
                      placeholder="Ex: Mude a cor de destaque para dourado e adicione promoção no cardápio..."
                      className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickAdjust()}
                      disabled={adjustingSite || !quickInstruction.trim()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {adjustingSite ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Ajustando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Aplicar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prompts Rápidos de 1 Clique */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Mudar botão para verde WhatsApp',
                      'Deixar a copy mais persuasiva',
                      'Adicionar seção de 3 depoimentos com estrelas',
                      'Destacar promoção no topo do site'
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickAdjust(p)}
                        disabled={adjustingSite}
                        className="px-2.5 py-1 rounded-lg text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition cursor-pointer"
                      >
                        ⚡ {p}
                      </button>
                    ))}
                  </div>

                  {adjustSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{adjustSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Coluna da Direita: Card de Fechamento de Venda & WhatsApp */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-6 rounded-3xl bg-[#0e121b] border border-[#84cc16]/40 shadow-xl space-y-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30">
                      Fechamento da Venda
                    </span>
                    <h3 className="text-base font-black text-white mt-2">Proposta Comercial Pronta!</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Envie a demonstração diretamente para o dono do comércio pelo WhatsApp e receba 50% de comissão recorrente.
                    </p>
                  </div>

                  {/* Link da Proposta */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-white/[0.08] space-y-1.5">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
                      Link da Proposta com Pix (R$ 29,90/mês)
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
                          handleCopy(`https://webbilly.com.br/proposta/${generatedResult?.leadToken || previewSlug}`, 'link')
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#84cc16]/15 hover:bg-[#84cc16]/30 text-[#84cc16] text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mensagem WhatsApp */}
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
                      💡 Links isolados com quebra dupla (\n\n) para gerar preview visual no WhatsApp.
                    </p>
                  </div>

                  {/* Botões de Ação */}
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
                      Voltar ao Editor do Estúdio
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
              <h3 className="text-base font-bold text-white">Nenhum site em visualização</h3>
              <p className="text-xs text-zinc-400">
                Gere um site na aba "2. Gerador & IA" ou carregue um projeto da lista.
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
                Acompanhe seus sites no ar, acerte propostas comerciais e reenvie mensagens no WhatsApp.
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
                            <ActionTooltip title="Carregar no Preview" description="Abre este projeto no preview interativo." side="left">
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
                                    whatsappMessage: `Olá, tudo bem? Sou da equipe da Webbilly e criamos uma demonstração exclusiva para a *${proj.name}*!\n\nVocê pode ver o site completo aqui:\n${proj.subdomainUrl}\n\nE conferir a proposta especial por apenas R$ 29,90/mês aqui:\n${proj.proposalUrl}\n\nFicamos à disposição para tirar dúvidas e ativar!`,
                                    phone: proj.whatsapp || proj.phone || ''
                                  });
                                  setCustomWaMessage(
                                    `Olá, tudo bem? Sou da equipe da Webbilly e criamos uma demonstração exclusiva para a *${proj.name}*!\n\nVocê pode ver o site completo aqui:\n${proj.subdomainUrl}\n\nE conferir a proposta especial por apenas R$ 29,90/mês aqui:\n${proj.proposalUrl}\n\nFicamos à disposição para tirar dúvidas e ativar!`
                                  );
                                  setActiveTab('preview');
                                }}
                                className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#84cc16] hover:text-black text-zinc-300 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </ActionTooltip>

                            <ActionTooltip title="Copiar Proposta" description="Copia a URL de proposta comercial do cliente." side="left">
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
                Use a aba "2. Gerador & IA" para criar seu primeiro site profissional.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
