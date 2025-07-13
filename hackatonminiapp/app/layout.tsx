// app/layout.tsx (ou pages/_app.tsx, dependendo da sua estrutura)
'use client';

import './globals.css';
import { ReactNode } from 'react';
import { TelegramProvider } from '@/contexts/TelegramContext';
import TabBar from '@/components/TabBar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="flex flex-col min-h-screen">
        {/* Agora envolvemos todo o layout dentro do Provider */}
        <TelegramProvider>
          <header
            className="w-full py-4 text-center font-bold"
            style={{
              backgroundColor: 'var(--header-bg)',
              color: 'var(--header-text)',
            }}
          >
            SplitApp
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          <TabBar />
        </TelegramProvider>
      </body>
    </html>
  );
}
