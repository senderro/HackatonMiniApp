import './globals.css';
import { ReactNode } from 'react';
import TabBar from '@/components/TabBar';
import { TelegramProvider } from '@/hook/useTelegramAuth';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="flex flex-col min-h-screen">
        {/* Inicializa autenticação Telegram */}
        <TelegramProvider>
          {/* Cabeçalho */}
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
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Navegação inferior */}
          <TabBar />
        </TelegramProvider>
      </body>
    </html>
  );
}