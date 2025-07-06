import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const BOT_TOKEN = process.env.BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { initData } = await req.json()

  if (!initData) {
    return NextResponse.json({ ok: false, error: 'Missing initData' }, { status: 400 })
  }

  const params = new URLSearchParams(initData)

  const receivedHash = params.get('hash')
  if (!receivedHash) {
    return NextResponse.json({ ok: false, error: 'Missing hash' }, { status: 400 })
  }

  // 1. Remove os campos que não entram no cálculo
  params.delete('hash')
  params.delete('signature') // mesmo sendo para outro método

  // 2. Monta o data_check_string corretamente
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  // 3. Gera o secret_key: HMAC_SHA256(bot_token, "WebAppData")
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData') // chave = "WebAppData"
    .update(BOT_TOKEN)                 // mensagem = BOT_TOKEN
    .digest()

  // 4. Calcula o hash final: HMAC_SHA256(dataCheckString, secretKey)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  // 5. Compara os hashes de forma segura
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
  console.log('bot token:', BOT_TOKEN)

  // 6. Verificação opcional: validade do timestamp
  const authDate = parseInt(params.get('auth_date') || '0', 10)
  const now = Math.floor(Date.now() / 1000)
  const ageInSeconds = now - authDate
  const expired = ageInSeconds > 3600 // 1 hora

  if (!match) {
    return NextResponse.json({ ok: false, verified: false, reason: 'hash mismatch' }, { status: 403 })
  }

  if (expired) {
    return NextResponse.json({ ok: false, verified: false, reason: 'auth_date expired' }, { status: 403 })
  }

  return NextResponse.json({ ok: true, verified: true })
}
