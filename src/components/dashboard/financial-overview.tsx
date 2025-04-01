"use client"

import type React from "react"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ArrowDownCircle, ArrowUpCircle, CreditCard, Wallet } from "lucide-react"
import type { Transaction, CreditCard as CreditCardType, ReceivableAmount } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import CategoryDistributionChart from "@/components/charts/category-distribution-chart"
import MonthlyBalanceChart from "@/components/charts/monthly-balance-chart"

interface FinancialOverviewProps {
  transactions: Transaction[]
  creditCards: CreditCardType[]
  receivables: ReceivableAmount[]
}

export default function FinancialOverview({ transactions, creditCards, receivables }: FinancialOverviewProps) {
  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    // Calculate income and expenses
    const income = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const expenses = currentMonthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    // Calculate total balance
    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === "income" ? sum + t.amount : sum - t.amount
    }, 0)

    // Calculate pending credit card payments
    const pendingCreditCardPayments = transactions
      .filter((t) => t.type === "expense" && t.paymentMethod === "credit_card" && !t.paid)
      .reduce((sum, t) => sum + t.amount, 0)

    // Calculate pending receivables
    const pendingReceivables = receivables.filter((r) => !r.received).reduce((sum, r) => sum + r.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      totalBalance,
      pendingCreditCardPayments,
      pendingReceivables,
    }
  }, [transactions, receivables])

  return (
    <div className="space-y-6">
      {/* Financial summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Saldo Total"
          value={financialMetrics.totalBalance}
          icon={Wallet}
          color={financialMetrics.totalBalance >= 0 ? "cyan" : "red"}
        />

        <MetricCard title="Receitas (Mês Atual)" value={financialMetrics.income} icon={ArrowUpCircle} color="green" />

        <MetricCard title="Despesas (Mês Atual)" value={financialMetrics.expenses} icon={ArrowDownCircle} color="red" />

        <MetricCard
          title="Balanço (Mês Atual)"
          value={financialMetrics.balance}
          icon={Activity}
          color={financialMetrics.balance >= 0 ? "cyan" : "red"}
        />
      </div>

      {/* Charts and additional info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="border-b border-slate-700/50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                Receitas vs Despesas
              </CardTitle>
              <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
                Últimos 6 meses
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <MonthlyBalanceChart transactions={transactions} />
            </div>
          </CardContent>
        </Card>

        {/* Pending amounts */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50 pb-3">
            <CardTitle className="text-slate-100 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-purple-500" />
              Valores Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-400 mb-1">Faturas de Cartão Pendentes</div>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(financialMetrics.pendingCreditCardPayments)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-1">Valores a Receber</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(financialMetrics.pendingReceivables)}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Balanço Projetado</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatCurrency(
                    financialMetrics.totalBalance -
                      financialMetrics.pendingCreditCardPayments +
                      financialMetrics.pendingReceivables,
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50 pb-3">
            <CardTitle className="text-slate-100 flex items-center">
              <ArrowUpCircle className="mr-2 h-5 w-5 text-green-500" />
              Distribuição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <CategoryDistributionChart transactions={transactions.filter((t) => t.type === "income")} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700/50 pb-3">
            <CardTitle className="text-slate-100 flex items-center">
              <ArrowDownCircle className="mr-2 h-5 w-5 text-red-500" />
              Distribuição de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <CategoryDistributionChart transactions={transactions.filter((t) => t.type === "expense")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Metric card component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: "cyan" | "green" | "red" | "purple" | "blue"
}) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "red":
        return "from-red-500 to-rose-500 border-red-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className={`h-5 w-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {formatCurrency(value)}
      </div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  )
}

