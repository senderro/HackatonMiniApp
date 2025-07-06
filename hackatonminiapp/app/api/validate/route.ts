// app/api/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const { initData } = await request.json();
  if (typeof initData !== 'string') {
    return NextResponse.json({ error: 'initData não enviado' }, { status: 400 });
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return NextResponse.json({ error: 'hash ausente' }, { status: 400 });
  }

  params.delete('hash');
  const dataCheck = Array.from(params.keys())
    .sort()
    .map(k => `${k}=${params.get(k)}`)
    .join('\n');

  const botToken = process.env.BOT_TOKEN!;
  const secretKey = crypto.createHmac('sha256', botToken).update('WebAppData').digest();
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheck).digest('hex');

  if (expectedHash !== hash) {
    return NextResponse.json({ valid: false, error: 'assinatura inválida' }, { status: 403 });
  }

  const user = JSON.parse(params.get('user')!);
  return NextResponse.json({ valid: true, data: { user } });
}
