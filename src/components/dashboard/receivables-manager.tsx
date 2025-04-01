"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { Calendar, Check, Clock, Trash2 } from "lucide-react"
import type { ReceivableAmount } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { deleteReceivable, updateReceivable } from "@/lib/storage/receivables-service"

interface ReceivablesManagerProps {
  receivables: ReceivableAmount[]
  onRefresh: () => void
}

export default function ReceivablesManager({ receivables, onRefresh }: ReceivablesManagerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [receivableToDelete, setReceivableToDelete] = useState<string | null>(null)

  const handleToggleReceived = async (receivable: ReceivableAmount) => {
    await updateReceivable({
      ...receivable,
      received: !receivable.received,
    })
    onRefresh()
  }

  const handleDeleteReceivable = (id: string) => {
    setReceivableToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (receivableToDelete) {
      await deleteReceivable(receivableToDelete)
      onRefresh()
      setDeleteDialogOpen(false)
      setReceivableToDelete(null)
    }
  }

  // Sort receivables: pending first, then by expected date
  const sortedReceivables = [...receivables].sort((a, b) => {
    // First sort by received status
    if (a.received && !b.received) return 1
    if (!a.received && b.received) return -1

    // Then sort by expected date
    return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  })

  if (receivables.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">Nenhum valor a receber</h3>
          <p className="text-slate-400 mb-6">
            Adicione valores que você espera receber para acompanhar seu fluxo de caixa futuro.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-700/50 pb-3">
        <CardTitle className="text-slate-100 flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-green-500" />
          Valores a Receber
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50 text-xs text-slate-400">
                <th className="px-4 py-3 text-left">Data Esperada</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {sortedReceivables.map((receivable) => (
                <tr key={receivable.id} className={`hover:bg-slate-800/30 ${receivable.received ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 text-sm text-slate-300">{formatDate(receivable.expectedDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{receivable.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600/50 text-xs">
                      {receivable.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-green-400">{formatCurrency(receivable.amount)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <Switch
                        checked={receivable.received}
                        onCheckedChange={() => handleToggleReceived(receivable)}
                        className="data-[state=checked]:bg-green-600"
                      />
                      <span className="ml-2 text-xs">
                        {receivable.received ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs flex items-center gap-1">
                            <Check className="h-3 w-3" /> Recebido
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pendente
                          </Badge>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                      onClick={() => handleDeleteReceivable(receivable.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este valor a receber? Esta ação não pode ser desfeita.
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

