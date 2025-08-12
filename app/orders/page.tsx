"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { OrderForm } from "@/components/order-form"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { orderOperations, customerOperations, vehicleOperations, userOperations } from "@/lib/firebase-operations"
import { useAuth } from "@/lib/auth-context"
import type { Order, Customer, Vehicle } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, customersData, vehiclesData, usersData] = await Promise.all([
        user?.role === "instalador" ? orderOperations.getByAssignedUser(user.uid) : orderOperations.getAll(),
        customerOperations.getAll(),
        vehicleOperations.getAll(),
        userOperations.getAll(),
      ])
      setOrders(ordersData)
      setCustomers(customersData)
      setVehicles(vehiclesData)
      setUsersList(usersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOrderSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedOrder) {
        await orderOperations.update(selectedOrder.id, data, user?.uid || "system", "Ordem de serviço atualizada")
        toast({
          title: "Sucesso",
          description: "Ordem de serviço atualizada com sucesso",
        })
      } else {
        await orderOperations.create(data)
        toast({
          title: "Sucesso",
          description: "Ordem de serviço criada com sucesso",
        })
      }
      await loadData()
      setShowOrderForm(false)
      setSelectedOrder(null)
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: "Erro",
        description: "Erro ao salvar ordem de serviço",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!orderToDelete) return

    try {
      await orderOperations.delete(orderToDelete.id)
      toast({
        title: "Sucesso",
        description: "Ordem de serviço excluída com sucesso",
      })
      await loadData()
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Erro",
        description: "Erro ao excluir ordem de serviço",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setOrderToDelete(null)
    }
  }

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || "Cliente não encontrado"
  }

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.plate} - ${vehicle.model}` : "Veículo não encontrado"
  }

  const getUserName = (userId: string) => {
    const foundUser = usersList.find((u) => u.uid === userId)
    return foundUser?.name || foundUser?.email || "Não atribuído"
  }

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "open":
        return orders.filter((o) => o.status === "aberta")
      case "in-progress":
        return orders.filter((o) => o.status === "em_execucao")
      case "completed":
        return orders.filter((o) => o.status === "concluida")
      default:
        return orders
    }
  }

  const orderColumns = [
    {
      key: "id",
      title: "OS",
      render: (value: string) => `#${value.slice(-6)}`,
    },
    {
      key: "customer",
      title: "Cliente",
      render: (_: any, order: Order) => getCustomerName(order.customerId),
    },
    {
      key: "vehicle",
      title: "Veículo",
      render: (_: any, order: Order) => getVehicleInfo(order.vehicleId),
    },
    {
      key: "status",
      title: "Status",
      render: (value: string) => <OrderStatusBadge status={value as any} />,
    },
    {
      key: "total",
      title: "Total",
      render: (value: number) => `R$ ${value.toFixed(2)}`,
    },
    {
      key: "assignedTo",
      title: "Instalador",
      render: (_: any, order: Order) =>
        order.assignedToUserId ? getUserName(order.assignedToUserId) : "Não atribuído",
    },
    {
      key: "createdAt",
      title: "Criado em",
      render: (value: any) => {
        if (value?.toDate) {
          return value.toDate().toLocaleDateString("pt-BR")
        }
        return "-"
      },
    },
  ]

  const canEdit = user?.role === "admin" || user?.role === "atendente"
  const canDelete = user?.role === "admin"

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerencie todas as ordens de serviço</p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowOrderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova OS
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
              <Badge variant="secondary">{orders.length}</Badge>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abertas</CardTitle>
              <Badge variant="secondary">{orders.filter((o) => o.status === "aberta").length}</Badge>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Execução</CardTitle>
              <Badge variant="default">{orders.filter((o) => o.status === "em_execucao").length}</Badge>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Badge variant="secondary">{orders.filter((o) => o.status === "concluida").length}</Badge>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="open">Abertas</TabsTrigger>
            <TabsTrigger value="in-progress">Em Execução</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <DataTable
              data={getFilteredOrders()}
              columns={orderColumns}
              title="Lista de Ordens de Serviço"
              description="Todas as ordens de serviço do sistema"
              searchPlaceholder="Buscar por cliente, placa ou número da OS..."
              onEdit={
                canEdit
                  ? (order) => {
                      setSelectedOrder(order as Order)
                      setShowOrderForm(true)
                    }
                  : undefined
              }
              onDelete={
                canDelete
                  ? (order) => {
                      setOrderToDelete(order as Order)
                      setShowDeleteDialog(true)
                    }
                  : undefined
              }
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        {/* Order Form Dialog */}
        <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <OrderForm
              order={selectedOrder || undefined}
              onSubmit={handleOrderSubmit}
              onCancel={() => {
                setShowOrderForm(false)
                setSelectedOrder(null)
              }}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ordem de serviço? Todas as fotos associadas também serão excluídas.
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
