'use client';

import { useTelegram } from '@/contexts/TelegramContext';
import { useEffect, useState } from 'react';
import { telegramFetch } from './lib/telegramFetch';
import { HiChevronRight } from 'react-icons/hi';

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
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando dados do Telegram…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Erro: {error}</p>
      </div>
    );
  }

  if (!initData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado de usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Boas-vindas num card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 space-y-2">
        <h1 className="text-2xl font-semibold">Olá, {initData.user.first_name}!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          @{initData.user.username ?? 'não informado'}
        </p>
      </div>

      {/* Lista de Bags */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Minhas Bags</h2>

        {bagsLoading && (
          <div className="flex items-center justify-center py-6">
            <p className="text-gray-500">Carregando suas bags…</p>
          </div>
        )}

        {bagsError && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">Erro ao carregar bags: {bagsError}</p>
          </div>
        )}

        {!bagsLoading && bags && bags.length > 0 && (
          <ul className="space-y-3">
            {bags.map(bag => (
              <li
                key={bag.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow p-4 flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h3 className="text-md font-semibold">{bag.name}</h3>
                  <p className="text-xs text-gray-400">Criada em {new Date(bag.created_at).toLocaleDateString()}</p>
                </div>
                <HiChevronRight className="text-gray-400" />
              </li>
            ))}
          </ul>
        )}

        {!bagsLoading && bags && bags.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <p className="text-gray-500">Você não participa de nenhuma bag.</p>
          </div>
        )}
      </div>
    </div>
  );
}
