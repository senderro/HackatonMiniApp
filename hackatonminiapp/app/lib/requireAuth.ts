// validação comum para rotas que exigem initData
import { NextRequest } from 'next/server';
import { parse, validate } from '@telegram-apps/init-data-node';

export async function requireAuth(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const [type, raw] = auth.split(' ');
  if (type !== 'tma' || !raw) {
    throw new Error('Missing Telegram initData in Authorization header');
  }
  // lança se inválido ou expirado
  validate(raw, process.env.BOT_TOKEN!, { expiresIn: 3600 });
  // retorna os dados parseados
  return parse(raw);
}
