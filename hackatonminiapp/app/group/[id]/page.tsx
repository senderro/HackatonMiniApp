'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Member = { id: string; name: string; balance: number };

type Transaction = { id: string; description: string; amount: number; from: string; to: string };

export default function GroupDetail() {
  const { id } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    // TODO: fetch dados de membros e transações
    setMembers([
      { id: 'u1', name: 'João', balance: -10 },
      { id: 'u2', name: 'Maria', balance: 5 },
      { id: 'u3', name: 'Você', balance: 5 },
    ]);
    setTxs([
      { id: 't1', description: 'Pizza', amount: 30, from: 'João', to: 'Maria' },
      { id: 't2', description: 'Táxi', amount: 15, from: 'Você', to: 'João' },
    ]);
  }, [id]);

  return (
    <section className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Detalhes do Grupo</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {members.map(m => (
          <div key={m.id} className="p-4 bg-white rounded shadow">
            <h3 className="font-medium text-gray-800 mb-2">{m.name}</h3>
            <p className={`${m.balance >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>R$ {m.balance.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <h3 className="text-xl font-semibold mb-3">Transações</h3>
      <div className="space-y-4">
        {txs.map(t => (
          <div key={t.id} className="p-4 bg-white rounded shadow flex justify-between">
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-sm text-gray-500">{t.from} → {t.to}</p>
            </div>
            <span className={`${t.amount >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>R$ {t.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}