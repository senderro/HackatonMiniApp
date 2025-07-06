// app/api/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const TELEGRAM_ED25519_PUBKEY_HEX =
  'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { initData } = body as { initData?: string };

  if (!initData) {
    return NextResponse.json({ error: 'initData não enviado' }, { status: 400 });
  }

  const params = new URLSearchParams(initData);
  const rawHash = params.get('hash');
  const signature = params.get('signature');

  // Remove campos de assinatura para reconstruir data-check-string
  if (rawHash) params.delete('hash');
  if (signature) params.delete('signature');

  const sortedKeys = Array.from(params.keys()).sort();
  const dataCheck = sortedKeys.map(k => `${k}=${params.get(k)}`).join('\n');

  // 1) Validação HMAC-SHA256 (para botões inline/keyboard)
  if (rawHash) {
    const botToken = process.env.BOT_TOKEN!;
    const secretKey = crypto.createHmac('sha256', botToken)
      .update('WebAppData')
      .digest();
    const expectedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheck)
      .digest('hex');

    if (expectedHash !== rawHash) {
      return NextResponse.json(
        { valid: false, error: 'assinatura HMAC inválida' },
        { status: 403 }
      );
    }
  }
  // 2) Validação Ed25519 (para Main Mini App / perfil / link ?startapp)
  else if (signature) {
    // Monta data-check-string com bot_id prefix
    const botId = process.env.BOT_ID!;
    const prefixed = `${botId}:WebAppData\n${dataCheck}`;

    // Converte assinatura Base64URL para Buffer
    const sigBuf = Buffer.from(
      signature.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );

    const pubKeyBuf = Buffer.from(TELEGRAM_ED25519_PUBKEY_HEX, 'hex');
    const isValid = crypto.verify(
      null,
      Buffer.from(prefixed, 'utf8'),
      { key: pubKeyBuf, format: 'der', type: 'spki' },
      sigBuf
    );

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'assinatura Ed25519 inválida' },
        { status: 403 }
      );
    }
  } else {
    // Nem hash nem signature estão presentes
    return NextResponse.json(
      { error: 'nenhum método de assinatura detectado' },
      { status: 400 }
    );
  }

  // Se chegou aqui, a assinatura está ok
  const user = JSON.parse(params.get('user')!);
  return NextResponse.json({ valid: true, data: { user } });
}
