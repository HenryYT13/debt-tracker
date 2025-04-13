import { NavMenu } from "@/components/nav-menu"
import { DebtList } from "./debt-list"
import { getCurrentDebts } from "../actions"

export default async function CurrentDebtsPage() {
  const debts = await getCurrentDebts()

  return (
    <div className="min-h-screen flex flex-col">
      <NavMenu />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Nợ hiện tại</h1>
        <DebtList debts={debts} />
      </main>
    </div>
  )
}
