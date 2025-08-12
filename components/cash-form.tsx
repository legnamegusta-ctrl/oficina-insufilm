"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { CashEntry, Order } from "@/lib/types"
import { orderOperations } from "@/lib/firebase-operations"

const cashFormSchema = z.object({
  type: z.enum(["receita", "despesa"]),
  amount: z.number().min(0, "Valor deve ser maior que zero"),
  method: z.enum(["dinheiro", "pix", "credito", "debito", "outro"]).optional(),
  refOrderId: z.string().optional(),
  notes: z.string().optional(),
  at: z.string().min(1, "Data/hora é obrigatória"),
})

type CashFormData = z.infer<typeof cashFormSchema>

interface CashFormProps {
  cashEntry?: CashEntry
  onSubmit: (data: CashFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CashForm({ cashEntry, onSubmit, onCancel, loading = false }: CashFormProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CashFormData>({
    resolver: zodResolver(cashFormSchema),
    defaultValues: {
      type: cashEntry?.type || "receita",
      amount: cashEntry?.amount || 0,
      method: cashEntry?.method || "dinheiro",
      refOrderId: cashEntry?.refOrderId || "",
      notes: cashEntry?.notes || "",
      at: cashEntry?.at
        ? new Date(cashEntry.at.toDate()).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    },
  })

  const watchedType = watch("type")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setDataLoading(true)
      const ordersData = await orderOperations.getAll()
      setOrders(ordersData.filter((o) => o.status === "concluida" && !o.payment.received))
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleFormSubmit = async (data: CashFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  if (dataLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{cashEntry ? "Editar Lançamento" : "Novo Lançamento"}</CardTitle>
        <CardDescription>
          {cashEntry ? "Atualize as informações do lançamento" : "Registre uma nova entrada ou saída de caixa"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={watch("type")} onValueChange={(value) => setValue("type", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.type.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                disabled={loading}
                placeholder="0.00"
              />
              {errors.amount && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.amount.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Forma de Pagamento</Label>
              <Select value={watch("method")} onValueChange={(value) => setValue("method", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="debito">Cartão de Débito</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="at">Data/Hora *</Label>
              <Input id="at" type="datetime-local" {...register("at")} disabled={loading} />
              {errors.at && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.at.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {watchedType === "receita" && orders.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="refOrderId">Ordem de Serviço (Opcional)</Label>
              <Select value={watch("refOrderId")} onValueChange={(value) => setValue("refOrderId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma OS</SelectItem>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id.slice(-6)} - R$ {order.total.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={loading}
              placeholder="Descrição do lançamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cashEntry ? "Atualizar" : "Registrar"} Lançamento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
