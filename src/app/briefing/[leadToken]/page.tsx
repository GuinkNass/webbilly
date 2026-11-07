'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  DollarSign,
  MapPin,
  Phone,
  Building,
  Upload,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ServiceItem {
  name: string;
  price: string;
  description: string;
}

export default function BriefingPage() {
  const params = useParams();
  const leadToken = (params?.leadToken as string) || '';

  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bio, setBio] = useState('');
  const [domainIdeas, setDomainIdeas] = useState(['', '', '']);
  const [services, setServices] = useState<ServiceItem[]>([
    { name: 'Serviço Principal', price: '45,00', description: 'Atendimento completo e personalizado' },
    { name: 'Combo Especial', price: '75,00', description: 'Pacote promocional mais pedido' }
  ]);
  const [photos, setPhotos] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados se já existirem
  useEffect(() => {
    if (!leadToken) return;
    fetch(`/api/public/briefing/${leadToken}`)
      .then(res => res.json())
      .then(data => {
        if (data?.briefing) {
          const b = data.briefing;
          if (b.title) setTitle(b.title);
          if (b.phone) setPhone(b.phone);
          if (b.category) setCategory(b.category);
          if (b.address) setAddress(b.address);
          if (b.instagram) setInstagram(b.instagram);
          if (b.bio) setBio(b.bio);
          if (Array.isArray(b.services) && b.services.length > 0) setServices(b.services);
          if (Array.isArray(b.domainIdeas) && b.domainIdeas.length > 0) setDomainIdeas(b.domainIdeas);
          if (Array.isArray(b.photos) && b.photos.length > 0) setPhotos(b.photos);
        }
      })
      .catch(() => {});
  }, [leadToken]);

  // Manipulação de fotos (leitura base64 no cliente)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 6 - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => {
            if (prev.length >= 6) return prev;
            return [...prev, event.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const addService = () => {
    setServices([...services, { name: '', price: '', description: '' }]);
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const removeService = (index: number) => {
    if (services.length <= 1) {
      alert('Mantenha pelo menos um serviço cadastrado.');
      return;
    }
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStepProgress(25);
    setProgressText('Conectando ao núcleo de IA...');

    const payload = {
      leadToken,
      title,
      phone,
      category,
      address,
      instagram,
      bio,
      services: services.filter(s => s.name.trim()),
      domainIdeas: domainIdeas.filter(d => d.trim()),
      photos
    };

    try {
      setTimeout(() => {
        setStepProgress(60);
        setProgressText('Organizando catálogo de serviços e fotos reais...');
      }, 1000);

      setTimeout(() => {
        setStepProgress(85);
        setProgressText('Notificando a esteira do seu consultor...');
      }, 2200);

      const res = await fetch(`/api/public/briefing/${leadToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar formulário');
      }

      setStepProgress(100);
      setProgressText('Concluído com sucesso!');

      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar dados. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Top Header com Logo Oficial */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img src="/billy-logo.png" alt="Billy Suite" className="h-9 w-9 object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Billy Suite</span>
                <span className="font-mono text-[9px] uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                  Briefing Oficial
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Personalização em Tempo Real da sua Página</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> Leva menos de 2 min
            </span>
          </div>
        </div>

        {/* Modal de Sucesso */}
        {success ? (
          <div className="bg-[#0b101c] border border-emerald-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">Formulário Enviado com Sucesso!</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Nossa Inteligência Artificial já recebeu suas fotos, serviços e dados. O seu consultor comercial está gerando a versão personalizada do seu site e enviará o link atualizado no seu WhatsApp em instantes!
            </p>
            <div className="p-4 rounded-2xl bg-[#070a11] border border-white/[0.08] text-xs font-mono text-slate-400">
              Token de Ativação: <strong className="text-blue-400">{leadToken}</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bloco de Apresentação */}
            <div className="bg-[#0b101c] border border-blue-500/20 rounded-2xl p-6 shadow-xl">
              <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold block mb-1">
                Etapa 1 de 4 • Dados do Estabelecimento
              </span>
              <h1 className="text-xl font-bold text-white mb-2">
                Como devemos apresentar o seu negócio na internet?
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                Preencha os dados exatamente como deseja que apareçam no seu site oficial e no botão de WhatsApp.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                    Nome Oficial da Empresa / Loja *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Boutique Banho E Tosa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                      WhatsApp Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                      Ramo de Atuação / Categoria *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pet Shop & Estética Animal"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 uppercase tracking-wider mb-1">
                    Instagram Oficial (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="@seuinstagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: História / Sobre Nós */}
            <div className="bg-[#0b101c] border border-blue-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold block mb-1">
                  Etapa 2 de 4 • História & Credibilidade
                </span>
                <h2 className="text-lg font-bold text-white">Conte um pouco sobre sua trajetória</h2>
                <p className="text-xs text-slate-300">
                  Nossa IA transformará este resumo em um texto institucional envolvente para encantar seus clientes.
                </p>
              </div>

              <textarea
                rows={3}
                placeholder="Ex: Atuamos há mais de 8 anos oferecendo os melhores cuidados para animais de estimação, com produtos hipoalergênicos, equipe veterinária e banhos relaxantes..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            {/* Bloco 3: Serviços e Preços */}
            <div className="bg-[#0b101c] border border-emerald-500/25 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                    Etapa 3 de 4 • Tabela de Serviços & Cardápio
                  </span>
                  <h2 className="text-lg font-bold text-white">Quais serviços ou produtos quer destacar?</h2>
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Item
                </button>
              </div>

              <div className="space-y-3">
                {services.map((service, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#070a11] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Item #{idx + 1}</span>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nome do Serviço"
                        value={service.name}
                        onChange={(e) => updateService(idx, 'name', e.target.value)}
                        className="col-span-2 px-3 py-2 rounded-lg bg-[#0b101c] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Preço R$"
                        value={service.price}
                        onChange={(e) => updateService(idx, 'price', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-[#0b101c] border border-white/10 text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-500 text-right font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Breve descrição ou diferencial (opcional)"
                      value={service.description}
                      onChange={(e) => updateService(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#0b101c] border border-white/10 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 4: Fotos Reais */}
            <div className="bg-[#0b101c] border border-blue-500/20 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold block mb-1">
                  Etapa 4 de 4 • Fotos Reais do Negócio
                </span>
                <h2 className="text-lg font-bold text-white">Anexe fotos do seu espaço, equipe ou produtos</h2>
                <p className="text-xs text-slate-300">
                  Suba até 6 fotos tiradas do seu celular para substituir as imagens genéricas do site.
                </p>
              </div>

              {/* Grid de fotos pré-visualizadas */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-blue-500/40 group">
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}

                {photos.length < 6 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-blue-400/50 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center bg-[#070a11]">
                    <Upload className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="text-[10px] font-mono text-slate-400">Subir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                {photos.length} de 6 fotos anexadas.
              </p>
            </div>

            {/* Bloco 5: Ideias de Domínio .com.br */}
            <div className="bg-[#0b101c] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Preferências de Endereço Web (.com.br)
              </span>
              <h2 className="text-base font-bold text-white">Qual domínio oficial você gostaria de registrar?</h2>
              <p className="text-xs text-slate-300">
                Informe 1 a 3 sugestões (ex: nomedaloja.com.br).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="relative">
                    <input
                      type="text"
                      placeholder={`Opção #${idx + 1}`}
                      value={domainIdeas[idx] || ''}
                      onChange={(e) => {
                        const updated = [...domainIdeas];
                        updated[idx] = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setDomainIdeas(updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#070a11] border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 font-mono pr-14"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-slate-500 font-mono">.com.br</span>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Barra de Progresso quando enviando */}
            {loading && (
              <div className="p-5 rounded-2xl bg-[#0b101c] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                    {progressText}
                  </span>
                  <span className="text-blue-400 font-bold">{stepProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${stepProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/30 transition text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Salvar e Atualizar Demonstração com IA
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
