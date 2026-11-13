'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Globe,
  Upload,
  Image as ImageIcon,
  User,
  Phone,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

interface GalleryPhotoItem {
  id: string;
  dataUrl: string;
  fileName: string;
  description: string;
  placementHint: string;
}

function FormularioAlteracaoContent() {
  const searchParams = useSearchParams();
  const initialSite = searchParams.get('site') || searchParams.get('slug') || '';

  const [siteSlug, setSiteSlug] = useState(initialSite);
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');

  // 1. Identidade & Contatos
  const [logoFile, setLogoFile] = useState<{ dataUrl: string; fileName: string } | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newHours, setNewHours] = useState('');

  // 2. Foto do Proprietário / Equipe
  const [ownerPhoto, setOwnerPhoto] = useState<{ dataUrl: string; fileName: string; description: string } | null>(null);

  // 3. Fotos de Trabalhos / Produtos / Cardápio (Lote com legendas)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);

  // 4. Observações gerais
  const [generalNotes, setGeneralNotes] = useState('');

  // Estados de envio
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  useEffect(() => {
    if (initialSite) {
      setSiteSlug(initialSite);
    }
  }, [initialSite]);

  // Handler Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoFile({
        dataUrl: reader.result as string,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Handler Upload Foto Proprietário
  const handleOwnerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOwnerPhoto({
        dataUrl: reader.result as string,
        fileName: file.name,
        description: ownerPhoto?.description || ''
      });
    };
    reader.readAsDataURL(file);
  };

  // Handler Upload Fotos da Galeria / Cardápio em Lote
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        setGalleryPhotos(prev => [
          ...prev,
          {
            id: `photo_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
            dataUrl: reader.result as string,
            fileName: file.name,
            description: '',
            placementHint: 'Galeria Principal'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateGalleryPhotoDesc = (id: string, desc: string) => {
    setGalleryPhotos(prev =>
      prev.map(p => (p.id === id ? { ...p, description: desc } : p))
    );
  };

  const updateGalleryPhotoPlacement = (id: string, placement: string) => {
    setGalleryPhotos(prev =>
      prev.map(p => (p.id === id ? { ...p, placementHint: placement } : p))
    );
  };

  const removeGalleryPhoto = (id: string) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Envio do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanSlug = siteSlug.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\.webbilly\.com\.br.*$/, '');

    if (!cleanSlug) {
      setErrorMsg('Por favor, informe o subdomínio ou nome do seu site.');
      return;
    }

    // Verifica se há foto de proprietário sem descrição
    if (ownerPhoto && !ownerPhoto.description.trim()) {
      setErrorMsg('Por favor, descreva quem é e onde deseja posicionar a Foto do Proprietário/Equipe.');
      return;
    }

    const hasAnyChange =
      logoFile ||
      newPhone.trim() ||
      newWhatsapp.trim() ||
      newAddress.trim() ||
      newHours.trim() ||
      ownerPhoto ||
      galleryPhotos.length > 0 ||
      generalNotes.trim();

    if (!hasAnyChange) {
      setErrorMsg('Por favor, preencha ao menos uma alteração que deseja solicitar para o seu site.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        siteSlug: cleanSlug,
        clientName: clientName.trim() || undefined,
        clientWhatsapp: clientWhatsapp.trim() || undefined,
        changesPayload: {
          logoUrl: logoFile?.dataUrl,
          logoFileName: logoFile?.fileName,
          newPhone: newPhone.trim() || undefined,
          newWhatsapp: newWhatsapp.trim() || undefined,
          newAddress: newAddress.trim() || undefined,
          newHours: newHours.trim() || undefined,
          ownerOrTeamPhoto: ownerPhoto
            ? {
                url: ownerPhoto.dataUrl,
                fileName: ownerPhoto.fileName,
                description: ownerPhoto.description.trim()
              }
            : undefined,
          galleryPhotos: galleryPhotos.map(p => ({
            url: p.dataUrl,
            fileName: p.fileName,
            description: p.description.trim(),
            placementHint: p.placementHint
          })),
          generalNotes: generalNotes.trim() || undefined
        }
      };

      const res = await fetch('/api/public/site-changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao enviar alterações.');

      setSuccessSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao enviar alterações. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successSubmitted) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-[#11141c] border border-emerald-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Solicitação Recebida com Sucesso!</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Recebemos os novos dados e fotos para o site <strong className="text-emerald-400 font-mono">{siteSlug}.webbilly.com.br</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.06] text-xs text-zinc-300 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>O que acontece agora?</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Nossa equipe técnica e o seu consultor responsável já foram notificados. As fotos e textos serão integrados com inteligência artificial preservando a alta performance do seu site. Você receberá o aviso assim que estiver no ar!
            </p>
          </div>

          <button
            onClick={() => {
              setSuccessSubmitted(false);
              setGeneralNotes('');
              setGalleryPhotos([]);
              setOwnerPhoto(null);
              setLogoFile(null);
            }}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 transition cursor-pointer"
          >
            Enviar Nova Solicitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Central Oficial de Atualizações • Webbilly</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Formulário de Alteração do Site
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Preencha <strong>apenas as informações que deseja modificar ou adicionar</strong>. Deixe em branco tudo o que deve permanecer como está.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BLOCO 0: IDENTIFICAÇÃO DO SITE */}
          <div className="p-6 rounded-3xl bg-[#11141c] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/[0.06] pb-3">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Identificação do Seu Site</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Subdomínio / Link do Site *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={siteSlug}
                    onChange={(e) => setSiteSlug(e.target.value)}
                    placeholder="ex: autoescola-grandprix"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">.webbilly.com.br</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome do Estabelecimento / Responsável
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ex: Autoescola Grand Prix"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Seu WhatsApp de Contato
                </label>
                <input
                  type="text"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  placeholder="ex: (11) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 1: IDENTIDADE & CONTATO */}
          <div className="p-6 rounded-3xl bg-[#11141c] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/[0.06] pb-3">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contatos & Dados do Estabelecimento (Preencha só o que mudar)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nova Logo */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nova Logomarca (PNG transparente ou JPG)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 border-2 border-dashed border-white/[0.1] hover:border-emerald-500/40 rounded-2xl p-4 text-center cursor-pointer transition bg-[#141824]/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-medium text-zinc-300">
                        {logoFile ? logoFile.fileName : 'Clique para selecionar nova imagem de logo'}
                      </span>
                      <span className="text-[10px] text-zinc-500">PNG, JPG, SVG ou WEBP</span>
                    </div>
                  </label>
                  {logoFile && (
                    <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/[0.1] p-1 flex items-center justify-center shrink-0 relative group">
                      <img src={logoFile.dataUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setLogoFile(null)}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-md"
                        title="Remover logo"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Telefone Comercial / Fixo Atualizado
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="ex: (11) 2233-4455"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  WhatsApp Oficial para Botão do Site
                </label>
                <input
                  type="text"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="ex: (11) 98765-4321"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Endereço Completo & Cidade
                </label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Horário de Funcionamento
                </label>
                <input
                  type="text"
                  value={newHours}
                  onChange={(e) => setNewHours(e.target.value)}
                  placeholder="ex: Seg a Sex: 08:00 às 19:00 • Sáb: 08:00 às 13:00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: FOTO DO PROPRIETÁRIO / EQUIPE */}
          <div className="p-6 rounded-3xl bg-[#11141c] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/[0.06] pb-3">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Foto do Proprietário ou Equipe</span>
            </div>

            <div className="space-y-3">
              <label className="block border-2 border-dashed border-white/[0.1] hover:border-cyan-500/40 rounded-2xl p-4 text-center cursor-pointer transition bg-[#141824]/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOwnerPhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-medium text-zinc-300">
                    {ownerPhoto ? ownerPhoto.fileName : 'Clique para selecionar foto do proprietário ou equipe'}
                  </span>
                  <span className="text-[10px] text-zinc-500">Foto profissional do fundador, equipe de atendimento ou fachada com responsável</span>
                </div>
              </label>

              {ownerPhoto && (
                <div className="p-4 rounded-2xl bg-[#141824] border border-cyan-500/20 flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-black/60 border border-white/[0.1] overflow-hidden shrink-0">
                    <img src={ownerPhoto.dataUrl} alt="Proprietário" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-cyan-300">Descrição Obrigatória da Foto:</span>
                      <button
                        type="button"
                        onClick={() => setOwnerPhoto(null)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={ownerPhoto.description}
                      onChange={(e) => setOwnerPhoto({ ...ownerPhoto, description: e.target.value })}
                      placeholder="Ex: Foto do Dr. Marcos Silva (fundador) para a seção Sobre Nós"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0e121a] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BLOCO 3: FOTOS DE TRABALHOS / PRODUTOS / CARDÁPIO (MÚLTIPLAS COM LEGENDA) */}
          <div className="p-6 rounded-3xl bg-[#11141c] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Fotos de Trabalhos, Produtos ou Cardápio (Lote com Legendas)</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-semibold">
                {galleryPhotos.length} fotos adicionadas
              </span>
            </div>

            <div className="space-y-4">
              <label className="block border-2 border-dashed border-white/[0.1] hover:border-amber-500/40 rounded-2xl p-6 text-center cursor-pointer transition bg-[#141824]/50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-amber-400" />
                  <span className="text-xs sm:text-sm font-bold text-zinc-200">
                    Clique aqui para selecionar múltiplas fotos de uma só vez
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Você pode escolher quantas fotos quiser. Para cada foto, informe a legenda ou onde deseja inseri-la.
                  </span>
                </div>
              </label>

              {/* Lista de fotos carregadas */}
              {galleryPhotos.length > 0 && (
                <div className="space-y-3">
                  {galleryPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="p-3.5 rounded-2xl bg-[#141824] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/[0.08] overflow-hidden shrink-0">
                        <img src={photo.dataUrl} alt={photo.fileName} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-400 mb-0.5">
                            Legenda / O que é esta foto? (Foto #{index + 1})
                          </label>
                          <input
                            type="text"
                            value={photo.description}
                            onChange={(e) => updateGalleryPhotoDesc(photo.id, e.target.value)}
                            placeholder="Ex: Hambúrguer Especial Duplo Cheddar ou Reforma Concluída"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0e121a] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-400 mb-0.5">
                            Onde colocar no site?
                          </label>
                          <select
                            value={photo.placementHint}
                            onChange={(e) => updateGalleryPhotoPlacement(photo.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0e121a] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Galeria Principal">Galeria Principal de Fotos</option>
                            <option value="Cardápio / Serviços">Cardápio / Seção de Serviços e Preços</option>
                            <option value="Banner Principal">Banner de Destaque no Topo</option>
                            <option value="Depoimentos / Clientes">Depoimentos / Clientes Atendidos</option>
                            <option value="Sobre Nós / Estrutura">Sobre Nós / Estrutura da Empresa</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGalleryPhoto(photo.id)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                        title="Remover foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* BLOCO 4: OUTRAS OBSERVAÇÕES & NOVOS TEXTOS */}
          <div className="p-6 rounded-3xl bg-[#11141c] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-white/[0.06] pb-3">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Outras Alterações, Textos, Novos Preços ou Ajustes</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Descreva quaisquer outras alterações que deseja no site:
              </label>
              <textarea
                rows={4}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Ex: Atualizar o preço da CNH B para R$ 1.290 à vista, trocar o texto do cabeçalho para 'Matrículas Abertas 2026', adicionar botão para agendamento direto..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
          </div>

          {/* BOTÃO DE SUBMISSÃO */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-950/50 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando Alterações para a Equipe...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Enviar Solicitação de Atualização</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              Seu pedido será direcionado instantaneamente para o consultor e equipe de IA da Webbilly.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FormularioAlteracaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-zinc-400 text-xs">Carregando formulário...</div>}>
      <FormularioAlteracaoContent />
    </Suspense>
  );
}
