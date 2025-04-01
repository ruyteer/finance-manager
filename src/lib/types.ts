export {
  CreditCard,
  Trash2,
  Calendar,
  DollarSign,
} from "lucide-react"

// Transaction type
export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  date: string // ISO date
  description: string
  category: string
  paymentMethod: "cash" | "bank" | "credit_card"
  creditCardId?: string // reference to credit card if paid with card
  paid: boolean
}

// Credit Card type
export interface CreditCard {
  id: string
  name: string
  lastDigits: string
  limit: number
  closingDay: number // day of month when statement closes
  dueDay: number // day of month when payment is due
}

// Receivable Amount type
export interface ReceivableAmount {
  id: string
  description: string
  amount: number
  expectedDate: string // ISO date
  category: string
  received: boolean
}

