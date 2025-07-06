import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN!

export async function POST(req: NextRequest) {
  const { initData } = await req.json()

  if (!initData) {
    return NextResponse.json({ ok: false, error: 'Missing initData' }, { status: 400 })
  }

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) {
    return NextResponse.json({ ok: false, error: 'Missing hash' }, { status: 400 })
  }

  params.delete('hash')

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')

  const secret = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest()
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')

  if (hmac === hash) {
    return NextResponse.json({ ok: true, verified: true })
  } else {
    return NextResponse.json({ ok: false, verified: false }, { status: 403 })
  }
}
