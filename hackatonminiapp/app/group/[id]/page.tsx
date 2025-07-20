'use client';

import { telegramFetch } from '../../lib/telegramFetch';
import MemberCard from '@/components/MemberCard';
import TransactionItem from '@/components/TransactionItem';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GroupDetail() {
  const { id } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [bagName, setBagName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBagDetails() {
      try {
        let res;
        if (process.env.NODE_ENV === 'development') {
          // Ambiente de desenvolvimento: usa fetch diretamente
          res = await fetch(`/api/bagDetails?id=${id}`);
        } else {
          // Ambiente de produção: usa telegramFetch
          res = await telegramFetch(`/api/bagDetails?id=${id}`);
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar detalhes da bag');
        setBagName(data.name);
        setMembers(data.members); // Expects members with `total_spent`
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBagDetails();
  }, [id]);

  if (loading) return <p>Carregando detalhes da bag...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">{bagName}</h1>
      <div className="grid grid-cols-3 gap-3">
        {members.map(m => (
          <MemberCard key={m.id} member={m} highlight={m.id === 'u3'} />
        ))}
      </div>
      <div className="space-y-4">
        {txs.map(t => (
          <TransactionItem key={t.id} tx={t} />
        ))}
      </div>
    </div>
  );
}

