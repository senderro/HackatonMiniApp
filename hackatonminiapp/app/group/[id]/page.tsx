'use client';

import { telegramFetch } from '../../lib/telegramFetch';
import MemberCard from '@/components/MemberCard';
import TransactionItem from '@/components/TransactionItem';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/contexts/TelegramContext';

export default function GroupDetail() {
  const { id } = useParams();
  const { initData } = useTelegram();

  const [members, setMembers] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [bagName, setBagName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [cotacaoTon, setCotacaoTon] = useState<number | null>(null);

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

        const sessionUserId = String(initData?.user?.id);

        const sessionMember = data.members.find((m: any) => m.id === sessionUserId);
        const otherMembers = data.members.filter((m: any) => m.id !== sessionUserId);

        if (sessionMember) {
          setMembers([sessionMember, ...otherMembers]);
        } else {
          setMembers(otherMembers);
        }

        setTxs(data.transactions);

        // Busca pendências de pagamento
        let resPagamentos;
        if (process.env.NODE_ENV === 'development') {
          resPagamentos = await fetch(`/api/pendingPayments?id=${id}`);
        } else {
          resPagamentos = await telegramFetch(`/api/pendingPayments?id=${id}`);
        }

        const pagamentosData = await resPagamentos.json();
        if (resPagamentos.ok) {
          setPendingPayments(pagamentosData.pagamentos);
          setCotacaoTon(pagamentosData.cotacao_ton_brl);
        }
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
        backgroundColor: '#000000',
        color: '#FFFFFF',
      }}
    >
      {/* Nome da Bag */}
      <h1 className="text-3xl font-bold text-center text-white">{bagName}</h1>

      {/* Pagamentos Pendentes */}
      {pendingPayments.length > 0 && (
        <div className="bg-white text-black rounded-xl p-4 space-y-3">
          <h2 className="text-xl font-bold">💰 Você deve:</h2>
          {pendingPayments.map((p, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2"
            >
              <div>
                <p className="font-medium">
                  R$ {p.valor_brl.toFixed(2)} (≈ {p.valor_ton.toFixed(2)} TON)
                </p>
                <p className="text-sm text-gray-700">Para: {p.para.nome}</p>
              </div>
              <button
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition"
                disabled
              >
                Pagar
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-1">
            Cotação atual: 1 TON ≈ R$ {cotacaoTon?.toFixed(2)}
          </p>
        </div>
      )}

      {/* Card do usuário logado */}
      {members[0] && (
        <div className="mb-6">
          <MemberCard member={members[0]} highlight={true} fullWidth={true} />
        </div>
      )}

      {/* Outros membros */}
      <div className="grid grid-cols-3 gap-3">
        {members.slice(1).map(m => (
          <MemberCard key={m.id} member={m} highlight={false} />
        ))}
      </div>

      {/* Transações */}
      <h2 className="text-2xl font-semibold mt-6 text-white">Transações</h2>

      <div className="space-y-4">
        {txs.map(t => (
          <TransactionItem key={t.id} tx={t} theme="dark" />
        ))}
      </div>
    </div>
  );
}
