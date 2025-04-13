import { createClient } from "@supabase/supabase-js"

// Singleton pattern để tránh nhiều instances
let supabaseClient: ReturnType<typeof createClient> | null = null

// Client-side Supabase client
export const getSupabaseClient = () => {
  if (!supabaseClient && typeof window !== "undefined") {
    supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return supabaseClient
}

// Server-side Supabase client
export const getServerSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
  )
}

// Cập nhật kiểu dữ liệu Debt để thêm trường email
export type Debt = {
  id: string
  name: string
  phone: string
  email?: string | null
  amount: number
  remaining_amount: number
  status: "active" | "paid"
  notes?: string
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  debt_id: string
  amount: number
  type: "create" | "payment" | "update" | "paid_full"
  notes?: string
  created_at: string
}
