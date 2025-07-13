// src/app/api/userBags/route.ts
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';

import { prisma } from '../../lib/prisma';


export const GET = withTelegramAuth(async (req, initData) => {
  // 1) Garante que existe user no initData
  if (!initData.user || initData.user.id == null) {
    return NextResponse.json(
      { error: 'Dados do usuário não encontrados no initData' },
      { status: 400 }
    );
  }

  // 2) Converte o ID p/ BigInt
  const userId = BigInt(initData.user.id);

  // 3) Busca as bags a que o user pertence
  const bags = await prisma.bags.findMany({
    where: { bag_users: { some: { user_id: userId } } },
  });

  return NextResponse.json({ bags });
});
