import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="flex h-screen bg-gray-50">
        <aside className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">SplitApp</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Meus Grupos</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Transações</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Configurações</a></li>
            </ul>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}