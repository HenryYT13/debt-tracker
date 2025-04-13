import { NavMenu } from "@/components/nav-menu"
import { DebtForm } from "./debt-form"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavMenu />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Ghi nợ mới</h1>
        <DebtForm />
      </main>
    </div>
  )
}
