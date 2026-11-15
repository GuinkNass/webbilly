'use client';

import React from 'react';
import BillyWebStudio from '@/components/studio/BillyWebStudio';
import { useOperator } from '@/contexts/OperatorContext';

export default function OperatorStudioPage() {
  const { op } = useOperator();

  return (
    <BillyWebStudio
      role="operator"
      operatorId={op?.id || op?.serialToken || 'OP-DEFAULT'}
      operatorName={op?.name || 'Operador Oficial'}
      operatorEmail={op?.email || 'operador@webbilly.com.br'}
    />
  );
}
