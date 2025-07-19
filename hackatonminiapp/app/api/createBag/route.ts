import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

const TOKEN = process.env.BOT_TOKEN;
const API   = `https://api.telegram.org/bot${TOKEN}`;

export const POST = withTelegramAuth(async (req, initData) => {
  const { chat_id, name } = await req.json();

  // 1) busca a bag que já tem o welcome_message_id salvo
  const bag = await prisma.bags.findUnique({
    where: { chat_id: BigInt(chat_id) },
  });
  if (!bag) {
    return NextResponse.json({ error: 'Bag não encontrada' }, { status: 404 });
  }
  if (!initData?.user) {
    return NextResponse.json({ error: 'Erro com initData' }, { status: 400 });
  }
  if (bag.admin_user_id.toString() !== initData.user.id.toString()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  // 2) atualiza o nome no banco
  await prisma.bags.update({
    where: { chat_id: BigInt(chat_id) },
    data: { name },
  });

  // 3) edita a mensagem original usando o welcome_message_id do DB
  const text = `🎉 Bag *${name}* criada com sucesso!\n\nQuem quiser, clique:`;
  const reply_markup = {
    inline_keyboard: [
      [{ text: '👥 Entrar na bag', callback_data: 'joinBag' }]
    ],
  };

  await fetch(`${API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      message_id: Number(bag.welcome_message_id),
      text,
      parse_mode: 'Markdown',
      reply_markup,
    }),
  });

  return NextResponse.json({ success: true });
});
