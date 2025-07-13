import { useTelegram } from "@/hook/useTelegramAuth";

// Uma camada simples sobre fetch que injeta o initDataRaw no header
export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {

  const { raw } = useTelegram();

  const headers = {
    ...(init.headers || {}),
    ...(raw ? { authorization: `tma ${raw}` } : {})
  };
  return fetch(input, { ...init, headers });
}
