// backend: app/api/validate/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const BOT_TOKEN = (process.env.BOT_TOKEN ?? '').trim()

export async function POST(req: NextRequest) {
  const { initData } = await req.json()

  if (!initData) {
    return NextResponse.json({ ok: false, error: 'Missing initData' }, { status: 400 })
  }

  // 1. Parse e extraia o hash
  const params = new URLSearchParams(initData)
  const receivedHash = params.get('hash')
  if (!receivedHash) {
    return NextResponse.json({ ok: false, error: 'Missing hash' }, { status: 400 })
  }
  params.delete('hash')
  params.delete('signature') // em caso de uso de third‐party

  // 2. Monte o data_check_string ordenado
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  // 3. Gere o secretKey correto:
  //    HMAC_SHA256(key=BOT_TOKEN, msg="WebAppData") :contentReference[oaicite:0]{index=0}
  const secretKey = crypto
    .createHmac('sha256', BOT_TOKEN, { encoding: 'utf8' })
    .update('WebAppData', 'utf8')
    .digest()            // Buffer de 32 bytes

  // 4. Calcule o hash final:
  //    HMAC_SHA256(key=secretKey, msg=dataCheckString)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString, 'utf8')
    .digest('hex')

  // 5. Logs detalhados para HEX-debug
  console.log('→ DEBUG TELEGRAM VALIDATION')
  console.log('BOT_TOKEN   (utf8→hex):', Buffer.from(BOT_TOKEN, 'utf8').toString('hex'))
  console.log('secretKey   (hex)      :', secretKey.toString('hex'))
  console.log('data_check_string      :\n' + dataCheckString)
  console.log('data_check_string (hex):', Buffer.from(dataCheckString, 'utf8').toString('hex'))
  console.log('received hash (hex)    :', receivedHash)
  console.log('computed hash (hex)    :', computedHash)

  // 6. Compare de forma segura
  let match = false
  try {
    match =
      receivedHash.length === computedHash.length &&
      crypto.timingSafeEqual(
        Buffer.from(receivedHash, 'hex'),
        Buffer.from(computedHash, 'hex')
      )
  } catch {
    match = false
  }

  // 7. Verifique expiração do auth_date (1 hora)
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
