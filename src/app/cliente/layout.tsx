import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal do Cliente — Billy Suite',
  description: 'Acompanhe seu site oficial, solicite alterações e consulte suas faturas.'
};

export default function ClienteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      {children}
    </div>
  );
}
