'use client';

import { telegramFetch } from '../../lib/telegramFetch';
import MemberCard from '@/components/MemberCard';
import TransactionItem from '@/components/TransactionItem';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/contexts/TelegramContext';

export default function GroupDetail() {
  const { id } = useParams();
  const { initData, themeParams } = useTelegram(); // Obtém os dados do usuário e os parâmetros de tema
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
          res = await fetch(`/api/bagDetails?id=${id}`);
        } else {
          res = await telegramFetch(`/api/bagDetails?id=${id}`);
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar detalhes da bag');
        setBagName(data.name);

        const sessionUserId = initData?.user?.id;
        const sessionMember = data.members.find((m: any) => m.user_id === sessionUserId);
        const otherMembers = data.members.filter((m: any) => m.user_id !== sessionUserId);

        if (sessionMember) {
          setMembers([sessionMember, ...otherMembers]);
        } else {
          setMembers(otherMembers);
        }

        setTxs(data.transactions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBagDetails();
  }, [id, initData]);

  if (loading || !members.length) return <p>Carregando detalhes da bag...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div
      className="p-4 space-y-6 min-h-screen"
      style={{
        backgroundColor: themeParams?.bg_color || '#000000', // Usa o bg_color do Telegram ou preto como padrão
        color: themeParams?.text_color || '#FFFFFF', // Usa o text_color do Telegram ou branco como padrão
      }}
    >
      {/* Nome da Bag com estilização */}
      <h1 className="text-3xl font-bold text-center">{bagName}</h1>

      {/* Card do usuário da sessão */}
      {members[0] && (
        <div className="mb-6">
          <MemberCard
            member={members[0]}
            highlight={true}
            fullWidth={true} // Passa uma prop para ocupar toda a largura
          />
        </div>
      )}

      {/* Outros membros */}
      <div className="grid grid-cols-3 gap-3">
        {members.slice(1).map(m => (
          <MemberCard key={m.id} member={m} highlight={false} />
        ))}
      </div>

      {/* Título das Transações */}
      <h2 className="text-2xl font-semibold mt-6">Transações</h2>

      {/* Contêiner de transações */}
      <div className="space-y-4">
        {txs.map(t => (
          <TransactionItem
            key={t.id}
            tx={t}
            theme={themeParams?.theme === 'light' ? 'light' : 'dark'}
          />
        ))}
      </div>
    </div>
  );
}

