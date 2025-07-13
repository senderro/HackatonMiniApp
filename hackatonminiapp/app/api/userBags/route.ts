// src/app/api/userBags/route.ts
import { bag_users, bags } from '@/app/generated/prisma';
import { requireAuth } from '@/app/lib/requireAuth';
import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  try {
    // 1) Valida initData e extrai user
    const initData = await requireAuth(request as any);
    if (!initData.user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado no initData' },
        { status: 400 }
      );
    }
    const userId = BigInt(initData.user.id);

    // 2) Busca as entradas da junção bag_users
    //    — o include { bag: true } faz com que cada item tenha `bag: Bag`
    const entries: (bag_users & { bag: bags })[] = await prisma.bagUser.findMany({
      where: { user_id: userId },
      include: { bag: true }
    });

    // 3) Monta a resposta
    const bags = entries.map((entry) => {
      const bag = entry.bag;  // Agora `bag` tem tipo explícito `Bag`
      return {
        id:      bag.id.toString(),
        name:    bag.name,
        balance: 0
      };
    });

    return NextResponse.json({ bags });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
