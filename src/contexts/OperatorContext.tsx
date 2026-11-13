'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarCreatorModal from '@/components/AvatarCreatorModal';

export interface OperatorContextType {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  rankingData: any;
  setRankingData: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Modais
  showAvatarModal: boolean;
  setShowAvatarModal: (show: boolean) => void;
  avatarModalCanClose: boolean;
  setAvatarModalCanClose: (can: boolean) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  // Atalhos
  op: any;
  license: any;
  stats: any;
  copySerial: () => void;
  copiedSerial: boolean;
  handleLogout: () => Promise<void>;
}

const OperatorContext = createContext<OperatorContextType | undefined>(undefined);

export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingData, setRankingData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSerial, setCopiedSerial] = useState(false);

  // Estados do Criador de Avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarModalCanClose, setAvatarModalCanClose] = useState(true);

  // Estados de Troca de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Não processa se for a tela de login
  const isLoginPage = pathname === '/operador/login';

  const loadData = async () => {
    if (isLoginPage) return;
    try {
      const res = await fetch('/api/operator/overview', { cache: 'no-store' });
      if (res.status === 401 || res.status === 403) {
        router.push('/operador/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Checa persistência local de avatar para evitar que reabra no F5
      let localAvatarConfig: any = null;
      let localAvatarSvg: string | null = null;
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`webbilly_avatar_${json.operator?.id}`) || localStorage.getItem('webbilly_avatar_configured');
          if (stored && stored !== 'true') {
            const parsed = JSON.parse(stored);
            localAvatarConfig = parsed.config;
            localAvatarSvg = parsed.svg;
          }
        }
      } catch {}

      const hasAvatar = Boolean(
        json.operator?.avatar_config || 
        json.operator?.avatarConfig || 
        json.operator?.avatar_svg || 
        json.operator?.avatarSvg ||
        localAvatarConfig ||
        localAvatarSvg ||
        (typeof window !== 'undefined' && localStorage.getItem('webbilly_avatar_configured') === 'true')
      );

      if (json.operator && (localAvatarConfig || localAvatarSvg)) {
        json.operator.avatar_config = json.operator.avatar_config || localAvatarConfig;
        json.operator.avatarConfig = json.operator.avatarConfig || localAvatarConfig;
        json.operator.avatar_svg = json.operator.avatar_svg || localAvatarSvg;
        json.operator.avatarSvg = json.operator.avatarSvg || localAvatarSvg;
      }

      setData(json);

      // Troca obrigatória de senha no 1º login
      if (json.operator?.mustChangePassword) {
        setShowPasswordModal(true);
      } else if (!hasAvatar) {
        setShowAvatarModal(true);
        setAvatarModalCanClose(false);
      }

      // Carrega ranking
      try {
        const rankRes = await fetch('/api/operador/ranking', { cache: 'no-store' });
        if (rankRes.ok) {
          const rankJson = await rankRes.json();
          setRankingData(rankJson);
        }
      } catch (rankErr) {
        console.warn('Erro ao carregar ranking:', rankErr);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do operador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoginPage) {
      loadData();
    }
  }, [isLoginPage]);

  const copySerial = () => {
    if (data?.operator?.serialToken) {
      navigator.clipboard.writeText(data.operator.serialToken);
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/operador/login');
  };

  const handleAvatarSaveSuccess = (newConfig: any, newSvg: string) => {
    if (data && data.operator) {
      setData({
        ...data,
        operator: {
          ...data.operator,
          avatar_config: newConfig,
          avatarConfig: newConfig,
          avatar_svg: newSvg,
          avatarSvg: newSvg
        }
      });
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`webbilly_avatar_${data.operator.id}`, JSON.stringify({ config: newConfig, svg: newSvg }));
          localStorage.setItem('webbilly_avatar_configured', 'true');
        }
      } catch {}
    }
    setShowAvatarModal(false);
  };

  return (
    <OperatorContext.Provider
      value={{
        data,
        setData,
        rankingData,
        setRankingData,
        loading,
        error,
        loadData,
        searchQuery,
        setSearchQuery,
        showAvatarModal,
        setShowAvatarModal,
        avatarModalCanClose,
        setAvatarModalCanClose,
        showPasswordModal,
        setShowPasswordModal,
        op: data?.operator,
        license: data?.license,
        stats: data?.stats,
        copySerial,
        copiedSerial,
        handleLogout,
      }}
    >
      {children}

      {/* Modal de Avatar Persistente */}
      {data?.operator && (
        <AvatarCreatorModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          canClose={avatarModalCanClose}
          operatorId={data.operator.id}
          operatorName={data.operator.name}
          operatorEmail={data.operator.email}
          initialConfig={data.operator.avatar_config || data.operator.avatarConfig}
          onSaved={handleAvatarSaveSuccess}
        />
      )}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  const context = useContext(OperatorContext);
  if (!context) {
    throw new Error('useOperator deve ser usado dentro de um OperatorProvider');
  }
  return context;
}
