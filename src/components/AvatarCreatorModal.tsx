'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import { adventurer, lorelei, pixelArt, bottts } from '@dicebear/collection';
import {
  Sparkles,
  Dices,
  Check,
  X,
  Palette,
  Eye,
  Smile,
  Shield,
  Layers,
  Save,
  RotateCcw,
  Zap
} from 'lucide-react';

const STYLES = [
  { id: 'adventurer', name: 'RPG Aventureiro', icon: '⚔️', collection: adventurer, desc: 'Personagem de RPG / Fantasia' },
  { id: 'lorelei', name: 'Ilustração Moderna', icon: '✨', collection: lorelei, desc: 'Estilo Artístico e Elegante' },
  { id: 'pixelArt', name: 'Retro Pixel Game', icon: '👾', collection: pixelArt, desc: 'Nostalgia 8-bit / 16-bit' },
  { id: 'bottts', name: 'Mecha Ciborgue', icon: '🤖', collection: bottts, desc: 'Robôs, Androides e Tecnologias' }
];

const AURAS = [
  { id: 'neon-green', name: 'Verde Billy', bg: 'from-lime-500/20 via-emerald-950/40 to-black', glow: 'shadow-[0_0_30px_rgba(132,204,22,0.4)]', border: 'border-lime-500/40', accent: '#84cc16' },
  { id: 'cyber-cyan', name: 'Cyber Cyan', bg: 'from-cyan-500/20 via-sky-950/40 to-black', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]', border: 'border-cyan-500/40', accent: '#06b6d4' },
  { id: 'plasma-purple', name: 'Plasma Roxo', bg: 'from-purple-500/20 via-indigo-950/40 to-black', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]', border: 'border-purple-500/40', accent: '#a855f7' },
  { id: 'inferno-amber', name: 'Fogo Místico', bg: 'from-amber-500/20 via-orange-950/40 to-black', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]', border: 'border-amber-500/40', accent: '#f59e0b' },
  { id: 'dark-obsidian', name: 'Obsidiana Sombria', bg: 'from-zinc-700/20 via-zinc-950 to-black', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]', border: 'border-white/10', accent: '#71717a' }
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
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialConfig?.style || 'adventurer');
  const [seed, setSeed] = useState<string>(initialConfig?.seed || operatorId || 'BillyGamer');
  const [selectedAuraId, setSelectedAuraId] = useState<string>(initialConfig?.options?.aura || 'neon-green');

  // Customizações granulares
  const [skinColor, setSkinColor] = useState<string>(initialConfig?.options?.skinColor?.[0] || '');
  const [hairColor, setHairColor] = useState<string>(initialConfig?.options?.hairColor?.[0] || '');
  const [hairStyle, setHairStyle] = useState<string>(initialConfig?.options?.hair?.[0] || initialConfig?.options?.top?.[0] || '');
  const [eyesStyle, setEyesStyle] = useState<string>(initialConfig?.options?.eyes?.[0] || '');
  const [mouthStyle, setMouthStyle] = useState<string>(initialConfig?.options?.mouth?.[0] || '');
  const [glassesActive, setGlassesActive] = useState<boolean>(initialConfig?.options?.glassesProbability === 100);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Localiza a coleção ativa
  const currentStyle = useMemo(() => {
    return STYLES.find(s => s.id === selectedStyleId) || STYLES[0];
  }, [selectedStyleId]);

  const currentAura = useMemo(() => {
    return AURAS.find(a => a.id === selectedAuraId) || AURAS[0];
  }, [selectedAuraId]);

  // Gera o SVG do DiceBear em tempo real
  const currentSvg = useMemo(() => {
    try {
      const options: any = {
        seed: seed || 'BillyGamer',
        radius: 50
      };

      if (skinColor) options.skinColor = [skinColor];
      if (hairColor) options.hairColor = [hairColor];

      if (hairStyle) {
        if (selectedStyleId === 'bottts') {
          options.top = [hairStyle];
        } else {
          options.hair = [hairStyle];
        }
      }

      if (eyesStyle) options.eyes = [eyesStyle];
      if (mouthStyle) options.mouth = [mouthStyle];

      if (glassesActive) {
        options.glassesProbability = 100;
      } else {
        options.glassesProbability = 0;
      }

      const avatar = createAvatar(currentStyle.collection as any, options);
      return avatar.toString();
    } catch (err) {
      console.warn('[DiceBear] Erro ao criar preview:', err);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#141824"/></svg>`;
    }
  }, [currentStyle, seed, skinColor, hairColor, hairStyle, eyesStyle, mouthStyle, glassesActive, selectedStyleId]);

  // Sorteia aleatoriamente
  const handleRandomize = () => {
    const randomSeed = `Hero_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setSeed(randomSeed);

    // Sorteia Aura
    const randomAura = AURAS[Math.floor(Math.random() * AURAS.length)];
    setSelectedAuraId(randomAura.id);

    // Reseta overrides granulares para que o DiceBear gere variações nativas baseadas no seed
    setSkinColor('');
    setHairColor('');
    setHairStyle('');
    setEyesStyle('');
    setMouthStyle('');
    setGlassesActive(Math.random() > 0.5);
  };

  // Salvar avatar
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const options: any = {
      aura: selectedAuraId,
      glassesProbability: glassesActive ? 100 : 0
    };
    if (skinColor) options.skinColor = [skinColor];
    if (hairColor) options.hairColor = [hairColor];
    if (hairStyle) {
      if (selectedStyleId === 'bottts') options.top = [hairStyle];
      else options.hair = [hairStyle];
    }
    if (eyesStyle) options.eyes = [eyesStyle];
    if (mouthStyle) options.mouth = [mouthStyle];

    const payload = {
      operatorId,
      style: selectedStyleId,
      seed,
      options,
      svg: currentSvg
    };

    try {
      const res = await fetch('/api/operador/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao salvar avatar.');

      const finalConfig = data.avatarConfig || {
        style: selectedStyleId,
        seed,
        options: {
          aura: selectedAuraId,
          skinColor: skinColor ? [skinColor] : undefined,
          hairColor: hairColor ? [hairColor] : undefined,
          hair: hairStyle ? [hairStyle] : undefined,
          top: hairStyle ? [hairStyle] : undefined,
          eyes: eyesStyle ? [eyesStyle] : undefined,
          mouth: mouthStyle ? [mouthStyle] : undefined,
          glassesProbability: glassesActive ? 100 : 0
        }
      };
      const finalSvg = data.avatarSvg || currentSvg;

      if (onSaved) onSaved(finalConfig, finalSvg);
      if (onSaveSuccess) onSaveSuccess(finalConfig, finalSvg);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao salvar avatar.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090D16] border border-[#84cc16]/30 shadow-2xl shadow-lime-950/40 overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 bg-[#0d121f] border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#84cc16]/10 border border-[#84cc16]/30 flex items-center justify-center text-xl text-[#84cc16] shadow-md shadow-lime-950/40">
              <Sparkles className="w-5 h-5 text-[#84cc16]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                  Criador de Avatar Gamer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#84cc16]/15 text-[#a3e635] border border-[#84cc16]/30 font-mono">
                  DICEBEAR ENGINE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {canClose ? 'Personalize seu personagem oficial do ranking, topbar e identificação corporativa.' : '⚡ Primeiro Acesso: crie seu avatar gamer oficial para liberar seu painel!'}
              </p>
            </div>
          </div>

          {canClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ABAS DE ESTILO NO TOPO */}
        <div className="px-6 py-3 bg-[#0a0f1c] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto shrink-0">
          {STYLES.map(style => {
            const isSelected = selectedStyleId === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyleId(style.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#84cc16] text-zinc-950 shadow-lg shadow-lime-950/50 scale-[1.02]'
                    : 'bg-[#141a29] text-zinc-300 hover:bg-[#1a2337] hover:text-white border border-white/[0.06]'
                }`}
              >
                <span>{style.icon}</span>
                <span>{style.name}</span>
              </button>
            );
          })}
        </div>

        {/* CORPO: 2 COLUNAS (PREVIEW À ESQUERDA + CONTROLES À DIREITA) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
          
          {/* COLUNA ESQUERDA: PREVIEW DO PERSONAGEM COM AURA */}
          <div className="w-full md:w-80 p-6 bg-[#0c101c] border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col items-center justify-between gap-5 shrink-0">
            <div className="w-full space-y-4 flex flex-col items-center">
              
              {/* Card com Aura Gamer */}
              <div
                className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-gradient-to-br ${currentAura.bg} border-2 ${currentAura.border} ${currentAura.glow} flex items-center justify-center p-4 transition-all duration-300 overflow-hidden group`}
              >
                <div
                  className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                  dangerouslySetInnerHTML={{ __html: currentSvg }}
                />

                <span className="absolute bottom-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10 uppercase tracking-wider">
                  {currentStyle.name}
                </span>
              </div>

              {/* Input Nome de Guerra / Seed */}
              <div className="w-full space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Nome de Guerra (Seed Gerador):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Digite seu apelido..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#141a29] border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#84cc16]"
                  />
                  <button
                    onClick={handleRandomize}
                    className="px-3 py-2 rounded-xl bg-[#84cc16]/15 hover:bg-[#84cc16]/25 text-[#a3e635] border border-[#84cc16]/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Sortear combinação aleatória instantânea"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Sortear</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Aura Selecionada */}
            <div className="w-full p-3 rounded-2xl bg-[#141a29] border border-white/[0.06] text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-2">
                Aura do Card: <strong className="text-white">{currentAura.name}</strong>
              </span>
              <div className="flex items-center justify-center gap-2">
                {AURAS.map(aura => (
                  <button
                    key={aura.id}
                    onClick={() => setSelectedAuraId(aura.id)}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                      selectedAuraId === aura.id
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: aura.accent }}
                    title={aura.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CONTROLES GRANULARES */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto">

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* 1. SELEÇÃO DE TOM DE PELE / CHASSI */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-lime-400" />
                  <span>Tom de Pele / Cor da Base</span>
                </label>
                {skinColor && (
                  <button
                    onClick={() => setSkinColor('')}
                    className="text-[10px] text-zinc-400 hover:text-white"
                  >
                    Resetar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Clara', hex: 'ffd299' },
                  { label: 'Média Clara', hex: 'f2d3b1' },
                  { label: 'Morena', hex: 'cb8e56' },
                  { label: 'Negra', hex: '9e5622' },
                  { label: 'Escura', hex: '5b3517' },
                  { label: 'Mecha Aço', hex: '94a3b8' },
                  { label: 'Cyber Verde', hex: '84cc16' }
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setSkinColor(c.hex)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                      skinColor === c.hex
                        ? 'bg-white/10 text-white border-lime-400'
                        : 'bg-[#141a29] text-zinc-300 border-white/[0.06] hover:bg-[#1a2337]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: `#${c.hex}` }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. COR DO CABELO / CAPACETE */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cor do Cabelo / Topo</span>
                </label>
                {hairColor && (
                  <button
                    onClick={() => setHairColor('')}
                    className="text-[10px] text-zinc-400 hover:text-white"
                  >
                    Resetar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Preto', hex: '0e0e0e' },
                  { label: 'Castanho', hex: '4a3728' },
                  { label: 'Loiro', hex: 'e5d7a3' },
                  { label: 'Ruivo', hex: 'b93c3c' },
                  { label: 'Azul Neon', hex: '06b6d4' },
                  { label: 'Roxo Cyber', hex: 'a855f7' },
                  { label: 'Verde Gamer', hex: '84cc16' },
                  { label: 'Prateado', hex: 'e2e8f0' }
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setHairColor(c.hex)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                      hairColor === c.hex
                        ? 'bg-white/10 text-white border-emerald-400'
                        : 'bg-[#141a29] text-zinc-300 border-white/[0.06] hover:bg-[#1a2337]'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/30" style={{ backgroundColor: `#${c.hex}` }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. ESTILO DE CABELO / TOPO */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Estilo do Cabelo / Topo</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedStyleId === 'bottts' ? (
                  ['antenna', 'horns', 'lights', 'pyramid', 'radar', 'bulb01', 'bulb02'].map(style => (
                    <button
                      key={style}
                      onClick={() => setHairStyle(style)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center capitalize border transition cursor-pointer ${
                        hairStyle === style
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-[#141a29] text-zinc-300 border-white/[0.06] hover:bg-[#1a2337]'
                      }`}
                    >
                      {style}
                    </button>
                  ))
                ) : (
                  ['short01', 'short02', 'short03', 'short04', 'long01', 'long02', 'variant01', 'variant02'].map(style => (
                    <button
                      key={style}
                      onClick={() => setHairStyle(style)}
                      className={`p-2 rounded-xl text-xs font-semibold text-center capitalize border transition cursor-pointer ${
                        hairStyle === style
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-[#141a29] text-zinc-300 border-white/[0.06] hover:bg-[#1a2337]'
                      }`}
                    >
                      {style}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 4. OLHOS E EXPRESSÃO */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Olhos & Expressão</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['variant01', 'variant02', 'variant03', 'variant04', 'variant05', 'glow', 'happy', 'sensor'].map(eye => (
                  <button
                    key={eye}
                    onClick={() => setEyesStyle(eye)}
                    className={`p-2 rounded-xl text-xs font-semibold text-center capitalize border transition cursor-pointer ${
                      eyesStyle === eye
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-[#141a29] text-zinc-300 border-white/[0.06] hover:bg-[#1a2337]'
                    }`}
                  >
                    {eye}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. ACESSÓRIOS (ÓCULOS GAMER) */}
            <div className="p-3.5 rounded-2xl bg-[#141a29] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Equipar Óculos Gamer</span>
                <span className="text-[11px] text-zinc-400">Adiciona óculos de sol / visor de combate cibernético</span>
              </div>
              <button
                type="button"
                onClick={() => setGlassesActive(!glassesActive)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  glassesActive ? 'bg-[#84cc16]' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                    glassesActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* FOOTER: BOTÕES DE AÇÃO */}
        <div className="px-6 py-4 bg-[#0d121f] border-t border-white/[0.08] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleRandomize}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center gap-2 transition cursor-pointer"
          >
            <Dices className="w-4 h-4 text-[#84cc16]" />
            <span>Sortear Outro</span>
          </button>

          <div className="flex items-center gap-3">
            {canClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-950 bg-[#84cc16] hover:bg-[#a3e635] transition flex items-center gap-2 shadow-lg shadow-lime-950/50 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Salvando Avatar...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Avatar Gamer</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
