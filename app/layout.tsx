import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import TawkChat from '@/components/tawk-chat'

export const metadata: Metadata = {
  title: '纸片人男友2.0 - 阿星',
  description: '周星驰式无厘头幽默AI陪伴，用土味情话温暖你每一天',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SessionProvider>{children}</SessionProvider>
        <TawkChat />
      </body>
    </html>
  )
}
