// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Script from 'next/script'

export const metadata = {
  title: 'Telegram MiniApp',
  description: 'MiniApp Home',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Carrega o SDK Telegram *antes* da página interagir */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
