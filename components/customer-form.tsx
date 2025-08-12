"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Customer } from "@/lib/types"

const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerFormSchema>

interface CustomerFormProps {
  customer?: Customer
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CustomerForm({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      notes: customer?.notes || "",
    },
  })

  const handleFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{customer ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
        <CardDescription>
          {customer ? "Atualize as informações do cliente" : "Preencha os dados do novo cliente"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} disabled={loading} />
            {errors.name && (
              <Alert variant="destructive">
                <AlertDescription>{errors.name.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} disabled={loading} placeholder="(11) 99999-9999" />
            {errors.phone && (
              <Alert variant="destructive">
                <AlertDescription>{errors.phone.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} disabled={loading} placeholder="cliente@email.com" />
            {errors.email && (
              <Alert variant="destructive">
                <AlertDescription>{errors.email.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={loading}
              placeholder="Informações adicionais sobre o cliente..."
              rows={3}
            />
            {errors.notes && (
              <Alert variant="destructive">
                <AlertDescription>{errors.notes.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer ? "Atualizar" : "Criar"} Cliente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
