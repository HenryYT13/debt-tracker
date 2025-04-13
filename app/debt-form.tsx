"use client"

import { useState } from "react"
import { addDebt } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function DebtForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await addDebt(formData)

      if (result.success) {
        toast({
          title: "Thành công!",
          description: result.message,
          variant: "success",
        })

        // Reset form
        const form = document.getElementById("debt-form") as HTMLFormElement
        form.reset()
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
        description: "Đã xảy ra lỗi khi lưu nợ",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="debt-form" action={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            pattern="[0-9]{10,11}"
            minLength={10}
            maxLength={11}
            title="Số điện thoại phải có 10-11 chữ số"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">Số điện thoại phải có 10-11 chữ số</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền nợ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="1000"
            step="1000"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú <span className="text-red-500">*</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu nợ"}
        </button>
      </div>
    </form>
  )
}
