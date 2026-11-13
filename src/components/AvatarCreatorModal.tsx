'use client';

import React, { useState, useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import {
  Check,
  X,
  Dices,
  User,
  Sparkles,
  Scissors,
  Eye,
  Smile,
  Glasses,
  Briefcase,
  Palette,
  Layers
} from 'lucide-react';

/* =========================================================================
   CATÁLOGO PROFISSIONAL DE OPÇÕES AVATAAARS (COM NOMES EM PORTUGUÊS)
   ========================================================================= */

// 1. Tom de Pele
const SKIN_COLORS = [
  { id: 'ffdbb4', name: 'Clara', hex: '#ffdbb4' },
  { id: 'edb98a', name: 'Média Clara', hex: '#edb98a' },
  { id: 'd08b5b', name: 'Morena', hex: '#d08b5b' },
  { id: 'ae5d29', name: 'Bronzeada', hex: '#ae5d29' },
  { id: '614335', name: 'Negra', hex: '#614335' },
  { id: 'f8d25c', name: 'Dourada', hex: '#f8d25c' }
];

// 2. Cortes de Cabelo / Topo do Rosto
const TOP_OPTIONS = [
  // Curtos / Masculinos
  { id: 'shortFlat', name: 'Curto Executivo', category: 'curto' },
  { id: 'shortRound', name: 'Curto Clássico', category: 'curto' },
  { id: 'shortWaved', name: 'Curto Ondulado', category: 'curto' },
  { id: 'shortCurly', name: 'Curto Cacheado', category: 'curto' },
  { id: 'theCaesar', name: 'Corte César', category: 'curto' },
  { id: 'theCaesarAndSidePart', name: 'César com Risca', category: 'curto' },
  { id: 'sides', name: 'Raspado nas Laterais', category: 'curto' },
  { id: 'shavedSides', name: 'Degradê / Undercut', category: 'curto' },
  { id: 'shaggy', name: 'Despojado Casual', category: 'curto' },
  { id: 'shaggyMullet', name: 'Mullet Moderno', category: 'curto' },
  { id: 'frizzle', name: 'Crespo Curto', category: 'curto' },

  // Médios e Longos
  { id: 'bob', name: 'Chanel / Bob Cut', category: 'longo' },
  { id: 'bun', name: 'Coque Elegante', category: 'longo' },
  { id: 'curly', name: 'Cachos Volumosos', category: 'longo' },
  { id: 'curvy', name: 'Ondulado Longo', category: 'longo' },
  { id: 'straight01', name: 'Liso Longo', category: 'longo' },
  { id: 'straight02', name: 'Liso com Franja', category: 'longo' },
  { id: 'straightAndStrand', name: 'Liso com Mechas', category: 'longo' },
  { id: 'longButNotTooLong', name: 'Médio Natural', category: 'longo' },
  { id: 'miaWallace', name: 'Chanel Reto com Franja', category: 'longo' },
  { id: 'bigHair', name: 'Volume Alto', category: 'longo' },

  // Afro & Dreads
  { id: 'fro', name: 'Black Power', category: 'afro' },
  { id: 'froBand', name: 'Black Power com Faixa', category: 'afro' },
  { id: 'dreads01', name: 'Dreadlocks Curtos', category: 'afro' },
  { id: 'dreads02', name: 'Dreadlocks Médios', category: 'afro' },
  { id: 'dreads', name: 'Dreadlocks Longos', category: 'afro' },
  { id: 'frida', name: 'Trança Frida', category: 'afro' },

  // Careca & Coberturas
  { id: 'bald', name: 'Careca / Raspado', category: 'outros' },
  { id: 'hat', name: 'Chapéu Casual', category: 'outros' },
  { id: 'winterHat1', name: 'Gorro de Inverno', category: 'outros' },
  { id: 'turban', name: 'Turbante', category: 'outros' },
  { id: 'hijab', name: 'Hijab', category: 'outros' }
];

// 3. Cor do Cabelo
const HAIR_COLORS = [
  { id: '2c1b18', name: 'Preto', hex: '#2c1b18' },
  { id: '4a312c', name: 'Castanho Escuro', hex: '#4a312c' },
  { id: '724133', name: 'Castanho Médio', hex: '#724133' },
  { id: 'b58143', name: 'Castanho Claro', hex: '#b58143' },
  { id: 'd6b370', name: 'Loiro Dourado', hex: '#d6b370' },
  { id: 'ecdcbf', name: 'Loiro Platinado', hex: '#ecdcbf' },
  { id: 'c93305', name: 'Ruivo / Cobre', hex: '#c93305' },
  { id: 'e8e1e1', name: 'Grisalho / Prata', hex: '#e8e1e1' }
];

// 4. Barba e Bigode
const FACIAL_HAIR_OPTIONS = [
  { id: 'none', name: 'Sem Barba' },
  { id: 'beardLight', name: 'Barba Curta / Aparada' },
  { id: 'beardMedium', name: 'Barba Média' },
  { id: 'beardMajestic', name: 'Barba Cheia' },
  { id: 'moustacheFancy', name: 'Bigode Clássico' },
  { id: 'moustacheMagnum', name: 'Bigode Grosso' }
];

// 5. Olhos
const EYE_OPTIONS = [
  { id: 'default', name: 'Padrão Atento' },
  { id: 'happy', name: 'Felizes / Sorridentes' },
  { id: 'side', name: 'Focado de Lado' },
  { id: 'squint', name: 'Observador' },
  { id: 'wink', name: 'Piscando Confiante' },
  { id: 'surprised', name: 'Expressivo' },
  { id: 'closed', name: 'Tranquilo' }
];

// 6. Sobrancelhas
const EYEBROW_OPTIONS = [
  { id: 'defaultNatural', name: 'Naturais' },
  { id: 'flatNatural', name: 'Retas' },
  { id: 'raisedExcitedNatural', name: 'Arqueadas' },
  { id: 'upDownNatural', name: 'Confiantes' },
  { id: 'unibrowNatural', name: 'Marcantes' },
  { id: 'angryNatural', name: 'Sérias' }
];

// 7. Boca & Sorriso
const MOUTH_OPTIONS = [
  { id: 'smile', name: 'Sorriso Amigável' },
  { id: 'twinkle', name: 'Alegre / Confiante' },
  { id: 'default', name: 'Tranquilo / Neutro' },
  { id: 'serious', name: 'Sério / Focado' },
  { id: 'concerned', name: 'Atento / Reflexivo' }
];

// 8. Óculos / Acessórios
const ACCESSORY_OPTIONS = [
  { id: 'none', name: 'Sem Óculos' },
  { id: 'prescription02', name: 'Óculos Executivo' },
  { id: 'prescription01', name: 'Óculos de Grau Moderno' },
  { id: 'round', name: 'Óculos de Grau Redondo' },
  { id: 'wayfarers', name: 'Óculos Wayfarer' },
  { id: 'sunglasses', name: 'Óculos de Sol' }
];

// 9. Vestimenta / Roupa
const CLOTHING_OPTIONS = [
  { id: 'blazerAndShirt', name: 'Blazer e Camisa' },
  { id: 'blazerAndSweater', name: 'Blazer e Suéter' },
  { id: 'collarAndSweater', name: 'Camisa Social com Suéter' },
  { id: 'shirtCrewNeck', name: 'Camiseta Básica' },
  { id: 'shirtVNeck', name: 'Camiseta Gola V' },
  { id: 'hoodie', name: 'Moletom Casual' }
];

const CLOTHES_COLORS = [
  { id: '262e33', name: 'Preto', hex: '#262e33' },
  { id: '25557c', name: 'Azul Marinho', hex: '#25557c' },
  { id: '5199e4', name: 'Azul Royal', hex: '#5199e4' },
  { id: '3c4f5c', name: 'Grafite', hex: '#3c4f5c' },
  { id: '929598', name: 'Cinza Claro', hex: '#929598' },
  { id: 'a7ffc4', name: 'Verde Webbilly', hex: '#16a34a' },
  { id: 'ffffff', name: 'Branco', hex: '#ffffff' },
  { id: 'ff5c5c', name: 'Vinho / Bordô', hex: '#991b1b' }
];

// 10. Cores de Fundo (Circulares Neutras & Institucionais)
const BACKGROUND_COLORS = [
  { id: '090d16', name: 'Obsidiana', hex: '#090D16' },
  { id: '0f172a', name: 'Azul Petróleo', hex: '#0F172A' },
  { id: '1e293b', name: 'Ardósia', hex: '#1E293B' },
  { id: '111827', name: 'Grafite', hex: '#111827' },
  { id: '14532d', name: 'Verde Webbilly', hex: '#14532D' },
  { id: '1e1b4b', name: 'Índigo', hex: '#1E1B4B' },
  { id: '27272a', name: 'Cinza Neutro', hex: '#27272A' }
];

interface AvatarCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  canClose?: boolean;
  operatorId: string;
  operatorName?: string;
  initialConfig?: any;
  onSaved?: (config: any, svg: string) => void;
  onSaveSuccess?: (config: any, svg: string) => void;
}

export default function AvatarCreatorModal({
  isOpen,
  onClose,
  canClose = true,
  operatorId,
  operatorName,
  initialConfig,
  onSaved,
  onSaveSuccess
}: AvatarCreatorModalProps) {
  const opts = initialConfig?.options || {};

  // Estados dos Controles Individuais
  const [seed, setSeed] = useState<string>(initialConfig?.seed || operatorName || operatorId || 'WebbillyUser');
  const [skinColor, setSkinColor] = useState<string>(opts.skinColor?.[0] || 'edb98a');
  const [top, setTop] = useState<string>(opts.top?.[0] || 'shortFlat');
  const [isBald, setIsBald] = useState<boolean>(opts.topProbability === 0 || opts.top?.[0] === 'bald');
  const [hairColor, setHairColor] = useState<string>(opts.hairColor?.[0] || '2c1b18');

  // Barba
  const hasFacial = opts.facialHairProbability !== 0 && opts.facialHair?.[0] && opts.facialHair?.[0] !== 'none';
  const [facialHair, setFacialHair] = useState<string>(hasFacial ? opts.facialHair[0] : 'none');
  const [facialHairColor, setFacialHairColor] = useState<string>(opts.facialHairColor?.[0] || '2c1b18');

  // Expressão Facial
  const [eyes, setEyes] = useState<string>(opts.eyes?.[0] || 'default');
  const [eyebrows, setEyebrows] = useState<string>(opts.eyebrows?.[0] || 'defaultNatural');
  const [mouth, setMouth] = useState<string>(opts.mouth?.[0] || 'smile');

  // Óculos
  const hasAccessory = opts.accessoriesProbability !== 0 && opts.accessories?.[0] && opts.accessories?.[0] !== 'none';
  const [accessory, setAccessory] = useState<string>(hasAccessory ? opts.accessories[0] : 'none');

  // Roupas
  const [clothing, setClothing] = useState<string>(opts.clothing?.[0] || 'blazerAndShirt');
  const [clothesColor, setClothesColor] = useState<string>(opts.clothesColor?.[0] || '262e33');

  // Fundo
  const [backgroundColor, setBackgroundColor] = useState<string>(opts.backgroundColor?.[0] || '0f172a');

  // Categoria ativa no seletor de cabelo para facilitar navegação
  const [hairCategory, setHairCategory] = useState<'curto' | 'longo' | 'afro' | 'outros'>('curto');

  // Estados de Salvamento
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Constrói o objeto de opções do Avataaars
  const currentOptions = useMemo(() => {
    return {
      seed,
      radius: 50,
      backgroundColor: [backgroundColor],
      skinColor: [skinColor],
      top: isBald ? [] : [top],
      topProbability: isBald ? 0 : 100,
      hairColor: [hairColor],
      facialHair: facialHair === 'none' ? [] : [facialHair],
      facialHairProbability: facialHair === 'none' ? 0 : 100,
      facialHairColor: [facialHairColor],
      eyes: [eyes],
      eyebrows: [eyebrows],
      mouth: [mouth],
      accessories: accessory === 'none' ? [] : [accessory],
      accessoriesProbability: accessory === 'none' ? 0 : 100,
      accessoriesColor: ['262e33'],
      clothing: [clothing],
      clothesColor: [clothesColor]
    };
  }, [
    seed,
    backgroundColor,
    skinColor,
    top,
    isBald,
    hairColor,
    facialHair,
    facialHairColor,
    eyes,
    eyebrows,
    mouth,
    accessory,
    clothing,
    clothesColor
  ]);

  // Renderiza instantaneamente o SVG ao vivo
  const currentSvg = useMemo(() => {
    try {
      const avatar = createAvatar(avataaars, currentOptions as any);
      return avatar.toString();
    } catch (e) {
      console.error('Erro ao renderizar avataaars:', e);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#141824"/></svg>`;
    }
  }, [currentOptions]);

  // Função para Gerar Combinação Aleatória
  const handleRandomize = () => {
    const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomBool = (chance = 0.5) => Math.random() < chance;

    setSeed(`User_${Math.floor(Math.random() * 90000 + 10000)}`);
    setSkinColor(randomItem(SKIN_COLORS).id);

    const randomTop = randomItem(TOP_OPTIONS);
    if (randomTop.id === 'bald') {
      setIsBald(true);
    } else {
      setIsBald(false);
      setTop(randomTop.id);
      setHairCategory(randomTop.category as any);
    }

    setHairColor(randomItem(HAIR_COLORS).id);

    // 40% de chance de ter barba
    if (randomBool(0.4)) {
      const beards = FACIAL_HAIR_OPTIONS.filter(f => f.id !== 'none');
      setFacialHair(randomItem(beards).id);
      setFacialHairColor(randomItem(HAIR_COLORS).id);
    } else {
      setFacialHair('none');
    }

    setEyes(randomItem(EYE_OPTIONS).id);
    setEyebrows(randomItem(EYEBROW_OPTIONS).id);
    setMouth(randomItem(MOUTH_OPTIONS).id);

    // 35% de chance de usar óculos
    if (randomBool(0.35)) {
      const glasses = ACCESSORY_OPTIONS.filter(a => a.id !== 'none');
      setAccessory(randomItem(glasses).id);
    } else {
      setAccessory('none');
    }

    setClothing(randomItem(CLOTHING_OPTIONS).id);
    setClothesColor(randomItem(CLOTHES_COLORS).id);
    setBackgroundColor(randomItem(BACKGROUND_COLORS).id);
  };

  // Salvar Avatar via API
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        operatorId,
        style: 'avataaars',
        seed,
        options: currentOptions,
        svg: currentSvg
      };

      const res = await fetch('/api/operador/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar avatar.');

      const finalConfig = {
        style: 'avataaars',
        seed,
        options: currentOptions,
        updatedAt: new Date().toISOString()
      };

      if (onSaved) onSaved(finalConfig, currentSvg);
      if (onSaveSuccess) onSaveSuccess(finalConfig, currentSvg);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar avatar.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090D16] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho Limpo e Profissional */}
        <div className="p-5 sm:px-8 border-b border-white/[0.08] flex items-center justify-between bg-[#0e121d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Personalizar Avatar do Perfil
              </h2>
              <p className="text-xs text-zinc-400">
                Escolha as características do seu avatar para exibição no painel e no ranking.
              </p>
            </div>
          </div>

          {canClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Corpo: Duas Colunas (Preview Fixo à Esquerda + Painel de Controles com Scroll à Direita) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {/* Coluna Esquerda: Preview do Avatar */}
          <div className="lg:col-span-5 p-6 flex flex-col items-center justify-between bg-gradient-to-b from-[#0c101a] to-[#090D16]">
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-4">
                Pré-visualização em Tempo Real
              </span>

              {/* Moldura do Avatar */}
              <div className="relative group">
                <div
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: `#${backgroundColor}`
                  }}
                  dangerouslySetInnerHTML={{ __html: currentSvg }}
                />
              </div>

              {/* Informações de Perfil */}
              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-white">
                  {operatorName || seed}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  ID: {operatorId}
                </div>
              </div>
            </div>

            {/* Campo de Identificador / Seed */}
            <div className="w-full mt-6 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Identificador / Seed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#141824] border border-white/[0.08] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    onClick={handleRandomize}
                    className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium transition flex items-center gap-1.5 shrink-0"
                    title="Sortear combinação aleatória"
                  >
                    <Dices className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Aleatório</span>
                  </button>
                </div>
              </div>

              {/* Seletor de Fundo do Avatar */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                  Fundo do Avatar
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {BACKGROUND_COLORS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBackgroundColor(bg.id)}
                      style={{ backgroundColor: bg.hex }}
                      className={`w-7 h-7 rounded-full border transition-transform ${
                        backgroundColor === bg.id
                          ? 'ring-2 ring-emerald-400 scale-110 border-white'
                          : 'border-white/20 hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      title={bg.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Controles Granulares por Seção */}
          <div className="lg:col-span-7 p-6 sm:p-7 space-y-6">
            {/* 1. Tom de Pele */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>1. Tom de Pele</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SKIN_COLORS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSkinColor(s.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition ${
                      skinColor === s.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                        : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: s.hex }}
                    />
                    <span className="truncate text-[11px]">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Formato do Rosto & Corte de Cabelo */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Scissors className="w-4 h-4 text-emerald-400" />
                  <span>2. Corte de Cabelo / Topo</span>
                </div>
                <div className="flex items-center gap-1 bg-[#141824] p-0.5 rounded-lg border border-white/[0.08] text-[10px]">
                  <button
                    onClick={() => setHairCategory('curto')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      hairCategory === 'curto' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Curtos
                  </button>
                  <button
                    onClick={() => setHairCategory('longo')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      hairCategory === 'longo' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Médios / Longos
                  </button>
                  <button
                    onClick={() => setHairCategory('afro')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      hairCategory === 'afro' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Afro / Dreads
                  </button>
                  <button
                    onClick={() => setHairCategory('outros')}
                    className={`px-2 py-0.5 rounded-md transition ${
                      hairCategory === 'outros' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Careca / Acessórios
                  </button>
                </div>
              </div>

              {/* Grade de Cortes da Categoria Ativa */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TOP_OPTIONS.filter((t) => t.category === hairCategory).map((t) => {
                  const isSelected = t.id === 'bald' ? isBald : !isBald && top === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.id === 'bald') {
                          setIsBald(true);
                        } else {
                          setIsBald(false);
                          setTop(t.id);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-left border text-xs transition ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#141824] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="truncate text-[11px]">{t.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Seletor de Cor do Cabelo (desabilitado se careca) */}
              {!isBald && (
                <div className="pt-1.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400">Cor do Cabelo</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.id}
                        onClick={() => setHairColor(hc.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition ${
                          hairColor === hc.id
                            ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                            : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: hc.hex }}
                        />
                        <span>{hc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Barba e Bigode */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>3. Barba e Bigode</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FACIAL_HAIR_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFacialHair(f.id)}
                    className={`px-3 py-2 rounded-xl text-left border text-xs transition ${
                      facialHair === f.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#141824] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="truncate text-[11px]">{f.name}</div>
                  </button>
                ))}
              </div>

              {/* Cor da Barba se ativa */}
              {facialHair !== 'none' && (
                <div className="pt-1.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400">Cor da Barba</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={`beard-${hc.id}`}
                        onClick={() => setFacialHairColor(hc.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition ${
                          facialHairColor === hc.id
                            ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                            : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: hc.hex }}
                        />
                        <span>{hc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Expressão Facial (Olhos, Sobrancelhas, Boca) */}
            <div className="space-y-3.5 pt-2 border-t border-white/[0.08]">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>4. Expressão Facial</span>
              </div>

              {/* Olhos */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Olhar</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {EYE_OPTIONS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEyes(e.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] text-center transition ${
                        eyes === e.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sobrancelhas */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Sobrancelhas</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {EYEBROW_OPTIONS.map((eb) => (
                    <button
                      key={eb.id}
                      onClick={() => setEyebrows(eb.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] text-center transition ${
                        eyebrows === eb.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {eb.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Boca / Sorriso */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Boca / Sorriso</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {MOUTH_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMouth(m.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] text-center transition ${
                        mouth === m.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Óculos */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Glasses className="w-4 h-4 text-emerald-400" />
                <span>5. Óculos</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCESSORY_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccessory(a.id)}
                    className={`px-3 py-2 rounded-xl text-left border text-xs transition ${
                      accessory === a.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#141824] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="truncate text-[11px]">{a.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Vestimenta & Cores da Roupa */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>6. Vestimenta / Roupa</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CLOTHING_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setClothing(c.id)}
                    className={`px-3 py-2 rounded-xl text-left border text-xs transition ${
                      clothing === c.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-[#141824] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="truncate text-[11px]">{c.name}</div>
                  </button>
                ))}
              </div>

              {/* Cores da Roupa */}
              <div className="pt-1.5 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400">Cor da Roupa</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {CLOTHES_COLORS.map((cc) => (
                    <button
                      key={cc.id}
                      onClick={() => setClothesColor(cc.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition ${
                        clothesColor === cc.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold'
                          : 'bg-[#141824] border-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: cc.hex }}
                      />
                      <span>{cc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Limpo com Botão Salvar e Fechar */}
        <div className="p-4 sm:px-8 border-t border-white/[0.08] bg-[#0e121d] flex flex-col sm:flex-row items-center justify-between gap-3">
          {saveError && (
            <div className="text-xs text-rose-400 font-medium">
              {saveError}
            </div>
          )}
          <div className="text-xs text-zinc-400 font-medium hidden sm:block">
            As alterações são salvas e refletidas imediatamente no seu perfil.
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition border border-emerald-500/40 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
