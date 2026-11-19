'use client';

import React, { useState, useEffect } from 'react';
import { Key, X, Check, AlertCircle } from 'lucide-react';

interface PixKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey?: string;
  currentType?: string;
  onSaved?: (key: string, type: string) => void;
}

export default function PixKeyModal({
  isOpen,
  onClose,
  currentKey = '',
  currentType = 'CPF',
  onSaved
}: PixKeyModalProps) {
  const [pixType, setPixType] = useState(currentType || 'CPF');
  const [pixKey, setPixKey] = useState(currentKey || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPixType(currentType || 'CPF');
      setPixKey(currentKey || '');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, currentKey, currentType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pixKey.trim()) {
      setError('Por favor, informe a chave Pix.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/operator/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixKey: pixKey.trim(), pixType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar chave Pix.');

      setSuccess(true);
      if (onSaved) {
        onSaved(pixKey.trim(), pixType);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (pixType) {
      case 'CPF':
        return '000.000.000-00';
      case 'EMAIL':
        return 'seu.email@exemplo.com';
      case 'TELEFONE':
        return '(11) 99999-9999';
      case 'ALEATORIA':
        return 'Cole sua chave aleatória (EVP)';
      default:
        return 'Digite sua chave Pix';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#11141C] border border-white/[0.08] shadow-2xl relative space-y-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-white transition p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-zinc-100">
            Cadastrar / Editar Chave Pix
          </h3>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Sua chave Pix é utilizada para o repasse automático das suas comissões mensais e vendas diretas.
        </p>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 justify-center">
            <Check className="w-4 h-4" />
            <span>Chave Pix salva com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Tipo de Chave Pix
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'CPF', label: 'CPF' },
                  { id: 'EMAIL', label: 'E-mail' },
                  { id: 'TELEFONE', label: 'Telefone' },
                  { id: 'ALEATORIA', label: 'Aleatória' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPixType(t.id)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                      pixType === t.id
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-bold'
                        : 'bg-zinc-900 text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Chave Pix ({pixType})
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 transition font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Chave Pix</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
