'use client'
import { useEffect, useState } from 'react'

type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

export default function Home() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [initData, setInitData] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const tg = (window as any).Telegram?.WebApp
    const userData = tg?.initDataUnsafe?.user
    const initDataRaw = tg?.initData

    if (initDataRaw) setInitData(initDataRaw)

    if (userData) {
      setUser(userData)
      tg.ready()

      fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initDataRaw }),
      })
        .then(res => res.json())
        .then(data => {
          setVerified(data.verified ?? false)
        })
        .catch(() => setVerified(false))
    }
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Telegram Mini App</h1>

      {user ? (
        <>
          <p>Olá, {user.first_name}!</p>
          {user.photo_url && (
            <img
              src={user.photo_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full mt-2"
            />
          )}
          <div className="mt-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">🧾 Dados do Usuário</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded-md">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div className="mt-4 w-full max-w-md">
            <h2 className="text-lg font-semibold">🔐 initData</h2>
            <pre className="text-xs bg-yellow-100 p-2 rounded-md break-all">
              {initData || 'initData não disponível'}
            </pre>
          </div>

          <div className="mt-4">
            {verified === true && <p className="text-green-600">✅ Usuário verificado</p>}
            {verified === false && (
              <p className="text-red-600">❌ Dados inválidos ou não verificados</p>
            )}
          </div>
        </>
      ) : (
        <p>Carregando dados do Telegram...</p>
      )}
    </main>
  )
}
