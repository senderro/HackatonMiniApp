// backend: app/api/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface KeyValue {
  key: string
  value: string
}

interface RequestBody {
  initData: string
}

export async function POST(req: NextRequest) {
  // 1. Parse e tipagem do corpo
  const { initData }: RequestBody = await req.json()
  if (!initData) {
    return NextResponse.json({ ok: false, error: 'Missing initData' }, { status: 400 })
  }

  // 2. Quebra em pares "key=value" sem decodificar nada
  const rawPairs: string[] = initData.split('&')

  // 3. Extrai lista de KeyValue, removendo hash e signature
  const kv: KeyValue[] = rawPairs
    .map((pair: string): KeyValue => {
      const idx = pair.indexOf('=')
      return { key: pair.substring(0, idx), value: pair.substring(idx + 1) }
    })
    .filter(({ key }) => key !== 'hash' && key !== 'signature')

  // 4. Ordena pelas chaves
  kv.sort((a, b) => a.key.localeCompare(b.key))

  // 5. Monta a string exatamente como chegou (raw)
  const dataCheckString = kv.map(({ key, value }) => `${key}=${value}`).join('\n')

  // 6. Gera secretKey: HMAC_SHA256(key=BOT_TOKEN, msg="WebAppData")
  const BOT_TOKEN = (process.env.BOT_TOKEN ?? '').trim()
  const secretKey = crypto
    .createHmac('sha256', BOT_TOKEN)
    .update('WebAppData', 'utf8')
    .digest()

  // 7. Calcula o hash final: HMAC_SHA256(key=secretKey, msg=dataCheckString)
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString, 'utf8')
    .digest('hex')

  // 8. Extrai o hash recebido
  const rawHashPair = rawPairs.find(p => p.startsWith('hash='))
  const receivedHash = rawHashPair?.split('=')[1]
  if (!receivedHash) {
    return NextResponse.json({ ok: false, error: 'Missing hash' }, { status: 400 })
  }

  // 9. Comparação segura
  const match =
    receivedHash.length === computedHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    )

  console.log('→ DEBUG TELEGRAM VALIDATION (RAW)')
  console.log('data_check_string:\n' + dataCheckString)
  console.log('received hash:', receivedHash)
  console.log('computed hash:', computedHash)
  console.log('match:', match)

  if (!match) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'hash mismatch' },
      { status: 403 }
    )
  }

  // 10. Verifica expiração do auth_date (1h)
  const authEntry = kv.find(k => k.key === 'auth_date')
  const authDate = authEntry ? parseInt(authEntry.value, 10) : 0
  const now = Math.floor(Date.now() / 1000)
  if (now - authDate > 3600) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'auth_date expired' },
      { status: 403 }
    )
  }

  // 11. Sucesso!
  return NextResponse.json({ ok: true, verified: true })
}
