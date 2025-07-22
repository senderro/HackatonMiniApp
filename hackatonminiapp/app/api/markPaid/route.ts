import { NextResponse }     from 'next/server';
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { prisma }           from '@/app/lib/prisma';

export const POST = withTelegramAuth(async (req: Request, initData: any) => {
  const { pendingPaymentId, inMessageBoc } = await req.json();
   let body: any;
  try {
    body = await req.clone().json();
  } catch (e) {
    console.error('markPaid: erro ao fazer clone().json()', e);
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
  }
  console.log('📥 /api/markPaid recebeu:', body);
  if (!pendingPaymentId || typeof inMessageBoc !== 'string') {
    return NextResponse.json(
      { error: 'pendingPaymentId e inMessageBoc são necessários' },
      { status: 400 }
    );
  }

  try {
    // Só salva o BOC da mensagem; o worker vai confirmar on‐chain e marcar pago
    await prisma.pendingPayment.update({
      where: { id: pendingPaymentId },
      data: { txHash: inMessageBoc },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Erro /api/markPaid:', e);
    return NextResponse.json(
      { error: 'Falha ao registrar inMessageBoc' },
      { status: 500 }
    );
  }
});
