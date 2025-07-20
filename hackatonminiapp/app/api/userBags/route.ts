// src/app/api/userBags/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { withTelegramAuth } from '@/app/lib/requireAuth';

export const GET = withTelegramAuth(async (_req, initData) => {
  try {
    if (!initData?.user) {
      return NextResponse.json(
        { error: 'Dados do usuário não encontrados' },
        { status: 400 }
      );
    }

    const userId = BigInt(initData.user.id); // Obtém o ID do usuário autenticado

    // Busca apenas os bags associados ao usuário atual
    const rawBags = await prisma.bags.findMany({
      where: {
        bag_users: {
          some: {
            user_id: userId, // Filtra pelos bags que possuem o usuário atual
          },
        },
      },
      include: {
        bag_users: true,
      },
    });

    // Converte todos os BigInt para string e Date para ISO
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
  } catch (error) {
    console.error('Erro ao buscar bags:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar bags no banco de dados' },
      { status: 500 }
    );
  }
});