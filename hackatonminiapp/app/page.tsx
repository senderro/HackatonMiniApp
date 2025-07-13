'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiChevronRight } from 'react-icons/hi';
import { apiFetch } from './utils/apiFetch';
import { useTelegram } from '@/hook/useTelegramAuth';


type Group = {
  id:      string;
  name:    string;
  balance: number;
};

export default function Home() {
   const { raw } = useTelegram();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!raw) return;  
    setLoading(true);
    apiFetch('/api/userBags')
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setGroups(data.bags);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Falha ao carregar suas bags.');
      })
      .finally(() => setLoading(false));
  }, [raw]);

  if (loading) return <p className="p-4">Carregando...</p>;
  if (error)   return <p className="p-4 text-red-500">{error}</p>;
  if (groups.length === 0) return <p className="p-4">Você não está em nenhuma bag ainda.</p>;

  return (
    <div className="p-4 space-y-4">
      {groups.map(g => (
        <Link
          key={g.id}
          href={`/group/${g.id}`}
          className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-md"
        >
          <div>
            <h2 className="font-semibold text-lg">{g.name}</h2>
            <p className="text-sm text-gray-500">Detalhes do grupo</p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`font-semibold ${g.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              R$ {g.balance.toFixed(2)}
            </span>
            <HiChevronRight />
          </div>
        </Link>
      ))}
    </div>
  );
}
