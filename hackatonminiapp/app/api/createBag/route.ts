// src/app/api/createBag/route.ts
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';


const TOKEN = process.env.BOT_TOKEN;
const API = `https://api.telegram.org/bot${TOKEN}`;

export const POST = withTelegramAuth(async (req, initData) => {
  const { chat_id, message_id, name } = await req.json();

  // busca a bag existente
  const bag = await prisma.bags.findUnique({
    where: { chat_id: BigInt(chat_id) },
  });
  if (!bag) {
    return NextResponse.json({ error: 'Bag não encontrada' }, { status: 404 });
  }
  if (!initData || !initData.user) {
    return NextResponse.json({ error: 'Erro com initdata' }, { status: 404 });
  }
  // só o admin pode renomear
  if (bag.admin_user_id.toString() !== initData.user.id.toString()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  // atualiza o nome
  await prisma.bags.update({
    where: { chat_id: BigInt(chat_id) },
    data: { name },
  });

  // edita a mensagem no grupo
  const text = `🎉 Bag *${name}* criada com sucesso!\n\nQuem quiser, clique:`;
  const reply_markup = {
    inline_keyboard: [
      [
        {
          text: '👥 Entrar na bag',
          callback_data: 'joinBag', // ou web_app se quiser abrir mini app pra entrar
        },
      ],
    ],
  };
  await fetch(`${API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      message_id,
      text,
      parse_mode: 'Markdown',
      reply_markup,
    }),
  });

  return NextResponse.json({ success: true });
});
