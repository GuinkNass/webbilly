'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Plus,
  Trash2,
  Phone,
  MapPin,
  Clock,
  Layers,
  Palette,
  AlertCircle,
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
  Maximize2,
  X,
  FileText,
  Loader2,
  Star,
  Bookmark,
  Building2,
  ShieldCheck,
  SlidersHorizontal,
  Camera
} from 'lucide-react';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  BILLY_DESKTOP_TEMPLATES,
  DesktopTemplate,
  findTemplateById,
  recommendTemplateForNiche
} from '@/lib/billy-desktop-port/templates';
import {
  CATEGORY_GROUPS,
  TONES_OF_VOICE,
  ACCENT_COLORS,
  BlockToggles,
  DEFAULT_BLOCK_TOGGLES
} from '@/lib/billy-desktop-port/categories';

interface LeadResult {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  rating?: number;
  reviews?: number;
  reviewsCount?: number;
  category?: string;
  niche?: string;
  website?: string;
  hasWebsite?: boolean;
  hasOwnWebsite?: boolean;
  isHighOpportunity?: boolean;
  opportunityReason?: string;
  opportunity?: 'HOT_NO_WEBSITE' | 'HAS_WEBSITE';
  photos?: string[];
  hours?: string;
  openingHours?: string;
  realReviews?: Array<{ author: string; rating: number; text: string }>;
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

/**
 * Função utilitária para leitura segura de respostas da API
 * Previne o erro "Unexpected token 'A', 'An error o'... is not valid JSON"
 * ao converter erros HTML do servidor em mensagens legíveis.
 */
async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const rawText = await res.text().catch(() => '');
  let json: any = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch {
    // Se a Vercel retornou página HTML de erro (ex: 500 ou 504)
    const cleanError = rawText
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 250);
    throw new Error(cleanError || `Erro no servidor (Status ${res.status}).`);
  }

  if (!res.ok) {
    throw new Error(json?.error || json?.message || `Erro HTTP ${res.status}`);
  }

  return json;
}

export default function BillyWebStudio({
  role,
  operatorId = 'OP-BILLY-01',
  operatorName = 'Operador Oficial'
}: BillyWebStudioProps) {
  // Navigation Tabs: 'prospectar' | 'estudio' | 'preview' | 'projetos'
  const [activeTab, setActiveTab] = useState<'prospectar' | 'estudio' | 'preview' | 'projetos'>('prospectar');

  // =========================================================================
  // TAB 1: PROSPECTAR LEADS
  // =========================================================================
  const [nicheQuery, setNicheQuery] = useState('Barbearia');
  const [cityQuery, setCityQuery] = useState('São Paulo, SP');
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsList, setLeadsList] = useState<LeadResult[]>([]);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);

  // Manual Lead Form
  const [manualName, setManualName] = useState('');
  const [manualNiche, setManualNiche] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  // =========================================================================
  // TAB 2: GERADOR & IA (DESKTOP SUITE WIZARD)
  // =========================================================================
  const [selectedTemplateId, setSelectedTemplateId] = useState('barbearia-crop-vintage');
  const [isRecommendingTemplate, setIsRecommendingTemplate] = useState(false);
  const [templateRecommendationReason, setTemplateRecommendationReason] = useState('');

  const [siteForm, setSiteForm] = useState({
    businessName: 'Barbearia Vintage Imperial',
    niche: 'Barbearia Tradicional & VIP',
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

  // Toggles de Blocos (12 Seções Modulares do Desktop)
  const [blocks, setBlocks] = useState<BlockToggles>(DEFAULT_BLOCK_TOGGLES);

  // Extração Inteligente de Cardápio / Preços (OCR & Texto)
  const [ocrText, setOcrText] = useState('');
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrSuccessNotice, setOcrSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Presets
  const [savedPresets, setSavedPresets] = useState<Array<{ name: string; templateId: string; accentColor: string; blocks: BlockToggles }>>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  // Pixabay Interactive Search
  const [pixabayQuery, setPixabayQuery] = useState('barbearia');
  const [pixabayImages, setPixabayImages] = useState<any[]>([]);
  const [pixabayLoading, setPixabayLoading] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Central de Fotos Reais (Google & Instagram)
  const [photoSearchMode, setPhotoSearchMode] = useState<'real' | 'pixabay' | 'custom'>('real');
  const [realPhotosQuery, setRealPhotosQuery] = useState('');
  const [realPhotos, setRealPhotos] = useState<Array<{ id: string; url: string; proxyUrl?: string; title: string; source: 'google' | 'instagram' | 'web' }>>([]);
  const [realPhotosLoading, setRealPhotosLoading] = useState(false);
  const [realPhotosSuccessNotice, setRealPhotosSuccessNotice] = useState<string | null>(null);

  // AI Copy Generation
  const [copyGenerating, setCopyGenerating] = useState(false);
  const [copySuccessNotice, setCopySuccessNotice] = useState(false);

  // Site Generation State
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedLeadReviews, setSelectedLeadReviews] = useState<Array<{ author: string; rating: number; text: string }>>([]);

  // =========================================================================
  // TAB 3: PREVIEW INSTANTÂNEO (`srcDoc`) & DEPLOY REAL
  // =========================================================================
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [previewSlug, setPreviewSlug] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Deploy Real State
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deploySuccessNotice, setDeploySuccessNotice] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  // AI Quick Adjustment Bar
  const [quickInstruction, setQuickInstruction] = useState('');
  const [adjustingSite, setAdjustingSite] = useState(false);
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null);

  // =========================================================================
  // TAB 4: HISTÓRICO DE PROJETOS
  // =========================================================================
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // New service input
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Auto slug handler
  const handleBusinessNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSiteForm((prev) => ({ ...prev, businessName: name, subdomain: slug }));
  };

  // Carregar Presets do LocalStorage no Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('webbilly_custom_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setSavedPresets(parsed);
      }
    } catch {}
    handleSearchPixabay('barbearia');
    loadProjects();
  }, []);

  // Salvar Preset Customizado
  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      name: newPresetName.trim(),
      templateId: selectedTemplateId,
      accentColor: siteForm.accentColor,
      blocks
    };
    const updated = [newPreset, ...savedPresets.filter((p) => p.name !== newPreset.name)];
    setSavedPresets(updated);
    try {
      localStorage.setItem('webbilly_custom_presets', JSON.stringify(updated));
    } catch {}
    setNewPresetName('');
    setShowSavePresetInput(false);
  };

  // Aplicar Preset Customizado
  const handleApplyPreset = (preset: { name: string; templateId: string; accentColor: string; blocks: BlockToggles }) => {
    setSelectedTemplateId(preset.templateId);
    setSiteForm((prev) => ({ ...prev, accentColor: preset.accentColor }));
    setBlocks(preset.blocks);
  };

  // Load Pixabay photos
  const handleSearchPixabay = async (q?: string) => {
    const searchTarget = q !== undefined ? q : pixabayQuery;
    setPixabayLoading(true);
    try {
      const data = await safeFetchJson(`/api/studio/pixabay?q=${encodeURIComponent(searchTarget || 'business')}&perPage=18`);
      if (data && data.success && Array.isArray(data.images)) {
        setPixabayImages(data.images);
      }
    } catch (err) {
      console.warn('Erro ao buscar Pixabay:', err);
    } finally {
      setPixabayLoading(false);
    }
  };

  // Busca Fotos Reais do Estabelecimento (Google Imagens & Instagram)
  const handleSearchRealPhotos = async (qOverride?: string) => {
    const targetQuery = qOverride !== undefined ? qOverride : (realPhotosQuery || `${siteForm.businessName} ${siteForm.city}`);
    if (!targetQuery.trim()) return;

    setRealPhotosLoading(true);
    setRealPhotosSuccessNotice(null);
    try {
      const data = await safeFetchJson('/api/studio/buscar-fotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: siteForm.businessName,
          city: siteForm.city,
          niche: siteForm.niche,
          instagram: siteForm.instagram,
          query: targetQuery
        })
      });

      if (data && data.success && Array.isArray(data.photos) && data.photos.length > 0) {
        setRealPhotos(data.photos);
        setRealPhotosSuccessNotice(`✨ ${data.photos.length} fotos reais encontradas no Google / Instagram!`);

        // Se a galeria atual só tem fotos padrão de stock, substitui automaticamente pelas reais
        setSiteForm((prev) => {
          const hasCustomPhotos = prev.galleryPhotos.some(
            (p) => !p.includes('unsplash.com') && !p.includes('pixabay.com')
          );
          if (!hasCustomPhotos && data.photos.length > 0) {
            const urls = data.photos.slice(0, 8).map((p: any) => p.url);
            return {
              ...prev,
              heroPhoto: urls[0] || prev.heroPhoto,
              galleryPhotos: urls
            };
          }
          return prev;
        });

        setTimeout(() => setRealPhotosSuccessNotice(null), 5000);
      } else {
        setRealPhotosSuccessNotice('Nenhuma foto pública encontrada. Tente buscar pelo @ do Instagram ou nome exato.');
      }
    } catch (err: any) {
      console.warn('Erro ao buscar fotos reais:', err.message);
    } finally {
      setRealPhotosLoading(false);
    }
  };

  // Importar e aplicar todas as fotos reais selecionadas para o site
  const handleApplyRealPhotosToSite = () => {
    if (realPhotos.length === 0) return;
    const urls = realPhotos.slice(0, 8).map((p) => p.url);
    setSiteForm((prev) => ({
      ...prev,
      heroPhoto: urls[0] || prev.heroPhoto,
      galleryPhotos: urls
    }));
    setRealPhotosSuccessNotice(`✅ ${urls.length} fotos reais aplicadas com sucesso no site!`);
    setTimeout(() => setRealPhotosSuccessNotice(null), 4000);
  };

  // Load projects list
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);
      const data = await safeFetchJson(`/api/studio/projetos?role=${role}&operatorId=${operatorId}`);
      if (data && data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('Erro ao carregar projetos:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Excluir projeto do histórico
  const handleDeleteProject = async (slug: string) => {
    if (!confirm(`Tem certeza que deseja excluir o site "${slug}" do histórico?`)) return;
    try {
      await safeFetchJson(`/api/studio/projetos?slug=${encodeURIComponent(slug)}`, {
        method: 'DELETE'
      });
      loadProjects();
    } catch (err: any) {
      alert('Erro ao excluir projeto: ' + err.message);
    }
  };

  // =========================================================================
  // HANDLERS DA ABA 1 (BUSCA DE LEADS)
  // =========================================================================
  const handleSearchLeads = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLeadsLoading(true);
    setLeadsError(null);
    setSearchNotice(null);
    setGoogleNotice(null);

    const niche = nicheQuery.trim() || 'Barbearia';
    const city = cityQuery.trim() || 'São Paulo - SP';

    try {
      const data = await safeFetchJson('/api/studio/buscar-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city })
      });

      if (!data.success) {
        throw new Error(data.error || data.message || 'Erro ao buscar comércios');
      }

      const results = Array.isArray(data.leads) ? data.leads : [];
      setLeadsList(results);
      setProviderLabel(data.provider || 'Radar Comercial');
      setSearchNotice(data.message || `${results.length} comércios encontrados em ${city}.`);
      if (data.googleNotice) setGoogleNotice(data.googleNotice);

      if (results.length === 0) {
        setShowManualForm(true);
      }
    } catch (err: any) {
      setLeadsError(err.message || 'Erro ao conectar com o serviço de busca.');
      setShowManualForm(true);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleSelectLead = (lead: LeadResult) => {
    const rawPhone = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;

    const cleanSlug = lead.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const niche = lead.niche || lead.category || nicheQuery || 'Comércio Local';
    const city = lead.city || cityQuery || 'São Paulo - SP';

    // Recomendação Automática de Template pelo Nicho
    const recommendation = recommendTemplateForNiche(niche);
    setSelectedTemplateId(recommendation.template.id);
    setTemplateRecommendationReason(recommendation.reason);

    // Fotos reais do Google Places (se existirem)
    const googlePhotos = Array.isArray(lead.photos) && lead.photos.length > 0 ? lead.photos : [];
    const leadHours = lead.hours || lead.openingHours || '';

    setSiteForm((prev) => ({
      ...prev,
      businessName: lead.name,
      niche,
      city,
      phone: lead.phone || lead.whatsapp || '',
      whatsapp: cleanPhone,
      subdomain: cleanSlug || 'site-' + Date.now().toString().slice(-4),
      tagline: `Excelência em ${niche} em ${city} com atendimento exclusivo.`,
      description: `Na ${lead.name}, oferecemos soluções completas com profissionais qualificados e padrão de alto nível.`,
      address: lead.address || prev.address,
      accentColor: recommendation.template.accentColor,
      heroPhoto: googlePhotos.length > 0 ? googlePhotos[0] : prev.heroPhoto,
      galleryPhotos: googlePhotos.length > 0 ? googlePhotos : prev.galleryPhotos,
      hours: leadHours || prev.hours
    }));

    if (Array.isArray(lead.realReviews) && lead.realReviews.length > 0) {
      setSelectedLeadReviews(lead.realReviews);
    } else {
      setSelectedLeadReviews([]);
    }

    // Prepara e dispara busca de fotos reais do Google / Instagram
    const businessPhotoQuery = `${lead.name} ${city}`;
    setRealPhotosQuery(businessPhotoQuery);

    if (googlePhotos.length > 0) {
      setRealPhotos(
        googlePhotos.map((url, idx) => ({
          id: `lead_photo_${idx}`,
          url,
          proxyUrl: `/api/studio/image-proxy?url=${encodeURIComponent(url)}`,
          title: `${lead.name} (Google Maps Oficial)`,
          source: 'google'
        }))
      );
    } else {
      handleSearchRealPhotos(businessPhotoQuery);
    }

    setPixabayQuery(niche);
    handleSearchPixabay(niche);
    setActiveTab('estudio');
  };

  // Handler: Manual Lead Submit
  const handleUseManualLead = () => {
    if (!manualName.trim()) return;
    const cleanPhone = manualPhone.replace(/\D/g, '');
    const cleanSlug = manualName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const niche = manualNiche.trim() || 'Comércio Local';
    const city = manualCity.trim() || 'São Paulo - SP';

    const recommendation = recommendTemplateForNiche(niche);
    setSelectedTemplateId(recommendation.template.id);
    setTemplateRecommendationReason(recommendation.reason);

    setSiteForm((prev) => ({
      ...prev,
      businessName: manualName.trim(),
      niche,
      city,
      phone: manualPhone,
      whatsapp: cleanPhone,
      subdomain: cleanSlug || 'site-' + Date.now().toString().slice(-4),
      accentColor: recommendation.template.accentColor
    }));

    setPixabayQuery(niche);
    handleSearchPixabay(niche);
    setActiveTab('estudio');
  };

  // =========================================================================
  // HANDLERS DA ABA 2 (GERADOR & WIZARD)
  // =========================================================================
  const handleRecommendTemplateWithAI = () => {
    setIsRecommendingTemplate(true);
    setTimeout(() => {
      const rec = recommendTemplateForNiche(siteForm.niche);
      setSelectedTemplateId(rec.template.id);
      setSiteForm((prev) => ({ ...prev, accentColor: rec.template.accentColor }));
      setTemplateRecommendationReason(rec.reason);
      setIsRecommendingTemplate(false);
    }, 600);
  };

  const handleGenerateCopy = async () => {
    setCopyGenerating(true);
    setCopySuccessNotice(false);
    try {
      const json = await safeFetchJson('/api/studio/gerar-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: siteForm.businessName,
          niche: siteForm.niche,
          city: siteForm.city,
          toneOfVoice: siteForm.toneOfVoice
        })
      });
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
    } catch (err: any) {
      alert('Erro ao gerar copy com IA: ' + err.message);
    } finally {
      setCopyGenerating(false);
    }
  };

  // Extrair texto ou imagem de cardápio com Gemini Vision
  const handleExtractTextOrMenu = async (base64Image?: string) => {
    setIsExtractingOcr(true);
    setOcrSuccessNotice(null);
    try {
      const data = await safeFetchJson('/api/studio/extrair-texto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ocrText,
          imageBase64: base64Image || '',
          niche: siteForm.niche
        })
      });
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setSiteForm((prev) => ({
          ...prev,
          services: [...data.services, ...prev.services]
        }));
        setOcrSuccessNotice(`✨ ${data.services.length} serviços/itens extraídos com sucesso para o site!`);
        setTimeout(() => setOcrSuccessNotice(null), 5000);
      } else {
        alert(data.error || 'Nenhum item reconhecido.');
      }
    } catch (err: any) {
      alert('Erro na extração: ' + err.message);
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      handleExtractTextOrMenu(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return;
    setSiteForm((prev) => ({
      ...prev,
      galleryPhotos: [customPhotoUrl.trim(), ...prev.galleryPhotos]
    }));
    setCustomPhotoUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    setSiteForm((prev) => ({
      ...prev,
      galleryPhotos: prev.galleryPhotos.filter((_, i) => i !== idx)
    }));
  };

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

  const handleRemoveService = (index: number) => {
    setSiteForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // =========================================================================
  // HANDLERS DA ABA 3 (GERAÇÃO & DEPLOY REAL)
  // =========================================================================
  const handleGenerateSite = async () => {
    if (!siteForm.businessName.trim() || !siteForm.subdomain.trim()) {
      alert('Por favor informe o Nome do Negócio e o Subdomínio.');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setDeploySuccessNotice(null);
    setDeployError(null);
    setGenerationStep('Iniciando Motor Gemini do Billy Studio Web...');

    try {
      setTimeout(() => setGenerationStep('Montando template e curadoria de fotos de alta resolução...'), 1200);
      setTimeout(() => setGenerationStep('Redigindo copywriting persuasivo e estrutura de alta conversão...'), 2600);
      setTimeout(() => setGenerationStep('Compilando HTML completo e botões de WhatsApp...'), 4200);

      const data = await safeFetchJson('/api/studio/gerar-site', {
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
          reviews: selectedLeadReviews,
          blocks,
          toneOfVoice: siteForm.toneOfVoice,
          uploadedText: ocrText,
          operatorId,
          operatorName
        })
      });

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar site');
      }

      setGeneratedHtml(data.html || '');
      setIsDeployed(false);
      setDeploySuccessNotice(null);
      setDeployError(null);
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

  // Botão Explícito de "Fazer Deploy no Subdomínio"
  const handleExecuteDeploy = async () => {
    if (!previewSlug) return;
    setIsDeploying(true);
    setDeploySuccessNotice(null);
    setDeployError(null);

    try {
      const data = await safeFetchJson('/api/studio/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: previewSlug,
          html: generatedHtml,
          businessName: siteForm.businessName,
          niche: siteForm.niche,
          city: siteForm.city,
          phone: siteForm.phone,
          whatsapp: siteForm.whatsapp,
          templateId: selectedTemplateId,
          operatorId,
          operatorName
        })
      });

      if (!data.success) {
        throw new Error(data.error || 'Falha ao realizar deploy');
      }

      setIsDeployed(true);
      setDeploySuccessNotice(`✅ Deploy Concluído com Sucesso! O site oficial está online em ${data.subdomainUrl}`);
      loadProjects();
    } catch (err: any) {
      setDeployError(err.message || 'Erro ao realizar deploy do site.');
    } finally {
      setIsDeploying(false);
    }
  };

  // Ajustar Site com IA (Chat Refinement)
  const handleQuickAdjust = async (promptOverride?: string) => {
    const text = promptOverride || quickInstruction;
    if (!text.trim() || !previewSlug || adjustingSite) return;

    setAdjustingSite(true);
    setAdjustSuccessMsg(null);
    try {
      const data = await safeFetchJson('/api/studio/ajustar-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: previewSlug,
          instruction: text,
          currentHtml: generatedHtml
        })
      });
      if (data.success) {
        setAdjustSuccessMsg(`Alteração "${text}" aplicada com sucesso!`);
        setQuickInstruction('');
        if (data.html) {
          setGeneratedHtml(data.html);
          setIsDeployed(false);
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Billy Studio Web • 100% no Navegador</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Estúdio de Prospecção & Criação de Sites IA</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Encontre comércios sem site no Google, configure templates oficiais com o Wizard modular do Desktop,
              gere a landing page com IA e publique no subdomínio oficial <code className="text-[#84cc16] font-mono">*.webbilly.com.br</code>.
            </p>
          </div>

          {/* Seletor de Abas */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-white/[0.08] shrink-0 self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('prospectar')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'prospectar'
                  ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>1. Prospectar Leads</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('estudio')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'estudio'
                  ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Gerador & IA (Desktop Suite)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3. Preview & Deploy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projetos')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'projetos'
                  ? 'bg-[#84cc16] text-black shadow-lg shadow-[#84cc16]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>4. Histórico ({projects.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PROSPECTAR LEADS COM FEEDBACK VISUAL REAL & FALLBACK
         ========================================================================= */}
      {activeTab === 'prospectar' && (
        <div className="space-y-6">
          {/* Formulário de Busca */}
          <div className="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#84cc16]" />
                  <span>Buscar Comércios Locais Sem Site Oficial</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Filtre por nicho e cidade para prospectar empresas com alta probabilidade de fechamento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs text-[#84cc16] hover:underline flex items-center gap-1 font-semibold cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showManualForm ? 'Ocultar Cadastro Manual' : '+ Adicionar Cliente Manualmente'}</span>
              </button>
            </div>

            <form onSubmit={handleSearchLeads} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Ramo / Nicho:
                </label>
                <input
                  type="text"
                  value={nicheQuery}
                  onChange={(e) => setNicheQuery(e.target.value)}
                  placeholder="Ex: Barbearia, Hamburgueria, Odontologia..."
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Cidade e Estado:
                </label>
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Ex: São Paulo, SP ou Campinas, SP"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div className="sm:col-span-3 flex items-end">
                <button
                  type="submit"
                  disabled={leadsLoading}
                  className="w-full py-3 px-5 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] disabled:opacity-50 text-black shadow-lg shadow-[#84cc16]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {leadsLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando comércios...</span>
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

            {/* BANNERS VISÍVEIS DE STATUS E ERRO (NUNCA ENGOLIR ERROS) */}
            {leadsError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <div className="flex-1">
                  <strong>Aviso na busca:</strong> {leadsError}
                </div>
              </div>
            )}

            {googleNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{googleNotice}</span>
              </div>
            )}

            {searchNotice && !leadsError && (
              <div className="p-3 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#a3e635] text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#84cc16]" />
                  <span>{searchNotice}</span>
                </div>
                {providerLabel && (
                  <span className="text-[10px] font-mono uppercase bg-black/40 px-2 py-0.5 rounded border border-[#84cc16]/30 text-zinc-300">
                    Fonte: {providerLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Cadastro Manual de Lead */}
          {showManualForm && (
            <div className="p-6 rounded-3xl bg-[#0e121b] border border-[#84cc16]/30 shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#84cc16]" />
                <span>Inserir Dados do Cliente Manualmente</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Nome da Empresa (ex: Studio Bella)"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={manualNiche}
                  onChange={(e) => setManualNiche(e.target.value)}
                  placeholder="Nicho (ex: Salão de Beleza)"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Cidade e Estado (ex: Campinas - SP)"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="WhatsApp com DDD (ex: 11988887777)"
                  className="bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                />
              </div>
              <button
                type="button"
                onClick={handleUseManualLead}
                disabled={!manualName.trim()}
                className="py-2.5 px-6 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition cursor-pointer disabled:opacity-40"
              >
                Gerar Site com Este Cliente →
              </button>
            </div>
          )}

          {/* Cards de Leads Encontrados */}
          {leadsList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Comércios Encontrados ({leadsList.length}):</span>
                <span>Clique em "Gerar Site com IA" para preencher o Wizard</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leadsList.map((lead, idx) => {
                  const isHot = Boolean(lead.opportunity === 'HOT_NO_WEBSITE' || lead.isHighOpportunity || !lead.hasOwnWebsite);
                  const revCount = lead.reviewsCount || lead.reviews || 0;

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] hover:border-[#84cc16]/50 transition-all duration-200 flex flex-col justify-between group shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-white text-sm group-hover:text-[#a3e635] transition leading-snug">
                            {lead.name}
                          </h4>
                          {isHot && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-rose-400" />
                              <span>Sem Site 🔥</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{lead.address || `${lead.city || cityQuery}`}</span>
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-emerald-400 font-mono">
                              <Phone className="w-3 h-3" />
                              <span>{lead.phone}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{lead.rating || 5.0} ({revCount})</span>
                          </span>
                        </div>

                        {/* Badges de Enriquecimento: Fotos do Google, Avaliações Reais e Horários */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {lead.photos && lead.photos.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <Camera className="w-3 h-3 text-cyan-400" />
                              <span>{lead.photos.length} fotos reais do Google</span>
                            </span>
                          )}
                          {lead.realReviews && lead.realReviews.length > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-amber-400" />
                              <span>{lead.realReviews.length} avaliações reais</span>
                            </span>
                          )}
                          {(lead.hours || lead.openingHours) && (
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-white/[0.08] flex items-center gap-1 max-w-[220px] truncate"
                              title={lead.hours || lead.openingHours}
                            >
                              <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate">{lead.hours || lead.openingHours}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase truncate">
                          {lead.niche || lead.category || nicheQuery}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSelectLead(lead)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black shadow-md shadow-[#84cc16]/20 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gerar Site com IA →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: GERADOR & IA (WIZARD MODULAR DO BILLY DESKTOP)
         ========================================================================= */}
      {activeTab === 'estudio' && (
        <div className="space-y-8">
          {/* SEÇÃO 1: SELETOR VISUAL DOS 20 TEMPLATES REAIS DO BILLY DESKTOP */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#84cc16]" />
                  <span>1. Escolher Template Visual Oficial do Billy Desktop</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Selecione entre os 20 layouts de alta conversão do Billy Suite ou deixe a IA escolher o modelo perfeito.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecommendTemplateWithAI}
                  disabled={isRecommendingTemplate}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-[#84cc16] text-white hover:brightness-110 shadow-lg shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  {isRecommendingTemplate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analisando Nicho...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-amber-300" />
                      <span>✨ Escolher com IA</span>
                    </>
                  )}
                </button>

                {savedPresets.length > 0 && (
                  <div className="relative group">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1.5"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#84cc16]" />
                      <span>Meus Presets ({savedPresets.length})</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-64 bg-[#0a0d14] border border-white/[0.1] rounded-2xl p-2 shadow-2xl hidden group-hover:block z-50">
                      {savedPresets.map((p, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => handleApplyPreset(p)}
                          className="w-full text-left p-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] flex items-center justify-between"
                        >
                          <span className="font-bold truncate">{p.name}</span>
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accentColor }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banner de Recomendação da IA */}
            {templateRecommendationReason && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black/60 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-3">
                <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1">
                  <strong>Recomendação da IA:</strong> {templateRecommendationReason}
                </div>
              </div>
            )}

            {/* Grid dos 20 Templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
              {BILLY_DESKTOP_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tpl.id);
                      setSiteForm((prev) => ({ ...prev, accentColor: tpl.accentColor }));
                    }}
                    className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-[#0f1420] border-[#84cc16] ring-2 ring-[#84cc16]/40 shadow-xl'
                        : 'bg-black/40 border-white/[0.06] hover:border-white/[0.2] hover:bg-black/60'
                    }`}
                  >
                    {/* Imagem de Capa do Template */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-white/[0.06]">
                      <img src={tpl.previewImg} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/[0.1]">
                        {tpl.badge}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#84cc16] text-black flex items-center justify-center font-bold shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block truncate">{tpl.category}</span>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-[#a3e635] transition leading-tight truncate">
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-500">Accent:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.accentColor }} />
                        <span className="text-[10px] font-mono text-zinc-400">{tpl.accentColor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO COMÉRCIO, CATEGORIAS (50+) E TOM DE VOZ */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#84cc16]" />
                  <span>2. Identidade do Estabelecimento & Copywriting</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure o nome, nicho específico, cidade, canais de contato e gere textos persuasivos com IA.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateCopy}
                disabled={copyGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {copyGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redigindo com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Copywriting com IA</span>
                  </>
                )}
              </button>
            </div>

            {copySuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Copywriting persuasivo, serviços e diferenciais preenchidos automaticamente com IA!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Nome do Negócio:
                </label>
                <input
                  type="text"
                  value={siteForm.businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Nicho / Especialidade (50+ Categorias):
                </label>
                <select
                  value={siteForm.niche}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setSiteForm((prev) => ({ ...prev, niche: chosen }));
                    const rec = recommendTemplateForNiche(chosen);
                    setSelectedTemplateId(rec.template.id);
                  }}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                >
                  {CATEGORY_GROUPS.map((grp, gIdx) => (
                    <optgroup key={gIdx} label={grp.group} className="bg-zinc-900 text-zinc-400 font-bold">
                      {grp.categories.map((cat, cIdx) => (
                        <option key={cIdx} value={cat} className="bg-zinc-950 text-white font-normal">
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Cidade e Estado:
                </label>
                <input
                  type="text"
                  value={siteForm.city}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Subdomínio Oficial:
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={siteForm.subdomain}
                    onChange={(e) => setSiteForm((prev) => ({ ...prev, subdomain: e.target.value }))}
                    className="w-full bg-[#07090e] border border-white/[0.1] rounded-l-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                  <span className="bg-black/60 border border-l-0 border-white/[0.1] px-3 py-2.5 rounded-r-xl text-xs text-zinc-500 font-mono">
                    .webbilly.com.br
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  WhatsApp Oficial (com DDD):
                </label>
                <input
                  type="text"
                  value={siteForm.whatsapp}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="5511999998888"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Tom de Voz da Copy:
                </label>
                <select
                  value={siteForm.toneOfVoice}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, toneOfVoice: e.target.value }))}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                >
                  {TONES_OF_VOICE.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Headline / Slogan de Impacto:
                </label>
                <input
                  type="text"
                  value={siteForm.tagline}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Endereço / Localização:
                </label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: TOGGLES MODULARES DE SEÇÕES (IGUAL AO DESKTOP SUITE) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#84cc16]" />
                  <span>3. Seções Modulares do Site (Toggles Liga/Desliga)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Ative ou desative seções de acordo com a necessidade do cliente (idêntico ao app desktop).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSavePresetInput(!showSavePresetInput)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#84cc16]" />
                  <span>Salvar como Preset</span>
                </button>
              </div>
            </div>

            {showSavePresetInput && (
              <div className="p-4 rounded-2xl bg-black/60 border border-[#84cc16]/40 flex items-center gap-3">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Nome do seu preset (ex: Modelo Clínica VIP)"
                  className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomPreset}
                  disabled={!newPresetName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition cursor-pointer disabled:opacity-40"
                >
                  Salvar
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { id: 'topBar', label: 'Top Notification Bar' },
                { id: 'hero', label: 'Hero Principal' },
                { id: 'about', label: 'Sobre Nós / História' },
                { id: 'pricingTable', label: 'Serviços & Preços' },
                { id: 'gallery', label: 'Galeria de Fotos' },
                { id: 'reviews', label: 'Depoimentos / Avaliações' },
                { id: 'hours', label: 'Horários de Funcionamento' },
                { id: 'map', label: 'Mapa de Localização' },
                { id: 'faq', label: 'FAQ / Dúvidas Frequentes' },
                { id: 'contactForm', label: 'Formulário Web3Forms' },
                { id: 'partners', label: 'Marcas Parceiras' },
                { id: 'whatsappFloat', label: 'Botão WhatsApp Flutuante' }
              ].map((item) => {
                const isActive = blocks[item.id as keyof BlockToggles];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBlocks((prev) => ({ ...prev, [item.id]: !isActive }))}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                      isActive
                        ? 'bg-[#84cc16]/10 border-[#84cc16]/50 text-white'
                        : 'bg-black/30 border-white/[0.06] text-zinc-500 hover:border-white/[0.15]'
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                    <span className={`text-[10px] font-mono font-extrabold uppercase ${isActive ? 'text-[#84cc16]' : 'text-zinc-600'}`}>
                      {isActive ? '● Ativo' : '○ Desligado'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 4: EXTRAÇÃO INTELIGENTE DE CARDÁPIO / TABELA DE PREÇOS (OCR / IA) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#84cc16]" />
                  <span>4. Extração Inteligente de Cardápio ou Tabela de Preços</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Cole o texto bruto de um cardápio ou faça upload de um print/foto para a IA transcrever os itens e preços.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtractingOcr}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-[#84cc16]" />
                  <span>Upload de Foto do Cardápio</span>
                </button>
              </div>
            </div>

            {ocrSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{ocrSuccessNotice}</span>
              </div>
            )}

            <div className="space-y-3">
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="Cole aqui o texto do cardápio, tabela de preços, serviços com valores (ex: Corte Masculino R$ 45, Barba R$ 35, Selagem R$ 120)..."
                rows={3}
                className="w-full bg-[#07090e] border border-white/[0.1] rounded-2xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Suporta texto bruto, linhas de WhatsApp ou imagens com OCR do Gemini
                </span>
                <button
                  type="button"
                  onClick={() => handleExtractTextOrMenu()}
                  disabled={isExtractingOcr || !ocrText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  {isExtractingOcr ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extraindo itens com IA...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Extrair Itens & Preços</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Lista Atual de Serviços / Itens */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Itens Cadastrados no Site ({siteForm.services.length}):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {siteForm.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-white truncate block">{srv.name}</span>
                      <span className="text-[11px] font-mono text-[#84cc16]">{srv.price}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inserir Item Rápido */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Novo item / serviço..."
                  className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                />
                <input
                  type="text"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="R$ 50,00"
                  className="w-28 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
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
          </div>

          {/* SEÇÃO 5: CENTRAL INTELIGENTE DE FOTOS DO ESTABELECIMENTO */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e121b] border border-white/[0.06] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#84cc16]" />
                  <span>5. Fotos do Estabelecimento (Google, Instagram & Pixabay)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Importe fotografias reais do Google Maps e Instagram do cliente ou use fotos conceituais HD.
                </p>
              </div>

              {/* Seletor de Abas de Fotos */}
              <div className="flex items-center gap-1 p-1 bg-[#07090e] border border-white/[0.08] rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setPhotoSearchMode('real')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    photoSearchMode === 'real'
                      ? 'bg-[#84cc16] text-black shadow-md shadow-[#84cc16]/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Fotos Reais (Google / Insta)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSearchMode('pixabay')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    photoSearchMode === 'pixabay'
                      ? 'bg-[#84cc16] text-black shadow-md shadow-[#84cc16]/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Banco Pixabay HD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSearchMode('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    photoSearchMode === 'custom'
                      ? 'bg-[#84cc16] text-black shadow-md shadow-[#84cc16]/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Colar URL</span>
                </button>
              </div>
            </div>

            {/* Aviso de Sucesso */}
            {realPhotosSuccessNotice && (
              <div className="p-3 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#a3e635] text-xs flex items-center justify-between gap-2">
                <span>{realPhotosSuccessNotice}</span>
                <button type="button" onClick={() => setRealPhotosSuccessNotice(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* MODO 1: FOTOS REAIS DO ESTABELECIMENTO (GOOGLE & INSTAGRAM) */}
            {photoSearchMode === 'real' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={realPhotosQuery}
                      onChange={(e) => setRealPhotosQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchRealPhotos()}
                      placeholder="Nome da empresa, cidade ou @Instagram (ex: Caixa Preta Tattoo São Paulo)..."
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearchRealPhotos()}
                    disabled={realPhotosLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16] hover:bg-[#9ae639] text-black transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {realPhotosLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>{realPhotosLoading ? 'Buscando...' : 'Buscar Fotos Reais'}</span>
                  </button>
                  {realPhotos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyRealPhotosToSite}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.1] transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#84cc16]" />
                      <span>Aplicar Todas no Site</span>
                    </button>
                  )}
                </div>

                {/* Grade de Fotos Reais */}
                {realPhotosLoading ? (
                  <div className="py-12 text-center text-zinc-500 space-y-2">
                    <Loader2 className="w-8 h-8 border-2 border-[#84cc16] rounded-full animate-spin mx-auto text-[#84cc16]" />
                    <p className="text-xs">Localizando fotografias públicas no Google Imagens e redes sociais...</p>
                  </div>
                ) : realPhotos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#07090e]/60 border border-dashed border-white/[0.08] text-center space-y-3">
                    <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-zinc-300">Nenhuma foto real carregada ainda.</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Clique em "Buscar Fotos Reais" para rastrear o portfólio no Google Maps e redes sociais de{' '}
                        <strong>{siteForm.businessName || 'deste comércio'}</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSearchRealPhotos(`${siteForm.businessName} ${siteForm.city}`)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/30 transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar Fotos de {siteForm.businessName || 'Empresa'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {realPhotos.map((item, i) => {
                      const target = item.url;
                      const isHero = siteForm.heroPhoto === target;
                      const isGallery = siteForm.galleryPhotos.includes(target);
                      const displayThumb = item.proxyUrl || `/api/studio/image-proxy?url=${encodeURIComponent(target)}`;

                      return (
                        <div
                          key={item.id || i}
                          className={`relative rounded-xl overflow-hidden aspect-square border group transition-all ${
                            isHero
                              ? 'border-[#84cc16] ring-2 ring-[#84cc16]'
                              : isGallery
                              ? 'border-emerald-500 ring-1 ring-emerald-500'
                              : 'border-white/[0.08]'
                          }`}
                        >
                          <img
                            src={displayThumb}
                            alt={item.title || ''}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Remove automaticamente o card da imagem quebrada ou expirada
                              setRealPhotos((prev) => prev.filter((p) => p.id !== item.id));
                            }}
                          />
                          <span
                            className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              item.source === 'instagram'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {item.source === 'instagram' ? 'Instagram' : 'Google'}
                          </span>
                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition p-1.5">
                            <button
                              type="button"
                              onClick={() => setSiteForm((prev) => ({ ...prev, heroPhoto: target }))}
                              className="px-2 py-1 rounded text-[9px] font-bold bg-[#84cc16] text-black w-full text-center cursor-pointer"
                            >
                              Hero ★
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (siteForm.galleryPhotos.includes(target)) {
                                  setSiteForm((prev) => ({
                                    ...prev,
                                    galleryPhotos: prev.galleryPhotos.filter((p) => p !== target)
                                  }));
                                } else {
                                  setSiteForm((prev) => ({
                                    ...prev,
                                    galleryPhotos: [...prev.galleryPhotos, target]
                                  }));
                                }
                              }}
                              className="px-2 py-1 rounded text-[9px] font-bold bg-white text-black w-full text-center cursor-pointer"
                            >
                              {isGallery ? 'Remover' : '+ Galeria'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODO 2: BANCO PIXABAY HD */}
            {photoSearchMode === 'pixabay' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pixabayQuery}
                    onChange={(e) => setPixabayQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPixabay()}
                    placeholder="Buscar no Pixabay (ex: barbearia, tattoo, odontologia)..."
                    className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchPixabay()}
                    disabled={pixabayLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {pixabayLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Buscar</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {pixabayImages.map((img, i) => {
                    const target = img.largeUrl || img.previewUrl;
                    const isHero = siteForm.heroPhoto === target;
                    const isGallery = siteForm.galleryPhotos.includes(target);

                    return (
                      <div
                        key={i}
                        className={`relative rounded-xl overflow-hidden aspect-video border group transition-all ${
                          isHero
                            ? 'border-[#84cc16] ring-2 ring-[#84cc16]'
                            : isGallery
                            ? 'border-emerald-500'
                            : 'border-white/[0.08]'
                        }`}
                      >
                        <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition p-1">
                          <button
                            type="button"
                            onClick={() => setSiteForm((prev) => ({ ...prev, heroPhoto: target }))}
                            className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#84cc16] text-black w-full text-center cursor-pointer"
                          >
                            Hero ★
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (siteForm.galleryPhotos.includes(target)) {
                                setSiteForm((prev) => ({
                                  ...prev,
                                  galleryPhotos: prev.galleryPhotos.filter((p) => p !== target)
                                }));
                              } else {
                                setSiteForm((prev) => ({
                                  ...prev,
                                  galleryPhotos: [...prev.galleryPhotos, target]
                                }));
                              }
                            }}
                            className="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-black w-full text-center cursor-pointer"
                          >
                            {isGallery ? 'Remover' : '+ Galeria'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODO 3: ADICIONAR URL DIRETA */}
            {photoSearchMode === 'custom' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="Colar URL de foto do Instagram, Google Fotos, Imgur ou site..."
                    className="flex-1 bg-[#07090e] border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#84cc16]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPhoto}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white transition cursor-pointer"
                  >
                    + Adicionar Foto
                  </button>
                </div>
              </div>
            )}

            {/* Fotos Atualmente Selecionadas para o Site */}
            <div className="pt-4 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-300 block">
                  Fotos Selecionadas para o Site ({siteForm.galleryPhotos.length}):
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Passe o mouse na miniatura para excluir
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {siteForm.galleryPhotos.map((photo, i) => {
                  const isGoogle = photo.includes('googleusercontent.com') || photo.includes('places.googleapis.com');
                  const isInstagram = photo.includes('cdninstagram.com') || photo.includes('fbcdn.net');
                  const displayThumb = isGoogle || isInstagram
                    ? `/api/studio/image-proxy?url=${encodeURIComponent(photo)}`
                    : photo;

                  return (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/[0.1] group">
                      <img
                        src={displayThumb}
                        alt=""
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={() => handleRemovePhoto(i)}
                      />
                      {(isGoogle || isInstagram) && (
                        <span
                          className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase shadow-md flex items-center gap-0.5 z-10 pointer-events-none ${
                            isInstagram ? 'bg-purple-600 text-white' : 'bg-[#84cc16] text-black'
                          }`}
                        >
                          <Camera className="w-2.5 h-2.5" />
                          <span>{isInstagram ? 'Instagram' : 'Google Maps'}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTÃO FINAL DE GERAÇÃO & PUBLICAÇÃO */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c1322] via-[#101b2e] to-[#0c1a16] border border-[#84cc16]/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#84cc16] tracking-wider block">Motor Gemini Oficial</span>
              <h4 className="text-base font-black text-white">Gere a Landing Page Completa sem Placeholders</h4>
              <p className="text-xs text-zinc-400">O site será compilado instantaneamente com fotos, copy e WhatsApp configurado.</p>
            </div>

            <button
              type="button"
              onClick={handleGenerateSite}
              disabled={generating}
              className="py-3.5 px-8 rounded-2xl font-black text-sm bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:brightness-110 text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] flex items-center justify-center gap-2 cursor-pointer transition shrink-0 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Gerando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  <span>🚀 Gerar Site Completo & Ir para Preview</span>
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
          TAB 3: PREVIEW INSTANTÂNEO (`srcDoc`) & BOTÃO REAL DE DEPLOY
         ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {previewSlug ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna da Esquerda: Iframe Multi-Device Preview + Barra de Ajuste IA */}
              <div className="lg:col-span-8 space-y-4">
                {/* Controles de Dispositivo & Tela Cheia */}
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

                  {/* Abrir em Tela Cheia & Subdomínio */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFullScreenPreview(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white border border-white/[0.08] flex items-center gap-1.5 transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#84cc16]" />
                      <span className="hidden sm:inline">Tela Cheia</span>
                    </button>

                    {isDeployed ? (
                      <a
                        href={`https://${previewSlug}.webbilly.com.br`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-[#84cc16] hover:bg-[#9ae639] text-xs font-bold text-black border border-[#84cc16] flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-black" />
                        <span className="hidden sm:inline">Abrir Subdomínio ↗</span>
                      </a>
                    ) : (
                      <ActionTooltip
                        title="Subdomínio Bloqueado"
                        description="Clique em '🚀 Fazer Deploy no Subdomínio' ao lado para publicar oficialmente este site."
                        side="bottom"
                      >
                        <button
                          type="button"
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-white/[0.03] text-xs font-semibold text-zinc-500 border border-white/[0.06] flex items-center gap-1.5 cursor-not-allowed opacity-60"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="hidden sm:inline">Abrir Subdomínio (Faça Deploy Primeiro)</span>
                        </button>
                      </ActionTooltip>
                    )}
                  </div>
                </div>

                {/* Container Iframe com PREVIEW INSTANTÂNEO (srcDoc) */}
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
                    {generatedHtml ? (
                      <iframe
                        id="studio-preview-iframe"
                        srcDoc={generatedHtml}
                        title="Preview do Site Instantâneo"
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <iframe
                        id="studio-preview-iframe"
                        src={`/api/public/site/${previewSlug}/render`}
                        title="Preview do Site Render"
                        className="w-full h-full border-0"
                      />
                    )}
                  </div>
                </div>

                {/* BARRA DE AJUSTE RÁPIDO COM IA */}
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
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
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

              {/* Coluna da Direita: BOTÃO EXPLÍCITO DE DEPLOY & PROPOSTA WHATSAPP */}
              <div className="lg:col-span-4 space-y-4">
                {/* CARD DE DEPLOY DEFINITIVO NO SUBDOMÍNIO */}
                <div className="p-6 rounded-3xl bg-[#0e121b] border border-[#84cc16]/40 shadow-xl space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-[#84cc16]/20 text-[#a3e635] border border-[#84cc16]/30">
                      Publicação Oficial
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-2">Deploy no Subdomínio</h3>
                    <p className="text-xs text-zinc-400">
                      Salva o HTML definitivamente no Supabase, cadastra o domínio na Vercel e remove suspensão do Edge Config.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteDeploy}
                    disabled={isDeploying}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-[#84cc16] to-[#65a30d] hover:brightness-110 text-black shadow-lg shadow-[#84cc16]/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Publicando na Nuvem...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-black" />
                        <span>🚀 Fazer Deploy no Subdomínio</span>
                      </>
                    )}
                  </button>

                  {deploySuccessNotice && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Site Publicado e 100% Online!</span>
                      </div>
                      <a
                        href={`https://${previewSlug}.webbilly.com.br`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#84cc16] underline block font-mono"
                      >
                        https://{previewSlug}.webbilly.com.br
                      </a>
                    </div>
                  )}

                  {deployError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{deployError}</span>
                    </div>
                  )}
                </div>

                {/* CARD DE FECHAMENTO DE VENDA & WHATSAPP */}
                <div className="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.08] shadow-xl space-y-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Fechamento da Venda
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-2">Disparar Proposta Comercial</h3>
                    <p className="text-xs text-zinc-400">
                      Mensagem formatada com isolamento de link para gerar prévia no WhatsApp.
                    </p>
                  </div>

                  {/* Links de Acesso Rápido */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-zinc-400">Subdomínio Oficial:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`https://${previewSlug}.webbilly.com.br`, 'link')}
                          className="text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <span className="text-xs font-mono text-[#a3e635] truncate block">
                        https://{previewSlug}.webbilly.com.br
                      </span>
                    </div>

                    {generatedResult?.proposalUrl && (
                      <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-zinc-400">Proposta & Checkout Pix:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(generatedResult.proposalUrl, 'link')}
                            className="text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </button>
                        </div>
                        <span className="text-xs font-mono text-zinc-300 truncate block">
                          {generatedResult.proposalUrl}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Texto da Mensagem WhatsApp */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-zinc-400">Mensagem do WhatsApp:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(customWaMessage || generatedResult?.whatsappMessage, 'msg')}
                        className="text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedMsg ? 'Mensagem Copiada!' : 'Copiar Texto'}</span>
                      </button>
                    </div>
                    <textarea
                      value={customWaMessage || generatedResult?.whatsappMessage || ''}
                      onChange={(e) => setCustomWaMessage(e.target.value)}
                      rows={6}
                      className="w-full bg-[#07090e] border border-white/[0.1] rounded-2xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-[#84cc16] leading-relaxed font-sans"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-[#25D366]/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enviar Proposta no WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-[#0e121b] border border-white/[0.06] text-center space-y-4">
              <Eye className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum site em pré-visualização ativa</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Retorne à aba <strong>1. Prospectar Leads</strong> ou configure um comércio em <strong>2. Gerador & IA</strong> para gerar seu site com preview instantâneo.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('estudio')}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#84cc16] text-black cursor-pointer"
              >
                Abrir Estúdio de Criação →
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
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white">Sites Gerados na Plataforma ({projects.length})</h3>
            <button
              type="button"
              onClick={loadProjects}
              className="text-xs text-[#84cc16] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar</span>
            </button>
          </div>

          {projectsLoading ? (
            <div className="p-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#84cc16]" />
              <span>Carregando histórico...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0e121b] border border-white/[0.06] text-center text-xs text-zinc-500">
              Nenhum site gerado até o momento. Comece pela aba <strong>1. Prospectar Leads</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id || proj.slug}
                  className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] hover:border-white/[0.15] transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm truncate">{proj.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{proj.niche}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Online
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <a
                      href={proj.subdomainUrl || `https://${proj.slug}.webbilly.com.br`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 font-mono text-[11px] truncate block hover:underline"
                    >
                      {proj.subdomainUrl || `https://${proj.slug}.webbilly.com.br`}
                    </a>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewSlug(proj.slug);
                          setGeneratedHtml('');
                          setActiveTab('preview');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Preview</span>
                      </button>

                      <a
                        href={proj.proposalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#84cc16]/15 hover:bg-[#84cc16] text-[#84cc16] hover:text-black border border-[#84cc16]/40 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Proposta</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.slug)}
                      className="p-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition cursor-pointer"
                      title="Excluir site do Histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL FULLSCREEN PREVIEW
         ========================================================================= */}
      {fullScreenPreview && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in">
          <div className="h-14 bg-[#0e121b] border-b border-white/[0.08] px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-white text-sm">Preview em Tela Cheia</span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs font-mono">https://{previewSlug}.webbilly.com.br</span>
            </div>

            <div className="flex items-center gap-3">
              {isDeployed ? (
                <a
                  href={`https://${previewSlug}.webbilly.com.br`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#84cc16] hover:bg-[#9ae639] text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Subdomínio Real ↗</span>
                </a>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] text-zinc-500 font-semibold text-xs border border-white/[0.08] flex items-center gap-1.5 cursor-not-allowed">
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Subdomínio Bloqueado (Faça Deploy Primeiro)</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setFullScreenPreview(false)}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full bg-white">
            {generatedHtml ? (
              <iframe
                srcDoc={generatedHtml}
                title="Preview em Tela Cheia"
                className="w-full h-full border-0"
              />
            ) : (
              <iframe
                src={`/api/public/site/${previewSlug}/render`}
                title="Preview em Tela Cheia"
                className="w-full h-full border-0"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
