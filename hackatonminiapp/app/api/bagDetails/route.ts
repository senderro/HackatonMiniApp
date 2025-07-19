import { prisma } from '@/app/lib/prisma';
import { withTelegramAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';

const handler = async (req: Request) => {
    const url = new URL(req.url);
    const bagId = Number(url.searchParams.get('id'));

    if (!bagId) {
        return NextResponse.json({ error: 'ID da bag não fornecido' }, { status: 400 });
    }

    const bag = await prisma.bags.findUnique({
        where: { id: bagId },
        include: {
            bag_users: {
                include: {
                    users: true,
                },
            },
        },
    });

    if (!bag) {
        return NextResponse.json({ error: 'Bag não encontrada' }, { status: 404 });
    }

    const members = bag.bag_users.map(bu => ({
        id: bu.user_id.toString(),
        name: bu.users.first_name || bu.users.username || 'Usuário desconhecido',
        total_spent: bu.total_spent || 0,
    }));

    return NextResponse.json({
        name: bag.name,
        members,
    });
};

// Aplica `withTelegramAuth` em qualquer ambiente diferente de `development`
export const GET = process.env.NODE_ENV !== 'development' ? withTelegramAuth(handler) : handler;