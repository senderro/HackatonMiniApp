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
  const webApp = (window as any).Telegram?.WebApp;

  console.log('WebApp objeto:', webApp);
  if (webApp) {
    webApp.ready();
  }

  const rawData =
    (webApp as any)?.initData ||
    new URLSearchParams(window.location.search).get('initData') ||
    '';

  console.log('RawData capturado:', rawData);

  if (!rawData) return;

  console.log('Chamando /api/validate com:', rawData);
  fetch('/api/validate', {
    method: 'POST',
    headers: { authorization: `tma ${rawData}` }
  })
    .then(res => {
      console.log('/api/validate response status', res.status);
      return res.json();
    })
    .then(data => {
      console.log('/api/validate JSON', data);
      if (data.valid && data.initData) {
        setInitData(data.initData);
        setRaw(rawData);
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
