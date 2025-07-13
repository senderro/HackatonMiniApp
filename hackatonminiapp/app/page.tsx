'use client';

import { useTelegram } from '@/contexts/TelegramContext';

export default function HomePage() {
  const { initData, error, loading } = useTelegram();

  if (loading) {
    return <p>Carregando dados do Telegram…</p>;
  }
  if (error) {
    return <p className="text-red-600">Erro: {error}</p>;
  }
  if (!initData) {
    return <p>Nenhum dado encontrado.</p>;
  }

  const { user } = initData; // initData.user contém id, first_name, last_name?, username?, language_code

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-xl font-semibold">Olá, {user.first_name}!</h1>
      <p>Username: @{user.username ?? 'não informado'}</p>
      <p>ID: {user.id}</p>
      <p>Idioma: {user.language_code}</p>
    </div>
  );
}
