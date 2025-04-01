"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle, Calendar, PieChart } from "lucide-react"

import FinancialOverview from "@/components/dashboard/financial-overview"
import TransactionsList from "@/components/dashboard/transactions-list"
import CreditCardManager from "@/components/dashboard/credit-card-manager"
import ReceivablesManager from "@/components/dashboard/receivables-manager"
import AddTransactionDialog from "@/components/forms/add-transaction-dialog"
import AddCreditCardDialog from "@/components/forms/add-credit-card-dialog"
import AddReceivableDialog from "@/components/forms/add-receivable-dialog"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { useFinancialData } from "@/lib/hooks/use-financial-data"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isAddCreditCardOpen, setIsAddCreditCardOpen] = useState(false)
  const [isAddReceivableOpen, setIsAddReceivableOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { transactions, creditCards, receivables, refreshData } = useFinancialData()

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleAddTransaction = () => {
    setIsAddTransactionOpen(true)
  }

  const handleAddCreditCard = () => {
    setIsAddCreditCardOpen(true)
  }

  const handleAddReceivable = () => {
    setIsAddReceivableOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">CARREGANDO DADOS</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        <DashboardHeader />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 bg-cyan-500/20 p-3 rounded-full">
                  <ArrowUpCircle className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Adicionar</p>
                  <p className="text-slate-100 font-semibold">Receita</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  handleAddTransaction()
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 bg-red-500/20 p-3 rounded-full">
                  <ArrowDownCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Adicionar</p>
                  <p className="text-slate-100 font-semibold">Despesa</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  handleAddTransaction()
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 bg-purple-500/20 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Gerenciar</p>
                  <p className="text-slate-100 font-semibold">Cartões</p>
                </div>
              </div>
              <Button onClick={handleAddCreditCard} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 p-1 border border-slate-700/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Transações
            </TabsTrigger>
            <TabsTrigger
              value="credit-cards"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Cartões
            </TabsTrigger>
            <TabsTrigger
              value="receivables"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
            >
              <Calendar className="h-4 w-4 mr-2" />A Receber
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <FinancialOverview transactions={transactions} creditCards={creditCards} receivables={receivables} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddTransaction} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" /> Nova Transação
              </Button>
            </div>
            <TransactionsList transactions={transactions} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="credit-cards" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddCreditCard} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" /> Novo Cartão
              </Button>
            </div>
            <CreditCardManager creditCards={creditCards} transactions={transactions} onRefresh={refreshData} />
          </TabsContent>

          <TabsContent value="receivables" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddReceivable} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" /> Novo Valor a Receber
              </Button>
            </div>
            <ReceivablesManager receivables={receivables} onRefresh={refreshData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddTransactionDialog
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        creditCards={creditCards}
        onSuccess={refreshData}
      />

      <AddCreditCardDialog open={isAddCreditCardOpen} onOpenChange={setIsAddCreditCardOpen} onSuccess={refreshData} />

      <AddReceivableDialog open={isAddReceivableOpen} onOpenChange={setIsAddReceivableOpen} onSuccess={refreshData} />
    </div>
  )
}

