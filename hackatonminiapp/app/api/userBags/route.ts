// src/app/api/userBags/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export const GET = async (_req: Request) => {
  try {
    // Busca todos os bags no banco de dados
    const rawBags = await prisma.bags.findMany({
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
};