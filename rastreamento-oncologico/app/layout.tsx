import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rastreamento Oncológico em Massa | Detecção Precoce de Câncer',
  description:
    'Plataforma de rastreamento oncológico inteligente para detecção precoce de câncer via WhatsApp. Identifica pacientes em risco com base em critérios clínicos validados.',
  keywords: ['rastreamento oncológico', 'detecção precoce', 'câncer', 'saúde pública', 'WhatsApp'],
  authors: [{ name: 'Equipe Oncológica' }],
  robots: 'noindex, nofollow', // Dados sensíveis — não indexar
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
