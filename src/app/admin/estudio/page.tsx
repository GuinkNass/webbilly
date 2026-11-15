'use client';

import React from 'react';
import BillyWebStudio from '@/components/studio/BillyWebStudio';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminStudioPage() {
  const { adminUser } = useAdmin();

  return (
    <BillyWebStudio
      role="admin"
      operatorId={adminUser?.id || 'admin-master'}
      operatorName={adminUser?.name || 'Administrador Master'}
      operatorEmail={adminUser?.email || 'admin@webbilly.com.br'}
    />
  );
}
