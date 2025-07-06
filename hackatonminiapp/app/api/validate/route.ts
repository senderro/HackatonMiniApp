// backend: pages/api/validate.ts (ou app/api/validate/route.ts se usar App Router)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const BOT_TOKEN = process.env.BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { initData } = await req.json()

  if (!initData) {
    return NextResponse.json(
      { ok: false, error: 'Missing initData' },
      { status: 400 }
    )
  }

  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')

  if (!receivedHash) {
    return NextResponse.json(
      { ok: false, error: 'Missing hash' },
      { status: 400 }
    )
  }

  // Remover hash dos parâmetros antes de criar a string de verificação
  params.delete('hash')
  params.delete('signature') // para compatibilidade, caso exista

  // Monta data_check_string: todos os pares key=value ordenados por key
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  // Gera secretKey: HMAC_SHA256(key=BOT_TOKEN, message="WebAppData")
  const secretKey = crypto
    .createHmac('sha256', BOT_TOKEN)
    .update('WebAppData')
    .digest()

  // Calcula o hash final: HMAC_SHA256(key=secretKey, message=dataCheckString)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  // Comparação segura dos hashes
  const match =
    receivedHash.length === computedHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    )

  console.log('→ DEBUG TELEGRAM VALIDATION')
  console.log('data_check_string:', dataCheckString)
  console.log('received hash:', receivedHash)
  console.log('computed hash:', computedHash)
  console.log('match:', match)

  // Verifica validade do timestamp (1 hora)
  const authDate = parseInt(params.get('auth_date') || '0', 10)
  const now = Math.floor(Date.now() / 1000)
  const expired = now - authDate > 3600

  if (!match) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'hash mismatch' },
      { status: 403 }
    )
  }

  if (expired) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'auth_date expired' },
      { status: 403 }
    )
  }

  return NextResponse.json({ ok: true, verified: true })
}
