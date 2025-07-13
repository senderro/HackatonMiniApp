// Uma camada simples sobre fetch que injeta o initDataRaw no header
export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  // pega o raw initData do contexto Telegram.WebApp
  const raw = (window as any).Telegram?.WebApp?.initDataUnsafe;
  const headers = {
    ...(init.headers || {}),
    ...(raw ? { authorization: `tma ${raw}` } : {})
  };
  return fetch(input, { ...init, headers });
}
