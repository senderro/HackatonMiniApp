import TabBar from '@/components/TabBar';
import './globals.css';
import { ReactNode } from 'react';


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="bg-gray-50 text-gray-800">
        <div className="min-h-screen pb-16 flex flex-col">
          <header className="bg-white shadow flex items-center justify-center py-4">
            <h1 className="text-xl font-bold">SplitApp</h1>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
          <TabBar />
        </div>
      </body>
    </html>
  );
}