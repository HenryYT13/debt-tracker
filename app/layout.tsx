import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Quản Lý Nợ",
  description: "Ứng dụng quản lý nợ",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  )
}


import './globals.css'