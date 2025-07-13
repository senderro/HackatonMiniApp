'use client';

import { useTelegram } from '@/contexts/TelegramContext';
import { useEffect, useState } from 'react';
import { telegramFetch } from './lib/telegramFetch';

interface Bag {
  id: number;
  name: string;
  chat_id: string;
  admin_user_id: string;
  created_at: string;
  welcome_message_id?: string | null;
}

export default function HomePage() {
  const { initData, error, loading } = useTelegram();
  const [bags, setBags] = useState<Bag[] | null>(null);
  const [bagsLoading, setBagsLoading] = useState(false);
  const [bagsError, setBagsError] = useState<string | null>(null);

  useEffect(() => {
    if (!initData) return;    // só busca quando tivermos initData
    setBagsLoading(true);

    telegramFetch('/api/userBags')
      .then(async res => {
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || 'Falha ao carregar bags');
        }
        setBags(payload.bags);
      })
      .catch(err => setBagsError((err as Error).message))
      .finally(() => setBagsLoading(false));
  }, [initData]);

  if (loading) {
    return <p>Carregando dados do Telegram…</p>;
  }
  if (error) {
    return <p className="text-red-600">Erro: {error}</p>;
  }
  if (!initData) {
    return <p>Nenhum dado de usuário encontrado.</p>;
  }

  return (
    <div className="p-4 space-y-6">
      <section>
        <h1 className="text-xl font-semibold">Olá, {initData.user.first_name}!</h1>
        <p>Username: @{initData.user.username ?? 'não informado'}</p>
        <p>ID: {initData.user.id}</p>
        <p>Idioma: {initData.user.language_code}</p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Minhas Bags</h2>

        {bagsLoading && <p>Carregando suas bags…</p>}
        {bagsError && (
          <p className="text-red-600">Erro ao carregar bags: {bagsError}</p>
        )}

        {!bagsLoading && bags && bags.length > 0 && (
          <ul className="space-y-2">
            {bags.map(bag => (
              <li
                key={bag.id}
                className="border rounded p-3 hover:shadow"
              >
                <h3 className="font-semibold text-md">{bag.name}</h3>
                <p className="text-sm text-gray-500">ID: {bag.id}</p>
              </li>
            ))}
          </ul>
        )}

        {!bagsLoading && bags && bags.length === 0 && (
          <p>Você não participa de nenhuma bag.</p>
        )}
      </section>
    </div>
  );
}
