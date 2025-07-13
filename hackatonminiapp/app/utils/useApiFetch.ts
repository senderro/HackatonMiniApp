// src/hooks/useApiFetch.ts

import { useTelegram } from "@/hook/useTelegramAuth";


export function useApiFetch() {
  const { raw } = useTelegram();
  console.log('useApiFetch raw:', raw);

  return (input: RequestInfo, init: RequestInit = {}) => {
    console.log('Chamada apiFetch para:', input, 'com raw:', raw);
    const headers = {
      ...(init.headers || {}),
      ...(raw ? { Authorization: `tma ${raw}` } : {})
    };
    return fetch(input, { ...init, headers });
  };
}
