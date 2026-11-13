'use client';

import React, { useState, useEffect } from 'react';
import { useOperator } from '@/contexts/OperatorContext';
import {
  PlayCircle,
  Clock,
  FileText,
  Download,
  GraduationCap
} from 'lucide-react';

export default function OperatorTrainingPage() {
  const { data, loading, error } = useOperator();
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    if (data?.trainingModules && data.trainingModules.length > 0 && !selectedVideo) {
      setSelectedVideo(data.trainingModules[0]);
    }
  }, [data, selectedVideo]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="space-y-6">
      {/* Header da Área de Treinamento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#11141c] p-6 rounded-2xl border border-white/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Capacitação Técnica & Comercial
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Área de Treinamento do Operador
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            4 módulos práticos em vídeo com técnicas de prospecção, scripts do WhatsApp e operação do gerador desktop.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-right">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Total de Aulas</div>
          <div className="text-lg font-black text-indigo-400 font-mono">
            {data?.trainingModules?.length || 4} Aulas
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player do Vídeo Selecionado */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl relative">
            {selectedVideo ? (
              <iframe
                src={selectedVideo.videoUrl}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                Selecione uma aula na grade ao lado para iniciar a reprodução.
              </div>
            )}
          </div>

          {selectedVideo && (
            <div className="p-6 rounded-2xl bg-[#0f121a] border border-white/[0.08] shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">{selectedVideo.title}</h2>
                <span className="text-xs font-mono text-zinc-400 bg-[#141824] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                  {selectedVideo.duration}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {selectedVideo.description}
              </p>

              {selectedVideo.downloadAttachment && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Material de Apoio: <strong>{selectedVideo.downloadAttachment}</strong></span>
                  </div>
                  <button
                    onClick={() => alert('Download do material iniciado.')}
                    className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-zinc-800 text-xs text-white transition flex items-center gap-1.5 border border-white/[0.08] cursor-pointer"
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

          {(data?.trainingModules || []).map((mod: any) => {
            const isCurrent = selectedVideo?.id === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setSelectedVideo(mod)}
                className={`w-full text-left p-4 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-800/60 text-white shadow-lg shadow-indigo-950/30'
                    : 'bg-[#11141c] border-white/[0.06] text-zinc-400 hover:bg-[#141824] hover:text-zinc-200'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  isCurrent ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
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
  );
}
