// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // Garante apenas uma instância em HMR/development
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ||
  new PrismaClient({
    // se quiser monitorar queries, ative o log abaixo:
    // log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
