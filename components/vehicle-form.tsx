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
import type { Vehicle } from "@/lib/types"

const vehicleFormSchema = z.object({
  plate: z.string().min(1, "Placa é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z
    .number()
    .min(1900, "Ano inválido")
    .max(new Date().getFullYear() + 1, "Ano inválido")
    .optional(),
  color: z.string().optional(),
})

type VehicleFormData = z.infer<typeof vehicleFormSchema>

interface VehicleFormProps {
  vehicle?: Vehicle
  customerId: string
  customerName: string
  onSubmit: (data: VehicleFormData & { customerId: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function VehicleForm({
  vehicle,
  customerId,
  customerName,
  onSubmit,
  onCancel,
  loading = false,
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plate: vehicle?.plate || "",
      model: vehicle?.model || "",
      year: vehicle?.year || undefined,
      color: vehicle?.color || "",
    },
  })

  const handleFormSubmit = async (data: VehicleFormData) => {
    try {
      await onSubmit({ ...data, customerId })
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{vehicle ? "Editar Veículo" : "Novo Veículo"}</CardTitle>
        <CardDescription>
          {vehicle ? "Atualize as informações do veículo" : `Adicionar veículo para ${customerName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plate">Placa *</Label>
            <Input
              id="plate"
              {...register("plate")}
              disabled={loading}
              placeholder="ABC-1234"
              style={{ textTransform: "uppercase" }}
            />
            {errors.plate && (
              <Alert variant="destructive">
                <AlertDescription>{errors.plate.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo *</Label>
            <Input id="model" {...register("model")} disabled={loading} placeholder="Honda Civic, Toyota Corolla..." />
            {errors.model && (
              <Alert variant="destructive">
                <AlertDescription>{errors.model.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { valueAsNumber: true })}
                disabled={loading}
                placeholder="2020"
              />
              {errors.year && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.year.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Input id="color" {...register("color")} disabled={loading} placeholder="Branco, Preto, Prata..." />
              {errors.color && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.color.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vehicle ? "Atualizar" : "Adicionar"} Veículo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
