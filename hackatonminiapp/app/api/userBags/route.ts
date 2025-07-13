// src/app/api/userBags/route.ts
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';

import { prisma } from '../../lib/prisma';
import { InitData } from '@telegram-apps/init-data-node';


export const GET = withTelegramAuth(async (_req: Request, initData: InitData) => {
  if (!initData.user?.id) {
    return NextResponse.json(
      { error: 'Dados do usuário não encontrados no initData' },
      { status: 400 }
    );
  }

  const userId = BigInt(initData.user.id);

  const rawBags = await prisma.bags.findMany({
    where: { bag_users: { some: { user_id: userId } } },
  });

  // Converte todos os BigInt para string, e Date para ISO
  const bags = rawBags.map(b => ({
    id: b.id,
    name: b.name,
    chat_id: b.chat_id.toString(),
    admin_user_id: b.admin_user_id.toString(),
    created_at: b.created_at.toISOString(),
    welcome_message_id: b.welcome_message_id != null
      ? b.welcome_message_id.toString()
      : null,
  }));

  return NextResponse.json({ bags });
});