"use client"

import { useState, useEffect } from "react"
import type { Transaction, CreditCard, ReceivableAmount } from "@/lib/types"
import { getTransactions } from "@/lib/storage/transactions-service"
import { getCreditCards } from "@/lib/storage/credit-cards-service"
import { getReceivables } from "@/lib/storage/receivables-service"

export function useFinancialData() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [receivables, setReceivables] = useState<ReceivableAmount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = async () => {
    try {
      setIsLoading(true)
      const [transactionsData, creditCardsData, receivablesData] = await Promise.all([
        getTransactions(),
        getCreditCards(),
        getReceivables(),
      ])

      setTransactions(transactionsData)
      setCreditCards(creditCardsData)
      setReceivables(receivablesData)
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  return {
    transactions,
    creditCards,
    receivables,
    isLoading,
    refreshData,
  }
}

