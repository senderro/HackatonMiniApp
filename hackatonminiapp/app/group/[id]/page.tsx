'use client';
import MemberCard from '@/components/MemberCard';
import TransactionItem from '@/components/TransactionItem';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function GroupDetail() {
  const { id } = useParams();
  const [members, setMembers] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  useEffect(() => {
    setMembers([
      { id: 'u1', name: 'João', balance: -10 },
      { id: 'u2', name: 'Maria', balance: 5 },
      { id: 'u3', name: 'Você', balance: 5 },
    ]);
    setTxs([
      { id: 't1', description: 'Pizza no Centro', amount: 30, from: 'João', to: 'Maria' },
      { id: 't2', description: 'Táxi aeroporto', amount: 15, from: 'Você', to: 'João' },
    ]);
  }, [id]);

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {members.map(m => <MemberCard key={m.id} member={m} highlight={m.id === 'u3'} />)}
      </div>
      <div className="space-y-4">
        {txs.map(t => <TransactionItem key={t.id} tx={t} />)}
      </div>
    </div>
  );
}