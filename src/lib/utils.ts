import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function to merge class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

// Get month name
export function getMonthName(month: number): string {
  const date = new Date()
  date.setMonth(month)
  return date.toLocaleDateString("pt-BR", { month: "long" })
}

// Calculate months difference between two dates
export function monthsDiff(date1: Date, date2: Date): number {
  const months1 = date1.getFullYear() * 12 + date1.getMonth()
  const months2 = date2.getFullYear() * 12 + date2.getMonth()
  return months1 - months2
}

