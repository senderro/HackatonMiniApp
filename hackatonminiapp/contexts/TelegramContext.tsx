// src/contexts/TelegramContext.tsx
'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

type InitData = any; // você pode trocar por uma interface mais precisa se quiser
type ThemeParams = Record<string, string | undefined>;

interface TelegramContextValue {
  initData: InitData | null;
  error: string | null;
  loading: boolean;
  themeParams: ThemeParams | null;
}

const TelegramContext = createContext<TelegramContextValue>({
  initData: null,
  error: null,
  loading: true,
  themeParams: null,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [initData, setInitData] = useState<InitData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeParams, setThemeParams] = useState<ThemeParams | null>(null);

  useEffect(() => {
    try {
      // Simulação de initData para ambiente local
      const initDataRaw = process.env.NODE_ENV === 'development'
        ? {
            user: {
              id: '123456',
              first_name: 'Usuário Simulado',
              username: 'simulado',
            },
            bags: [
              {
                id: '1',
                name: 'Bag Simulada',
                gastos: {
                  '123456': 95,
                  '654321': 153.5,
                },
                users: {
                  '123456': 'João',
                  '654321': 'Maria',
                },
              },
            ],
          }
        : null;

      // Define initData diretamente sem validação
      setInitData(initDataRaw);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar initData');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Ambiente de desenvolvimento: Telegram WebApp desabilitado.');
      return;
    }

    const WebApp = (window as any).Telegram?.WebApp;
    if (!WebApp) return;

    setThemeParams(WebApp.themeParams);
    WebApp.ready();
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, error, loading, themeParams }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);
