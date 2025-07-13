'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { InitData, parse, validate } from '@telegram-apps/init-data-node';

type TelegramContextValue = {
  initData: InitData | null;
  raw: string | null;
};

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [initData, setInitData] = useState<InitData | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  useEffect(() => {
    // Pega o initData do Telegram Client ou da query string
    const webApp = (window as any).Telegram?.WebApp;
    const rawData = webApp?.initDataUnsafe || new URLSearchParams(window.location.search).get('initData') || '';
    if (!rawData) return;

    fetch('/api/validate', {
      method: 'POST',
      headers: { authorization: `tma ${rawData}` }
    })
      .then(res => res.json())
      .then((data: { valid: boolean; initData?: InitData }) => {
        if (data.valid && data.initData) {
          setInitData(data.initData);
          setRaw(rawData);
        } else {
          console.error('Telegram initData validation failed', data);
        }
      })
      .catch(err => console.error('Validation request error', err));
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, raw }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error('useTelegram must be used inside <TelegramProvider>');
  }
  return ctx;
}
