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
    <html lang="pt-br">
      <head>
        <meta name="google-site-verification" content="Q0zjLFrZMxnyQ0pg7qy-xqrieBim5tK-7itR74qjN0w" />
        <script type="text/javascript">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "vaikw4xku5");`}
        </script>
      </head>
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
