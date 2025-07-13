// src/hooks/useApiFetch.ts

import { useTelegram } from "@/hook/useTelegramAuth";


export function useApiFetch() {
  const { raw } = useTelegram();

  return (input: RequestInfo, init: RequestInit = {}) => {
    const headers = {
      ...(init.headers || {}),
      ...(raw ? { Authorization: `tma ${raw}` } : {})
    };
    return fetch(input, { ...init, headers });
  };
}
