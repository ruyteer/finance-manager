"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import type { CreditCard } from "@/lib/types"
import { addTransaction } from "@/lib/storage/transactions-service"

// Define form schema
const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  date: z.string().nonempty("A data é obrigatória"),
  description: z.string().nonempty("A descrição é obrigatória"),
  category: z.string().nonempty("A categoria é obrigatória"),
  paymentMethod: z.enum(["cash", "bank", "credit_card"]),
  creditCardId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creditCards: CreditCard[]
  onSuccess: () => void
}

export default function AddTransactionDialog({
  open,
  onOpenChange,
  creditCards,
  onSuccess,
}: AddTransactionDialogProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense")
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "credit_card">("bank")

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: undefined,
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "",
      paymentMethod: "bank",
      creditCardId: undefined,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await addTransaction({
        id: crypto.randomUUID(),
        type: values.type,
        amount: values.amount,
        date: values.date,
        description: values.description,
        category: values.category,
        paymentMethod: values.paymentMethod,
        creditCardId: values.paymentMethod === "credit_card" ? values.creditCardId : undefined,
        paid: values.paymentMethod !== "credit_card",
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
    }
  }

  // Handle transaction type change
  const handleTypeChange = (value: "income" | "expense") => {
    setTransactionType(value)
    form.setValue("type", value)

    // If changing to income, reset payment method to bank
    if (value === "income") {
      setPaymentMethod("bank")
      form.setValue("paymentMethod", "bank")
    }
  }

  // Handle payment method change
  const handlePaymentMethodChange = (value: "cash" | "bank" | "credit_card") => {
    setPaymentMethod(value)
    form.setValue("paymentMethod", value)

    // If not credit card, clear credit card id
    if (value !== "credit_card") {
      form.setValue("creditCardId", undefined)
    } else if (creditCards.length > 0) {
      // Set default credit card if available
      form.setValue("creditCardId", creditCards[0].id)
    }
  }

  // Define income categories
  const incomeCategories = ["Salário", "Freelance", "Investimentos", "Vendas", "Presentes", "Reembolsos", "Outros"]

  // Define expense categories
  const expenseCategories = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Vestuário",
    "Serviços",
    "Assinaturas",
    "Impostos",
    "Outros",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">
            {transactionType === "income" ? "Adicionar Receita" : "Adicionar Despesa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Transaction Type */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                className={`flex items-center justify-center gap-2 h-16 ${
                  transactionType === "income" ? "bg-green-600 hover:bg-green-700" : "bg-slate-700 hover:bg-slate-600"
                }`}
                onClick={() => handleTypeChange("income")}
              >
                <ArrowUpCircle className="h-5 w-5" />
                <span>Receita</span>
              </Button>

              <Button
                type="button"
                className={`flex items-center justify-center gap-2 h-16 ${
                  transactionType === "expense" ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-600"
                }`}
                onClick={() => handleTypeChange("expense")}
              >
                <ArrowDownCircle className="h-5 w-5" />
                <span>Despesa</span>
              </Button>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        type="number"
                        step="0.01"
                        className="bg-slate-700 border-slate-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-slate-700 border-slate-600" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva a transação" className="bg-slate-700 border-slate-600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {(transactionType === "income" ? incomeCategories : expenseCategories).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Method - Only for expenses */}
            {transactionType === "expense" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select
                        onValueChange={(value: "cash" | "bank" | "credit_card") => handlePaymentMethodChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Selecione o método de pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="bank">Banco/Débito</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Credit Card Selection - Only if payment method is credit card */}
                {paymentMethod === "credit_card" && (
                  <FormField
                    control={form.control}
                    name="creditCardId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cartão de Crédito</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600">
                              <SelectValue placeholder="Selecione o cartão" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            {creditCards.length === 0 ? (
                              <SelectItem value="none" disabled>
                                Nenhum cartão cadastrado
                              </SelectItem>
                            ) : (
                              creditCards.map((card) => (
                                <SelectItem key={card.id} value={card.id}>
                                  {card.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={
                  transactionType === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

