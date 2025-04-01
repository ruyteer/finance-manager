"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addCreditCard } from "@/lib/storage/credit-cards-service"

// Define form schema
const formSchema = z.object({
  name: z.string().nonempty("O nome é obrigatório"),
  lastDigits: z.string().length(4, "Deve ter 4 dígitos").regex(/^\d+$/, "Deve conter apenas números"),
  limit: z.coerce.number().positive("O limite deve ser positivo"),
  closingDay: z.coerce.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
  dueDay: z.coerce.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31"),
})

type FormValues = z.infer<typeof formSchema>

interface AddCreditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AddCreditCardDialog({ open, onOpenChange, onSuccess }: AddCreditCardDialogProps) {
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastDigits: "",
      limit: undefined,
      closingDay: undefined,
      dueDay: undefined,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await addCreditCard({
        id: crypto.randomUUID(),
        name: values.name,
        lastDigits: values.lastDigits,
        limit: values.limit,
        closingDay: values.closingDay,
        dueDay: values.dueDay,
      })

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Erro ao adicionar cartão:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-100">Adicionar Cartão de Crédito</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Card Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Nubank, Itaú Platinum"
                      className="bg-slate-700 border-slate-600"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last 4 Digits */}
            <FormField
              control={form.control}
              name="lastDigits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Últimos 4 dígitos</FormLabel>
                  <FormControl>
                    <Input placeholder="1234" maxLength={4} className="bg-slate-700 border-slate-600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credit Limit */}
            <FormField
              control={form.control}
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite de Crédito</FormLabel>
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

            {/* Closing Day and Due Day */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closingDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 15"
                        type="number"
                        min={1}
                        max={31}
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
                name="dueDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 22"
                        type="number"
                        min={1}
                        max={31}
                        className="bg-slate-700 border-slate-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-slate-700 hover:bg-slate-600 border-slate-600"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

