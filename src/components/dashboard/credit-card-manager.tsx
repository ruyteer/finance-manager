"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
import {
  CreditCard as CreditCardIcon,
  Trash2,
  Calendar,
  DollarSign,
  type CreditCard as CreditCardType,
  type Transaction,
} from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteCreditCard } from "@/lib/storage/credit-cards-service"

interface CreditCardManagerProps {
  creditCards: CreditCardType[]
  transactions: Transaction[]
  onRefresh: () => void
}

export default function CreditCardManager({ creditCards, transactions, onRefresh }: CreditCardManagerProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(creditCards.length > 0 ? creditCards[0].id : null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)

  // Calculate credit card metrics
  const cardMetrics = useMemo(() => {
    if (!selectedCard) return null

    const card = creditCards.find((c) => c.id === selectedCard)
    if (!card) return null

    // Get transactions for this card
    const cardTransactions = transactions.filter((t) => t.creditCardId === card.id && t.type === "expense")

    // Calculate current statement transactions
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Calculate the statement closing date for current month
    const closingDate = new Date(currentYear, currentMonth, card.closingDay)
    // If today is past the closing date, we're looking at next month's statement
    if (today > closingDate) {
      closingDate.setMonth(closingDate.getMonth() + 1)
    }

    // Calculate the previous closing date
    const previousClosingDate = new Date(closingDate)
    previousClosingDate.setMonth(previousClosingDate.getMonth() - 1)

    // Get transactions for current statement
    const currentStatementTransactions = cardTransactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate > previousClosingDate && transactionDate <= closingDate
    })

    // Calculate current statement amount
    const currentStatementAmount = currentStatementTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate due date for current statement
    const dueDate = new Date(closingDate)
    dueDate.setDate(card.dueDay)
    if (dueDate < closingDate) {
      dueDate.setMonth(dueDate.getMonth() + 1)
    }

    // Calculate usage percentage
    const usagePercentage = card.limit > 0 ? (currentStatementAmount / card.limit) * 100 : 0

    return {
      card,
      currentStatementAmount,
      dueDate,
      usagePercentage,
      transactions: currentStatementTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }
  }, [selectedCard, creditCards, transactions])

  const handleDeleteCard = (id: string) => {
    setCardToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (cardToDelete) {
      await deleteCreditCard(cardToDelete)
      onRefresh()
      setDeleteDialogOpen(false)
      setCardToDelete(null)

      // If we deleted the selected card, select another one
      if (cardToDelete === selectedCard) {
        const remainingCards = creditCards.filter((c) => c.id !== cardToDelete)
        setSelectedCard(remainingCards.length > 0 ? remainingCards[0].id : null)
      }
    }
  }

  if (creditCards.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <CreditCardIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-slate-400 mb-6">
            Adicione seu primeiro cartão de crédito para começar a gerenciar suas faturas.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedCard || ""} onValueChange={setSelectedCard}>
        <TabsList className="bg-slate-800/50 p-1 border border-slate-700/50 mb-4">
          {creditCards.map((card) => (
            <TabsTrigger
              key={card.id}
              value={card.id}
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
            >
              {card.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {creditCards.map((card) => (
          <TabsContent key={card.id} value={card.id} className="space-y-6">
            {cardMetrics && cardMetrics.card.id === card.id && (
              <>
                {/* Card summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-slate-400">Cartão</p>
                          <h3 className="text-xl font-bold text-slate-100">{card.name}</h3>
                          <p className="text-sm text-slate-400">**** **** **** {card.lastDigits}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-400"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm text-slate-400">Limite Utilizado</div>
                            <div className="text-sm text-purple-400">{cardMetrics.usagePercentage.toFixed(0)}%</div>
                          </div>
                          <Progress value={cardMetrics.usagePercentage} className="h-2 bg-slate-700">
                            <div
                              className={`h-full rounded-full ${
                                cardMetrics.usagePercentage > 90
                                  ? "bg-red-500"
                                  : cardMetrics.usagePercentage > 70
                                    ? "bg-amber-500"
                                    : "bg-purple-500"
                              }`}
                              style={{ width: `${cardMetrics.usagePercentage}%` }}
                            />
                          </Progress>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-slate-400">Limite Total</p>
                            <p className="text-lg font-medium text-slate-200">{formatCurrency(card.limit)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Disponível</p>
                            <p className="text-lg font-medium text-green-400">
                              {formatCurrency(card.limit - cardMetrics.currentStatementAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 text-cyan-500 mr-2" />
                        <h3 className="text-lg font-medium text-slate-100">Datas Importantes</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400">Fechamento</p>
                          <p className="text-lg font-medium text-slate-200">Dia {card.closingDay} de cada mês</p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">Vencimento</p>
                          <p className="text-lg font-medium text-slate-200">Dia {card.dueDay} de cada mês</p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">Próximo Vencimento</p>
                          <p className="text-lg font-medium text-amber-400">{formatDate(cardMetrics.dueDate)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <DollarSign className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="text-lg font-medium text-slate-100">Fatura Atual</h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400">Valor Total</p>
                          <p className="text-2xl font-bold text-red-400">
                            {formatCurrency(cardMetrics.currentStatementAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">Transações</p>
                          <p className="text-lg font-medium text-slate-200">{cardMetrics.transactions.length} itens</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transactions list */}
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-700/50 pb-3">
                    <CardTitle className="text-slate-100 flex items-center">
                      <CreditCardIcon className="mr-2 h-5 w-5 text-purple-500" />
                      Transações da Fatura Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/50 bg-slate-800/50 text-xs text-slate-400">
                            <th className="px-4 py-3 text-left">Data</th>
                            <th className="px-4 py-3 text-left">Descrição</th>
                            <th className="px-4 py-3 text-left">Categoria</th>
                            <th className="px-4 py-3 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                          {cardMetrics.transactions.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                                Nenhuma transação na fatura atual
                              </td>
                            </tr>
                          ) : (
                            cardMetrics.transactions.map((transaction) => (
                              <tr key={transaction.id} className="hover:bg-slate-800/30">
                                <td className="px-4 py-3 text-sm text-slate-300">{formatDate(transaction.date)}</td>
                                <td className="px-4 py-3 text-sm text-slate-300">{transaction.description}</td>
                                <td className="px-4 py-3">
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-800/50 text-slate-300 border-slate-600/50 text-xs"
                                  >
                                    {transaction.category}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-medium text-red-400">
                                    - {formatCurrency(transaction.amount)}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cartão? Todas as transações associadas a ele permanecerão, mas não
              estarão mais vinculadas a um cartão.
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
    </div>
  )
}

