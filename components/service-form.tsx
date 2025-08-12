"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { ServiceItem } from "@/lib/types"

const serviceFormSchema = z.object({
  name: z.string().min(1, "Nome do serviço é obrigatório"),
  basePrice: z.number().min(0, "Preço deve ser maior ou igual a zero"),
  description: z.string().optional(),
  // `active` is required in the schema to avoid optional/required type mismatches
  // The default value is handled via `useForm`'s `defaultValues`
  active: z.boolean(),
})

type ServiceFormData = z.infer<typeof serviceFormSchema>

interface ServiceFormProps {
  service?: ServiceItem
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ServiceForm({ service, onSubmit, onCancel, loading = false }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || "",
      basePrice: service?.basePrice || 0,
      description: service?.description || "",
      active: service?.active !== undefined ? service.active : true,
    },
  })

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{service ? "Editar Serviço" : "Novo Serviço"}</CardTitle>
        <CardDescription>
          {service ? "Atualize as informações do serviço" : "Preencha os dados do novo serviço"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço *</Label>
            <Input
              id="name"
              {...register("name")}
              disabled={loading}
              placeholder="Ex: Insufilm Para-brisa, Laterais, Traseiro"
            />
            {errors.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="basePrice">Preço Base (R$) *</Label>
            <Input
              id="basePrice"
              type="number"
              step="0.01"
              {...register("basePrice", { valueAsNumber: true })}
              disabled={loading}
              placeholder="150.00"
            />
            {errors.basePrice && (
              <Alert variant="destructive">
                <AlertDescription>{errors.basePrice.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              disabled={loading}
              placeholder="Descrição detalhada do serviço..."
              rows={3}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertDescription>{errors.description.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={watch("active")}
              onCheckedChange={(checked) => setValue("active", checked)}
              disabled={loading}
            />
            <Label htmlFor="active">Serviço ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {service ? "Atualizar" : "Criar"} Serviço
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
