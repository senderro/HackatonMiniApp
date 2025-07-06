// app/page.tsx
'use client';

import { useEffect, useState } from 'react';

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export default function HomePage() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      setError('SDK do Telegram não encontrado');
      return;
    }
    tg.ready();

    // Carrega client-side
    const unsafe = tg.initDataUnsafe;
    if (unsafe.user) setUser(unsafe.user as TelegramUser);

    // Valida no backend
    fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: tg.initData }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) setError('Validação falhou: ' + data.error);
      })
      .catch(err => setError('Erro de rede: ' + err.message));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>🏠 Home do MiniApp</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user ? (
        <ul>
          <li><strong>ID:</strong> {user.id}</li>
          <li><strong>Nome:</strong> {user.first_name} {user.last_name}</li>
          <li><strong>Username:</strong> {user.username}</li>
          <li><strong>Idioma:</strong> {user.language_code}</li>
          <li><strong>Premium:</strong> {user.is_premium ? 'Sim' : 'Não'}</li>
        </ul>
      ) : (
        <p>Carregando dados do usuário...</p>
      )}
    </div>
  );
}
