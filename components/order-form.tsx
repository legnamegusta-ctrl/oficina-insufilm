"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Trash2, Calculator } from "lucide-react"
import type { Order, Customer, Vehicle, ServiceItem, User } from "@/lib/types"
import { customerOperations, vehicleOperations, serviceOperations, userOperations } from "@/lib/firebase-operations"

const orderFormSchema = z.object({
  customerId: z.string().min(1, "Cliente é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  items: z
    .array(
      z.object({
        serviceId: z.string().min(1, "Serviço é obrigatório"),
        qty: z.number().min(1, "Quantidade deve ser maior que zero"),
        unitPrice: z.number().min(0, "Preço deve ser maior ou igual a zero"),
      }),
    )
    .min(1, "Pelo menos um serviço deve ser selecionado"),
  tone: z.string().optional(),
  assignedToUserId: z.string().optional(),
  status: z.enum(["aberta", "em_execucao", "aguardando_retirada", "concluida", "cancelada"]),
  scheduledAt: z.string().optional(),
  discounts: z.number().min(0, "Desconto deve ser maior ou igual a zero").default(0),
  paymentMethod: z.enum(["dinheiro", "pix", "credito", "debito", "outro"]),
  notes: z.string().optional(),
})

type OrderFormData = z.infer<typeof orderFormSchema>

interface OrderFormProps {
  order?: Order
  onSubmit: (data: OrderFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function OrderForm({ order, onSubmit, onCancel, loading = false }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [installers, setInstallers] = useState<User[]>([])
  const [selectedCustomerVehicles, setSelectedCustomerVehicles] = useState<Vehicle[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: order?.customerId || "",
      vehicleId: order?.vehicleId || "",
      items: order?.items || [{ serviceId: "", qty: 1, unitPrice: 0 }],
      tone: order?.tone || "",
      assignedToUserId: order?.assignedToUserId || "",
      status: order?.status || "aberta",
      scheduledAt: order?.scheduledAt ? new Date(order.scheduledAt.toDate()).toISOString().slice(0, 16) : "",
      discounts: order?.discounts || 0,
      paymentMethod: order?.payment?.method || "dinheiro",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")
  const watchedDiscounts = watch("discounts")
  const watchedCustomerId = watch("customerId")

  // Calculate total
  const subtotal = watchedItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const total = Math.max(0, subtotal - (watchedDiscounts || 0))

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (watchedCustomerId) {
      const customerVehicles = vehicles.filter((v) => v.customerId === watchedCustomerId)
      setSelectedCustomerVehicles(customerVehicles)

      // Reset vehicle selection if current vehicle doesn't belong to selected customer
      const currentVehicleId = watch("vehicleId")
      if (currentVehicleId && !customerVehicles.find((v) => v.id === currentVehicleId)) {
        setValue("vehicleId", "")
      }
    }
  }, [watchedCustomerId, vehicles, setValue, watch])

  const loadData = async () => {
    try {
      setDataLoading(true)
      const [customersData, vehiclesData, servicesData, installersData] = await Promise.all([
        customerOperations.getAll(),
        vehicleOperations.getAll(),
        serviceOperations.getAll(),
        userOperations.getInstallers(),
      ])
      setCustomers(customersData)
      setVehicles(vehiclesData)
      setServices(servicesData)
      setInstallers(installersData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (service) {
      setValue(`items.${index}.serviceId`, serviceId)
      setValue(`items.${index}.unitPrice`, service.basePrice)
    }
  }

  const handleFormSubmit = async (data: OrderFormData) => {
    try {
      const formattedData = {
        ...data,
        total,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        payment: {
          method: data.paymentMethod,
          received: false,
        },
      }
      await onSubmit(formattedData as any)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  if (dataLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{order ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}</CardTitle>
        <CardDescription>
          {order ? "Atualize as informações da ordem de serviço" : "Preencha os dados da nova ordem de serviço"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Customer and Vehicle Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Cliente *</Label>
              <Select value={watch("customerId")} onValueChange={(value) => setValue("customerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.customerId && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.customerId.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Veículo *</Label>
              <Select value={watch("vehicleId")} onValueChange={(value) => setValue("vehicleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCustomerVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.vehicleId.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Serviços *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ serviceId: "", qty: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Select
                    value={watch(`items.${index}.serviceId`)}
                    onValueChange={(value) => handleServiceChange(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input type="number" min="1" {...register(`items.${index}.qty`, { valueAsNumber: true })} />
                </div>

                <div className="space-y-2">
                  <Label>Preço Unitário</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ações</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.items && (
              <Alert variant="destructive">
                <AlertDescription>{errors.items.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tonalidade</Label>
              <Input id="tone" {...register("tone")} placeholder="Ex: 20%, 35%, 50%" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedToUserId">Instalador</Label>
              <Select value={watch("assignedToUserId")} onValueChange={(value) => setValue("assignedToUserId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um instalador" />
                </SelectTrigger>
                <SelectContent>
                  {installers.map((installer) => (
                    <SelectItem key={installer.uid} value={installer.uid}>
                      {installer.name || installer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={watch("status")} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aberta">Aberta</SelectItem>
                  <SelectItem value="em_execucao">Em Execução</SelectItem>
                  <SelectItem value="aguardando_retirada">Aguardando Retirada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Agendamento</Label>
              <Input id="scheduledAt" type="datetime-local" {...register("scheduledAt")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
              <Select value={watch("paymentMethod")} onValueChange={(value) => setValue("paymentMethod", value as any)}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="discounts">Desconto:</Label>
                  <Input
                    id="discounts"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-32"
                    {...register("discounts", { valueAsNumber: true })}
                  />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {order ? "Atualizar" : "Criar"} OS
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
