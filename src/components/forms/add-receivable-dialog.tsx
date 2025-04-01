"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addReceivable } from "@/lib/storage/receivables-service"

// Define form schema
const formSchema = z.object({
  description: z.string().nonempty("A descrição é obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  expectedDate: z.string().nonempty("A data esperada é obrigatória"),
  category: z.string().nonempty("A categoria é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

interface AddReceivableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AddReceivableDialog({ open, onOpenChange, onSuccess }: AddReceivableDialogProps) {
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      expectedDate: new Date().toISOString().split("T")[0],
      category: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await addReceivable({
        id: crypto.randomUUID(),
        description: values.description,
        amount: values.amount,
        expectedDate: values.expectedDate,
        category: values.category,
        received: false,
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Erro ao adicionar valor a receber:", error)
    }
  }

  // Define receivable categories
  const receivableCategories = [
    "Salário",
    "Freelance",
    "Investimentos",
    "Vendas",
    "Reembolsos",
    "Empréstimos",
    "Outros",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">Adicionar Valor a Receber</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Pagamento de cliente"
                      className="bg-slate-700 border-slate-600"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount and Expected Date */}
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
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Esperada</FormLabel>
                    <FormControl>
                      <Input type="date" className="bg-slate-700 border-slate-600" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      {receivableCategories.map((category) => (
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

