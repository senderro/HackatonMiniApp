import TelegramProvider from '@/components/TelegramProvider';
import './globals.css';
import { ReactNode } from 'react';
import TabBar from '@/components/TabBar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="flex flex-col min-h-screen">
        {/* Inicializa o WebApp e aplica tema */}
        <TelegramProvider />

        {/* Cabeçalho simples, usa CSS var(--header-bg/text) */}
        <header
          className="w-full py-4 text-center font-bold"
          style={{
            backgroundColor: 'var(--header-bg)',
            color: 'var(--header-text)',
          }}
        >
          SplitApp
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Navegação inferior */}
        <TabBar />
      </body>
    </html>
  );
}