'use client';

import React, { useState, useEffect } from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import { ActionTooltip } from '@/components/ui/ActionTooltip';
import {
  Play,
  Clock,
  FileText,
  Download,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Video
} from 'lucide-react';

export default function OperatorTrainingPage() {
  const { data, loading, error } = useOperator();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (data?.trainingModules && data.trainingModules.length > 0 && !selectedVideo) {
      setSelectedVideo(data.trainingModules[0]);
    }
  }, [data, selectedVideo]);

  const handleSelectModule = (mod: any) => {
    setSelectedVideo(mod);
    setIsPlaying(false);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs font-mono">Carregando aulas de treinamento...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-lg mx-auto my-12">
        <h2 className="text-lg font-bold text-rose-400 mb-2">Erro ao carregar dados</h2>
        <p className="text-xs text-zinc-300">{error}</p>
      </div>
    );
  }

  const hasValidVideo = Boolean(selectedVideo?.videoUrl && selectedVideo.videoUrl.trim() !== '');

  return (
    <div className="space-y-6">
      {/* Header da Área de Treinamento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141C] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <GraduationCap className="w-4 h-4" />
            Capacitação Comercial & Operacional
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Área de Treinamento do Operador
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Módulos práticos em vídeo com técnicas de prospecção no Google Maps, scripts de fechamento no WhatsApp e operação do Billy Studio Web.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-[#090B10] border border-white/[0.06] text-right">
          <div className="text-[10px] uppercase font-bold text-zinc-500">Total de Aulas</div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            {data?.trainingModules?.length || 4} Aulas
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player do Vídeo Selecionado / Card Limpo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#0d1017] border border-white/[0.08] relative flex items-center justify-center">
            {isPlaying && hasValidVideo ? (
              <iframe
                src={`${selectedVideo.videoUrl}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative bg-gradient-to-b from-[#11141C] to-[#090B10]">
                {/* Linhas de grade sutis no fundo */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-4 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {selectedVideo?.duration ? `${selectedVideo.duration} min` : 'Aula Oficial'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 line-clamp-2">
                    {selectedVideo?.title || 'Selecione uma aula'}
                  </h3>

                  {hasValidVideo ? (
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 flex items-center justify-center transition hover:scale-105 cursor-pointer mt-2"
                      title="Assistir Aula"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-white/[0.08] text-xs font-semibold mt-2">
                      <Video className="w-4 h-4 text-zinc-400" />
                      <span>Aula em Produção • Em Breve</span>
                    </div>
                  )}

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                    {selectedVideo?.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Detalhes e Material de Apoio da Aula */}
          {selectedVideo && (
            <div className="p-6 rounded-2xl bg-[#11141C] border border-white/[0.06]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-base font-bold text-zinc-100">{selectedVideo.title}</h2>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Duração: {selectedVideo.duration}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">
                {selectedVideo.description}
              </p>

              {selectedVideo.downloadAttachment && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Material de Apoio: <strong className="font-mono text-zinc-100">{selectedVideo.downloadAttachment}</strong></span>
                  </div>
                  <ActionTooltip title="Baixar Material de Apoio" description="Faz o download do material didático, PDFs e scripts de apoio desta aula." side="top">
                    <button
                      onClick={() => alert(`Download de ${selectedVideo.downloadAttachment} iniciado.`)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-200 transition flex items-center gap-1.5 border border-white/[0.08] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Baixar Anexo</span>
                    </button>
                  </ActionTooltip>
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
              <ActionTooltip
                key={mod.id || idx}
                title={mod.title}
                description="Carrega esta aula prática no reprodutor de vídeo principal."
                side="left"
                className="w-full block"
              >
                <button
                  onClick={() => handleSelectModule(mod)}
                  className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-100'
                      : 'bg-[#11141C] border-white/[0.06] text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-200'
                  }`}
                >
                  <Play className={`w-4 h-4 shrink-0 mt-0.5 ${isCurrent ? 'text-emerald-400 fill-emerald-400' : 'text-zinc-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-semibold line-clamp-1 ${isCurrent ? 'text-zinc-100' : 'text-zinc-300'}`}>
                        {mod.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                      <span>{mod.duration}</span>
                      {mod.downloadAttachment && (
                        <>
                          <span>•</span>
                          <span>PDF</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </ActionTooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
