"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search, Trash2, Wallet } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteTransaction } from "@/lib/storage/transactions-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TransactionsListProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function TransactionsList({ transactions, onRefresh }: TransactionsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    transactions.forEach((t) => {
      if (t.category) categorySet.add(t.category)
    })
    return Array.from(categorySet)
  }, [transactions])

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        // Search term filter
        const matchesSearch =
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

        // Category filter
        const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter

        // Type filter
        const matchesType = typeFilter === "all" || transaction.type === typeFilter

        // Date filter
        let matchesDate = true
        if (dateFilter !== "all") {
          const transactionDate = new Date(transaction.date)
          const today = new Date()
          const thisMonth = today.getMonth()
          const thisYear = today.getFullYear()

          if (dateFilter === "this-month") {
            matchesDate = transactionDate.getMonth() === thisMonth && transactionDate.getFullYear() === thisYear
          } else if (dateFilter === "last-month") {
            const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
            const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
            matchesDate = transactionDate.getMonth() === lastMonth && transactionDate.getFullYear() === lastMonthYear
          } else if (dateFilter === "this-year") {
            matchesDate = transactionDate.getFullYear() === thisYear
          }
        }

        return matchesSearch && matchesCategory && matchesType && matchesDate
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, searchTerm, categoryFilter, typeFilter, dateFilter])

  const handleDeleteTransaction = async (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete)
      onRefresh()
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-slate-100 flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-cyan-500" />
            Transações
          </CardTitle>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center space-x-1 bg-slate-800/50 rounded-md px-3 py-1.5 border border-slate-700/50">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-slate-500 h-7"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 h-9 w-[130px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 h-9 w-[130px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/50 h-9 w-[130px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="this-month">Este mês</SelectItem>
                  <SelectItem value="last-month">Mês passado</SelectItem>
                  <SelectItem value="this-year">Este ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50 text-xs text-slate-400">
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sm text-slate-300">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{transaction.description}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600/50 text-xs">
                        {transaction.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.paymentMethod === "credit_card" ? (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-xs flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> Cartão
                        </Badge>
                      ) : transaction.paymentMethod === "cash" ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> Dinheiro
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs flex items-center gap-1">
                          <Wallet className="h-3 w-3" /> Banco
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-400"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

