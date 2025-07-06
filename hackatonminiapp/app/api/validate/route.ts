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
  // 1. Tipar o corpo da requisição
  const { initData }: RequestBody = await req.json()

  if (!initData) {
    return NextResponse.json(
      { ok: false, error: 'Missing initData' },
      { status: 400 }
    )
  }

  // 2. Separar a query string bruta em pares "key=value"
  const rawPairs: string[] = initData.split('&')

  // 3. Extrair key/value sem decodificar e filtrar out 'hash'
  const kv: KeyValue[] = rawPairs
    .map((pair: string): KeyValue => {
      const idx: number = pair.indexOf('=')
      return {
        key: pair.substring(0, idx),
        value: pair.substring(idx + 1),
      }
    })
    .filter(({ key }: KeyValue) => key !== 'hash')

  // 4. Ordenar alfabeticamente pelos nomes das chaves
  kv.sort((a: KeyValue, b: KeyValue) => a.key.localeCompare(b.key))

  // 5. Montar a data_check_string exatamente como veio
  const dataCheckString: string = kv
    .map(({ key, value }: KeyValue) => `${key}=${value}`)
    .join('\n')

  // 6. Gerar secretKey: HMAC_SHA256(key=BOT_TOKEN, msg="WebAppData")
  const BOT_TOKEN: string = (process.env.BOT_TOKEN ?? '').trim()
  const secretKey: Buffer = crypto
    .createHmac('sha256', BOT_TOKEN)
    .update('WebAppData', 'utf8')
    .digest()

  // 7. Calcular o hash final: HMAC_SHA256(key=secretKey, msg=dataCheckString)
  const computedHash: string = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString, 'utf8')
    .digest('hex')

  // 8. Extrair o hash recebido diretamente dos rawPairs
  const rawHashPair: string | undefined = rawPairs.find(
    (p: string) => p.startsWith('hash=')
  )
  const receivedHash: string | undefined = rawHashPair
    ? rawHashPair.split('=')[1]
    : undefined

  if (!receivedHash) {
    return NextResponse.json(
      { ok: false, error: 'Missing hash' },
      { status: 400 }
    )
  }

  // 9. Comparação segura dos hashes
  const match: boolean =
    receivedHash.length === computedHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    )

  console.log('→ DEBUG TELEGRAM VALIDATION (RAW)')
  console.log('data_check_string:', dataCheckString)
  console.log('received hash:', receivedHash)
  console.log('computed hash:', computedHash)
  console.log('match:', match)

  if (!match) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'hash mismatch' },
      { status: 403 }
    )
  }

  // 10. Verificar expiração de auth_date (1h)
  const authDateEntry: KeyValue | undefined = kv.find(
    ({ key }: KeyValue) => key === 'auth_date'
  )
  const authDate: number = authDateEntry
    ? parseInt(authDateEntry.value, 10)
    : 0
  const now: number = Math.floor(Date.now() / 1000)

  if (now - authDate > 3600) {
    return NextResponse.json(
      { ok: false, verified: false, reason: 'auth_date expired' },
      { status: 403 }
    )
  }

  // 11. Se chegou aqui, está tudo certo
  return NextResponse.json({ ok: true, verified: true })
}
