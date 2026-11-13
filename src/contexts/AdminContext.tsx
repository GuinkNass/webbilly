'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AvatarCreatorModal from '@/components/AvatarCreatorModal';
import AdminAlertsModal from '@/components/AdminAlertsModal';

export interface AdminContextType {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  adminUser: any;
  activeAlertsCount: number;
  refreshAdminAlertsCount: () => Promise<void>;
  showAlertsModal: boolean;
  setShowAlertsModal: (s: boolean) => void;
  showChangePasswordModal: boolean;
  setShowChangePasswordModal: (s: boolean) => void;
  showAdminAvatarModal: boolean;
  setShowAdminAvatarModal: (s: boolean) => void;
  actionSuccess: string | null;
  setActionSuccess: (msg: string | null) => void;
  handleLogout: () => Promise<void>;
  copyToClipboard: (text: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Alertas Globais
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // Modais de Senha e Avatar
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAdminAvatarModal, setShowAdminAvatarModal] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  const refreshAdminAlertsCount = async () => {
    try {
      const res = await fetch('/api/admin/alerts', { cache: 'no-store' });
      const json = await res.json();
      if (json?.success && Array.isArray(json.alerts)) {
        setActiveAlertsCount(json.alerts.filter((a: any) => a.is_active).length);
      }
    } catch {}
  };

  const loadData = async () => {
    if (isLoginPage) return;
    try {
      const res = await fetch('/api/admin/overview');
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      // Sincronização dinâmica direta via /api/admin/licenses
      try {
        const licRes = await fetch('/api/admin/licenses');
        if (licRes.ok) {
          const licJson = await licRes.json();
          if (Array.isArray(licJson.licenses)) {
            json.licenses = licJson.licenses;
          }
        }
      } catch (licErr) {
        console.warn('Falha ao sincronizar /api/admin/licenses:', licErr);
      }

      // Hidrata avatar local do admin
      try {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('webbilly_avatar_admin') || localStorage.getItem('webbilly_avatar_OP-0001');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (json.adminUser && (!json.adminUser.avatar_config || !json.adminUser.avatar_svg)) {
              json.adminUser.avatar_config = json.adminUser.avatar_config || parsed.config;
              json.adminUser.avatar_svg = json.adminUser.avatar_svg || parsed.svg;
            }
          }
        }
      } catch {}

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoginPage) {
      loadData();
      refreshAdminAlertsCount();
    }
  }, [isLoginPage]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const adminUser = data?.adminUser;

  const handleAvatarSaveSuccess = (newConfig: any, newSvg: string) => {
    if (data && data.adminUser) {
      setData({
        ...data,
        adminUser: {
          ...data.adminUser,
          avatar_config: newConfig,
          avatarConfig: newConfig,
          avatar_svg: newSvg,
          avatarSvg: newSvg
        }
      });
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('webbilly_avatar_admin', JSON.stringify({ config: newConfig, svg: newSvg }));
        if (data?.adminUser?.id) {
          localStorage.setItem(`webbilly_avatar_${data.adminUser.id}`, JSON.stringify({ config: newConfig, svg: newSvg }));
        }
      } catch {}
    }
    setShowAdminAvatarModal(false);
  };

  return (
    <AdminContext.Provider
      value={{
        data,
        setData,
        loading,
        error,
        loadData,
        searchQuery,
        setSearchQuery,
        adminUser,
        activeAlertsCount,
        refreshAdminAlertsCount,
        showAlertsModal,
        setShowAlertsModal,
        showChangePasswordModal,
        setShowChangePasswordModal,
        showAdminAvatarModal,
        setShowAdminAvatarModal,
        actionSuccess,
        setActionSuccess,
        handleLogout,
        copyToClipboard
      }}
    >
      {children}

      {/* Modal de Alertas Globais */}
      {showAlertsModal && (
        <AdminAlertsModal
          isOpen={showAlertsModal}
          onClose={() => {
            setShowAlertsModal(false);
            refreshAdminAlertsCount();
          }}
          onAlertsUpdated={refreshAdminAlertsCount}
        />
      )}

      {/* Modal de Avatar do Administrador Master */}
      <AvatarCreatorModal
        isOpen={showAdminAvatarModal}
        onClose={() => setShowAdminAvatarModal(false)}
        canClose={true}
        operatorId={adminUser?.id || 'admin-master'}
        operatorName={adminUser?.name || 'Administrador Master'}
        operatorEmail={adminUser?.email || 'admin@billysuite.com.br'}
        initialConfig={adminUser?.avatar_config || adminUser?.avatarConfig}
        onSaved={handleAvatarSaveSuccess}
        onSaveSuccess={handleAvatarSaveSuccess}
      />
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider');
  }
  return context;
}
