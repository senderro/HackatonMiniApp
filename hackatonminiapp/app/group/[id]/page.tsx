'use client';

import { useEffect, useState } from 'react';
import { useParams }        from 'next/navigation';
import { telegramFetch }    from '../../lib/telegramFetch';
import MemberCard           from '@/components/MemberCard';
import TransactionItem      from '@/components/TransactionItem';
import { useTelegram }      from '@/contexts/TelegramContext';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { TonClient }        from '@ton/ton';
import { Address, beginCell } from '@ton/core';
import { storePayment }     from '@/contracts/build/FeePayment_FeePayment';

export default function GroupDetail() {
  const { id } = useParams();
  const { initData } = useTelegram();

  // Endereço TON conectado (string ou "")
  const walletAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Estado da UI e dados
  const [members, setMembers]                 = useState<any[]>([]);
  const [txs, setTxs]                         = useState<any[]>([]);
  const [bagName, setBagName]                 = useState<string | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [cotacaoTon, setCotacaoTon]           = useState<number>(0);

  // Taxa on-chain
  const [feeNum, setFeeNum] = useState<number>(0);
  const [feeDen, setFeeDen] = useState<number>(1);

  // 1) Busca detalhes da bag e pendências
  useEffect(() => {
    async function fetchBagDetails() {
      try {
        // Detalhes da bag
        const res = process.env.NODE_ENV === 'development'
          ? await fetch(`/api/bagDetails?id=${id}`)
          : await telegramFetch(`/api/bagDetails?id=${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar detalhes da bag');
        setBagName(data.name);

        // Membros (coloca o usuário primeiro)
        const sessionId = String(initData?.user?.id);
        const selfM = data.members.find((m: any) => m.id === sessionId);
        const others = data.members.filter((m: any) => m.id !== sessionId);
        setMembers(selfM ? [selfM, ...others] : others);

        setTxs(data.transactions);

        // Pendências de pagamento
        const respP = process.env.NODE_ENV === 'development'
          ? await fetch(`/api/pendingPayments?id=${id}`)
          : await telegramFetch(`/api/pendingPayments?id=${id}`);
        const pd = await respP.json();
        if (respP.ok) {
          setPendingPayments(pd.pagamentos);
          setCotacaoTon(pd.cotacao_ton_brl);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBagDetails();
  }, [id, initData]);

  // 2) Busca taxa on-chain do contrato FeePayment
  useEffect(() => {
    async function fetchFeeOnChain() {
      try {
        const endpoint = `${process.env.NEXT_PUBLIC_RPC_ENDPOINT}?api_key=${process.env.NEXT_PUBLIC_TONCENTER_API_KEY}`;
        const client   = new TonClient({ endpoint });
        const addr     = Address.parse(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!);
        const { FeePayment } = await import('@/contracts/build/FeePayment_FeePayment');
        const contract = client.open(FeePayment.fromAddress(addr));

        const num = await contract.getGetFeeNumerator();
        const den = await contract.getGetFeeDenominator();
        setFeeNum(Number(num));
        setFeeDen(Number(den));
      } catch (e) {
        console.error('Erro ao ler fee:', e);
      }
    }
    fetchFeeOnChain();
  }, []);

  // 3) Handler do botão "Pagar"
  const handlePay = async (p: any) => {
    if (!walletAddress) {
      alert('❗ Conecte sua carteira em seu perfil antes de efetuar pagamentos.');
      return;
    }

    // Cálculo de valores em TON
    const principalTon = p.valor_ton;
    const feeTon       = principalTon * feeNum / feeDen;
    // Converte para nanoTON
    const principalNano = BigInt(Math.floor(principalTon * 1e9));
    const feeNano       = BigInt(Math.floor(feeTon * 1e9));
    const totalNano     = principalNano + feeNano;

    // Monta payload Payment { $$type, amount, recipient }
    const recipient = Address.parse(p.para.wallet);
    const paymentPayload = {
      $$type: 'Payment' as const,
      amount: principalNano,
      recipient,
    };
    const bodyCell = beginCell()
      .store(storePayment(paymentPayload))
      .endCell();

    // Dispara a transação via TonConnect
    await tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [{
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        amount:  totalNano.toString(),
        payload: bodyCell.toBoc().toString('base64'),
      }],
    });
  };

  if (loading || !members.length) return <p>Carregando detalhes da bag...</p>;
  if (error)                       return <p>Erro: {error}</p>;

  return (
    <div className="p-4 space-y-6 min-h-screen" style={{ backgroundColor: '#000', color: '#fff' }}>
      {/* Aviso se não estiver conectado */}
      {!walletAddress && (
        <div className="bg-yellow-800 text-yellow-100 rounded-lg p-3">
          ❗ Para pagar, conecte sua carteira em&nbsp;
          <a href="/perfil" className="underline font-semibold">seu perfil</a>.
        </div>
      )}

      {/* Nome da Bag */}
      <h1 className="text-3xl font-bold text-center">{bagName}</h1>

      {/* Pagamentos Pendentes */}
      {pendingPayments.length > 0 && (
        <div className="bg-white text-black rounded-xl p-4 space-y-3">
          <h2 className="text-xl font-bold">💰 Você deve:</h2>
          {pendingPayments.map((p, idx) => {
            const feeBrl   = p.valor_brl * feeNum / feeDen;
            const totalBrl = p.valor_brl + feeBrl;
            const totalTon = p.valor_ton * (1 + feeNum / feeDen);

            return (
              <div
                key={idx}
                className="flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-medium">
                    R$ {p.valor_brl.toFixed(2)} + R$ {feeBrl.toFixed(2)} = R$ {totalBrl.toFixed(2)}{' '}
                    (≈ {totalTon.toFixed(3)} TON)
                  </p>
                  <p className="text-sm text-gray-700">Para: {p.para.nome}</p>
                </div>
                <button
                  onClick={() => handlePay(p)}
                  disabled={!walletAddress}
                  className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  Pagar
                </button>
              </div>
            );
          })}
          <p className="text-xs text-gray-500 mt-1">
            Cotação atual: 1 TON ≈ R$ {cotacaoTon.toFixed(2)}
          </p>
        </div>
      )}

      {/* Card do usuário logado */}
      {members[0] && (
        <div className="mb-6">
          <MemberCard member={members[0]} highlight fullWidth />
        </div>
      )}

      {/* Outros membros */}
      <div className="grid grid-cols-3 gap-3">
        {members.slice(1).map(m => (
          <MemberCard key={m.id} member={m} highlight={false} />
        ))}
      </div>

      {/* Transações */}
      <h2 className="text-2xl font-semibold mt-6">Transações</h2>
      <div className="space-y-4">
        {txs.map(t => (
          <TransactionItem key={t.id} tx={t} theme="dark" />
        ))}
      </div>
    </div>
  );
}
