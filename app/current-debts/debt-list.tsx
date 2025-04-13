"use client"

import { useState } from "react"
import type { Debt } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { updateDebtPayment, markAsPaid } from "../actions"
import { useToast } from "@/hooks/use-toast"

interface DebtListProps {
  debts: Debt[]
}

export function DebtList({ debts }: DebtListProps) {
  const { toast } = useToast()
  const [expandedDebt, setExpandedDebt] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lọc nợ theo trạng thái
  const activeDebts = debts.filter((debt) => debt.status === "active")
  const paidDebts = debts.filter((debt) => debt.status === "paid")

  const [showPaidDebts, setShowPaidDebts] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)

  async function handleUpdatePayment(debtId: string) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("debtId", debtId)
    formData.append("paymentAmount", paymentAmount.toString())
    formData.append("notes", "")

    try {
      const result = await updateDebtPayment(formData)

      if (result.success) {
        toast({
          title: "Thành công!",
          description: result.message,
          variant: "success",
        })

        // Reset form
        setPaymentAmount(0)
        setExpandedDebt(null)

        // Reload page to refresh data
        window.location.reload()
      } else {
        toast({
          title: "Lỗi!",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Đã xảy ra lỗi khi cập nhật thanh toán",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMarkAsPaid(debtId: string) {
    setIsSubmitting(true)

    try {
      const result = await markAsPaid(debtId)

      if (result.success) {
        toast({
          title: "Thành công!",
          description: result.message,
          variant: "success",
        })

        // Reload page to refresh data
        window.location.reload()
      } else {
        toast({
          title: "Lỗi!",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: "Đã xảy ra lỗi khi đánh dấu là đã trả",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleDebtExpansion(debtId: string) {
    if (expandedDebt === debtId) {
      setExpandedDebt(null)
    } else {
      setExpandedDebt(debtId)
      // Đặt số tiền mặc định là 0
      setPaymentAmount(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Giữ nguyên phần đầu */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{showPaidDebts ? "Nợ đã trả" : "Nợ chưa trả"}</h2>
        <button
          onClick={() => setShowPaidDebts(!showPaidDebts)}
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {showPaidDebts ? "Xem nợ chưa trả" : "Xem nợ đã trả"}
        </button>
      </div>

      <div className="space-y-4">
        {(showPaidDebts ? paidDebts : activeDebts).length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">
              {showPaidDebts ? "Không có khoản nợ nào đã trả" : "Không có khoản nợ nào chưa trả"}
            </p>
          </div>
        ) : (
          (showPaidDebts ? paidDebts : activeDebts).map((debt) => (
            <div key={debt.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{debt.name}</h3>
                    <p className="text-gray-600">{debt.phone}</p>
                    {debt.email && <p className="text-gray-600">{debt.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Số nợ: {formatCurrency(Number(debt.amount))}</p>
                    <p className={`${debt.status === "paid" ? "text-green-600" : "text-red-600"} font-medium`}>
                      {debt.status === "paid"
                        ? "Đã trả đủ"
                        : `Còn nợ: ${formatCurrency(Number(debt.remaining_amount))}`}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  <p>Ngày tạo: {formatDate(debt.created_at)}</p>
                  {debt.notes && <p className="mt-1">Ghi chú: {debt.notes}</p>}
                </div>

                {debt.status === "active" && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => toggleDebtExpansion(debt.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Thay đổi
                    </button>
                    <button
                      onClick={() => handleMarkAsPaid(debt.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      Đã trả đủ
                    </button>
                  </div>
                )}
              </div>

              {expandedDebt === debt.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <h4 className="font-medium mb-2">Cập nhật thanh toán</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền nợ</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                          {formatCurrency(Number(debt.amount))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                          Số tiền trả
                        </label>
                        <input
                          type="number"
                          id="paymentAmount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          min="0"
                          max={Number(debt.remaining_amount)}
                          step="1000"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền còn lại</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                          {formatCurrency(Number(debt.remaining_amount) - paymentAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdatePayment(debt.id)}
                        disabled={isSubmitting || paymentAmount <= 0 || paymentAmount > Number(debt.remaining_amount)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                      </button>
                      <button
                        onClick={() => setExpandedDebt(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
