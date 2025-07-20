import { prisma } from '@/app/lib/prisma';
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const bagId = Number(url.searchParams.get('id'));

  if (!bagId) {
    return NextResponse.json({ error: 'ID da bag não fornecido' }, { status: 400 });
  }

  try {
    // Valida se a bag existe e está aguardando pagamentos
    const bag = await prisma.bag.findUnique({
      where: { id: bagId },
    });

    if (!bag || bag.state !== 'AWAITING_PAYMENTS') {
      return NextResponse.json({ error: 'Bag inválida ou não está aguardando pagamentos' }, { status: 400 });
    }

    // Busca cotação do TON (The Open Network) em BRL via CoinGecko
    const cotacaoResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=brl');
    const cotacaoJson = await cotacaoResp.json();
    const cotacaoTON = cotacaoJson['the-open-network']?.brl;

    if (!cotacaoTON) {
      return NextResponse.json({ error: 'Erro ao obter cotação do TON' }, { status: 500 });
    }

    // Obtém dados do usuário logado via Telegram Auth
    const tgData = (req as any).telegramUser;
    const userId = BigInt(tgData.id);

    // Busca pagamentos pendentes para este usuário na bag
    const pendencias = await prisma.pendingPayment.findMany({
      where: {
        bag_id: bagId,
        user_id_from: userId,
        pago: false,
      },
      include: {
        recebedor: true,
      },
    });

    const pagamentos = pendencias.map(p => ({
      valor_brl: parseFloat(p.valor.toString()),
      valor_ton: parseFloat((parseFloat(p.valor.toString()) / cotacaoTON).toFixed(3)),
      para: {
        id: p.user_id_to.toString(),
        nome: p.recebedor.first_name || p.recebedor.username || 'Participante',
      },
    }));

    return NextResponse.json({
      pagamentos,
      cotacao_ton_brl: cotacaoTON,
    });
  } catch (err) {
    console.error('[GET /pendingPayments]', err);
    return NextResponse.json({ error: 'Erro ao buscar pendências' }, { status: 500 });
  }
};

// Aplica autenticação exceto no ambiente de desenvolvimento
export const GET = process.env.NODE_ENV !== 'development' ? withTelegramAuth(handler) : handler;
