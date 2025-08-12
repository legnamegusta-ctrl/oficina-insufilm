"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { InventoryRoll } from "@/lib/types"

const inventoryFormSchema = z.object({
  tone: z.string().min(1, "Tonalidade é obrigatória"),
  width_mm: z.number().min(1, "Largura deve ser maior que zero"),
  length_m_total: z.number().min(0, "Comprimento deve ser maior ou igual a zero"),
  cost: z.number().min(0, "Custo deve ser maior ou igual a zero").optional(),
  supplier: z.string().optional(),
  lot: z.string().optional(),
  lowStockAlertAt_m: z.number().min(0, "Alerta de estoque deve ser maior ou igual a zero").optional(),
})

type InventoryFormData = z.infer<typeof inventoryFormSchema>

interface InventoryFormProps {
  roll?: InventoryRoll
  onSubmit: (data: InventoryFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  isRestock?: boolean
}

export function InventoryForm({ roll, onSubmit, onCancel, loading = false, isRestock = false }: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      tone: roll?.tone || "",
      width_mm: roll?.width_mm || 1520, // Default width for car films
      length_m_total: isRestock ? 0 : roll?.length_m_total || 0,
      cost: roll?.cost || 0,
      supplier: roll?.supplier || "",
      lot: roll?.lot || "",
      lowStockAlertAt_m: roll?.lowStockAlertAt_m || 10,
    },
  })

  const handleFormSubmit = async (data: InventoryFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isRestock ? "Reabastecer Estoque" : roll ? "Editar Rolo" : "Novo Rolo"}</CardTitle>
        <CardDescription>
          {isRestock
            ? "Adicionar metros ao rolo existente"
            : roll
              ? "Atualize as informações do rolo"
              : "Preencha os dados do novo rolo de insufilm"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tonalidade *</Label>
              <Input
                id="tone"
                {...register("tone")}
                disabled={loading || (isRestock && !!roll)}
                placeholder="20%, 35%, 50%, 70%"
              />
              {errors.tone && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.tone.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="width_mm">Largura (mm) *</Label>
              <Input
                id="width_mm"
                type="number"
                {...register("width_mm", { valueAsNumber: true })}
                disabled={loading || (isRestock && !!roll)}
                placeholder="1520"
              />
              {errors.width_mm && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.width_mm.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length_m_total">{isRestock ? "Metros a Adicionar *" : "Comprimento Total (m) *"}</Label>
              <Input
                id="length_m_total"
                type="number"
                step="0.1"
                {...register("length_m_total", { valueAsNumber: true })}
                disabled={loading}
                placeholder={isRestock ? "30.5" : "100.0"}
              />
              {errors.length_m_total && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.length_m_total.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Custo (R$)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...register("cost", { valueAsNumber: true })}
                disabled={loading}
                placeholder="250.00"
              />
              {errors.cost && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.cost.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input id="supplier" {...register("supplier")} disabled={loading} placeholder="Nome do fornecedor" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lot">Lote</Label>
              <Input id="lot" {...register("lot")} disabled={loading} placeholder="Número do lote" />
            </div>
          </div>

          {!isRestock && (
            <div className="space-y-2">
              <Label htmlFor="lowStockAlertAt_m">Alerta de Estoque Baixo (m)</Label>
              <Input
                id="lowStockAlertAt_m"
                type="number"
                step="0.1"
                {...register("lowStockAlertAt_m", { valueAsNumber: true })}
                disabled={loading}
                placeholder="10.0"
              />
              {errors.lowStockAlertAt_m && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.lowStockAlertAt_m.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRestock ? "Reabastecer" : roll ? "Atualizar" : "Criar"} Rolo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
