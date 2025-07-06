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

  // REMOVE hash e signature para cálculo
  params.delete('hash')
  params.delete('signature') // ← esse aqui é importante!

  // Ordena alfabeticamente e monta a data_check_string
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join('\n')

  // Gera HMAC com o bot token
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest()
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  const receivedHashBuffer = Buffer.from(receivedHash, 'hex')
const computedHashBuffer = Buffer.from(computedHash, 'hex')
const match =
  receivedHashBuffer.length === computedHashBuffer.length &&
  crypto.timingSafeEqual(receivedHashBuffer, computedHashBuffer)

  console.log('→ DEBUG TELEGRAM VALIDATION')
  console.log('data_check_string:', dataCheckString)
  console.log('received hash:', receivedHash)
  console.log('computed hash:', computedHash)
  console.log('match:', match)

  return NextResponse.json({ ok: true, verified: match })
}
