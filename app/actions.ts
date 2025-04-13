"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase"

// Thay đổi hàm addDebt để thêm trường email
export async function addDebt(formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = (formData.get("email") as string) || null
  const amount = Number.parseFloat(formData.get("amount") as string)
  const notes = (formData.get("notes") as string) || ""

  if (!name || !phone || isNaN(amount) || amount <= 0) {
    return { success: false, message: "Vui lòng điền đầy đủ thông tin hợp lệ" }
  }

  const supabase = getServerSupabaseClient()

  // Thêm vào bảng debts
  const { data: debt, error: debtError } = await supabase
    .from("debts")
    .insert({
      name,
      phone,
      email,
      amount,
      remaining_amount: amount,
      notes,
      status: "active",
    })
    .select()
    .single()

  if (debtError) {
    console.error("Lỗi khi thêm nợ:", debtError)
    return { success: false, message: "Lỗi khi lưu nợ" }
  }

  // Thêm vào bảng transactions
  const { error: transactionError } = await supabase.from("transactions").insert({
    debt_id: debt.id,
    amount,
    type: "create",
    notes: `Tạo khoản nợ mới: ${amount.toLocaleString("vi-VN")} VND`,
  })

  if (transactionError) {
    console.error("Lỗi khi thêm giao dịch:", transactionError)
  }

  revalidatePath("/")
  revalidatePath("/current-debts")

  return { success: true, message: "Đã lưu nợ!" }
}

// Lấy danh sách nợ hiện tại
export async function getCurrentDebts() {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase.from("debts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Lỗi khi lấy danh sách nợ:", error)
    return []
  }

  return data || []
}

// Cập nhật khoản nợ (trả một phần)
export async function updateDebtPayment(formData: FormData) {
  const debtId = formData.get("debtId") as string
  const paymentAmount = Number.parseFloat(formData.get("paymentAmount") as string)
  const notes = (formData.get("notes") as string) || ""

  if (!debtId || isNaN(paymentAmount) || paymentAmount <= 0) {
    return { success: false, message: "Thông tin không hợp lệ" }
  }

  const supabase = getServerSupabaseClient()

  // Lấy thông tin nợ hiện tại
  const { data: debt, error: fetchError } = await supabase.from("debts").select("*").eq("id", debtId).single()

  if (fetchError || !debt) {
    return { success: false, message: "Không tìm thấy khoản nợ" }
  }

  if (debt.status === "paid") {
    return { success: false, message: "Khoản nợ này đã được thanh toán" }
  }

  if (paymentAmount > debt.remaining_amount) {
    return { success: false, message: "Số tiền thanh toán lớn hơn số nợ còn lại" }
  }

  // Cập nhật số tiền còn lại
  const newRemainingAmount = debt.remaining_amount - paymentAmount
  const newStatus = newRemainingAmount <= 0 ? "paid" : "active"

  // Cập nhật bảng debts
  const { error: updateError } = await supabase
    .from("debts")
    .update({
      remaining_amount: newRemainingAmount,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", debtId)

  if (updateError) {
    console.error("Lỗi khi cập nhật nợ:", updateError)
    return { success: false, message: "Lỗi khi cập nhật nợ" }
  }

  // Thêm vào bảng transactions
  const { error: transactionError } = await supabase.from("transactions").insert({
    debt_id: debtId,
    amount: paymentAmount,
    type: newStatus === "paid" ? "paid_full" : "payment",
    notes: notes || `Thanh toán: ${paymentAmount.toLocaleString("vi-VN")} VND`,
  })

  if (transactionError) {
    console.error("Lỗi khi thêm giao dịch:", transactionError)
  }

  revalidatePath("/current-debts")

  return {
    success: true,
    message: newStatus === "paid" ? "Đã thanh toán đủ khoản nợ!" : "Đã cập nhật thanh toán!",
  }
}

// Đánh dấu đã trả đủ
export async function markAsPaid(formData: FormData) {
  const debtId = formData.get("debtId") as string

  if (!debtId) {
    return { success: false, message: "Thông tin không hợp lệ" }
  }

  const supabase = getServerSupabaseClient()

  // Lấy thông tin nợ hiện tại
  const { data: debt, error: fetchError } = await supabase.from("debts").select("*").eq("id", debtId).single()

  if (fetchError || !debt) {
    return { success: false, message: "Không tìm thấy khoản nợ" }
  }

  if (debt.status === "paid") {
    return { success: false, message: "Khoản nợ này đã được thanh toán" }
  }

  // Cập nhật bảng debts
  const { error: updateError } = await supabase
    .from("debts")
    .update({
      status: "paid",
      remaining_amount: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", debtId)

  if (updateError) {
    console.error("Lỗi khi cập nhật nợ:", updateError)
    return { success: false, message: "Lỗi khi cập nhật nợ" }
  }

  // Thêm vào bảng transactions
  const { error: transactionError } = await supabase.from("transactions").insert({
    debt_id: debtId,
    amount: debt.remaining_amount,
    type: "paid_full",
    notes: `Đã trả đủ: ${debt.remaining_amount.toLocaleString("vi-VN")} VND`,
  })

  if (transactionError) {
    console.error("Lỗi khi thêm giao dịch:", transactionError)
  }

  revalidatePath("/current-debts")

  return { success: true, message: "Đã đánh dấu trả đủ!" }
}

// Lấy lịch sử giao dịch của một khoản nợ
export async function getDebtTransactions(debtId: string) {
  const supabase = getServerSupabaseClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("debt_id", debtId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Lỗi khi lấy lịch sử giao dịch:", error)
    return []
  }

  return data || []
}
