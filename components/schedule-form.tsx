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
import type { ScheduleBlock, Order, User } from "@/lib/types"
import { orderOperations, userOperations } from "@/lib/firebase-operations"

const scheduleFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  start: z.string().min(1, "Data/hora de início é obrigatória"),
  end: z.string().min(1, "Data/hora de fim é obrigatória"),
  installerId: z.string().optional(),
  orderId: z.string().optional(),
  notes: z.string().optional(),
})

type ScheduleFormData = z.infer<typeof scheduleFormSchema>

interface ScheduleFormProps {
  schedule?: ScheduleBlock
  onSubmit: (data: ScheduleFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ScheduleForm({ schedule, onSubmit, onCancel, loading = false }: ScheduleFormProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [installers, setInstallers] = useState<User[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: schedule?.title || "",
      start: schedule?.start ? new Date(schedule.start.toDate()).toISOString().slice(0, 16) : "",
      end: schedule?.end ? new Date(schedule.end.toDate()).toISOString().slice(0, 16) : "",
      installerId: schedule?.installerId || "defaultInstallerId",
      orderId: schedule?.orderId || "defaultOrderId",
      notes: schedule?.notes || "",
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setDataLoading(true)
      const [ordersData, installersData] = await Promise.all([orderOperations.getAll(), userOperations.getInstallers()])
      setOrders(ordersData.filter((o) => o.status !== "concluida" && o.status !== "cancelada"))
      setInstallers(installersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleFormSubmit = async (data: ScheduleFormData) => {
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
        <CardTitle>{schedule ? "Editar Agendamento" : "Novo Agendamento"}</CardTitle>
        <CardDescription>
          {schedule ? "Atualize as informações do agendamento" : "Preencha os dados do novo agendamento"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register("title")}
              disabled={loading}
              placeholder="Ex: Instalação insufilm - João Silva"
            />
            {errors.title && (
              <Alert variant="destructive">
                <AlertDescription>{errors.title.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Data/Hora Início *</Label>
              <Input id="start" type="datetime-local" {...register("start")} disabled={loading} />
              {errors.start && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.start.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Data/Hora Fim *</Label>
              <Input id="end" type="datetime-local" {...register("end")} disabled={loading} />
              {errors.end && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.end.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installerId">Instalador</Label>
              <Select value={watch("installerId")} onValueChange={(value) => setValue("installerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um instalador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultInstallerId">Nenhum instalador</SelectItem>
                  {installers.map((installer) => (
                    <SelectItem key={installer.uid} value={installer.uid}>
                      {installer.name || installer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Ordem de Serviço</Label>
              <Select value={watch("orderId")} onValueChange={(value) => setValue("orderId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defaultOrderId">Nenhuma OS</SelectItem>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      #{order.id.slice(-6)} - {order.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              disabled={loading}
              placeholder="Informações adicionais sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {schedule ? "Atualizar" : "Criar"} Agendamento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
