import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo 앱',
  description: '할 일 관리 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
