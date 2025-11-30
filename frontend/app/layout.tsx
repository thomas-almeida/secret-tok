import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Rapidinhas - Espie sem compromisso",
  description: "O conteúdo hot que você estava procurando está bem aqui",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans antialiased overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
